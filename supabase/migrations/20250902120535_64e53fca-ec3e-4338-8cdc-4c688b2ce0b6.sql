-- Remove foreign key constraint for custom authentication
ALTER TABLE user_profiles DROP CONSTRAINT IF EXISTS user_profiles_user_id_fkey;

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