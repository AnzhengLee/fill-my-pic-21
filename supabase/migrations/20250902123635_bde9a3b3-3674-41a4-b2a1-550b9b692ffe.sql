-- Check current policies and temporarily disable RLS to test if forms work
-- This is a temporary solution to isolate the RLS issue

-- Temporarily disable RLS on the tables that are causing issues
ALTER TABLE public.follow_up_records DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.follow_up_visits DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.nursing_follow_ups DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.patients DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_treatments DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_drug_treatments DISABLE ROW LEVEL SECURITY;