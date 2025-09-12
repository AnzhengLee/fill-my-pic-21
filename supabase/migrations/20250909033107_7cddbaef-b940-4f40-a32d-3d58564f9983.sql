-- 删除现有的限制性RLS策略
DROP POLICY IF EXISTS "Users can view their own medical records" ON public.medical_records;
DROP POLICY IF EXISTS "Users can create their own medical records" ON public.medical_records;
DROP POLICY IF EXISTS "Users can update their own medical records" ON public.medical_records;
DROP POLICY IF EXISTS "Users can delete their own medical records" ON public.medical_records;

-- 删除现有的管理员策略
DROP POLICY IF EXISTS "Admins can view all medical records" ON public.medical_records;
DROP POLICY IF EXISTS "Admins can manage all medical records" ON public.medical_records;

-- 创建新的公开访问策略
CREATE POLICY "Anyone can create medical records" 
ON public.medical_records 
FOR INSERT 
TO PUBLIC
WITH CHECK (true);

-- 重新创建管理员的完全访问权限
CREATE POLICY "Admins can view all medical records" 
ON public.medical_records 
FOR SELECT 
USING (get_current_user_role() = 'admin');

CREATE POLICY "Admins can manage all medical records" 
ON public.medical_records 
FOR ALL 
USING (get_current_user_role() = 'admin');