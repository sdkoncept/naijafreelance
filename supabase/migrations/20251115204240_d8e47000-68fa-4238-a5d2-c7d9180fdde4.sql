-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types
CREATE TYPE public.app_role AS ENUM ('admin', 'staff');
CREATE TYPE public.gender_type AS ENUM ('Male', 'Female', 'Other');
CREATE TYPE public.genotype_type AS ENUM ('AA', 'AS', 'SS');
CREATE TYPE public.blood_group_type AS ENUM ('O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-');
CREATE TYPE public.relationship_type AS ENUM ('Spouse', 'Child', 'Parent', 'Other');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

-- Create security definer function for role checking
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Create enrollees table
CREATE TABLE public.enrollees (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cin TEXT UNIQUE NOT NULL,
  registration_date DATE NOT NULL DEFAULT CURRENT_DATE,
  lga TEXT NOT NULL,
  full_name TEXT NOT NULL,
  date_of_birth DATE NOT NULL,
  gender gender_type NOT NULL,
  home_address TEXT NOT NULL,
  phone_number TEXT NOT NULL CHECK (length(phone_number) = 11),
  email TEXT,
  genotype genotype_type NOT NULL,
  blood_group blood_group_type NOT NULL,
  allergies TEXT,
  created_by UUID REFERENCES public.profiles(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.enrollees ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view enrollees"
  ON public.enrollees FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert enrollees"
  ON public.enrollees FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Authenticated users can update enrollees"
  ON public.enrollees FOR UPDATE
  TO authenticated
  USING (true);

-- Create dependants table
CREATE TABLE public.dependants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  enrollee_id UUID REFERENCES public.enrollees(id) ON DELETE CASCADE NOT NULL,
  full_name TEXT NOT NULL,
  date_of_birth DATE NOT NULL,
  gender gender_type NOT NULL,
  relationship relationship_type NOT NULL,
  phone_number TEXT CHECK (phone_number IS NULL OR length(phone_number) = 11),
  address TEXT,
  genotype genotype_type,
  allergies TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.dependants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view dependants"
  ON public.dependants FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert dependants"
  ON public.dependants FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update dependants"
  ON public.dependants FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can delete dependants"
  ON public.dependants FOR DELETE
  TO authenticated
  USING (true);

-- Create audit_logs table
CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) NOT NULL,
  action TEXT NOT NULL,
  table_name TEXT NOT NULL,
  record_id UUID NOT NULL,
  old_data JSONB,
  new_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin can view all audit logs"
  ON public.audit_logs FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Create function to handle new user signups
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NEW.email
  );
  RETURN NEW;
END;
$$;

-- Create trigger for new user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_enrollees_updated_at
  BEFORE UPDATE ON public.enrollees
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_dependants_updated_at
  BEFORE UPDATE ON public.dependants
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to generate CIN
CREATE OR REPLACE FUNCTION public.generate_cin()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
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
$$;

-- Create indexes for performance
CREATE INDEX idx_enrollees_cin ON public.enrollees(cin);
CREATE INDEX idx_enrollees_full_name ON public.enrollees(full_name);
CREATE INDEX idx_enrollees_phone_number ON public.enrollees(phone_number);
CREATE INDEX idx_enrollees_lga ON public.enrollees(lga);
CREATE INDEX idx_dependants_enrollee_id ON public.dependants(enrollee_id);
CREATE INDEX idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX idx_audit_logs_record_id ON public.audit_logs(record_id);