/**
 * Lead type definitions for type safety across the application
 */

export type LeadStatus =
  | 'new'
  | 'contacted'
  | 'doc_sent'
  | 'negotiating'
  | 'quote_sent'
  | 'confirmed'
  | 'lost';

export type LeadPriority = 'high' | 'medium' | 'low';

export type LeadSource =
  | 'Website'
  | 'Referral'
  | 'Social Media'
  | 'Email Campaign'
  | 'Event'
  | 'Other';

export type ActivityType =
  | 'call'
  | 'email'
  | 'whatsapp'
  | 'meeting'
  | 'document'
  | 'note'
  | 'status_change'
  | 'follow_up_scheduled';

export interface Lead {
  id: string;
  reference_number: string;
  full_name: string;
  email: string;
  phone: string;
  organization: string;
  country: string;
  training_interest: string;
  status: LeadStatus;
  priority: LeadPriority;
  verified: boolean;
  email_confirmed: boolean;
  assigned_to?: string;
  internal_notes?: string;
  next_action?: string;
  next_action_date?: string;
  source?: LeadSource;
  message?: string;
  created_at: string;
  updated_at: string;
}

export interface Activity {
  id: string;
  lead_id: string;
  type: ActivityType;
  description: string;
  logged_by: string;
  created_at: string;
  metadata?: Record<string, any>;
}

export interface LeadWithUser extends Lead {
  assigned_user?: {
    id: string;
    email: string;
    full_name?: string;
  };
}

export interface ActivityWithUser extends Activity {
  user?: {
    id: string;
    email: string;
    full_name?: string;
  };
}

export interface LeadStats {
  new_leads: number;
  new_leads_this_week: number;
  contacted_leads: number;
  confirmed_leads: number;
  conversion_rate: number;
}

export interface LeadFilters {
  status?: LeadStatus[];
  country?: string[];
  training_interest?: string;
  assigned_to?: string;
  follow_up_status?: 'overdue' | 'today' | 'this_week' | 'none';
  date_from?: string;
  date_to?: string;
  search?: string;
}
