import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, Phone, MapPin, Calendar, FileText, Globe, User2, StickyNote } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { useLeadMutations } from '@/hooks/useLeadMutations';
import { InquiryTypeBadge } from './InquiryTypeBadge';
import { format } from 'date-fns';
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
        {/* Contact Information - Compact Grid Layout */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Contact Details
          </h3>
          <div className="grid grid-cols-1 gap-2">
            <div className="flex items-center gap-2 p-2 rounded-md hover:bg-muted/50 transition-colors">
              <Mail className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
              <a href={`mailto:${lead.email}`} className="text-sm hover:underline hover:text-primary transition-colors font-medium truncate">
                {lead.email}
              </a>
            </div>
            <div className="flex items-center gap-2 p-2 rounded-md hover:bg-muted/50 transition-colors">
              <Phone className="h-3.5 w-3.5 text-green-600 dark:text-green-400 flex-shrink-0" />
              <a href={`tel:${lead.phone}`} className="text-sm hover:underline hover:text-primary transition-colors font-medium">
                {lead.phone}
              </a>
            </div>
            <div className="flex items-center gap-2 p-2 rounded-md hover:bg-muted/50 transition-colors">
              <MapPin className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400 flex-shrink-0" />
              <span className="text-sm font-medium">{lead.country}</span>
            </div>
          </div>
        </div>

        {/* Event & Inquiry Type - Compact Side by Side */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Registration Details
          </h3>
          <div className="space-y-2">
            {/* Event Information */}
            {lead.event ? (
              <div className="flex items-start gap-2 p-2.5 rounded-md bg-gradient-to-r from-orange-500/5 to-transparent border border-orange-500/20">
                <Calendar className="h-3.5 w-3.5 text-orange-600 dark:text-orange-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold">{lead.event.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(lead.event.start_date), 'MMM dd, yyyy')} • {lead.event.location}
                  </p>
                </div>
              </div>
            ) : lead.training_interest ? (
              <div className="flex items-center gap-2 p-2 rounded-md bg-muted/30">
                <span className="text-xs text-muted-foreground">Legacy: {lead.training_interest}</span>
              </div>
            ) : null}

            {/* Inquiry Type */}
            {lead.inquiry_type && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Type:</span>
                <InquiryTypeBadge inquiryType={lead.inquiry_type} />
              </div>
            )}

            {/* Source - Inline */}
            {lead.source && (
              <div className="flex items-center gap-2 p-2 rounded-md hover:bg-muted/50 transition-colors">
                <Globe className="h-3.5 w-3.5 text-cyan-600 dark:text-cyan-400 flex-shrink-0" />
                <span className="text-xs">
                  <span className="text-muted-foreground">Source:</span> <span className="font-medium">{lead.source}</span>
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Message - Only if exists */}
        {lead.message && (
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Additional Notes
            </h3>
            <div className="flex items-start gap-2 p-2.5 rounded-md bg-muted/30 border">
              <FileText className="h-3.5 w-3.5 text-slate-600 dark:text-slate-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm whitespace-pre-wrap leading-relaxed">{lead.message}</p>
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
