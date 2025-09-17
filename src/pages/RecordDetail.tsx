import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, User, Calendar, MapPin, Phone, Building, Heart, Stethoscope } from 'lucide-react';

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
  current_address: string;
  household_address: string;
  phone: string;
  postal_code: string;
  household_postal_code: string;
  work_unit: string;
  work_phone: string;
  work_postal_code: string;
  work_address: string;
  contact_name: string;
  contact_relationship: string;
  contact_phone: string;
  contact_address: string;
  admission_method: string;
  admission_date: string;
  admission_department: string;
  bed_number: string;
  discharge_date: string;
  transfer_department: string;
  discharge_department: string;
  discharge_ward: string;
  actual_stay_days: number;
  diagnosis_info: any;
  pathology_info: any;
  medical_personnel: any;
  quality_control: any;
  created_at: string;
  updated_at: string;
}

const RecordDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [record, setRecord] = useState<MedicalRecord | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecord = async () => {
      if (!id) {
        toast({
          title: "错误",
          description: "记录ID不存在",
          variant: "destructive",
        });
        navigate('/records');
        return;
      }

      try {
        const { data, error } = await supabase
          .from('medical_records')
          .select('*')
          .eq('id', id)
          .maybeSingle();

        if (error) throw error;

        if (!data) {
          toast({
            title: "记录未找到",
            description: "请检查记录是否存在",
            variant: "destructive",
          });
          navigate('/records');
          return;
        }

        setRecord(data);
      } catch (error: any) {
        console.error('Error fetching record:', error);
        toast({
          title: "获取记录失败",
          description: error.message || "获取医疗记录时发生错误",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchRecord();
  }, [id, navigate, toast]);

  const formatDate = (dateString: string) => {
    if (!dateString) return '未填写';
    return new Date(dateString).toLocaleDateString('zh-CN');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">正在加载记录详情...</p>
        </div>
      </div>
    );
  }

  if (!record) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-destructive">记录不存在</h1>
          <p className="mt-2 text-muted-foreground">请检查记录是否存在或您是否有权限访问</p>
          <Button className="mt-4" onClick={() => navigate('/records')}>
            返回记录列表
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/records')}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>返回列表</span>
          </Button>
          <h1 className="text-3xl font-bold">医疗记录详情</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 患者基本信息 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="h-5 w-5" />
              <span>患者基本信息</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">姓名</label>
                <p className="font-semibold">{record.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">性别</label>
                <p>{record.gender}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">年龄</label>
                <p>{record.age}岁</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">出生日期</label>
                <p>{record.birth_date}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">身份证号</label>
                <p>{record.id_number}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">国籍</label>
                <p>{record.nationality}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">民族</label>
                <p>{record.ethnicity}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">婚姻状况</label>
                <p>{record.marital_status}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">职业</label>
                <p>{record.occupation}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">出生地</label>
                <p>{record.birth_place}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 联系方式 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Phone className="h-5 w-5" />
              <span>联系方式</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <label className="text-sm font-medium text-muted-foreground">现住址</label>
              <p>{record.current_address || '未填写'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">户口地址</label>
              <p>{record.household_address || '未填写'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">联系电话</label>
              <p>{record.phone}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">工作单位</label>
              <p>{record.work_unit}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">工作电话</label>
              <p>{record.work_phone || '未填写'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">紧急联系人</label>
              <p>{record.contact_name || '未填写'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">联系人关系</label>
              <p>{record.contact_relationship || '未填写'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">联系人电话</label>
              <p>{record.contact_phone || '未填写'}</p>
            </div>
          </CardContent>
        </Card>

        {/* 入院信息 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5" />
              <span>入院信息</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">入院日期</label>
                <p className="font-semibold">{record.admission_date}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">入院科室</label>
                <p>{record.admission_department}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">入院方式</label>
                <p>{record.admission_method}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">床号</label>
                <p>{record.bed_number}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">出院日期</label>
                <p>{record.discharge_date}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">出院科室</label>
                <p>{record.discharge_department || '未填写'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">实际住院天数</label>
                <p>{record.actual_stay_days}天</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">转科科室</label>
                <p>{record.transfer_department || '无'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 诊断信息 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Stethoscope className="h-5 w-5" />
              <span>诊断信息</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {record.diagnosis_info && (
              <>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">主要诊断</label>
                  <p className="font-semibold">{record.diagnosis_info.main_diagnosis || '未填写'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">主要疾病编码</label>
                  <p>{record.diagnosis_info.main_disease_code || '未填写'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">入院病情</label>
                  <p>{record.diagnosis_info.admission_condition || '未填写'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">门诊诊断</label>
                  <p>{record.diagnosis_info.outpatient_diagnosis || '未填写'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">其他诊断</label>
                  <div className="text-sm">
                    {record.diagnosis_info.other_diagnoses && record.diagnosis_info.other_diagnoses.length > 0 ? (
                      <ul className="list-disc list-inside space-y-1">
                        {record.diagnosis_info.other_diagnoses.map((diagnosis: any, index: number) => (
                          <li key={index}>
                            {typeof diagnosis === 'string' ? diagnosis : diagnosis.diagnosis || JSON.stringify(diagnosis)}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p>无</p>
                    )}
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* 病理信息 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Heart className="h-5 w-5" />
              <span>病理信息</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {record.pathology_info && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">血型</label>
                    <p>{record.pathology_info.blood_type || '未填写'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">RH</label>
                    <p>{record.pathology_info.rh || '未填写'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">药物过敏</label>
                    <p>{record.pathology_info.drug_allergy || '未填写'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">过敏药物</label>
                    <p>{record.pathology_info.allergy_drugs || '无'}</p>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">病理诊断</label>
                  <p>{record.pathology_info.pathology_diagnosis || '未填写'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">病理编号</label>
                  <p>{record.pathology_info.pathology_number || '未填写'}</p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* 医护人员 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Building className="h-5 w-5" />
              <span>医护人员</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {record.medical_personnel && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">主治医师</label>
                  <p>{record.medical_personnel.treating_physician || '未填写'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">主管医师</label>
                  <p>{record.medical_personnel.attending_physician || '未填写'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">住院医师</label>
                  <p>{record.medical_personnel.resident_physician || '未填写'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">实习医师</label>
                  <p>{record.medical_personnel.intern_physician || '未填写'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">责任护士</label>
                  <p>{record.medical_personnel.responsible_nurse || '未填写'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">科室主任</label>
                  <p>{record.medical_personnel.department_director || '未填写'}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 质控信息 */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>质控信息</CardTitle>
          </CardHeader>
          <CardContent>
            {record.quality_control && (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">质控等级</label>
                  <p>{record.quality_control.quality || '未填写'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">质控日期</label>
                  <p>{record.quality_control.quality_date || '未填写'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">质控医师</label>
                  <p>{record.quality_control.quality_physician || '未填写'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">质控护士</label>
                  <p>{record.quality_control.quality_nurse || '未填写'}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 系统信息 */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>系统信息</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">创建时间</label>
                <p>{formatDate(record.created_at)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">更新时间</label>
                <p>{formatDate(record.updated_at)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RecordDetail;