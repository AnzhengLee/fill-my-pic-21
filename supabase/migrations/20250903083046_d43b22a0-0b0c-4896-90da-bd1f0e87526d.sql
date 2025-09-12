-- Fix security issues by enabling RLS on all patient-related tables
-- and creating appropriate access policies

-- Enable RLS on all patient-related tables
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_treatments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_drug_treatments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.follow_up_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.follow_up_visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nursing_follow_ups ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for patients table
CREATE POLICY "Authenticated users can view all patients" 
ON public.patients 
FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "Authenticated users can insert patients" 
ON public.patients 
FOR INSERT 
TO authenticated 
WITH CHECK (true);

CREATE POLICY "Authenticated users can update patients" 
ON public.patients 
FOR UPDATE 
TO authenticated 
USING (true);

-- Create RLS policies for patient_treatments table
CREATE POLICY "Authenticated users can view all patient treatments" 
ON public.patient_treatments 
FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "Authenticated users can insert patient treatments" 
ON public.patient_treatments 
FOR INSERT 
TO authenticated 
WITH CHECK (true);

CREATE POLICY "Authenticated users can update patient treatments" 
ON public.patient_treatments 
FOR UPDATE 
TO authenticated 
USING (true);

-- Create RLS policies for patient_drug_treatments table
CREATE POLICY "Authenticated users can view all patient drug treatments" 
ON public.patient_drug_treatments 
FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "Authenticated users can insert patient drug treatments" 
ON public.patient_drug_treatments 
FOR INSERT 
TO authenticated 
WITH CHECK (true);

CREATE POLICY "Authenticated users can update patient drug treatments" 
ON public.patient_drug_treatments 
FOR UPDATE 
TO authenticated 
USING (true);

-- Create RLS policies for follow_up_records table
CREATE POLICY "Authenticated users can view all follow up records" 
ON public.follow_up_records 
FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "Authenticated users can insert follow up records" 
ON public.follow_up_records 
FOR INSERT 
TO authenticated 
WITH CHECK (true);

CREATE POLICY "Authenticated users can update follow up records" 
ON public.follow_up_records 
FOR UPDATE 
TO authenticated 
USING (true);

-- Create RLS policies for follow_up_visits table
CREATE POLICY "Authenticated users can view all follow up visits" 
ON public.follow_up_visits 
FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "Authenticated users can insert follow up visits" 
ON public.follow_up_visits 
FOR INSERT 
TO authenticated 
WITH CHECK (true);

CREATE POLICY "Authenticated users can update follow up visits" 
ON public.follow_up_visits 
FOR UPDATE 
TO authenticated 
USING (true);

-- Create RLS policies for nursing_follow_ups table
CREATE POLICY "Authenticated users can view all nursing follow ups" 
ON public.nursing_follow_ups 
FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "Authenticated users can insert nursing follow ups" 
ON public.nursing_follow_ups 
FOR INSERT 
TO authenticated 
WITH CHECK (true);

CREATE POLICY "Authenticated users can update nursing follow ups" 
ON public.nursing_follow_ups 
FOR UPDATE 
TO authenticated 
USING (true);