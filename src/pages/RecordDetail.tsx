import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Edit, Trash2, Loader2 } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

interface MedicalRecord {
  id: string;
  name: string;
  gender: string;
  age: number;
  birth_date: string;
  nationality: string;
  ethnicity: string;
  id_number: string;
  occupation: string;
  marital_status: string;
  birth_place: string;
  native_place: string;
  contact_address: string;
  phone: string;
  postal_code: string;
  work_unit: string;
  admission_method: string;
  admission_date: string;
  admission_department: string;
  bed_number: string;
  discharge_date: string;
  actual_stay_days: number;
  diagnosis_info: any;
  pathology_info: any;
  medical_personnel: any;
  quality_control: any;
  created_at: string;
}

export default function RecordDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [record, setRecord] = useState<MedicalRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (id) {
      fetchRecord();
    }
  }, [id]);

  const fetchRecord = async () => {
    try {
      const { data, error } = await supabase
        .from('medical_records')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setRecord(data);
    } catch (error) {
      toast({
        title: "加载失败",
        description: "无法加载记录详情",
        variant: "destructive",
      });
      navigate('/records');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    
    setDeleting(true);
    try {
      const { error } = await supabase
        .from('medical_records')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "删除成功",
        description: "记录已成功删除",
      });
      navigate('/records');
    } catch (error) {
      toast({
        title: "删除失败",
        description: "无法删除该记录",
        variant: "destructive",
      });
    } finally {
      setDeleting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'yyyy/M/d HH:mm:ss');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!record) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-2">记录不存在</h2>
          <Button onClick={() => navigate('/records')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            返回记录列表
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" onClick={() => navigate('/records')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            返回记录列表
          </Button>
          <div className="space-x-2">
            <Button variant="outline">
              <Edit className="mr-2 h-4 w-4" />
              编辑
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" disabled={deleting}>
                  {deleting ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="mr-2 h-4 w-4" />
                  )}
                  删除
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>确认删除</AlertDialogTitle>
                  <AlertDialogDescription>
                    您确定要删除这条记录吗？此操作无法撤销。
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>取消</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete}>删除</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        <div className="grid gap-6">
          {/* 基本信息 */}
          <Card>
            <CardHeader>
              <CardTitle>基本信息</CardTitle>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-4">
              <div><strong>姓名:</strong> {record.name}</div>
              <div><strong>性别:</strong> {record.gender}</div>
              <div><strong>年龄:</strong> {record.age}</div>
              <div><strong>出生日期:</strong> {record.birth_date}</div>
              <div><strong>出生地:</strong> {record.birth_place}</div>
              <div><strong>籍贯:</strong> {record.native_place}</div>
              <div><strong>国籍:</strong> {record.nationality}</div>
              <div><strong>民族:</strong> {record.ethnicity}</div>
              <div><strong>身份证号:</strong> {record.id_number}</div>
              <div><strong>职业:</strong> {record.occupation}</div>
              <div><strong>婚姻状况:</strong> {record.marital_status}</div>
              <div><strong>工作单位:</strong> {record.work_unit}</div>
              <div><strong>联系地址:</strong> {record.contact_address}</div>
              <div><strong>电话:</strong> {record.phone}</div>
              <div><strong>邮编:</strong> {record.postal_code}</div>
            </CardContent>
          </Card>

          {/* 入院信息 */}
          <Card>
            <CardHeader>
              <CardTitle>入院信息</CardTitle>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-4">
              <div><strong>入院方式:</strong> {record.admission_method}</div>
              <div><strong>入院日期:</strong> {record.admission_date}</div>
              <div><strong>入院科室:</strong> {record.admission_department}</div>
              <div><strong>床号:</strong> {record.bed_number}</div>
              <div><strong>出院日期:</strong> {record.discharge_date}</div>
              <div><strong>实际住院天数:</strong> {record.actual_stay_days}天</div>
            </CardContent>
          </Card>

          {/* 诊断信息 */}
          {record.diagnosis_info && (
            <Card>
              <CardHeader>
                <CardTitle>诊断信息</CardTitle>
              </CardHeader>
              <CardContent>
                {record.diagnosis_info.outpatient_diagnosis && (
                  <div className="mb-2"><strong>门（急）诊诊断:</strong> {record.diagnosis_info.outpatient_diagnosis}</div>
                )}
                {record.diagnosis_info.outpatient_disease_code && (
                  <div className="mb-2"><strong>门诊疾病编码:</strong> {record.diagnosis_info.outpatient_disease_code}</div>
                )}
                {record.diagnosis_info.main_diagnosis && (
                  <div className="mb-2"><strong>主要诊断:</strong> {record.diagnosis_info.main_diagnosis}</div>
                )}
                {record.diagnosis_info.main_disease_code && (
                  <div className="mb-2"><strong>主要诊断疾病编码:</strong> {record.diagnosis_info.main_disease_code}</div>
                )}
                {record.diagnosis_info.admission_condition && (
                  <div className="mb-2"><strong>入院病情:</strong> {record.diagnosis_info.admission_condition}</div>
                )}
                {record.diagnosis_info.other_diagnoses && record.diagnosis_info.other_diagnoses.length > 0 && (
                  <div>
                    <strong>其他诊断:</strong>
                    <ul className="list-disc list-inside ml-4 mt-1">
                      {record.diagnosis_info.other_diagnoses.map((diagnosis: any, index: number) => (
                        <li key={index}>
                          {diagnosis.diagnosis} ({diagnosis.disease_code})
                          {diagnosis.admission_condition && (
                            <span> - 入院病情：{diagnosis.admission_condition}</span>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* 病理信息 */}
          {record.pathology_info && (
            <Card>
              <CardHeader>
                <CardTitle>病理信息</CardTitle>
              </CardHeader>
              <CardContent className="grid md:grid-cols-2 gap-4">
                {record.pathology_info.external_cause && (
                  <div><strong>损伤、中毒的外部原因:</strong> {record.pathology_info.external_cause}</div>
                )}
                {record.pathology_info.external_cause_code && (
                  <div><strong>外因编码:</strong> {record.pathology_info.external_cause_code}</div>
                )}
                {record.pathology_info.pathology_diagnosis && (
                  <div><strong>病理诊断:</strong> {record.pathology_info.pathology_diagnosis}</div>
                )}
                {record.pathology_info.pathology_code && (
                  <div><strong>病理疾病编码:</strong> {record.pathology_info.pathology_code}</div>
                )}
                {record.pathology_info.pathology_number && (
                  <div><strong>病理号:</strong> {record.pathology_info.pathology_number}</div>
                )}
                {record.pathology_info.drug_allergy && (
                  <div><strong>药物过敏:</strong> {record.pathology_info.drug_allergy}</div>
                )}
                {record.pathology_info.allergy_drugs && (
                  <div><strong>过敏药物:</strong> {record.pathology_info.allergy_drugs}</div>
                )}
                {record.pathology_info.autopsy && (
                  <div><strong>死亡患者尸检:</strong> {record.pathology_info.autopsy}</div>
                )}
                {record.pathology_info.blood_type && (
                  <div><strong>血型:</strong> {record.pathology_info.blood_type}</div>
                )}
                {record.pathology_info.rh && (
                  <div><strong>Rh:</strong> {record.pathology_info.rh}</div>
                )}
              </CardContent>
            </Card>
          )}

          {/* 医务人员 */}
          <Card>
            <CardHeader>
              <CardTitle>医务人员</CardTitle>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-4">
              <div>
                <strong>科主任:</strong> 
                <span className={record.medical_personnel?.department_director ? "" : "text-muted-foreground"}>
                  {record.medical_personnel?.department_director || "-"}
                </span>
              </div>
              <div>
                <strong>主任（副主任）医师:</strong> 
                <span className={record.medical_personnel?.attending_physician ? "" : "text-muted-foreground"}>
                  {record.medical_personnel?.attending_physician || "-"}
                </span>
              </div>
              <div>
                <strong>主治医师:</strong> 
                <span className={record.medical_personnel?.treating_physician ? "" : "text-muted-foreground"}>
                  {record.medical_personnel?.treating_physician || "-"}
                </span>
              </div>
              <div>
                <strong>住院医师:</strong> 
                <span className={record.medical_personnel?.resident_physician ? "" : "text-muted-foreground"}>
                  {record.medical_personnel?.resident_physician || "-"}
                </span>
              </div>
              <div>
                <strong>责任护士:</strong> 
                <span className={record.medical_personnel?.responsible_nurse ? "" : "text-muted-foreground"}>
                  {record.medical_personnel?.responsible_nurse || "-"}
                </span>
              </div>
              <div>
                <strong>进修医师:</strong> 
                <span className={record.medical_personnel?.fellow_physician ? "" : "text-muted-foreground"}>
                  {record.medical_personnel?.fellow_physician || "-"}
                </span>
              </div>
              <div>
                <strong>实习医师:</strong> 
                <span className={record.medical_personnel?.intern_physician ? "" : "text-muted-foreground"}>
                  {record.medical_personnel?.intern_physician || "-"}
                </span>
              </div>
              <div>
                <strong>编码员:</strong> 
                <span className={record.medical_personnel?.coder ? "" : "text-muted-foreground"}>
                  {record.medical_personnel?.coder || "-"}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* 质控信息 */}
          {record.quality_control && (
            <Card>
              <CardHeader>
                <CardTitle>质控信息</CardTitle>
              </CardHeader>
              <CardContent className="grid md:grid-cols-2 gap-4">
                {record.quality_control.quality && (
                  <div><strong>质量等级:</strong> {record.quality_control.quality}</div>
                )}
                {record.quality_control.quality_physician && (
                  <div><strong>质控医师:</strong> {record.quality_control.quality_physician}</div>
                )}
                {record.quality_control.quality_nurse && (
                  <div><strong>质控护士:</strong> {record.quality_control.quality_nurse}</div>
                )}
                {record.quality_control.quality_date && (
                  <div><strong>质控日期:</strong> {record.quality_control.quality_date}</div>
                )}
              </CardContent>
            </Card>
          )}

          {/* 记录信息 */}
          <Card>
            <CardHeader>
              <CardTitle>记录信息</CardTitle>
            </CardHeader>
            <CardContent>
              <div><strong>记录ID:</strong> {record.id}</div>
              <div><strong>创建时间:</strong> {formatDate(record.created_at)}</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}