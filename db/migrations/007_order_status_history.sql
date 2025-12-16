-- ============================================
-- Hush Gentle Ecommerce - Order Status History
-- Tracks order status changes for audit trail
-- ============================================

-- 1. ORDER STATUS HISTORY TABLE
CREATE TABLE IF NOT EXISTS public.order_status_history (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'confirmed', 'paid', 'shipped', 'delivered', 'cancelled')),
  changed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- NULL if changed by system
  notes TEXT, -- Optional notes/comments
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. ADD INDEXES
CREATE INDEX IF NOT EXISTS idx_order_status_history_order_id ON public.order_status_history(order_id);
CREATE INDEX IF NOT EXISTS idx_order_status_history_status ON public.order_status_history(status);
CREATE INDEX IF NOT EXISTS idx_order_status_history_created_at ON public.order_status_history(created_at DESC);

-- 3. ENABLE RLS
ALTER TABLE public.order_status_history ENABLE ROW LEVEL SECURITY;

-- 4. RLS POLICIES
-- Users can view history for their own orders, admins can view all
DROP POLICY IF EXISTS "Users can view own order history" ON public.order_status_history;
CREATE POLICY "Users can view own order history" ON public.order_status_history
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_status_history.order_id
        AND (orders.user_id = auth.uid() OR public.is_admin(auth.uid()))
    )
  );

DROP POLICY IF EXISTS "System can insert order status history" ON public.order_status_history;
CREATE POLICY "System can insert order status history" ON public.order_status_history
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_status_history.order_id
        AND (orders.user_id = auth.uid() OR public.is_admin(auth.uid()))
    )
  );

-- 5. CREATE FUNCTION TO AUTO-LOG STATUS CHANGES
CREATE OR REPLACE FUNCTION public.log_order_status_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Only log if status actually changed
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO public.order_status_history (order_id, status, changed_by, notes)
    VALUES (NEW.id, NEW.status, auth.uid(), NULL);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. CREATE TRIGGER
DROP TRIGGER IF EXISTS trigger_log_order_status_change ON public.orders;
CREATE TRIGGER trigger_log_order_status_change
  AFTER UPDATE OF status ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.log_order_status_change();

-- 7. BACKFILL STATUS HISTORY FOR EXISTING ORDERS
-- Insert initial status for all existing orders
INSERT INTO public.order_status_history (order_id, status, changed_by, notes, created_at)
SELECT id, status, NULL, 'Initial status', created_at
FROM public.orders
WHERE NOT EXISTS (
  SELECT 1 FROM public.order_status_history
  WHERE order_status_history.order_id = orders.id
);

