import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { StatusBadge } from './StatusBadge';
import { PriorityBadge } from './PriorityBadge';
import { VerificationBadge } from './VerificationBadge';
import { FollowUpBadge } from './FollowUpBadge';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';

interface LeadTableViewProps {
  leads: any[];
  selectedLeads?: string[];
  onSelectionChange?: (selectedIds: string[]) => void;
  selectionMode?: boolean;
}

export const LeadTableView: React.FC<LeadTableViewProps> = ({
  leads,
  selectedLeads = [],
  onSelectionChange,
  selectionMode = false,
}) => {
  const navigate = useNavigate();

  const handleSelectAll = (checked: boolean) => {
    if (onSelectionChange) {
      onSelectionChange(checked ? leads.map(lead => lead.id) : []);
    }
  };

  const handleSelectLead = (leadId: string, checked: boolean) => {
    if (onSelectionChange) {
      if (checked) {
        onSelectionChange([...selectedLeads, leadId]);
      } else {
        onSelectionChange(selectedLeads.filter(id => id !== leadId));
      }
    }
  };

  const allSelected = leads.length > 0 && selectedLeads.length === leads.length;
  const someSelected = selectedLeads.length > 0 && selectedLeads.length < leads.length;

  return (
    <div className="border rounded-lg overflow-hidden shadow-sm">
      <Table>
        <TableHeader>
          <TableRow className="bg-gradient-to-r from-muted/50 to-muted/20 hover:from-muted/60 hover:to-muted/30">
            {selectionMode && (
              <TableHead className="w-12">
                <Checkbox
                  checked={allSelected}
                  ref={(el) => {
                    if (el) {
                      (el as any).indeterminate = someSelected;
                    }
                  }}
                  onCheckedChange={handleSelectAll}
                />
              </TableHead>
            )}
            <TableHead className="font-bold text-xs uppercase tracking-wider">Reference</TableHead>
            <TableHead className="font-bold text-xs uppercase tracking-wider">Name</TableHead>
            <TableHead className="font-bold text-xs uppercase tracking-wider">Organization</TableHead>
            <TableHead className="font-bold text-xs uppercase tracking-wider">Status</TableHead>
            <TableHead className="font-bold text-xs uppercase tracking-wider">Follow-up</TableHead>
            <TableHead className="font-bold text-xs uppercase tracking-wider">Priority</TableHead>
            <TableHead className="font-bold text-xs uppercase tracking-wider">Created</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {leads.length === 0 ? (
            <TableRow>
              <TableCell colSpan={selectionMode ? 8 : 7} className="text-center py-8 text-muted-foreground">
                No leads found
              </TableCell>
            </TableRow>
          ) : (
            leads.map((lead) => {
              const isSelected = selectedLeads.includes(lead.id);
              return (
                <TableRow
                  key={lead.id}
                  className={`
                    cursor-pointer transition-all duration-150
                    hover:bg-gradient-to-r hover:from-muted/40 hover:to-transparent
                    hover:shadow-sm
                    ${isSelected ? 'bg-primary/5 border-l-4 border-l-primary' : 'border-l-4 border-l-transparent'}
                  `}
                  onClick={(e) => {
                    if (!(e.target as HTMLElement).closest('.checkbox-cell')) {
                      navigate(`/admin/leads/${lead.id}`);
                    }
                  }}
                >
                  {selectionMode && (
                    <TableCell className="checkbox-cell" onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={(checked) => handleSelectLead(lead.id, checked as boolean)}
                      />
                    </TableCell>
                  )}
                  <TableCell className="font-mono text-xs font-semibold text-muted-foreground bg-muted/20">
                    {lead.reference_number}
                  </TableCell>
                  <TableCell className="font-semibold">{lead.full_name}</TableCell>
                  <TableCell className="text-muted-foreground">{lead.organization}</TableCell>
                  <TableCell>
                    <StatusBadge status={lead.status} />
                  </TableCell>
                  <TableCell>
                    <FollowUpBadge
                      nextActionDate={lead.next_action_date}
                      status={lead.status}
                      compact
                    />
                  </TableCell>
                  <TableCell>
                    <PriorityBadge priority={lead.priority} />
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground font-medium">
                    {format(new Date(lead.created_at), 'MMM dd, yyyy')}
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
};
