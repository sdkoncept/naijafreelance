-- =====================================================
-- PHASE 1: Schema Updates
-- =====================================================

-- 1.1 Update health_plan_type enum (rename gold to formal, add enhanced and equity)
-- First, drop the default constraint
ALTER TABLE enrollees ALTER COLUMN health_plan DROP DEFAULT;

-- Rename and recreate enum
ALTER TYPE health_plan_type RENAME TO health_plan_type_old;

CREATE TYPE health_plan_type AS ENUM ('bronze', 'silver', 'formal', 'enhanced', 'equity');

-- Convert column with explicit USING clause
ALTER TABLE enrollees 
  ALTER COLUMN health_plan TYPE health_plan_type 
  USING CASE 
    WHEN health_plan::text = 'gold' THEN 'formal'::health_plan_type
    ELSE health_plan::text::health_plan_type
  END;

-- Re-add default
ALTER TABLE enrollees ALTER COLUMN health_plan SET DEFAULT 'bronze'::health_plan_type;

-- Drop old type
DROP TYPE health_plan_type_old;

-- 1.2 Add plan date columns
ALTER TABLE enrollees
  ADD COLUMN IF NOT EXISTS plan_start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  ADD COLUMN IF NOT EXISTS plan_expiry_date DATE NOT NULL DEFAULT (CURRENT_DATE + INTERVAL '1 year');

-- Set existing enrollees' dates based on registration_date
UPDATE enrollees
SET 
  plan_start_date = registration_date,
  plan_expiry_date = registration_date + INTERVAL '1 year'
WHERE plan_start_date IS NULL OR plan_expiry_date IS NULL;

-- 1.3 Add group enrollment columns
CREATE TYPE enrollment_type AS ENUM ('single', 'primary', 'group_member');

