import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Award, ArrowLeft, Save, Upload, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useQuery } from '@tanstack/react-query';
import AdminLayout from '@/components/AdminLayout';

const sponsorSchema = z.object({
  name: z.string().min(1, "Name is required"),
  logo_url: z.string().optional(),
  website_url: z.string().optional(),
  tier: z.enum(['bronze', 'silver', 'gold', 'platinum']),
  type: z.enum(['sponsor', 'partner', 'client']),
});

type SponsorFormData = z.infer<typeof sponsorSchema>;

export default function AdminSponsorForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast } = useToast();
  const isEditing = Boolean(id);
  const [uploading, setUploading] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: sponsor, isLoading } = useQuery({
    queryKey: ['sponsor', id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from('sponsors')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const form = useForm<SponsorFormData>({
    resolver: zodResolver(sponsorSchema),
    defaultValues: {
      name: '',
      logo_url: '',
      website_url: '',
      tier: 'bronze',
      type: 'sponsor',
    },
  });

  useEffect(() => {
    if (sponsor) {
      form.reset({
        name: sponsor.name,
        logo_url: sponsor.logo_url || '',
        website_url: sponsor.website_url || '',
        tier: sponsor.tier as 'bronze' | 'silver' | 'gold' | 'platinum',
        type: sponsor.type as 'sponsor' | 'partner' | 'client',
      });
      setLogoPreview(sponsor.logo_url || '');
    }
  }, [sponsor, form]);

  // Resize image to max 400x200px while maintaining aspect ratio
  const resizeImage = (file: File): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');

          // Max dimensions for logos
          const MAX_WIDTH = 400;
          const MAX_HEIGHT = 200;

          let width = img.width;
          let height = img.height;

          // Calculate new dimensions while maintaining aspect ratio
          if (width > height) {
            if (width > MAX_WIDTH) {
              height = height * (MAX_WIDTH / width);
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width = width * (MAX_HEIGHT / height);
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;

          ctx?.drawImage(img, 0, 0, width, height);

          canvas.toBlob((blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Canvas to Blob conversion failed'));
            }
          }, 'image/png', 0.9);
        };
        img.onerror = reject;
        img.src = e.target?.result as string;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file (PNG, JPG, GIF, etc.)",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 5MB before resize)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload an image smaller than 5MB",
        variant: "destructive",
      });
      return;
    }

    try {
      setUploading(true);

      // Resize the image
      const resizedBlob = await resizeImage(file);

      // Create a unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
      const filePath = `sponsor-logos/${fileName}`;

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('sponsor-logos')
        .upload(filePath, resizedBlob, {
          contentType: file.type,
          upsert: false
        });

      if (error) throw error;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('sponsor-logos')
        .getPublicUrl(filePath);

      // Update form and preview
      form.setValue('logo_url', publicUrl);
      setLogoPreview(publicUrl);

      toast({
        title: "Logo uploaded",
        description: "Logo has been uploaded and resized successfully",
      });
    } catch (error: any) {
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload logo. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveLogo = () => {
    form.setValue('logo_url', '');
    setLogoPreview('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const onSubmit = async (data: SponsorFormData) => {
    try {
      // Transform data to match database schema
      const submitData = {
        name: data.name,
        logo_url: data.logo_url || null,
        website_url: data.website_url || null,
        tier: data.tier,
        type: data.type,
      };

      if (isEditing) {
        const { error } = await supabase
          .from('sponsors')
          .update(submitData)
          .eq('id', id);

        if (error) throw error;

        toast({
          title: "Sponsor updated",
          description: "The sponsor has been successfully updated.",
        });
      } else {
        const { error } = await supabase
          .from('sponsors')
          .insert(submitData);

        if (error) throw error;

        toast({
          title: "Sponsor created",
          description: "The new sponsor has been successfully created.",
        });
      }

      navigate('/admin/sponsors');
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${isEditing ? 'update' : 'create'} sponsor. Please try again.`,
        variant: "destructive",
      });
    }
  };

  if (isEditing && isLoading) {
    return (
      <AdminLayout>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading sponsor...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="mb-8">
        <Button
          variant="outline"
          onClick={() => navigate('/admin/sponsors')}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Sponsors
        </Button>
        <div className="flex items-center gap-3">
          <Award className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              {isEditing ? 'Edit Sponsor' : 'Create New Sponsor'}
            </h1>
            <p className="text-muted-foreground">
              {isEditing ? 'Update sponsor details' : 'Add a new event sponsor'}
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Sponsor Details</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter sponsor name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="tier"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tier</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select tier" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="bronze">Bronze</SelectItem>
                          <SelectItem value="silver">Silver</SelectItem>
                          <SelectItem value="gold">Gold</SelectItem>
                          <SelectItem value="platinum">Platinum</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="sponsor">Sponsor</SelectItem>
                          <SelectItem value="partner">Partner</SelectItem>
                          <SelectItem value="client">Client</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Logo Upload Section */}
                <div className="space-y-4">
                  <FormLabel>Organization Logo</FormLabel>
                  <FormDescription>
                    Upload a logo or provide a URL. Images will be automatically resized to max 400x200px.
                  </FormDescription>

                  <Tabs defaultValue="upload" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="upload">Upload Image</TabsTrigger>
                      <TabsTrigger value="url">Enter URL</TabsTrigger>
                    </TabsList>

                    <TabsContent value="upload" className="space-y-4">
                      <div className="flex flex-col gap-4">
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleLogoUpload}
                          className="hidden"
                          id="logo-upload"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={uploading}
                          className="w-full"
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          {uploading ? 'Uploading...' : 'Choose Logo File'}
                        </Button>
                        <p className="text-xs text-muted-foreground">
                          Supported: PNG, JPG, GIF, SVG (max 5MB)
                        </p>
                      </div>
                    </TabsContent>

                    <TabsContent value="url" className="space-y-4">
                      <FormField
                        control={form.control}
                        name="logo_url"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input
                                placeholder="https://example.com/logo.png"
                                {...field}
                                onChange={(e) => {
                                  field.onChange(e);
                                  setLogoPreview(e.target.value);
                                }}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </TabsContent>
                  </Tabs>

                  {/* Logo Preview */}
                  {logoPreview && (
                    <Card className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-medium">Logo Preview</p>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={handleRemoveLogo}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="flex items-center justify-center bg-muted rounded-lg p-4 h-32">
                        <img
                          src={logoPreview}
                          alt="Logo preview"
                          className="max-h-full max-w-full object-contain"
                          onError={() => {
                            toast({
                              title: "Invalid image URL",
                              description: "The image URL is not valid or accessible",
                              variant: "destructive",
                            });
                          }}
                        />
                      </div>
                    </Card>
                  )}
                </div>

                <FormField
                  control={form.control}
                  name="website_url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Website URL</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter website URL" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex gap-4 pt-6">
                  <Button type="submit" className="shadow-primary">
                    <Save className="h-4 w-4 mr-2" />
                    {isEditing ? 'Update Sponsor' : 'Create Sponsor'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate('/admin/sponsors')}
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