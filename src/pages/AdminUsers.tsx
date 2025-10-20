import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { ArrowLeft, Key, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

interface User {
  id: string;
  email: string;
  role: string;
  created_at: string;
}

const AdminUsers = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [resetting, setResetting] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, role, created_at')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error: any) {
      toast({
        title: '加载失败',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!selectedUser || !newPassword) return;

    setResetting(true);
    try {
      const { data, error } = await supabase.functions.invoke('admin-reset-password', {
        body: {
          targetUserId: selectedUser.id,
          newPassword: newPassword,
        },
      });

      if (error) throw error;

      toast({
        title: '密码重置成功',
        description: `已为用户 ${selectedUser.email} 重置密码`,
      });

      setResetDialogOpen(false);
      setNewPassword('');
      setSelectedUser(null);
    } catch (error: any) {
      toast({
        title: '重置失败',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setResetting(false);
    }
  };

  const openResetDialog = (user: User) => {
    setSelectedUser(user);
    setResetDialogOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-4xl py-8">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/records')}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">用户管理</h1>
            <p className="text-muted-foreground">管理系统用户和权限</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>用户列表</CardTitle>
            <CardDescription>查看所有用户并管理其密码</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : users.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">暂无用户</p>
            ) : (
              <div className="space-y-4">
                {users.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="font-medium">{user.email}</div>
                      <div className="text-sm text-muted-foreground">
                        角色: {user.role} | 创建时间:{' '}
                        {new Date(user.created_at).toLocaleString('zh-CN')}
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openResetDialog(user)}
                    >
                      <Key className="h-4 w-4 mr-2" />
                      重置密码
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Dialog open={resetDialogOpen} onOpenChange={setResetDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>重置用户密码</DialogTitle>
              <DialogDescription>
                为用户 <strong>{selectedUser?.email}</strong> 设置新密码
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="password">新密码</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="请输入新密码"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  disabled={resetting}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setResetDialogOpen(false);
                  setNewPassword('');
                }}
                disabled={resetting}
              >
                取消
              </Button>
              <Button
                onClick={handleResetPassword}
                disabled={!newPassword || resetting}
              >
                {resetting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                确认重置
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default AdminUsers;
