-- Phase 0: Critical Security Fix - User Roles System (Fixed Order)
-- This migration creates a secure role system to prevent privilege escalation

-- Step 1: Create role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'editor', 'user');

-- Step 2: Create user_roles table
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Step 3: Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Step 4: Migrate existing roles from profiles to user_roles
INSERT INTO public.user_roles (user_id, role)
SELECT user_id, role::app_role
FROM public.profiles
WHERE role IS NOT NULL AND role IN ('admin', 'editor', 'user')
ON CONFLICT (user_id, role) DO NOTHING;

-- Step 5: DROP ALL OLD POLICIES FIRST (that depend on get_user_role)
-- Profiles
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admin can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can manage all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;

-- Speakers
DROP POLICY IF EXISTS "Speakers are viewable by everyone" ON public.speakers;
DROP POLICY IF EXISTS "Anyone can view published speakers" ON public.speakers;
DROP POLICY IF EXISTS "Admin and editors can manage speakers" ON public.speakers;
DROP POLICY IF EXISTS "Admins and editors can manage speakers" ON public.speakers;

-- Sponsors
DROP POLICY IF EXISTS "Sponsors are viewable by everyone" ON public.sponsors;
DROP POLICY IF EXISTS "Anyone can view sponsors" ON public.sponsors;
DROP POLICY IF EXISTS "Admin and editors can manage sponsors" ON public.sponsors;
DROP POLICY IF EXISTS "Admins and editors can manage sponsors" ON public.sponsors;

-- Events
DROP POLICY IF EXISTS "Events are viewable by everyone" ON public.events;
DROP POLICY IF EXISTS "Anyone can view published events" ON public.events;
DROP POLICY IF EXISTS "Admin can create events" ON public.events;
DROP POLICY IF EXISTS "Admin and editors can update events" ON public.events;
DROP POLICY IF EXISTS "Admins and editors can view all events" ON public.events;
DROP POLICY IF EXISTS "Admins and editors can manage events" ON public.events;

-- Agenda items
DROP POLICY IF EXISTS "Agenda items are viewable by everyone" ON public.agenda_items;
DROP POLICY IF EXISTS "Anyone can view agenda items for published events" ON public.agenda_items;
DROP POLICY IF EXISTS "Admin and editors can manage agenda items" ON public.agenda_items;
DROP POLICY IF EXISTS "Admins and editors can manage agenda items" ON public.agenda_items;

-- Event speakers
DROP POLICY IF EXISTS "Event speakers are viewable by everyone" ON public.event_speakers;
DROP POLICY IF EXISTS "Anyone can view event speakers for published events" ON public.event_speakers;
DROP POLICY IF EXISTS "Admin and editors can manage event speakers" ON public.event_speakers;
DROP POLICY IF EXISTS "Admins and editors can manage event speakers" ON public.event_speakers;

-- Event sponsors
DROP POLICY IF EXISTS "Event sponsors are viewable by everyone" ON public.event_sponsors;
DROP POLICY IF EXISTS "Anyone can view event sponsors for published events" ON public.event_sponsors;
DROP POLICY IF EXISTS "Admin and editors can manage event sponsors" ON public.event_sponsors;
DROP POLICY IF EXISTS "Admins and editors can manage event sponsors" ON public.event_sponsors;

-- Papers
DROP POLICY IF EXISTS "Papers are viewable by everyone" ON public.papers;
DROP POLICY IF EXISTS "Anyone can view published papers" ON public.papers;
DROP POLICY IF EXISTS "Admin and editors can create papers" ON public.papers;
DROP POLICY IF EXISTS "Admin and editors can update papers" ON public.papers;
DROP POLICY IF EXISTS "Admins and editors can view all papers" ON public.papers;
DROP POLICY IF EXISTS "Admins and editors can manage papers" ON public.papers;

-- Offices
DROP POLICY IF EXISTS "Offices are viewable by everyone" ON public.offices;
DROP POLICY IF EXISTS "Public can view office basic location info" ON public.offices;
DROP POLICY IF EXISTS "Authenticated users can view all office info" ON public.offices;
DROP POLICY IF EXISTS "Admin can create offices" ON public.offices;
DROP POLICY IF EXISTS "Admin can update offices" ON public.offices;
DROP POLICY IF EXISTS "Admins can manage offices" ON public.offices;

-- Event categories
DROP POLICY IF EXISTS "Event categories are viewable by everyone" ON public.event_categories;
DROP POLICY IF EXISTS "Anyone can view event categories" ON public.event_categories;
DROP POLICY IF EXISTS "Admin can manage event categories" ON public.event_categories;
DROP POLICY IF EXISTS "Admins can manage event categories" ON public.event_categories;

-- Event types
DROP POLICY IF EXISTS "Event types are viewable by everyone" ON public.event_types;
DROP POLICY IF EXISTS "Anyone can view event types" ON public.event_types;
DROP POLICY IF EXISTS "Admin can manage event types" ON public.event_types;
DROP POLICY IF EXISTS "Admins can manage event types" ON public.event_types;

