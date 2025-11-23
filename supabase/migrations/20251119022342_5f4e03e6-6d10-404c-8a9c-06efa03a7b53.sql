-- Create facility history table
CREATE TABLE public.facility_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enrollee_id UUID NOT NULL REFERENCES public.enrollees(id) ON DELETE CASCADE,
  old_facility TEXT NOT NULL,
  new_facility TEXT NOT NULL,
  changed_by UUID REFERENCES public.profiles(id),
  changed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.facility_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Staff can view facility history"
ON public.facility_history
FOR SELECT
USING (
  has_role(auth.uid(), 'staff'::app_role) OR 
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'viewer'::app_role)
);

CREATE POLICY "System can insert facility history"
ON public.facility_history
FOR INSERT
WITH CHECK (true);

-- Create function to log facility changes
CREATE OR REPLACE FUNCTION public.log_facility_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only log if facility actually changed
  IF OLD.facility IS DISTINCT FROM NEW.facility THEN
    INSERT INTO public.facility_history (
      enrollee_id,
      old_facility,
      new_facility,
      changed_by
    ) VALUES (
      NEW.id,
      OLD.facility,
      NEW.facility,
      auth.uid()
    );
  END IF;
  RETURN NEW;
END;
$$;

-- Create trigger on enrollees table
CREATE TRIGGER log_facility_change_trigger
AFTER UPDATE ON public.enrollees
FOR EACH ROW
EXECUTE FUNCTION public.log_facility_change();

-- Create index for better query performance
CREATE INDEX idx_facility_history_enrollee_id ON public.facility_history(enrollee_id);
CREATE INDEX idx_facility_history_changed_at ON public.facility_history(changed_at DESC);