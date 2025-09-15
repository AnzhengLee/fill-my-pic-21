import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { InfoRecognitionForm, FormRef } from '@/components/InfoRecognitionForm';
import { MedicalRecord } from '@/lib/supabase';

export default function RecordEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [record, setRecord] = useState<MedicalRecord | null>(null);
  const formRef = useRef<FormRef>(null);

  useEffect(() => {
    if (id && isValidUUID(id)) {
      fetchRecord();
    } else {
      toast({
        title: "无效的记录ID",
        description: "请从记录列表中选择有效的记录",
        variant: "destructive",
      });
      navigate('/records');
      setLoading(false);
    }
  }, [id]);

  const isValidUUID = (uuid: string) => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  };

  const fetchRecord = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('medical_records')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      
      if (!data) {
        toast({
          title: "记录不存在",
          description: "未找到指定的医疗记录",
          variant: "destructive",
        });
        navigate('/records');
        return;
      }
      
      setRecord(data as any);
      
      // 数据将通过 initialData prop 传递给表单组件
      console.log('获取到记录数据:', data);
    } catch (error) {
      console.error('Error fetching record:', error);
      toast({
        title: "加载失败",
        description: "无法加载记录详情，请稍后重试",
        variant: "destructive",
      });
      navigate('/records');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (formData: any) => {
    try {
      setSubmitting(true);
      
      const { error } = await supabase
        .from('medical_records')
        .update({
          ...formData,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "更新成功",
        description: "医疗记录已成功更新",
      });
      
      navigate(`/records/${id}`);
    } catch (error) {
      console.error('Error updating record:', error);
      toast({
        title: "更新失败",
        description: "更新医疗记录时发生错误，请稍后重试",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!record) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">记录不存在</h2>
          <Button onClick={() => navigate('/records')} variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            返回记录列表
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Button 
            onClick={() => navigate(`/records/${id}`)} 
            variant="outline"
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            返回详情
          </Button>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">编辑医疗记录</h1>
          <p className="text-gray-600">患者姓名: {record.name}</p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <InfoRecognitionForm
            ref={formRef}
            onSubmit={handleSubmit}
            isSubmitting={submitting}
            initialData={record}
          />
        </div>
      </div>
    </div>
  );
}