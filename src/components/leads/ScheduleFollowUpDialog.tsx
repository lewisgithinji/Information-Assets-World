import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Checkbox } from '@/components/ui/checkbox';
import { useLeadMutations } from '@/hooks/useLeadMutations';
import { useActivityMutations } from '@/hooks/useActivityMutations';
import { addDays, format } from 'date-fns';

interface ScheduleFollowUpDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  leadId: string;
  currentAction?: string;
  currentDate?: string;
}

export const ScheduleFollowUpDialog: React.FC<ScheduleFollowUpDialogProps> = ({
  open,
  onOpenChange,
  leadId,
  currentAction = '',
  currentDate,
}) => {
  const [nextAction, setNextAction] = useState(currentAction || '');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    currentDate ? new Date(currentDate) : undefined
  );
  const [createActivity, setCreateActivity] = useState(true);

  const { updateNextAction } = useLeadMutations();
  const { createActivity: addActivity } = useActivityMutations();

  const handleSubmit = async () => {
    if (!nextAction || !selectedDate) return;

    try {
      const dateString = format(selectedDate, 'yyyy-MM-dd');
      
      await updateNextAction.mutateAsync({
        leadId,
        nextAction,
        nextActionDate: dateString,
      });

      if (createActivity) {
        await addActivity.mutateAsync({
          leadId,
          activityType: 'follow_up_scheduled',
          summary: 'Follow-up scheduled',
          details: `Next action: ${nextAction}\nScheduled for: ${format(selectedDate, 'MMM dd, yyyy')}`,
        });
      }

      onOpenChange(false);
      setNextAction('');
      setSelectedDate(undefined);
    } catch (error) {
      console.error('Error scheduling follow-up:', error);
    }
  };

  const setQuickDate = (days: number) => {
    setSelectedDate(addDays(new Date(), days));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Schedule Follow-up</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>What needs to be done?</Label>
            <Textarea
              value={nextAction}
              onChange={(e) => setNextAction(e.target.value)}
              placeholder="E.g., Send training proposal, Follow up on pricing discussion..."
              className="mt-2 min-h-20"
            />
          </div>

          <div>
            <Label>When?</Label>
            <div className="flex gap-2 mt-2 mb-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setQuickDate(0)}
              >
                Today
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setQuickDate(1)}
              >
                Tomorrow
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setQuickDate(3)}
              >
                3 Days
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setQuickDate(7)}
              >
                Next Week
              </Button>
            </div>
            <div className="border rounded-lg p-3 flex justify-center">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                className="rounded-md"
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="createActivity"
              checked={createActivity}
              onCheckedChange={(checked) => setCreateActivity(checked as boolean)}
            />
            <Label htmlFor="createActivity" className="cursor-pointer">
              Log as activity in timeline
            </Label>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!nextAction || !selectedDate || updateNextAction.isPending}
          >
            {updateNextAction.isPending ? 'Scheduling...' : 'Schedule Follow-up'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
