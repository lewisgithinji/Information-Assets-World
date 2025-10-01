import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import AdminLayout from '@/components/AdminLayout';
import BackButton from '@/components/BackButton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';

const typeSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  description: z.string().optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid color format'),
  icon: z.string().optional(),
});

type TypeFormData = z.infer<typeof typeSchema>;

export default function AdminEventTypeForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<TypeFormData>({
    resolver: zodResolver(typeSchema),
    defaultValues: {
      color: '#0B5FFF',
    },
  });

  useEffect(() => {
    if (id) {
      fetchType();
    }
  }, [id]);

  const fetchType = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('event_types')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      if (data) {
        reset({
          name: data.name,
          description: data.description || '',
          color: data.color || '#0B5FFF',
          icon: data.icon || '',
        });
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: TypeFormData) => {
    setIsSubmitting(true);
    try {
      const payload = {
        name: data.name,
        description: data.description || null,
        color: data.color,
        icon: data.icon || null,
      };

      if (id) {
        const { error } = await supabase
          .from('event_types')
          .update(payload)
          .eq('id', id);

        if (error) throw error;

        toast({
          title: 'Success',
          description: 'Event type updated successfully',
        });
      } else {
        const { error } = await supabase
          .from('event_types')
          .insert([payload]);

        if (error) throw error;

        toast({
          title: 'Success',
          description: 'Event type created successfully',
        });
      }

      navigate('/admin/event-categories');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-3xl mx-auto">
        <BackButton to="/admin/event-categories" label="Back to Categories" />
        
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>{id ? 'Edit Event Type' : 'Create Event Type'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  {...register('name')}
                  placeholder="Conference, Webinar, Workshop"
                />
                {errors.name && (
                  <p className="text-sm text-destructive">{errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  {...register('description')}
                  placeholder="Brief description of this event type"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="color">Color *</Label>
                <div className="flex gap-2 items-center">
                  <Input
                    id="color"
                    type="color"
                    {...register('color')}
                    className="w-20 h-10"
                  />
                  <Input
                    {...register('color')}
                    placeholder="#0B5FFF"
                    className="flex-1"
                  />
                </div>
                {errors.color && (
                  <p className="text-sm text-destructive">{errors.color.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="icon">Icon (Lucide icon name)</Label>
                <Input
                  id="icon"
                  {...register('icon')}
                  placeholder="Calendar, Video, Users"
                />
                <p className="text-sm text-muted-foreground">
                  Enter a Lucide icon name (e.g., Calendar, Video, Users)
                </p>
              </div>

              <div className="flex gap-4">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1"
                >
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {id ? 'Update Event Type' : 'Create Event Type'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/admin/event-categories')}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
