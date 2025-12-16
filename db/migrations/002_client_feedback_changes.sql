-- ============================================
-- Hush Gentle Ecommerce - Client Feedback Changes
-- Adds SKUs, addresses, offers, view history, geo-tagging, and chatbot retention
-- ============================================

-- 1. PRODUCT SKUs TABLE
CREATE TABLE IF NOT EXISTS public.product_skus (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  size TEXT NOT NULL, -- e.g., "Small", "Medium", "Large" or "50ml", "100ml", "200ml"
  price DECIMAL(10, 2), -- Optional override, if NULL uses product base price
  stock INTEGER DEFAULT 0,
  sku_code TEXT UNIQUE, -- Stock keeping unit code
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(product_id, size)
);

-- 2. USER ADDRESSES TABLE
CREATE TABLE IF NOT EXISTS public.user_addresses (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('delivery', 'billing')),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT,
  zip_code TEXT NOT NULL,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. OFFERS TABLE
CREATE TABLE IF NOT EXISTS public.offers (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. USER PRODUCT VIEWS TABLE
CREATE TABLE IF NOT EXISTS public.user_product_views (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  viewed_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, product_id, viewed_at)
);

-- 5. UPDATE CART_ITEMS TO INCLUDE SKU_ID
ALTER TABLE public.cart_items 
  ADD COLUMN IF NOT EXISTS sku_id UUID REFERENCES public.product_skus(id) ON DELETE SET NULL;

-- 6. UPDATE ORDER_ITEMS TO INCLUDE SKU_ID
ALTER TABLE public.order_items 
  ADD COLUMN IF NOT EXISTS sku_id UUID REFERENCES public.product_skus(id) ON DELETE SET NULL;

-- 7. ADD CONVERTED FIELD TO CHATBOT_SESSIONS
ALTER TABLE public.chatbot_sessions 
  ADD COLUMN IF NOT EXISTS converted BOOLEAN DEFAULT FALSE;

-- 8. ADD LOCATION FIELD TO ANALYTICS_EVENTS (stored in metadata JSONB, but add index support)
-- Location will be stored in metadata.location as JSONB
-- No schema change needed, but we'll add a function to extract location for queries

-- 9. ADD INDEXES FOR PERFORMANCE

-- Product SKUs indexes
CREATE INDEX IF NOT EXISTS idx_product_skus_product_id ON public.product_skus(product_id);
CREATE INDEX IF NOT EXISTS idx_product_skus_sku_code ON public.product_skus(sku_code);

-- User addresses indexes
CREATE INDEX IF NOT EXISTS idx_user_addresses_user_id ON public.user_addresses(user_id);
CREATE INDEX IF NOT EXISTS idx_user_addresses_type ON public.user_addresses(type);
CREATE INDEX IF NOT EXISTS idx_user_addresses_user_type ON public.user_addresses(user_id, type);

-- Offers indexes
CREATE INDEX IF NOT EXISTS idx_offers_is_active ON public.offers(is_active);
CREATE INDEX IF NOT EXISTS idx_offers_display_order ON public.offers(display_order);

-- User product views indexes
CREATE INDEX IF NOT EXISTS idx_user_product_views_user_id ON public.user_product_views(user_id);
CREATE INDEX IF NOT EXISTS idx_user_product_views_product_id ON public.user_product_views(product_id);
CREATE INDEX IF NOT EXISTS idx_user_product_views_viewed_at ON public.user_product_views(viewed_at DESC);

-- Cart items sku_id index
CREATE INDEX IF NOT EXISTS idx_cart_items_sku_id ON public.cart_items(sku_id);

-- Order items sku_id index
CREATE INDEX IF NOT EXISTS idx_order_items_sku_id ON public.order_items(sku_id);

-- Chatbot sessions converted index
CREATE INDEX IF NOT EXISTS idx_chatbot_sessions_converted ON public.chatbot_sessions(converted);
CREATE INDEX IF NOT EXISTS idx_chatbot_sessions_created_at ON public.chatbot_sessions(created_at);

-- 10. ENABLE RLS ON NEW TABLES
ALTER TABLE public.product_skus ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_product_views ENABLE ROW LEVEL SECURITY;

-- 11. RLS POLICIES FOR NEW TABLES

-- PRODUCT SKUs POLICIES (Public read, admin write)
DROP POLICY IF EXISTS "Public can read product SKUs" ON public.product_skus;
CREATE POLICY "Public can read product SKUs" ON public.product_skus
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage product SKUs" ON public.product_skus;
CREATE POLICY "Admins can manage product SKUs" ON public.product_skus
  FOR ALL USING (public.is_admin(auth.uid()));

