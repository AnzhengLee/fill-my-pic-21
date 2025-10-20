import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const SetupAdmin = () => {
  const { toast } = useToast();

  const setupAdminUser = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('setup-admin');
      
      if (error) throw error;
      
      toast({
        title: "设置成功",
        description: "管理员用户已创建/更新，密码为: Mrecord_2025",
      });
    } catch (error: any) {
      toast({
        title: "设置失败", 
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="p-4">
      <Button onClick={setupAdminUser}>
        创建管理员用户
      </Button>
      <p className="text-sm text-muted-foreground mt-2">
        点击此按钮在Supabase中创建admin@system.local用户
      </p>
    </div>
  );
};

export default SetupAdmin;