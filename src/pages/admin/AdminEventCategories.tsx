import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Plus, Edit, Trash2, Search, Tag } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import AdminLayout from '@/components/AdminLayout';
import { useEventCategories, useEventTypes } from '@/hooks/useEventCategories';

export default function AdminEventCategories() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  
  const { data: categories, isLoading: categoriesLoading, refetch: refetchCategories } = useEventCategories();
  const { data: types, isLoading: typesLoading, refetch: refetchTypes } = useEventTypes();

  const filteredCategories = categories?.filter(category => 
    category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    category.description?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const filteredTypes = types?.filter(type => 
    type.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    type.description?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const handleDeleteCategory = async (id: string, name: string) => {
    try {
      const { error } = await supabase
        .from('event_categories')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Category deleted",
        description: `"${name}" has been successfully deleted.`,
      });
      
      refetchCategories();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete category. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteType = async (id: string, name: string) => {
    try {
      const { error } = await supabase
        .from('event_types')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Type deleted",
        description: `"${name}" has been successfully deleted.`,
      });
      
      refetchTypes();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete type. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (categoriesLoading || typesLoading) {
    return (
      <AdminLayout>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Event Categories & Types</h1>
            <p className="text-muted-foreground">Manage event categorization system</p>
          </div>
        </div>

        {/* Search */}
        <Card>
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search categories and types..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Event Types */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Tag className="h-5 w-5" />
              Event Types
            </CardTitle>
            <Button onClick={() => navigate('/admin/event-types/new')}>
              <Plus className="h-4 w-4 mr-2" />
              Add Type
            </Button>
          </CardHeader>
          <CardContent>
            {filteredTypes.length === 0 ? (
              <div className="text-center py-8">
                <Tag className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No event types found</h3>
                <p className="text-muted-foreground mb-4">
                  {searchQuery ? 'Try adjusting your search terms.' : 'Get started by adding your first event type.'}
                </p>
                <Button onClick={() => navigate('/admin/event-types/new')}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Event Type
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredTypes.map((type) => (
                  <Card key={type.id} className="group hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <h4 className="font-semibold text-foreground">{type.name}</h4>
                          {type.description && (
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {type.description}
                            </p>
                          )}
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => navigate(`/admin/event-types/${type.id}/edit`)}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button size="sm" variant="outline" className="text-destructive hover:text-destructive">
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Event Type</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete "{type.name}"? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteType(type.id, type.name)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                      {type.color && (
                        <Badge 
                          className="mt-2"
                          style={{ 
                            backgroundColor: type.color, 
                            color: '#fff',
                            border: 'none'
                          }}
                        >
                          {type.name}
                        </Badge>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Event Categories */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Tag className="h-5 w-5" />
              Event Categories
            </CardTitle>
            <Button onClick={() => navigate('/admin/event-categories/new')}>
              <Plus className="h-4 w-4 mr-2" />
              Add Category
            </Button>
          </CardHeader>
          <CardContent>
            {filteredCategories.length === 0 ? (
              <div className="text-center py-8">
                <Tag className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No categories found</h3>
                <p className="text-muted-foreground mb-4">
                  {searchQuery ? 'Try adjusting your search terms.' : 'Get started by adding your first category.'}
                </p>
                <Button onClick={() => navigate('/admin/event-categories/new')}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Category
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredCategories.map((category) => (
                  <Card key={category.id} className="group hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <h4 className="font-semibold text-foreground">{category.name}</h4>
                          {category.description && (
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {category.description}
                            </p>
                          )}
                          {category.industry_sector && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Industry: {category.industry_sector}
                            </p>
                          )}
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => navigate(`/admin/event-categories/${category.id}/edit`)}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button size="sm" variant="outline" className="text-destructive hover:text-destructive">
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Category</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete "{category.name}"? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteCategory(category.id, category.name)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                      {category.color && (
                        <Badge 
                          className="mt-2"
                          style={{ 
                            backgroundColor: category.color, 
                            color: '#fff',
                            border: 'none'
                          }}
                        >
                          {category.name}
                        </Badge>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}