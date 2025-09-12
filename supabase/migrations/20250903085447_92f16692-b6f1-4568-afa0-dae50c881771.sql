-- Disable Row Level Security on patient-related tables
ALTER TABLE public.patients DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_treatments DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_drug_treatments DISABLE ROW LEVEL SECURITY;

-- Drop all existing RLS policies on patients table
DROP POLICY IF EXISTS "Authenticated users can view all patients" ON public.patients;
DROP POLICY IF EXISTS "Authenticated users can insert patients" ON public.patients;
DROP POLICY IF EXISTS "Authenticated users can update patients" ON public.patients;

-- Drop all existing RLS policies on patient_treatments table
DROP POLICY IF EXISTS "Authenticated users can view all patient treatments" ON public.patient_treatments;
DROP POLICY IF EXISTS "Authenticated users can insert patient treatments" ON public.patient_treatments;
DROP POLICY IF EXISTS "Authenticated users can update patient treatments" ON public.patient_treatments;

-- Drop all existing RLS policies on patient_drug_treatments table
DROP POLICY IF EXISTS "Authenticated users can view all patient drug treatments" ON public.patient_drug_treatments;
DROP POLICY IF EXISTS "Authenticated users can insert patient drug treatments" ON public.patient_drug_treatments;
DROP POLICY IF EXISTS "Authenticated users can update patient drug treatments" ON public.patient_drug_treatments;