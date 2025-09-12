-- Enable pgcrypto extension for password hashing
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Remove foreign key constraint for custom authentication
ALTER TABLE user_profiles DROP CONSTRAINT IF EXISTS user_profiles_user_id_fkey;

-- Create initial admin account with direct password hashing
DO $$
DECLARE
    admin_id uuid := gen_random_uuid();
    salt_val text := '$2a$10$abcdefghijklmnopqrstuv';  -- Fixed salt for initial admin
BEGIN
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
END $$;