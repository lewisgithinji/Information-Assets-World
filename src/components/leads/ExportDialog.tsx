import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { exportLeadsToCSV, DEFAULT_EXPORT_COLUMNS, ALL_EXPORT_COLUMNS } from '@/utils/leadExport';
import { toast } from '@/hooks/use-toast';
import { Download } from 'lucide-react';
import { LeadFilters } from '@/hooks/useLeads';

interface ExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  leads: any[];
  filters?: LeadFilters;
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

const PRESETS = {
  basic: ['reference_number', 'full_name', 'email', 'phone', 'organization', 'country'],
  sales: ['full_name', 'organization', 'status', 'priority', 'assigned_to', 'created_at'],
  full: ALL_EXPORT_COLUMNS,
};

export const ExportDialog: React.FC<ExportDialogProps> = ({
  open,
  onOpenChange,
  leads,
  filters,
}) => {
  const [selectedColumns, setSelectedColumns] = useState<string[]>(DEFAULT_EXPORT_COLUMNS);

  const handleToggleColumn = (column: string) => {
    setSelectedColumns(prev =>
      prev.includes(column)
        ? prev.filter(c => c !== column)
        : [...prev, column]
    );
  };

  const handleSelectAll = () => {
    setSelectedColumns(ALL_EXPORT_COLUMNS);
  };

  const handleDeselectAll = () => {
    setSelectedColumns([]);
  };

  const handlePresetChange = (preset: string) => {
    setSelectedColumns(PRESETS[preset as keyof typeof PRESETS] || DEFAULT_EXPORT_COLUMNS);
  };

  const handleExport = () => {
    if (selectedColumns.length === 0) {
      toast({
        title: 'No columns selected',
        description: 'Please select at least one column to export.',
        variant: 'destructive',
      });
      return;
    }

    try {
      toast({
        title: 'Preparing export...',
        description: 'Generating CSV file...',
      });

      exportLeadsToCSV({
        leads,
        columns: selectedColumns,
      });

      toast({
        title: 'Export successful',
        description: `Exported ${leads.length} leads to CSV.`,
      });

      onOpenChange(false);
    } catch (error) {
      toast({
        title: 'Export failed',
        description: 'An error occurred while exporting leads.',
        variant: 'destructive',
      });
    }
  };

  const getFilterSummary = () => {
    const summary: string[] = [];
    if (filters?.status?.length) {
      summary.push(`Status: ${filters.status.join(', ')}`);
    }
    if (filters?.country?.length) {
      summary.push(`Country: ${filters.country.join(', ')}`);
    }
    if (filters?.training_interest) {
      summary.push(`Training: ${filters.training_interest}`);
    }
    if (filters?.assigned_to) {
      summary.push('Assigned leads only');
    }
    if (filters?.search) {
      summary.push(`Search: "${filters.search}"`);
    }
    return summary;
  };

  const filterSummary = getFilterSummary();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Export Leads ({leads.length} leads)</DialogTitle>
          <DialogDescription>
            Select the columns you want to include in your export.
          </DialogDescription>
        </DialogHeader>

        {filterSummary.length > 0 && (
          <div className="rounded-lg border bg-muted/50 p-3">
            <p className="text-sm font-medium mb-2">Current Filters:</p>
            <ul className="text-sm text-muted-foreground space-y-1">
              {filterSummary.map((filter, index) => (
                <li key={index}>• {filter}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleSelectAll}>
                Select All
              </Button>
              <Button variant="outline" size="sm" onClick={handleDeselectAll}>
                Deselect All
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <Label>Preset:</Label>
              <Select onValueChange={handlePresetChange}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Choose preset" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="basic">Basic Info</SelectItem>
                  <SelectItem value="sales">Sales Report</SelectItem>
                  <SelectItem value="full">Full Details</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {ALL_EXPORT_COLUMNS.map(column => (
              <div key={column} className="flex items-center space-x-2">
                <Checkbox
                  id={column}
                  checked={selectedColumns.includes(column)}
                  onCheckedChange={() => handleToggleColumn(column)}
                />
                <Label
                  htmlFor={column}
                  className="text-sm font-normal cursor-pointer"
                >
                  {COLUMN_LABELS[column]}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleExport} disabled={selectedColumns.length === 0}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