-- USER ADDRESSES POLICIES
DROP POLICY IF EXISTS "Users can manage own addresses" ON public.user_addresses;
CREATE POLICY "Users can manage own addresses" ON public.user_addresses
  FOR ALL USING (auth.uid() = user_id OR public.is_admin(auth.uid()));

-- OFFERS POLICIES (Public read active, admin write)
DROP POLICY IF EXISTS "Public can read active offers" ON public.offers;
CREATE POLICY "Public can read active offers" ON public.offers
  FOR SELECT USING (is_active = true OR public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins can manage offers" ON public.offers;
CREATE POLICY "Admins can manage offers" ON public.offers
  FOR ALL USING (public.is_admin(auth.uid()));

-- USER PRODUCT VIEWS POLICIES
DROP POLICY IF EXISTS "Users can manage own product views" ON public.user_product_views;
CREATE POLICY "Users can manage own product views" ON public.user_product_views
  FOR ALL USING (auth.uid() = user_id OR public.is_admin(auth.uid()));

-- 12. CREATE FUNCTION TO ENFORCE MAX 2 DELIVERY ADDRESSES
CREATE OR REPLACE FUNCTION public.check_max_delivery_addresses()
RETURNS TRIGGER AS $$
DECLARE
  delivery_count INTEGER;
BEGIN
  IF NEW.type = 'delivery' THEN
    SELECT COUNT(*) INTO delivery_count
    FROM public.user_addresses
    WHERE user_id = NEW.user_id
      AND type = 'delivery'
      AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::UUID);
    
    IF delivery_count >= 2 THEN
      RAISE EXCEPTION 'Maximum 2 delivery addresses allowed per user';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for max delivery addresses
DROP TRIGGER IF EXISTS enforce_max_delivery_addresses ON public.user_addresses;
CREATE TRIGGER enforce_max_delivery_addresses
  BEFORE INSERT OR UPDATE ON public.user_addresses
  FOR EACH ROW
  EXECUTE FUNCTION public.check_max_delivery_addresses();

-- 13. CREATE FUNCTION TO ENFORCE MAX 1 BILLING ADDRESS
CREATE OR REPLACE FUNCTION public.check_max_billing_address()
RETURNS TRIGGER AS $$
DECLARE
  billing_count INTEGER;
BEGIN
  IF NEW.type = 'billing' THEN
    SELECT COUNT(*) INTO billing_count
    FROM public.user_addresses
    WHERE user_id = NEW.user_id
      AND type = 'billing'
      AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::UUID);
    
    IF billing_count >= 1 THEN
      RAISE EXCEPTION 'Maximum 1 billing address allowed per user';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for max billing address
DROP TRIGGER IF EXISTS enforce_max_billing_address ON public.user_addresses;
CREATE TRIGGER enforce_max_billing_address
  BEFORE INSERT OR UPDATE ON public.user_addresses
  FOR EACH ROW
  EXECUTE FUNCTION public.check_max_billing_address();

-- 14. CREATE FUNCTION TO AUTO-DELETE NON-CONVERTED CHATBOT SESSIONS AFTER 48 HOURS
-- This function can be called by a scheduled job (pg_cron) or manually
CREATE OR REPLACE FUNCTION public.cleanup_old_chatbot_sessions()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM public.chatbot_sessions
  WHERE converted = FALSE
    AND created_at < NOW() - INTERVAL '48 hours';
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 15. ADD UPDATED_AT TRIGGERS FOR NEW TABLES
DROP TRIGGER IF EXISTS update_product_skus_updated_at ON public.product_skus;
CREATE TRIGGER update_product_skus_updated_at
  BEFORE UPDATE ON public.product_skus
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_addresses_updated_at ON public.user_addresses;
CREATE TRIGGER update_user_addresses_updated_at
  BEFORE UPDATE ON public.user_addresses
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_offers_updated_at ON public.offers;
CREATE TRIGGER update_offers_updated_at
  BEFORE UPDATE ON public.offers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- 16. CREATE FUNCTION TO MARK CHATBOT SESSION AS CONVERTED
-- This will be called when a user completes a purchase
CREATE OR REPLACE FUNCTION public.mark_chatbot_session_converted(session_uuid UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.chatbot_sessions
  SET converted = TRUE
  WHERE id = session_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

