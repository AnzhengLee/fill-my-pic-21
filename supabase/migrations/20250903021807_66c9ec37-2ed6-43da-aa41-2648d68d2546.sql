-- CRITICAL SECURITY FIX: Enable Row Level Security on all medical data tables
-- This prevents public access to sensitive patient medical information

-- Enable RLS on all medical data tables
ALTER TABLE public.follow_up_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.follow_up_visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nursing_follow_ups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_treatments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_drug_treatments ENABLE ROW LEVEL SECURITY;

-- Remove the problematic "Viewers can read" policies that don't check auth.uid()
DROP POLICY IF EXISTS "Viewers can read follow-up records" ON public.follow_up_records;
DROP POLICY IF EXISTS "Viewers can read follow-up visits" ON public.follow_up_visits;
DROP POLICY IF EXISTS "Viewers can read nursing follow-ups" ON public.nursing_follow_ups;
DROP POLICY IF EXISTS "Viewers can read patients" ON public.patients;
DROP POLICY IF EXISTS "Viewers can read patient treatments" ON public.patient_treatments;
DROP POLICY IF EXISTS "Viewers can read patient drug treatments" ON public.patient_drug_treatments;