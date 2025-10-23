import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PhoneInput } from "./PhoneInput";
import { useTrainingTypes } from "@/hooks/useTrainingTypes";
import { useCountries } from "@/hooks/useCountries";
import { leadFormSchema, type LeadFormData } from "@/utils/leadValidation";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface LeadFormProps {
  onSuccess?: (referenceNumber: string) => void;
}

declare global {
  interface Window {
    turnstile?: {
      render: (element: string | HTMLElement, options: {
        sitekey: string;
        callback: (token: string) => void;
        "error-callback": () => void;
        theme?: string;
      }) => string;
      reset: (widgetId: string) => void;
      remove: (widgetId: string) => void;
    };
  }
}

export function LeadForm({ onSuccess }: LeadFormProps) {
  const { toast } = useToast();
  const { data: trainingTypes, isLoading: isLoadingTypes } = useTrainingTypes();
  const { data: countries, isLoading: isLoadingCountries } = useCountries();
  const [captchaToken, setCaptchaToken] = useState<string>("");
  const [turnstileWidgetId, setTurnstileWidgetId] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<LeadFormData>({
    resolver: zodResolver(leadFormSchema),
    defaultValues: {
      full_name: "",
      email: "",
      phone: "",
      organization: "",
      country: "",
      training_interest: "",
      source: "Website",
      message: "",
    },
  });

  const phoneValue = watch("phone");

  // Load Cloudflare Turnstile script
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js";
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);

    script.onload = () => {
      if (window.turnstile) {
        const widgetId = window.turnstile.render("#turnstile-widget", {
          sitekey: "0x4AAAAAAAzVBpFE1RqG3rJi", // Public Cloudflare Turnstile test key
          callback: (token: string) => {
            setCaptchaToken(token);
          },
          "error-callback": () => {
            setCaptchaToken("");
            toast({
              title: "CAPTCHA Error",
              description: "Failed to load CAPTCHA. Please refresh the page.",
              variant: "destructive",
            });
          },
          theme: "light",
        });
        setTurnstileWidgetId(widgetId);
      }
    };

    return () => {
      if (window.turnstile && turnstileWidgetId) {
        window.turnstile.remove(turnstileWidgetId);
      }
      document.body.removeChild(script);
    };
  }, []);

  const onSubmit = async (data: LeadFormData) => {
    if (!captchaToken) {
      toast({
        title: "CAPTCHA Required",
        description: "Please complete the CAPTCHA verification.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { data: result, error } = await supabase.functions.invoke("submit-lead", {
        body: {
          ...data,
          captchaToken,
        },
      });

      if (error) throw error;

      toast({
        title: "Thank you for your interest!",
        description: result.message || "Your inquiry has been received.",
      });

      reset();
      setCaptchaToken("");
      
      if (window.turnstile && turnstileWidgetId) {
        window.turnstile.reset(turnstileWidgetId);
      }

      if (onSuccess && result.referenceNumber) {
        onSuccess(result.referenceNumber);
      }
    } catch (error: any) {
      console.error("Error submitting lead:", error);
      
      let errorMessage = "There was an error submitting your inquiry. Please try again.";
      
      if (error.message?.includes("Too many submissions")) {
        errorMessage = "You've reached the submission limit. Please try again in an hour.";
      } else if (error.message?.includes("CAPTCHA")) {
        errorMessage = "CAPTCHA verification failed. Please try again.";
      }
      
      toast({
        title: "Submission Failed",
        description: errorMessage,
        variant: "destructive",
      });

      if (window.turnstile && turnstileWidgetId) {
        window.turnstile.reset(turnstileWidgetId);
      }
      setCaptchaToken("");
    } finally {
      setIsSubmitting(false);
    }
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
          {/* Honeypot fields - hidden from users */}
          <div style={{ position: "absolute", left: "-9999px" }} aria-hidden="true">
            <input
              type="text"
              {...register("website" as any)}
              tabIndex={-1}
              autoComplete="off"
            />
            <input
              type="text"
              {...register("company_name" as any)}
              tabIndex={-1}
              autoComplete="off"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="full_name">Full Name *</Label>
            <Input
              id="full_name"
              {...register("full_name")}
              placeholder="John Doe"
            />
            {errors.full_name && (
              <p className="text-sm text-destructive">{errors.full_name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email Address *</Label>
            <Input
              id="email"
              type="email"
              {...register("email")}
              placeholder="john.doe@example.com"
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number *</Label>
            <PhoneInput
              value={phoneValue}
              onChange={(value) => setValue("phone", value)}
            />
            {errors.phone && (
              <p className="text-sm text-destructive">{errors.phone.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="organization">Organization *</Label>
            <Input
              id="organization"
              {...register("organization")}
              placeholder="Company Name"
            />
            {errors.organization && (
              <p className="text-sm text-destructive">{errors.organization.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="country">Country *</Label>
            <Select onValueChange={(value) => setValue("country", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select a country" />
              </SelectTrigger>
              <SelectContent>
                {isLoadingCountries ? (
                  <SelectItem value="loading" disabled>Loading countries...</SelectItem>
                ) : (
                  countries?.map((country) => (
                    <SelectItem key={country.id} value={country.name}>
                      {country.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            {errors.country && (
              <p className="text-sm text-destructive">{errors.country.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="training_interest">Training Interest *</Label>
            <Select onValueChange={(value) => setValue("training_interest", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select your training interest" />
              </SelectTrigger>
              <SelectContent>
                {isLoadingTypes ? (
                  <SelectItem value="loading" disabled>Loading training types...</SelectItem>
                ) : (
                  trainingTypes?.map((type) => (
                    <SelectItem key={type.id} value={type.name}>
                      {type.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            {errors.training_interest && (
              <p className="text-sm text-destructive">{errors.training_interest.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="source">How did you hear about us?</Label>
            <Select
              defaultValue="Website"
              onValueChange={(value) => setValue("source", value)}
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

          <div className="space-y-2">
            <Label htmlFor="message">Additional Message (Optional)</Label>
            <Textarea
              id="message"
              {...register("message")}
              placeholder="Any specific requirements or questions?"
              rows={4}
            />
            {errors.message && (
              <p className="text-sm text-destructive">{errors.message.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Verification *</Label>
            <div id="turnstile-widget"></div>
            {!captchaToken && (
              <p className="text-sm text-muted-foreground">
                Please complete the verification above
              </p>
            )}
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            size="lg"
            disabled={isSubmitting || !captchaToken}
          >
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Submit Inquiry
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
