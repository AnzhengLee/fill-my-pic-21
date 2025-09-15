-- Add missing transfer_department and discharge_department fields to medical_records table
ALTER TABLE public.medical_records 
ADD COLUMN transfer_department text,
ADD COLUMN discharge_department text;