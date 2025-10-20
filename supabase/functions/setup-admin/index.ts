import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('🔧 开始设置管理员用户');
    
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )
    
    console.log('🔗 Supabase URL:', Deno.env.get('SUPABASE_URL'));

    const adminPassword = Deno.env.get('ADMIN_PASSWORD') ?? 'Mrecord_2025'
    console.log('🔑 使用的密码:', adminPassword);
    
    let userId: string | undefined

    // Try to create admin user
    console.log('👤 尝试创建管理员用户...');
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: 'admin@system.local',
      password: adminPassword,
      email_confirm: true
    })

    if (authError) {
      console.log('⚠️ 创建用户时出错:', authError.message);
      
      if (authError.message.includes('already been registered') || authError.message.includes('already exists')) {
        console.log('📋 用户已存在，查找并更新密码');
        
        const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers()
        console.log('👥 找到的用户数量:', existingUsers?.users.length);
        
        const existingUser = existingUsers?.users.find(u => u.email === 'admin@system.local')
        
        if (existingUser) {
          console.log('✅ 找到管理员用户:', existingUser.id);
          userId = existingUser.id
          
          // Update password for existing user
          const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
            existingUser.id,
            { password: adminPassword }
          )
          
          if (updateError) {
            console.error('❌ 更新密码失败:', updateError);
            throw updateError;
          }
          
          console.log('🔄 密码更新成功');
        } else {
          console.error('❌ 未找到管理员用户');
          throw new Error('Admin user not found in database');
        }
      } else {
        throw authError
      }
    } else {
      console.log('✅ 成功创建新管理员用户');
      userId = authUser?.user?.id
    }

    // Update or create profile
    if (userId) {
      console.log('📝 更新用户档案...');
      const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .upsert({
          id: userId,
          email: 'admin@system.local',
          role: 'admin'
        })

      if (profileError) {
        console.error('❌ 更新档案失败:', profileError);
        throw profileError
      }
      
      console.log('✅ 档案更新成功');
    }

    console.log('🎉 管理员用户设置完成');
    
    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Admin user created/updated successfully',
      password: adminPassword
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error: any) {
    console.error('💥 设置管理员用户时发生错误:', error);
    return new Response(JSON.stringify({ 
      error: error.message 
    }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})