import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.56.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = 'https://mfjrbbhftoqybpgwbymc.supabase.co';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false }
});

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, username, password, sessionToken } = await req.json();

    switch (action) {
      case 'login': {
        console.log('Login attempt for username:', username);
        
        // 验证用户名密码
        const { data: loginData, error: loginError } = await supabase
          .rpc('verify_user_login', { 
            input_username: username, 
            input_password: password 
          });

        console.log('Login verification result:', { loginData, loginError });

        if (loginError) {
          console.error('Login verification error:', loginError);
          return new Response(
            JSON.stringify({ error: '登录验证失败' }),
            { 
              status: 500, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          );
        }

        if (!loginData || loginData.length === 0) {
          console.log('Invalid credentials for username:', username);
          return new Response(
            JSON.stringify({ error: '用户名或密码错误' }),
            { 
              status: 401, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          );
        }

        const user = loginData[0];
        
        if (!user.is_active) {
          console.log('User account is inactive:', username);
          return new Response(
            JSON.stringify({ error: '账户已被禁用' }),
            { 
              status: 401, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          );
        }

        // 创建会话
        const { data: sessionTokenData, error: sessionError } = await supabase
          .rpc('create_user_session', { input_user_id: user.user_id });

        console.log('Session creation result:', { sessionTokenData, sessionError });

        if (sessionError) {
          console.error('Session creation error:', sessionError);
          return new Response(
            JSON.stringify({ error: '会话创建失败' }),
            { 
              status: 500, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          );
        }

        return new Response(
          JSON.stringify({ 
            sessionToken: sessionTokenData,
            user: {
              id: user.user_id,
              fullName: user.full_name,
              email: user.email,
              role: user.role
            }
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      case 'verify': {
        console.log('Verifying session token');
        
        // 验证会话
        const { data: sessionData, error: sessionError } = await supabase
          .rpc('verify_session', { input_session_token: sessionToken });

        if (sessionError) {
          console.error('Session verification error:', sessionError);
          return new Response(
            JSON.stringify({ error: '会话验证失败' }),
            { 
              status: 500, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          );
        }

        if (!sessionData || sessionData.length === 0) {
          console.log('Invalid or expired session token');
          return new Response(
            JSON.stringify({ error: '会话已过期' }),
            { 
              status: 401, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          );
        }

        const user = sessionData[0];

        return new Response(
          JSON.stringify({ 
            user: {
              id: user.user_id,
              fullName: user.full_name,
              email: user.email,
              role: user.role
            }
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      case 'logout': {
        console.log('Logging out session token');
        
        // 删除会话
        const { data: logoutData, error: logoutError } = await supabase
          .rpc('delete_user_session', { input_session_token: sessionToken });

        if (logoutError) {
          console.error('Logout error:', logoutError);
          return new Response(
            JSON.stringify({ error: '登出失败' }),
            { 
              status: 500, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          );
        }

        return new Response(
          JSON.stringify({ success: true }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      default:
        return new Response(
          JSON.stringify({ error: '不支持的操作' }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
    }

  } catch (error) {
    console.error('Auth function error:', error);
    return new Response(
      JSON.stringify({ error: '服务器内部错误' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});