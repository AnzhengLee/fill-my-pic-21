import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Badge } from '@/components/ui/badge';
import { Upload, FileImage, X, CheckCircle, AlertCircle, Play, Trash2, ChevronDown, ChevronUp, Eye } from 'lucide-react';
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

  // 获取关键字段的预览信息
  const getKeyFields = (result: RecognitionResult) => {
    const keyFields = ['姓名', '性别', '年龄', '主要诊断', '入院时间', '出院时间'];
    const foundFields: { key: string; value: any }[] = [];
    
    const extractValue = (obj: any, path: string): any => {
      if (typeof obj !== 'object' || obj === null) return obj;
      
      // 直接查找
      if (obj[path]) return obj[path];
      
      // 在嵌套对象中查找
      for (const [key, value] of Object.entries(obj)) {
        if (typeof value === 'object' && value !== null) {
          const nestedResult = extractValue(value, path);
          if (nestedResult) return nestedResult;
        }
      }
      return null;
    };

    keyFields.forEach(field => {
      const value = extractValue(result, field);
      if (value && value !== '') {
        foundFields.push({ key: field, value });
      }
    });

    return foundFields;
  };

  // 计算数据质量
  const getDataQuality = (result: RecognitionResult) => {
    const totalKeys = Object.keys(result).length;
    const filledKeys = Object.values(result).filter(value => 
      value && value !== '' && value !== null && value !== undefined
    ).length;
    
    const fillRate = totalKeys > 0 ? Math.round((filledKeys / totalKeys) * 100) : 0;
    const keyFields = getKeyFields(result);
    
    return {
      totalFields: totalKeys,
      filledFields: filledKeys,
      fillRate,
      keyFieldsCount: keyFields.length,
      hasKeyInfo: keyFields.length >= 3
    };
  };

  return (
    <>
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
                    <RecognitionResultPreview 
                      result={image.recognitionResult}
                      imageId={image.id}
                      onApplyResult={handleApplyResult}
                    />
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
    </>
  );
};

// 识别结果预览组件
const RecognitionResultPreview: React.FC<{
  result: RecognitionResult;
  imageId: string;
  onApplyResult: (result: RecognitionResult, imageId: string) => void;
}> = ({ result, imageId, onApplyResult }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getKeyFields = (result: RecognitionResult) => {
    const keyFields = ['姓名', '性别', '年龄', '主要诊断', '入院时间', '出院时间'];
    const foundFields: { key: string; value: any }[] = [];
    
    const extractValue = (obj: any, path: string): any => {
      if (typeof obj !== 'object' || obj === null) return obj;
      
      // 直接查找
      if (obj[path]) return obj[path];
      
      // 在嵌套对象中查找
      for (const [key, value] of Object.entries(obj)) {
        if (typeof value === 'object' && value !== null) {
          const nestedResult = extractValue(value, path);
          if (nestedResult) return nestedResult;
        }
      }
      return null;
    };

    keyFields.forEach(field => {
      const value = extractValue(result, field);
      if (value && value !== '') {
        foundFields.push({ key: field, value });
      }
    });

    return foundFields;
  };

  const getDataQuality = (result: RecognitionResult) => {
    const totalKeys = Object.keys(result).length;
    const filledKeys = Object.values(result).filter(value => 
      value && value !== '' && value !== null && value !== undefined
    ).length;
    
    const fillRate = totalKeys > 0 ? Math.round((filledKeys / totalKeys) * 100) : 0;
    const keyFields = getKeyFields(result);
    
    return {
      totalFields: totalKeys,
      filledFields: filledKeys,
      fillRate,
      keyFieldsCount: keyFields.length,
      hasKeyInfo: keyFields.length >= 3
    };
  };

  const renderValue = (value: any): string => {
    if (typeof value === 'object' && value !== null) {
      if (Array.isArray(value)) {
        return value.join(', ');
      }
      return JSON.stringify(value, null, 2);
    }
    return String(value);
  };

  const keyFields = getKeyFields(result);
  const quality = getDataQuality(result);

  return (
    <div className="space-y-3">
      {/* 数据质量指标 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge variant={quality.hasKeyInfo ? "default" : "secondary"}>
            {quality.totalFields} 字段
          </Badge>
          <Badge variant={quality.fillRate >= 70 ? "default" : quality.fillRate >= 40 ? "secondary" : "outline"}>
            {quality.fillRate}% 填充率
          </Badge>
        </div>
        <Badge variant={quality.keyFieldsCount >= 4 ? "default" : "outline"}>
          {quality.keyFieldsCount}/6 关键信息
        </Badge>
      </div>

      {/* 关键字段预览 */}
      <div className="bg-muted/50 rounded-lg p-3">
        {keyFields.length > 0 ? (
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground mb-2">关键信息预览</p>
            {keyFields.slice(0, 4).map(({ key, value }) => (
              <div key={key} className="flex justify-between items-start text-sm">
                <span className="font-medium text-foreground">{key}:</span>
                <span className="text-muted-foreground text-right max-w-[60%] break-words">
                  {renderValue(value)}
                </span>
              </div>
            ))}
            {keyFields.length > 4 && (
              <p className="text-xs text-muted-foreground">
                还有 {keyFields.length - 4} 个关键字段...
              </p>
            )}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">
            未识别到标准关键字段，请展开查看完整结果
          </p>
        )}
      </div>

      {/* 展开/收起详细结果 */}
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" size="sm" className="w-full justify-between p-2">
            <span className="flex items-center gap-2">
              <Eye className="w-4 h-4" />
              查看完整识别结果
            </span>
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="mt-2 p-3 bg-muted/30 rounded-lg border">
            <ScrollArea className="h-48">
              <div className="space-y-2">
                {Object.entries(result).map(([key, value]) => (
                  <div key={key} className="text-xs border-b border-border/50 pb-1">
                    <div className="font-medium text-foreground mb-1">{key}:</div>
                    <div className="text-muted-foreground pl-2 whitespace-pre-wrap">
                      {renderValue(value)}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* 应用结果按钮 */}
      <Button
        onClick={() => onApplyResult(result, imageId)}
        size="sm"
        className="w-full"
        variant={quality.hasKeyInfo ? "default" : "outline"}
      >
        应用此结果到表单
        {quality.hasKeyInfo && <CheckCircle className="w-4 h-4 ml-2" />}
      </Button>
    </div>
  );
};

export default BatchImageUploader;