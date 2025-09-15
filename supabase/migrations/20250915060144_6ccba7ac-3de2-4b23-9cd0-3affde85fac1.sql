-- Add missing contact and work address fields to medical_records table
ALTER TABLE public.medical_records 
ADD COLUMN contact_name text,
ADD COLUMN contact_relationship text,
ADD COLUMN contact_phone text,
ADD COLUMN work_address text;