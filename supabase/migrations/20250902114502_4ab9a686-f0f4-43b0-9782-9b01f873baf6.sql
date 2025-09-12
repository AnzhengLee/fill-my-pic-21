-- The users table was created but not used in the application
-- Since we're using user_profiles table instead, disable RLS on users table
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;