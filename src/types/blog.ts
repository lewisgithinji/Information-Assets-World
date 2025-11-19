// Blog Type Definitions

export type BlogStatus = 'draft' | 'published' | 'archived';

export interface BlogCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  featured_image_url: string | null;
  author_id: string | null;
  category_id: string | null;
  tags: string[];
  status: BlogStatus;
  published_date: string | null;
  featured: boolean;
  meta_title: string | null;
  meta_description: string | null;
  view_count: number;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface BlogPostWithCategory extends BlogPost {
  category: BlogCategory | null;
}

export interface BlogPostWithAuthor extends BlogPost {
  author: {
    id: string;
    full_name: string | null;
    email: string;
  } | null;
}

export interface BlogPostFull extends BlogPost {
  category: BlogCategory | null;
  author: {
    id: string;
    full_name: string | null;
    email: string;
  } | null;
}

// Form data types
export interface BlogPostFormData {
  title: string;
  excerpt: string;
  content: string;
  featured_image_url?: string;
  category_id?: string;
  tags: string[];
  status: BlogStatus;
  published_date?: string;
  featured: boolean;
  meta_title?: string;
  meta_description?: string;
}

export interface BlogCategoryFormData {
  name: string;
  slug: string;
  description?: string;
  display_order: number;
  is_active: boolean;
}

// Filter types
export interface BlogFilters {
  search?: string;
  category?: string;
  status?: BlogStatus;
  featured?: boolean;
  tag?: string;
}

// Pagination
export interface BlogPostsResponse {
  posts: BlogPostFull[];
  total: number;
  page: number;
  pageSize: number;
}
