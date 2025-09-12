-- Fix create_user_session function to access pgcrypto functions
DROP FUNCTION IF EXISTS public.create_user_session(uuid);

-- Recreate create_user_session function with correct search path for pgcrypto
CREATE OR REPLACE FUNCTION public.create_user_session(input_user_id uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
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