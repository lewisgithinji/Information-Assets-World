-- Migration: Create Blog/News System
-- Created: 2025-11-19
-- Description: Creates blog_posts, blog_categories tables with RLS policies and storage bucket

-- =====================================================
-- 1. CREATE BLOG CATEGORIES TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS public.blog_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_blog_categories_slug ON public.blog_categories(slug);
CREATE INDEX IF NOT EXISTS idx_blog_categories_active ON public.blog_categories(is_active);

-- =====================================================
-- 2. CREATE BLOG POSTS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS public.blog_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,

  -- Content fields
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  excerpt TEXT,
  content TEXT NOT NULL,
  featured_image_url TEXT,

  -- Metadata
  author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  category_id UUID REFERENCES public.blog_categories(id) ON DELETE SET NULL,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],

  -- Publishing
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  published_date TIMESTAMP WITH TIME ZONE,
  featured BOOLEAN DEFAULT false,

  -- SEO
  meta_title TEXT,
  meta_description TEXT,

  -- Analytics
  view_count INTEGER DEFAULT 0,

  -- Audit
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_blog_posts_status ON public.blog_posts(status);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published_date ON public.blog_posts(published_date DESC);
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON public.blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_author_id ON public.blog_posts(author_id);
CREATE INDEX IF NOT EXISTS idx_blog_posts_category_id ON public.blog_posts(category_id);
CREATE INDEX IF NOT EXISTS idx_blog_posts_featured ON public.blog_posts(featured) WHERE featured = true;

-- Full-text search index
CREATE INDEX IF NOT EXISTS idx_blog_posts_search ON public.blog_posts
  USING gin(to_tsvector('english', title || ' ' || COALESCE(excerpt, '') || ' ' || content));

-- =====================================================
-- 3. CREATE TRIGGERS FOR AUTOMATIC TIMESTAMPS
-- =====================================================

-- Trigger for blog_categories updated_at
CREATE TRIGGER update_blog_categories_updated_at
  BEFORE UPDATE ON public.blog_categories
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger for blog_posts updated_at
CREATE TRIGGER update_blog_posts_updated_at
  BEFORE UPDATE ON public.blog_posts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================
-- 4. CREATE STORAGE BUCKET FOR BLOG IMAGES
-- =====================================================

-- Insert blog-images bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'blog-images',
  'blog-images',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/jpg', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- 5. ROW LEVEL SECURITY POLICIES - BLOG CATEGORIES
-- =====================================================

-- Enable RLS
ALTER TABLE public.blog_categories ENABLE ROW LEVEL SECURITY;

-- Public can view active categories
CREATE POLICY "Anyone can view active blog categories"
  ON public.blog_categories FOR SELECT
  USING (is_active = true);

-- Admins and editors can view all categories
CREATE POLICY "Admins and editors can view all blog categories"
  ON public.blog_categories FOR SELECT
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin') OR
    public.has_role(auth.uid(), 'editor')
  );

-- Admins and editors can create categories
CREATE POLICY "Admins and editors can create blog categories"
  ON public.blog_categories FOR INSERT
  TO authenticated
  WITH CHECK (
    public.has_role(auth.uid(), 'admin') OR
    public.has_role(auth.uid(), 'editor')
  );

-- Admins and editors can update categories
CREATE POLICY "Admins and editors can update blog categories"
  ON public.blog_categories FOR UPDATE
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin') OR
    public.has_role(auth.uid(), 'editor')
  );

-- Only admins can delete categories
CREATE POLICY "Admins can delete blog categories"
  ON public.blog_categories FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- =====================================================
-- 6. ROW LEVEL SECURITY POLICIES - BLOG POSTS
-- =====================================================

-- Enable RLS
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

-- Public can view published posts
CREATE POLICY "Anyone can view published blog posts"
  ON public.blog_posts FOR SELECT
  USING (status = 'published' AND published_date <= now());

-- Admins and editors can view all posts (including drafts)
CREATE POLICY "Admins and editors can view all blog posts"
  ON public.blog_posts FOR SELECT
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin') OR
    public.has_role(auth.uid(), 'editor')
  );

-- Admins and editors can create posts
CREATE POLICY "Admins and editors can create blog posts"
  ON public.blog_posts FOR INSERT
  TO authenticated
  WITH CHECK (
    public.has_role(auth.uid(), 'admin') OR
    public.has_role(auth.uid(), 'editor')
  );

-- Admins and editors can update posts
CREATE POLICY "Admins and editors can update blog posts"
  ON public.blog_posts FOR UPDATE
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin') OR
    public.has_role(auth.uid(), 'editor')
  );

-- Only admins can delete posts
CREATE POLICY "Admins can delete blog posts"
  ON public.blog_posts FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- =====================================================
-- 7. STORAGE POLICIES - BLOG IMAGES
-- =====================================================

-- Public read access
CREATE POLICY "Blog images are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'blog-images');

-- Admins and editors can upload
CREATE POLICY "Admins and editors can upload blog images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'blog-images' AND
    (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'editor'))
  );

-- Admins and editors can update
CREATE POLICY "Admins and editors can update blog images"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'blog-images' AND
    (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'editor'))
  );

-- Admins and editors can delete
CREATE POLICY "Admins and editors can delete blog images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'blog-images' AND
    (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'editor'))
  );

-- =====================================================
-- 8. SEED INITIAL BLOG CATEGORIES
-- =====================================================

INSERT INTO public.blog_categories (name, slug, description, display_order) VALUES
  ('Company News', 'company-news', 'Updates and announcements from Information Assets World', 1),
  ('Industry Insights', 'industry-insights', 'Trends and analysis in information security and compliance', 2),
  ('Event Updates', 'event-updates', 'News and highlights from our training events', 3),
  ('Best Practices', 'best-practices', 'Tips and guides for information security professionals', 4),
  ('Case Studies', 'case-studies', 'Real-world success stories and implementations', 5)
ON CONFLICT (slug) DO NOTHING;

-- =====================================================
-- 9. HELPER FUNCTIONS
-- =====================================================

-- Function to generate URL-friendly slug from title
CREATE OR REPLACE FUNCTION public.generate_blog_slug(title TEXT)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  slug TEXT;
  counter INTEGER := 0;
  final_slug TEXT;
BEGIN
  -- Convert to lowercase, replace spaces with hyphens, remove special chars
  slug := lower(trim(title));
  slug := regexp_replace(slug, '[^a-z0-9\s-]', '', 'g');
  slug := regexp_replace(slug, '\s+', '-', 'g');
  slug := regexp_replace(slug, '-+', '-', 'g');
  slug := trim(both '-' from slug);

  -- Ensure uniqueness
  final_slug := slug;
  WHILE EXISTS (SELECT 1 FROM public.blog_posts WHERE blog_posts.slug = final_slug) LOOP
    counter := counter + 1;
    final_slug := slug || '-' || counter;
  END LOOP;

  RETURN final_slug;
END;
$$;

-- Function to increment view count
CREATE OR REPLACE FUNCTION public.increment_blog_view_count(post_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.blog_posts
  SET view_count = view_count + 1
  WHERE id = post_id;
END;
$$;

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================

-- Add comments for documentation
COMMENT ON TABLE public.blog_posts IS 'Blog posts and news articles';
COMMENT ON TABLE public.blog_categories IS 'Blog post categories';
COMMENT ON FUNCTION public.generate_blog_slug IS 'Generates unique URL-friendly slug from title';
COMMENT ON FUNCTION public.increment_blog_view_count IS 'Increments view count for a blog post';
