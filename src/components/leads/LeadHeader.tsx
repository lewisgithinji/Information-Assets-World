import { ArrowLeft, Calendar, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StatusBadge } from './StatusBadge';
import { PriorityBadge } from './PriorityBadge';
import { VerificationBadge } from './VerificationBadge';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';

interface LeadHeaderProps {
  lead: any;
}

export const LeadHeader: React.FC<LeadHeaderProps> = ({ lead }) => {
  const navigate = useNavigate();

  return (
    <div className="bg-card border-b">
      <div className="container mx-auto px-4 py-6">
        <Button
          variant="ghost"
          onClick={() => navigate('/admin/leads')}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Leads
        </Button>

        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h1 className="text-3xl font-bold">{lead.full_name}</h1>
              <VerificationBadge 
                verified={lead.verified} 
                emailConfirmed={lead.email_confirmed}
              />
            </div>
            
            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              <span className="font-mono text-xs bg-muted px-2 py-1 rounded">
                {lead.reference_number}
              </span>
              <span>•</span>
              <span>{lead.organization}</span>
              <span>•</span>
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                Created {format(new Date(lead.created_at), 'MMM dd, yyyy')}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <StatusBadge status={lead.status} />
            <PriorityBadge priority={lead.priority} />
          </div>
        </div>
      </div>
    </div>
  );
};
