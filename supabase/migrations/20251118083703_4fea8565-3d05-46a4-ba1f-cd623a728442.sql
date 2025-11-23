-- Add facility column to enrollees table
ALTER TABLE public.enrollees
ADD COLUMN facility TEXT;

-- Update the column to be NOT NULL after adding it
-- (we do this in two steps to avoid issues with existing data)
UPDATE public.enrollees
SET facility = 'Not specified'
WHERE facility IS NULL;

ALTER TABLE public.enrollees
ALTER COLUMN facility SET NOT NULL;