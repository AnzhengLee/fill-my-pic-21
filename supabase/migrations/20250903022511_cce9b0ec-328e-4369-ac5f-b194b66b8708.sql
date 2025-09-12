-- Remove record_id field and make hospital_id unique
ALTER TABLE public.follow_up_records DROP COLUMN IF EXISTS record_id;

-- Add unique constraint to hospital_id
ALTER TABLE public.follow_up_records ADD CONSTRAINT unique_hospital_id UNIQUE (hospital_id);