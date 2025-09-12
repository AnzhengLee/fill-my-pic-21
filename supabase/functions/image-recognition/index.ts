import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RecognitionResponse {
  success: boolean;
  recognitionData?: Record<string, any>;
  message?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    const formData = await req.formData();
    const imageFile = formData.get('image') as File;

    if (!imageFile) {
      return new Response(JSON.stringify({ 
        success: false, 
        message: '未找到图片文件' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Processing image:', imageFile.name, 'Size:', imageFile.size);

    // 调用Dify API进行图片识别
    const recognitionData = await callDifyAPI(imageFile);

    const response: RecognitionResponse = {
      success: true,
      recognitionData: recognitionData,
    };

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Image recognition error:', error);
    
    const errorResponse: RecognitionResponse = {
      success: false,
      message: '图片识别过程中发生错误',
    };

    return new Response(JSON.stringify(errorResponse), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

// 调用Dify API进行图片识别，带重试机制
async function callDifyAPI(imageFile: File): Promise<Record<string, any>> {
  const difyApiKey = Deno.env.get('DIFY_API_KEY');
  
  if (!difyApiKey) {
    throw new Error('DIFY_API_KEY environment variable is not set');
  }

  const maxRetries = 3;
  const timeoutMs = 60000; // 60秒超时

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`第${attempt}次尝试调用Dify API...`);
      
      // 步骤1：上传文件到Dify
      console.log('开始上传文件到Dify...');
      const uploadFormData = new FormData();
      uploadFormData.append('file', imageFile);
      uploadFormData.append('user', 'medical-recognition-system');
      
      const uploadController = new AbortController();
      const uploadTimeout = setTimeout(() => uploadController.abort(), timeoutMs);
      
      const uploadResponse = await fetch('https://api.dify.ai/v1/files/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${difyApiKey}`,
        },
        body: uploadFormData,
        signal: uploadController.signal,
      });

      clearTimeout(uploadTimeout);

      if (!uploadResponse.ok) {
        const errorText = await uploadResponse.text();
        console.error(`文件上传失败 (尝试${attempt}/${maxRetries}):`, errorText);
        
        // 如果是503/504错误且还有重试次数，则继续重试
        if ((uploadResponse.status === 503 || uploadResponse.status === 504) && attempt < maxRetries) {
          console.log(`等待${attempt * 2}秒后重试...`);
          await new Promise(resolve => setTimeout(resolve, attempt * 2000));
          continue;
        }
        
        throw new Error(`文件上传失败: ${uploadResponse.status} ${errorText}`);
      }

      const uploadResult = await uploadResponse.json();
      console.log('文件上传成功:', uploadResult);
      
      const fileId = uploadResult.id;
      if (!fileId) {
        throw new Error('未获取到文件ID');
      }

      // 步骤2：调用Dify聊天API进行识别
      console.log('开始调用Dify识别API...');
      
      const chatController = new AbortController();
      const chatTimeout = setTimeout(() => chatController.abort(), timeoutMs);
      
      const chatResponse = await fetch('https://api.dify.ai/v1/chat-messages', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${difyApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: {},
          query: "请识别这张医疗记录图片中的所有信息，以JSON格式返回结构化数据",
          user: "medical-system",
          conversation_id: "",
          files: [{ 
            type: "image", 
            transfer_method: "local_file", 
            upload_file_id: fileId 
          }],
          response_mode: "blocking"
        }),
        signal: chatController.signal,
      });

      clearTimeout(chatTimeout);

      if (!chatResponse.ok) {
        const errorText = await chatResponse.text();
        console.error(`Dify聊天API调用失败 (尝试${attempt}/${maxRetries}):`, errorText);
        
        // 如果是503/504错误且还有重试次数，则继续重试
        if ((chatResponse.status === 503 || chatResponse.status === 504) && attempt < maxRetries) {
          console.log(`等待${attempt * 2}秒后重试...`);
          await new Promise(resolve => setTimeout(resolve, attempt * 2000));
          continue;
        }
        
        throw new Error(`Dify聊天API调用失败: ${chatResponse.status} ${errorText}`);
      }

      const chatResult = await chatResponse.json();
      console.log('Dify识别结果:', JSON.stringify(chatResult, null, 2));
      
      const answerText = chatResult.answer;
      if (!answerText) {
        throw new Error('未获取到识别结果');
      }

      // 解析Dify返回的JSON结果，增强容错性
      let difyData;
      try {
        // 先尝试直接解析整个答案
        difyData = JSON.parse(answerText);
      } catch (e) {
        console.log('直接JSON解析失败，尝试提取JSON部分:', e.message);
        
        // 尝试从文本中提取JSON部分，支持多种格式
        const jsonPatterns = [
          /```json\s*(\{[\s\S]*?\})\s*```/i,  // ```json {...} ```
          /```\s*(\{[\s\S]*?\})\s*```/i,      // ``` {...} ```
          /(\{[\s\S]*\})/                      // 直接匹配大括号内容
        ];
        
        let jsonFound = false;
        for (const pattern of jsonPatterns) {
          const match = answerText.match(pattern);
          if (match) {
            try {
              difyData = JSON.parse(match[1]);
              jsonFound = true;
              console.log('成功提取并解析JSON数据');
              break;
            } catch (parseError) {
              console.log(`JSON解析失败 (模式${pattern}):`, parseError.message);
            }
          }
        }
        
        if (!jsonFound) {
          // 如果仍然无法解析，返回包含原始文本的默认结构
          console.log('无法解析JSON，返回原始文本');
          difyData = {
            原始识别结果: answerText,
            姓名: '',
            性别: '',
            年龄: ''
          };
        }
      }

      // 将Dify返回的数据映射到表单字段
      const mappedData = mapDifyResultToFormData(difyData);
      console.log('识别成功，返回映射数据');
      return mappedData;

    } catch (error) {
      console.error(`第${attempt}次尝试失败:`, error.message);
      
      // 如果是超时或网络错误，且还有重试次数，继续重试
      if (attempt < maxRetries && (
        error.name === 'AbortError' || 
        error.message.includes('timeout') || 
        error.message.includes('504') ||
        error.message.includes('503')
      )) {
        console.log(`等待${attempt * 2}秒后重试...`);
        await new Promise(resolve => setTimeout(resolve, attempt * 2000));
        continue;
      }
      
      // 最后一次尝试失败，抛出错误
      if (attempt === maxRetries) {
        throw new Error(`Dify API调用失败 (${maxRetries}次尝试后): ${error.message}`);
      }
    }
  }
  
  throw new Error('意外的错误：所有重试都已完成但未返回结果');
}

