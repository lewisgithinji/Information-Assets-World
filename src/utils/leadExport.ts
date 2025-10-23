import { format } from 'date-fns';

export interface ExportOptions {
  leads: any[];
  columns: string[];
  filename?: string;
}

const COLUMN_LABELS: Record<string, string> = {
  reference_number: 'Reference Number',
  full_name: 'Full Name',
  email: 'Email',
  phone: 'Phone',
  organization: 'Organization',
  country: 'Country',
  training_interest: 'Training Interest',
  status: 'Status',
  priority: 'Priority',
  verified: 'Verification Status',
  assigned_to: 'Assigned To',
  created_at: 'Created Date',
  updated_at: 'Last Updated',
  internal_notes: 'Internal Notes',
  next_action: 'Next Action',
  next_action_date: 'Next Action Date',
  source: 'Source',
  message: 'Message',
};

export const formatLeadForExport = (lead: any): Record<string, any> => {
  return {
    reference_number: lead.reference_number || '',
    full_name: lead.full_name || '',
    email: lead.email || '',
    phone: lead.phone || '',
    organization: lead.organization || '',
    country: lead.country || '',
    training_interest: lead.training_interest || '',
    status: lead.status || '',
    priority: lead.priority || '',
    verified: lead.verified ? 'Verified' : 'Unverified',
    assigned_to: lead.assigned_user?.full_name || 'Unassigned',
    created_at: lead.created_at ? format(new Date(lead.created_at), 'yyyy-MM-dd HH:mm') : '',
    updated_at: lead.updated_at ? format(new Date(lead.updated_at), 'yyyy-MM-dd HH:mm') : '',
    internal_notes: lead.internal_notes || '',
    next_action: lead.next_action || '',
    next_action_date: lead.next_action_date ? format(new Date(lead.next_action_date), 'yyyy-MM-dd') : '',
    source: lead.source || '',
    message: lead.message || '',
  };
};

const escapeCSVValue = (value: string): string => {
  if (value === null || value === undefined) return '';
  const stringValue = String(value);
  // Escape double quotes and wrap in quotes if contains comma, newline, or quote
  if (stringValue.includes(',') || stringValue.includes('\n') || stringValue.includes('"')) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  return stringValue;
};

export const generateCSVContent = (data: any[], columns: string[]): string => {
  // Generate header row
  const headers = columns.map(col => COLUMN_LABELS[col] || col).join(',');
  
  // Generate data rows
  const rows = data.map(row => {
    return columns.map(col => escapeCSVValue(row[col])).join(',');
  });
  
  return [headers, ...rows].join('\n');
};

export const downloadCSV = (content: string, filename: string): void => {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const exportLeadsToCSV = ({ leads, columns, filename }: ExportOptions): void => {
  const formattedLeads = leads.map(formatLeadForExport);
  const csvContent = generateCSVContent(formattedLeads, columns);
  
  const defaultFilename = `leads_export_${format(new Date(), 'yyyy-MM-dd_HHmmss')}.csv`;
  downloadCSV(csvContent, filename || defaultFilename);
};

export const DEFAULT_EXPORT_COLUMNS = [
  'reference_number',
  'full_name',
  'email',
  'phone',
  'organization',
  'country',
  'training_interest',
  'status',
  'priority',
  'verified',
  'assigned_to',
  'created_at',
];

export const ALL_EXPORT_COLUMNS = Object.keys(COLUMN_LABELS);
