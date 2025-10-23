import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, Phone, MapPin, GraduationCap, FileText, Globe } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { useLeadMutations } from '@/hooks/useLeadMutations';

interface LeadInfoCardProps {
  lead: any;
}

export const LeadInfoCard: React.FC<LeadInfoCardProps> = ({ lead }) => {
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [notes, setNotes] = useState(lead.internal_notes || '');
  const { updateLeadNotes } = useLeadMutations();

  const handleSaveNotes = () => {
    updateLeadNotes.mutate({ leadId: lead.id, notes });
    setIsEditingNotes(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Lead Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Contact Information */}
        <div>
          <h3 className="text-sm font-semibold mb-3 text-muted-foreground">Contact Details</h3>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <a href={`mailto:${lead.email}`} className="text-sm hover:underline">
                {lead.email}
              </a>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <a href={`tel:${lead.phone}`} className="text-sm hover:underline">
                {lead.phone}
              </a>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{lead.country}</span>
            </div>
          </div>
        </div>

        {/* Training Interest */}
        <div>
          <h3 className="text-sm font-semibold mb-3 text-muted-foreground">Training Interest</h3>
          <div className="flex items-start gap-2">
            <GraduationCap className="h-4 w-4 text-muted-foreground mt-0.5" />
            <span className="text-sm">{lead.training_interest}</span>
          </div>
        </div>

        {/* Source */}
        {lead.source && (
          <div>
            <h3 className="text-sm font-semibold mb-3 text-muted-foreground">Source</h3>
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{lead.source}</span>
            </div>
          </div>
        )}

        {/* Message */}
        {lead.message && (
          <div>
            <h3 className="text-sm font-semibold mb-3 text-muted-foreground">Inquiry Message</h3>
            <div className="flex items-start gap-2">
              <FileText className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
              <p className="text-sm whitespace-pre-wrap">{lead.message}</p>
            </div>
          </div>
        )}

        {/* Internal Notes */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-muted-foreground">Internal Notes</h3>
            {!isEditingNotes && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsEditingNotes(true)}
              >
                Edit
              </Button>
            )}
          </div>
          {isEditingNotes ? (
            <div className="space-y-2">
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add internal notes..."
                rows={4}
              />
              <div className="flex gap-2">
                <Button size="sm" onClick={handleSaveNotes}>Save</Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => {
                    setNotes(lead.internal_notes || '');
                    setIsEditingNotes(false);
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
              {lead.internal_notes || 'No notes added yet.'}
            </p>
          )}
        </div>

        {/* Assigned User */}
        {lead.assigned_user && (
          <div>
            <h3 className="text-sm font-semibold mb-3 text-muted-foreground">Assigned To</h3>
            <div className="text-sm">
              <p className="font-medium">{lead.assigned_user.full_name}</p>
              <p className="text-muted-foreground">{lead.assigned_user.email}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
