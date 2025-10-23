import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { StatusBadge } from './StatusBadge';
import { PriorityBadge } from './PriorityBadge';
import { VerificationBadge } from './VerificationBadge';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';

interface LeadTableViewProps {
  leads: any[];
}

export const LeadTableView: React.FC<LeadTableViewProps> = ({ leads }) => {
  const navigate = useNavigate();

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Reference</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Organization</TableHead>
            <TableHead>Country</TableHead>
            <TableHead>Training Interest</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead>Verification</TableHead>
            <TableHead>Assigned To</TableHead>
            <TableHead>Created</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {leads.length === 0 ? (
            <TableRow>
              <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                No leads found
              </TableCell>
            </TableRow>
          ) : (
            leads.map((lead) => (
              <TableRow
                key={lead.id}
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => navigate(`/admin/leads/${lead.id}`)}
              >
                <TableCell className="font-mono text-xs">
                  {lead.reference_number}
                </TableCell>
                <TableCell className="font-medium">{lead.full_name}</TableCell>
                <TableCell>{lead.organization}</TableCell>
                <TableCell>{lead.country}</TableCell>
                <TableCell className="max-w-xs truncate">{lead.training_interest}</TableCell>
                <TableCell>
                  <StatusBadge status={lead.status} />
                </TableCell>
                <TableCell>
                  <PriorityBadge priority={lead.priority} />
                </TableCell>
                <TableCell>
                  <VerificationBadge
                    verified={lead.verified}
                    emailConfirmed={lead.email_confirmed}
                  />
                </TableCell>
                <TableCell>
                  {lead.assigned_user ? (
                    <div className="text-sm">
                      <div className="font-medium">{lead.assigned_user.full_name}</div>
                    </div>
                  ) : (
                    <span className="text-muted-foreground text-sm">Unassigned</span>
                  )}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {format(new Date(lead.created_at), 'MMM dd, yyyy')}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};