ALTER TABLE enrollees
  ADD COLUMN IF NOT EXISTS enrollment_type enrollment_type NOT NULL DEFAULT 'single',
  ADD COLUMN IF NOT EXISTS primary_enrollee_id UUID REFERENCES enrollees(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS group_name TEXT,
  ADD COLUMN IF NOT EXISTS group_member_count INTEGER DEFAULT 0;

-- 1.4 Add payment verification columns
ALTER TABLE enrollees
  ADD COLUMN IF NOT EXISTS payment_verified_by UUID REFERENCES profiles(id),
  ADD COLUMN IF NOT EXISTS payment_verified_at TIMESTAMP WITH TIME ZONE;

-- 1.5 Add CIN column to dependants
ALTER TABLE dependants
  ADD COLUMN IF NOT EXISTS cin TEXT UNIQUE;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_enrollees_primary_id ON enrollees(primary_enrollee_id);
CREATE INDEX IF NOT EXISTS idx_enrollees_enrollment_type ON enrollees(enrollment_type);
CREATE INDEX IF NOT EXISTS idx_enrollees_plan_expiry ON enrollees(plan_expiry_date);

-- =====================================================
-- PHASE 2: CIN Generation Functions
-- =====================================================

-- 2.1 LGA Abbreviation Mapping (CORRECTED)
CREATE OR REPLACE FUNCTION get_lga_abbreviation(lga_name TEXT)
RETURNS TEXT AS $$
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
$$ LANGUAGE plpgsql IMMUTABLE;

-- 2.2 Plan Abbreviation Mapping
CREATE OR REPLACE FUNCTION get_plan_abbreviation(plan health_plan_type)
RETURNS TEXT AS $$
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
$$ LANGUAGE plpgsql IMMUTABLE;

-- 2.3 Generate Enrollee CIN (Format: PLAN/LGA/XXXXXX)
CREATE OR REPLACE FUNCTION generate_enrollee_cin(plan health_plan_type, lga TEXT)
RETURNS TEXT AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2.4 Generate Dependant CIN (Format: PLAN/LGA/XXXXXX/YYY)
CREATE OR REPLACE FUNCTION generate_dependant_cin(enrollee_cin TEXT)
RETURNS TEXT AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2.5 Regenerate ALL Existing CINs
DO $$
DECLARE
  enrollee_record RECORD;
  dependant_record RECORD;
  new_enrollee_cin TEXT;
  new_dependant_cin TEXT;
BEGIN
  -- Regenerate enrollee CINs
  FOR enrollee_record IN SELECT id, cin, health_plan, lga FROM enrollees
  LOOP
    new_enrollee_cin := generate_enrollee_cin(enrollee_record.health_plan, enrollee_record.lga);
    
    UPDATE enrollees SET cin = new_enrollee_cin WHERE id = enrollee_record.id;
    
    -- Log the change
    INSERT INTO audit_logs (action, table_name, old_data, new_data, user_id)
    VALUES (
      'cin_regeneration',
      'enrollees',
      jsonb_build_object('old_cin', enrollee_record.cin, 'enrollee_id', enrollee_record.id),
      jsonb_build_object('new_cin', new_enrollee_cin, 'enrollee_id', enrollee_record.id),
      NULL
    );
  END LOOP;
  
  -- Regenerate dependant CINs
  FOR dependant_record IN 
    SELECT d.id, d.enrollee_id, e.cin as enrollee_cin 
    FROM dependants d 
    JOIN enrollees e ON d.enrollee_id = e.id
  LOOP
    new_dependant_cin := generate_dependant_cin(dependant_record.enrollee_cin);
    
    UPDATE dependants SET cin = new_dependant_cin WHERE id = dependant_record.id;
    
    -- Log the change
    INSERT INTO audit_logs (action, table_name, old_data, new_data, user_id)
    VALUES (
      'cin_regeneration',
      'dependants',
      jsonb_build_object('dependant_id', dependant_record.id),
      jsonb_build_object('new_cin', new_dependant_cin, 'dependant_id', dependant_record.id),
      NULL
    );
  END LOOP;
END $$;

-- =====================================================
-- PHASE 3: Triggers and Business Logic
-- =====================================================

-- 3.1 Auto-set plan expiry date
CREATE OR REPLACE FUNCTION set_plan_expiry_date()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' OR (TG_OP = 'UPDATE' AND OLD.plan_start_date IS DISTINCT FROM NEW.plan_start_date) THEN
    NEW.plan_expiry_date := NEW.plan_start_date + INTERVAL '1 year';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_plan_expiry_trigger ON enrollees;
CREATE TRIGGER set_plan_expiry_trigger
BEFORE INSERT OR UPDATE OF plan_start_date ON enrollees
FOR EACH ROW
EXECUTE FUNCTION set_plan_expiry_date();

-- 3.2 Update group member count
CREATE OR REPLACE FUNCTION update_group_member_count()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_group_count_trigger ON enrollees;
CREATE TRIGGER update_group_count_trigger
AFTER INSERT OR UPDATE OR DELETE ON enrollees
FOR EACH ROW
EXECUTE FUNCTION update_group_member_count();

-- 3.3 Log payment verification
CREATE OR REPLACE FUNCTION log_payment_verification()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS payment_verification_trigger ON enrollees;
CREATE TRIGGER payment_verification_trigger
BEFORE UPDATE ON enrollees
FOR EACH ROW
WHEN (OLD.payment_status IS DISTINCT FROM NEW.payment_status)
EXECUTE FUNCTION log_payment_verification();

-- =====================================================
-- PHASE 4: Helper Functions
-- =====================================================

-- 4.1 Check if plan is expired
CREATE OR REPLACE FUNCTION is_plan_expired(enrollee_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  expiry_date DATE;
BEGIN
  SELECT plan_expiry_date INTO expiry_date
  FROM enrollees
  WHERE id = enrollee_id;
  
  RETURN expiry_date < CURRENT_DATE;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- 4.2 Get expiring enrollees
CREATE OR REPLACE FUNCTION get_expiring_enrollees(months_ahead INTEGER DEFAULT 1)
RETURNS TABLE (
  id UUID,
  cin TEXT,
  first_name TEXT,
  last_name TEXT,
  phone_number TEXT,
  plan_expiry_date DATE,
  days_until_expiry INTEGER
) AS $$
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
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- 4.3 Get monthly enrollments
CREATE OR REPLACE FUNCTION get_monthly_enrollments(year_param INTEGER DEFAULT EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER)
RETURNS TABLE (
  month_number INTEGER,
  month_name TEXT,
  enrollment_count BIGINT,
  single_count BIGINT,
  primary_count BIGINT,
  group_member_count BIGINT
) AS $$
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
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- =====================================================
-- PHASE 5: Updated RLS Policies
-- =====================================================

-- Drop existing conflicting policies
DROP POLICY IF EXISTS "Primary enrollees can view group members" ON enrollees;
DROP POLICY IF EXISTS "Primary enrollees can update group members" ON enrollees;
DROP POLICY IF EXISTS "Block updates to expired enrollees" ON enrollees;

-- Allow primary enrollees to view their group members
CREATE POLICY "Primary enrollees can view group members"
ON enrollees FOR SELECT
USING (
  enrollment_type = 'group_member' 
  AND primary_enrollee_id IN (
    SELECT id FROM enrollees WHERE created_by = auth.uid() AND enrollment_type = 'primary'
  )
  OR created_by = auth.uid()
  OR has_role(auth.uid(), 'staff'::app_role)
  OR has_role(auth.uid(), 'admin'::app_role)
  OR has_role(auth.uid(), 'viewer'::app_role)
);

-- Staff can only update non-expired enrollees; admins can update all
CREATE POLICY "Block updates to expired enrollees"
ON enrollees FOR UPDATE
USING (
  has_role(auth.uid(), 'admin'::app_role)
  OR (
    (has_role(auth.uid(), 'staff'::app_role) OR created_by = auth.uid())
    AND plan_expiry_date >= CURRENT_DATE
  )
);