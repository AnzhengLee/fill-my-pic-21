import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { Copy, CheckCircle2, AlertCircle } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

const JwtGenerator = () => {
  const { toast } = useToast();
  const [jwtSecret, setJwtSecret] = useState('6a9f3c8d7b2e5f1a4c7d9e0b3a5f8c2d1e4f7a8b0c3d5e7f9a2b4c6d8e0f1a');
  const [issuer, setIssuer] = useState('supabase.ppfsui.com');
  const [secretFormat, setSecretFormat] = useState<'text' | 'hex'>('hex');
  const [anonKey, setAnonKey] = useState('');
  const [serviceKey, setServiceKey] = useState('');
  const [testToken, setTestToken] = useState('');
  const [verifyResult, setVerifyResult] = useState<{ valid: boolean; message: string } | null>(null);
  const [copied, setCopied] = useState<'anon' | 'service' | null>(null);
  const [testingConnection, setTestingConnection] = useState(false);
  const [connectionResult, setConnectionResult] = useState<any>(null);

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

  // 十六进制转字节数组
  const hexToBytes = (hex: string): Uint8Array => {
    const bytes = new Uint8Array(hex.length / 2);
    for (let i = 0; i < hex.length; i += 2) {
      bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
    }
    return bytes;
  };

  // HMAC-SHA256 签名
  const hmacSha256 = async (message: string, secret: string, isHex: boolean): Promise<string> => {
    try {
      const encoder = new TextEncoder();
      
      let keyBuffer: ArrayBuffer;
      if (isHex) {
        const bytes = hexToBytes(secret);
        const bufferLike = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength);
        keyBuffer = bufferLike instanceof ArrayBuffer ? bufferLike : new ArrayBuffer(bytes.byteLength);
      } else {
        const bytes = encoder.encode(secret);
        const bufferLike = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength);
        keyBuffer = bufferLike instanceof ArrayBuffer ? bufferLike : new ArrayBuffer(bytes.byteLength);
      }
      
      const cryptoKey = await crypto.subtle.importKey(
        'raw',
        keyBuffer,
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
      );

      const messageBytes = encoder.encode(message);
      const messageBufferLike = messageBytes.buffer.slice(messageBytes.byteOffset, messageBytes.byteOffset + messageBytes.byteLength);
      const messageBuffer = messageBufferLike instanceof ArrayBuffer ? messageBufferLike : new ArrayBuffer(messageBytes.byteLength);
      
      const signature = await crypto.subtle.sign('HMAC', cryptoKey, messageBuffer);
      
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
        exp: 1999084800
      };

      // 编码 Header 和 Payload
      const encodedHeader = base64UrlEncode(JSON.stringify(header));
      const encodedPayload = base64UrlEncode(JSON.stringify(payload));
      const unsignedToken = `${encodedHeader}.${encodedPayload}`;

      // 根据选择的格式签名
      const signature = await hmacSha256(unsignedToken, jwtSecret, secretFormat === 'hex');
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

  const verifyToken = async () => {
    if (!testToken) {
      toast({
        title: '错误',
        description: '请输入要验证的密钥',
        variant: 'destructive',
      });
      return;
    }

    try {
      const parts = testToken.split('.');
      if (parts.length !== 3) {
        throw new Error('JWT 格式无效');
      }

      const header = JSON.parse(atob(parts[0].replace(/-/g, '+').replace(/_/g, '/')));
      const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));

      if (jwtSecret) {
        const message = `${parts[0]}.${parts[1]}`;
        const expectedSignature = await hmacSha256(message, jwtSecret, secretFormat === 'hex');
        const actualSignature = parts[2];

        if (expectedSignature === actualSignature) {
          const resultMessage = `✅ 密钥有效！\n\n解码信息：\n${JSON.stringify({ header, payload }, null, 2)}`;
          setVerifyResult({ valid: true, message: resultMessage });
          toast({
            title: '验证成功',
            description: '密钥签名有效',
          });
        } else {
          const resultMessage = `❌ 签名验证失败！\n\n当前密钥可能不是使用此 JWT_SECRET 生成的。\n\n解码信息：\n${JSON.stringify({ header, payload }, null, 2)}`;
          setVerifyResult({ valid: false, message: resultMessage });
          toast({
            title: '验证失败',
            description: '密钥签名不匹配',
            variant: 'destructive',
          });
        }
      } else {
        const resultMessage = `ℹ️ 未提供 JWT_SECRET，无法验证签名\n\n解码信息：\n${JSON.stringify({ header, payload }, null, 2)}`;
        setVerifyResult({ valid: false, message: resultMessage });
      }
    } catch (error) {
      toast({
        title: '验证错误',
        description: error instanceof Error ? error.message : '未知错误',
        variant: 'destructive',
      });
    }
  };

  const testDatabaseConnection = async () => {
    if (!anonKey) {
      toast({
        title: '错误',
        description: '请先生成密钥',
        variant: 'destructive',
      });
      return;
    }

    setTestingConnection(true);
    setConnectionResult(null);

    try {
      const testUrl = 'https://supabase.ppfsui.com:8443';
      const testClient = createClient(testUrl, anonKey);

      // Test 1: Check auth status
      const { data: authData, error: authError } = await testClient.auth.getSession();
      
      // Test 2: Try to query a table
      const { data: tableData, error: tableError } = await testClient
        .from('profiles')
        .select('count')
        .limit(1);

      const result = {
        timestamp: new Date().toISOString(),
        url: testUrl,
        authTest: {
          success: !authError,
          error: authError?.message || null,
        },
        databaseTest: {
          success: !tableError || tableError.code === 'PGRST116',
          error: tableError?.message || null,
          hint: tableError ? '如果启用了 RLS 策略，这是预期的' : '连接成功',
        },
      };

      setConnectionResult(result);

      if (!authError) {
        toast({
          title: '连接成功',
          description: '成功连接到 Supabase 数据库',
        });
      } else {
        toast({
          title: '连接测试完成',
          description: '请查看下方详细结果',
        });
      }
    } catch (error: any) {
      setConnectionResult({
        timestamp: new Date().toISOString(),
        error: error.message,
        success: false,
      });
      toast({
        title: '连接失败',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setTestingConnection(false);
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

        <Card className="border-blue-500 bg-blue-50 dark:bg-blue-950">
          <CardHeader>
            <CardTitle className="text-blue-700 dark:text-blue-400 flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              重要说明
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p><strong>根据您的 .env 配置，Issuer 应该是纯域名：</strong></p>
            <code className="block p-2 bg-background rounded text-xs">
              supabase.ppfsui.com
            </code>
            <p className="mt-3 text-xs text-muted-foreground">
              （不是完整 URL，不包含 https:// 和端口号）
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>步骤 1：验证现有密钥（可选但推荐）</CardTitle>
            <CardDescription>
              先验证您 .env 中的 ANON_KEY 或 SERVICE_ROLE_KEY 是否与 JWT_SECRET 匹配
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="testToken">粘贴现有的 ANON_KEY 或 SERVICE_ROLE_KEY</Label>
              <Textarea
                id="testToken"
                value={testToken}
                onChange={(e) => setTestToken(e.target.value)}
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                className="font-mono text-xs h-20"
              />
            </div>

            <Button onClick={verifyToken} variant="outline" className="w-full">
              验证现有密钥
            </Button>

            {verifyResult && (
              <div className={`p-4 rounded-md ${verifyResult.valid ? 'bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800' : 'bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800'}`}>
                <pre className={`text-xs whitespace-pre-wrap ${verifyResult.valid ? 'text-green-800 dark:text-green-200' : 'text-red-800 dark:text-red-200'}`}>
                  {verifyResult.message}
                </pre>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>步骤 2：生成新密钥</CardTitle>
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
                placeholder="6a9f3c8d7b2e5f1a4c7d9e0b3a5f8c2d1e4f7a8b0c3d5e7f9a2b4c6d8e0f1a"
                className="font-mono text-sm"
              />
            </div>

            <div className="space-y-3">
              <Label>JWT_SECRET 格式</Label>
              <RadioGroup value={secretFormat} onValueChange={(value) => setSecretFormat(value as 'text' | 'hex')}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="hex" id="hex" />
                  <Label htmlFor="hex" className="font-normal cursor-pointer">
                    十六进制 (Hex) - 如：<code className="text-xs">6a9f3c8d7b2e...</code>
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="text" id="text" />
                  <Label htmlFor="text" className="font-normal cursor-pointer">
                    普通文本 (Text) - 直接使用字符串
                  </Label>
                </div>
              </RadioGroup>
              <p className="text-xs text-muted-foreground">
                如果您的 JWT_SECRET 是 64 个十六进制字符（通过 openssl rand -hex 32 生成），请选择"十六进制"
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="issuer">Issuer（域名）</Label>
              <Input
                id="issuer"
                type="text"
                value={issuer}
                onChange={(e) => setIssuer(e.target.value)}
                placeholder="supabase.ppfsui.com"
              />
              <p className="text-xs text-muted-foreground">
                只填写域名，不包含 https:// 和端口号
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
                      {`const SUPABASE_PUBLISHABLE_KEY = "${anonKey.substring(0, 50)}..."`}
                    </code>
                  </div>
                </CardContent>
              </Card>
            )}

            {serviceKey && (
              <Card className="border-purple-500 bg-purple-50 dark:bg-purple-950">
                <CardHeader>
                  <CardTitle className="text-purple-700 dark:text-purple-400 flex items-center justify-between">
                    <span>📄 完整 .env 配置文件</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        const envContent = `############
# Secrets - 生产环境必须使用强密钥
############
POSTGRES_PASSWORD=ppfsui@798.com
JWT_SECRET=${jwtSecret}
ANON_KEY=${anonKey}
SERVICE_ROLE_KEY=${serviceKey}
DASHBOARD_USERNAME=ppfsui
DASHBOARD_PASSWORD=Ppfsui@2024!Secure
SECRET_KEY_BASE=9f2d7e4c8b1a3f5e7d9c2b4a6f8e0d1c3b5a7f9e2d4c6b8a0f1e3d5c7b9a0
VAULT_ENC_KEY=5Cexs3RPMa/hIjLsxi9Y4YOrfNsPu1r7
PG_META_CRYPTO_KEY=5/xSCAMgpnbcIvVLDAIPUbNRht0y09Qt


############
# 数据库配置
############
POSTGRES_HOST=db
POSTGRES_DB=supabase
POSTGRES_PORT=5432
POSTGRES_USER=ppfsui


############
# Supavisor - 数据库连接池
############
POOLER_PROXY_PORT_TRANSACTION=6543
POOLER_DEFAULT_POOL_SIZE=20
POOLER_MAX_CLIENT_CONN=100
POOLER_TENANT_ID=ppfsui-supabase-tenant
POOLER_DB_POOL_SIZE=5


############
# API代理 - Kong网关（HTTPS配置）
############
KONG_HTTP_PORT=8000
KONG_HTTPS_PORT=8443


############
# API - PostgREST配置
############
PGRST_DB_SCHEMAS=public,storage,graphql_public


############
# 认证服务 - GoTrue
############
SITE_URL=https://${issuer}:8443
ADDITIONAL_REDIRECT_URLS=https://${issuer}:8443/**
JWT_EXPIRY=3600
DISABLE_SIGNUP=true
API_EXTERNAL_URL=https://${issuer}:8443

# 邮件配置
MAILER_URLPATHS_CONFIRMATION="/auth/v1/verify"
MAILER_URLPATHS_INVITE="/auth/v1/verify"
MAILER_URLPATHS_RECOVERY="/auth/v1/verify"
MAILER_URLPATHS_EMAIL_CHANGE="/auth/v1/verify"
SMTP_ADMIN_EMAIL=admin@${issuer}
SMTP_HOST=supabase-mail
SMTP_PORT=2500
SMTP_USER=smtp_user@${issuer}
SMTP_PASS=smtp_secure_password
SMTP_SENDER_NAME=Supabase

# 认证方式开关
ENABLE_EMAIL_SIGNUP=true
ENABLE_EMAIL_AUTOCONFIRM=false
ENABLE_PHONE_SIGNUP=true
ENABLE_PHONE_AUTOCONFIRM=true


############
# 控制台 - Studio配置
############
STUDIO_DEFAULT_ORGANIZATION=ppfsui Organization
STUDIO_DEFAULT_PROJECT=ppfsui Project
SUPABASE_PUBLIC_URL=https://${issuer}:8443
IMGPROXY_ENABLE_WEBP_DETECTION=true
OPENAI_API_KEY=


############
# 函数服务配置
############
FUNCTIONS_VERIFY_JWT=false


############
# 日志分析配置
############
LOGFLARE_PUBLIC_ACCESS_TOKEN=logflare-public-7a9f3c8d7b2e5f1a4c7d9e0b3a
LOGFLARE_PRIVATE_ACCESS_TOKEN=logflare-private-3d5c7b9a0f2e4d6c8b1a3f5e7d
DOCKER_SOCKET_LOCATION=/var/run/docker.sock

# 谷歌云配置（不使用则留空）
GOOGLE_PROJECT_ID=
GOOGLE_PROJECT_NUMBER=


############
# HTTPS证书路径
############
SSL_CERT_FILE=/etc/supabase/cert/${issuer}.pem
SSL_KEY_FILE=/etc/supabase/cert/${issuer}.key

# 其他配置
ENABLE_ANONYMOUS_USERS=false
GOTRUE_MAILER_EXTERNAL_HOSTS=${issuer}:8443`;
                        navigator.clipboard.writeText(envContent);
                        toast({
                          title: '已复制完整配置',
                          description: '完整的 .env 文件内容已复制到剪贴板',
                        });
                      }}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </CardTitle>
                  <CardDescription>
                    包含新生成的 JWT 密钥的完整 .env 配置
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <p className="text-sm font-semibold">复制以下内容替换您的 .env 文件：</p>
                    <Textarea
                      readOnly
                      value={`############
# Secrets - 生产环境必须使用强密钥
############
POSTGRES_PASSWORD=ppfsui@798.com
JWT_SECRET=${jwtSecret}
ANON_KEY=${anonKey}
SERVICE_ROLE_KEY=${serviceKey}
DASHBOARD_USERNAME=ppfsui
DASHBOARD_PASSWORD=Ppfsui@2024!Secure
SECRET_KEY_BASE=9f2d7e4c8b1a3f5e7d9c2b4a6f8e0d1c3b5a7f9e2d4c6b8a0f1e3d5c7b9a0
VAULT_ENC_KEY=5Cexs3RPMa/hIjLsxi9Y4YOrfNsPu1r7
PG_META_CRYPTO_KEY=5/xSCAMgpnbcIvVLDAIPUbNRht0y09Qt


############
# 数据库配置
############
POSTGRES_HOST=db
POSTGRES_DB=supabase
POSTGRES_PORT=5432
POSTGRES_USER=ppfsui


############
# Supavisor - 数据库连接池
############
POOLER_PROXY_PORT_TRANSACTION=6543
POOLER_DEFAULT_POOL_SIZE=20
POOLER_MAX_CLIENT_CONN=100
POOLER_TENANT_ID=ppfsui-supabase-tenant
POOLER_DB_POOL_SIZE=5


############
# API代理 - Kong网关（HTTPS配置）
############
KONG_HTTP_PORT=8000
KONG_HTTPS_PORT=8443


############
# API - PostgREST配置
############
PGRST_DB_SCHEMAS=public,storage,graphql_public


############
# 认证服务 - GoTrue
############
SITE_URL=https://${issuer}:8443
ADDITIONAL_REDIRECT_URLS=https://${issuer}:8443/**
JWT_EXPIRY=3600
DISABLE_SIGNUP=true
API_EXTERNAL_URL=https://${issuer}:8443

# 邮件配置
MAILER_URLPATHS_CONFIRMATION="/auth/v1/verify"
MAILER_URLPATHS_INVITE="/auth/v1/verify"
MAILER_URLPATHS_RECOVERY="/auth/v1/verify"
MAILER_URLPATHS_EMAIL_CHANGE="/auth/v1/verify"
SMTP_ADMIN_EMAIL=admin@${issuer}
SMTP_HOST=supabase-mail
SMTP_PORT=2500
SMTP_USER=smtp_user@${issuer}
SMTP_PASS=smtp_secure_password
SMTP_SENDER_NAME=Supabase

# 认证方式开关
ENABLE_EMAIL_SIGNUP=true
ENABLE_EMAIL_AUTOCONFIRM=false
ENABLE_PHONE_SIGNUP=true
ENABLE_PHONE_AUTOCONFIRM=true


############
# 控制台 - Studio配置
############
STUDIO_DEFAULT_ORGANIZATION=ppfsui Organization
STUDIO_DEFAULT_PROJECT=ppfsui Project
SUPABASE_PUBLIC_URL=https://${issuer}:8443
IMGPROXY_ENABLE_WEBP_DETECTION=true
OPENAI_API_KEY=


############
# 函数服务配置
############
FUNCTIONS_VERIFY_JWT=false


############
# 日志分析配置
############
LOGFLARE_PUBLIC_ACCESS_TOKEN=logflare-public-7a9f3c8d7b2e5f1a4c7d9e0b3a
LOGFLARE_PRIVATE_ACCESS_TOKEN=logflare-private-3d5c7b9a0f2e4d6c8b1a3f5e7d
DOCKER_SOCKET_LOCATION=/var/run/docker.sock

# 谷歌云配置（不使用则留空）
GOOGLE_PROJECT_ID=
GOOGLE_PROJECT_NUMBER=


############
# HTTPS证书路径
############
SSL_CERT_FILE=/etc/supabase/cert/${issuer}.pem
SSL_KEY_FILE=/etc/supabase/cert/${issuer}.key

# 其他配置
ENABLE_ANONYMOUS_USERS=false
GOTRUE_MAILER_EXTERNAL_HOSTS=${issuer}:8443`}
                      className="font-mono text-xs h-96"
                    />
                    <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-950 rounded border border-amber-200 dark:border-amber-800">
                      <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                      <div className="text-xs text-amber-800 dark:text-amber-200 space-y-1">
                        <p className="font-semibold">更新步骤：</p>
                        <ol className="list-decimal list-inside ml-2 space-y-1">
                          <li>复制上方的完整配置</li>
                          <li>备份您当前的 .env 文件</li>
                          <li>替换 .env 文件内容</li>
                          <li>运行 <code className="bg-background px-1 py-0.5 rounded">docker compose down</code></li>
                          <li>运行 <code className="bg-background px-1 py-0.5 rounded">docker compose up -d</code></li>
                        </ol>
                      </div>
                    </div>
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
                </CardContent>
              </Card>
            )}

            <Card className="border-green-500 bg-green-50 dark:bg-green-950">
              <CardHeader>
                <CardTitle className="text-green-700 dark:text-green-400 flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5" />
                  如何在 jwt.io 验证
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <ol className="list-decimal list-inside space-y-2 ml-2">
                  <li>访问 <a href="https://jwt.io" target="_blank" rel="noopener noreferrer" className="underline font-semibold">jwt.io</a></li>
                  <li>将生成的密钥粘贴到左侧 "Encoded" 区域</li>
                  <li className="font-bold">
                    在右下角 "VERIFY SIGNATURE" 的密钥输入框中输入：
                    <div className="mt-2 p-3 bg-background rounded border">
                      {secretFormat === 'hex' ? (
                        <>
                          <p className="text-xs mb-2 text-amber-600 dark:text-amber-400">⚠️ 十六进制格式需要特殊处理</p>
                          <p className="text-xs">由于 jwt.io 不直接支持十六进制密钥，您需要：</p>
                          <ol className="text-xs list-decimal list-inside ml-3 mt-1 space-y-1">
                            <li>确保在本工具中选择了"十六进制"格式</li>
                            <li>或者，在 jwt.io 中将密钥按十六进制字节输入</li>
                            <li>更简单的方法：切换到"普通文本"格式重新生成</li>
                          </ol>
                        </>
                      ) : (
                        <>
                          <p className="text-xs font-semibold mb-1">直接输入以下内容：</p>
                          <code className="text-xs break-all block p-2 bg-muted rounded">
                            {jwtSecret}
                          </code>
                        </>
                      )}
                    </div>
                  </li>
                  <li>确认显示 <span className="text-green-600 font-semibold">"Signature Verified ✓"</span></li>
                </ol>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>测试数据库连接</CardTitle>
                <CardDescription>
                  验证您的 Supabase 实例是否可以使用生成的密钥访问
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button 
                  onClick={testDatabaseConnection} 
                  disabled={!anonKey || testingConnection}
                  className="w-full"
                  variant="outline"
                >
                  {testingConnection ? '测试中...' : '测试连接'}
                </Button>

                {connectionResult && (
                  <div className={`p-4 rounded-lg ${
                    connectionResult.success === false 
                      ? 'bg-red-50 dark:bg-red-950 border border-red-200' 
                      : 'bg-green-50 dark:bg-green-950 border border-green-200'
                  }`}>
                    <h4 className="font-semibold mb-2 text-sm">连接测试结果：</h4>
                    <pre className="text-xs overflow-auto bg-background p-3 rounded">
                      {JSON.stringify(connectionResult, null, 2)}
                    </pre>
                  </div>
                )}
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
