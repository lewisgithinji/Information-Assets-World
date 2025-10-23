import { Button } from '@/components/ui/button';
import { STATUS_FLOW, STATUS_LABELS, STATUS_COLORS } from '@/utils/leadStatusWorkflow';
import { useLeadMutations } from '@/hooks/useLeadMutations';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Textarea } from '@/components/ui/textarea';
import { useState } from 'react';

interface StatusTransitionButtonsProps {
  leadId: string;
  currentStatus: string;
}

export const StatusTransitionButtons: React.FC<StatusTransitionButtonsProps> = ({
  leadId,
  currentStatus,
}) => {
  const { updateLeadStatus } = useLeadMutations();
  const [showLostDialog, setShowLostDialog] = useState(false);
  const [lostReason, setLostReason] = useState('');
  const availableTransitions = STATUS_FLOW[currentStatus] || [];

  const handleStatusChange = (newStatus: string) => {
    if (newStatus === 'lost') {
      setShowLostDialog(true);
      return;
    }

    updateLeadStatus.mutate({
      leadId,
      newStatus,
      currentStatus,
    });
  };

  const handleLostConfirm = () => {
    updateLeadStatus.mutate({
      leadId,
      newStatus: 'lost',
      currentStatus,
      reason: lostReason,
    });
    setShowLostDialog(false);
    setLostReason('');
  };

  if (availableTransitions.length === 0) {
    return (
      <div className="text-sm text-muted-foreground">
        No status transitions available
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-wrap gap-2">
        {availableTransitions.map((status) => (
          <Button
            key={status}
            size="sm"
            variant="outline"
            className={STATUS_COLORS[status]}
            onClick={() => handleStatusChange(status)}
            disabled={updateLeadStatus.isPending}
          >
            {STATUS_LABELS[status]}
          </Button>
        ))}
      </div>

      <AlertDialog open={showLostDialog} onOpenChange={setShowLostDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Mark Lead as Lost</AlertDialogTitle>
            <AlertDialogDescription>
              Please provide a reason for marking this lead as lost. This will help improve future follow-ups.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <Textarea
            value={lostReason}
            onChange={(e) => setLostReason(e.target.value)}
            placeholder="Reason for losing this lead..."
            rows={3}
          />

          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleLostConfirm}>
              Confirm Lost
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
