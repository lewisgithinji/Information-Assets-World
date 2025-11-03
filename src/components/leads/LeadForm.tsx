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
import { CountrySelect } from "./CountrySelect";
import { useUpcomingEvents } from "@/hooks/useUpcomingEvents";
import { leadFormSchema, type LeadFormData } from "@/utils/leadValidation";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, AlertCircle } from "lucide-react";
import { checkDuplicateLead, formatDuplicateMessage } from "@/utils/leadDeduplicate";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface LeadFormProps {
  onSuccess?: (referenceNumber: string) => void;
  initialEventId?: string;
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

export function LeadForm({ onSuccess, initialEventId }: LeadFormProps) {
  const { toast } = useToast();
  const { data: upcomingEvents, isLoading: isLoadingEvents } = useUpcomingEvents();
  const [captchaToken, setCaptchaToken] = useState<string>("");
  const [turnstileWidgetId, setTurnstileWidgetId] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [duplicateWarning, setDuplicateWarning] = useState<string>("");
  const [checkingDuplicate, setCheckingDuplicate] = useState(false);

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
      event_id: "",
      inquiry_type: "contact_discuss",
      source: "Website",
      message: "",
    },
  });

  const phoneValue = watch("phone");

  // Pre-select event if initialEventId is provided
  useEffect(() => {
    if (initialEventId && upcomingEvents) {
      const event = upcomingEvents.find(e => e.id === initialEventId);
      if (event) {
        setValue("event_id", event.id);
      }
    }
  }, [initialEventId, upcomingEvents, setValue]);

  // Load Cloudflare Turnstile script
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js";
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);

    script.onload = () => {
      if (window.turnstile) {
        const siteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY || "0x4AAAAAAAzVBpFE1RqG3rJi"; // Fallback to test key
        const widgetId = window.turnstile.render("#turnstile-widget", {
          sitekey: siteKey,
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

  // Check for duplicate email on blur
  const handleEmailBlur = async (email: string) => {
    if (!email || !email.includes("@")) return;

    setCheckingDuplicate(true);
    setDuplicateWarning("");

    const duplicateCheck = await checkDuplicateLead(email);

    if (duplicateCheck.isDuplicate && duplicateCheck.existingLead) {
      setDuplicateWarning(formatDuplicateMessage(duplicateCheck.existingLead));
    }

    setCheckingDuplicate(false);
  };

  const onSubmit = async (data: LeadFormData) => {
    // Temporarily allow submission without CAPTCHA for testing
    // TODO: Enable after setting up production Cloudflare Turnstile
    // if (!captchaToken) {
    //   toast({
    //     title: "CAPTCHA Required",
    //     description: "Please complete the CAPTCHA verification.",
    //     variant: "destructive",
    //   });
    //   return;
    // }

    // Check for duplicate one more time before submission
    const duplicateCheck = await checkDuplicateLead(data.email);
    if (duplicateCheck.isDuplicate) {
      setDuplicateWarning(formatDuplicateMessage(duplicateCheck.existingLead));
      toast({
        title: "Duplicate Submission",
        description: "This email has already been registered. Please contact us if you need to update your information.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { data: result, error } = await supabase.functions.invoke("submit-lead", {
        body: {
          ...data,
          captchaToken: captchaToken || "TEST_BYPASS", // Allow testing without CAPTCHA
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
              onBlur={(e) => handleEmailBlur(e.target.value)}
            />
            {checkingDuplicate && (
              <p className="text-sm text-muted-foreground">Checking for existing submission...</p>
            )}
            {duplicateWarning && (
              <Alert variant="destructive" className="mt-2">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{duplicateWarning}</AlertDescription>
              </Alert>
            )}
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
            <CountrySelect
              value={watch("country")}
              onValueChange={(value) => setValue("country", value)}
            />
            {errors.country && (
              <p className="text-sm text-destructive">{errors.country.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="event_id">Select Event *</Label>
            <Select
              onValueChange={(value) => setValue("event_id", value)}
              value={watch("event_id")}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select an event to register for" />
              </SelectTrigger>
              <SelectContent>
                {isLoadingEvents ? (
                  <SelectItem value="loading" disabled>Loading events...</SelectItem>
                ) : upcomingEvents && upcomingEvents.length > 0 ? (
                  upcomingEvents.map((event) => (
                    <SelectItem key={event.id} value={event.id}>
                      <div className="flex flex-col">
                        <span className="font-semibold">{event.title}</span>
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(event.start_date), 'MMM dd, yyyy')} • {event.location}
                        </span>
                      </div>
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="no-events" disabled>No upcoming events available</SelectItem>
                )}
              </SelectContent>
            </Select>
            {errors.event_id && (
              <p className="text-sm text-destructive">{errors.event_id.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="inquiry_type">What would you like us to do? *</Label>
            <Select
              onValueChange={(value) => setValue("inquiry_type", value as any)}
              defaultValue="contact_discuss"
            >
              <SelectTrigger>
                <SelectValue placeholder="Select your preference" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="send_writeup">
                  <div className="flex items-center gap-2">
                    <span>📧</span>
                    <div>
                      <div className="font-semibold">Send me the Event Writeup/Invitation</div>
                      <div className="text-xs text-muted-foreground">
                        Receive detailed event information via email
                      </div>
                    </div>
                  </div>
                </SelectItem>

                <SelectItem value="contact_discuss">
                  <div className="flex items-center gap-2">
                    <span>📞</span>
                    <div>
                      <div className="font-semibold">Contact Me to Discuss the Event</div>
                      <div className="text-xs text-muted-foreground">
                        Speak with our team about the event
                      </div>
                    </div>
                  </div>
                </SelectItem>

                <SelectItem value="register_now">
                  <div className="flex items-center gap-2">
                    <span>✅</span>
                    <div>
                      <div className="font-semibold">Ready to Register Now</div>
                      <div className="text-xs text-muted-foreground">
                        I'm ready to proceed with registration
                      </div>
                    </div>
                  </div>
                </SelectItem>

                <SelectItem value="group_registration">
                  <div className="flex items-center gap-2">
                    <span>👥</span>
                    <div>
                      <div className="font-semibold">Group Registration (3+ People)</div>
                      <div className="text-xs text-muted-foreground">
                        Register multiple people from your organization
                      </div>
                    </div>
                  </div>
                </SelectItem>

                <SelectItem value="corporate_training">
                  <div className="flex items-center gap-2">
                    <span>🏢</span>
                    <div>
                      <div className="font-semibold">Request Custom Corporate Training</div>
                      <div className="text-xs text-muted-foreground">
                        Tailored training for your organization
                      </div>
                    </div>
                  </div>
                </SelectItem>

                <SelectItem value="just_browsing">
                  <div className="flex items-center gap-2">
                    <span>📰</span>
                    <div>
                      <div className="font-semibold">Just Browsing/Stay Updated</div>
                      <div className="text-xs text-muted-foreground">
                        Add me to your event updates list
                      </div>
                    </div>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            {errors.inquiry_type && (
              <p className="text-sm text-destructive">{errors.inquiry_type.message}</p>
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
            <Label htmlFor="message">Additional Details (Optional)</Label>
            <Textarea
              id="message"
              {...register("message")}
              placeholder="Any specific questions or requirements? (optional)"
              rows={3}
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground">
              {watch("message")?.length || 0}/500 characters
            </p>
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
            disabled={isSubmitting}
          >
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Submit Inquiry
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
