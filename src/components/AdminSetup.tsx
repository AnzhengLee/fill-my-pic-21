import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Shield, Loader2 } from 'lucide-react';

export default function AdminSetup() {
  const [creating, setCreating] = useState(false);
  const { toast } = useToast();

  const createAdminUser = async () => {
    setCreating(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-admin');
      
      if (error) throw error;
      
      if (data.success) {
        toast({
          title: "管理员账户创建成功",
          description: "用户名: admin, 密码: admin123",
        });
      } else {
        throw new Error(data.error);
      }
    } catch (error: any) {
      toast({
        title: "创建失败",
        description: error.message || "创建管理员账户时发生错误",
        variant: "destructive",
      });
    } finally {
      setCreating(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="w-5 h-5" />
          管理员设置
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          点击下方按钮创建管理员账户 (admin/admin123)
        </p>
        <Button 
          onClick={createAdminUser} 
          disabled={creating}
          className="w-full"
        >
          {creating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          创建管理员账户
        </Button>
      </CardContent>
    </Card>
  );
}