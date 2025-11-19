-- Add event categorization and type fields to events table
ALTER TABLE public.events 
ADD COLUMN event_type TEXT DEFAULT 'conference',
ADD COLUMN category TEXT,
ADD COLUMN industry_sector TEXT,
ADD COLUMN tags TEXT[];

-- Add check constraints for event_type
ALTER TABLE public.events 
ADD CONSTRAINT events_event_type_check 
CHECK (event_type IN ('conference', 'exhibition', 'gala', 'workshop', 'seminar', 'networking', 'webinar'));

-- Create event_categories table for flexible category management
CREATE TABLE public.event_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  color TEXT DEFAULT '#0B5FFF',
  icon TEXT,
  industry_sector TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create event_types table for flexible type management
CREATE TABLE public.event_types (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  color TEXT DEFAULT '#0B5FFF',
  icon TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on new tables
ALTER TABLE public.event_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_types ENABLE ROW LEVEL SECURITY;

-- RLS policies for event_categories
CREATE POLICY "Anyone can view event categories" 
ON public.event_categories 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage event categories" 
ON public.event_categories 
FOR ALL 
USING (get_user_role(auth.uid()) = 'admin');

-- RLS policies for event_types
CREATE POLICY "Anyone can view event types" 
ON public.event_types 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage event types" 
ON public.event_types 
FOR ALL 
USING (get_user_role(auth.uid()) = 'admin');

-- Insert default event categories
INSERT INTO public.event_categories (name, description, industry_sector) VALUES
('Core Banking Systems', 'Banking technology and system implementations', 'Financial Services'),
('Digital Marketing', 'Digital marketing strategies and technologies', 'Marketing'),
('Artificial Intelligence', 'AI technologies and applications', 'Technology'),
('Automation', 'Process automation and efficiency', 'Technology'),
('eBoard Management Systems', 'Electronic board management solutions', 'Governance'),
('Records Management', 'Information and document management', 'Information Management'),
('Data Governance', 'Data quality, compliance, and management', 'Information Management'),
('Cybersecurity', 'Information security and protection', 'Technology'),
('Cloud Computing', 'Cloud technologies and services', 'Technology'),
('Business Intelligence', 'BI and analytics solutions', 'Analytics'),
('Risk Management', 'Enterprise risk and compliance', 'Governance'),
('Regulatory Compliance', 'Industry regulations and compliance', 'Governance');

-- Insert default event types
INSERT INTO public.event_types (name, description, icon) VALUES
('conference', 'Multi-day professional conferences', 'Calendar'),
('exhibition', 'Trade shows and exhibitions', 'Store'),
('gala', 'Formal networking and awards events', 'Award'),
('workshop', 'Hands-on training workshops', 'Wrench'),
('seminar', 'Educational seminars and presentations', 'BookOpen'),
('networking', 'Professional networking events', 'Users'),
('webinar', 'Online presentations and discussions', 'Video');

-- Add triggers for updated_at timestamps
CREATE TRIGGER update_event_categories_updated_at
  BEFORE UPDATE ON public.event_categories
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_event_types_updated_at
  BEFORE UPDATE ON public.event_types
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();