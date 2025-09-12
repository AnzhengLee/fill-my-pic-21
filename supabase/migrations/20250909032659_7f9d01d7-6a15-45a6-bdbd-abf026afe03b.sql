-- 为剩余表添加RLS策略，确保所有表都有完整的策略配置

-- 为 follow_up_visits 创建 RLS 策略
CREATE POLICY "Users can view their own follow-up visits" 
ON public.follow_up_visits 
FOR SELECT 
USING (auth.uid() IN (
  SELECT created_by FROM public.follow_up_records 
  WHERE id = follow_up_visits.follow_up_record_id
));

CREATE POLICY "Users can create follow-up visits for their records" 
ON public.follow_up_visits 
FOR INSERT 
WITH CHECK (auth.uid() IN (
  SELECT created_by FROM public.follow_up_records 
  WHERE id = follow_up_visits.follow_up_record_id
));

CREATE POLICY "Users can update their own follow-up visits" 
ON public.follow_up_visits 
FOR UPDATE 
USING (auth.uid() IN (
  SELECT created_by FROM public.follow_up_records 
  WHERE id = follow_up_visits.follow_up_record_id
));

CREATE POLICY "Users can delete their own follow-up visits" 
ON public.follow_up_visits 
FOR DELETE 
USING (auth.uid() IN (
  SELECT created_by FROM public.follow_up_records 
  WHERE id = follow_up_visits.follow_up_record_id
));

CREATE POLICY "Admins can view all follow-up visits" 
ON public.follow_up_visits 
FOR SELECT 
USING (get_current_user_role() = 'admin');

CREATE POLICY "Admins can manage all follow-up visits" 
ON public.follow_up_visits 
FOR ALL 
USING (get_current_user_role() = 'admin');

-- 为 nursing_follow_ups 创建 RLS 策略
CREATE POLICY "Users can view their own nursing follow-ups" 
ON public.nursing_follow_ups 
FOR SELECT 
USING (auth.uid() IN (
  SELECT created_by FROM public.follow_up_records 
  WHERE id = nursing_follow_ups.follow_up_record_id
));

CREATE POLICY "Users can create nursing follow-ups for their records" 
ON public.nursing_follow_ups 
FOR INSERT 
WITH CHECK (auth.uid() IN (
  SELECT created_by FROM public.follow_up_records 
  WHERE id = nursing_follow_ups.follow_up_record_id
));

CREATE POLICY "Users can update their own nursing follow-ups" 
ON public.nursing_follow_ups 
FOR UPDATE 
USING (auth.uid() IN (
  SELECT created_by FROM public.follow_up_records 
  WHERE id = nursing_follow_ups.follow_up_record_id
));

CREATE POLICY "Users can delete their own nursing follow-ups" 
ON public.nursing_follow_ups 
FOR DELETE 
USING (auth.uid() IN (
  SELECT created_by FROM public.follow_up_records 
  WHERE id = nursing_follow_ups.follow_up_record_id
));

CREATE POLICY "Admins can view all nursing follow-ups" 
ON public.nursing_follow_ups 
FOR SELECT 
USING (get_current_user_role() = 'admin');

CREATE POLICY "Admins can manage all nursing follow-ups" 
ON public.nursing_follow_ups 
FOR ALL 
USING (get_current_user_role() = 'admin');

-- 为 patient_drug_treatments 创建 RLS 策略
CREATE POLICY "Users can view their own patient drug treatments" 
ON public.patient_drug_treatments 
FOR SELECT 
USING (auth.uid() IN (
  SELECT created_by FROM public.patients 
  WHERE patient_number = patient_drug_treatments.patient_id
));

CREATE POLICY "Users can create patient drug treatments for their patients" 
ON public.patient_drug_treatments 
FOR INSERT 
WITH CHECK (auth.uid() IN (
  SELECT created_by FROM public.patients 
  WHERE patient_number = patient_drug_treatments.patient_id
));

CREATE POLICY "Users can update their own patient drug treatments" 
ON public.patient_drug_treatments 
FOR UPDATE 
USING (auth.uid() IN (
  SELECT created_by FROM public.patients 
  WHERE patient_number = patient_drug_treatments.patient_id
));

CREATE POLICY "Users can delete their own patient drug treatments" 
ON public.patient_drug_treatments 
FOR DELETE 
USING (auth.uid() IN (
  SELECT created_by FROM public.patients 
  WHERE patient_number = patient_drug_treatments.patient_id
));

CREATE POLICY "Admins can view all patient drug treatments" 
ON public.patient_drug_treatments 
FOR SELECT 
USING (get_current_user_role() = 'admin');

CREATE POLICY "Admins can manage all patient drug treatments" 
ON public.patient_drug_treatments 
FOR ALL 
USING (get_current_user_role() = 'admin');

-- 为 patient_treatments 创建 RLS 策略
CREATE POLICY "Users can view their own patient treatments" 
ON public.patient_treatments 
FOR SELECT 
USING (auth.uid() IN (
  SELECT created_by FROM public.patients 
  WHERE patient_number = patient_treatments.patient_id
));

CREATE POLICY "Users can create patient treatments for their patients" 
ON public.patient_treatments 
FOR INSERT 
WITH CHECK (auth.uid() IN (
  SELECT created_by FROM public.patients 
  WHERE patient_number = patient_treatments.patient_id
));

CREATE POLICY "Users can update their own patient treatments" 
ON public.patient_treatments 
FOR UPDATE 
USING (auth.uid() IN (
  SELECT created_by FROM public.patients 
  WHERE patient_number = patient_treatments.patient_id
));

CREATE POLICY "Users can delete their own patient treatments" 
ON public.patient_treatments 
FOR DELETE 
USING (auth.uid() IN (
  SELECT created_by FROM public.patients 
  WHERE patient_number = patient_treatments.patient_id
));

CREATE POLICY "Admins can view all patient treatments" 
ON public.patient_treatments 
FOR SELECT 
USING (get_current_user_role() = 'admin');

CREATE POLICY "Admins can manage all patient treatments" 
ON public.patient_treatments 
FOR ALL 
USING (get_current_user_role() = 'admin');