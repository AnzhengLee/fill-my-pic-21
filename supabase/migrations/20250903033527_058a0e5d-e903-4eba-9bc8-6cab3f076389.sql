-- Add remaining new fields to follow_up_records table
ALTER TABLE public.follow_up_records 
ADD COLUMN clinical_diagnosis text,
ADD COLUMN stone_location text,
ADD COLUMN stone_size numeric,
ADD COLUMN hydronephrosis_degree text;