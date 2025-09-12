-- 为需要RLS的表启用行级安全
ALTER TABLE public.follow_up_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.follow_up_visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nursing_follow_ups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_drug_treatments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_treatments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;

-- 为 follow_up_records 创建 RLS 策略
CREATE POLICY "Users can view their own follow-up records" 
ON public.follow_up_records 
FOR SELECT 
USING (auth.uid() = created_by);

CREATE POLICY "Users can create their own follow-up records" 
ON public.follow_up_records 
FOR INSERT 
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own follow-up records" 
ON public.follow_up_records 
FOR UPDATE 
USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their own follow-up records" 
ON public.follow_up_records 
FOR DELETE 
USING (auth.uid() = created_by);

CREATE POLICY "Admins can view all follow-up records" 
ON public.follow_up_records 
FOR SELECT 
USING (get_current_user_role() = 'admin');

CREATE POLICY "Admins can manage all follow-up records" 
ON public.follow_up_records 
FOR ALL 
USING (get_current_user_role() = 'admin');

-- 为 patients 创建 RLS 策略
CREATE POLICY "Users can view their own patients" 
ON public.patients 
FOR SELECT 
USING (auth.uid() = created_by);

CREATE POLICY "Users can create their own patients" 
ON public.patients 
FOR INSERT 
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own patients" 
ON public.patients 
FOR UPDATE 
USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their own patients" 
ON public.patients 
FOR DELETE 
USING (auth.uid() = created_by);

CREATE POLICY "Admins can view all patients" 
ON public.patients 
FOR SELECT 
USING (get_current_user_role() = 'admin');

CREATE POLICY "Admins can manage all patients" 
ON public.patients 
FOR ALL 
USING (get_current_user_role() = 'admin');