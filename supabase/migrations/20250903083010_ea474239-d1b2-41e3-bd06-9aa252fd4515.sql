-- Phase 1: Database Structure Adjustment for Patient Survey Form
-- Add new columns to patients table for comprehensive patient information

-- Add new fields to patients table
ALTER TABLE public.patients 
ADD COLUMN birth_date DATE,
ADD COLUMN enrollment_age INTEGER,
ADD COLUMN stone_first_discovery_time TIMESTAMP WITH TIME ZONE,
ADD COLUMN enrollment_stone_confirmed BOOLEAN,
ADD COLUMN enrollment_stone_location TEXT,
ADD COLUMN enrollment_stone_size TEXT,
ADD COLUMN enrollment_stone_multiple BOOLEAN,
ADD COLUMN enrollment_hydronephrosis TEXT,
ADD COLUMN enrollment_ct_value TEXT,
ADD COLUMN stone_composition_analysis TEXT,
ADD COLUMN urine_cystine_concentration TEXT,
ADD COLUMN urine_mda_content TEXT,
ADD COLUMN blood_4hne_content TEXT;

-- Modify patient_treatments table structure
ALTER TABLE public.patient_treatments 
ADD COLUMN stone_laterality TEXT,
ADD COLUMN stone_location TEXT,
ADD COLUMN treatment_effect TEXT;

-- Rename treatment_date to treatment_time for consistency
ALTER TABLE public.patient_treatments 
RENAME COLUMN treatment_date TO treatment_time;

-- Modify patient_drug_treatments table structure
ALTER TABLE public.patient_drug_treatments 
ADD COLUMN start_time TIMESTAMP WITH TIME ZONE,
ADD COLUMN end_time TIMESTAMP WITH TIME ZONE,
ADD COLUMN medication_regimen TEXT,
ADD COLUMN treatment_effect TEXT;

-- Rename drug_name to medication_name for consistency
ALTER TABLE public.patient_drug_treatments 
RENAME COLUMN drug_name TO medication_name;

-- Add comments for documentation
COMMENT ON COLUMN public.patients.birth_date IS '出生日期';
COMMENT ON COLUMN public.patients.enrollment_age IS '入组年龄';
COMMENT ON COLUMN public.patients.stone_first_discovery_time IS '结石首次发现时间';
COMMENT ON COLUMN public.patients.enrollment_stone_confirmed IS '入组时是否确诊仍有结石';
COMMENT ON COLUMN public.patients.enrollment_stone_location IS '入组时结石部位';
COMMENT ON COLUMN public.patients.enrollment_stone_size IS '入组时结石大小';
COMMENT ON COLUMN public.patients.enrollment_stone_multiple IS '入组时结石是否多发';
COMMENT ON COLUMN public.patients.enrollment_hydronephrosis IS '入组时肾积水情况';
COMMENT ON COLUMN public.patients.enrollment_ct_value IS '入组时影像学检查CT值';
COMMENT ON COLUMN public.patients.stone_composition_analysis IS '结石成分分析结果';
COMMENT ON COLUMN public.patients.urine_cystine_concentration IS '尿液胱氨酸浓度';
COMMENT ON COLUMN public.patients.urine_mda_content IS '尿液MDA含量';
COMMENT ON COLUMN public.patients.blood_4hne_content IS '血液4-HNE含量';

COMMENT ON COLUMN public.patient_treatments.stone_laterality IS '结石侧别';
COMMENT ON COLUMN public.patient_treatments.stone_location IS '结石部位';
COMMENT ON COLUMN public.patient_treatments.treatment_effect IS '治疗效果';

COMMENT ON COLUMN public.patient_drug_treatments.start_time IS '开始时间';
COMMENT ON COLUMN public.patient_drug_treatments.end_time IS '结束时间';
COMMENT ON COLUMN public.patient_drug_treatments.medication_name IS '药物名称';
COMMENT ON COLUMN public.patient_drug_treatments.medication_regimen IS '用药方案';
COMMENT ON COLUMN public.patient_drug_treatments.treatment_effect IS '治疗效果';