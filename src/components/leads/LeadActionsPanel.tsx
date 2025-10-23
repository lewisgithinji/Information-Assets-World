import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserPlus, Flag } from 'lucide-react';
import { StatusTransitionButtons } from './StatusTransitionButtons';
import { useState } from 'react';
import { AssignUserDialog } from './AssignUserDialog';
import { useLeadMutations } from '@/hooks/useLeadMutations';

interface LeadActionsPanelProps {
  lead: any;
}

export const LeadActionsPanel: React.FC<LeadActionsPanelProps> = ({ lead }) => {
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const { updateLeadPriority } = useLeadMutations();

  const handlePriorityChange = (priority: string) => {
    updateLeadPriority.mutate({ leadId: lead.id, priority });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Actions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Status Transitions */}
        <div>
          <h3 className="text-sm font-semibold mb-3">Change Status</h3>
          <StatusTransitionButtons leadId={lead.id} currentStatus={lead.status} />
        </div>

        {/* Assign User */}
        <div>
          <h3 className="text-sm font-semibold mb-3">Assign To</h3>
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={() => setShowAssignDialog(true)}
          >
            <UserPlus className="h-4 w-4 mr-2" />
            {lead.assigned_user ? lead.assigned_user.full_name : 'Assign to user'}
          </Button>
        </div>

        {/* Priority */}
        <div>
          <h3 className="text-sm font-semibold mb-3">Priority</h3>
          <Select value={lead.priority} onValueChange={handlePriorityChange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="high">
                <div className="flex items-center gap-2">
                  <Flag className="h-4 w-4 text-red-600" />
                  High
                </div>
              </SelectItem>
              <SelectItem value="medium">
                <div className="flex items-center gap-2">
                  <Flag className="h-4 w-4 text-yellow-600" />
                  Medium
                </div>
              </SelectItem>
              <SelectItem value="low">
                <div className="flex items-center gap-2">
                  <Flag className="h-4 w-4 text-green-600" />
                  Low
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Next Action */}
        {lead.next_action && (
          <div>
            <h3 className="text-sm font-semibold mb-2">Next Action</h3>
            <p className="text-sm text-muted-foreground">{lead.next_action}</p>
            {lead.next_action_date && (
              <p className="text-xs text-muted-foreground mt-1">
                Due: {new Date(lead.next_action_date).toLocaleDateString()}
              </p>
            )}
          </div>
        )}
      </CardContent>

      <AssignUserDialog
        leadId={lead.id}
        currentUserId={lead.assigned_to}
        open={showAssignDialog}
        onOpenChange={setShowAssignDialog}
      />
    </Card>
  );
};
