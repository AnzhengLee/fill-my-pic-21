import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const SetupAdmin = () => {
  const [loading, setLoading] = useState(false);
  const [created, setCreated] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const createAdminUser = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-admin-user', {
        body: {
          email: 'admin@system.local',
          password: 'admin123'
        }
      });

      if (error) throw error;

      setCreated(true);
      toast({
        title: "管理员用户创建成功",
        description: "用户名: admin, 密码: admin123",
      });
    } catch (error: any) {
      console.error('Error creating admin user:', error);
      toast({
        title: "创建失败",
        description: error.message || "创建管理员用户时发生错误",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Auto-create the admin user on component mount
    createAdminUser();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2">正在创建管理员用户...</p>
        </div>
      </div>
    );
  }

  if (created) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold text-green-600">设置完成!</h1>
          <p>管理员用户已创建</p>
          <p>用户名: <strong>admin</strong></p>
          <p>密码: <strong>admin123</strong></p>
          <Button onClick={() => navigate('/auth')}>
            前往登录
          </Button>
        </div>
      </div>
    );
  }

  return null;
};

export default SetupAdmin;