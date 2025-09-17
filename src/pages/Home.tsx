import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Save, FileText, List, LogIn, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { InfoRecognitionForm, FormRef } from "@/components/InfoRecognitionForm";
import ImageUploader from "@/components/ImageUploader";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

const Home = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, isAdmin, signOut } = useAuth();
  const formRef = useRef<FormRef>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [recognitionData, setRecognitionData] = useState<Record<string, any> | null>(null);

  const handleSignOut = async () => {
    await signOut();
    toast({
      title: "已退出登录",
      description: "您已成功退出系统",
    });
  };

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
            
            <div className="flex items-center gap-2">
              {user ? (
                <>
                  <span className="text-sm text-muted-foreground">
                    欢迎，{isAdmin ? "管理员" : "用户"}
                  </span>
                  {isAdmin && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate("/records")}
                      className="flex items-center gap-2"
                    >
                      <List className="w-4 h-4" />
                      查看记录
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleSignOut}
                    className="flex items-center gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    退出
                  </Button>
                </>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate("/auth")}
                  className="flex items-center gap-2"
                >
                  <LogIn className="w-4 h-4" />
                  管理员登录
                </Button>
              )}
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