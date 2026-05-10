
-- Fix events policies
DROP POLICY IF EXISTS "Host members can delete events" ON public.events;
DROP POLICY IF EXISTS "Host members can insert events" ON public.events;
DROP POLICY IF EXISTS "Host members can update events" ON public.events;
DROP POLICY IF EXISTS "Published events are viewable by everyone" ON public.events;

CREATE POLICY "Host members can delete events" ON public.events FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM host_members hm WHERE hm.host_id = events.host_id AND hm.user_id = auth.uid() AND hm.role = 'host'));

CREATE POLICY "Host members can insert events" ON public.events FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM host_members hm WHERE hm.host_id = events.host_id AND hm.user_id = auth.uid() AND hm.role = 'host'));

CREATE POLICY "Host members can update events" ON public.events FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM host_members hm WHERE hm.host_id = events.host_id AND hm.user_id = auth.uid() AND hm.role = 'host'));

CREATE POLICY "Published events are viewable by everyone" ON public.events FOR SELECT TO public
  USING (state = 'published' OR EXISTS (SELECT 1 FROM host_members hm WHERE hm.host_id = events.host_id AND hm.user_id = auth.uid()));

-- Fix host_members policies
DROP POLICY IF EXISTS "Host role can delete members" ON public.host_members;
DROP POLICY IF EXISTS "Host role can insert members" ON public.host_members;
DROP POLICY IF EXISTS "Members can view own host members" ON public.host_members;

CREATE POLICY "Host role can delete members" ON public.host_members FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM host_members hm WHERE hm.host_id = host_members.host_id AND hm.user_id = auth.uid() AND hm.role = 'host'));

CREATE POLICY "Host role can insert members" ON public.host_members FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM host_members hm WHERE hm.host_id = host_members.host_id AND hm.user_id = auth.uid() AND hm.role = 'host')
    OR (auth.uid() = user_id AND auth.uid() = (SELECT hosts.created_by FROM hosts WHERE hosts.id = host_members.host_id))
  );

CREATE POLICY "Members can view own host members" ON public.host_members FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR EXISTS (SELECT 1 FROM host_members hm WHERE hm.host_id = host_members.host_id AND hm.user_id = auth.uid()));

-- Fix host_invites policies
DROP POLICY IF EXISTS "Host members can create invites" ON public.host_invites;
DROP POLICY IF EXISTS "Host members can view invites" ON public.host_invites;

CREATE POLICY "Host members can create invites" ON public.host_invites FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM host_members hm WHERE hm.host_id = host_invites.host_id AND hm.user_id = auth.uid() AND hm.role = 'host'));

CREATE POLICY "Host members can view invites" ON public.host_invites FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM host_members hm WHERE hm.host_id = host_invites.host_id AND hm.user_id = auth.uid() AND hm.role = 'host'));

-- Fix hosts update policy
DROP POLICY IF EXISTS "Host members can update host" ON public.hosts;

CREATE POLICY "Host members can update host" ON public.hosts FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM host_members hm WHERE hm.host_id = hosts.id AND hm.user_id = auth.uid() AND hm.role = 'host'));
