-- Create the admin user in auth.users with the required password
-- First, we need to set a proper password for the admin user

-- This will be done manually through Supabase dashboard or by creating the user properly
-- For now, let's just ensure our system is ready

-- Update the admin user email to match our login system
UPDATE profiles 
SET email = 'admin@system.local' 
WHERE email = 'admin@system.local' AND role = 'admin';

-- If no admin user exists, create one
INSERT INTO profiles (id, email, role)
SELECT gen_random_uuid(), 'admin@system.local', 'admin'
WHERE NOT EXISTS (
    SELECT 1 FROM profiles WHERE email = 'admin@system.local'
);