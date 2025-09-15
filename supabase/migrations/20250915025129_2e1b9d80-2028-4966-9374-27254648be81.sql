-- Add discharge_ward field to medical_records table
ALTER TABLE public.medical_records 
ADD COLUMN discharge_ward text;