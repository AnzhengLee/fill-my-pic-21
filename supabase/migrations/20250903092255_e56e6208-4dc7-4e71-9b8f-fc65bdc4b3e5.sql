-- Disable Row Level Security on follow-up related tables to fix missing data issue
ALTER TABLE public.follow_up_records DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.follow_up_visits DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.nursing_follow_ups DISABLE ROW LEVEL SECURITY;

-- Drop all existing RLS policies on follow_up_records table
DROP POLICY IF EXISTS "Authenticated users can view all follow up records" ON public.follow_up_records;
DROP POLICY IF EXISTS "Authenticated users can insert follow up records" ON public.follow_up_records;
DROP POLICY IF EXISTS "Authenticated users can update follow up records" ON public.follow_up_records;

-- Drop all existing RLS policies on follow_up_visits table
DROP POLICY IF EXISTS "Authenticated users can view all follow up visits" ON public.follow_up_visits;
DROP POLICY IF EXISTS "Authenticated users can insert follow up visits" ON public.follow_up_visits;
DROP POLICY IF EXISTS "Authenticated users can update follow up visits" ON public.follow_up_visits;

-- Drop all existing RLS policies on nursing_follow_ups table
DROP POLICY IF EXISTS "Authenticated users can view all nursing follow ups" ON public.nursing_follow_ups;
DROP POLICY IF EXISTS "Authenticated users can insert nursing follow ups" ON public.nursing_follow_ups;
DROP POLICY IF EXISTS "Authenticated users can update nursing follow ups" ON public.nursing_follow_ups;