import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { leadFormSchema, LeadFormData } from '@/utils/leadValidation';
import { useLeadSubmission } from '@/hooks/useLeadSubmission';
import { useTrainingTypes } from '@/hooks/useTrainingTypes';
import { useCountries } from '@/hooks/useCountries';
import { PhoneInput } from './PhoneInput';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

interface LeadFormProps {
  onSuccess?: (referenceNumber: string) => void;
}

export const LeadForm: React.FC<LeadFormProps> = ({ onSuccess }) => {
  const { data: trainingTypes, isLoading: loadingTraining } = useTrainingTypes();
  const { data: countries, isLoading: loadingCountries } = useCountries();
  const { mutate: submitLead, isPending } = useLeadSubmission();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<LeadFormData>({
    resolver: zodResolver(leadFormSchema),
    defaultValues: {
      source: 'Website',
    },
  });

  const phoneValue = watch('phone');

  const onSubmit = (data: LeadFormData) => {
    submitLead(data, {
      onSuccess: (lead) => {
        reset();
        onSuccess?.(lead.reference_number);
      },
    });
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl">Training Inquiry Form</CardTitle>
        <CardDescription>
          Fill out the form below to inquire about our professional training programs.
          We'll contact you within 24 hours.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Full Name */}
          <div className="space-y-2">
            <Label htmlFor="full_name">Full Name *</Label>
            <Input
              id="full_name"
              {...register('full_name')}
              placeholder="John Doe"
            />
            {errors.full_name && (
              <p className="text-sm text-destructive">{errors.full_name.message}</p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">Email Address *</Label>
            <Input
              id="email"
              type="email"
              {...register('email')}
              placeholder="john@example.com"
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>

          {/* Phone */}
          <PhoneInput
            value={phoneValue || ''}
            onChange={(val) => setValue('phone', val)}
            error={errors.phone?.message}
          />

          {/* Organization */}
          <div className="space-y-2">
            <Label htmlFor="organization">Organization Name *</Label>
            <Input
              id="organization"
              {...register('organization')}
              placeholder="Your Company Ltd"
            />
            {errors.organization && (
              <p className="text-sm text-destructive">{errors.organization.message}</p>
            )}
          </div>

          {/* Country */}
          <div className="space-y-2">
            <Label htmlFor="country">Country *</Label>
            <Select
              onValueChange={(val) => setValue('country', val)}
              disabled={loadingCountries}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a country" />
              </SelectTrigger>
              <SelectContent>
                {countries?.map((country) => (
                  <SelectItem key={country.id} value={country.name}>
                    {country.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.country && (
              <p className="text-sm text-destructive">{errors.country.message}</p>
            )}
          </div>

          {/* Training Interest */}
          <div className="space-y-2">
            <Label htmlFor="training_interest">Training Interest *</Label>
            <Select
              onValueChange={(val) => setValue('training_interest', val)}
              disabled={loadingTraining}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select training type" />
              </SelectTrigger>
              <SelectContent>
                {trainingTypes?.map((type) => (
                  <SelectItem key={type.id} value={type.name}>
                    {type.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.training_interest && (
              <p className="text-sm text-destructive">{errors.training_interest.message}</p>
            )}
          </div>

          {/* Source */}
          <div className="space-y-2">
            <Label htmlFor="source">How did you hear about us?</Label>
            <Select
              defaultValue="Website"
              onValueChange={(val) => setValue('source', val)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Google Search">Google Search</SelectItem>
                <SelectItem value="Social Media">Social Media</SelectItem>
                <SelectItem value="Referral">Referral</SelectItem>
                <SelectItem value="Email">Email</SelectItem>
                <SelectItem value="Website">Website</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Message */}
          <div className="space-y-2">
            <Label htmlFor="message">Message / Questions (Optional)</Label>
            <Textarea
              id="message"
              {...register('message')}
              placeholder="Tell us more about your training needs..."
              rows={4}
            />
            {errors.message && (
              <p className="text-sm text-destructive">{errors.message.message}</p>
            )}
          </div>

          {/* Submit Button */}
          <Button type="submit" className="w-full" size="lg" disabled={isPending}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Submit Inquiry
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
