-- Create user role enum
CREATE TYPE public.user_role AS ENUM ('admin', 'user');

-- Create profiles table for user management
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- RLS policies for profiles
CREATE POLICY "Users can view their own profile" 
ON public.profiles FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = id);

-- Security definer function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = user_id AND role = 'admin'
  );
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Update medical_records RLS policies
DROP POLICY IF EXISTS "Users can view their own records" ON public.medical_records;
DROP POLICY IF EXISTS "Users can create their own records" ON public.medical_records;
DROP POLICY IF EXISTS "Users can update their own records" ON public.medical_records;
DROP POLICY IF EXISTS "Users can delete their own records" ON public.medical_records;

-- Allow public inserts for anonymous form submissions
CREATE POLICY "Allow public insert for anonymous forms" 
ON public.medical_records FOR INSERT 
WITH CHECK (true);

-- Admin can view all records
CREATE POLICY "Admins can view all records" 
ON public.medical_records FOR SELECT 
USING (public.is_admin());

-- Admin can update all records
CREATE POLICY "Admins can update all records" 
ON public.medical_records FOR UPDATE 
USING (public.is_admin());

-- Admin can delete all records
CREATE POLICY "Admins can delete all records" 
ON public.medical_records FOR DELETE 
USING (public.is_admin());

-- Function to create profile automatically on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role)
  VALUES (NEW.id, NEW.email, 'user');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Update profiles updated_at trigger
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();