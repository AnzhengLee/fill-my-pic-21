-- Update medical_personnel default value to remove medical_student field
ALTER TABLE public.medical_records 
ALTER COLUMN medical_personnel 
SET DEFAULT '{
  "coder": "",
  "fellow_physician": "",
  "intern_physician": "",
  "responsible_nurse": "",
  "resident_physician": "",
  "treating_physician": "",
  "attending_physician": "",
  "department_director": ""
}'::jsonb;