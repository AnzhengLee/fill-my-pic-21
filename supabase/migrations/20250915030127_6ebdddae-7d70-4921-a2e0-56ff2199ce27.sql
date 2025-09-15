-- Add missing address and contact fields to medical_records table
ALTER TABLE public.medical_records 
ADD COLUMN household_address text,
ADD COLUMN household_postal_code text,
ADD COLUMN work_phone text,
ADD COLUMN work_postal_code text,
ADD COLUMN current_address text;