import { useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { useLeads, LeadFilters as LeadFiltersType } from '@/hooks/useLeads';
import { useLeadStats } from '@/hooks/useLeadStats';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Download, CheckSquare, List, Calendar as CalendarIcon, BarChart3, UserPlus, Phone, CheckCircle2, TrendingUp } from 'lucide-react';
import { LeadFilters } from '@/components/leads/LeadFilters';
import { LeadSearch } from '@/components/leads/LeadSearch';
import { LeadTableView } from '@/components/leads/LeadTableView';
import { ExportDialog } from '@/components/leads/ExportDialog';
import { BulkActionsPanel } from '@/components/leads/BulkActionsPanel';
import { FollowUpWidget } from '@/components/leads/FollowUpWidget';
import { FollowUpCalendar } from '@/components/leads/FollowUpCalendar';
import { LeadAnalyticsDashboard } from '@/components/leads/LeadAnalyticsDashboard';

export default function AdminLeads() {
  const [filters, setFilters] = useState<LeadFiltersType>({});
  const [selectedLeads, setSelectedLeads] = useState<string[]>([]);
  const [selectionMode, setSelectionMode] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  
  const { data: leads, isLoading } = useLeads(filters);
  const { data: stats } = useLeadStats();

  const handleSearchChange = (search: string) => {
    setFilters({ ...filters, search: search || undefined });
  };

  const handleClearSelection = () => {
    setSelectedLeads([]);
    setSelectionMode(false);
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
            <Button
              variant={selectionMode ? 'default' : 'outline'}
              onClick={() => {
                setSelectionMode(!selectionMode);
                if (selectionMode) {
                  setSelectedLeads([]);
                }
              }}
            >
              <CheckSquare className="h-4 w-4 mr-2" />
              {selectionMode ? 'Done' : 'Select'}
            </Button>
            <Button variant="outline" onClick={() => setShowExportDialog(true)}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Follow-up Widget */}
        <FollowUpWidget />

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* New Leads Card */}
          <Card className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-blue-500/5 to-transparent pointer-events-none" />
            <CardHeader className="relative pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">New Leads</CardTitle>
                <div className="p-2 rounded-lg bg-blue-500/10">
                  <UserPlus className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="relative">
              <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                {stats?.totalNew || 0}
              </div>
              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                This week: <span className="font-semibold">{stats?.leadsThisWeek || 0}</span>
              </p>
            </CardContent>
          </Card>

          {/* Contacted Card */}
          <Card className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 via-green-500/5 to-transparent pointer-events-none" />
            <CardHeader className="relative pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">Contacted</CardTitle>
                <div className="p-2 rounded-lg bg-green-500/10">
                  <Phone className="h-4 w-4 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="relative">
              <div className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                {stats?.totalContacted || 0}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Active leads in progress
              </p>
            </CardContent>
          </Card>

          {/* Confirmed Card */}
          <Card className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-purple-500/5 to-transparent pointer-events-none" />
            <CardHeader className="relative pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">Confirmed</CardTitle>
                <div className="p-2 rounded-lg bg-purple-500/10">
                  <CheckCircle2 className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="relative">
              <div className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                {stats?.totalConfirmed || 0}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Successfully converted
              </p>
            </CardContent>
          </Card>

          {/* Conversion Rate Card */}
          <Card className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 via-orange-500/5 to-transparent pointer-events-none" />
            <CardHeader className="relative pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">Conversion</CardTitle>
                <div className="p-2 rounded-lg bg-orange-500/10">
                  <TrendingUp className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="relative">
              <div className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                {stats?.conversionRate || '0.0%'}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                This month's rate
              </p>
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

            <Tabs defaultValue="list" className="w-full">
              <TabsList className="grid w-full max-w-2xl grid-cols-3">
                <TabsTrigger value="list" className="flex items-center gap-2">
                  <List className="h-4 w-4" />
                  List View
                </TabsTrigger>
                <TabsTrigger value="calendar" className="flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4" />
                  Calendar
                </TabsTrigger>
                <TabsTrigger value="analytics" className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Analytics
                </TabsTrigger>
              </TabsList>

              <TabsContent value="list" className="mt-4">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>All Leads ({leads?.length || 0})</CardTitle>
                      <Button variant="outline" size="sm" onClick={() => setShowExportDialog(true)}>
                        <Download className="h-4 w-4 mr-2" />
                        Export
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <div className="text-center py-8 text-muted-foreground">Loading leads...</div>
                    ) : leads ? (
                      <LeadTableView
                        leads={leads}
                        selectedLeads={selectedLeads}
                        onSelectionChange={setSelectedLeads}
                        selectionMode={selectionMode}
                      />
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
              </TabsContent>

              <TabsContent value="calendar" className="mt-4">
                <FollowUpCalendar leads={leads} />
              </TabsContent>

              <TabsContent value="analytics" className="mt-4">
                {isLoading ? (
                  <div className="text-center py-8 text-muted-foreground">Loading analytics...</div>
                ) : leads && leads.length > 0 ? (
                  <LeadAnalyticsDashboard leads={leads} />
                ) : (
                  <Card>
                    <CardContent className="py-12">
                      <div className="text-center">
                        <BarChart3 className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                        <p className="text-lg font-medium text-muted-foreground">No Data Available</p>
                        <p className="text-sm text-muted-foreground mt-2">
                          Analytics will appear once you have leads in the system
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      {selectedLeads.length > 0 && (
        <BulkActionsPanel
          selectedLeads={selectedLeads}
          onClearSelection={handleClearSelection}
        />
      )}

      <ExportDialog
        open={showExportDialog}
        onOpenChange={setShowExportDialog}
        leads={leads || []}
        filters={filters}
      />
    </AdminLayout>
  );
}
