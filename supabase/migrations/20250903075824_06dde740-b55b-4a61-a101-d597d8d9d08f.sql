-- Drop existing INSERT policies that have auth.uid() dependencies
DROP POLICY IF EXISTS "Public can insert follow-up records" ON public.follow_up_records;
DROP POLICY IF EXISTS "Public can insert follow-up visits" ON public.follow_up_visits;
DROP POLICY IF EXISTS "Public can insert nursing follow-ups" ON public.nursing_follow_ups;
DROP POLICY IF EXISTS "Public can insert patients" ON public.patients;
DROP POLICY IF EXISTS "Public can insert patient treatments" ON public.patient_treatments;
DROP POLICY IF EXISTS "Public can insert patient drug treatments" ON public.patient_drug_treatments;

-- Create new policies that truly allow public insertion
CREATE POLICY "Allow public insert follow-up records" ON public.follow_up_records
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public insert follow-up visits" ON public.follow_up_visits
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public insert nursing follow-ups" ON public.nursing_follow_ups
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public insert patients" ON public.patients
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public insert patient treatments" ON public.patient_treatments
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public insert patient drug treatments" ON public.patient_drug_treatments
  FOR INSERT WITH CHECK (true);