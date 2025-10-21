import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Copy, CheckCircle2, AlertCircle } from 'lucide-react';

const JwtGenerator = () => {
  const { toast } = useToast();
  const [jwtSecret, setJwtSecret] = useState('6a9f3c8d7b2e5f1a4c7d9e0b3a5f8c2d1e4f7a8b0c3d5e7f9a2b4c6d8e0f1a');
  const [issuer, setIssuer] = useState('supabase.ppfsui.com');
  const [anonKey, setAnonKey] = useState('');
  const [serviceKey, setServiceKey] = useState('');
  const [copied, setCopied] = useState<'anon' | 'service' | null>(null);

  // Base64 URL 编码（用于字符串）
  const base64UrlEncode = (str: string): string => {
    const base64 = btoa(str);
    return base64
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
  };

  // Base64 URL 编码（用于 Uint8Array）
  const arrayBufferToBase64Url = (buffer: ArrayBuffer): string => {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.length; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary)
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
  };

  // HMAC-SHA256 签名 - 使用文本密钥（Supabase 标准）
  const hmacSha256 = async (message: string, secret: string): Promise<string> => {
    try {
      const encoder = new TextEncoder();
      
      // 将密钥作为普通文本字符串导入
      const keyData = encoder.encode(secret);
      const cryptoKey = await crypto.subtle.importKey(
        'raw',
        keyData,
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
      );

      // 对消息进行签名
      const messageData = encoder.encode(message);
      const signature = await crypto.subtle.sign('HMAC', cryptoKey, messageData);
      
      // 将签名转换为 Base64 URL
      return arrayBufferToBase64Url(signature);
    } catch (error) {
      throw new Error(`签名失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
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

      // 编码 Header 和 Payload
      const encodedHeader = base64UrlEncode(JSON.stringify(header));
      const encodedPayload = base64UrlEncode(JSON.stringify(payload));
      const unsignedToken = `${encodedHeader}.${encodedPayload}`;

      // 使用文本密钥进行签名（Supabase 标准方法）
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
              <Label htmlFor="jwtSecret">JWT_SECRET（普通文本）</Label>
              <Input
                id="jwtSecret"
                type="text"
                value={jwtSecret}
                onChange={(e) => setJwtSecret(e.target.value)}
                placeholder="your-super-secret-jwt-token-with-at-least-32-characters-long"
                className="font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">
                来自 .env 文件的 JWT_SECRET（直接复制，无需转换）
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
                    <p className="text-sm font-semibold mb-2">更新前端配置：</p>
                    <code className="text-xs break-all block">
                      {`// src/integrations/supabase/client.ts\nconst SUPABASE_PUBLISHABLE_KEY = "${anonKey.substring(0, 50)}..."`}
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
                    <p className="text-sm font-semibold mb-2">更新 Supabase Secrets：</p>
                    <code className="text-xs break-all block">
                      {`SUPABASE_SERVICE_ROLE_KEY="${serviceKey.substring(0, 50)}..."`}
                    </code>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card className="border-green-500 bg-green-50 dark:bg-green-950">
              <CardHeader>
                <CardTitle className="text-green-700 dark:text-green-400 flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5" />
                  ✓ 如何验证密钥
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <p className="font-semibold">在 <a href="https://jwt.io" target="_blank" rel="noopener noreferrer" className="underline">jwt.io</a> 验证生成的密钥：</p>
                <ol className="list-decimal list-inside space-y-2 ml-2">
                  <li>将生成的密钥（ANON_KEY 或 SERVICE_ROLE_KEY）粘贴到左侧 "Encoded" 区域</li>
                  <li className="font-bold text-green-700 dark:text-green-400">
                    在右下角 "Verify Signature" 的密钥输入框中，直接粘贴您的 JWT_SECRET：
                    <code className="block mt-1 p-2 bg-background rounded text-xs break-all">
                      {jwtSecret}
                    </code>
                  </li>
                  <li>确认显示 <span className="text-green-600 font-semibold">"Signature Verified ✓"</span></li>
                </ol>
                <div className="flex items-start gap-2 p-3 bg-yellow-50 dark:bg-yellow-950 rounded border border-yellow-200 dark:border-yellow-800 mt-3">
                  <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                  <p className="text-yellow-800 dark:text-yellow-200 text-xs">
                    <strong>重要：</strong>JWT_SECRET 是普通文本字符串，在 jwt.io 验证时直接输入原始值即可，不需要进行任何格式转换！
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-amber-500 bg-amber-50 dark:bg-amber-950">
              <CardHeader>
                <CardTitle className="text-amber-700 dark:text-amber-400">⚠️ 安全提示</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p>1. <strong>ANON_KEY</strong> 可以安全地在前端代码中使用</p>
                <p>2. <strong>SERVICE_ROLE_KEY</strong> 绝不能暴露在前端，仅用于后端</p>
                <p>3. 请妥善保管这些密钥，不要提交到公开代码库</p>
                <p>4. 更新密钥后需要重启应用才能生效</p>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
};

export default JwtGenerator;
