import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🔐 管理员密码重置请求');
    
    // 创建 Supabase 客户端（使用 anon key 验证调用者）
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    // 验证调用者是管理员
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      console.error('❌ 用户验证失败:', userError);
      throw new Error('Unauthorized');
    }

    console.log('👤 调用者:', user.email);

    // 检查是否为管理员
    const { data: isAdmin, error: adminError } = await supabaseClient.rpc('is_admin');
    if (adminError || !isAdmin) {
      console.error('❌ 权限验证失败:', adminError);
      throw new Error('Only administrators can reset passwords');
    }

    console.log('✅ 管理员权限验证通过');

    // 获取请求参数
    const { targetUserId, newPassword } = await req.json();
    
    if (!targetUserId || !newPassword) {
      throw new Error('Missing required parameters: targetUserId and newPassword');
    }

    console.log('🎯 目标用户 ID:', targetUserId);
    console.log('🔑 新密码长度:', newPassword.length);

    // 使用 Service Role Key 重置密码
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { data: updateData, error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      targetUserId,
      { password: newPassword }
    );

    if (updateError) {
      console.error('❌ 密码更新失败:', updateError);
      throw updateError;
    }

    console.log('✅ 密码重置成功');

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Password reset successfully',
        userId: targetUserId
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error: any) {
    console.error('💥 错误:', error);
    return new Response(
      JSON.stringify({
        error: error.message,
        details: error.toString()
      }),
      {
        status: error.message === 'Unauthorized' || error.message.includes('administrators') ? 403 : 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
