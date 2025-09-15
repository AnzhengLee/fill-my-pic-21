import React, { useState, useImperativeHandle, forwardRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarIcon, Plus, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

// Form validation schema
const formSchema = z.object({
  // Basic information
  name: z.string().min(1, "姓名不能为空"),
  gender: z.string().min(1, "请选择性别"),
  birth_date: z.date().optional(),
  age: z.number().min(0).optional(),
  nationality: z.string().optional(),
  birth_place: z.string().optional(),
  native_place: z.string().optional(),
  ethnicity: z.string().optional(),
  id_number: z.string().optional(),
  occupation: z.string().optional(),
  marital_status: z.string().optional(),
  current_address: z.string().optional(),
  phone: z.string().optional(),
  postal_code: z.string().optional(),
  household_address: z.string().optional(),
  household_postal_code: z.string().optional(),
  work_unit: z.string().optional(),
  work_phone: z.string().optional(),
  work_postal_code: z.string().optional(),
  
  // Contact person
  contact_name: z.string().optional(),
  contact_relationship: z.string().optional(),
  contact_address: z.string().optional(),
  contact_phone: z.string().optional(),
  
  // Admission info
  admission_path: z.string().optional(),
  admission_time: z.string().optional(),
  admission_department: z.string().optional(),
  transfer_department: z.string().optional(),
  admission_ward: z.string().optional(),
  
  // Discharge info
  discharge_time: z.string().optional(),
  discharge_department: z.string().optional(),
  discharge_ward: z.string().optional(),
  actual_days: z.string().optional(),
  
  // Diagnosis info
  outpatient_diagnosis: z.string().optional(),
  outpatient_disease_code: z.string().optional(),
  main_diagnosis: z.string().optional(),
  main_disease_code: z.string().optional(),
  admission_condition: z.string().optional(),
  
  // Pathology info
  external_cause: z.string().optional(),
  external_cause_code: z.string().optional(),
  pathology_diagnosis: z.string().optional(),
  disease_code: z.string().optional(),
  pathology_code: z.string().optional(),
  pathology_number: z.string().optional(),
  drug_allergy: z.string().optional(),
  allergy_drugs: z.string().optional(),
  autopsy: z.string().optional(),
  blood_type: z.string().optional(),
  rh: z.string().optional(),
  
  // Medical personnel
  department_director: z.string().optional(),
  attending_physician: z.string().optional(),
  treating_physician: z.string().optional(),
  resident_physician: z.string().optional(),
  intern_physician: z.string().optional(),
  responsible_nurse: z.string().optional(),
  fellow_physician: z.string().optional(),
  medical_student: z.string().optional(),
  coder: z.string().optional(),
  
  // Quality control
  quality: z.string().optional(),
  quality_physician: z.string().optional(),
  quality_nurse: z.string().optional(),
  quality_date: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface InfoRecognitionFormProps {
  onSubmit: (data: any) => void;
  isSubmitting: boolean;
  initialData?: Record<string, any>;
}

export type FormRef = {
  populateFormData: (data: Record<string, any>) => void;
};

export const InfoRecognitionForm = forwardRef<FormRef, InfoRecognitionFormProps>(
  ({ onSubmit, isSubmitting, initialData }, ref) => {
    const { toast } = useToast();
    const [otherDiagnoses, setOtherDiagnoses] = useState<Array<{
      diagnosis: string;
      disease_code: string;
      admission_condition: string;
    }>>([{ diagnosis: '', disease_code: '', admission_condition: '' }]);

    const form = useForm<FormData>({
      resolver: zodResolver(formSchema),
      defaultValues: {
        name: "",
        gender: "",
        birth_date: undefined,
        age: undefined,
      },
    });

    const {
      register,
      handleSubmit,
      watch,
      setValue,
      formState: { errors },
    } = form;

    // 渐进式数据填充函数
    const populateFormData = (data: Record<string, any>) => {
      console.log('开始渐进式填充表单数据:', data);
      
      try {
        // 阶段1：基本信息填充
        if (data.name) setValue('name', data.name);
        if (data.gender) setValue('gender', data.gender);
        if (data.age) setValue('age', parseInt(data.age));
        if (data.birth_date) {
          const date = new Date(data.birth_date);
          if (!isNaN(date.getTime())) {
            setValue('birth_date', date);
          }
        }
        if (data.nationality) setValue('nationality', data.nationality);
        if (data.birth_place) setValue('birth_place', data.birth_place);
        if (data.native_place) setValue('native_place', data.native_place);
        if (data.ethnicity) setValue('ethnicity', data.ethnicity);
        if (data.id_number) setValue('id_number', data.id_number);
        if (data.occupation) setValue('occupation', data.occupation);
        if (data.marital_status) setValue('marital_status', data.marital_status);
        if (data.current_address) setValue('current_address', data.current_address);
        if (data.phone) setValue('phone', data.phone);
        if (data.postal_code) setValue('postal_code', data.postal_code);
        if (data.household_address) setValue('household_address', data.household_address);
         if (data.household_postal_code) setValue('household_postal_code', data.household_postal_code);
        setValue('work_unit', data.work_unit || '-');
        setValue('work_phone', data.work_phone || '-');
        setValue('work_postal_code', data.work_postal_code || '-');
        console.log('✓ 阶段1完成: 基本信息已填入');

        // 阶段2：联系人信息填充
        if (data.contact_name) setValue('contact_name', data.contact_name);
        if (data.contact_phone) setValue('contact_phone', data.contact_phone);
        if (data.contact_relationship) setValue('contact_relationship', data.contact_relationship);
        if (data.contact_address) setValue('contact_address', data.contact_address);
        console.log('✓ 阶段2完成: 联系人信息已填入');

        // 阶段3：入院信息填充
        if (data.admission_department) setValue('admission_department', data.admission_department);
        if (data.admission_ward) setValue('admission_ward', data.admission_ward);
        if (data.admission_time) setValue('admission_time', data.admission_time);
        if (data.admission_path) setValue('admission_path', data.admission_path);
        if (data.transfer_department) setValue('transfer_department', data.transfer_department);
        // console.log('✓ 阶段3完成: 入院信息已填入');

        // 阶段4：出院信息填充
        if (data.discharge_time) setValue('discharge_time', data.discharge_time);
        if (data.discharge_department) setValue('discharge_department', data.discharge_department);
        if (data.discharge_ward) setValue('discharge_ward', data.discharge_ward);
        if (data.actual_days) setValue('actual_days', data.actual_days);
        // console.log('✓ 阶段4完成: 出院信息已填入');

        // 阶段5：主要诊断信息填充
        if (data.outpatient_diagnosis) setValue('outpatient_diagnosis', data.outpatient_diagnosis);
        if (data.main_diagnosis) setValue('main_diagnosis', data.main_diagnosis);
        if (data.main_disease_code) setValue('main_disease_code', data.main_disease_code);
        if (data.admission_condition) setValue('admission_condition', data.admission_condition);
        // console.log('✓ 阶段5完成: 主要诊断信息已填入');

        // 阶段6：病理信息填充
        if (data.pathology_diagnosis) setValue('pathology_diagnosis', data.pathology_diagnosis);
        if (data.disease_code) setValue('disease_code', data.disease_code);
        if (data.pathology_number) setValue('pathology_number', data.pathology_number);
        if (data.pathology_code) setValue('pathology_code', data.pathology_code);
        if (data.drug_allergy) setValue('drug_allergy', data.drug_allergy);
        if (data.allergy_drugs) setValue('allergy_drugs', data.allergy_drugs);
        if (data.blood_type) setValue('blood_type', data.blood_type);
        if (data.rh) setValue('rh', data.rh);
        if (data.autopsy) setValue('autopsy', data.autopsy);
        if (data.external_cause) setValue('external_cause', data.external_cause);
        if (data.external_cause_code) setValue('external_cause_code', data.external_cause_code);
        // console.log('✓ 阶段6完成: 病理信息已填入');

        // 阶段7：医务人员信息填充
        if (data.department_director) setValue('department_director', data.department_director);
        if (data.attending_physician) setValue('attending_physician', data.attending_physician);
        if (data.treating_physician) setValue('treating_physician', data.treating_physician);
        if (data.resident_physician) setValue('resident_physician', data.resident_physician);
        if (data.intern_physician) setValue('intern_physician', data.intern_physician);
        if (data.fellow_physician) setValue('fellow_physician', data.fellow_physician);
        if (data.responsible_nurse) setValue('responsible_nurse', data.responsible_nurse);
        if (data.coder) setValue('coder', data.coder);
        // console.log('✓ 阶段7完成: 医务人员信息已填入');

        // 阶段8：质控信息填充
        if (data.quality) setValue('quality', data.quality);
        if (data.quality_physician) setValue('quality_physician', data.quality_physician);
        if (data.quality_nurse) setValue('quality_nurse', data.quality_nurse);
        if (data.quality_date) setValue('quality_date', data.quality_date);
        // console.log('✓ 阶段8完成: 质控信息已填入');

        // 阶段9：门急诊疾病编码填充
        if (data.outpatient_disease_code) {
          setValue('outpatient_disease_code', data.outpatient_disease_code);
          // console.log('✓ 阶段9完成: 门急诊疾病编码已填入');
        }

        // 阶段10：其他诊断数据填充
        if (data.other_diagnoses && Array.isArray(data.other_diagnoses)) {
          const validDiagnoses = data.other_diagnoses.filter((d: any) => 
            d.diagnosis || d.disease_code || d.admission_condition
          );
          if (validDiagnoses.length > 0) {
            setOtherDiagnoses(validDiagnoses);
            // console.log('✓ 阶段10完成: 其他诊断数据已填入');
          }
        }

        toast({
          title: "数据填充完成",
          description: "已成功将识别的数据填入表单",
        });

      } catch (error) {
        console.error('数据填充过程中出错:', error);
        toast({
          title: "数据填充失败",
          description: "填充数据时发生错误，请检查数据格式",
          variant: "destructive",
        });
      }
    };

    // 暴露方法给父组件
    useImperativeHandle(ref, () => ({
      populateFormData
    }));

    const addOtherDiagnosis = () => {
      setOtherDiagnoses([...otherDiagnoses, { diagnosis: '', disease_code: '', admission_condition: '' }]);
    };

    const removeOtherDiagnosis = (index: number) => {
      if (otherDiagnoses.length > 1) {
        setOtherDiagnoses(otherDiagnoses.filter((_, i) => i !== index));
      }
    };


    const updateOtherDiagnosis = (index: number, field: keyof typeof otherDiagnoses[0], value: string) => {
      const newDiagnoses = [...otherDiagnoses];
      newDiagnoses[index] = { ...newDiagnoses[index], [field]: value };
      setOtherDiagnoses(newDiagnoses);
    };

    const onFormSubmit = async (data: FormData) => {
      try {
        // 准备表单数据
        const formData = { ...data };
        
        
        // 添加其他诊断
        const validOtherDiagnoses = otherDiagnoses.filter(d => 
          d.diagnosis.trim() || d.disease_code.trim() || d.admission_condition.trim()
        );

        // 准备数据库数据结构 - 匹配数据库表结构 (匿名提交，user_id为null)
        const dbData = {
          user_id: null, // 匿名提交
          name: data.name,
          gender: data.gender,
          birth_date: data.birth_date ? data.birth_date.toISOString().split('T')[0] : '',
          age: data.age || 0,
          nationality: data.nationality || '',
          birth_place: data.birth_place || '',
          native_place: data.native_place || '',
          ethnicity: data.ethnicity || '',
          id_number: data.id_number || '',
          occupation: data.occupation || '',
          marital_status: data.marital_status || '',
          contact_address: data.current_address || '',
          phone: data.phone || '',
          postal_code: data.postal_code || '',
          work_unit: data.work_unit || '',
          admission_method: data.admission_path || '',
          admission_date: data.admission_time || '',
          admission_department: data.admission_department || '',
          bed_number: data.admission_ward || '',
          transfer_department: data.transfer_department || '',
          discharge_date: data.discharge_time || '',
          discharge_department: data.discharge_department || '',
          discharge_ward: data.discharge_ward || '',
          actual_stay_days: data.actual_days ? parseInt(data.actual_days.replace(/[^\d]/g, '')) || 0 : 0,
          
          // 诊断信息 (JSONB)
          diagnosis_info: {
            outpatient_diagnosis: data.outpatient_diagnosis || '',
            outpatient_disease_code: data.outpatient_disease_code || '',
            main_diagnosis: data.main_diagnosis || '',
            main_disease_code: data.main_disease_code || '',
            admission_condition: data.admission_condition || '',
            other_diagnoses: validOtherDiagnoses
          },
          
          // 病理信息 (JSONB)
          pathology_info: {
            pathology_diagnosis: data.pathology_diagnosis || '',
            disease_code: data.disease_code || '',
            pathology_number: data.pathology_number || '',
            pathology_code: data.pathology_code || '',
            drug_allergy: data.drug_allergy || '',
            allergy_drugs: data.allergy_drugs || '',
            blood_type: data.blood_type || '',
            rh: data.rh || '',
            autopsy: data.autopsy || '',
            external_cause: data.external_cause || '',
            external_cause_code: data.external_cause_code || ''
          },
          
          // 医务人员 (JSONB)
          medical_personnel: {
            department_director: data.department_director || '',
            attending_physician: data.attending_physician || '',
            treating_physician: data.treating_physician || '',
            resident_physician: data.resident_physician || '',
            intern_physician: data.intern_physician || '',
            responsible_nurse: data.responsible_nurse || '',
            fellow_physician: data.fellow_physician || '',
            medical_student: data.medical_student || '',
            coder: data.coder || ''
          },
          
          // 质控 (JSONB)
          quality_control: {
            quality: data.quality || '',
            quality_physician: data.quality_physician || '',
            quality_nurse: data.quality_nurse || '',
            quality_date: data.quality_date || ''
          }
        };

        const { error } = await supabase
          .from('medical_records')
          .insert([dbData]);

        if (error) {
          console.error('保存数据错误:', error);
          throw error;
        }

        toast({
          title: "保存成功",
          description: "医疗记录已成功保存到数据库",
        });

        onSubmit(formData);

      } catch (error) {
        console.error('表单提交错误:', error);
        toast({
          title: "保存失败",
          description: "保存医疗记录时发生错误，请重试",
          variant: "destructive",
        });
      }
    };

    return (
      <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="basic">基本信息</TabsTrigger>
            <TabsTrigger value="contact">联系信息</TabsTrigger>
            <TabsTrigger value="admission">入出院</TabsTrigger>
            <TabsTrigger value="diagnosis">诊断信息</TabsTrigger>
            <TabsTrigger value="pathology">病理信息</TabsTrigger>
            <TabsTrigger value="personnel">医务人员</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>基本信息</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">姓名 *</Label>
                  <Input id="name" {...register("name")} />
                  {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
                </div>
                <div>
                  <Label htmlFor="gender">性别 *</Label>
                  <RadioGroup
                    value={watch("gender")}
                    onValueChange={(value) => setValue("gender", value)}
                    className="flex gap-4 mt-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="男" id="male" />
                      <Label htmlFor="male">男</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="女" id="female" />
                      <Label htmlFor="female">女</Label>
                    </div>
                  </RadioGroup>
                  {errors.gender && <p className="text-red-500 text-sm mt-1">{errors.gender.message}</p>}
                </div>
                <div>
                  <Label htmlFor="birth_date">出生日期</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !watch("birth_date") && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {watch("birth_date") ? format(watch("birth_date")!, "PPP") : "选择日期"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={watch("birth_date")}
                        onSelect={(date) => setValue("birth_date", date)}
                        initialFocus
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div>
                  <Label htmlFor="age">年龄</Label>
                  <Input 
                    id="age" 
                    type="number" 
                    {...register("age", { valueAsNumber: true })} 
                  />
                </div>
                <div>
                  <Label htmlFor="nationality">国籍</Label>
                  <Input id="nationality" {...register("nationality")} />
                </div>
                <div>
                  <Label htmlFor="birth_place">出生地</Label>
                  <Input id="birth_place" {...register("birth_place")} />
                </div>
                <div>
                  <Label htmlFor="native_place">籍贯</Label>
                  <Input id="native_place" {...register("native_place")} />
                </div>
                <div>
                  <Label htmlFor="ethnicity">民族</Label>
                  <Input id="ethnicity" {...register("ethnicity")} />
                </div>
                <div>
                  <Label htmlFor="id_number">身份证号</Label>
                  <Input id="id_number" {...register("id_number")} />
                </div>
                <div>
                  <Label htmlFor="occupation">职业</Label>
                  <Input id="occupation" {...register("occupation")} />
                </div>
                <div>
                  <Label htmlFor="marital_status">婚姻状况</Label>
                  <Input id="marital_status" {...register("marital_status")} />
                </div>
                <div>
                  <Label htmlFor="phone">联系电话</Label>
                  <Input id="phone" {...register("phone")} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>地址信息</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="current_address">现住址</Label>
                  <Textarea id="current_address" {...register("current_address")} />
                </div>
                <div>
                  <Label htmlFor="postal_code">邮编</Label>
                  <Input id="postal_code" {...register("postal_code")} />
                </div>
                <div>
                  <Label htmlFor="household_address">户口地址</Label>
                  <Textarea id="household_address" {...register("household_address")} />
                </div>
                <div>
                  <Label htmlFor="household_postal_code">户口邮编</Label>
                  <Input id="household_postal_code" {...register("household_postal_code")} />
                </div>
                <div>
                  <Label htmlFor="work_unit">工作单位及地址</Label>
                  <Textarea id="work_unit" {...register("work_unit")} />
                </div>
                <div>
                  <Label htmlFor="work_phone">单位电话</Label>
                  <Input id="work_phone" {...register("work_phone")} />
                </div>
                <div>
                  <Label htmlFor="work_postal_code">单位邮编</Label>
                  <Input id="work_postal_code" {...register("work_postal_code")} />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="contact" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>联系人信息</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="contact_name">联系人姓名</Label>
                  <Input id="contact_name" {...register("contact_name")} />
                </div>
                <div>
                  <Label htmlFor="contact_relationship">关系</Label>
                  <Input id="contact_relationship" {...register("contact_relationship")} />
                </div>
                <div>
                  <Label htmlFor="contact_phone">联系人电话</Label>
                  <Input id="contact_phone" {...register("contact_phone")} />
                </div>
                <div>
                  <Label htmlFor="contact_address">联系人地址</Label>
                  <Textarea id="contact_address" {...register("contact_address")} />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="admission" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>入院信息</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="admission_path">入院途径</Label>
                  <Input id="admission_path" {...register("admission_path")} />
                </div>
                <div>
                  <Label htmlFor="admission_time">入院时间</Label>
                  <Input id="admission_time" {...register("admission_time")} />
                </div>
                <div>
                  <Label htmlFor="admission_department">入院科别</Label>
                  <Input id="admission_department" {...register("admission_department")} />
                </div>
                <div>
                  <Label htmlFor="admission_ward">病房</Label>
                  <Input id="admission_ward" {...register("admission_ward")} />
                </div>
                <div>
                  <Label htmlFor="transfer_department">转科科别</Label>
                  <Input id="transfer_department" {...register("transfer_department")} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>出院信息</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="discharge_time">出院时间</Label>
                  <Input id="discharge_time" {...register("discharge_time")} />
                </div>
                <div>
                  <Label htmlFor="discharge_department">出院科别</Label>
                  <Input id="discharge_department" {...register("discharge_department")} />
                </div>
                <div>
                  <Label htmlFor="discharge_ward">病房</Label>
                  <Input id="discharge_ward" {...register("discharge_ward")} />
                </div>
                <div>
                  <Label htmlFor="actual_days">实际住院天数</Label>
                  <Input id="actual_days" {...register("actual_days")} />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="diagnosis" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>诊断信息</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="outpatient_diagnosis">门急诊诊断</Label>
                  <Textarea id="outpatient_diagnosis" {...register("outpatient_diagnosis")} />
                </div>
                
                <div>
                  <Label htmlFor="outpatient_disease_code">门急诊疾病编码</Label>
                  <Input id="outpatient_disease_code" {...register("outpatient_disease_code")} />
                </div>

                <div>
                  <Label htmlFor="main_diagnosis">主要诊断</Label>
                  <Textarea id="main_diagnosis" {...register("main_diagnosis")} />
                </div>
                <div>
                  <Label htmlFor="main_disease_code">主要诊断疾病编码</Label>
                  <Input id="main_disease_code" {...register("main_disease_code")} />
                </div>
                <div>
                  <Label htmlFor="admission_condition">入院病情</Label>
                  <Select
                    value={watch("admission_condition") || ""}
                    onValueChange={(value) => setValue("admission_condition", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="请选择入院病情" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="有">1-有</SelectItem>
                      <SelectItem value="临床未确定">2-临床未确定</SelectItem>
                      <SelectItem value="情况不明">3-情况不明</SelectItem>
                      <SelectItem value="无">4-无</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <Label>其他诊断</Label>
                    <Button type="button" variant="outline" size="sm" onClick={addOtherDiagnosis}>
                      <Plus className="w-4 h-4 mr-2" />
                      添加诊断
                    </Button>
                  </div>
                  
                  <div className="space-y-4">
                    {otherDiagnoses.map((diagnosis, index) => (
                      <Card key={index} className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-sm font-medium">其他诊断 {index + 1}</h4>
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => removeOtherDiagnosis(index)}
                            disabled={otherDiagnoses.length === 1}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <div>
                            <Label className="text-xs">诊断名称</Label>
                            <Input
                              placeholder="诊断名称"
                              value={diagnosis.diagnosis}
                              onChange={(e) => updateOtherDiagnosis(index, 'diagnosis', e.target.value)}
                            />
                          </div>
                          
                          <div>
                            <Label className="text-xs">疾病编码</Label>
                            <Input
                              placeholder="疾病编码"
                              value={diagnosis.disease_code}
                              onChange={(e) => updateOtherDiagnosis(index, 'disease_code', e.target.value)}
                            />
                          </div>
                          
                          <div>
                            <Label className="text-xs">入院病情</Label>
                            <Select
                              value={diagnosis.admission_condition}
                              onValueChange={(value) => updateOtherDiagnosis(index, 'admission_condition', value)}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="选择病情" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="有">1-有</SelectItem>
                                <SelectItem value="临床未确定">2-临床未确定</SelectItem>
                                <SelectItem value="情况不明">3-情况不明</SelectItem>
                                <SelectItem value="无">4-无</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pathology" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>病理信息</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="external_cause">损伤/中毒的外部原因</Label>
                  <Input id="external_cause" {...register("external_cause")} />
                </div>
                <div>
                  <Label htmlFor="external_cause_code">损伤/中毒外部原因疾病编码</Label>
                  <Input id="external_cause_code" {...register("external_cause_code")} />
                </div>
                <div>
                  <Label htmlFor="pathology_diagnosis">病理诊断</Label>
                  <Textarea id="pathology_diagnosis" {...register("pathology_diagnosis")} />
                </div>
                <div>
                  <Label htmlFor="disease_code">疾病编码</Label>
                  <Input id="disease_code" {...register("disease_code")} />
                </div>
                <div>
                  <Label htmlFor="pathology_number">病理号</Label>
                  <Input id="pathology_number" {...register("pathology_number")} />
                </div>
                <div>
                  <Label htmlFor="drug_allergy">药物过敏</Label>
                  <Select onValueChange={(value) => setValue('drug_allergy', value)} value={watch('drug_allergy') || ''}>
                    <SelectTrigger>
                      <SelectValue placeholder="请选择" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="有">有</SelectItem>
                      <SelectItem value="无">无</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {watch('drug_allergy') === '有' && (
                  <div>
                    <Label htmlFor="allergy_drugs">过敏药物</Label>
                    <Input id="allergy_drugs" {...register("allergy_drugs")} />
                  </div>
                )}
                <div>
                  <Label htmlFor="autopsy">死亡患者尸检</Label>
                  <Select onValueChange={(value) => setValue('autopsy', value)} value={watch('autopsy') || ''}>
                    <SelectTrigger>
                      <SelectValue placeholder="请选择" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="是">是</SelectItem>
                      <SelectItem value="否">否</SelectItem>
                      <SelectItem value="-">-</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="blood_type">血型</Label>
                  <Select onValueChange={(value) => setValue('blood_type', value)} value={watch('blood_type') || ''}>
                    <SelectTrigger>
                      <SelectValue placeholder="请选择" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="A">A</SelectItem>
                      <SelectItem value="B">B</SelectItem>
                      <SelectItem value="O">O</SelectItem>
                      <SelectItem value="AB">AB</SelectItem>
                      <SelectItem value="不详">不详</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="rh">Rh</Label>
                  <Select onValueChange={(value) => setValue('rh', value)} value={watch('rh') || ''}>
                    <SelectTrigger>
                      <SelectValue placeholder="请选择" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="阴">阴</SelectItem>
                      <SelectItem value="阳">阳</SelectItem>
                      <SelectItem value="不详">不详</SelectItem>
                      <SelectItem value="未查">未查</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="personnel" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>医务人员</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="department_director">科主任</Label>
                  <Input id="department_director" {...register("department_director")} />
                </div>
                <div>
                  <Label htmlFor="attending_physician">主任（副主任）医师</Label>
                  <Input id="attending_physician" {...register("attending_physician")} />
                </div>
                <div>
                  <Label htmlFor="treating_physician">主治医师</Label>
                  <Input id="treating_physician" {...register("treating_physician")} />
                </div>
                <div>
                  <Label htmlFor="intern_physician">实习医师</Label>
                  <Input id="intern_physician" {...register("intern_physician")} />
                </div>
                <div>                
                  <Label htmlFor="resident_physician">住院医师</Label>
                  <Input id="resident_physician" {...register("resident_physician")} />
                </div>
                <div>
                  <Label htmlFor="responsible_nurse">责任护士</Label>
                  <Input id="responsible_nurse" {...register("responsible_nurse")} />
                </div>
                <div>
                  <Label htmlFor="fellow_physician">进修医师</Label>
                  <Input id="fellow_physician" {...register("fellow_physician")} />
                </div>
                <div>
                  <Label htmlFor="coder">编码员</Label>
                  <Input id="coder" {...register("coder")} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>病案质量</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="quality">病案质量</Label>
                  <Input id="quality" {...register("quality")} />
                </div>
                <div>
                  <Label htmlFor="quality_physician">质控医师</Label>
                  <Input id="quality_physician" {...register("quality_physician")} />
                </div>
                <div>
                  <Label htmlFor="quality_nurse">质控护士</Label>
                  <Input id="quality_nurse" {...register("quality_nurse")} />
                </div>
                <div>
                  <Label htmlFor="quality_date">质控日期</Label>
                  <Input id="quality_date" {...register("quality_date")} />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end">
          <Button type="submit" disabled={isSubmitting} className="min-w-[120px]">
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                保存中...
              </>
            ) : (
              "保存记录"
            )}
          </Button>
        </div>
      </form>
    );
  }
);

InfoRecognitionForm.displayName = 'InfoRecognitionForm';