import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Calendar, ArrowLeft, Save, Tag, Building, Map, Star, AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useEvent } from '@/hooks/useEvents';
import { useEventCategories, useEventTypes } from '@/hooks/useEventCategories';
import { TagInput } from '@/components/TagInput';
import AdminLayout from '@/components/AdminLayout';

const eventSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().default(""),
  location: z.string().min(1, "Location is required"),
  start_date: z.string().min(1, "Start date is required"),
  end_date: z.string().min(1, "End date is required"),
  theme: z.string().default(""),
  event_type: z.string().default('conference'),
  category: z.string().optional().transform(val => val === 'none' ? undefined : val),
  industry_sector: z.string().optional(),
  tags: z.array(z.string()).default([]),
  status: z.enum(['draft', 'published', 'archived']).default('draft'),
  featured: z.boolean().default(false),
  image_url: z.string().default(""),
});

// Utility function to parse Supabase errors
const parseSupabaseError = (error: any): string => {
  if (error?.code === '23505') {
    return 'An event with this title already exists. Please choose a different title.';
  }
  if (error?.code === '23503') {
    return 'Invalid category or event type selected. Please refresh and try again.';
  }
  if (error?.code === '42P01') {
    return 'Database table not found. Please contact support.';
  }
  if (error?.message?.includes('permission')) {
    return 'You do not have permission to perform this action.';
  }
  if (error?.message?.includes('network')) {
    return 'Network error. Please check your connection and try again.';
  }
  return error?.message || 'An unexpected error occurred. Please try again.';
};

type EventFormData = z.infer<typeof eventSchema>;

