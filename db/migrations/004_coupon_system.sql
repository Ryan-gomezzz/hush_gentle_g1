-- ============================================
-- Hush Gentle Ecommerce - Coupon System
-- Adds coupon codes functionality with usage tracking
-- ============================================

-- 1. COUPONS TABLE
CREATE TABLE IF NOT EXISTS public.coupons (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage')),
  discount_value DECIMAL(10, 2) NOT NULL CHECK (discount_value > 0),
  max_uses_total INTEGER, -- NULL means unlimited
  max_uses_per_user INTEGER DEFAULT 1,
  used_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  valid_from TIMESTAMPTZ DEFAULT NOW(),
  valid_until TIMESTAMPTZ,
  min_order_amount DECIMAL(10, 2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. COUPON USAGES TABLE (Track individual uses)
CREATE TABLE IF NOT EXISTS public.coupon_usages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  coupon_id UUID REFERENCES public.coupons(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
  discount_amount DECIMAL(10, 2) NOT NULL,
  used_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. ADD INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_coupons_code ON public.coupons(code);
CREATE INDEX IF NOT EXISTS idx_coupons_is_active ON public.coupons(is_active);
CREATE INDEX IF NOT EXISTS idx_coupons_valid_from ON public.coupons(valid_from);
CREATE INDEX IF NOT EXISTS idx_coupons_valid_until ON public.coupons(valid_until);

CREATE INDEX IF NOT EXISTS idx_coupon_usages_coupon_id ON public.coupon_usages(coupon_id);
CREATE INDEX IF NOT EXISTS idx_coupon_usages_user_id ON public.coupon_usages(user_id);
CREATE INDEX IF NOT EXISTS idx_coupon_usages_order_id ON public.coupon_usages(order_id);

-- 4. ENABLE RLS
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupon_usages ENABLE ROW LEVEL SECURITY;

-- 5. RLS POLICIES

-- Coupons: Public can read active coupons, admins can manage all
DROP POLICY IF EXISTS "Public can read active coupons" ON public.coupons;
CREATE POLICY "Public can read active coupons" ON public.coupons
  FOR SELECT USING (is_active = true AND (valid_until IS NULL OR valid_until >= NOW()) AND valid_from <= NOW() OR public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins can manage coupons" ON public.coupons;
CREATE POLICY "Admins can manage coupons" ON public.coupons
  FOR ALL USING (public.is_admin(auth.uid()));

-- Coupon Usages: Users can view their own usages, admins can view all
DROP POLICY IF EXISTS "Users can view own coupon usages" ON public.coupon_usages;
CREATE POLICY "Users can view own coupon usages" ON public.coupon_usages
  FOR SELECT USING (auth.uid() = user_id OR public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "System can insert coupon usages" ON public.coupon_usages;
CREATE POLICY "System can insert coupon usages" ON public.coupon_usages
  FOR INSERT WITH CHECK (auth.uid() = user_id OR public.is_admin(auth.uid()));

-- 6. CREATE FUNCTION TO UPDATE COUPON USED COUNT
CREATE OR REPLACE FUNCTION public.update_coupon_used_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.coupons
  SET used_count = used_count + 1
  WHERE id = NEW.coupon_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger
DROP TRIGGER IF EXISTS trigger_update_coupon_used_count ON public.coupon_usages;
CREATE TRIGGER trigger_update_coupon_used_count
  AFTER INSERT ON public.coupon_usages
  FOR EACH ROW
  EXECUTE FUNCTION public.update_coupon_used_count();

-- 7. CREATE FUNCTION TO VALIDATE COUPON
CREATE OR REPLACE FUNCTION public.validate_coupon(
  coupon_code TEXT,
  user_uuid UUID,
  order_amount DECIMAL
)
RETURNS TABLE (
  is_valid BOOLEAN,
  coupon_id UUID,
  discount_amount DECIMAL,
  error_message TEXT
) AS $$
DECLARE
  coupon_record RECORD;
  user_usage_count INTEGER;
BEGIN
  -- Find the coupon
  SELECT * INTO coupon_record
  FROM public.coupons
  WHERE code = coupon_code
    AND is_active = true
    AND valid_from <= NOW()
    AND (valid_until IS NULL OR valid_until >= NOW());

  -- Coupon not found or inactive
  IF NOT FOUND THEN
    RETURN QUERY SELECT false, NULL::UUID, 0::DECIMAL, 'Coupon code is invalid or expired'::TEXT;
    RETURN;
  END IF;

  -- Check minimum order amount
  IF order_amount < coupon_record.min_order_amount THEN
    RETURN QUERY SELECT false, coupon_record.id, 0::DECIMAL, 
      format('Minimum order amount of ₹%s required', coupon_record.min_order_amount)::TEXT;
    RETURN;
  END IF;

  -- Check total usage limit
  IF coupon_record.max_uses_total IS NOT NULL AND coupon_record.used_count >= coupon_record.max_uses_total THEN
    RETURN QUERY SELECT false, coupon_record.id, 0::DECIMAL, 'Coupon has reached maximum usage limit'::TEXT;
    RETURN;
  END IF;

  -- Check per-user usage limit
  IF user_uuid IS NOT NULL THEN
    SELECT COUNT(*) INTO user_usage_count
    FROM public.coupon_usages
    WHERE coupon_id = coupon_record.id AND user_id = user_uuid;

    IF user_usage_count >= coupon_record.max_uses_per_user THEN
      RETURN QUERY SELECT false, coupon_record.id, 0::DECIMAL, 'You have already used this coupon'::TEXT;
      RETURN;
    END IF;
  END IF;

  -- Calculate discount amount
  DECLARE
    calculated_discount DECIMAL;
  BEGIN
    IF coupon_record.discount_type = 'percentage' THEN
      calculated_discount := (order_amount * coupon_record.discount_value) / 100;
    ELSE
      calculated_discount := coupon_record.discount_value;
    END IF;

    -- Ensure discount doesn't exceed order amount
    IF calculated_discount > order_amount THEN
      calculated_discount := order_amount;
    END IF;

    RETURN QUERY SELECT true, coupon_record.id, calculated_discount, NULL::TEXT;
  END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. ADD UPDATED_AT TRIGGER
DROP TRIGGER IF EXISTS update_coupons_updated_at ON public.coupons;
CREATE TRIGGER update_coupons_updated_at
  BEFORE UPDATE ON public.coupons
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

