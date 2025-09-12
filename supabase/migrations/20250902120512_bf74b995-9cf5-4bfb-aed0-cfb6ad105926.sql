-- Create initial admin account with user_id set to id value
DO $$
DECLARE
    admin_id uuid := gen_random_uuid();
BEGIN
    INSERT INTO user_profiles (id, user_id, username, full_name, email, role, is_active)
    VALUES (admin_id, admin_id, 'admin', 'System Administrator', 'admin@system.local', 'admin', true);

    -- Set admin password
    PERFORM set_user_password(admin_id, 'admin123');
END $$;