// 渐进式数据映射函数
function mapDifyResultToFormData(difyData: any): Record<string, any> {
  console.log('开始渐进式映射Dify数据到表单字段:', difyData);
  
  // 日期格式转换函数
  const convertDateFormat = (dateStr: string): string => {
    if (!dateStr) return '';
    const match = dateStr.match(/(\d{4})年(\d{2})月(\d{2})日/);
    if (match) {
      return `${match[1]}-${match[2]}-${match[3]}`;
    }
    return dateStr;
  };

  // 安全解析数组的函数
  const safeParseArray = (data: any): string[] => {
    if (Array.isArray(data)) return data;
    if (typeof data === 'string') return data.split(',').map(item => item.trim());
    return [];
  };

  // 入院病情数字转换函数
  const convertAdmissionCondition = (condition: any): string => {
    if (!condition) return '';
    if (typeof condition === 'number' || /^\d+$/.test(condition)) {
      const num = parseInt(condition);
      switch (num) {
        case 1: return '有';
        case 2: return '临床未确定';
        case 3: return '情况不明';
        case 4: return '无';
        default: return condition.toString();
      }
    }
    return condition.toString();
  };

  // 药物过敏数字转换函数
  const convertDrugAllergy = (allergy: any): string => {
    if (!allergy) return '';
    if (typeof allergy === 'number' || /^\d+$/.test(allergy)) {
      const num = parseInt(allergy);
      switch (num) {
        case 1: return '有';
        case 0: return '无';
        default: return allergy.toString();
      }
    }
    return allergy.toString();
  };

  // 血型数字转换函数
  const convertBloodType = (bloodType: any): string => {
    if (!bloodType) return '';
    if (typeof bloodType === 'number' || /^\d+$/.test(bloodType)) {
      const num = parseInt(bloodType);
      switch (num) {
        case 1: return 'A';
        case 2: return 'B';
        case 3: return 'O';
        case 4: return 'AB';
        default: return bloodType.toString();
      }
    }
    return bloodType.toString();
  };

  // Rh因子数字转换函数
  const convertRh = (rh: any): string => {
    if (!rh) return '';
    if (typeof rh === 'number' || /^\d+$/.test(rh)) {
      const num = parseInt(rh);
      switch (num) {
        case 1: return '阴';
        case 2: return '阳';
        default: return rh.toString();
      }
    }
    return rh.toString();
  };

  // 尸检数字转换函数
  const convertAutopsy = (autopsy: any): string => {
    if (!autopsy) return '';
    if (typeof autopsy === 'number' || /^\d+$/.test(autopsy)) {
      const num = parseInt(autopsy);
      switch (num) {
        case 1: return '是';
        case 2: return '否';
        default: return autopsy.toString();
      }
    }
    return autopsy.toString();
  };

  // 性别数字转换函数
  const convertGender = (gender: any): string => {
    if (!gender) return '';
    if (typeof gender === 'number' || /^\d+$/.test(gender)) {
      const num = parseInt(gender);
      switch (num) {
        case 1: return '男';
        case 2: return '女';
        default: return gender.toString();
      }
    }
    return gender.toString();
  };

  // 婚姻状况数字转换函数
  const convertMaritalStatus = (maritalStatus: any): string => {
    if (!maritalStatus) return '';
    if (typeof maritalStatus === 'number' || /^\d+$/.test(maritalStatus)) {
      const num = parseInt(maritalStatus);
      switch (num) {
        case 1: return '未婚';
        case 2: return '已婚';
        case 3: return '丧偶';
        case 4: return '离婚';
        case 9: return '其他';
        default: return maritalStatus.toString();
      }
    }
    return maritalStatus.toString();
  };

  // 入院途径数字转换函数
  const convertAdmissionPath = (admissionPath: any): string => {
    if (!admissionPath) return '';
    if (typeof admissionPath === 'number' || /^\d+$/.test(admissionPath)) {
      const num = parseInt(admissionPath);
      switch (num) {
        case 1: return '急诊';
        case 2: return '门诊';
        case 3: return '其他医疗机构转入';
        case 9: return '其他';
        default: return admissionPath.toString();
      }
    }
    return admissionPath.toString();
  };

  // 邮编字段调试信息
  console.log('邮编字段调试信息:');
  console.log('- difyData.邮编:', JSON.stringify(difyData.邮编), typeof difyData.邮编);
  console.log('- difyData.户口邮编:', JSON.stringify(difyData.户口邮编), typeof difyData.户口邮编);
  
  // 安全获取邮编值的函数
  const safeGetPostalCode = (value: any): string => {
    if (value === null || value === undefined) return '';
    return String(value).trim();
  };
  
  // 计算邮编字段值
  const currentPostalCode = safeGetPostalCode(difyData.邮编);
  const householdPostalCode = safeGetPostalCode(difyData.户口邮编);
  
  console.log('- 处理后的现住址邮编:', JSON.stringify(currentPostalCode));
  console.log('- 处理后的户口邮编:', JSON.stringify(householdPostalCode));
  
  // 第一阶段：安全映射 - 基本文本字段
  const phase1Data: Record<string, any> = {
    // 基本信息 - 直接映射
    name: difyData.姓名 || '',
    gender: convertGender(difyData.性别 || difyData.gender),
    age: parseInt(difyData.年龄) || null,
    birth_date: convertDateFormat(difyData.出生日期) || '',
    nationality: difyData.国籍 || '',
    birth_place: difyData.出生地 || '',
    native_place: difyData.籍贯 || '',
    ethnicity: difyData.民族 || '',
    id_number: difyData.身份证号 || '',
    occupation: difyData.职业 || '',
    marital_status: convertMaritalStatus(difyData.婚姻 || difyData.marital_status),
    phone: difyData.电话 || '',
    current_address: difyData.现住址 || '',
    // 直接映射邮编字段，不使用fallback逻辑
    postal_code: currentPostalCode,
    household_address: difyData.户口地址 || '',
    household_postal_code: householdPostalCode,
    
    // 工作单位信息
    work_unit: difyData.工作单位地址 || difyData.工作单位及地址 || '',
    work_phone: difyData.单位电话 || '',
    work_postal_code: difyData.单位邮编 || '',
    
    // 联系人信息 - 安全映射
    contact_name: difyData.联系人?.姓名 || '',
    contact_phone: difyData.联系人?.电话 || '',
    contact_relationship: difyData.联系人?.关系 || '',
    contact_address: difyData.联系人?.地址 || '',
    
    // 入院信息 - 安全映射
    admission_department: difyData.入院信息?.入院科别 || '',
    transfer_department: difyData.转科科别 || difyData.入院信息?.转科科别 || '',
    admission_ward: difyData.入院信息?.入院病房 || difyData.入院信息?.病房 || '',
    admission_time: difyData.入院信息?.入院时间 || '',
    admission_path: convertAdmissionPath(difyData.入院信息?.入院途径 || difyData.admission_path),
    
    // 出院信息 - 安全映射
    discharge_time: difyData.出院信息?.出院时间 || '',
    discharge_department: difyData.出院信息?.出院科别 || '',
    discharge_ward: difyData.出院信息?.出院病房 || difyData.出院信息?.病房 || '',
    actual_days: difyData.出院信息?.实际住院天数 || '',
  };

  // 第二阶段：智能解析 - 诊断信息的完整映射
  const diagnosisInfo = difyData.诊断信息 || {};
  
  // 处理门急诊疾病编码数组
  const outpatientDiseaseCodes = safeParseArray(diagnosisInfo.门急诊疾病编码 || diagnosisInfo.疾病编码);
  
  // 处理其他诊断相关数组
  const otherDiagnoses = safeParseArray(diagnosisInfo.其他诊断);
  const otherDiseaseCodes = safeParseArray(diagnosisInfo.其他疾病编码 || diagnosisInfo.其他诊断疾病编码);
  const otherAdmissionConditions = safeParseArray(diagnosisInfo.其他入院病情 || diagnosisInfo.其他诊断入院病情);
  
  // 确保数组长度一致性
  const maxLength = Math.max(otherDiagnoses.length, otherDiseaseCodes.length, otherAdmissionConditions.length);
  const normalizedOtherDiagnoses = [];
  
  for (let i = 0; i < maxLength; i++) {
    normalizedOtherDiagnoses.push({
      diagnosis: otherDiagnoses[i] || '',
      disease_code: otherDiseaseCodes[i] || '',
      admission_condition: convertAdmissionCondition(otherAdmissionConditions[i] || '')
    });
  }
  
  const phase2Data: Record<string, any> = {
    // 门急诊诊断相关
    outpatient_diagnosis: diagnosisInfo.门急诊诊断 || '',
    outpatient_disease_code: outpatientDiseaseCodes.length > 0 ? outpatientDiseaseCodes[0] : '',
    
    // 主要诊断相关
    main_diagnosis: diagnosisInfo.主要诊断 || '',
    main_disease_code: diagnosisInfo.主要诊断疾病编码 || diagnosisInfo.疾病编码 || '',
    admission_condition: convertAdmissionCondition(
      diagnosisInfo.住院诊断入院病情 || 
      (Array.isArray(diagnosisInfo.入院病情) ? 
        diagnosisInfo.入院病情[0] : diagnosisInfo.入院病情)
    ),
    
    // 其他诊断相关
    other_diagnoses: normalizedOtherDiagnoses,
  };

  // 病理信息 - 安全映射（使用转换函数）
  const pathologyData: Record<string, any> = {
    pathology_diagnosis: difyData.病理信息?.病理诊断 || '',
    pathology_number: difyData.病理信息?.病理号 || '',
    disease_code: difyData.病理信息?.疾病编码 || '',
    drug_allergy: convertDrugAllergy(difyData.drug_allergy || difyData.病理信息?.药物过敏),
    allergy_drugs: difyData.allergy_drugs || difyData.病理信息?.过敏药物 || '',
    blood_type: convertBloodType(difyData.blood_type || difyData.病理信息?.血型),
    rh: convertRh(difyData.rh || difyData.病理信息?.Rh),
    autopsy: convertAutopsy(difyData.autopsy || difyData.病理信息?.死亡患者尸检 || difyData.病理信息?.尸检),
    external_cause: difyData.病理信息?.["损伤、中毒的外部原因"] || difyData.病理信息?.损伤中毒外部原因 || '',
    external_cause_code: difyData.病理信息?.["损伤、中毒的外部原因疾病编码"] || difyData.病理信息?.损伤中毒外部原因编码 || '',
  };

  // 医务人员信息 - 安全映射
  const personnelData: Record<string, any> = {
    department_director: difyData.医务人员?.科主任 || '',
    attending_physician: difyData.医务人员?.["主任（副主任）医师"] || difyData.医务人员?.主任医师 || '',
    treating_physician: difyData.医务人员?.主治医师 || '',
    resident_physician: difyData.医务人员?.住院医师 || '',
    intern_physician: difyData.医务人员?.实习医师 || '',
    fellow_physician: difyData.医务人员?.进修医师 || '',
    responsible_nurse: difyData.医务人员?.责任护士 || '',
    coder: difyData.医务人员?.编码员 || '',
  };

  // 质控信息 - 安全映射
  const qualityData: Record<string, any> = {
    quality: difyData.病案质量?.病案质量 || '',
    quality_physician: difyData.病案质量?.质控医师 || '',
    quality_nurse: difyData.病案质量?.质控护士 || '',
    quality_date: difyData.病案质量?.质控日期 || '',
  };

  // 合并所有阶段的数据
  const mappedData = {
    ...phase1Data,
    ...phase2Data,
    ...pathologyData,
    ...personnelData,
    ...qualityData,
  };

  // 数据质量评估
  const totalFields = Object.keys(mappedData).length;
  const filledFields = Object.values(mappedData).filter(value => 
    value !== null && value !== undefined && value !== ''
  ).length;
  const fillRate = ((filledFields / totalFields) * 100).toFixed(1);

  console.log(`渐进式数据映射完成: 
    - 总字段数: ${totalFields}
    - 已填充字段: ${filledFields}
    - 填充率: ${fillRate}%
    - 关键诊断信息: ${mappedData.main_diagnosis ? '✓' : '✗'}
    - 基本信息: ${mappedData.name && mappedData.gender ? '✓' : '✗'}
  `);

  // 添加映射元数据
  mappedData._metadata = {
    fillRate,
    filledFields,
    totalFields,
    mappingTimestamp: new Date().toISOString(),
    phase1Success: !!phase1Data.name,
    phase2Success: !!phase2Data.main_diagnosis,
    hasContactInfo: !!(mappedData.contact_name || mappedData.contact_phone),
    hasAdmissionInfo: !!(mappedData.admission_department || mappedData.admission_time),
    hasDiagnosisInfo: !!(mappedData.main_diagnosis || mappedData.outpatient_diagnosis)
  };

  console.log('映射后的表单数据及元数据:', mappedData);
  return mappedData;
}