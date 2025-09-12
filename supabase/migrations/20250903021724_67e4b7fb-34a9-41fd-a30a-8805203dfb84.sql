-- CRITICAL SECURITY FIX: Enable Row Level Security on all medical data tables
-- This prevents public access to sensitive patient medical information

-- Enable RLS on all medical data tables
ALTER TABLE public.follow_up_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.follow_up_visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nursing_follow_ups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_treatments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_drug_treatments ENABLE ROW LEVEL SECURITY;

-- Remove redundant/problematic policies and create secure ones
-- Drop the problematic "Viewers can read follow-up records" policy that doesn't check auth
DROP POLICY IF EXISTS "Viewers can read follow-up records" ON public.follow_up_records;
DROP POLICY IF EXISTS "Viewers can read follow-up visits" ON public.follow_up_visits;
DROP POLICY IF EXISTS "Viewers can read nursing follow-ups" ON public.nursing_follow_ups;
DROP POLICY IF EXISTS "Viewers can read patients" ON public.patients;
DROP POLICY IF EXISTS "Viewers can read patient treatments" ON public.patient_treatments;
DROP POLICY IF EXISTS "Viewers can read patient drug treatments" ON public.patient_drug_treatments;

-- Ensure all SELECT policies properly require authentication and roles
-- These policies already exist but let's make sure they're the only SELECT policies
CREATE POLICY IF NOT EXISTS "Authenticated medical staff can view follow-up records" 
ON public.follow_up_records 
FOR SELECT 
USING (
  auth.uid() IS NOT NULL AND 
  get_current_user_role() = ANY (ARRAY['admin'::text, 'operator'::text, 'viewer'::text])
);

CREATE POLICY IF NOT EXISTS "Authenticated medical staff can view follow-up visits" 
ON public.follow_up_visits 
FOR SELECT 
USING (
  auth.uid() IS NOT NULL AND 
  get_current_user_role() = ANY (ARRAY['admin'::text, 'operator'::text, 'viewer'::text])
);

CREATE POLICY IF NOT EXISTS "Authenticated medical staff can view nursing follow-ups" 
ON public.nursing_follow_ups 
FOR SELECT 
USING (
  auth.uid() IS NOT NULL AND 
  get_current_user_role() = ANY (ARRAY['admin'::text, 'operator'::text, 'viewer'::text])
);

CREATE POLICY IF NOT EXISTS "Authenticated medical staff can view patients" 
ON public.patients 
FOR SELECT 
USING (
  auth.uid() IS NOT NULL AND 
  get_current_user_role() = ANY (ARRAY['admin'::text, 'operator'::text, 'viewer'::text])
);

CREATE POLICY IF NOT EXISTS "Authenticated medical staff can view patient treatments" 
ON public.patient_treatments 
FOR SELECT 
USING (
  auth.uid() IS NOT NULL AND 
  get_current_user_role() = ANY (ARRAY['admin'::text, 'operator'::text, 'viewer'::text])
);

CREATE POLICY IF NOT EXISTS "Authenticated medical staff can view patient drug treatments" 
ON public.patient_drug_treatments 
FOR SELECT 
USING (
  auth.uid() IS NOT NULL AND 
  get_current_user_role() = ANY (ARRAY['admin'::text, 'operator'::text, 'viewer'::text])
);