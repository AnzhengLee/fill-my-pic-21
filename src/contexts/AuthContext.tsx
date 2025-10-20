import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isAdmin: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any; data?: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        // Use setTimeout to avoid deadlock when calling Supabase from auth state change
        if (session?.user) {
          setTimeout(async () => {
            try {
              const { data, error } = await supabase.rpc('is_admin');
              if (!error) {
                setIsAdmin(data === true);
              } else {
                console.error('Error checking admin status:', error);
                setIsAdmin(false);
              }
            } catch (e) {
              console.error('Error checking admin status:', e);
              setIsAdmin(false);
            }
          }, 0);
        } else {
          setIsAdmin(false);
        }
        
        setLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    console.log('🔐 开始登录流程');
    console.log('📧 Email:', email);
    console.log('🔑 使用的密码长度:', password.length);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      // 详细记录响应
      if (error) {
        console.error('❌ 登录失败 - 完整错误对象:', {
          message: error.message,
          status: error.status,
          code: (error as any).code,
          details: error
        });
      } else {
        console.log('✅ 登录成功 - 用户信息:', {
          userId: data.user?.id,
          email: data.user?.email,
          lastSignIn: data.user?.last_sign_in_at
        });
      }
      
      return { error, data };
    } catch (error: any) {
      console.error('💥 登录过程中发生异常:', error);
      return { error };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const value = {
    user,
    session,
    loading,
    isAdmin,
    signIn,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};