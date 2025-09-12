-- Create patients table for basic patient information
CREATE TABLE public.patients (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    
    -- Basic Information
    name TEXT NOT NULL,
    gender TEXT NOT NULL CHECK (gender IN ('男', '女')),
    age INTEGER NOT NULL CHECK (age > 0 AND age < 150),
    height DECIMAL(5,2) CHECK (height > 0 AND height < 300),
    weight DECIMAL(5,2) CHECK (weight > 0 AND weight < 500),
    contact_phone TEXT,
    id_number TEXT,
    
    -- Medical History
    medical_history TEXT,
    family_history TEXT,
    allergy_history TEXT,
    
    -- Stone Information
    stone_location TEXT,
    stone_size TEXT,
    stone_composition TEXT,
    
    -- Laboratory Results
    urine_routine TEXT,
    urine_culture TEXT,
    blood_routine TEXT,
    liver_function TEXT,
    kidney_function TEXT,
    electrolytes TEXT,
    coagulation TEXT,
    
    -- Additional fields
    other_info TEXT,
    
    -- Metadata
    submit_time TIMESTAMP WITH TIME ZONE DEFAULT now(),
    created_by UUID REFERENCES auth.users(id)
);

-- Create patient treatments table for surgery history
CREATE TABLE public.patient_treatments (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    
    treatment_date DATE,
    surgery_method TEXT,
    anesthesia_method TEXT,
    complications TEXT,
    notes TEXT
);

-- Create patient drug treatments table for medication history
CREATE TABLE public.patient_drug_treatments (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    
    drug_name TEXT,
    dosage TEXT,
    frequency TEXT,
    duration TEXT,
    notes TEXT
);

-- Create follow-up records table
CREATE TABLE public.follow_up_records (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    patient_id UUID REFERENCES public.patients(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    
    -- Basic Information (can be independent of patient record)
    name TEXT NOT NULL,
    gender TEXT NOT NULL CHECK (gender IN ('男', '女')),
    age INTEGER NOT NULL CHECK (age > 0 AND age < 150),
    contact_phone TEXT,
    record_id TEXT,
    
    -- Pre-operative Indicators
    pre_op_hemoglobin DECIMAL(5,2),
    pre_op_white_blood_cells DECIMAL(8,2),
    pre_op_platelets DECIMAL(10,2),
    pre_op_creatinine DECIMAL(8,2),
    pre_op_urea DECIMAL(8,2),
    pre_op_uric_acid DECIMAL(8,2),
    
    -- Post-operative Indicators
    post_op_hemoglobin DECIMAL(5,2),
    post_op_white_blood_cells DECIMAL(8,2),
    post_op_platelets DECIMAL(10,2),
    post_op_creatinine DECIMAL(8,2),
    post_op_urea DECIMAL(8,2),
    post_op_uric_acid DECIMAL(8,2),
    
    -- Additional Information
    other_info TEXT,
    
    -- Metadata
    submit_time TIMESTAMP WITH TIME ZONE DEFAULT now(),
    created_by UUID REFERENCES auth.users(id)
);

-- Create follow-up visits table for individual visit records
CREATE TABLE public.follow_up_visits (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    follow_up_record_id UUID NOT NULL REFERENCES public.follow_up_records(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    
    visit_number INTEGER NOT NULL,
    visit_date DATE,
    visit_method TEXT,
    symptoms TEXT,
    physical_exam TEXT,
    lab_results TEXT,
    imaging_results TEXT,
    diagnosis TEXT,
    treatment_plan TEXT,
    next_visit_date DATE,
    notes TEXT
);

-- Create nursing follow-ups table
CREATE TABLE public.nursing_follow_ups (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    follow_up_record_id UUID NOT NULL REFERENCES public.follow_up_records(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    
    nursing_date DATE,
    care_type TEXT,
    patient_condition TEXT,
    nursing_measures TEXT,
    patient_education TEXT,
    medication_guidance TEXT,
    lifestyle_guidance TEXT,
    follow_up_plan TEXT,
    nurse_signature TEXT,
    notes TEXT
);

-- Enable RLS on all tables
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_treatments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_drug_treatments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.follow_up_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.follow_up_visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nursing_follow_ups ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for patients table
CREATE POLICY "Admin users can manage all patients" ON public.patients
FOR ALL USING (get_current_user_role() IN ('admin', 'operator'));

CREATE POLICY "Viewers can read patients" ON public.patients
FOR SELECT USING (get_current_user_role() IN ('admin', 'operator', 'viewer'));

-- Create RLS policies for patient treatments
CREATE POLICY "Admin users can manage patient treatments" ON public.patient_treatments
FOR ALL USING (get_current_user_role() IN ('admin', 'operator'));

CREATE POLICY "Viewers can read patient treatments" ON public.patient_treatments
FOR SELECT USING (get_current_user_role() IN ('admin', 'operator', 'viewer'));

-- Create RLS policies for patient drug treatments
CREATE POLICY "Admin users can manage patient drug treatments" ON public.patient_drug_treatments
FOR ALL USING (get_current_user_role() IN ('admin', 'operator'));

CREATE POLICY "Viewers can read patient drug treatments" ON public.patient_drug_treatments
FOR SELECT USING (get_current_user_role() IN ('admin', 'operator', 'viewer'));

-- Create RLS policies for follow-up records
CREATE POLICY "Admin users can manage follow-up records" ON public.follow_up_records
FOR ALL USING (get_current_user_role() IN ('admin', 'operator'));

CREATE POLICY "Viewers can read follow-up records" ON public.follow_up_records
FOR SELECT USING (get_current_user_role() IN ('admin', 'operator', 'viewer'));

-- Create RLS policies for follow-up visits
CREATE POLICY "Admin users can manage follow-up visits" ON public.follow_up_visits
FOR ALL USING (get_current_user_role() IN ('admin', 'operator'));

CREATE POLICY "Viewers can read follow-up visits" ON public.follow_up_visits
FOR SELECT USING (get_current_user_role() IN ('admin', 'operator', 'viewer'));

-- Create RLS policies for nursing follow-ups
CREATE POLICY "Admin users can manage nursing follow-ups" ON public.nursing_follow_ups
FOR ALL USING (get_current_user_role() IN ('admin', 'operator'));

CREATE POLICY "Viewers can read nursing follow-ups" ON public.nursing_follow_ups
FOR SELECT USING (get_current_user_role() IN ('admin', 'operator', 'viewer'));

-- Create triggers for updated_at columns
CREATE TRIGGER update_patients_updated_at
    BEFORE UPDATE ON public.patients
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_follow_up_records_updated_at
    BEFORE UPDATE ON public.follow_up_records
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_patients_name ON public.patients(name);
CREATE INDEX idx_patients_submit_time ON public.patients(submit_time);
CREATE INDEX idx_patient_treatments_patient_id ON public.patient_treatments(patient_id);
CREATE INDEX idx_patient_drug_treatments_patient_id ON public.patient_drug_treatments(patient_id);
CREATE INDEX idx_follow_up_records_name ON public.follow_up_records(name);
CREATE INDEX idx_follow_up_records_submit_time ON public.follow_up_records(submit_time);
CREATE INDEX idx_follow_up_records_patient_id ON public.follow_up_records(patient_id);
CREATE INDEX idx_follow_up_visits_record_id ON public.follow_up_visits(follow_up_record_id);
CREATE INDEX idx_nursing_follow_ups_record_id ON public.nursing_follow_ups(follow_up_record_id);