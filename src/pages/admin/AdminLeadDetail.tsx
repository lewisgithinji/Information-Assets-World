import { useParams } from 'react-router-dom';
import AdminLayout from '@/components/AdminLayout';
import { useLead } from '@/hooks/useLead';
import { LeadHeader } from '@/components/leads/LeadHeader';
import { LeadInfoCard } from '@/components/leads/LeadInfoCard';
import { LeadActionsPanel } from '@/components/leads/LeadActionsPanel';
import { ActivityTimeline } from '@/components/leads/ActivityTimeline';
import { Skeleton } from '@/components/ui/skeleton';

export default function AdminLeadDetail() {
  const { id } = useParams<{ id: string }>();
  const { data: lead, isLoading } = useLead(id);

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="space-y-6">
          <Skeleton className="h-32 w-full" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Skeleton className="h-96 w-full" />
            </div>
            <Skeleton className="h-96 w-full" />
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (!lead) {
    return (
      <AdminLayout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-2">Lead Not Found</h2>
          <p className="text-muted-foreground">The lead you're looking for doesn't exist.</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <LeadHeader lead={lead} />

        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Lead Info - 2 columns */}
            <div className="lg:col-span-2 space-y-6">
              <LeadInfoCard lead={lead} />
              <ActivityTimeline leadId={lead.id} />
            </div>

            {/* Actions Panel - 1 column */}
            <div>
              <LeadActionsPanel lead={lead} />
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
