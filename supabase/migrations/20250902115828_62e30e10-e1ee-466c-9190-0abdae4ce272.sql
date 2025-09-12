-- 修复安全警告：为函数设置正确的search_path

-- 重新创建密码验证函数，添加search_path
CREATE OR REPLACE FUNCTION verify_user_login(input_username TEXT, input_password TEXT)
RETURNS TABLE (
    user_id UUID,
    full_name TEXT,
    email TEXT,
    role TEXT,
    is_active BOOLEAN
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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

-- 重新创建会话管理函数，添加search_path
CREATE OR REPLACE FUNCTION create_user_session(input_user_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    session_token TEXT;
BEGIN
    -- 生成会话令牌
    session_token := encode(gen_random_bytes(32), 'base64');
    
    -- 插入会话记录
    INSERT INTO user_sessions (user_id, session_token, expires_at)
    VALUES (input_user_id, session_token, now() + interval '24 hours');
    
    -- 更新最后登录时间
    UPDATE user_profiles 
    SET last_login = now() 
    WHERE id = input_user_id;
    
    RETURN session_token;
END;
$$;

-- 重新创建会话验证函数，添加search_path
CREATE OR REPLACE FUNCTION verify_session(input_session_token TEXT)
RETURNS TABLE (
    user_id UUID,
    full_name TEXT,
    email TEXT,
    role TEXT,
    is_active BOOLEAN
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- 更新最后访问时间
    UPDATE user_sessions 
    SET last_accessed = now() 
    WHERE session_token = input_session_token 
    AND expires_at > now();
    
    -- 返回用户信息
    RETURN QUERY
    SELECT 
        up.id,
        up.full_name,
        up.email,
        up.role,
        up.is_active
    FROM user_profiles up
    JOIN user_sessions us ON up.id = us.user_id
    WHERE us.session_token = input_session_token 
    AND us.expires_at > now()
    AND up.is_active = true;
END;
$$;

-- 重新创建密码设置函数，添加search_path
CREATE OR REPLACE FUNCTION set_user_password(input_user_id UUID, input_password TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    salt_value TEXT;
BEGIN
    -- 生成盐值
    salt_value := gen_salt('bf', 10);
    
    -- 更新密码哈希和盐值
    UPDATE user_profiles 
    SET 
        password_hash = crypt(input_password, salt_value),
        salt = salt_value
    WHERE id = input_user_id;
    
    RETURN FOUND;
END;
$$;

-- 重新创建删除会话函数，添加search_path
CREATE OR REPLACE FUNCTION delete_user_session(input_session_token TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    DELETE FROM user_sessions 
    WHERE session_token = input_session_token;
    
    RETURN FOUND;
END;
$$;