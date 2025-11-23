-- Fix search_path security warnings on functions

CREATE OR REPLACE FUNCTION get_lga_abbreviation(lga_name TEXT)
RETURNS TEXT
LANGUAGE plpgsql
IMMUTABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN CASE lga_name
    WHEN 'Akoko Edo' THEN 'AK'
    WHEN 'Egor' THEN 'EG'
    WHEN 'Esan Central' THEN 'EC'
    WHEN 'Esan North-East' THEN 'EN'
    WHEN 'Esan South-East' THEN 'ES'
    WHEN 'Esan West' THEN 'ESW'
    WHEN 'Etsako Central' THEN 'ET'
    WHEN 'Etsako East' THEN 'EE'
    WHEN 'Etsako West' THEN 'EW'
    WHEN 'Igueben' THEN 'IG'
    WHEN 'Ikpoba Okha' THEN 'IK'
    WHEN 'Orhionmwon' THEN 'OW'
    WHEN 'Oredo' THEN 'OR'
    WHEN 'Ovia North-East' THEN 'ONE'
    WHEN 'Ovia South-West' THEN 'OSW'
    WHEN 'Owan East' THEN 'OE'
    WHEN 'Owan West' THEN 'OWW'
    WHEN 'Uhunmwonde' THEN 'UH'
    ELSE 'XXX'
  END;
END;
$$;

CREATE OR REPLACE FUNCTION get_plan_abbreviation(plan health_plan_type)
RETURNS TEXT
LANGUAGE plpgsql
IMMUTABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN CASE plan
    WHEN 'formal' THEN 'FOP'
    WHEN 'silver' THEN 'ISP'
    WHEN 'bronze' THEN 'IBP'
    WHEN 'enhanced' THEN 'ENP'
    WHEN 'equity' THEN 'EQP'
    ELSE 'XXX'
  END;
END;
$$;

