-- Create sequence for patient numbers starting from 1000000
CREATE SEQUENCE patient_number_seq START WITH 1000000 INCREMENT BY 1;

-- Add new patient_number column to patients table
ALTER TABLE public.patients ADD COLUMN patient_number INTEGER;

-- Set patient_number for existing records (if any exist)
UPDATE public.patients 
SET patient_number = nextval('patient_number_seq')
WHERE patient_number IS NULL;

-- Make patient_number NOT NULL and set default
ALTER TABLE public.patients ALTER COLUMN patient_number SET NOT NULL;
ALTER TABLE public.patients ALTER COLUMN patient_number SET DEFAULT nextval('patient_number_seq');

-- Add unique constraint on patient_number
ALTER TABLE public.patients ADD CONSTRAINT patients_patient_number_unique UNIQUE (patient_number);

-- Create mapping table to track old UUID to new patient_number for foreign key updates
CREATE TEMP TABLE patient_id_mapping AS
SELECT id as old_uuid_id, patient_number as new_patient_number
FROM public.patients;

-- Add new patient_number columns to related tables
ALTER TABLE public.patient_treatments ADD COLUMN new_patient_id INTEGER;
ALTER TABLE public.patient_drug_treatments ADD COLUMN new_patient_id INTEGER;
ALTER TABLE public.follow_up_records ADD COLUMN new_patient_id INTEGER;

-- Update foreign key references using the mapping
UPDATE public.patient_treatments 
SET new_patient_id = (
    SELECT new_patient_number 
    FROM patient_id_mapping 
    WHERE old_uuid_id = patient_treatments.patient_id
);

UPDATE public.patient_drug_treatments 
SET new_patient_id = (
    SELECT new_patient_number 
    FROM patient_id_mapping 
    WHERE old_uuid_id = patient_drug_treatments.patient_id
);

UPDATE public.follow_up_records 
SET new_patient_id = (
    SELECT new_patient_number 
    FROM patient_id_mapping 
    WHERE old_uuid_id = follow_up_records.patient_id
);

-- Drop old foreign key columns and rename new ones
ALTER TABLE public.patient_treatments DROP COLUMN patient_id;
ALTER TABLE public.patient_treatments RENAME COLUMN new_patient_id TO patient_id;

ALTER TABLE public.patient_drug_treatments DROP COLUMN patient_id;
ALTER TABLE public.patient_drug_treatments RENAME COLUMN new_patient_id TO patient_id;

ALTER TABLE public.follow_up_records DROP COLUMN patient_id;
ALTER TABLE public.follow_up_records RENAME COLUMN new_patient_id TO patient_id;

-- Make new foreign key columns NOT NULL
ALTER TABLE public.patient_treatments ALTER COLUMN patient_id SET NOT NULL;
ALTER TABLE public.patient_drug_treatments ALTER COLUMN patient_id SET NOT NULL;

-- Add foreign key constraints
ALTER TABLE public.patient_treatments 
ADD CONSTRAINT patient_treatments_patient_id_fkey 
FOREIGN KEY (patient_id) REFERENCES public.patients(patient_number) ON DELETE CASCADE;

ALTER TABLE public.patient_drug_treatments 
ADD CONSTRAINT patient_drug_treatments_patient_id_fkey 
FOREIGN KEY (patient_id) REFERENCES public.patients(patient_number) ON DELETE CASCADE;

ALTER TABLE public.follow_up_records 
ADD CONSTRAINT follow_up_records_patient_id_fkey 
FOREIGN KEY (patient_id) REFERENCES public.patients(patient_number) ON DELETE SET NULL;

-- Drop the old UUID primary key and make patient_number the primary key
ALTER TABLE public.patients DROP CONSTRAINT patients_pkey;
ALTER TABLE public.patients DROP COLUMN id;
ALTER TABLE public.patients ADD PRIMARY KEY (patient_number);

-- Create index for better performance
CREATE INDEX idx_patients_patient_number ON public.patients(patient_number);