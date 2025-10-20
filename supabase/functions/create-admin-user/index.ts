import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🔧 开始设置管理员用户')
    
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { email, password } = await req.json()
    console.log('📧 目标邮箱:', email)
    console.log('🔑 设置密码长度:', password?.length || 0)

    let userId: string | undefined

    // 尝试创建新用户
    console.log('👤 尝试创建管理员用户...')
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true
    })

    if (authError) {
      console.log('⚠️ 创建用户时出错:', authError.message)
      
      // 如果用户已存在，则更新密码
      if (authError.message.includes('already been registered') || 
          authError.message.includes('already exists') ||
          authError.message.includes('User already registered')) {
        console.log('📋 用户已存在，查找并更新密码')
        
        const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers()
        console.log('👥 在数据库中搜索用户...')
        
        const existingUser = existingUsers?.users.find(u => u.email === email)
        
        if (existingUser) {
          console.log('✅ 找到现有用户:', existingUser.id)
          userId = existingUser.id
          
          // 更新密码
          console.log('🔄 正在更新密码...')
          const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
            existingUser.id,
            { password: password }
          )
          
          if (updateError) {
            console.error('❌ 更新密码失败:', updateError)
            throw updateError
          }
          
          console.log('✅ 密码已成功更新为 Mrecord_2025')
        } else {
          console.error('❌ 在数据库中未找到用户')
          throw new Error('Admin user not found in database')
        }
      } else {
        throw authError
      }
    } else {
      console.log('✅ 成功创建新管理员用户')
      userId = authUser?.user?.id
    }

    // 更新或创建 profile，确保 role 为 admin
    if (userId) {
      console.log('📝 更新用户档案，设置 role 为 admin...')
      const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .upsert({
          id: userId,
          email: email,
          role: 'admin'
        }, {
          onConflict: 'id'
        })

      if (profileError) {
        console.error('❌ 更新档案失败:', profileError)
        throw profileError
      }
      
      console.log('✅ 用户档案已更新')
    }

    console.log('🎉 管理员用户设置完成')
    console.log('📋 最终配置: email=' + email + ', password=Mrecord_2025')
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Admin user created/updated successfully',
        userId: userId,
        email: email,
        password: password
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      },
    )

  } catch (error: any) {
    console.error('💥 设置管理员用户时发生错误:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: error.toString()
      }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      },
    )
  }
})