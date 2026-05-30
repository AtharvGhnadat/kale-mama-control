
-- 1. Tighten RLS: remove "OR (user_id IS NULL)" loophole on all user-owned tables

-- devices
DROP POLICY IF EXISTS "Users can view devices" ON public.devices;
DROP POLICY IF EXISTS "Users can insert devices" ON public.devices;
DROP POLICY IF EXISTS "Users can update devices" ON public.devices;

-- Remove ownerless rows that would now be orphaned/unreachable
DELETE FROM public.devices WHERE user_id IS NULL;
DELETE FROM public.esp32_settings WHERE user_id IS NULL;
DELETE FROM public.command_logs WHERE user_id IS NULL;
DELETE FROM public.voice_command_logs WHERE user_id IS NULL;

CREATE POLICY "Users can view own devices" ON public.devices
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own devices" ON public.devices
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own devices" ON public.devices
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own devices" ON public.devices
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- esp32_settings
DROP POLICY IF EXISTS "Users can view own esp32 settings" ON public.esp32_settings;
DROP POLICY IF EXISTS "Users can insert own esp32 settings" ON public.esp32_settings;
DROP POLICY IF EXISTS "Users can update own esp32 settings" ON public.esp32_settings;

CREATE POLICY "Users can view own esp32 settings" ON public.esp32_settings
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own esp32 settings" ON public.esp32_settings
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own esp32 settings" ON public.esp32_settings
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own esp32 settings" ON public.esp32_settings
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- command_logs
DROP POLICY IF EXISTS "Users can view command logs" ON public.command_logs;
DROP POLICY IF EXISTS "Users can insert command logs" ON public.command_logs;

CREATE POLICY "Users can view own command logs" ON public.command_logs
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own command logs" ON public.command_logs
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- voice_command_logs
DROP POLICY IF EXISTS "Users can view voice logs" ON public.voice_command_logs;
DROP POLICY IF EXISTS "Users can insert voice logs" ON public.voice_command_logs;

CREATE POLICY "Users can view own voice logs" ON public.voice_command_logs
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own voice logs" ON public.voice_command_logs
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- 2. Prevent role escalation on profiles
-- Drop the broad update policy and replace it with one that forbids changing `role`.
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id
    AND role IS NOT DISTINCT FROM (SELECT p.role FROM public.profiles p WHERE p.id = auth.uid())
  );

-- 3. Harden the rls_auto_enable SECURITY DEFINER function
REVOKE ALL ON FUNCTION public.rls_auto_enable() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.rls_auto_enable() FROM anon;
REVOKE ALL ON FUNCTION public.rls_auto_enable() FROM authenticated;
ALTER FUNCTION public.rls_auto_enable() SET search_path = pg_catalog, public;
