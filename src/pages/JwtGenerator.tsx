import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Copy, CheckCircle2 } from 'lucide-react';

const JwtGenerator = () => {
  const { toast } = useToast();
  const [jwtSecret, setJwtSecret] = useState('6a9f3c8d7b2e5f1a4c7d9e0b3a5f8c2d1e4f7a8b0c3d5e7f9a2b4c6d8e0f1a');
  const [issuer, setIssuer] = useState('supabase.ppfsui.com');
  const [anonKey, setAnonKey] = useState('');
  const [serviceKey, setServiceKey] = useState('');
  const [copied, setCopied] = useState<'anon' | 'service' | null>(null);

  // 简单的 base64url 编码
  const base64UrlEncode = (str: string) => {
    return btoa(str)
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
  };

  // HMAC-SHA256 签名函数
  const hmacSha256 = async (message: string, secret: string): Promise<string> => {
    const encoder = new TextEncoder();
    const keyData = encoder.encode(secret);
    const messageData = encoder.encode(message);

    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );

    const signature = await crypto.subtle.sign('HMAC', cryptoKey, messageData);
    const signatureArray = Array.from(new Uint8Array(signature));
    const signatureBase64 = btoa(String.fromCharCode(...signatureArray));
    
    return signatureBase64
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
  };

  const generateJwt = async (role: 'anon' | 'service_role') => {
    try {
      const header = {
        alg: 'HS256',
        typ: 'JWT'
      };

      const payload = {
        iss: issuer,
        role: role,
        exp: 1999084800 // 2033-05-18
      };

      const encodedHeader = base64UrlEncode(JSON.stringify(header));
      const encodedPayload = base64UrlEncode(JSON.stringify(payload));
      const unsignedToken = `${encodedHeader}.${encodedPayload}`;

      const signature = await hmacSha256(unsignedToken, jwtSecret);
      const jwt = `${unsignedToken}.${signature}`;

      if (role === 'anon') {
        setAnonKey(jwt);
      } else {
        setServiceKey(jwt);
      }

      toast({
        title: '生成成功',
        description: `${role === 'anon' ? 'ANON_KEY' : 'SERVICE_ROLE_KEY'} 已生成`,
      });
    } catch (error) {
      toast({
        title: '生成失败',
        description: error instanceof Error ? error.message : '未知错误',
        variant: 'destructive',
      });
    }
  };

  const generateBothKeys = async () => {
    await generateJwt('anon');
    await generateJwt('service_role');
  };

  const copyToClipboard = async (text: string, type: 'anon' | 'service') => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(type);
      toast({
        title: '已复制',
        description: '密钥已复制到剪贴板',
      });
      setTimeout(() => setCopied(null), 2000);
    } catch (error) {
      toast({
        title: '复制失败',
        description: '请手动复制',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Supabase JWT 密钥生成器</h1>
          <p className="text-muted-foreground mt-2">
            为您的自建 Supabase 实例生成 ANON_KEY 和 SERVICE_ROLE_KEY
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>配置信息</CardTitle>
            <CardDescription>
              输入您的 JWT_SECRET 和 Issuer（来自 .env 文件）
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="jwtSecret">JWT_SECRET</Label>
              <Input
                id="jwtSecret"
                type="text"
                value={jwtSecret}
                onChange={(e) => setJwtSecret(e.target.value)}
                placeholder="6a9f3c8d7b2e5f1a..."
                className="font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">
                来自 .env 文件的 JWT_SECRET
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="issuer">Issuer（签发者）</Label>
              <Input
                id="issuer"
                type="text"
                value={issuer}
                onChange={(e) => setIssuer(e.target.value)}
                placeholder="supabase.ppfsui.com"
              />
              <p className="text-xs text-muted-foreground">
                您的 Supabase 域名（不包含 https:// 和端口）
              </p>
            </div>

            <Button onClick={generateBothKeys} className="w-full">
              生成密钥
            </Button>
          </CardContent>
        </Card>

        {(anonKey || serviceKey) && (
          <>
            {anonKey && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>ANON_KEY（匿名密钥）</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(anonKey, 'anon')}
                    >
                      {copied === 'anon' ? (
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </CardTitle>
                  <CardDescription>
                    用于前端客户端的公开密钥（浏览器安全）
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={anonKey}
                    readOnly
                    className="font-mono text-xs h-24"
                  />
                  <div className="mt-4 p-3 bg-muted rounded-md">
                    <p className="text-sm font-semibold mb-2">使用方法：</p>
                    <code className="text-xs">
                      {`// src/integrations/supabase/client.ts\nconst SUPABASE_PUBLISHABLE_KEY = "${anonKey.substring(0, 30)}..."`}
                    </code>
                  </div>
                </CardContent>
              </Card>
            )}

            {serviceKey && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>SERVICE_ROLE_KEY（服务密钥）</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(serviceKey, 'service')}
                    >
                      {copied === 'service' ? (
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </CardTitle>
                  <CardDescription>
                    仅用于后端/Edge Functions（绝不暴露给前端）
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={serviceKey}
                    readOnly
                    className="font-mono text-xs h-24"
                  />
                  <div className="mt-4 p-3 bg-muted rounded-md">
                    <p className="text-sm font-semibold mb-2">使用方法：</p>
                    <code className="text-xs">
                      {`// supabase/functions/xxx/index.ts\nconst SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')`}
                    </code>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card className="border-amber-500 bg-amber-50 dark:bg-amber-950">
              <CardHeader>
                <CardTitle className="text-amber-700 dark:text-amber-400">⚠️ 安全提示</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p>1. <strong>ANON_KEY</strong> 可以安全地在前端代码中使用</p>
                <p>2. <strong>SERVICE_ROLE_KEY</strong> 绝不能暴露在前端，仅用于后端</p>
                <p>3. 请妥善保管这些密钥，不要提交到公开代码库</p>
                <p>4. 更新密钥后需要重启 Supabase 服务</p>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
};

export default JwtGenerator;
