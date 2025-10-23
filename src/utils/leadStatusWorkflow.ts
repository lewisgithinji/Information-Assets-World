export const STATUS_LABELS: Record<string, string> = {
  new: 'New',
  contacted: 'Contacted',
  doc_sent: 'Doc Sent',
  negotiating: 'Negotiating',
  quote_sent: 'Quote Sent',
  confirmed: 'Confirmed',
  lost: 'Lost',
};

export const STATUS_COLORS: Record<string, string> = {
  new: 'bg-red-100 text-red-800 hover:bg-red-200',
  contacted: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200',
  doc_sent: 'bg-green-100 text-green-800 hover:bg-green-200',
  negotiating: 'bg-orange-100 text-orange-800 hover:bg-orange-200',
  quote_sent: 'bg-blue-100 text-blue-800 hover:bg-blue-200',
  confirmed: 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200',
  lost: 'bg-gray-100 text-gray-800 hover:bg-gray-200',
};

export const STATUS_FLOW: Record<string, string[]> = {
  new: ['contacted'],
  contacted: ['doc_sent', 'negotiating', 'lost'],
  doc_sent: ['negotiating', 'quote_sent', 'lost'],
  negotiating: ['quote_sent', 'doc_sent', 'lost'],
  quote_sent: ['negotiating', 'confirmed', 'lost'],
  confirmed: [],
  lost: [],
};

export const canTransitionTo = (from: string, to: string): boolean => {
  return STATUS_FLOW[from]?.includes(to) || false;
};

export const PRIORITY_COLORS: Record<string, string> = {
  high: 'bg-red-100 text-red-800',
  medium: 'bg-yellow-100 text-yellow-800',
  low: 'bg-green-100 text-green-800',
};

export const ACTIVITY_ICONS: Record<string, string> = {
  call: '📞',
  email: '📧',
  whatsapp: '💬',
  meeting: '🤝',
  document: '📄',
  note: '📝',
  status_change: '🔄',
};
