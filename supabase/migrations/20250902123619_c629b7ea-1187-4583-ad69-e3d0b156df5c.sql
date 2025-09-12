-- Fix RLS policies for public access - the issue is that get_current_user_role() might return null for unauthenticated users
-- Let's create simpler policies that work for both authenticated and unauthenticated users

-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can insert follow-up records" ON public.follow_up_records;
DROP POLICY IF EXISTS "Authenticated users can view follow-up records" ON public.follow_up_records;
DROP POLICY IF EXISTS "Admin users can update follow-up records" ON public.follow_up_records;
DROP POLICY IF EXISTS "Admin users can delete follow-up records" ON public.follow_up_records;

DROP POLICY IF EXISTS "Anyone can insert follow-up visits" ON public.follow_up_visits;
DROP POLICY IF EXISTS "Authenticated users can view follow-up visits" ON public.follow_up_visits;
DROP POLICY IF EXISTS "Admin users can update follow-up visits" ON public.follow_up_visits;
DROP POLICY IF EXISTS "Admin users can delete follow-up visits" ON public.follow_up_visits;

DROP POLICY IF EXISTS "Anyone can insert nursing follow-ups" ON public.nursing_follow_ups;
DROP POLICY IF EXISTS "Authenticated users can view nursing follow-ups" ON public.nursing_follow_ups;
DROP POLICY IF EXISTS "Admin users can update nursing follow-ups" ON public.nursing_follow_ups;
DROP POLICY IF EXISTS "Admin users can delete nursing follow-ups" ON public.nursing_follow_ups;

DROP POLICY IF EXISTS "Anyone can insert patients" ON public.patients;
DROP POLICY IF EXISTS "Authenticated users can view patients" ON public.patients;
DROP POLICY IF EXISTS "Admin users can update patients" ON public.patients;
DROP POLICY IF EXISTS "Admin users can delete patients" ON public.patients;

DROP POLICY IF EXISTS "Anyone can insert patient treatments" ON public.patient_treatments;
DROP POLICY IF EXISTS "Authenticated users can view patient treatments" ON public.patient_treatments;
DROP POLICY IF EXISTS "Admin users can update patient treatments" ON public.patient_treatments;
DROP POLICY IF EXISTS "Admin users can delete patient treatments" ON public.patient_treatments;

DROP POLICY IF EXISTS "Anyone can insert patient drug treatments" ON public.patient_drug_treatments;
DROP POLICY IF EXISTS "Authenticated users can view patient drug treatments" ON public.patient_drug_treatments;
DROP POLICY IF EXISTS "Admin users can update patient drug treatments" ON public.patient_drug_treatments;
DROP POLICY IF EXISTS "Admin users can delete patient drug treatments" ON public.patient_drug_treatments;

-- Create new simplified policies that handle both authenticated and unauthenticated users

-- Follow-up records policies
CREATE POLICY "Public can insert follow-up records" ON public.follow_up_records
FOR INSERT WITH CHECK (true);

CREATE POLICY "Authenticated users can view follow-up records" ON public.follow_up_records
FOR SELECT USING (
  auth.uid() IS NOT NULL AND 
  COALESCE(get_current_user_role(), '') IN ('admin', 'operator', 'viewer')
);

CREATE POLICY "Admins can update follow-up records" ON public.follow_up_records
FOR UPDATE USING (
  auth.uid() IS NOT NULL AND 
  COALESCE(get_current_user_role(), '') IN ('admin', 'operator')
);

CREATE POLICY "Admins can delete follow-up records" ON public.follow_up_records
FOR DELETE USING (
  auth.uid() IS NOT NULL AND 
  COALESCE(get_current_user_role(), '') = 'admin'
);

-- Follow-up visits policies
CREATE POLICY "Public can insert follow-up visits" ON public.follow_up_visits
FOR INSERT WITH CHECK (true);

CREATE POLICY "Authenticated users can view follow-up visits" ON public.follow_up_visits
FOR SELECT USING (
  auth.uid() IS NOT NULL AND 
  COALESCE(get_current_user_role(), '') IN ('admin', 'operator', 'viewer')
);

