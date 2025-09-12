-- Add new fields to follow_up_records table for comprehensive basic information
ALTER TABLE public.follow_up_records ADD COLUMN hospital_id text;
ALTER TABLE public.follow_up_records ADD COLUMN height numeric;
ALTER TABLE public.follow_up_records ADD COLUMN weight numeric;
ALTER TABLE public.follow_up_records ADD COLUMN occupation text;
ALTER TABLE public.follow_up_records ADD COLUMN surgery_time timestamp with time zone;
ALTER TABLE public.follow_up_records ADD COLUMN surgery_method text;
ALTER TABLE public.follow_up_records ADD COLUMN stone_composition text;
ALTER TABLE public.follow_up_records ADD COLUMN daily_water_intake numeric;
ALTER TABLE public.follow_up_records ADD COLUMN dietary_preferences text;
ALTER TABLE public.follow_up_records ADD COLUMN lifestyle_habits text;
ALTER TABLE public.follow_up_records ADD COLUMN medical_history text;
ALTER TABLE public.follow_up_records ADD COLUMN stone_discovery_method text;
ALTER TABLE public.follow_up_records ADD COLUMN previous_uti_pathogens text;
ALTER TABLE public.follow_up_records ADD COLUMN previous_infection_medications text;
ALTER TABLE public.follow_up_records ADD COLUMN family_history text;
ALTER TABLE public.follow_up_records ADD COLUMN first_uti_time timestamp with time zone;
ALTER TABLE public.follow_up_records ADD COLUMN recurrent_uti boolean;