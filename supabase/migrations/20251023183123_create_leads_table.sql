-- Phase 1: RIMEA Database Foundation - Leads Management System

-- Step 1: Create leads table
CREATE TABLE public.leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reference_number TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Contact Information
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  organization TEXT NOT NULL,
  country TEXT NOT NULL,
  
  -- Inquiry Details
  training_interest TEXT NOT NULL,
  source TEXT DEFAULT 'Website',
  message TEXT,
  
  -- Lead Management
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'doc_sent', 'negotiating', 'quote_sent', 'confirmed', 'lost')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('high', 'medium', 'low')),
  assigned_to UUID REFERENCES auth.users(id),
  
  -- Tracking
  next_action TEXT,
  next_action_date DATE,
  internal_notes TEXT,
  
  -- Flags
  email_confirmed BOOLEAN DEFAULT false,
  document_sent BOOLEAN DEFAULT false,
  quote_sent BOOLEAN DEFAULT false,
  
  -- Metadata
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for leads table
CREATE INDEX idx_leads_status ON leads(status);
CREATE INDEX idx_leads_created_at ON leads(created_at DESC);
CREATE INDEX idx_leads_assigned_to ON leads(assigned_to);
CREATE INDEX idx_leads_next_action_date ON leads(next_action_date);
CREATE INDEX idx_leads_email ON leads(email);
CREATE INDEX idx_leads_reference_number ON leads(reference_number);

-- Step 2: Create activities table
CREATE TABLE public.activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  activity_type TEXT NOT NULL CHECK (activity_type IN ('call', 'email', 'whatsapp', 'meeting', 'document', 'note', 'status_change')),
  summary TEXT NOT NULL,
  details TEXT,
  
  logged_by UUID REFERENCES auth.users(id),
  
  -- Metadata
  next_action TEXT,
  follow_up_date DATE
);

-- Create indexes for activities table
CREATE INDEX idx_activities_lead_id ON activities(lead_id);
CREATE INDEX idx_activities_created_at ON activities(created_at DESC);
CREATE INDEX idx_activities_logged_by ON activities(logged_by);

-- Step 3: Create training_types config table (editable by admins)
CREATE TABLE public.training_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  display_order INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default training types
INSERT INTO public.training_types (name, display_order) VALUES
  ('Assets Management', 1),
  ('Records Management', 2),
  ('Information Governance', 3),
  ('Data Protection & Privacy', 4),
  ('Other', 5);

-- Step 4: Create countries_config table (editable by admins)
CREATE TABLE public.countries_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  code TEXT, -- ISO country code (optional)
  is_active BOOLEAN DEFAULT true,
  display_order INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert East Africa countries
INSERT INTO public.countries_config (name, code, display_order) VALUES
  ('Kenya', 'KE', 1),
  ('Uganda', 'UG', 2),
  ('Tanzania', 'TZ', 3),
  ('Rwanda', 'RW', 4),
  ('Other', 'XX', 5);

-- Step 5: Create reference number generator function
CREATE OR REPLACE FUNCTION generate_reference_number()
RETURNS TEXT AS $$
DECLARE
  month_year TEXT;
  sequence_num INT;
  ref_num TEXT;
BEGIN
  month_year := TO_CHAR(NOW(), 'MMYYYY');
  
  SELECT COUNT(*) + 1 INTO sequence_num
  FROM leads
  WHERE reference_number LIKE 'RIMEA/INQ/' || month_year || '%';
  
  ref_num := 'RIMEA/INQ/' || month_year || '/' || LPAD(sequence_num::TEXT, 3, '0');
  
  RETURN ref_num;
END;
$$ LANGUAGE plpgsql;

-- Step 6: Create trigger to auto-set reference number
CREATE OR REPLACE FUNCTION set_reference_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.reference_number IS NULL OR NEW.reference_number = '' THEN
    NEW.reference_number := generate_reference_number();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_reference_number
BEFORE INSERT ON leads
FOR EACH ROW
EXECUTE FUNCTION set_reference_number();

-- Step 7: Create trigger for updated_at on leads
CREATE TRIGGER update_leads_updated_at
BEFORE UPDATE ON leads
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Step 8: Create trigger for updated_at on training_types
CREATE TRIGGER update_training_types_updated_at
BEFORE UPDATE ON training_types
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Step 9: Enable RLS on all new tables
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.countries_config ENABLE ROW LEVEL SECURITY;

-- Step 10: RLS Policies for leads table
-- Authenticated users can view all leads
CREATE POLICY "Authenticated users can view all leads"
  ON public.leads FOR SELECT
  TO authenticated
  USING (true);

-- Authenticated users can insert leads (for team members adding leads manually)
CREATE POLICY "Authenticated users can create leads"
  ON public.leads FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Authenticated users can update leads
CREATE POLICY "Authenticated users can update leads"
  ON public.leads FOR UPDATE
  TO authenticated
  USING (true);

-- Only admins can delete leads
CREATE POLICY "Admins can delete leads"
  ON public.leads FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Step 11: RLS Policies for activities table
-- Authenticated users can view all activities
CREATE POLICY "Authenticated users can view all activities"
  ON public.activities FOR SELECT
  TO authenticated
  USING (true);

-- Authenticated users can create activities
CREATE POLICY "Authenticated users can create activities"
  ON public.activities FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Users can update their own activities
CREATE POLICY "Users can update their own activities"
  ON public.activities FOR UPDATE
  TO authenticated
  USING (logged_by = auth.uid());

-- Admins can delete activities
CREATE POLICY "Admins can delete activities"
  ON public.activities FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Step 12: RLS Policies for training_types table
-- Anyone (including unauthenticated) can view active training types
CREATE POLICY "Anyone can view active training types"
  ON public.training_types FOR SELECT
  USING (is_active = true);

-- Admins can manage training types
CREATE POLICY "Admins can manage training types"
  ON public.training_types FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Step 13: RLS Policies for countries_config table
-- Anyone (including unauthenticated) can view active countries
CREATE POLICY "Anyone can view active countries"
  ON public.countries_config FOR SELECT
  USING (is_active = true);

-- Admins can manage countries
CREATE POLICY "Admins can manage countries"
  ON public.countries_config FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));