CREATE POLICY "Admins can update follow-up visits" ON public.follow_up_visits
FOR UPDATE USING (
  auth.uid() IS NOT NULL AND 
  COALESCE(get_current_user_role(), '') IN ('admin', 'operator')
);

CREATE POLICY "Admins can delete follow-up visits" ON public.follow_up_visits
FOR DELETE USING (
  auth.uid() IS NOT NULL AND 
  COALESCE(get_current_user_role(), '') = 'admin'
);

-- Nursing follow-ups policies
CREATE POLICY "Public can insert nursing follow-ups" ON public.nursing_follow_ups
FOR INSERT WITH CHECK (true);

CREATE POLICY "Authenticated users can view nursing follow-ups" ON public.nursing_follow_ups
FOR SELECT USING (
  auth.uid() IS NOT NULL AND 
  COALESCE(get_current_user_role(), '') IN ('admin', 'operator', 'viewer')
);

CREATE POLICY "Admins can update nursing follow-ups" ON public.nursing_follow_ups
FOR UPDATE USING (
  auth.uid() IS NOT NULL AND 
  COALESCE(get_current_user_role(), '') IN ('admin', 'operator')
);

CREATE POLICY "Admins can delete nursing follow-ups" ON public.nursing_follow_ups
FOR DELETE USING (
  auth.uid() IS NOT NULL AND 
  COALESCE(get_current_user_role(), '') = 'admin'
);

-- Patients table policies
CREATE POLICY "Public can insert patients" ON public.patients
FOR INSERT WITH CHECK (true);

CREATE POLICY "Authenticated users can view patients" ON public.patients
FOR SELECT USING (
  auth.uid() IS NOT NULL AND 
  COALESCE(get_current_user_role(), '') IN ('admin', 'operator', 'viewer')
);

CREATE POLICY "Admins can update patients" ON public.patients
FOR UPDATE USING (
  auth.uid() IS NOT NULL AND 
  COALESCE(get_current_user_role(), '') IN ('admin', 'operator')
);

CREATE POLICY "Admins can delete patients" ON public.patients
FOR DELETE USING (
  auth.uid() IS NOT NULL AND 
  COALESCE(get_current_user_role(), '') = 'admin'
);

-- Patient treatments policies
CREATE POLICY "Public can insert patient treatments" ON public.patient_treatments
FOR INSERT WITH CHECK (true);

CREATE POLICY "Authenticated users can view patient treatments" ON public.patient_treatments
FOR SELECT USING (
  auth.uid() IS NOT NULL AND 
  COALESCE(get_current_user_role(), '') IN ('admin', 'operator', 'viewer')
);

CREATE POLICY "Admins can update patient treatments" ON public.patient_treatments
FOR UPDATE USING (
  auth.uid() IS NOT NULL AND 
  COALESCE(get_current_user_role(), '') IN ('admin', 'operator')
);

CREATE POLICY "Admins can delete patient treatments" ON public.patient_treatments
FOR DELETE USING (
  auth.uid() IS NOT NULL AND 
  COALESCE(get_current_user_role(), '') = 'admin'
);

-- Patient drug treatments policies
CREATE POLICY "Public can insert patient drug treatments" ON public.patient_drug_treatments
FOR INSERT WITH CHECK (true);

CREATE POLICY "Authenticated users can view patient drug treatments" ON public.patient_drug_treatments
FOR SELECT USING (
  auth.uid() IS NOT NULL AND 
  COALESCE(get_current_user_role(), '') IN ('admin', 'operator', 'viewer')
);

CREATE POLICY "Admins can update patient drug treatments" ON public.patient_drug_treatments
FOR UPDATE USING (
  auth.uid() IS NOT NULL AND 
  COALESCE(get_current_user_role(), '') IN ('admin', 'operator')
);

CREATE POLICY "Admins can delete patient drug treatments" ON public.patient_drug_treatments
FOR DELETE USING (
  auth.uid() IS NOT NULL AND 
  COALESCE(get_current_user_role(), '') = 'admin'
);