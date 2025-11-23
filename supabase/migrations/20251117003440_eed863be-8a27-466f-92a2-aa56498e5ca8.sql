-- Fix function search_path mutable warning by setting search_path on functions that don't have it

-- Update generate_cin function to set search_path
CREATE OR REPLACE FUNCTION public.generate_cin()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  new_cin TEXT;
  cin_exists BOOLEAN;
BEGIN
  LOOP
    new_cin := 'HIC' || LPAD(FLOOR(RANDOM() * 1000000)::TEXT, 6, '0');
    SELECT EXISTS(SELECT 1 FROM public.enrollees WHERE cin = new_cin) INTO cin_exists;
    EXIT WHEN NOT cin_exists;
  END LOOP;
  RETURN new_cin;
END;
$function$;

-- Update update_updated_at_column function to set search_path
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$function$;