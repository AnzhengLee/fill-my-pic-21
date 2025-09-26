import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Upload, FileImage, X, CheckCircle, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface RecognitionResult {
  [key: string]: any;
}

interface ImageUploaderProps {
  onRecognitionComplete: (data: RecognitionResult) => void;
  isProcessing: boolean;
  setIsProcessing: (processing: boolean) => void;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ 
  onRecognitionComplete, 
  isProcessing, 
  setIsProcessing 
}) => {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [recognitionResult, setRecognitionResult] = useState<RecognitionResult | null>(null);
  const { toast } = useToast();

  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // 验证文件类型和大小
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "文件格式不支持",
        description: "请上传 JPG、PNG 或 PDF 格式的文件",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB 限制
      toast({
        title: "文件过大",
        description: "文件大小不能超过 10MB",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    setUploadProgress(0);
    setRecognitionResult(null);

    try {
      // 创建预览
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);

      // 模拟上传进度
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const maxRetries = 2; // 前端重试2次
      let lastError = '';

      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          console.log(`前端第${attempt}次尝试上传...`);
          
          // 调用识别 Edge Function
          const formData = new FormData();
          formData.append('image', file);

          console.log('调用 Supabase Edge Function...');
          const { data: response, error } = await supabase.functions.invoke('image-recognition', {
            body: formData,
          });

          if (error) {
            throw new Error(`Edge Function 调用失败: ${error.message}`);
          }

          console.log('前端收到响应:', response);
          const data = response;

          if (data && data.success && data.recognitionData) {
            clearInterval(progressInterval);
            setUploadProgress(100);
            setRecognitionResult(data.recognitionData);
            toast({
              title: "识别成功",
              description: "图片信息识别完成，请检查识别结果",
            });
            return; // 成功，退出重试循环
          } else {
            lastError = data?.message || '识别结果为空';
            if (attempt < maxRetries) {
              console.log(`识别结果异常，准备重试...`);
              continue;
            }
            throw new Error(lastError);
          }

        } catch (error) {
          console.error(`第${attempt}次尝试失败:`, error);
          lastError = error instanceof Error ? error.message : '未知错误';
          
          // 如果是网络错误或超时，且还有重试机会
          if (attempt < maxRetries && (
            error.name === 'AbortError' || 
            lastError.includes('timeout') ||
            lastError.includes('fetch') ||
            lastError.includes('NetworkError')
          )) {
            console.log(`网络错误，等待${attempt * 3}秒后重试...`);
            toast({
              title: `网络超时，正在重试 (${attempt}/${maxRetries})`,
              description: "请稍候，正在重新尝试识别...",
              variant: "default",
            });
            await new Promise(resolve => setTimeout(resolve, attempt * 3000));
            continue;
          }
          
          // 最后一次尝试失败
          if (attempt === maxRetries) {
            break;
          }
        }
      }

      // 所有重试都失败了
      throw new Error(lastError);

    } catch (error) {
      console.error('Image recognition error:', error);
      const errorMessage = error instanceof Error ? error.message : '图片识别过程中发生错误';
      
      // 提供更友好的错误信息
      let friendlyMessage = "识别失败，请重新上传或手动填写表单";
      if (errorMessage.includes('timeout') || errorMessage.includes('504')) {
        friendlyMessage = "服务器响应超时，请稍后重试或手动填写表单";
      } else if (errorMessage.includes('503') || errorMessage.includes('502')) {
        friendlyMessage = "服务暂时不可用，请稍后重试或手动填写表单";
      } else if (errorMessage.includes('401') || errorMessage.includes('403')) {
        friendlyMessage = "服务认证错误，请联系管理员";
      }
      
      toast({
        title: "识别失败",
        description: friendlyMessage,
        variant: "destructive",
        action: (
          <Button variant="outline" size="sm" onClick={() => {
            const input = event.target;
            if (input) {
              input.value = '';
              input.click();
            }
          }}>
            重试
          </Button>
        ),
      });
    } finally {
      setIsProcessing(false);
    }
  }, [toast, setIsProcessing]);

  const handleApplyResults = () => {
    if (recognitionResult) {
      onRecognitionComplete(recognitionResult);
      toast({
        title: "数据已应用",
        description: "识别结果已填入表单，请检查并确认",
      });
    }
  };

  const handleClearImage = () => {
    setUploadedImage(null);
    setRecognitionResult(null);
    setUploadProgress(0);
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="w-5 h-5" />
          图片上传与识别
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!uploadedImage ? (
          <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
            <FileImage className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                上传医疗记录图片，系统将自动识别其中的信息
              </p>
              <Input
                type="file"
                accept="image/*,.pdf"
                onChange={handleFileUpload}
                disabled={isProcessing}
                className="max-w-xs mx-auto"
              />
              <p className="text-xs text-muted-foreground">
                支持 JPG、PNG、PDF 格式，最大 10MB
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* 图片预览 */}
            <div className="relative">
              <img
                src={uploadedImage}
                alt="上传的医疗记录"
                className="max-w-full h-48 object-contain mx-auto border rounded-lg"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearImage}
                className="absolute top-2 right-2"
                disabled={isProcessing}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* 处理进度 */}
            {isProcessing && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <div className="animate-spin w-4 h-4 border-2 border-primary border-t-transparent rounded-full" />
                  识别中...
                </div>
                <Progress value={uploadProgress} className="w-full" />
              </div>
            )}

            {/* 识别结果 */}
            {recognitionResult && !isProcessing && (
              <div className="border rounded-lg p-4 bg-muted/50">
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="font-medium text-sm">识别完成</span>
                </div>
                <div className="space-y-2 text-sm">
                  <p className="text-muted-foreground">
                    识别到 {Object.keys(recognitionResult).length} 个字段的信息
                  </p>
                  <ScrollArea className="h-80" scrollHideDelay={0}>
                    <div className="grid grid-cols-2 gap-2 pr-4">
                      {Object.entries(recognitionResult).map(([key, value]) => (
                        <div key={key} className="text-xs">
                          <span className="font-medium">{key}:</span>
                          <span className="ml-1 text-muted-foreground">
                            {String(value).substring(0, 20)}
                            {String(value).length > 20 ? '...' : ''}
                          </span>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
                <Button
                  onClick={handleApplyResults}
                  className="w-full mt-3"
                  size="sm"
                >
                  应用识别结果到表单
                </Button>
              </div>
            )}

            {!recognitionResult && !isProcessing && (
              <div className="flex items-center gap-2 text-sm text-amber-600">
                <AlertCircle className="w-4 h-4" />
                识别失败，请重新上传或手动填写表单
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ImageUploader;