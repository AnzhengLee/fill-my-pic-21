-- Enable pgcrypto extension for password hashing
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Remove foreign key constraint for custom authentication
ALTER TABLE user_profiles DROP CONSTRAINT IF EXISTS user_profiles_user_id_fkey;

-- Recreate the password function to ensure pgcrypto context
CREATE OR REPLACE FUNCTION public.set_user_password(input_user_id uuid, input_password text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    salt_value TEXT;
BEGIN
    -- Generate salt using pgcrypto
    salt_value := gen_salt('bf'::text, 10);
    
    -- Update password hash and salt
    UPDATE user_profiles 
    SET 
        password_hash = crypt(input_password, salt_value),
        salt = salt_value
    WHERE id = input_user_id;
    
    RETURN FOUND;
END;
$$;

-- Create initial admin account
DO $$
DECLARE
    admin_id uuid := gen_random_uuid();
BEGIN
    INSERT INTO user_profiles (id, user_id, username, full_name, email, role, is_active)
    VALUES (admin_id, admin_id, 'admin', 'System Administrator', 'admin@system.local', 'admin', true);

    -- Set admin password
    PERFORM set_user_password(admin_id, 'admin123');
END $$;