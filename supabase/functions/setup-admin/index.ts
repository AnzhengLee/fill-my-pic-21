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
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const adminPassword = Deno.env.get('ADMIN_PASSWORD') ?? 'Mrecord_2025'
    let userId: string | undefined

    // Try to create admin user
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: 'admin@system.local',
      password: adminPassword,
      email_confirm: true
    })

    if (authError) {
      if (authError.message.includes('already been registered') || authError.message.includes('already exists')) {
        // User exists, find and update password
        const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers()
        const existingUser = existingUsers?.users.find(u => u.email === 'admin@system.local')
        
        if (existingUser) {
          userId = existingUser.id
          // Update password for existing user
          await supabaseAdmin.auth.admin.updateUserById(existingUser.id, {
            password: adminPassword
          })
        }
      } else {
        throw authError
      }
    } else {
      userId = authUser?.user?.id
    }

    // Update or create profile
    if (userId) {
      const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .upsert({
          id: userId,
          email: 'admin@system.local',
          role: 'admin'
        })

      if (profileError) {
        throw profileError
      }
    }

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Admin user created/updated successfully' 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    return new Response(JSON.stringify({ 
      error: (error as Error).message 
    }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})