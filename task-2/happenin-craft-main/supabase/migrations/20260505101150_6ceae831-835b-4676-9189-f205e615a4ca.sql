
-- Create security definer function to check host membership
CREATE OR REPLACE FUNCTION public.is_host_member(_host_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.host_members
    WHERE host_id = _host_id AND user_id = _user_id
  )
$$;

CREATE OR REPLACE FUNCTION public.is_host_role(_host_id uuid, _user_id uuid, _role host_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.host_members
    WHERE host_id = _host_id AND user_id = _user_id AND role = _role
  )
$$;

-- Drop and recreate host_members policies
DROP POLICY IF EXISTS "Members can view own host members" ON public.host_members;
DROP POLICY IF EXISTS "Host role can insert members" ON public.host_members;
DROP POLICY IF EXISTS "Host role can delete members" ON public.host_members;

CREATE POLICY "Members can view own host members"
ON public.host_members FOR SELECT TO authenticated
USING (
  user_id = auth.uid()
  OR public.is_host_member(host_id, auth.uid())
);

CREATE POLICY "Host role can insert members"
ON public.host_members FOR INSERT TO authenticated
WITH CHECK (
  public.is_host_role(host_id, auth.uid(), 'host')
  OR (
    auth.uid() = user_id
    AND auth.uid() = (SELECT created_by FROM public.hosts WHERE id = host_id)
  )
);

CREATE POLICY "Host role can delete members"
ON public.host_members FOR DELETE TO authenticated
USING (public.is_host_role(host_id, auth.uid(), 'host'));

-- Also fix other tables that reference host_members in their policies
-- events
DROP POLICY IF EXISTS "Host members can insert events" ON public.events;
DROP POLICY IF EXISTS "Host members can update events" ON public.events;
DROP POLICY IF EXISTS "Host members can delete events" ON public.events;
DROP POLICY IF EXISTS "Published events are viewable by everyone" ON public.events;

CREATE POLICY "Host members can insert events" ON public.events
FOR INSERT TO authenticated
WITH CHECK (public.is_host_role(host_id, auth.uid(), 'host'));

CREATE POLICY "Host members can update events" ON public.events
FOR UPDATE TO authenticated
USING (public.is_host_role(host_id, auth.uid(), 'host'));

CREATE POLICY "Host members can delete events" ON public.events
FOR DELETE TO authenticated
USING (public.is_host_role(host_id, auth.uid(), 'host'));

CREATE POLICY "Published events are viewable by everyone" ON public.events
FOR SELECT TO public
USING (
  state = 'published'
  OR public.is_host_member(host_id, auth.uid())
);

-- hosts
DROP POLICY IF EXISTS "Host members can update host" ON public.hosts;
CREATE POLICY "Host members can update host" ON public.hosts
FOR UPDATE TO authenticated
USING (public.is_host_role(id, auth.uid(), 'host'));

-- host_invites
DROP POLICY IF EXISTS "Host members can create invites" ON public.host_invites;
DROP POLICY IF EXISTS "Host members can view invites" ON public.host_invites;

CREATE POLICY "Host members can create invites" ON public.host_invites
FOR INSERT TO authenticated
WITH CHECK (public.is_host_role(host_id, auth.uid(), 'host'));

CREATE POLICY "Host members can view invites" ON public.host_invites
FOR SELECT TO authenticated
USING (public.is_host_role(host_id, auth.uid(), 'host'));

-- check_ins
DROP POLICY IF EXISTS "Host members can manage check-ins" ON public.check_ins;
CREATE POLICY "Host members can manage check-ins" ON public.check_ins
FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM events e
    WHERE e.id = check_ins.event_id
    AND public.is_host_member(e.host_id, auth.uid())
  )
);

-- rsvps
DROP POLICY IF EXISTS "Host members can view event RSVPs" ON public.rsvps;
CREATE POLICY "Host members can view event RSVPs" ON public.rsvps
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM events e
    WHERE e.id = rsvps.event_id
    AND public.is_host_member(e.host_id, auth.uid())
  )
);

-- tickets
DROP POLICY IF EXISTS "Host members can view event tickets" ON public.tickets;
CREATE POLICY "Host members can view event tickets" ON public.tickets
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM events e
    WHERE e.id = tickets.event_id
    AND public.is_host_member(e.host_id, auth.uid())
  )
);

-- gallery_uploads
DROP POLICY IF EXISTS "Host members can view all gallery items" ON public.gallery_uploads;
DROP POLICY IF EXISTS "Host members can update gallery status" ON public.gallery_uploads;

CREATE POLICY "Host members can view all gallery items" ON public.gallery_uploads
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM events e
    WHERE e.id = gallery_uploads.event_id
    AND public.is_host_member(e.host_id, auth.uid())
  )
);

CREATE POLICY "Host members can update gallery status" ON public.gallery_uploads
FOR UPDATE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM events e
    WHERE e.id = gallery_uploads.event_id
    AND public.is_host_role(e.host_id, auth.uid(), 'host')
  )
);

-- feedback
DROP POLICY IF EXISTS "Host members can view event feedback" ON public.feedback;
CREATE POLICY "Host members can view event feedback" ON public.feedback
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM events e
    WHERE e.id = feedback.event_id
    AND public.is_host_member(e.host_id, auth.uid())
  )
);

-- reports (these join through events, not directly to host_members, but let's use the function too)
DROP POLICY IF EXISTS "Host members can view reports" ON public.reports;
DROP POLICY IF EXISTS "Host members can update reports" ON public.reports;

CREATE POLICY "Host members can view reports" ON public.reports
FOR SELECT TO authenticated
USING (
  (target_type = 'event' AND EXISTS (
    SELECT 1 FROM events e WHERE e.id = reports.target_id
    AND public.is_host_role(e.host_id, auth.uid(), 'host')
  ))
  OR
  (target_type = 'photo' AND EXISTS (
    SELECT 1 FROM gallery_uploads gu
    JOIN events e ON e.id = gu.event_id
    WHERE gu.id = reports.target_id
    AND public.is_host_role(e.host_id, auth.uid(), 'host')
  ))
);

CREATE POLICY "Host members can update reports" ON public.reports
FOR UPDATE TO authenticated
USING (
  (target_type = 'event' AND EXISTS (
    SELECT 1 FROM events e WHERE e.id = reports.target_id
    AND public.is_host_role(e.host_id, auth.uid(), 'host')
  ))
  OR
  (target_type = 'photo' AND EXISTS (
    SELECT 1 FROM gallery_uploads gu
    JOIN events e ON e.id = gu.event_id
    WHERE gu.id = reports.target_id
    AND public.is_host_role(e.host_id, auth.uid(), 'host')
  ))
);
