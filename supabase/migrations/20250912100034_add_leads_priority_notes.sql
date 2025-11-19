-- Add sample speakers and sponsors to complete the system
INSERT INTO public.speakers (name, title, organization, bio, image_url) VALUES 
  (
    'Dr. Sarah Chen',
    'Chief Technology Officer',
    'TechInnovate Inc.',
    'Dr. Sarah Chen is a renowned expert in artificial intelligence and machine learning with over 15 years of experience in the tech industry. She has led multiple AI initiatives and published extensively on emerging technologies.',
    'https://images.unsplash.com/photo-1494790108755-2616b612b77c?w=300&h=300&fit=crop'
  ),
  (
    'Marcus Rodriguez',
    'Head of Digital Transformation',
    'Global Finance Corp',
    'Marcus Rodriguez specializes in fintech innovation and digital banking solutions. He has successfully led digital transformation initiatives at several major financial institutions.',
    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=300&fit=crop'
  ),
  (
    'Dr. Emily Watson',
    'Director of Medical Innovation',
    'HealthTech Solutions',
    'Dr. Emily Watson is a pioneer in healthcare technology integration. She focuses on AI-driven patient care solutions and has contributed to numerous breakthrough medical technologies.',
    'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=300&h=300&fit=crop'
  ),
  (
    'David Park',
    'VP of Marketing Strategy',
    'BrandForward Agency',
    'David Park is a marketing strategist with expertise in digital marketing, brand development, and customer engagement. He has helped dozens of companies achieve their marketing goals.',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop'
  ),
  (
    'Prof. Lisa Thompson',
    'Dean of Educational Technology',
    'Innovation University',
    'Professor Lisa Thompson is an educational technology expert who has pioneered online learning platforms and AI-assisted education systems. She regularly speaks at international education conferences.',
    'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=300&h=300&fit=crop'
  )
ON CONFLICT DO NOTHING;

INSERT INTO public.sponsors (name, tier, logo_url, website_url) VALUES 
  ('TechCorp International', 'platinum', 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=200&h=100&fit=crop', 'https://techcorp.example.com'),
  ('Innovation Partners', 'gold', 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=200&h=100&fit=crop', 'https://innovationpartners.example.com'),
  ('Digital Solutions Ltd', 'gold', 'https://images.unsplash.com/photo-1549924231-f129b911e442?w=200&h=100&fit=crop', 'https://digitalsolutions.example.com'),
  ('StartupHub Ventures', 'silver', 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=200&h=100&fit=crop', 'https://startuphub.example.com'),
  ('CloudTech Systems', 'silver', 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=200&h=100&fit=crop', 'https://cloudtech.example.com'),
  ('DataViz Analytics', 'bronze', 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=200&h=100&fit=crop', 'https://dataviz.example.com'),
  ('NextGen Media', 'bronze', 'https://images.unsplash.com/photo-1572021335469-31706a17aaef?w=200&h=100&fit=crop', 'https://nextgenmedia.example.com')
ON CONFLICT DO NOTHING;