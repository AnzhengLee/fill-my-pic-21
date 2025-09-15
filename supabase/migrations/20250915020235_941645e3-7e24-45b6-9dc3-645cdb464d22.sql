-- Remove unused fees field from medical_records table
ALTER TABLE public.medical_records 
DROP COLUMN fees;

-- Update quality_control field default to match what's actually used in forms
-- Instead of having 16 fields, we'll use only the 4 fields used in the form
ALTER TABLE public.medical_records 
ALTER COLUMN quality_control 
SET DEFAULT '{"quality": "", "quality_physician": "", "quality_nurse": "", "quality_date": ""}'::jsonb;