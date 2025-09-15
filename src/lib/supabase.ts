import { createClient } from '@supabase/supabase-js'

const supabaseUrl = "https://mfjrbbhftoqybpgwbymc.supabase.co"
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1manJiYmhmdG9xeWJwZ3dieW1jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY4MTI2NTUsImV4cCI6MjA3MjM4ODY1NX0.sFZ8glG_M2uWzPQdc0yg94MTCg9Zfx-7RUTawCEj6wI"

// Helper function to check if Supabase is configured
export const isSupabaseConfigured = () => {
  return !!(supabaseUrl && supabaseAnonKey)
}

// Create and export the main supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
})

// Database types for medical records
export interface MedicalRecord {
  id: string
  name: string
  gender: string
  age: number
  birth_date: string
  nationality: string
  ethnicity: string
  id_number: string
  occupation: string
  marital_status: string
  birth_place: string
  native_place: string
  contact_address: string
  phone: string
  postal_code: string
  work_unit: string
  admission_method: string
  admission_date: string
  admission_department: string
  bed_number: string
  discharge_date: string
  actual_stay_days: number
  diagnosis_info: Record<string, any>
  pathology_info: Record<string, any>
  medical_personnel: Record<string, any>
  quality_control: Record<string, any>
  created_at: string
  updated_at: string
  created_by: string
}