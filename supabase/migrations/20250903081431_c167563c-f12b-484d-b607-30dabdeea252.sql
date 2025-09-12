-- Disable Row Level Security for all questionnaire-related tables
-- This allows public access for questionnaire data collection

ALTER TABLE public.follow_up_records DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.follow_up_visits DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.nursing_follow_ups DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.patients DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_treatments DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_drug_treatments DISABLE ROW LEVEL SECURITY;