-- Event fees
DROP POLICY IF EXISTS "Event fees are viewable by everyone" ON public.event_fees;
DROP POLICY IF EXISTS "Anyone can view fees for published events" ON public.event_fees;
DROP POLICY IF EXISTS "Admin and editors can manage event fees" ON public.event_fees;
DROP POLICY IF EXISTS "Admins and editors can view all event fees" ON public.event_fees;
DROP POLICY IF EXISTS "Admins and editors can manage event fees" ON public.event_fees;

-- Storage policies
DROP POLICY IF EXISTS "Avatar images are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Event images are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Admins and editors can upload event images" ON storage.objects;
DROP POLICY IF EXISTS "Admins and editors can update event images" ON storage.objects;
DROP POLICY IF EXISTS "Admins and editors can delete event images" ON storage.objects;

-- Step 6: NOW drop old insecure function
DROP FUNCTION IF EXISTS public.get_user_role(uuid);

-- Step 7: CREATE NEW POLICIES using has_role function

-- Profiles policies
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage all profiles"
  ON public.profiles FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Speakers policies
CREATE POLICY "Anyone can view speakers"
  ON public.speakers FOR SELECT
  USING (true);

CREATE POLICY "Admins and editors can manage speakers"
  ON public.speakers FOR ALL
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'editor')
  );

-- Sponsors policies
CREATE POLICY "Anyone can view sponsors"
  ON public.sponsors FOR SELECT
  USING (true);

CREATE POLICY "Admins and editors can manage sponsors"
  ON public.sponsors FOR ALL
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'editor')
  );

-- Events policies
CREATE POLICY "Anyone can view published events"
  ON public.events FOR SELECT
  USING (status = 'published');

CREATE POLICY "Admins and editors can view all events"
  ON public.events FOR SELECT
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'editor')
  );

CREATE POLICY "Admins and editors can create events"
  ON public.events FOR INSERT
  TO authenticated
  WITH CHECK (
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'editor')
  );

CREATE POLICY "Admins and editors can update events"
  ON public.events FOR UPDATE
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'editor')
  );

CREATE POLICY "Admins can delete events"
  ON public.events FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Agenda items policies
CREATE POLICY "Anyone can view agenda items for published events"
  ON public.agenda_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM events
      WHERE events.id = agenda_items.event_id AND events.status = 'published'
    )
  );

CREATE POLICY "Admins and editors can manage agenda items"
  ON public.agenda_items FOR ALL
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'editor')
  );

-- Event speakers policies
CREATE POLICY "Anyone can view event speakers for published events"
  ON public.event_speakers FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM events
      WHERE events.id = event_speakers.event_id AND events.status = 'published'
    )
  );

CREATE POLICY "Admins and editors can manage event speakers"
  ON public.event_speakers FOR ALL
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'editor')
  );

-- Event sponsors policies
CREATE POLICY "Anyone can view event sponsors for published events"
  ON public.event_sponsors FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM events
      WHERE events.id = event_sponsors.event_id AND events.status = 'published'
    )
  );

CREATE POLICY "Admins and editors can manage event sponsors"
  ON public.event_sponsors FOR ALL
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'editor')
  );

-- Papers policies
CREATE POLICY "Anyone can view published papers"
  ON public.papers FOR SELECT
  USING (status = 'published');

CREATE POLICY "Admins and editors can view all papers"
  ON public.papers FOR SELECT
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'editor')
  );

CREATE POLICY "Admins and editors can create papers"
  ON public.papers FOR INSERT
  TO authenticated
  WITH CHECK (
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'editor')
  );

CREATE POLICY "Admins and editors can update papers"
  ON public.papers FOR UPDATE
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'editor')
  );

CREATE POLICY "Admins can delete papers"
  ON public.papers FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Offices policies
CREATE POLICY "Public can view office basic location info"
  ON public.offices FOR SELECT
  USING (status = 'active' AND auth.uid() IS NULL);

CREATE POLICY "Authenticated users can view all office info"
  ON public.offices FOR SELECT
  TO authenticated
  USING (status = 'active');

CREATE POLICY "Admins can create offices"
  ON public.offices FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update offices"
  ON public.offices FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete offices"
  ON public.offices FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Event categories policies
CREATE POLICY "Anyone can view event categories"
  ON public.event_categories FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage event categories"
  ON public.event_categories FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Event types policies
CREATE POLICY "Anyone can view event types"
  ON public.event_types FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage event types"
  ON public.event_types FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Event fees policies
CREATE POLICY "Anyone can view fees for published events"
  ON public.event_fees FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM events
      WHERE events.id = event_fees.event_id AND events.status = 'published'
    )
  );

CREATE POLICY "Admins and editors can view all event fees"
  ON public.event_fees FOR SELECT
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'editor')
  );

CREATE POLICY "Admins and editors can manage event fees"
  ON public.event_fees FOR ALL
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'editor')
  );

-- Storage policies
CREATE POLICY "Avatar images are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can update their own avatar"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'avatars' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Event images are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'event-images');

CREATE POLICY "Admins and editors can upload event images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'event-images' AND 
    (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'editor'))
  );

CREATE POLICY "Admins and editors can update event images"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'event-images' AND 
    (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'editor'))
  );

-- Step 8: RLS Policies for user_roles table
CREATE POLICY "Admins can view all roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage roles"
  ON public.user_roles FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Step 9: Add trigger for updated_at on user_roles
CREATE TRIGGER update_user_roles_updated_at
BEFORE UPDATE ON user_roles
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();