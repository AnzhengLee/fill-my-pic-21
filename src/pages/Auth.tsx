import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
const Auth = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const {
    signIn
  } = useAuth();
  const navigate = useNavigate();
  const {
    toast
  } = useToast();
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    console.log('📝 提交登录表单');
    // Convert username to email format for our admin user
    const email = username === 'admin' ? 'admin@system.local' : username;
    console.log('🔄 转换后的 email:', email);
    
    const { error, data } = await signIn(email, password);
    
    if (error) {
      // 根据错误类型显示不同的提示
      let errorMessage = '用户名或密码错误';
      let errorDetails = '';
      
      if (error.message.includes('Invalid login credentials')) {
        errorMessage = '用户名或密码错误';
        errorDetails = '请检查您的凭据是否正确';
      } else if (error.message.includes('Email not confirmed')) {
        errorMessage = '邮箱未验证';
        errorDetails = '请先验证您的邮箱';
      } else if (error.message.includes('network')) {
        errorMessage = '网络连接失败';
        errorDetails = '请检查您的网络连接';
      }
      
      toast({
        title: "登录失败",
        description: `${errorMessage}${errorDetails ? ': ' + errorDetails : ''}`,
        variant: "destructive"
      });
      
      // 在控制台显示完整错误信息供调试
      console.error('🚨 登录错误详情:', {
        message: error.message,
        status: error.status,
        code: (error as any).code,
        email: email,
        timestamp: new Date().toISOString()
      });
    } else {
      console.log('🎉 登录成功，准备跳转');
      toast({
        title: "登录成功",
        description: "欢迎回来，管理员"
      });
      navigate('/records');
    }
    
    setLoading(false);
  };
  return <div className="min-h-screen flex items-center justify-center bg-medical-light">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">管理员登录</CardTitle>
          <CardDescription className="text-center">
            请输入您的管理员凭据
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">用户名</Label>
              <Input id="username" type="text" placeholder="请输入用户名" value={username} onChange={e => setUsername(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">密码</Label>
              <Input id="password" type="password" placeholder="请输入密码" value={password} onChange={e => setPassword(e.target.value)} required />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "登录中..." : "登录"}
            </Button>
          </form>
          
        </CardContent>
      </Card>
    </div>;
};
export default Auth;