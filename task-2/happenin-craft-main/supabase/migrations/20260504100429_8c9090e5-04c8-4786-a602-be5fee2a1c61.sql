
-- Fix security warnings: set search_path and restrict execution
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.raw_user_meta_data ->> 'name', ''),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'avatar_url', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM public, anon, authenticated;

-- RSVPs
CREATE TABLE public.rsvps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status rsvp_status NOT NULL DEFAULT 'confirmed',
  queue_position INTEGER,
  promoted_at TIMESTAMPTZ,
  canceled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(event_id, user_id)
);
ALTER TABLE public.rsvps ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own RSVPs" ON public.rsvps FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Host members can view event RSVPs" ON public.rsvps FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM public.host_members hm JOIN public.events e ON e.host_id = hm.host_id WHERE e.id = event_id AND hm.user_id = auth.uid())
);
CREATE POLICY "Authenticated users can RSVP" ON public.rsvps FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can cancel own RSVP" ON public.rsvps FOR UPDATE TO authenticated USING (user_id = auth.uid());

-- Tickets
CREATE TABLE public.tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  rsvp_id UUID NOT NULL REFERENCES public.rsvps(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  ticket_code TEXT UNIQUE NOT NULL DEFAULT upper(encode(gen_random_bytes(6), 'hex')),
  qr_payload TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  issued_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own tickets" ON public.tickets FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Host members can view event tickets" ON public.tickets FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM public.host_members hm JOIN public.events e ON e.host_id = hm.host_id WHERE e.id = event_id AND hm.user_id = auth.uid())
);

-- Check-ins
CREATE TABLE public.check_ins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  ticket_id UUID NOT NULL REFERENCES public.tickets(id) ON DELETE CASCADE,
  checked_in_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  checked_in_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  undone_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  undone_at TIMESTAMPTZ,
  is_active BOOLEAN NOT NULL DEFAULT true
);
ALTER TABLE public.check_ins ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Host members can manage check-ins" ON public.check_ins FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM public.host_members hm JOIN public.events e ON e.host_id = hm.host_id WHERE e.id = event_id AND hm.user_id = auth.uid())
);
CREATE POLICY "Users can view own check-ins" ON public.check_ins FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM public.tickets t WHERE t.id = ticket_id AND t.user_id = auth.uid())
);

-- Feedback
CREATE TABLE public.feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(event_id, user_id)
);
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can insert own feedback" ON public.feedback FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view own feedback" ON public.feedback FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Host members can view event feedback" ON public.feedback FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM public.host_members hm JOIN public.events e ON e.host_id = hm.host_id WHERE e.id = event_id AND hm.user_id = auth.uid())
);
CREATE POLICY "Anyone can view feedback" ON public.feedback FOR SELECT USING (true);

-- Gallery Uploads
CREATE TABLE public.gallery_uploads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  status gallery_status NOT NULL DEFAULT 'pending',
  reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.gallery_uploads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Approved gallery items are public" ON public.gallery_uploads FOR SELECT USING (status = 'approved');
CREATE POLICY "Users can view own uploads" ON public.gallery_uploads FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Host members can view all gallery items" ON public.gallery_uploads FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM public.host_members hm JOIN public.events e ON e.host_id = hm.host_id WHERE e.id = event_id AND hm.user_id = auth.uid())
);
CREATE POLICY "Authenticated users can upload" ON public.gallery_uploads FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Host members can update gallery status" ON public.gallery_uploads FOR UPDATE TO authenticated USING (
  EXISTS (SELECT 1 FROM public.host_members hm JOIN public.events e ON e.host_id = hm.host_id WHERE e.id = event_id AND hm.user_id = auth.uid() AND hm.role = 'host')
);

-- Reports
CREATE TABLE public.reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  target_type report_target_type NOT NULL,
  target_id UUID NOT NULL,
  reason TEXT NOT NULL,
  details TEXT,
  status report_status NOT NULL DEFAULT 'open',
  resolved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can insert reports" ON public.reports FOR INSERT TO authenticated WITH CHECK (auth.uid() = reporter_user_id);
