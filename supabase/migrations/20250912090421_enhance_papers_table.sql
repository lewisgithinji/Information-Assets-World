-- Add sample events to demonstrate the system functionality
INSERT INTO public.events (title, description, location, theme, start_date, end_date, event_type, category, industry_sector, status, tags) VALUES 
  (
    'Global Tech Innovation Summit 2024', 
    'Join industry leaders and innovators from around the world for the premier technology conference of the year. Explore cutting-edge trends, network with peers, and discover the future of technology.',
    'San Francisco Convention Center, CA',
    'Innovation Through Technology',
    '2024-04-15',
    '2024-04-17',
    'conference',
    'technology conference',
    'Technology',
    'published',
    ARRAY['AI', 'Machine Learning', 'Blockchain', 'Innovation', 'Startup']
  ),
  (
    'Financial Services Digital Transformation Workshop',
    'A comprehensive workshop focusing on digital transformation strategies for financial institutions. Learn from experts and hands-on case studies.',
    'New York Financial District, NY',
    'Transforming Finance for the Digital Age',
    '2024-05-20',
    '2024-05-22',
    'workshop',
    'finance summit',
    'Financial Services',
    'published',
    ARRAY['FinTech', 'Digital Banking', 'Compliance', 'Innovation']
  ),
  (
    'Healthcare Innovation Symposium',
    'Bringing together healthcare professionals, researchers, and technology innovators to discuss the future of medical care.',
    'Boston Medical Center, MA',
    'The Future of Healthcare',
    '2024-06-10',
    '2024-06-12',
    'conference',
    'healthcare symposium',
    'Healthcare',
    'published',
    ARRAY['MedTech', 'AI in Healthcare', 'Patient Care', 'Research']
  ),
  (
    'Marketing Excellence Networking Event',
    'Connect with marketing professionals and learn about the latest trends in digital marketing, brand strategy, and customer engagement.',
    'Chicago Marketing Hub, IL',
    'Excellence in Modern Marketing',
    '2024-07-08',
    '2024-07-09',
    'networking event',
    'marketing workshop',
    'Marketing',
    'published',
    ARRAY['Digital Marketing', 'Branding', 'Social Media', 'Analytics']
  ),
  (
    'Education Technology Forum 2024',
    'Exploring how technology is reshaping education at all levels. Join educators, administrators, and EdTech innovators.',
    'Austin Convention Center, TX',
    'Technology Transforming Education',
    '2024-08-25',
    '2024-08-27',
    'conference',
    'education forum',
    'Education',
    'draft',
    ARRAY['EdTech', 'Online Learning', 'AI in Education', 'Student Engagement']
  )
ON CONFLICT DO NOTHING;