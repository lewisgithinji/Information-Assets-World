-- Add sample event categories and types to make the system functional
INSERT INTO public.event_categories (name, description, color, icon, industry_sector) VALUES 
  ('Technology Conference', 'Technology and innovation focused events', '#3B82F6', 'Laptop', 'Technology'),
  ('Finance Summit', 'Financial services and banking events', '#10B981', 'DollarSign', 'Financial Services'),
  ('Healthcare Symposium', 'Medical and healthcare industry events', '#EF4444', 'Heart', 'Healthcare'),
  ('Marketing Workshop', 'Marketing and advertising focused events', '#F59E0B', 'Megaphone', 'Marketing'),
  ('Education Forum', 'Educational and academic conferences', '#8B5CF6', 'GraduationCap', 'Education'),
  ('Business Networking', 'Professional networking and business events', '#06B6D4', 'Users', 'Business')
ON CONFLICT DO NOTHING;

INSERT INTO public.event_types (name, description, color, icon) VALUES 
  ('Conference', 'Large-scale professional gatherings', '#3B82F6', 'Calendar'),
  ('Workshop', 'Interactive learning sessions', '#10B981', 'Wrench'),
  ('Seminar', 'Educational presentations and discussions', '#F59E0B', 'BookOpen'),
  ('Networking Event', 'Professional networking opportunities', '#8B5CF6', 'Users'),
  ('Webinar', 'Online virtual presentations', '#06B6D4', 'Monitor'),
  ('Panel Discussion', 'Expert panel discussions', '#EF4444', 'MessageSquare')
ON CONFLICT DO NOTHING;