CREATE POLICY "Users can view own reports" ON public.reports FOR SELECT TO authenticated USING (reporter_user_id = auth.uid());
CREATE POLICY "Host members can view reports" ON public.reports FOR SELECT TO authenticated USING (
  (target_type = 'event' AND EXISTS (
    SELECT 1 FROM public.host_members hm JOIN public.events e ON e.host_id = hm.host_id WHERE e.id = target_id AND hm.user_id = auth.uid() AND hm.role = 'host'
  )) OR
  (target_type = 'photo' AND EXISTS (
    SELECT 1 FROM public.gallery_uploads gu JOIN public.events e ON e.id = gu.event_id JOIN public.host_members hm ON hm.host_id = e.host_id WHERE gu.id = target_id AND hm.user_id = auth.uid() AND hm.role = 'host'
  ))
);
CREATE POLICY "Host members can update reports" ON public.reports FOR UPDATE TO authenticated USING (
  (target_type = 'event' AND EXISTS (
    SELECT 1 FROM public.host_members hm JOIN public.events e ON e.host_id = hm.host_id WHERE e.id = target_id AND hm.user_id = auth.uid() AND hm.role = 'host'
  )) OR
  (target_type = 'photo' AND EXISTS (
    SELECT 1 FROM public.gallery_uploads gu JOIN public.events e ON e.id = gu.event_id JOIN public.host_members hm ON hm.host_id = e.host_id WHERE gu.id = target_id AND hm.user_id = auth.uid() AND hm.role = 'host'
  ))
);

-- RSVP handler (atomic capacity + waitlist)
CREATE OR REPLACE FUNCTION public.handle_rsvp(p_event_id UUID, p_user_id UUID)
RETURNS JSON AS $$
DECLARE
  v_capacity INTEGER;
  v_confirmed_count INTEGER;
  v_existing RECORD;
  v_new_status rsvp_status;
  v_rsvp_id UUID;
  v_queue_pos INTEGER;
BEGIN
  SELECT id, status INTO v_existing FROM public.rsvps WHERE event_id = p_event_id AND user_id = p_user_id;
  IF v_existing.id IS NOT NULL AND v_existing.status != 'canceled' THEN
    RETURN json_build_object('error', 'Already RSVPed', 'status', v_existing.status);
  END IF;

  SELECT capacity INTO v_capacity FROM public.events WHERE id = p_event_id AND state = 'published';
  IF v_capacity IS NULL THEN
    RETURN json_build_object('error', 'Event not found or not published');
  END IF;

  SELECT COUNT(*) INTO v_confirmed_count FROM public.rsvps WHERE event_id = p_event_id AND status = 'confirmed';

  IF v_confirmed_count < v_capacity THEN
    v_new_status := 'confirmed';
    v_queue_pos := NULL;
  ELSE
    v_new_status := 'waitlisted';
    SELECT COALESCE(MAX(queue_position), 0) + 1 INTO v_queue_pos FROM public.rsvps WHERE event_id = p_event_id AND status = 'waitlisted';
  END IF;

  IF v_existing.id IS NOT NULL THEN
    UPDATE public.rsvps SET status = v_new_status, queue_position = v_queue_pos, canceled_at = NULL WHERE id = v_existing.id RETURNING id INTO v_rsvp_id;
  ELSE
    INSERT INTO public.rsvps (event_id, user_id, status, queue_position) VALUES (p_event_id, p_user_id, v_new_status, v_queue_pos) RETURNING id INTO v_rsvp_id;
  END IF;

  IF v_new_status = 'confirmed' THEN
    INSERT INTO public.tickets (event_id, rsvp_id, user_id) VALUES (p_event_id, v_rsvp_id, p_user_id);
  END IF;

  RETURN json_build_object('status', v_new_status, 'rsvp_id', v_rsvp_id, 'queue_position', v_queue_pos);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

REVOKE EXECUTE ON FUNCTION public.handle_rsvp(UUID, UUID) FROM public, anon;

-- Waitlist promotion
CREATE OR REPLACE FUNCTION public.promote_waitlist(p_event_id UUID)
RETURNS JSON AS $$
DECLARE
  v_capacity INTEGER;
  v_confirmed_count INTEGER;
  v_next RECORD;
  v_promoted INTEGER := 0;
BEGIN
  SELECT capacity INTO v_capacity FROM public.events WHERE id = p_event_id;
  SELECT COUNT(*) INTO v_confirmed_count FROM public.rsvps WHERE event_id = p_event_id AND status = 'confirmed';

  WHILE v_confirmed_count < v_capacity LOOP
    SELECT id, user_id INTO v_next FROM public.rsvps WHERE event_id = p_event_id AND status = 'waitlisted' ORDER BY queue_position ASC NULLS LAST, created_at ASC LIMIT 1;
    EXIT WHEN v_next IS NULL;
    UPDATE public.rsvps SET status = 'confirmed', promoted_at = now(), queue_position = NULL WHERE id = v_next.id;
    INSERT INTO public.tickets (event_id, rsvp_id, user_id) VALUES (p_event_id, v_next.id, v_next.user_id);
    v_confirmed_count := v_confirmed_count + 1;
    v_promoted := v_promoted + 1;
  END LOOP;

  RETURN json_build_object('promoted', v_promoted);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

REVOKE EXECUTE ON FUNCTION public.promote_waitlist(UUID) FROM public, anon;

-- Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.rsvps;
ALTER PUBLICATION supabase_realtime ADD TABLE public.check_ins;
