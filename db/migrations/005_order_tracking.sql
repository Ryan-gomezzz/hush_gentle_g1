-- ============================================
-- Hush Gentle Ecommerce - Order Tracking
-- Adds tracking fields and order number to orders table
-- ============================================

-- 1. ADD TRACKING FIELDS TO ORDERS TABLE
ALTER TABLE public.orders 
  ADD COLUMN IF NOT EXISTS pincode TEXT,
  ADD COLUMN IF NOT EXISTS estimated_delivery_date TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS tracking_number TEXT,
  ADD COLUMN IF NOT EXISTS order_number TEXT,
  ADD COLUMN IF NOT EXISTS coupon_id UUID REFERENCES public.coupons(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS discount_amount DECIMAL(10, 2) DEFAULT 0;

-- 2. EXTRACT PINCODE FROM EXISTING ORDERS
-- Update existing orders to extract pincode from shipping_details JSONB
UPDATE public.orders
SET pincode = (shipping_details->>'zip')::TEXT
WHERE pincode IS NULL AND shipping_details IS NOT NULL AND shipping_details ? 'zip';

-- 3. ADD INDEXES
CREATE INDEX IF NOT EXISTS idx_orders_pincode ON public.orders(pincode);
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON public.orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_tracking_number ON public.orders(tracking_number);
CREATE INDEX IF NOT EXISTS idx_orders_estimated_delivery_date ON public.orders(estimated_delivery_date);
CREATE INDEX IF NOT EXISTS idx_orders_coupon_id ON public.orders(coupon_id);

-- 4. CREATE FUNCTION TO GENERATE ORDER NUMBER
CREATE OR REPLACE FUNCTION public.generate_order_number()
RETURNS TEXT AS $$
DECLARE
  date_str TEXT;
  random_str TEXT;
BEGIN
  date_str := TO_CHAR(NOW(), 'YYYYMMDD');
  random_str := LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
  RETURN 'HG-' || date_str || '-' || random_str;
END;
$$ LANGUAGE plpgsql;

-- 5. UPDATE EXISTING ORDERS WITH ORDER NUMBERS
UPDATE public.orders
SET order_number = public.generate_order_number()
WHERE order_number IS NULL;

-- 6. CREATE TRIGGER TO AUTO-GENERATE ORDER NUMBER ON INSERT
CREATE OR REPLACE FUNCTION public.set_order_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.order_number IS NULL THEN
    NEW.order_number := public.generate_order_number();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_set_order_number ON public.orders;
CREATE TRIGGER trigger_set_order_number
  BEFORE INSERT ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.set_order_number();

