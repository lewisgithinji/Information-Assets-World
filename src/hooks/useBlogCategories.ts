import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { BlogCategory } from "@/types/blog";
import { toast } from "sonner";

// Fetch all blog categories
export const useBlogCategories = (activeOnly: boolean = true) => {
  return useQuery({
    queryKey: ["blog-categories", activeOnly],
    queryFn: async () => {
      let query = supabase
        .from("blog_categories")
        .select("*")
        .order("display_order", { ascending: true });

      if (activeOnly) {
        query = query.eq("is_active", true);
      }

      const { data, error} = await query;

      if (error) throw error;
      return data as BlogCategory[];
    },
  });
};

// Fetch single category by slug
export const useBlogCategory = (slug: string) => {
  return useQuery({
    queryKey: ["blog-category", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("blog_categories")
        .select("*")
        .eq("slug", slug)
        .single();

      if (error) throw error;
      return data as BlogCategory;
    },
    enabled: !!slug,
  });
};

// Create category mutation
export const useCreateBlogCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (categoryData: Partial<BlogCategory>) => {
      const { data, error } = await supabase
        .from("blog_categories")
        .insert([categoryData])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blog-categories"] });
      toast.success("Category created successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to create category: ${error.message}`);
    },
  });
};

// Update category mutation
export const useUpdateBlogCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...categoryData }: Partial<BlogCategory> & { id: string }) => {
      const { data, error } = await supabase
        .from("blog_categories")
        .update(categoryData)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blog-categories"] });
      toast.success("Category updated successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to update category: ${error.message}`);
    },
  });
};

// Delete category mutation
export const useDeleteBlogCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("blog_categories")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blog-categories"] });
      toast.success("Category deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete category: ${error.message}`);
    },
  });
};
