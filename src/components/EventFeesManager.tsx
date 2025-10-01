import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, X } from 'lucide-react';

interface EventFee {
  id?: string;
  fee_type: string;
  amount: number;
  currency: string;
  description?: string;
  available_until?: string;
  max_quantity?: number;
}

interface EventFeesManagerProps {
  eventId?: string;
}

const feeTypeOptions = [
  { value: 'conference_only', label: 'Conference Only' },
  { value: 'full_board', label: 'Conference + Full Board Accommodation' },
  { value: 'student', label: 'Student Fee' },
  { value: 'early_bird', label: 'Early Bird' },
  { value: 'member', label: 'Member Discount' },
  { value: 'group', label: 'Group Rate' },
];

const currencies = ['USD', 'EUR', 'GBP', 'KES'];

export default function EventFeesManager({ eventId }: EventFeesManagerProps) {
  const { toast } = useToast();
  const [fees, setFees] = useState<EventFee[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (eventId) {
      fetchFees();
    }
  }, [eventId]);

  const fetchFees = async () => {
    if (!eventId) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('event_fees')
        .select('*')
        .eq('event_id', eventId);

      if (error) throw error;
      setFees(data || []);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addFee = () => {
    setFees([
      ...fees,
      {
        fee_type: 'conference_only',
        amount: 0,
        currency: 'USD',
      },
    ]);
  };

  const removeFee = async (index: number) => {
    const fee = fees[index];
    
    if (fee.id && eventId) {
      try {
        const { error } = await supabase
          .from('event_fees')
          .delete()
          .eq('id', fee.id);

        if (error) throw error;

        toast({
          title: 'Success',
          description: 'Fee removed successfully',
        });
      } catch (error: any) {
        toast({
          title: 'Error',
          description: error.message,
          variant: 'destructive',
        });
        return;
      }
    }

    setFees(fees.filter((_, i) => i !== index));
  };

  const updateFee = (index: number, field: keyof EventFee, value: any) => {
    const updatedFees = [...fees];
    updatedFees[index] = { ...updatedFees[index], [field]: value };
    setFees(updatedFees);
  };

  const saveFees = async () => {
    if (!eventId) {
      toast({
        title: 'Error',
        description: 'Please save the event first before adding fees',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      // Delete existing fees
      await supabase.from('event_fees').delete().eq('event_id', eventId);

      // Insert new fees
      const feesData = fees.map(fee => ({
        event_id: eventId,
        fee_type: fee.fee_type,
        amount: fee.amount,
        currency: fee.currency,
        description: fee.description,
        available_until: fee.available_until || null,
        max_quantity: fee.max_quantity || null,
      }));

      const { error } = await supabase
        .from('event_fees')
        .insert(feesData);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Event fees saved successfully',
      });

      await fetchFees();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Event Fees</CardTitle>
          <Button type="button" onClick={addFee} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Fee
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {fees.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No fees added yet. Click "Add Fee" to create a pricing option.
            </p>
          ) : (
            fees.map((fee, index) => (
              <Card key={index} className="relative">
                <CardContent className="pt-6 space-y-4">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2"
                    onClick={() => removeFee(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Fee Type</Label>
                      <Select
                        value={fee.fee_type}
                        onValueChange={(value) => updateFee(index, 'fee_type', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {feeTypeOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Amount</Label>
                      <div className="flex gap-2">
                        <Select
                          value={fee.currency}
                          onValueChange={(value) => updateFee(index, 'currency', value)}
                        >
                          <SelectTrigger className="w-24">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {currencies.map((curr) => (
                              <SelectItem key={curr} value={curr}>
                                {curr}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={fee.amount}
                          onChange={(e) =>
                            updateFee(index, 'amount', parseFloat(e.target.value))
                          }
                          className="flex-1"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Description (Optional)</Label>
                    <Textarea
                      value={fee.description || ''}
                      onChange={(e) => updateFee(index, 'description', e.target.value)}
                      placeholder="Additional details about this fee"
                      rows={2}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Available Until (Optional)</Label>
                      <Input
                        type="date"
                        value={fee.available_until || ''}
                        onChange={(e) => updateFee(index, 'available_until', e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Max Quantity (Optional)</Label>
                      <Input
                        type="number"
                        min="1"
                        value={fee.max_quantity || ''}
                        onChange={(e) =>
                          updateFee(index, 'max_quantity', parseInt(e.target.value) || undefined)
                        }
                        placeholder="Unlimited"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}

          {fees.length > 0 && eventId && (
            <Button
              type="button"
              onClick={saveFees}
              disabled={isLoading}
              className="w-full"
            >
              Save All Fees
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
