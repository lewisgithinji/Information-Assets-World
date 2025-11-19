import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Save, Eye } from "lucide-react";
import {
  useBlogPostById,
  useCreateBlogPost,
  useUpdateBlogPost,
  useGenerateSlug,
} from "@/hooks/useBlogPosts";
import { useBlogCategories } from "@/hooks/useBlogCategories";
import RichTextEditor from "@/components/blog/RichTextEditor";
import ImageUploader from "@/components/ImageUploader";
import AdminLayout from "@/components/AdminLayout";
import { toast } from "sonner";

const blogSchema = z.object({
  title: z.string().min(1, "Title is required"),
  slug: z.string().min(1, "Slug is required"),
  excerpt: z.string().min(1, "Excerpt is required"),
  content: z.string().min(1, "Content is required"),
  featured_image_url: z.string().optional(),
  category_id: z.string().optional(),
  tags: z.string().default(""),
  status: z.enum(["draft", "published", "archived"]).default("draft"),
  published_date: z.string().optional(),
  featured: z.boolean().default(false),
  meta_title: z.string().optional(),
  meta_description: z.string().optional(),
});

type BlogFormData = z.infer<typeof blogSchema>;

export default function AdminBlogForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);

  const [content, setContent] = useState("");

  const { data: post, isLoading } = useBlogPostById(id || "");
  const { data: categories } = useBlogCategories(false);
  const createMutation = useCreateBlogPost();
  const updateMutation = useUpdateBlogPost();
  const generateSlugMutation = useGenerateSlug();

  const form = useForm<BlogFormData>({
    resolver: zodResolver(blogSchema),
    defaultValues: {
      title: "",
      slug: "",
      excerpt: "",
      content: "",
      featured_image_url: "",
      category_id: "",
      tags: "",
      status: "draft",
      published_date: "",
      featured: false,
      meta_title: "",
      meta_description: "",
    },
  });

  useEffect(() => {
    if (post) {
      const tagsString = Array.isArray(post.tags) ? post.tags.join(", ") : "";
      form.reset({
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt || "",
        content: post.content,
        featured_image_url: post.featured_image_url || "",
        category_id: post.category_id || "",
        tags: tagsString,
        status: post.status,
        published_date: post.published_date
          ? new Date(post.published_date).toISOString().split("T")[0]
          : "",
        featured: post.featured,
        meta_title: post.meta_title || "",
        meta_description: post.meta_description || "",
      });
      setContent(post.content);
    }
  }, [post, form]);

  const handleGenerateSlug = async () => {
    const title = form.getValues("title");
    if (!title) {
      toast.error("Please enter a title first");
      return;
    }

    try {
      const slug = await generateSlugMutation.mutateAsync(title);
      form.setValue("slug", slug);
      toast.success("Slug generated successfully");
    } catch (error) {
      toast.error("Failed to generate slug");
    }
  };

  const onSubmit = async (data: BlogFormData) => {
    try {
      // Parse tags
      const tagsArray = data.tags
        ? data.tags.split(",").map((tag) => tag.trim()).filter(Boolean)
        : [];

      const submitData = {
        title: data.title,
        slug: data.slug,
        excerpt: data.excerpt,
        content: content,
        featured_image_url: data.featured_image_url || null,
        category_id: data.category_id && data.category_id !== "none" ? data.category_id : null,
        tags: tagsArray,
        status: data.status,
        published_date:
          data.published_date && data.status === "published"
            ? new Date(data.published_date).toISOString()
            : data.status === "published"
            ? new Date().toISOString()
            : null,
        featured: data.featured,
        meta_title: data.meta_title || null,
        meta_description: data.meta_description || null,
      };

      if (isEditing && id) {
        await updateMutation.mutateAsync({ id, ...submitData });
      } else {
        await createMutation.mutateAsync(submitData);
      }

      navigate("/admin/blog");
    } catch (error) {
      console.error("Error saving blog post:", error);
    }
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading blog post...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate("/admin/blog")}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Blog Posts
        </Button>
        <h1 className="text-3xl font-bold">
          {isEditing ? "Edit Blog Post" : "Create New Blog Post"}
        </h1>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content Column */}
            <div className="lg:col-span-2 space-y-6">
              {/* Title */}
              <Card>
                <CardHeader>
                  <CardTitle>Post Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Title *</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter post title..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="slug"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Slug *</FormLabel>
                        <div className="flex gap-2">
                          <FormControl>
                            <Input placeholder="url-friendly-slug" {...field} />
                          </FormControl>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={handleGenerateSlug}
                            disabled={generateSlugMutation.isPending}
                          >
                            Generate
                          </Button>
                        </div>
                        <FormDescription>
                          URL-friendly version of the title
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="excerpt"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Excerpt *</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Brief summary of the post..."
                            rows={3}
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Short summary shown in listings (recommended 150-160
                          characters)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Content Editor */}
              <Card>
                <CardHeader>
                  <CardTitle>Content *</CardTitle>
                </CardHeader>
                <CardContent>
                  <FormField
                    control={form.control}
                    name="content"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <RichTextEditor
                            content={content}
                            onChange={(value) => {
                              setContent(value);
                              field.onChange(value);
                            }}
                            placeholder="Start writing your blog post..."
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* SEO Settings */}
              <Card>
                <CardHeader>
                  <CardTitle>SEO Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="meta_title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Meta Title</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="SEO title (defaults to post title)"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="meta_description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Meta Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="SEO description (defaults to excerpt)"
                            rows={2}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </div>

            {/* Sidebar Column */}
            <div className="space-y-6">
              {/* Publishing Options */}
              <Card>
                <CardHeader>
                  <CardTitle>Publish</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="draft">Draft</SelectItem>
                            <SelectItem value="published">Published</SelectItem>
                            <SelectItem value="archived">Archived</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="published_date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Publish Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormDescription>
                          Leave empty to use current date
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="featured"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between rounded-lg border p-3">
                        <div>
                          <FormLabel>Featured Post</FormLabel>
                          <FormDescription>
                            Show on homepage
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <div className="pt-4 space-y-2">
                    <Button type="submit" className="w-full">
                      <Save className="h-4 w-4 mr-2" />
                      {isEditing ? "Update Post" : "Create Post"}
                    </Button>

                    {isEditing && post && (
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full"
                        onClick={() => navigate(`/blog/${post.slug}`)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Preview
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Featured Image */}
              <Card>
                <CardHeader>
                  <CardTitle>Featured Image</CardTitle>
                </CardHeader>
                <CardContent>
                  <FormField
                    control={form.control}
                    name="featured_image_url"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <ImageUploader
                            currentImageUrl={field.value}
                            onImageUploaded={field.onChange}
                            bucket="blog-images"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Category */}
              <Card>
                <CardHeader>
                  <CardTitle>Category</CardTitle>
                </CardHeader>
                <CardContent>
                  <FormField
                    control={form.control}
                    name="category_id"
                    render={({ field }) => (
                      <FormItem>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="none">No Category</SelectItem>
                            {categories?.map((category) => (
                              <SelectItem key={category.id} value={category.id}>
                                {category.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Tags */}
              <Card>
                <CardHeader>
                  <CardTitle>Tags</CardTitle>
                </CardHeader>
                <CardContent>
                  <FormField
                    control={form.control}
                    name="tags"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Textarea
                            placeholder="security, compliance, best-practices"
                            rows={3}
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Comma-separated list of tags
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </Form>
    </AdminLayout>
  );
}
