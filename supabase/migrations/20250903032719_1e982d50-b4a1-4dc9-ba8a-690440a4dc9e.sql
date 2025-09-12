-- Add family stone history field to follow_up_records table
ALTER TABLE public.follow_up_records 
ADD COLUMN family_stone_history boolean;