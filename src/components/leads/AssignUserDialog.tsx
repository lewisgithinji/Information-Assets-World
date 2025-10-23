import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useUsers } from '@/hooks/useUsers';
import { useLeadMutations } from '@/hooks/useLeadMutations';
import { useState } from 'react';

interface AssignUserDialogProps {
  leadId: string;
  currentUserId?: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AssignUserDialog: React.FC<AssignUserDialogProps> = ({
  leadId,
  currentUserId,
  open,
  onOpenChange,
}) => {
  const { data: users, isLoading } = useUsers();
  const { assignLead } = useLeadMutations();
  const [selectedUserId, setSelectedUserId] = useState<string>(currentUserId || 'unassigned');

  const handleAssign = () => {
    assignLead.mutate(
      {
        leadId,
        userId: selectedUserId === 'unassigned' ? null : selectedUserId,
      },
      {
        onSuccess: () => {
          onOpenChange(false);
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Assign Lead</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Select value={selectedUserId} onValueChange={setSelectedUserId}>
            <SelectTrigger>
              <SelectValue placeholder={isLoading ? 'Loading users...' : 'Select a user'} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="unassigned">Unassigned</SelectItem>
              {users?.map((user) => (
                <SelectItem key={user.user_id} value={user.user_id}>
                  {user.full_name} ({user.email})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleAssign} disabled={assignLead.isPending}>
              {assignLead.isPending ? 'Assigning...' : 'Assign'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
