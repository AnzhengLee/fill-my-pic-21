-- Create initial admin account
INSERT INTO user_profiles (id, username, full_name, email, role, is_active)
VALUES (gen_random_uuid(), 'admin', 'System Administrator', 'admin@system.local', 'admin', true);

-- Set admin password
SELECT set_user_password(
  (SELECT id FROM user_profiles WHERE username = 'admin'), 
  'admin123'
);