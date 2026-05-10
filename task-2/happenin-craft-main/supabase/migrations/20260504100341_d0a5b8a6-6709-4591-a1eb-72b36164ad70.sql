
-- Enums
CREATE TYPE public.host_role AS ENUM ('host', 'checker');
CREATE TYPE public.event_venue_type AS ENUM ('physical', 'online');
CREATE TYPE public.event_visibility AS ENUM ('public', 'unlisted');
CREATE TYPE public.event_state AS ENUM ('draft', 'published', 'unpublished');
CREATE TYPE public.event_pricing AS ENUM ('free', 'paid');
CREATE TYPE public.rsvp_status AS ENUM ('confirmed', 'waitlisted', 'canceled');
CREATE TYPE public.gallery_status AS ENUM ('pending', 'approved', 'hidden', 'rejected');
CREATE TYPE public.report_target_type AS ENUM ('event', 'photo');
CREATE TYPE public.report_status AS ENUM ('open', 'reviewed', 'hidden', 'dismissed');

-- Profiles
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

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
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Hosts
CREATE TABLE public.hosts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  logo_url TEXT,
  bio TEXT,
  contact_email TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.hosts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Hosts are viewable by everyone" ON public.hosts FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create hosts" ON public.hosts FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);

-- Host Members
CREATE TABLE public.host_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  host_id UUID NOT NULL REFERENCES public.hosts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role host_role NOT NULL DEFAULT 'host',
  invited_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(host_id, user_id)
);
ALTER TABLE public.host_members ENABLE ROW LEVEL SECURITY;

-- Now add host update policy that references host_members
CREATE POLICY "Host members can update host" ON public.hosts FOR UPDATE TO authenticated USING (
  EXISTS (SELECT 1 FROM public.host_members hm WHERE hm.host_id = id AND hm.user_id = auth.uid() AND hm.role = 'host')
);

CREATE POLICY "Members can view own host members" ON public.host_members FOR SELECT TO authenticated USING (
  user_id = auth.uid() OR EXISTS (SELECT 1 FROM public.host_members hm2 WHERE hm2.host_id = host_id AND hm2.user_id = auth.uid())
);
CREATE POLICY "Host role can insert members" ON public.host_members FOR INSERT TO authenticated WITH CHECK (
  EXISTS (SELECT 1 FROM public.host_members hm WHERE hm.host_id = host_id AND hm.user_id = auth.uid() AND hm.role = 'host')
  OR (auth.uid() = user_id AND auth.uid() = (SELECT created_by FROM public.hosts WHERE id = host_id))
);
CREATE POLICY "Host role can delete members" ON public.host_members FOR DELETE TO authenticated USING (
  EXISTS (SELECT 1 FROM public.host_members hm WHERE hm.host_id = host_id AND hm.user_id = auth.uid() AND hm.role = 'host')
);

-- Host Invites
CREATE TABLE public.host_invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  host_id UUID NOT NULL REFERENCES public.hosts(id) ON DELETE CASCADE,
  role host_role NOT NULL DEFAULT 'checker',
  token TEXT UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(32), 'hex'),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '7 days'),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  accepted_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.host_invites ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Host members can view invites" ON public.host_invites FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM public.host_members hm WHERE hm.host_id = host_id AND hm.user_id = auth.uid() AND hm.role = 'host')
);
CREATE POLICY "Host members can create invites" ON public.host_invites FOR INSERT TO authenticated WITH CHECK (
  EXISTS (SELECT 1 FROM public.host_members hm WHERE hm.host_id = host_id AND hm.user_id = auth.uid() AND hm.role = 'host')
);
CREATE POLICY "Anyone authenticated can read invite by token" ON public.host_invites FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can accept invites" ON public.host_invites FOR UPDATE TO authenticated USING (accepted_by IS NULL) WITH CHECK (auth.uid() = accepted_by);

-- Events
CREATE TABLE public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  host_id UUID NOT NULL REFERENCES public.hosts(id) ON DELETE CASCADE,
  slug TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ NOT NULL,
  timezone TEXT NOT NULL DEFAULT 'UTC',
  venue_type event_venue_type NOT NULL DEFAULT 'physical',
  venue_address TEXT,
  online_url TEXT,
  capacity INTEGER NOT NULL DEFAULT 100,
  cover_image_url TEXT,
  visibility event_visibility NOT NULL DEFAULT 'public',
  state event_state NOT NULL DEFAULT 'draft',
  pricing_mode event_pricing NOT NULL DEFAULT 'free',
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  duplicated_from_event_id UUID REFERENCES public.events(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(host_id, slug)
);
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Published events are viewable by everyone" ON public.events FOR SELECT USING (
  (state = 'published') OR
  EXISTS (SELECT 1 FROM public.host_members hm WHERE hm.host_id = host_id AND hm.user_id = auth.uid())
);
CREATE POLICY "Host members can insert events" ON public.events FOR INSERT TO authenticated WITH CHECK (
  EXISTS (SELECT 1 FROM public.host_members hm WHERE hm.host_id = host_id AND hm.user_id = auth.uid() AND hm.role = 'host')
);
CREATE POLICY "Host members can update events" ON public.events FOR UPDATE TO authenticated USING (
  EXISTS (SELECT 1 FROM public.host_members hm WHERE hm.host_id = host_id AND hm.user_id = auth.uid() AND hm.role = 'host')
);
CREATE POLICY "Host members can delete events" ON public.events FOR DELETE TO authenticated USING (
  EXISTS (SELECT 1 FROM public.host_members hm WHERE hm.host_id = host_id AND hm.user_id = auth.uid() AND hm.role = 'host')
);
