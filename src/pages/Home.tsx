import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Save, FileText, List, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { InfoRecognitionForm, FormRef } from "@/components/InfoRecognitionForm";
import ImageUploader from "@/components/ImageUploader";
import { useToast } from "@/hooks/use-toast";

const Home = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const formRef = useRef<FormRef>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [recognitionData, setRecognitionData] = useState<Record<string, any> | null>(null);
  const [isAdminHovered, setIsAdminHovered] = useState(false);

  const handleRecognitionComplete = (data: Record<string, any>) => {
    setRecognitionData(data);
    // 直接调用表单的填充方法
    if (formRef.current) {
      formRef.current.populateFormData(data);
      toast({
        title: "数据填充成功",
        description: "识别结果已自动填充到表单中",
      });
    }
  };

  const handleSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      // Form submission will be handled in the InfoRecognitionForm component
      console.log("Form data:", data);
      
      // 清空识别数据状态
      setRecognitionData(null);
      
      toast({
        title: "保存成功",
        description: "医疗信息记录已成功保存",
      });
    } catch (error) {
      toast({
        title: "保存失败",
        description: "保存数据时发生错误，请重试",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <FileText className="w-6 h-6 text-primary" />
              </div>
              <h1 className="text-3xl font-bold text-foreground">医疗信息识别系统</h1>
            </div>
            
            <div 
              className="relative flex items-center gap-3 min-w-[120px] min-h-[40px] justify-end"
              onMouseEnter={() => setIsAdminHovered(true)}
              onMouseLeave={() => setIsAdminHovered(false)}
            >
              {/* Subtle visual hint */}
              <div className={`absolute right-0 top-1/2 transform -translate-y-1/2 transition-opacity duration-300 ${
                isAdminHovered ? 'opacity-0' : 'opacity-30'
              }`}>
                <Shield className="w-4 h-4 text-muted-foreground" />
              </div>
              
              {/* Admin button */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/admin-login")}
                className={`flex items-center gap-2 transition-all duration-300 ${
                  isAdminHovered 
                    ? 'opacity-100 pointer-events-auto translate-x-0' 
                    : 'opacity-0 pointer-events-none translate-x-4'
                }`}
              >
                <Shield className="w-4 h-4" />
                管理后台
              </Button>
            </div>
          </div>
          
          <p className="text-muted-foreground">
            上传医疗文档图片，使用AI技术自动识别并填写医疗信息记录表
          </p>
        </div>

        {/* Image Upload Card */}
        <ImageUploader
          onRecognitionComplete={handleRecognitionComplete}
          isProcessing={isProcessing}
          setIsProcessing={setIsProcessing}
        />

        {/* Form Card */}
        <Card className="shadow-lg">
          <CardHeader className="border-b">
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              医疗信息记录表
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <InfoRecognitionForm 
              ref={formRef}
              onSubmit={handleSubmit}
              isSubmitting={isSubmitting}
              initialData={recognitionData}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Home;