-- Create health plan enum
CREATE TYPE public.health_plan_type AS ENUM ('bronze', 'silver', 'gold');

-- Create payment status enum
CREATE TYPE public.payment_status_type AS ENUM ('pending', 'confirmed', 'failed');

-- Add health plan and payment columns to enrollees table
ALTER TABLE public.enrollees
ADD COLUMN health_plan public.health_plan_type NOT NULL DEFAULT 'bronze',
ADD COLUMN payment_status public.payment_status_type NOT NULL DEFAULT 'pending',
ADD COLUMN payment_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN payment_reference TEXT;

-- Add comment to explain the fields
COMMENT ON COLUMN public.enrollees.health_plan IS 'Health plan type selected by enrollee';
COMMENT ON COLUMN public.enrollees.payment_status IS 'Payment confirmation status';
COMMENT ON COLUMN public.enrollees.payment_date IS 'Date when payment was confirmed';
COMMENT ON COLUMN public.enrollees.payment_reference IS 'Payment reference or transaction ID';