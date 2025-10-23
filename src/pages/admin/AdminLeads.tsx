import { useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { useLeads, LeadFilters as LeadFiltersType } from '@/hooks/useLeads';
import { useLeadStats } from '@/hooks/useLeadStats';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Download } from 'lucide-react';
import { LeadFilters } from '@/components/leads/LeadFilters';
import { LeadSearch } from '@/components/leads/LeadSearch';
import { LeadTableView } from '@/components/leads/LeadTableView';

export default function AdminLeads() {
  const [filters, setFilters] = useState<LeadFiltersType>({});
  const { data: leads, isLoading } = useLeads(filters);
  const { data: stats } = useLeadStats();

  const handleSearchChange = (search: string) => {
    setFilters({ ...filters, search: search || undefined });
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Lead Management</h1>
            <p className="text-muted-foreground">Manage training inquiries and follow-ups</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">New Leads</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalNew || 0}</div>
              <p className="text-xs text-muted-foreground">This week: {stats?.leadsThisWeek || 0}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Contacted</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalContacted || 0}</div>
              <p className="text-xs text-muted-foreground">Active</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Confirmed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalConfirmed || 0}</div>
              <p className="text-xs text-muted-foreground">This month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Conversion</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.conversionRate || '0%'}</div>
              <p className="text-xs text-muted-foreground">This month</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <LeadFilters filters={filters} onFiltersChange={setFilters} />
          </div>

          <div className="lg:col-span-3 space-y-4">
            <LeadSearch 
              value={filters.search || ''} 
              onChange={handleSearchChange}
              resultCount={leads?.length}
            />

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>All Leads ({leads?.length || 0})</CardTitle>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-center py-8 text-muted-foreground">Loading leads...</div>
                ) : leads ? (
                  <LeadTableView leads={leads} />
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No leads found</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Leads will appear here once they submit the inquiry form
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
