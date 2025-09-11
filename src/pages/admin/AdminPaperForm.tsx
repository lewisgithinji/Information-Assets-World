import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, ArrowLeft, Save, Plus, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useQuery } from '@tanstack/react-query';

const paperSchema = z.object({
  title: z.string().min(1, "Title is required"),
  abstract: z.string().default(""),
  authors: z.array(z.string().min(1, "Author name is required")).min(1, "At least one author is required"),
  category: z.string().default(""),
  tags: z.array(z.string()).default([]),
  pdf_url: z.string().default(""),
  status: z.enum(['draft', 'under_review', 'published']).default('draft'),
  published_date: z.string().default(""),
});

type PaperFormData = z.infer<typeof paperSchema>;

export default function AdminPaperForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast } = useToast();
  const isEditing = Boolean(id);

  const { data: paper, isLoading } = useQuery({
    queryKey: ['paper', id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from('papers')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const form = useForm<PaperFormData>({
    resolver: zodResolver(paperSchema),
    defaultValues: {
      title: '',
      abstract: '',
      authors: [''],
      category: '',
        tags: [],
      pdf_url: '',
      status: 'draft',
      published_date: '',
    },
  });

  const { fields: authorFields, append: addAuthor, remove: removeAuthor } = useFieldArray({
    control: form.control,
    name: "authors",
  });

  useEffect(() => {
    if (paper) {
      form.reset({
        title: paper.title,
        abstract: paper.abstract || '',
        authors: paper.authors || [''],
        category: paper.category || '',
        tags: paper.tags || [],
        pdf_url: paper.pdf_url || '',
        status: paper.status as 'draft' | 'under_review' | 'published',
        published_date: paper.published_date || '',
      });
    }
  }, [paper, form]);

  const onSubmit = async (data: PaperFormData) => {
    try {
      const submitData = {
        ...data,
        authors: data.authors.filter(author => author.trim() !== ''),
        tags: data.tags?.filter(tag => tag.trim() !== '') || [],
      };

      if (isEditing) {
        const { error } = await supabase
          .from('papers')
          .update(submitData)
          .eq('id', id);

        if (error) throw error;

        toast({
          title: "Paper updated",
          description: "The paper has been successfully updated.",
        });
      } else {
        const { error } = await supabase
          .from('papers')
          .insert(submitData);

        if (error) throw error;

        toast({
          title: "Paper created",
          description: "The new paper has been successfully created.",
        });
      }

      navigate('/admin/papers');
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${isEditing ? 'update' : 'create'} paper. Please try again.`,
        variant: "destructive",
      });
    }
  };

  if (isEditing && isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading paper...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <Button
          variant="outline"
          onClick={() => navigate('/admin/papers')}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Papers
        </Button>
        <div className="flex items-center gap-3">
          <FileText className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              {isEditing ? 'Edit Paper' : 'Create New Paper'}
            </h1>
            <p className="text-muted-foreground">
              {isEditing ? 'Update paper details' : 'Add a new research paper'}
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Paper Details</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Paper Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter paper title" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="abstract"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Abstract</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Enter paper abstract"
                          rows={6}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div>
                  <FormLabel>Authors</FormLabel>
                  <div className="space-y-2 mt-2">
                    {authorFields.map((field, index) => (
                      <div key={field.id} className="flex gap-2">
                        <FormField
                          control={form.control}
                          name={`authors.${index}`}
                          render={({ field }) => (
                            <FormItem className="flex-1">
                              <FormControl>
                                <Input placeholder="Enter author name" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        {authorFields.length > 1 && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeAuthor(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => addAuthor('')}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Author
                    </Button>
                  </div>
                </div>

                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter paper category" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="pdf_url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>PDF URL</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter PDF URL" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="draft">Draft</SelectItem>
                            <SelectItem value="under_review">Under Review</SelectItem>
                            <SelectItem value="published">Published</SelectItem>
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
                        <FormLabel>Published Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex gap-4 pt-6">
                  <Button type="submit" className="shadow-primary">
                    <Save className="h-4 w-4 mr-2" />
                    {isEditing ? 'Update Paper' : 'Create Paper'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate('/admin/papers')}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}