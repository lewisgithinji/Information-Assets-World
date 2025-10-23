import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import { Input } from '@/components/ui/input';
import { ChevronDown, Trash2, X, Calendar } from 'lucide-react';
import { useBulkOperations } from '@/hooks/useBulkOperations';
import { useUsers } from '@/hooks/useUsers';
import { STATUS_LABELS } from '@/utils/leadStatusWorkflow';
import { ScheduleFollowUpDialog } from './ScheduleFollowUpDialog';

interface BulkActionsPanelProps {
  selectedLeads: string[];
  onClearSelection: () => void;
}

export const BulkActionsPanel: React.FC<BulkActionsPanelProps> = ({
  selectedLeads,
  onClearSelection,
}) => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showScheduleDialog, setShowScheduleDialog] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const { bulkUpdateStatus, bulkAssignLeads, bulkUpdatePriority, bulkDeleteLeads } = useBulkOperations();
  const { data: users } = useUsers();

  const handleStatusChange = (status: string) => {
    bulkUpdateStatus.mutate(
      { leadIds: selectedLeads, newStatus: status },
      { onSuccess: onClearSelection }
    );
  };

  const handleAssign = (userId: string | null) => {
    bulkAssignLeads.mutate(
      { leadIds: selectedLeads, userId },
      { onSuccess: onClearSelection }
    );
  };

  const handlePriorityChange = (priority: string) => {
    bulkUpdatePriority.mutate(
      { leadIds: selectedLeads, priority },
      { onSuccess: onClearSelection }
    );
  };

  const handleDelete = () => {
    if (deleteConfirmText === 'DELETE') {
      bulkDeleteLeads.mutate(
        { leadIds: selectedLeads },
        {
          onSuccess: () => {
            onClearSelection();
            setShowDeleteDialog(false);
            setDeleteConfirmText('');
          },
        }
      );
    }
  };

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-medium">
                  {selectedLeads.length}
                </div>
                <span className="text-sm font-medium">
                  {selectedLeads.length === 1 ? '1 lead selected' : `${selectedLeads.length} leads selected`}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      Change Status <ChevronDown className="ml-2 h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    {Object.entries(STATUS_LABELS).map(([value, label]) => (
                      <DropdownMenuItem key={value} onClick={() => handleStatusChange(value)}>
                        {label}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      Assign To <ChevronDown className="ml-2 h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => handleAssign(null)}>
                      Unassign
                    </DropdownMenuItem>
                    {users?.map((user) => (
                      <DropdownMenuItem key={user.user_id} onClick={() => handleAssign(user.user_id)}>
                        {user.full_name || user.email}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      Priority <ChevronDown className="ml-2 h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => handlePriorityChange('high')}>
                      High
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handlePriorityChange('medium')}>
                      Medium
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handlePriorityChange('low')}>
                      Low
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowScheduleDialog(true)}
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Schedule Follow-up
                </Button>

                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setShowDeleteDialog(true)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </div>
            </div>

            <Button variant="ghost" size="sm" onClick={onClearSelection}>
              <X className="h-4 w-4 mr-2" />
              Clear Selection
            </Button>
          </div>
        </div>
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>⚠️ Delete {selectedLeads.length} Leads?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. All associated activities and notes will also be deleted.
              <div className="mt-4">
                <label className="text-sm font-medium">
                  Type "DELETE" to confirm:
                </label>
                <Input
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  placeholder="DELETE"
                  className="mt-2"
                />
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteConfirmText('')}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteConfirmText !== 'DELETE'}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <ScheduleFollowUpDialog
        open={showScheduleDialog}
        onOpenChange={setShowScheduleDialog}
        leadId={selectedLeads[0]}
        currentAction=""
        currentDate=""
      />
    </>
  );
};
