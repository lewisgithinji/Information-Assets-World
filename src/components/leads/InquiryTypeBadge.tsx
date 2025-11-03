import { Badge } from "@/components/ui/badge";

const INQUIRY_TYPE_CONFIG: Record<string, { label: string; icon: string; color: string }> = {
  send_writeup: {
    label: 'Send Writeup',
    icon: '📧',
    color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  },
  contact_discuss: {
    label: 'Discuss Event',
    icon: '📞',
    color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  },
  group_registration: {
    label: 'Group Booking',
    icon: '👥',
    color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  },
  corporate_training: {
    label: 'Corporate Training',
    icon: '🏢',
    color: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  },
  register_now: {
    label: 'Ready to Register',
    icon: '✅',
    color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200',
  },
  just_browsing: {
    label: 'Browsing',
    icon: '📰',
    color: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
  },
};

interface InquiryTypeBadgeProps {
  inquiryType: string;
  compact?: boolean;
}

export const InquiryTypeBadge: React.FC<InquiryTypeBadgeProps> = ({
  inquiryType,
  compact = false,
}) => {
  const config = INQUIRY_TYPE_CONFIG[inquiryType] || {
    label: inquiryType,
    icon: '❓',
    color: 'bg-gray-100 text-gray-800',
  };

  return (
    <Badge variant="secondary" className={`${config.color} font-medium`}>
      <span className="mr-1">{config.icon}</span>
      {!compact && config.label}
    </Badge>
  );
};
