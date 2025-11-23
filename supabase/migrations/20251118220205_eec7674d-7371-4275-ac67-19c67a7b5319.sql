-- Update enrollees table to have separate name fields
ALTER TABLE public.enrollees 
  ADD COLUMN first_name TEXT,
  ADD COLUMN middle_name TEXT,
  ADD COLUMN last_name TEXT;

-- Migrate existing data (split full_name into first and last)
UPDATE public.enrollees 
SET 
  first_name = SPLIT_PART(full_name, ' ', 1),
  last_name = CASE 
    WHEN ARRAY_LENGTH(STRING_TO_ARRAY(full_name, ' '), 1) > 1 
    THEN SPLIT_PART(full_name, ' ', ARRAY_LENGTH(STRING_TO_ARRAY(full_name, ' '), 1))
    ELSE ''
  END
WHERE full_name IS NOT NULL;

-- Make first_name and last_name required
ALTER TABLE public.enrollees 
  ALTER COLUMN first_name SET NOT NULL,
  ALTER COLUMN last_name SET NOT NULL;

-- Drop the old full_name column
ALTER TABLE public.enrollees DROP COLUMN full_name;

-- Update dependants table similarly
ALTER TABLE public.dependants 
  ADD COLUMN first_name TEXT,
  ADD COLUMN middle_name TEXT,
  ADD COLUMN last_name TEXT;

-- Migrate existing dependants data
UPDATE public.dependants 
SET 
  first_name = SPLIT_PART(full_name, ' ', 1),
  last_name = CASE 
    WHEN ARRAY_LENGTH(STRING_TO_ARRAY(full_name, ' '), 1) > 1 
    THEN SPLIT_PART(full_name, ' ', ARRAY_LENGTH(STRING_TO_ARRAY(full_name, ' '), 1))
    ELSE ''
  END
WHERE full_name IS NOT NULL;

-- Make first_name and last_name required for dependants
ALTER TABLE public.dependants 
  ALTER COLUMN first_name SET NOT NULL,
  ALTER COLUMN last_name SET NOT NULL;

-- Drop the old full_name column from dependants
ALTER TABLE public.dependants DROP COLUMN full_name;