export default function AdminEventForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast } = useToast();
  const isEditing = Boolean(id);
  
  // Error state management
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { data: event, isLoading } = useEvent(id || '');
  const { data: eventCategories } = useEventCategories();
  const { data: eventTypes } = useEventTypes();

  const form = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      title: '',
      description: '',
      location: '',
      start_date: '',
      end_date: '',
      theme: '',
      event_type: 'conference',
      category: '',
      industry_sector: '',
      tags: [],
      status: 'draft',
      featured: false,
      image_url: '',
    },
  });

  useEffect(() => {
    if (event) {
      form.reset({
        title: event.title,
        description: event.description || '',
        location: event.location,
        start_date: event.start_date,
        end_date: event.end_date,
        theme: event.theme || '',
        event_type: event.event_type || 'conference',
        category: event.category || 'none',
        industry_sector: event.industry_sector || '',
        tags: event.tags || [],
        status: event.status as 'draft' | 'published' | 'archived',
        featured: event.featured || false,
        image_url: event.image_url || '',
      });
    }
  }, [event, form]);

  const onSubmit = async (data: EventFormData) => {
    setFormError(null);
    setIsSubmitting(true);
    
    try {
      // Validate date logic
      if (new Date(data.start_date) > new Date(data.end_date)) {
        throw new Error('Start date must be before end date');
      }
      
      // Transform data to match database schema
      const submitData = {
        title: data.title,
        description: data.description || null,
        location: data.location,
        start_date: data.start_date,
        end_date: data.end_date,
        theme: data.theme || null,
        event_type: data.event_type,
        category: data.category || null,
        industry_sector: data.industry_sector || null,
        tags: data.tags.length > 0 ? data.tags : null,
        status: data.status,
        featured: data.featured,
        image_url: data.image_url || null,
      };

      console.log('Submitting event data:', submitData);

      if (isEditing) {
        const { error } = await supabase
          .from('events')
          .update(submitData)
          .eq('id', id);

        if (error) {
          console.error('Update error:', error);
          throw error;
        }

        toast({
          title: "Event updated successfully",
          description: `"${data.title}" has been updated and is now ${data.status}.`,
        });
      } else {
        const { error } = await supabase
          .from('events')
          .insert(submitData);

        if (error) {
          console.error('Insert error:', error);
          throw error;
        }

        toast({
          title: "Event created successfully",
          description: `"${data.title}" has been created with ${data.status} status.`,
        });
      }

      navigate('/admin/events');
    } catch (error) {
      console.error('Form submission error:', error);
      const errorMessage = parseSupabaseError(error);
      setFormError(errorMessage);
      
      toast({
        title: `Failed to ${isEditing ? 'update' : 'create'} event`,
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isEditing && isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading event...</p>
        </div>
      </div>
    );
  }

  return (
    <AdminLayout>
      <div className="mb-8">
        <Button
          variant="outline"
          onClick={() => navigate('/admin/events')}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Events
        </Button>
        <div className="flex items-center gap-3">
          <Calendar className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              {isEditing ? 'Edit Event' : 'Create New Event'}
            </h1>
            <p className="text-muted-foreground">
              {isEditing ? 'Update event details' : 'Add a new conference event'}
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl">
        <Card className="shadow-lg border-card-border">
          <CardHeader className="bg-gradient-primary text-white rounded-t-lg">
            <CardTitle className="flex items-center gap-3 text-xl">
              <Calendar className="h-6 w-6" />
              Event Configuration
            </CardTitle>
            <p className="text-white/90 text-sm">
              Configure event details, categorization, and settings
            </p>
          </CardHeader>
          <CardContent className="p-8">
            {formError && (
              <Alert variant="destructive" className="mb-6">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>
                  {formError}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="ml-4 h-auto p-0 text-destructive hover:text-destructive/80"
                    onClick={() => setFormError(null)}
                  >
                    Dismiss
                  </Button>
                </AlertDescription>
              </Alert>
            )}
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                
                {/* Event Type and Category Section */}
                <div className="bg-secondary/30 p-6 rounded-lg space-y-6">
                  <div className="flex items-center gap-2 text-foreground">
                    <Tag className="h-5 w-5 text-primary" />
                    <h3 className="text-lg font-semibold">Event Classification</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="event_type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Event Type</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select event type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {eventTypes?.map((type) => (
                                <SelectItem key={type.id} value={type.name}>
                                  {type.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Category</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select category" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="none">No Category</SelectItem>
                              {eventCategories?.map((category) => (
                                <SelectItem key={category.id} value={category.name}>
                                  {category.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="industry_sector"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Industry Sector</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Financial Services, Technology" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="tags"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tags</FormLabel>
                        <FormControl>
                          <TagInput
                            value={field.value}
                            onChange={field.onChange}
                            placeholder="Add relevant tags..."
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Basic Event Information */}
                <div className="bg-secondary/30 p-6 rounded-lg space-y-6">
                  <div className="flex items-center gap-2 text-foreground">
                    <Building className="h-5 w-5 text-primary" />
                    <h3 className="text-lg font-semibold">Event Information</h3>
                  </div>
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Event Title</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter event title" className="text-lg" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Enter event description"
                            rows={4}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Location and Dates */}
                <div className="bg-secondary/30 p-6 rounded-lg space-y-6">
                  <div className="flex items-center gap-2 text-foreground">
                    <Map className="h-5 w-5 text-primary" />
                    <h3 className="text-lg font-semibold">Location & Timing</h3>
                  </div>

                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Location</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter event location" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="start_date"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Start Date</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="end_date"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>End Date</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="theme"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Theme</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter event theme" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="image_url"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Image URL</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter image URL" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Status and Settings */}
                <div className="bg-secondary/30 p-6 rounded-lg space-y-6">
                  <div className="flex items-center gap-2 text-foreground">
                    <Star className="h-5 w-5 text-primary" />
                    <h3 className="text-lg font-semibold">Publication & Visibility</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Publication Status</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                      name="featured"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">
                              Featured Event
                            </FormLabel>
                            <div className="text-sm text-muted-foreground">
                              Display this event in the Featured Events section on the homepage
                            </div>
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
                  </div>
                </div>


                <div className="flex gap-4 pt-8 border-t border-border">
                  <Button 
                    type="submit" 
                    size="lg" 
                    className="shadow-primary px-8"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        {isEditing ? 'Updating...' : 'Creating...'}
                      </div>
                    ) : (
                      <>
                        <Save className="h-5 w-5 mr-2" />
                        {isEditing ? 'Update Event' : 'Create Event'}
                      </>
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="lg"
                    onClick={() => navigate('/admin/events')}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}