-- Fix pgcrypto access for authentication functions
-- Drop existing functions if they exist
DROP FUNCTION IF EXISTS public.verify_user_login(text, text);
DROP FUNCTION IF EXISTS public.set_user_password(uuid, text);

-- Recreate verify_user_login function with proper search path
CREATE OR REPLACE FUNCTION public.verify_user_login(input_username text, input_password text)
RETURNS TABLE(user_id uuid, full_name text, email text, role text, is_active boolean)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        up.id,
        up.full_name,
        up.email,
        up.role,
        up.is_active
    FROM user_profiles up
    WHERE up.username = input_username 
    AND up.password_hash = crypt(input_password, up.salt)
    AND up.is_active = true;
END;
$$;

-- Recreate set_user_password function with proper search path
CREATE OR REPLACE FUNCTION public.set_user_password(input_user_id uuid, input_password text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
DECLARE
    salt_value TEXT;
BEGIN
    -- Generate salt using pgcrypto
    salt_value := gen_salt('bf', 10);
    
    -- Update password hash and salt
    UPDATE user_profiles 
    SET 
        password_hash = crypt(input_password, salt_value),
        salt = salt_value
    WHERE id = input_user_id;
    
    RETURN FOUND;
END;
$$;

-- Ensure admin user exists with proper password
DO $$
DECLARE
    admin_exists boolean;
    admin_id uuid;
    salt_val text;
BEGIN
    -- Check if admin user already exists
    SELECT EXISTS(SELECT 1 FROM user_profiles WHERE username = 'admin') INTO admin_exists;
    
    IF NOT admin_exists THEN
        -- Generate new admin ID and salt
        admin_id := gen_random_uuid();
        salt_val := gen_salt('bf', 10);
        
        -- Create admin user
        INSERT INTO user_profiles (id, user_id, username, full_name, email, role, is_active, password_hash, salt)
        VALUES (
            admin_id, 
            admin_id, 
            'admin', 
            'System Administrator', 
            'admin@system.local', 
            'admin', 
            true,
            crypt('admin123', salt_val),
            salt_val
        );
    ELSE
        -- Update existing admin user password
        SELECT id INTO admin_id FROM user_profiles WHERE username = 'admin' LIMIT 1;
        salt_val := gen_salt('bf', 10);
        
        UPDATE user_profiles 
        SET 
            password_hash = crypt('admin123', salt_val),
            salt = salt_val
        WHERE id = admin_id;
    END IF;
END $$;