CREATE OR REPLACE FUNCTION generate_enrollee_cin(plan health_plan_type, lga TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  plan_abbr TEXT;
  lga_abbr TEXT;
  sequence_num TEXT;
  new_cin TEXT;
  cin_exists BOOLEAN;
  max_attempts INTEGER := 1000;
  attempt INTEGER := 0;
BEGIN
  plan_abbr := get_plan_abbreviation(plan);
  lga_abbr := get_lga_abbreviation(lga);
  
  LOOP
    sequence_num := LPAD(FLOOR(RANDOM() * 1000000)::TEXT, 6, '0');
    new_cin := plan_abbr || '/' || lga_abbr || '/' || sequence_num;
    
    SELECT EXISTS(
      SELECT 1 FROM enrollees WHERE cin = new_cin
    ) INTO cin_exists;
    
    EXIT WHEN NOT cin_exists;
    
    attempt := attempt + 1;
    IF attempt > max_attempts THEN
      RAISE EXCEPTION 'Unable to generate unique CIN after % attempts', max_attempts;
    END IF;
  END LOOP;
  
  RETURN new_cin;
END;
$$;

CREATE OR REPLACE FUNCTION generate_dependant_cin(enrollee_cin TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  sequence_num TEXT;
  new_cin TEXT;
  cin_exists BOOLEAN;
  max_attempts INTEGER := 999;
  attempt INTEGER := 0;
BEGIN
  LOOP
    sequence_num := LPAD(FLOOR(RANDOM() * 1000)::TEXT, 3, '0');
    new_cin := enrollee_cin || '/' || sequence_num;
    
    SELECT EXISTS(
      SELECT 1 FROM dependants WHERE cin = new_cin
    ) INTO cin_exists;
    
    EXIT WHEN NOT cin_exists;
    
    attempt := attempt + 1;
    IF attempt > max_attempts THEN
      RAISE EXCEPTION 'Maximum dependants reached for enrollee CIN: %', enrollee_cin;
    END IF;
  END LOOP;
  
  RETURN new_cin;
END;
$$;

CREATE OR REPLACE FUNCTION set_plan_expiry_date()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' OR (TG_OP = 'UPDATE' AND OLD.plan_start_date IS DISTINCT FROM NEW.plan_start_date) THEN
    NEW.plan_expiry_date := NEW.plan_start_date + INTERVAL '1 year';
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION update_group_member_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.enrollment_type = 'group_member' AND NEW.primary_enrollee_id IS NOT NULL THEN
    UPDATE enrollees 
    SET group_member_count = group_member_count + 1
    WHERE id = NEW.primary_enrollee_id;
  ELSIF TG_OP = 'DELETE' AND OLD.enrollment_type = 'group_member' AND OLD.primary_enrollee_id IS NOT NULL THEN
    UPDATE enrollees 
    SET group_member_count = GREATEST(0, group_member_count - 1)
    WHERE id = OLD.primary_enrollee_id;
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.enrollment_type = 'group_member' AND NEW.enrollment_type != 'group_member' AND OLD.primary_enrollee_id IS NOT NULL THEN
      UPDATE enrollees 
      SET group_member_count = GREATEST(0, group_member_count - 1)
      WHERE id = OLD.primary_enrollee_id;
    ELSIF OLD.enrollment_type != 'group_member' AND NEW.enrollment_type = 'group_member' AND NEW.primary_enrollee_id IS NOT NULL THEN
      UPDATE enrollees 
      SET group_member_count = group_member_count + 1
      WHERE id = NEW.primary_enrollee_id;
    ELSIF OLD.primary_enrollee_id IS DISTINCT FROM NEW.primary_enrollee_id THEN
      IF OLD.primary_enrollee_id IS NOT NULL THEN
        UPDATE enrollees 
        SET group_member_count = GREATEST(0, group_member_count - 1)
        WHERE id = OLD.primary_enrollee_id;
      END IF;
      IF NEW.primary_enrollee_id IS NOT NULL THEN
        UPDATE enrollees 
        SET group_member_count = group_member_count + 1
        WHERE id = NEW.primary_enrollee_id;
      END IF;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION log_payment_verification()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF OLD.payment_status IS DISTINCT FROM NEW.payment_status AND NEW.payment_status = 'confirmed' THEN
    NEW.payment_verified_at := NOW();
    NEW.payment_verified_by := auth.uid();
    IF NEW.payment_date IS NULL THEN
      NEW.payment_date := NOW();
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION is_plan_expired(enrollee_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  expiry_date DATE;
BEGIN
  SELECT plan_expiry_date INTO expiry_date
  FROM enrollees
  WHERE id = enrollee_id;
  
  RETURN expiry_date < CURRENT_DATE;
END;
$$;

CREATE OR REPLACE FUNCTION get_expiring_enrollees(months_ahead INTEGER DEFAULT 1)
RETURNS TABLE (
  id UUID,
  cin TEXT,
  first_name TEXT,
  last_name TEXT,
  phone_number TEXT,
  plan_expiry_date DATE,
  days_until_expiry INTEGER
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    e.id,
    e.cin,
    e.first_name,
    e.last_name,
    e.phone_number,
    e.plan_expiry_date,
    (e.plan_expiry_date - CURRENT_DATE)::INTEGER as days_until_expiry
  FROM enrollees e
  WHERE e.plan_expiry_date <= (CURRENT_DATE + (months_ahead || ' months')::INTERVAL)
    AND e.plan_expiry_date >= CURRENT_DATE
  ORDER BY e.plan_expiry_date ASC;
END;
$$;

CREATE OR REPLACE FUNCTION get_monthly_enrollments(year_param INTEGER DEFAULT EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER)
RETURNS TABLE (
  month_number INTEGER,
  month_name TEXT,
  enrollment_count BIGINT,
  single_count BIGINT,
  primary_count BIGINT,
  group_member_count BIGINT
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  WITH months AS (
    SELECT generate_series(1, 12) as month_num
  )
  SELECT 
    m.month_num,
    TO_CHAR(TO_DATE(m.month_num::TEXT, 'MM'), 'Month') as month_name,
    COALESCE(COUNT(e.id), 0) as enrollment_count,
    COALESCE(SUM(CASE WHEN e.enrollment_type = 'single' THEN 1 ELSE 0 END), 0) as single_count,
    COALESCE(SUM(CASE WHEN e.enrollment_type = 'primary' THEN 1 ELSE 0 END), 0) as primary_count,
    COALESCE(SUM(CASE WHEN e.enrollment_type = 'group_member' THEN 1 ELSE 0 END), 0) as group_member_count
  FROM months m
  LEFT JOIN enrollees e ON 
    EXTRACT(MONTH FROM e.registration_date) = m.month_num
    AND EXTRACT(YEAR FROM e.registration_date) = year_param
  GROUP BY m.month_num
  ORDER BY m.month_num;
END;
$$;