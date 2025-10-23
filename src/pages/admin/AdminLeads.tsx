import { useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { useLeads } from '@/hooks/useLeads';
import { useLeadStats } from '@/hooks/useLeadStats';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table2, Download } from 'lucide-react';
import { LeadFilters } from '@/hooks/useLeads';

export default function AdminLeads() {
  const [filters, setFilters] = useState<LeadFilters>({});
  const { data: leads, isLoading } = useLeads(filters);
  const { data: stats } = useLeadStats();

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

        {/* Leads Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>All Leads ({leads?.length || 0})</CardTitle>
              <Button variant="outline" size="sm">
                <Table2 className="h-4 w-4 mr-2" />
                Table View
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">Loading leads...</div>
            ) : leads && leads.length > 0 ? (
              <div className="space-y-4">
                {leads.map((lead: any) => (
                  <div key={lead.id} className="border rounded-lg p-4 hover:bg-muted/50 cursor-pointer">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{lead.full_name}</span>
                          <span className="text-xs text-muted-foreground">{lead.reference_number}</span>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {lead.organization} · {lead.country}
                        </div>
                        <div className="text-sm">{lead.training_interest}</div>
                      </div>
                      <div className="text-right space-y-1">
                        <div className="text-sm">
                          <span className={`px-2 py-1 rounded text-xs ${
                            lead.status === 'new' ? 'bg-red-100 text-red-800' :
                            lead.status === 'contacted' ? 'bg-yellow-100 text-yellow-800' :
                            lead.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {lead.status}
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(lead.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
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
    </AdminLayout>
  );
}
