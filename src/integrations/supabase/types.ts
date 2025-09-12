export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      follow_up_records: {
        Row: {
          age: number
          clinical_diagnosis: string | null
          contact_phone: string | null
          created_at: string
          created_by: string | null
          daily_water_intake: number | null
          dietary_preferences: string | null
          family_stone_history: boolean | null
          first_uti_time: string | null
          gender: string
          height: number | null
          hospital_id: string | null
          hydronephrosis_degree: string | null
          id: string
          lifestyle_habits: string | null
          medical_history: string | null
          name: string
          occupation: string | null
          other_info: string | null
          patient_id: number | null
          post_op_alt: number | null
          post_op_ast: number | null
          post_op_creatinine: number | null
          post_op_ggt: number | null
          post_op_hemoglobin: number | null
          post_op_platelets: number | null
          post_op_urea: number | null
          post_op_uric_acid: number | null
          post_op_urine_culture: string | null
          post_op_urine_ngs_available: boolean | null
          post_op_urine_ngs_result: string | null
          post_op_urine_nit: string | null
          post_op_urine_ph: number | null
          post_op_urine_wbc: string | null
          post_op_white_blood_cells: number | null
          pre_op_alt: number | null
          pre_op_ast: number | null
          pre_op_creatinine: number | null
          pre_op_ggt: number | null
          pre_op_hemoglobin: number | null
          pre_op_platelets: number | null
          pre_op_urea: number | null
          pre_op_uric_acid: number | null
          pre_op_urine_culture: string | null
          pre_op_urine_ngs_available: boolean | null
          pre_op_urine_ngs_result: string | null
          pre_op_urine_nit: string | null
          pre_op_urine_ph: number | null
          pre_op_urine_wbc: string | null
          pre_op_white_blood_cells: number | null
          previous_infection_medications: string | null
          previous_uti_pathogens: string | null
          recurrent_uti: boolean | null
          stone_bacterial_culture: string | null
          stone_composition: string | null
          stone_discovery_method: string | null
          stone_location: string | null
          stone_ngs_available: boolean | null
          stone_ngs_result: string | null
          stone_size: number | null
          submit_time: string | null
          surgery_method: string | null
          surgery_time: string | null
          updated_at: string
          weight: number | null
        }
        Insert: {
          age: number
          clinical_diagnosis?: string | null
          contact_phone?: string | null
          created_at?: string
          created_by?: string | null
          daily_water_intake?: number | null
          dietary_preferences?: string | null
          family_stone_history?: boolean | null
          first_uti_time?: string | null
          gender: string
          height?: number | null
          hospital_id?: string | null
          hydronephrosis_degree?: string | null
          id?: string
          lifestyle_habits?: string | null
          medical_history?: string | null
          name: string
          occupation?: string | null
          other_info?: string | null
          patient_id?: number | null
          post_op_alt?: number | null
          post_op_ast?: number | null
          post_op_creatinine?: number | null
          post_op_ggt?: number | null
          post_op_hemoglobin?: number | null
          post_op_platelets?: number | null
          post_op_urea?: number | null
          post_op_uric_acid?: number | null
          post_op_urine_culture?: string | null
          post_op_urine_ngs_available?: boolean | null
          post_op_urine_ngs_result?: string | null
          post_op_urine_nit?: string | null
          post_op_urine_ph?: number | null
          post_op_urine_wbc?: string | null
          post_op_white_blood_cells?: number | null
          pre_op_alt?: number | null
          pre_op_ast?: number | null
          pre_op_creatinine?: number | null
          pre_op_ggt?: number | null
          pre_op_hemoglobin?: number | null
          pre_op_platelets?: number | null
          pre_op_urea?: number | null
          pre_op_uric_acid?: number | null
          pre_op_urine_culture?: string | null
          pre_op_urine_ngs_available?: boolean | null
          pre_op_urine_ngs_result?: string | null
          pre_op_urine_nit?: string | null
          pre_op_urine_ph?: number | null
          pre_op_urine_wbc?: string | null
          pre_op_white_blood_cells?: number | null
          previous_infection_medications?: string | null
          previous_uti_pathogens?: string | null
          recurrent_uti?: boolean | null
          stone_bacterial_culture?: string | null
          stone_composition?: string | null
          stone_discovery_method?: string | null
          stone_location?: string | null
          stone_ngs_available?: boolean | null
          stone_ngs_result?: string | null
          stone_size?: number | null
          submit_time?: string | null
          surgery_method?: string | null
          surgery_time?: string | null
          updated_at?: string
          weight?: number | null
        }
        Update: {
          age?: number
          clinical_diagnosis?: string | null
          contact_phone?: string | null
          created_at?: string
          created_by?: string | null
          daily_water_intake?: number | null
          dietary_preferences?: string | null
          family_stone_history?: boolean | null
          first_uti_time?: string | null
          gender?: string
          height?: number | null
          hospital_id?: string | null
          hydronephrosis_degree?: string | null
          id?: string
          lifestyle_habits?: string | null
          medical_history?: string | null
          name?: string
          occupation?: string | null
          other_info?: string | null
          patient_id?: number | null
          post_op_alt?: number | null
          post_op_ast?: number | null
          post_op_creatinine?: number | null
          post_op_ggt?: number | null
          post_op_hemoglobin?: number | null
          post_op_platelets?: number | null
          post_op_urea?: number | null
          post_op_uric_acid?: number | null
          post_op_urine_culture?: string | null
          post_op_urine_ngs_available?: boolean | null
          post_op_urine_ngs_result?: string | null
          post_op_urine_nit?: string | null
          post_op_urine_ph?: number | null
          post_op_urine_wbc?: string | null
          post_op_white_blood_cells?: number | null
          pre_op_alt?: number | null
          pre_op_ast?: number | null
          pre_op_creatinine?: number | null
          pre_op_ggt?: number | null
          pre_op_hemoglobin?: number | null
          pre_op_platelets?: number | null
          pre_op_urea?: number | null
          pre_op_uric_acid?: number | null
          pre_op_urine_culture?: string | null
          pre_op_urine_ngs_available?: boolean | null
          pre_op_urine_ngs_result?: string | null
          pre_op_urine_nit?: string | null
          pre_op_urine_ph?: number | null
          pre_op_urine_wbc?: string | null
          pre_op_white_blood_cells?: number | null
          previous_infection_medications?: string | null
          previous_uti_pathogens?: string | null
          recurrent_uti?: boolean | null
          stone_bacterial_culture?: string | null
          stone_composition?: string | null
          stone_discovery_method?: string | null
          stone_location?: string | null
          stone_ngs_available?: boolean | null
          stone_ngs_result?: string | null
          stone_size?: number | null
          submit_time?: string | null
          surgery_method?: string | null
          surgery_time?: string | null
          updated_at?: string
          weight?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "follow_up_records_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["patient_number"]
          },
        ]
      }
      follow_up_visits: {
        Row: {
          adverse_reaction: string | null
          adverse_reaction_details: string | null
          alt: number | null
          ast: number | null
          created_at: string
          creatinine: number | null
          diagnosis: string | null
          follow_up_record_id: string
          ggt: number | null
          hemoglobin: number | null
          id: string
          imaging_method: string[] | null
          imaging_results: string | null
          lab_results: string | null
          medication_compliance: string | null
          medication_dosage: string | null
          medication_duration: string | null
          medication_info: string | null
          next_treatment_plan: string | null
          next_visit_date: string | null
          notes: string | null
          physical_exam: string | null
          recurrence_status: boolean | null
          recurrence_stone_size: number | null
          symptoms: string | null
          treatment_plan: string | null
          urine_culture: string | null
          urine_nit: string | null
          urine_ph: number | null
          urine_wbc: string | null
          visit_date: string | null
          visit_method: string | null
          visit_number: number
          wbc: number | null
        }
        Insert: {
          adverse_reaction?: string | null
          adverse_reaction_details?: string | null
          alt?: number | null
          ast?: number | null
          created_at?: string
          creatinine?: number | null
          diagnosis?: string | null
          follow_up_record_id: string
          ggt?: number | null
          hemoglobin?: number | null
          id?: string
          imaging_method?: string[] | null
          imaging_results?: string | null
          lab_results?: string | null
          medication_compliance?: string | null
          medication_dosage?: string | null
          medication_duration?: string | null
          medication_info?: string | null
          next_treatment_plan?: string | null
          next_visit_date?: string | null
          notes?: string | null
          physical_exam?: string | null
          recurrence_status?: boolean | null
          recurrence_stone_size?: number | null
          symptoms?: string | null
          treatment_plan?: string | null
          urine_culture?: string | null
          urine_nit?: string | null
          urine_ph?: number | null
          urine_wbc?: string | null
          visit_date?: string | null
          visit_method?: string | null
          visit_number: number
          wbc?: number | null
        }
        Update: {
          adverse_reaction?: string | null
          adverse_reaction_details?: string | null
          alt?: number | null
          ast?: number | null
          created_at?: string
          creatinine?: number | null
          diagnosis?: string | null
          follow_up_record_id?: string
          ggt?: number | null
          hemoglobin?: number | null
          id?: string
          imaging_method?: string[] | null
          imaging_results?: string | null
          lab_results?: string | null
          medication_compliance?: string | null
          medication_dosage?: string | null
          medication_duration?: string | null
          medication_info?: string | null
          next_treatment_plan?: string | null
          next_visit_date?: string | null
          notes?: string | null
          physical_exam?: string | null
          recurrence_status?: boolean | null
          recurrence_stone_size?: number | null
          symptoms?: string | null
          treatment_plan?: string | null
          urine_culture?: string | null
          urine_nit?: string | null
          urine_ph?: number | null
          urine_wbc?: string | null
          visit_date?: string | null
          visit_method?: string | null
          visit_number?: number
          wbc?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "follow_up_visits_follow_up_record_id_fkey"
            columns: ["follow_up_record_id"]
            isOneToOne: false
            referencedRelation: "follow_up_records"
            referencedColumns: ["id"]
          },
        ]
      }
      medical_records: {
        Row: {
          admission_info: Json | null
          age: number | null
          birth_date: string | null
          birth_place: string | null
          contact_person: Json | null
          created_at: string
          created_by: string | null
          current_address: string | null
          diagnosis_info: Json | null
          discharge_info: Json | null
          ethnicity: string | null
          gender: string | null
          household_address: string | null
          household_postal_code: string | null
          id: string
          id_number: string | null
          marital_status: string | null
          medical_personnel: Json | null
          name: string | null
          nationality: string | null
          native_place: string | null
          occupation: string | null
          pathology_info: Json | null
          phone: string | null
          postal_code: string | null
          quality_control: Json | null
          updated_at: string
          work_phone: string | null
          work_postal_code: string | null
          work_unit: string | null
        }
        Insert: {
          admission_info?: Json | null
          age?: number | null
          birth_date?: string | null
          birth_place?: string | null
          contact_person?: Json | null
          created_at?: string
          created_by?: string | null
          current_address?: string | null
          diagnosis_info?: Json | null
          discharge_info?: Json | null
          ethnicity?: string | null
          gender?: string | null
          household_address?: string | null
          household_postal_code?: string | null
          id?: string
          id_number?: string | null
          marital_status?: string | null
          medical_personnel?: Json | null
          name?: string | null
          nationality?: string | null
          native_place?: string | null
          occupation?: string | null
          pathology_info?: Json | null
          phone?: string | null
          postal_code?: string | null
          quality_control?: Json | null
          updated_at?: string
          work_phone?: string | null
          work_postal_code?: string | null
          work_unit?: string | null
        }
        Update: {
          admission_info?: Json | null
          age?: number | null
          birth_date?: string | null
          birth_place?: string | null
          contact_person?: Json | null
          created_at?: string
          created_by?: string | null
          current_address?: string | null
          diagnosis_info?: Json | null
          discharge_info?: Json | null
          ethnicity?: string | null
          gender?: string | null
          household_address?: string | null
          household_postal_code?: string | null
          id?: string
          id_number?: string | null
          marital_status?: string | null
          medical_personnel?: Json | null
          name?: string | null
          nationality?: string | null
          native_place?: string | null
          occupation?: string | null
          pathology_info?: Json | null
          phone?: string | null
          postal_code?: string | null
          quality_control?: Json | null
          updated_at?: string
          work_phone?: string | null
          work_postal_code?: string | null
          work_unit?: string | null
        }
        Relationships: []
      }
      nursing_follow_ups: {
        Row: {
          adverse_reaction: boolean | null
          adverse_reaction_detail: string | null
          avoided_food: string | null
          care_type: string | null
          created_at: string
          diet_preference: boolean | null
          discharge_medication: boolean | null
          follow_up_method: string[] | null
          follow_up_plan: string | null
          follow_up_record_id: string
          id: string
          lifestyle_guidance: string | null
          medication_dosage: string | null
          medication_guidance: string | null
          medication_name: string | null
          notes: string | null
          nurse_signature: string | null
          nursing_date: string | null
          nursing_measures: string | null
          patient_condition: string | null
          patient_education: string | null
          preferred_food: string | null
          psychological_status: string | null
          sleep_condition: string | null
          sleep_medication: string | null
          social_support: string | null
          stone_passage: boolean | null
          timely_medication: boolean | null
          urine_color: string | null
          urine_output: boolean | null
          water_intake: number | null
        }
        Insert: {
          adverse_reaction?: boolean | null
          adverse_reaction_detail?: string | null
          avoided_food?: string | null
          care_type?: string | null
          created_at?: string
          diet_preference?: boolean | null
          discharge_medication?: boolean | null
          follow_up_method?: string[] | null
          follow_up_plan?: string | null
          follow_up_record_id: string
          id?: string
          lifestyle_guidance?: string | null
          medication_dosage?: string | null
          medication_guidance?: string | null
          medication_name?: string | null
          notes?: string | null
          nurse_signature?: string | null
          nursing_date?: string | null
          nursing_measures?: string | null
          patient_condition?: string | null
          patient_education?: string | null
          preferred_food?: string | null
          psychological_status?: string | null
          sleep_condition?: string | null
          sleep_medication?: string | null
          social_support?: string | null
          stone_passage?: boolean | null
          timely_medication?: boolean | null
          urine_color?: string | null
          urine_output?: boolean | null
          water_intake?: number | null
        }
        Update: {
          adverse_reaction?: boolean | null
          adverse_reaction_detail?: string | null
          avoided_food?: string | null
          care_type?: string | null
          created_at?: string
          diet_preference?: boolean | null
          discharge_medication?: boolean | null
          follow_up_method?: string[] | null
          follow_up_plan?: string | null
          follow_up_record_id?: string
          id?: string
          lifestyle_guidance?: string | null
          medication_dosage?: string | null
          medication_guidance?: string | null
          medication_name?: string | null
          notes?: string | null
          nurse_signature?: string | null
          nursing_date?: string | null
          nursing_measures?: string | null
          patient_condition?: string | null
          patient_education?: string | null
          preferred_food?: string | null
          psychological_status?: string | null
          sleep_condition?: string | null
          sleep_medication?: string | null
          social_support?: string | null
          stone_passage?: boolean | null
          timely_medication?: boolean | null
          urine_color?: string | null
          urine_output?: boolean | null
          water_intake?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "nursing_follow_ups_follow_up_record_id_fkey"
            columns: ["follow_up_record_id"]
            isOneToOne: false
            referencedRelation: "follow_up_records"
            referencedColumns: ["id"]
          },
        ]
      }
      patient_drug_treatments: {
        Row: {
          created_at: string
          dosage: string | null
          duration: string | null
          end_time: string | null
          frequency: string | null
          id: string
          medication_name: string | null
          medication_regimen: string | null
          notes: string | null
          patient_id: number
          start_time: string | null
          treatment_effect: string | null
        }
        Insert: {
          created_at?: string
          dosage?: string | null
          duration?: string | null
          end_time?: string | null
          frequency?: string | null
          id?: string
          medication_name?: string | null
          medication_regimen?: string | null
          notes?: string | null
          patient_id: number
          start_time?: string | null
          treatment_effect?: string | null
        }
        Update: {
          created_at?: string
          dosage?: string | null
          duration?: string | null
          end_time?: string | null
          frequency?: string | null
          id?: string
          medication_name?: string | null
          medication_regimen?: string | null
          notes?: string | null
          patient_id?: number
          start_time?: string | null
          treatment_effect?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "patient_drug_treatments_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["patient_number"]
          },
        ]
      }
      patient_treatments: {
        Row: {
          anesthesia_method: string | null
          complications: string | null
          created_at: string
          id: string
          notes: string | null
          patient_id: number
          stone_laterality: string | null
          stone_location: string | null
          surgery_method: string | null
          treatment_effect: string | null
          treatment_time: string | null
        }
        Insert: {
          anesthesia_method?: string | null
          complications?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          patient_id: number
          stone_laterality?: string | null
          stone_location?: string | null
          surgery_method?: string | null
          treatment_effect?: string | null
          treatment_time?: string | null
        }
        Update: {
          anesthesia_method?: string | null
          complications?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          patient_id?: number
          stone_laterality?: string | null
          stone_location?: string | null
          surgery_method?: string | null
          treatment_effect?: string | null
          treatment_time?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "patient_treatments_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["patient_number"]
          },
        ]
      }
      patients: {
        Row: {
          age: number
          allergy_history: string | null
          birth_date: string | null
          blood_4hne_content: string | null
          blood_routine: string | null
          coagulation: string | null
          contact_phone: string | null
          created_at: string
          created_by: string | null
          electrolytes: string | null
          enrollment_age: number | null
          enrollment_ct_value: string | null
          enrollment_hydronephrosis: string | null
          enrollment_stone_confirmed: boolean | null
          enrollment_stone_location: string | null
          enrollment_stone_multiple: boolean | null
          enrollment_stone_size: string | null
          family_history: string | null
          gender: string
          height: number | null
          id_number: string | null
          kidney_function: string | null
          liver_function: string | null
          medical_history: string | null
          name: string
          other_info: string | null
          patient_number: number
          stone_composition: string | null
          stone_composition_analysis: string | null
          stone_first_discovery_time: string | null
          stone_location: string | null
          stone_size: string | null
          submit_time: string | null
          updated_at: string
          urine_culture: string | null
          urine_cystine_concentration: string | null
          urine_mda_content: string | null
          urine_routine: string | null
          weight: number | null
        }
        Insert: {
          age: number
          allergy_history?: string | null
          birth_date?: string | null
          blood_4hne_content?: string | null
          blood_routine?: string | null
          coagulation?: string | null
          contact_phone?: string | null
          created_at?: string
          created_by?: string | null
          electrolytes?: string | null
          enrollment_age?: number | null
          enrollment_ct_value?: string | null
          enrollment_hydronephrosis?: string | null
          enrollment_stone_confirmed?: boolean | null
          enrollment_stone_location?: string | null
          enrollment_stone_multiple?: boolean | null
          enrollment_stone_size?: string | null
          family_history?: string | null
          gender: string
          height?: number | null
          id_number?: string | null
          kidney_function?: string | null
          liver_function?: string | null
          medical_history?: string | null
          name: string
          other_info?: string | null
          patient_number?: number
          stone_composition?: string | null
          stone_composition_analysis?: string | null
          stone_first_discovery_time?: string | null
          stone_location?: string | null
          stone_size?: string | null
          submit_time?: string | null
          updated_at?: string
          urine_culture?: string | null
          urine_cystine_concentration?: string | null
          urine_mda_content?: string | null
          urine_routine?: string | null
          weight?: number | null
        }
        Update: {
          age?: number
          allergy_history?: string | null
          birth_date?: string | null
          blood_4hne_content?: string | null
          blood_routine?: string | null
          coagulation?: string | null
          contact_phone?: string | null
          created_at?: string
          created_by?: string | null
          electrolytes?: string | null
          enrollment_age?: number | null
          enrollment_ct_value?: string | null
          enrollment_hydronephrosis?: string | null
          enrollment_stone_confirmed?: boolean | null
          enrollment_stone_location?: string | null
          enrollment_stone_multiple?: boolean | null
          enrollment_stone_size?: string | null
          family_history?: string | null
          gender?: string
          height?: number | null
          id_number?: string | null
          kidney_function?: string | null
          liver_function?: string | null
          medical_history?: string | null
          name?: string
          other_info?: string | null
          patient_number?: number
          stone_composition?: string | null
          stone_composition_analysis?: string | null
          stone_first_discovery_time?: string | null
          stone_location?: string | null
          stone_size?: string | null
          submit_time?: string | null
          updated_at?: string
          urine_culture?: string | null
          urine_cystine_concentration?: string | null
          urine_mda_content?: string | null
          urine_routine?: string | null
          weight?: number | null
        }
        Relationships: []
      }
      user_permissions: {
        Row: {
          created_at: string
          id: string
          permission: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          permission: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          permission?: string
          user_id?: string
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          created_at: string
          email: string
          full_name: string
          id: string
          is_active: boolean
          last_login: string | null
          password_hash: string | null
          role: string
          salt: string | null
          updated_at: string
          user_id: string
          username: string | null
        }
        Insert: {
          created_at?: string
          email: string
          full_name: string
          id?: string
          is_active?: boolean
          last_login?: string | null
          password_hash?: string | null
          role?: string
          salt?: string | null
          updated_at?: string
          user_id: string
          username?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          is_active?: boolean
          last_login?: string | null
          password_hash?: string | null
          role?: string
          salt?: string | null
          updated_at?: string
          user_id?: string
          username?: string | null
        }
        Relationships: []
      }
      user_sessions: {
        Row: {
          created_at: string | null
          expires_at: string
          id: string
          last_accessed: string | null
          session_token: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          expires_at: string
          id?: string
          last_accessed?: string | null
          session_token: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          expires_at?: string
          id?: string
          last_accessed?: string | null
          session_token?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_user_session: {
        Args: { input_user_id: string }
        Returns: string
      }
      delete_user_session: {
        Args: { input_session_token: string }
        Returns: boolean
      }
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      has_permission: {
        Args: { permission_name: string }
        Returns: boolean
      }
      set_user_password: {
        Args: { input_password: string; input_user_id: string }
        Returns: boolean
      }
      update_last_login: {
        Args: { user_uuid: string }
        Returns: undefined
      }
      verify_session: {
        Args: { input_session_token: string }
        Returns: {
          email: string
          full_name: string
          is_active: boolean
          role: string
          user_id: string
        }[]
      }
      verify_user_login: {
        Args: { input_password: string; input_username: string }
        Returns: {
          email: string
          full_name: string
          is_active: boolean
          role: string
          user_id: string
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
