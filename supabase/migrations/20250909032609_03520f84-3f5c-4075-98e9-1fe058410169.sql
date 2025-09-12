-- 添加工作单位相关字段到 medical_records 表
ALTER TABLE public.medical_records 
ADD COLUMN work_unit text,
ADD COLUMN work_phone text,
ADD COLUMN work_postal_code text;

-- 为新字段添加注释
COMMENT ON COLUMN public.medical_records.work_unit IS '工作单位及地址';
COMMENT ON COLUMN public.medical_records.work_phone IS '单位电话';
COMMENT ON COLUMN public.medical_records.work_postal_code IS '单位邮编';