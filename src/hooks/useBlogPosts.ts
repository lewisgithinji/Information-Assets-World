import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { BlogPost, BlogPostFull, BlogFilters } from "@/types/blog";
import { toast } from "sonner";

// Fetch all blog posts with filters
export const useBlogPosts = (filters?: BlogFilters) => {
  return useQuery({
    queryKey: ["blog-posts", filters],
    queryFn: async () => {
      let query = supabase
        .from("blog_posts")
        .select(`
          *,
          category:blog_categories(id, name, slug)
        `)
        .order("published_date", { ascending: false, nullsFirst: false });

      // Apply filters
      if (filters?.status) {
        query = query.eq("status", filters.status);
      } else {
        // Default to published for public view
        query = query.eq("status", "published");
      }

      if (filters?.category) {
        query = query.eq("category_id", filters.category);
      }

      if (filters?.featured !== undefined) {
        query = query.eq("featured", filters.featured);
      }

      if (filters?.tag) {
        query = query.contains("tags", [filters.tag]);
      }

      if (filters?.search) {
        query = query.or(
          `title.ilike.%${filters.search}%,excerpt.ilike.%${filters.search}%,content.ilike.%${filters.search}%`
        );
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as BlogPostFull[];
    },
  });
};

// Fetch single blog post by slug
export const useBlogPost = (slug: string) => {
  return useQuery({
    queryKey: ["blog-post", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("blog_posts")
        .select(`
          *,
          category:blog_categories(id, name, slug)
        `)
        .eq("slug", slug)
        .single();

      if (error) throw error;

      // Increment view count
      if (data) {
        supabase.rpc("increment_blog_view_count", { post_id: data.id }).then();
      }

      return data as BlogPostFull;
    },
    enabled: !!slug,
  });
};

// Fetch single blog post by ID (for admin)
export const useBlogPostById = (id: string) => {
  return useQuery({
    queryKey: ["blog-post-by-id", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("blog_posts")
        .select(`
          *,
          category:blog_categories(id, name, slug)
        `)
        .eq("id", id)
        .single();

      if (error) throw error;
      return data as BlogPostFull;
    },
    enabled: !!id,
  });
};

// Fetch featured blog posts
export const useFeaturedBlogPosts = (limit: number = 3) => {
  return useQuery({
    queryKey: ["featured-blog-posts", limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("blog_posts")
        .select(`
          *,
          category:blog_categories(id, name, slug)
        `)
        .eq("status", "published")
        .eq("featured", true)
        .order("published_date", { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data as BlogPostFull[];
    },
  });
};

// Fetch related blog posts (same category, exclude current)
export const useRelatedBlogPosts = (categoryId: string | null, currentPostId: string, limit: number = 3) => {
  return useQuery({
    queryKey: ["related-blog-posts", categoryId, currentPostId, limit],
    queryFn: async () => {
      if (!categoryId) return [];

      const { data, error } = await supabase
        .from("blog_posts")
        .select(`
          *,
          category:blog_categories(id, name, slug)
        `)
        .eq("status", "published")
        .eq("category_id", categoryId)
        .neq("id", currentPostId)
        .order("published_date", { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data as BlogPostFull[];
    },
    enabled: !!categoryId,
  });
};

// Create blog post mutation
export const useCreateBlogPost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (postData: Partial<BlogPost>) => {
      const { data: { user } } = await supabase.auth.getUser();

      const { data, error } = await supabase
        .from("blog_posts")
        .insert([{
          ...postData,
          author_id: user?.id,
          created_by: user?.id,
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blog-posts"] });
      toast.success("Blog post created successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to create blog post: ${error.message}`);
    },
  });
};

// Update blog post mutation
export const useUpdateBlogPost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...postData }: Partial<BlogPost> & { id: string }) => {
      const { data, error } = await supabase
        .from("blog_posts")
        .update(postData)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["blog-posts"] });
      queryClient.invalidateQueries({ queryKey: ["blog-post", data.slug] });
      queryClient.invalidateQueries({ queryKey: ["blog-post-by-id", data.id] });
      toast.success("Blog post updated successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to update blog post: ${error.message}`);
    },
  });
};

// Delete blog post mutation
export const useDeleteBlogPost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("blog_posts")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blog-posts"] });
      toast.success("Blog post deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete blog post: ${error.message}`);
    },
  });
};

// Generate slug from title
export const useGenerateSlug = () => {
  return useMutation({
    mutationFn: async (title: string) => {
      const { data, error } = await supabase
        .rpc("generate_blog_slug", { title });

      if (error) throw error;
      return data as string;
    },
  });
};
