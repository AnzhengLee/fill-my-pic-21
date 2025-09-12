-- Create medical_records table for information recognition
CREATE TABLE public.medical_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  
  -- Basic information
  name TEXT,
  gender TEXT,
  birth_date DATE,
  age INTEGER,
  nationality TEXT,
  birth_place TEXT,
  native_place TEXT,
  ethnicity TEXT,
  id_number TEXT,
  occupation TEXT,
  marital_status TEXT,
  current_address TEXT,
  phone TEXT,
  postal_code TEXT,
  household_address TEXT,
  household_postal_code TEXT,
  
  -- Contact person (stored as JSONB)
  contact_person JSONB DEFAULT '{"name": "", "relationship": "", "address": "", "phone": ""}'::JSONB,
  
  -- Admission information (stored as JSONB)
  admission_info JSONB DEFAULT '{"admission_path": "", "admission_time": "", "admission_department": "", "transfer_department": "", "ward": ""}'::JSONB,
  
  -- Discharge information (stored as JSONB)
  discharge_info JSONB DEFAULT '{"discharge_time": "", "discharge_department": "", "ward": "", "actual_days": ""}'::JSONB,
  
  -- Diagnosis information (stored as JSONB)
  diagnosis_info JSONB DEFAULT '{"outpatient_diagnosis": "", "disease_codes": [], "main_diagnosis": "", "main_disease_code": "", "admission_condition": "", "other_diagnoses": [], "other_disease_codes": [], "other_admission_conditions": []}'::JSONB,
  
  -- Pathology information (stored as JSONB)
  pathology_info JSONB DEFAULT '{"external_cause": "", "external_cause_code": "", "pathology_diagnosis": "", "pathology_code": "", "pathology_number": "", "drug_allergy": "", "allergy_drugs": "", "autopsy": "", "blood_type": "", "rh": ""}'::JSONB,
  
  -- Medical personnel (stored as JSONB)
  medical_personnel JSONB DEFAULT '{"department_director": "", "attending_physician": "", "resident_physician": "", "intern_physician": "", "responsible_nurse": "", "fellow_physician": "", "medical_student": "", "coder": ""}'::JSONB,
  
  -- Quality control (stored as JSONB)
  quality_control JSONB DEFAULT '{"quality": "", "quality_physician": "", "quality_nurse": "", "quality_date": ""}'::JSONB
);

-- Enable Row Level Security
ALTER TABLE public.medical_records ENABLE ROW LEVEL SECURITY;

-- Create policies for medical_records
CREATE POLICY "Users can view their own medical records" 
ON public.medical_records 
FOR SELECT 
USING (auth.uid() = created_by);

CREATE POLICY "Users can create their own medical records" 
ON public.medical_records 
FOR INSERT 
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own medical records" 
ON public.medical_records 
FOR UPDATE 
USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their own medical records" 
ON public.medical_records 
FOR DELETE 
USING (auth.uid() = created_by);

-- Admins can view all medical records
CREATE POLICY "Admins can view all medical records" 
ON public.medical_records 
FOR SELECT 
USING (get_current_user_role() = 'admin');

-- Admins can manage all medical records
CREATE POLICY "Admins can manage all medical records" 
ON public.medical_records 
FOR ALL 
USING (get_current_user_role() = 'admin');

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_medical_records_updated_at
BEFORE UPDATE ON public.medical_records
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for better performance
CREATE INDEX idx_medical_records_created_by ON public.medical_records(created_by);
CREATE INDEX idx_medical_records_created_at ON public.medical_records(created_at);