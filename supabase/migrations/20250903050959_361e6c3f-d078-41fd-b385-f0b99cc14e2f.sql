-- Add new medical indicators and examination results fields to follow_up_records table

-- Add liver function indicators
ALTER TABLE public.follow_up_records 
ADD COLUMN pre_op_alt numeric,
ADD COLUMN post_op_alt numeric,
ADD COLUMN pre_op_ast numeric,
ADD COLUMN post_op_ast numeric,
ADD COLUMN pre_op_ggt numeric,
ADD COLUMN post_op_ggt numeric;

-- Add urine routine indicators  
ALTER TABLE public.follow_up_records
ADD COLUMN pre_op_urine_ph numeric,
ADD COLUMN post_op_urine_ph numeric,
ADD COLUMN pre_op_urine_nit text,
ADD COLUMN post_op_urine_nit text,
ADD COLUMN pre_op_urine_wbc text,
ADD COLUMN post_op_urine_wbc text;

-- Add examination results fields
ALTER TABLE public.follow_up_records
ADD COLUMN pre_op_urine_culture text,
ADD COLUMN post_op_urine_culture text,
ADD COLUMN pre_op_urine_ngs_available boolean DEFAULT false,
ADD COLUMN pre_op_urine_ngs_result text,
ADD COLUMN post_op_urine_ngs_available boolean DEFAULT false,
ADD COLUMN post_op_urine_ngs_result text,
ADD COLUMN stone_bacterial_culture text,
ADD COLUMN stone_ngs_available boolean DEFAULT false,
ADD COLUMN stone_ngs_result text;

-- Modify stone_composition to handle structured data (keeping as text for backward compatibility)
-- Note: We'll use checkboxes in frontend but store as comma-separated values