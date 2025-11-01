import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, Phone, MapPin, GraduationCap, FileText, Globe, User2, StickyNote } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { useLeadMutations } from '@/hooks/useLeadMutations';
import type { Lead } from '@/types/lead';

interface LeadInfoCardProps {
  lead: Lead;
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
    <Card className="overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-transparent pointer-events-none" />
      <CardHeader className="relative border-b bg-gradient-to-r from-background to-muted/20 pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <div className="p-2 rounded-lg bg-primary/10">
            <User2 className="h-4 w-4 text-primary" />
          </div>
          Lead Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 pt-6 relative">
        {/* Contact Information */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
            <div className="h-px flex-1 bg-gradient-to-r from-border to-transparent" />
            Contact Details
            <div className="h-px flex-1 bg-gradient-to-l from-border to-transparent" />
          </h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-2 rounded-md hover:bg-muted/50 transition-colors group">
              <div className="p-2 rounded-md bg-blue-500/10 group-hover:bg-blue-500/20 transition-colors">
                <Mail className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              <a href={`mailto:${lead.email}`} className="text-sm hover:underline hover:text-primary transition-colors font-medium">
                {lead.email}
              </a>
            </div>
            <div className="flex items-center gap-3 p-2 rounded-md hover:bg-muted/50 transition-colors group">
              <div className="p-2 rounded-md bg-green-500/10 group-hover:bg-green-500/20 transition-colors">
                <Phone className="h-4 w-4 text-green-600 dark:text-green-400" />
              </div>
              <a href={`tel:${lead.phone}`} className="text-sm hover:underline hover:text-primary transition-colors font-medium">
                {lead.phone}
              </a>
            </div>
            <div className="flex items-center gap-3 p-2 rounded-md hover:bg-muted/50 transition-colors group">
              <div className="p-2 rounded-md bg-purple-500/10 group-hover:bg-purple-500/20 transition-colors">
                <MapPin className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              </div>
              <span className="text-sm font-medium">{lead.country}</span>
            </div>
          </div>
        </div>

        {/* Training Interest */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
            <div className="h-px flex-1 bg-gradient-to-r from-border to-transparent" />
            Training Interest
            <div className="h-px flex-1 bg-gradient-to-l from-border to-transparent" />
          </h3>
          <div className="flex items-start gap-3 p-3 rounded-md bg-gradient-to-r from-orange-500/5 to-transparent border border-orange-500/20">
            <div className="p-2 rounded-md bg-orange-500/10">
              <GraduationCap className="h-4 w-4 text-orange-600 dark:text-orange-400" />
            </div>
            <span className="text-sm font-medium pt-1.5">{lead.training_interest}</span>
          </div>
        </div>

        {/* Source */}
        {lead.source && (
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <div className="h-px flex-1 bg-gradient-to-r from-border to-transparent" />
              Source
              <div className="h-px flex-1 bg-gradient-to-l from-border to-transparent" />
            </h3>
            <div className="flex items-center gap-3 p-2 rounded-md hover:bg-muted/50 transition-colors group">
              <div className="p-2 rounded-md bg-cyan-500/10 group-hover:bg-cyan-500/20 transition-colors">
                <Globe className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
              </div>
              <span className="text-sm font-medium">{lead.source}</span>
            </div>
          </div>
        )}

        {/* Message */}
        {lead.message && (
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <div className="h-px flex-1 bg-gradient-to-r from-border to-transparent" />
              Inquiry Message
              <div className="h-px flex-1 bg-gradient-to-l from-border to-transparent" />
            </h3>
            <div className="flex items-start gap-3 p-3 rounded-md bg-muted/30 border">
              <div className="p-2 rounded-md bg-slate-500/10 flex-shrink-0">
                <FileText className="h-4 w-4 text-slate-600 dark:text-slate-400" />
              </div>
              <p className="text-sm whitespace-pre-wrap leading-relaxed pt-1">{lead.message}</p>
            </div>
          </div>
        )}

        {/* Internal Notes */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <div className="h-px flex-1 bg-gradient-to-r from-border to-transparent" />
              Internal Notes
              <div className="h-px flex-1 bg-gradient-to-l from-border to-transparent" />
            </h3>
            {!isEditingNotes && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 hover:bg-primary/10"
                onClick={() => setIsEditingNotes(true)}
              >
                Edit
              </Button>
            )}
          </div>
          {isEditingNotes ? (
            <div className="space-y-3">
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add internal notes..."
                rows={4}
                className="resize-none"
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
            <div className="flex items-start gap-3 p-3 rounded-md bg-gradient-to-r from-yellow-500/5 to-transparent border border-yellow-500/20 min-h-[80px]">
              <div className="p-2 rounded-md bg-yellow-500/10 flex-shrink-0">
                <StickyNote className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
              </div>
              <p className="text-sm whitespace-pre-wrap leading-relaxed pt-1">
                {lead.internal_notes || <span className="text-muted-foreground italic">No notes added yet.</span>}
              </p>
            </div>
          )}
        </div>

        {/* Assigned User */}
        {lead.assigned_user && (
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <div className="h-px flex-1 bg-gradient-to-r from-border to-transparent" />
              Assigned To
              <div className="h-px flex-1 bg-gradient-to-l from-border to-transparent" />
            </h3>
            <div className="flex items-center gap-3 p-3 rounded-md bg-gradient-to-r from-indigo-500/5 to-transparent border border-indigo-500/20">
              <div className="p-2 rounded-md bg-indigo-500/10">
                <User2 className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div className="text-sm">
                <p className="font-semibold">{lead.assigned_user.full_name}</p>
                <p className="text-muted-foreground text-xs">{lead.assigned_user.email}</p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
