-- Create profiles table for user management
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  email TEXT,
  full_name TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('admin', 'editor', 'user')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create speakers table
CREATE TABLE public.speakers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  organization TEXT,
  title TEXT,
  bio TEXT,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on speakers
ALTER TABLE public.speakers ENABLE ROW LEVEL SECURITY;

-- Create sponsors table
CREATE TABLE public.sponsors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  logo_url TEXT,
  website_url TEXT,
  tier TEXT CHECK (tier IN ('platinum', 'gold', 'silver', 'bronze')) DEFAULT 'bronze',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on sponsors
ALTER TABLE public.sponsors ENABLE ROW LEVEL SECURITY;

-- Create events table
CREATE TABLE public.events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  theme TEXT,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  location TEXT NOT NULL,
  image_url TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on events
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- Create agenda_items table
CREATE TABLE public.agenda_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  start_time TIME,
  end_time TIME,
  day_number INTEGER DEFAULT 1,
  speaker_id UUID REFERENCES public.speakers(id) ON DELETE SET NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on agenda_items
ALTER TABLE public.agenda_items ENABLE ROW LEVEL SECURITY;

-- Create event_speakers junction table
CREATE TABLE public.event_speakers (
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
  speaker_id UUID REFERENCES public.speakers(id) ON DELETE CASCADE,
  PRIMARY KEY (event_id, speaker_id)
);

-- Enable RLS on event_speakers
ALTER TABLE public.event_speakers ENABLE ROW LEVEL SECURITY;

-- Create event_sponsors junction table
CREATE TABLE public.event_sponsors (
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
  sponsor_id UUID REFERENCES public.sponsors(id) ON DELETE CASCADE,
  PRIMARY KEY (event_id, sponsor_id)
);

-- Enable RLS on event_sponsors
ALTER TABLE public.event_sponsors ENABLE ROW LEVEL SECURITY;

-- Create papers table
CREATE TABLE public.papers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  abstract TEXT,
  authors TEXT[] NOT NULL,
  pdf_url TEXT,
  published_date DATE,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  category TEXT,
  tags TEXT[],
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on papers
ALTER TABLE public.papers ENABLE ROW LEVEL SECURITY;

-- Create offices table
CREATE TABLE public.offices (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  region TEXT NOT NULL,
  city TEXT NOT NULL,
  country TEXT NOT NULL,
  address TEXT,
  phone TEXT,
  email TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on offices
ALTER TABLE public.offices ENABLE ROW LEVEL SECURITY;

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_speakers_updated_at
  BEFORE UPDATE ON public.speakers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_sponsors_updated_at
  BEFORE UPDATE ON public.sponsors
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_events_updated_at
  BEFORE UPDATE ON public.events
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_agenda_items_updated_at
  BEFORE UPDATE ON public.agenda_items
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_papers_updated_at
  BEFORE UPDATE ON public.papers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_offices_updated_at
  BEFORE UPDATE ON public.offices
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to handle new user profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data ->> 'full_name');
  RETURN NEW;
END;
$$;

-- Create trigger for automatic profile creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Create security definer function to check user role
CREATE OR REPLACE FUNCTION public.get_user_role(user_id UUID)
RETURNS TEXT
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT role FROM public.profiles WHERE profiles.user_id = $1;
$$;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile" 
  ON public.profiles FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
  ON public.profiles FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all profiles" 
  ON public.profiles FOR SELECT 
  USING (public.get_user_role(auth.uid()) = 'admin');

CREATE POLICY "Admins can update all profiles" 
  ON public.profiles FOR UPDATE 
  USING (public.get_user_role(auth.uid()) = 'admin');

-- RLS Policies for speakers (public read, admin/editor write)
CREATE POLICY "Anyone can view published speakers" 
  ON public.speakers FOR SELECT 
  USING (true);

CREATE POLICY "Admins and editors can manage speakers" 
  ON public.speakers FOR ALL 
  USING (public.get_user_role(auth.uid()) IN ('admin', 'editor'));

-- RLS Policies for sponsors (public read, admin/editor write)
CREATE POLICY "Anyone can view sponsors" 
  ON public.sponsors FOR SELECT 
  USING (true);

CREATE POLICY "Admins and editors can manage sponsors" 
  ON public.sponsors FOR ALL 
  USING (public.get_user_role(auth.uid()) IN ('admin', 'editor'));

-- RLS Policies for events (public read published, admin/editor write)
CREATE POLICY "Anyone can view published events" 
  ON public.events FOR SELECT 
  USING (status = 'published');

CREATE POLICY "Admins and editors can view all events" 
  ON public.events FOR SELECT 
  USING (public.get_user_role(auth.uid()) IN ('admin', 'editor'));

CREATE POLICY "Admins and editors can manage events" 
  ON public.events FOR ALL 
  USING (public.get_user_role(auth.uid()) IN ('admin', 'editor'));

-- RLS Policies for agenda_items (follows parent event visibility)
CREATE POLICY "Anyone can view agenda items for published events" 
  ON public.agenda_items FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.events 
      WHERE events.id = agenda_items.event_id 
      AND events.status = 'published'
    )
  );

CREATE POLICY "Admins and editors can manage agenda items" 
  ON public.agenda_items FOR ALL 
  USING (public.get_user_role(auth.uid()) IN ('admin', 'editor'));

-- RLS Policies for event_speakers (follows parent event visibility)
CREATE POLICY "Anyone can view event speakers for published events" 
  ON public.event_speakers FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.events 
      WHERE events.id = event_speakers.event_id 
      AND events.status = 'published'
    )
  );

CREATE POLICY "Admins and editors can manage event speakers" 
  ON public.event_speakers FOR ALL 
  USING (public.get_user_role(auth.uid()) IN ('admin', 'editor'));

-- RLS Policies for event_sponsors (follows parent event visibility)
CREATE POLICY "Anyone can view event sponsors for published events" 
  ON public.event_sponsors FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.events 
      WHERE events.id = event_sponsors.event_id 
      AND events.status = 'published'
    )
  );

CREATE POLICY "Admins and editors can manage event sponsors" 
  ON public.event_sponsors FOR ALL 
  USING (public.get_user_role(auth.uid()) IN ('admin', 'editor'));

-- RLS Policies for papers (public read published, admin/editor write)
CREATE POLICY "Anyone can view published papers" 
  ON public.papers FOR SELECT 
  USING (status = 'published');

CREATE POLICY "Admins and editors can view all papers" 
  ON public.papers FOR SELECT 
  USING (public.get_user_role(auth.uid()) IN ('admin', 'editor'));

CREATE POLICY "Admins and editors can manage papers" 
  ON public.papers FOR ALL 
  USING (public.get_user_role(auth.uid()) IN ('admin', 'editor'));

-- RLS Policies for offices (public read, admin write)
CREATE POLICY "Anyone can view active offices" 
  ON public.offices FOR SELECT 
  USING (status = 'active');

CREATE POLICY "Admins can manage offices" 
  ON public.offices FOR ALL 
  USING (public.get_user_role(auth.uid()) = 'admin');

-- Create indexes for better performance
CREATE INDEX idx_events_status ON public.events(status);
CREATE INDEX idx_events_dates ON public.events(start_date, end_date);
CREATE INDEX idx_papers_status ON public.papers(status);
CREATE INDEX idx_papers_published_date ON public.papers(published_date);
CREATE INDEX idx_agenda_items_event_id ON public.agenda_items(event_id);
CREATE INDEX idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX idx_offices_status ON public.offices(status);