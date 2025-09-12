-- Remove family_history column from follow_up_records table
ALTER TABLE public.follow_up_records DROP COLUMN IF EXISTS family_history;