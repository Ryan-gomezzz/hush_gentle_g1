-- ============================================
-- Hush Gentle Ecommerce - Delivery Time Mappings
-- Allows admin to configure delivery times by pincode patterns
-- ============================================

-- 1. DELIVERY TIME MAPPINGS TABLE
CREATE TABLE IF NOT EXISTS public.delivery_time_mappings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  pincode_pattern TEXT NOT NULL, -- Supports wildcards like '110*' for all Delhi pincodes starting with 110
  estimated_days INTEGER NOT NULL CHECK (estimated_days > 0),
  description TEXT, -- Optional description like "Metro cities"
  is_active BOOLEAN DEFAULT TRUE,
  priority INTEGER DEFAULT 0, -- Higher priority patterns are checked first
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. ADD INDEXES
CREATE INDEX IF NOT EXISTS idx_delivery_mappings_pattern ON public.delivery_time_mappings(pincode_pattern);
CREATE INDEX IF NOT EXISTS idx_delivery_mappings_is_active ON public.delivery_time_mappings(is_active);
CREATE INDEX IF NOT EXISTS idx_delivery_mappings_priority ON public.delivery_time_mappings(priority DESC);

-- 3. ENABLE RLS
ALTER TABLE public.delivery_time_mappings ENABLE ROW LEVEL SECURITY;

-- 4. RLS POLICIES
-- Public can read active mappings (needed for order creation), admins can manage all
DROP POLICY IF EXISTS "Public can read active delivery mappings" ON public.delivery_time_mappings;
CREATE POLICY "Public can read active delivery mappings" ON public.delivery_time_mappings
  FOR SELECT USING (is_active = true OR public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins can manage delivery mappings" ON public.delivery_time_mappings;
CREATE POLICY "Admins can manage delivery mappings" ON public.delivery_time_mappings
  FOR ALL USING (public.is_admin(auth.uid()));

-- 5. CREATE FUNCTION TO GET ESTIMATED DELIVERY DAYS
CREATE OR REPLACE FUNCTION public.get_estimated_delivery_days(pincode_input TEXT)
RETURNS INTEGER AS $$
DECLARE
  estimated_days_result INTEGER;
  pattern_record RECORD;
BEGIN
  -- Find matching pattern, ordered by priority (highest first)
  -- Patterns are matched using LIKE operator (supports wildcards)
  FOR pattern_record IN
    SELECT estimated_days, pincode_pattern
    FROM public.delivery_time_mappings
    WHERE is_active = true
      AND (pincode_input LIKE REPLACE(pincode_pattern, '*', '%') OR pincode_input = pincode_pattern)
    ORDER BY priority DESC, LENGTH(pincode_pattern) DESC
    LIMIT 1
  LOOP
    estimated_days_result := pattern_record.estimated_days;
    RETURN estimated_days_result;
  END LOOP;

  -- Default to 7 days if no pattern matches
  RETURN 7;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. ADD UPDATED_AT TRIGGER
DROP TRIGGER IF EXISTS update_delivery_mappings_updated_at ON public.delivery_time_mappings;
CREATE TRIGGER update_delivery_mappings_updated_at
  BEFORE UPDATE ON public.delivery_time_mappings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- 7. INSERT DEFAULT MAPPINGS (Examples)
-- These can be modified/deleted by admin later
INSERT INTO public.delivery_time_mappings (pincode_pattern, estimated_days, description, priority, is_active)
VALUES
  ('110*', 3, 'Delhi Metro', 10, true),
  ('400*', 3, 'Mumbai Metro', 10, true),
  ('560*', 3, 'Bangalore Metro', 10, true),
  ('600*', 3, 'Chennai Metro', 10, true),
  ('700*', 3, 'Kolkata Metro', 10, true),
  ('*', 7, 'Default - All other pincodes', 0, true)
ON CONFLICT DO NOTHING;

