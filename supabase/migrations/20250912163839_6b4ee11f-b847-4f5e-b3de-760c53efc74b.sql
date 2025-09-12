-- Create the medical_records table to match the form structure
CREATE TABLE public.medical_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  name TEXT NOT NULL,
  gender TEXT NOT NULL,
  birth_date TEXT NOT NULL,
  age INTEGER NOT NULL,
  nationality TEXT NOT NULL,
  birth_place TEXT NOT NULL,
  native_place TEXT NOT NULL,
  ethnicity TEXT NOT NULL,
  id_number TEXT NOT NULL,
  occupation TEXT NOT NULL,
  marital_status TEXT NOT NULL,
  contact_address TEXT NOT NULL,
  phone TEXT NOT NULL,
  postal_code TEXT NOT NULL,
  work_unit TEXT NOT NULL,
  admission_method TEXT NOT NULL,
  admission_date TEXT NOT NULL,
  admission_department TEXT NOT NULL,
  bed_number TEXT NOT NULL,
  discharge_date TEXT NOT NULL,
  actual_stay_days INTEGER NOT NULL,
  -- JSONB fields for complex nested data
  diagnosis_info JSONB DEFAULT '{
    "outpatient_diagnosis": "",
    "outpatient_disease_code": "",
    "main_diagnosis": "",
    "main_disease_code": "",
    "admission_condition": "",
    "other_diagnoses": []
  }'::jsonb,
  pathology_info JSONB DEFAULT '{
    "external_cause": "",
    "external_cause_code": "",
    "pathology_diagnosis": "",
    "disease_code": "",
    "pathology_code": "",
    "pathology_number": "",
    "drug_allergy": "",
    "allergy_drugs": "",
    "autopsy": "",
    "blood_type": "",
    "rh": ""
  }'::jsonb,
  medical_personnel JSONB DEFAULT '{
    "department_director": "",
    "attending_physician": "",
    "treating_physician": "",
    "resident_physician": "",
    "intern_physician": "",
    "responsible_nurse": "",
    "fellow_physician": "",
    "medical_student": "",
    "coder": ""
  }'::jsonb,
  fees JSONB DEFAULT '{
    "total_cost": "",
    "total_payment": "",
    "self_payment": "",
    "other_payments": ""
  }'::jsonb,
  quality_control JSONB DEFAULT '{
    "admission_note_within_24h": "",
    "senior_physician_rounds_within_48h": "",
    "discharge_note_within_24h": "",
    "follow_diagnosis_specifications": "",
    "follow_clinical_pathway": "",
    "single_disease_type": "",
    "rescue_situations": "",
    "critical_patient_rescue_success": "",
    "surgery_complications": "",
    "obstetric_complications": "",
    "hospital_infection": "",
    "pathology_diagnosis": "",
    "drug_sensitivity": "",
    "scientific_research": "",
    "teaching_medical_university": ""
  }'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.medical_records ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own records" 
ON public.medical_records 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own records" 
ON public.medical_records 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own records" 
ON public.medical_records 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own records" 
ON public.medical_records 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_medical_records_updated_at
  BEFORE UPDATE ON public.medical_records
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();