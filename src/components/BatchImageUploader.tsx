import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Upload, FileImage, X, CheckCircle, AlertCircle, Play, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface RecognitionResult {
  [key: string]: any;
}

interface ImageData {
  id: string;
  file: File;
  preview: string;
  status: 'uploaded' | 'processing' | 'completed' | 'failed';
  recognitionResult?: RecognitionResult;
  error?: string;
}

interface BatchImageUploaderProps {
  onRecognitionComplete: (data: RecognitionResult) => void;
  isProcessing: boolean;
  setIsProcessing: (processing: boolean) => void;
}

const BatchImageUploader: React.FC<BatchImageUploaderProps> = ({ 
  onRecognitionComplete, 
  isProcessing, 
  setIsProcessing 
}) => {
  const [images, setImages] = useState<ImageData[]>([]);
  const [overallProgress, setOverallProgress] = useState(0);
  const { toast } = useToast();

  const generateId = () => Math.random().toString(36).substr(2, 9);

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    
    if (files.length === 0) return;

    // 检查文件数量限制
    if (images.length + files.length > 5) {
      toast({
        title: "文件数量超限",
        description: "最多只能上传5张图片",
        variant: "destructive",
      });
      return;
    }

    const newImages: ImageData[] = [];

    files.forEach((file, index) => {
      // 验证文件类型
      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "文件格式不支持",
          description: `文件 ${file.name} 格式不支持，请上传 JPG、PNG 或 PDF 格式`,
          variant: "destructive",
        });
        return;
      }

      // 验证文件大小
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "文件过大",
          description: `文件 ${file.name} 超过 10MB 限制`,
          variant: "destructive",
        });
        return;
      }

      // 创建预览
      const reader = new FileReader();
      const imageData: ImageData = {
        id: generateId(),
        file,
        preview: '',
        status: 'uploaded'
      };

      reader.onload = (e) => {
        imageData.preview = e.target?.result as string;
        setImages(prev => [...prev.filter(img => img.id !== imageData.id), imageData]);
      };
      reader.readAsDataURL(file);

      newImages.push(imageData);
    });

    // 清空 input 值以允许重新选择相同文件
    event.target.value = '';
  }, [images, toast]);

  const handleRemoveImage = (id: string) => {
    setImages(prev => prev.filter(img => img.id !== id));
  };

  const handleClearAll = () => {
    setImages([]);
    setOverallProgress(0);
  };

  const processImage = async (imageData: ImageData): Promise<void> => {
    const maxRetries = 2;
    let lastError = '';

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const formData = new FormData();
        formData.append('image', imageData.file);

        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 120000);

        const response = await fetch('https://vmihkigligqwsauzryvf.supabase.co/functions/v1/image-recognition', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZtaWhraWdsaWdxd3NhdXpyeXZmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc2OTQ5OTksImV4cCI6MjA3MzI3MDk5OX0.5Csjmdy6jE__fZ1wJHTKvbFqNDJeD50L13lrl7MFCBo`,
          },
          body: formData,
          signal: controller.signal,
        });

        clearTimeout(timeout);

        if (!response.ok) {
          const errorText = await response.text();
          lastError = `HTTP ${response.status}: ${errorText}`;
          
          if (response.status >= 500 && attempt < maxRetries) {
            await new Promise(resolve => setTimeout(resolve, attempt * 3000));
            continue;
          }
          
          throw new Error(lastError);
        }

        const data = await response.json();

        if (data && data.success && data.recognitionData) {
          setImages(prev => prev.map(img => 
            img.id === imageData.id 
              ? { ...img, status: 'completed', recognitionResult: data.recognitionData }
              : img
          ));
          return;
        } else {
          lastError = data?.message || '识别结果为空';
          if (attempt < maxRetries) {
            continue;
          }
          throw new Error(lastError);
        }

      } catch (error) {
        lastError = error instanceof Error ? error.message : '未知错误';
        
        if (attempt < maxRetries && (
          error.name === 'AbortError' || 
          lastError.includes('timeout') ||
          lastError.includes('fetch')
        )) {
          await new Promise(resolve => setTimeout(resolve, attempt * 3000));
          continue;
        }
        
        if (attempt === maxRetries) {
          break;
        }
      }
    }

    // 识别失败
    setImages(prev => prev.map(img => 
      img.id === imageData.id 
        ? { ...img, status: 'failed', error: lastError }
        : img
    ));
  };

  const handleStartRecognition = async () => {
    const uploadedImages = images.filter(img => img.status === 'uploaded');
    
    if (uploadedImages.length === 0) {
      toast({
        title: "没有可识别的图片",
        description: "请先上传图片",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    setOverallProgress(0);

    // 设置所有图片为处理中状态
    setImages(prev => prev.map(img => 
      img.status === 'uploaded' ? { ...img, status: 'processing' } : img
    ));

    try {
      // 并发处理所有图片
      const promises = uploadedImages.map(img => processImage(img));
      
      let completed = 0;
      
      // 使用 Promise.allSettled 确保部分失败不影响其他图片
      const results = await Promise.allSettled(promises);
      
      setOverallProgress(100);
      
      const successCount = results.filter(result => result.status === 'fulfilled').length;
      const failedCount = results.filter(result => result.status === 'rejected').length;
      
      toast({
        title: "批量识别完成",
        description: `成功识别 ${successCount} 张图片${failedCount > 0 ? `，${failedCount} 张失败` : ''}`,
        variant: successCount > 0 ? "default" : "destructive",
      });

    } catch (error) {
      console.error('Batch recognition error:', error);
      toast({
        title: "批量识别失败",
        description: "识别过程中发生错误，请重试",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleApplyResult = (result: RecognitionResult, imageId: string) => {
    onRecognitionComplete(result);
    toast({
      title: "结果已应用",
      description: "识别结果已填入表单，请检查并确认",
    });
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="w-5 h-5" />
          批量图片上传与识别（最多5张）
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* 上传区域 */}
        <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
          <FileImage className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              选择或拖拽医疗记录图片到此处（最多5张）
            </p>
            <Input
              type="file"
              accept="image/*,.pdf"
              multiple
              onChange={handleFileUpload}
              disabled={isProcessing}
              className="max-w-xs mx-auto"
            />
            <p className="text-xs text-muted-foreground">
              支持 JPG、PNG、PDF 格式，每个文件最大 10MB
            </p>
          </div>
        </div>

        {/* 图片预览网格 */}
        {images.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">已上传图片 ({images.length}/5)</span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleStartRecognition}
                  disabled={isProcessing || images.filter(img => img.status === 'uploaded').length === 0}
                  className="flex items-center gap-2"
                >
                  <Play className="w-4 h-4" />
                  开始批量识别
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClearAll}
                  disabled={isProcessing}
                  className="flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  清空所有
                </Button>
              </div>
            </div>

            {/* 整体进度条 */}
            {isProcessing && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <div className="animate-spin w-4 h-4 border-2 border-primary border-t-transparent rounded-full" />
                  批量识别中...
                </div>
                <Progress value={overallProgress} className="w-full" />
              </div>
            )}

            {/* 图片网格 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {images.map((image) => (
                <div key={image.id} className="border rounded-lg p-4 space-y-3">
                  {/* 图片预览 */}
                  <div className="relative">
                    <img
                      src={image.preview}
                      alt={`上传的图片 ${image.id}`}
                      className="w-full h-32 object-cover rounded"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRemoveImage(image.id)}
                      disabled={isProcessing}
                      className="absolute top-1 right-1 h-8 w-8 p-0"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>

                  {/* 状态指示 */}
                  <div className="flex items-center gap-2 text-sm">
                    {image.status === 'uploaded' && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <div className="w-2 h-2 bg-gray-400 rounded-full" />
                        等待识别
                      </div>
                    )}
                    {image.status === 'processing' && (
                      <div className="flex items-center gap-2 text-blue-600">
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                        识别中...
                      </div>
                    )}
                    {image.status === 'completed' && (
                      <div className="flex items-center gap-2 text-green-600">
                        <CheckCircle className="w-4 h-4" />
                        识别完成
                      </div>
                    )}
                    {image.status === 'failed' && (
                      <div className="flex items-center gap-2 text-red-600">
                        <AlertCircle className="w-4 h-4" />
                        识别失败
                      </div>
                    )}
                  </div>

                  {/* 识别结果预览 */}
                  {image.status === 'completed' && image.recognitionResult && (
                    <div className="space-y-2">
                      <div className="bg-muted/50 rounded p-2">
                        <p className="text-xs text-muted-foreground mb-1">
                          识别到 {Object.keys(image.recognitionResult).length} 个字段
                        </p>
                        <ScrollArea className="h-20">
                          <div className="space-y-1">
                            {Object.entries(image.recognitionResult).slice(0, 3).map(([key, value]) => (
                              <div key={key} className="text-xs">
                                <span className="font-medium">{key}:</span>
                                <span className="ml-1 text-muted-foreground">
                                  {String(value).substring(0, 15)}
                                  {String(value).length > 15 ? '...' : ''}
                                </span>
                              </div>
                            ))}
                            {Object.keys(image.recognitionResult).length > 3 && (
                              <p className="text-xs text-muted-foreground">
                                还有 {Object.keys(image.recognitionResult).length - 3} 个字段...
                              </p>
                            )}
                          </div>
                        </ScrollArea>
                      </div>
                      <Button
                        onClick={() => handleApplyResult(image.recognitionResult!, image.id)}
                        size="sm"
                        className="w-full"
                      >
                        应用此结果
                      </Button>
                    </div>
                  )}

                  {/* 错误信息 */}
                  {image.status === 'failed' && image.error && (
                    <div className="text-xs text-red-600 bg-red-50 p-2 rounded">
                      {image.error}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BatchImageUploader;