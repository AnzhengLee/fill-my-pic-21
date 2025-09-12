-- Fix RLS policies to allow public users to submit data but restrict viewing to authenticated users

-- Drop existing restrictive INSERT policies and create new ones that allow public access
DROP POLICY IF EXISTS "Admin users can manage all patients" ON public.patients;
DROP POLICY IF EXISTS "Admin users can manage patient treatments" ON public.patient_treatments;
DROP POLICY IF EXISTS "Admin users can manage patient drug treatments" ON public.patient_drug_treatments;
DROP POLICY IF EXISTS "Admin users can manage follow-up records" ON public.follow_up_records;
DROP POLICY IF EXISTS "Admin users can manage follow-up visits" ON public.follow_up_visits;
DROP POLICY IF EXISTS "Admin users can manage nursing follow-ups" ON public.nursing_follow_ups;

-- Create policies that allow public INSERT but restrict SELECT/UPDATE/DELETE to authenticated users

-- Patients table policies
CREATE POLICY "Anyone can insert patients" ON public.patients
FOR INSERT WITH CHECK (true);

CREATE POLICY "Authenticated users can view patients" ON public.patients
FOR SELECT USING (get_current_user_role() IN ('admin', 'operator', 'viewer'));

CREATE POLICY "Admin users can update patients" ON public.patients
FOR UPDATE USING (get_current_user_role() IN ('admin', 'operator'));

CREATE POLICY "Admin users can delete patients" ON public.patients
FOR DELETE USING (get_current_user_role() = 'admin');

-- Patient treatments policies
CREATE POLICY "Anyone can insert patient treatments" ON public.patient_treatments
FOR INSERT WITH CHECK (true);

CREATE POLICY "Authenticated users can view patient treatments" ON public.patient_treatments
FOR SELECT USING (get_current_user_role() IN ('admin', 'operator', 'viewer'));

CREATE POLICY "Admin users can update patient treatments" ON public.patient_treatments
FOR UPDATE USING (get_current_user_role() IN ('admin', 'operator'));

CREATE POLICY "Admin users can delete patient treatments" ON public.patient_treatments
FOR DELETE USING (get_current_user_role() = 'admin');

-- Patient drug treatments policies
CREATE POLICY "Anyone can insert patient drug treatments" ON public.patient_drug_treatments
FOR INSERT WITH CHECK (true);

CREATE POLICY "Authenticated users can view patient drug treatments" ON public.patient_drug_treatments
FOR SELECT USING (get_current_user_role() IN ('admin', 'operator', 'viewer'));

CREATE POLICY "Admin users can update patient drug treatments" ON public.patient_drug_treatments
FOR UPDATE USING (get_current_user_role() IN ('admin', 'operator'));

CREATE POLICY "Admin users can delete patient drug treatments" ON public.patient_drug_treatments
FOR DELETE USING (get_current_user_role() = 'admin');

-- Follow-up records policies
CREATE POLICY "Anyone can insert follow-up records" ON public.follow_up_records
FOR INSERT WITH CHECK (true);

CREATE POLICY "Authenticated users can view follow-up records" ON public.follow_up_records
FOR SELECT USING (get_current_user_role() IN ('admin', 'operator', 'viewer'));

CREATE POLICY "Admin users can update follow-up records" ON public.follow_up_records
FOR UPDATE USING (get_current_user_role() IN ('admin', 'operator'));

CREATE POLICY "Admin users can delete follow-up records" ON public.follow_up_records
FOR DELETE USING (get_current_user_role() = 'admin');

-- Follow-up visits policies
CREATE POLICY "Anyone can insert follow-up visits" ON public.follow_up_visits
FOR INSERT WITH CHECK (true);

CREATE POLICY "Authenticated users can view follow-up visits" ON public.follow_up_visits
FOR SELECT USING (get_current_user_role() IN ('admin', 'operator', 'viewer'));

CREATE POLICY "Admin users can update follow-up visits" ON public.follow_up_visits
FOR UPDATE USING (get_current_user_role() IN ('admin', 'operator'));

CREATE POLICY "Admin users can delete follow-up visits" ON public.follow_up_visits
FOR DELETE USING (get_current_user_role() = 'admin');

-- Nursing follow-ups policies
CREATE POLICY "Anyone can insert nursing follow-ups" ON public.nursing_follow_ups
FOR INSERT WITH CHECK (true);

CREATE POLICY "Authenticated users can view nursing follow-ups" ON public.nursing_follow_ups
FOR SELECT USING (get_current_user_role() IN ('admin', 'operator', 'viewer'));

CREATE POLICY "Admin users can update nursing follow-ups" ON public.nursing_follow_ups
FOR UPDATE USING (get_current_user_role() IN ('admin', 'operator'));

CREATE POLICY "Admin users can delete nursing follow-ups" ON public.nursing_follow_ups
FOR DELETE USING (get_current_user_role() = 'admin');