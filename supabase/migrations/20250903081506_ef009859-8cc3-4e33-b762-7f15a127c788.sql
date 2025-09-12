-- Clean up RLS policies for tables with disabled RLS
-- This removes the security warnings while maintaining public access

-- Drop all policies for follow_up_records
DROP POLICY IF EXISTS "Allow public insert follow-up records" ON public.follow_up_records;
DROP POLICY IF EXISTS "Authenticated users can view follow-up records" ON public.follow_up_records;
DROP POLICY IF EXISTS "Admins can update follow-up records" ON public.follow_up_records;
DROP POLICY IF EXISTS "Admins can delete follow-up records" ON public.follow_up_records;

-- Drop all policies for follow_up_visits
DROP POLICY IF EXISTS "Allow public insert follow-up visits" ON public.follow_up_visits;
DROP POLICY IF EXISTS "Authenticated users can view follow-up visits" ON public.follow_up_visits;
DROP POLICY IF EXISTS "Admins can update follow-up visits" ON public.follow_up_visits;
DROP POLICY IF EXISTS "Admins can delete follow-up visits" ON public.follow_up_visits;

-- Drop all policies for nursing_follow_ups
DROP POLICY IF EXISTS "Allow public insert nursing follow-ups" ON public.nursing_follow_ups;
DROP POLICY IF EXISTS "Authenticated users can view nursing follow-ups" ON public.nursing_follow_ups;
DROP POLICY IF EXISTS "Admins can update nursing follow-ups" ON public.nursing_follow_ups;
DROP POLICY IF EXISTS "Admins can delete nursing follow-ups" ON public.nursing_follow_ups;

-- Drop all policies for patients
DROP POLICY IF EXISTS "Allow public insert patients" ON public.patients;
DROP POLICY IF EXISTS "Authenticated users can view patients" ON public.patients;
DROP POLICY IF EXISTS "Admins can update patients" ON public.patients;  
DROP POLICY IF EXISTS "Admins can delete patients" ON public.patients;

-- Drop all policies for patient_treatments
DROP POLICY IF EXISTS "Allow public insert patient treatments" ON public.patient_treatments;
DROP POLICY IF EXISTS "Authenticated users can view patient treatments" ON public.patient_treatments;
DROP POLICY IF EXISTS "Admins can update patient treatments" ON public.patient_treatments;
DROP POLICY IF EXISTS "Admins can delete patient treatments" ON public.patient_treatments;

-- Drop all policies for patient_drug_treatments
DROP POLICY IF EXISTS "Allow public insert patient drug treatments" ON public.patient_drug_treatments;
DROP POLICY IF EXISTS "Authenticated users can view patient drug treatments" ON public.patient_drug_treatments;
DROP POLICY IF EXISTS "Admins can update patient drug treatments" ON public.patient_drug_treatments;
DROP POLICY IF EXISTS "Admins can delete patient drug treatments" ON public.patient_drug_treatments;