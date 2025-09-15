-- Add username field to profiles table
ALTER TABLE public.profiles 
ADD COLUMN username text UNIQUE;

-- Update existing profiles to have a username (if any exist)
-- This is safe since we know the table is currently empty
UPDATE public.profiles 
SET username = 'admin' 
WHERE email = 'admin@system.local';

-- Create a function to map username to email for authentication
CREATE OR REPLACE FUNCTION public.get_email_by_username(input_username text)
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT email FROM public.profiles WHERE username = input_username LIMIT 1;
$$;