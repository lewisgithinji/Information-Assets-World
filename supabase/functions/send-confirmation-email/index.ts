import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

import { getEmailTemplate, EmailData } from "../_shared/email-templates.ts";
import { sendEmailWithFallback } from "../_shared/email-service.ts";
import { generateCalendarAttachment } from "../_shared/calendar-generator.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Request schema
const requestSchema = z.object({
  leadId: z.string().uuid(),
  includeCalendarInvite: z.boolean().optional().default(false),
});

interface SendConfirmationEmailRequest extends z.infer<typeof requestSchema> {}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Parse and validate request
    const body = await req.json();
    const validatedData: SendConfirmationEmailRequest = requestSchema.parse(body);

    console.log('Sending confirmation email for lead:', validatedData.leadId);

    // Fetch lead details with event information
    const { data: lead, error: leadError } = await supabase
      .from('leads')
      .select(`
        *,
        event:events(
          id,
          title,
          description,
          start_date,
          end_date,
          location,
          category,
          event_type
        )
      `)
      .eq('id', validatedData.leadId)
      .single();

    if (leadError || !lead) {
      console.error('Lead not found:', leadError);
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Lead not found'
        }),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Validate that lead has event and inquiry type
    if (!lead.event_id || !lead.inquiry_type) {
      console.error('Lead missing event_id or inquiry_type:', lead.id);
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Lead missing required event or inquiry type information'
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Check if event data exists
    if (!lead.event) {
      console.error('Event not found for lead:', lead.id);
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Event not found'
        }),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Prepare email data
    const emailData: EmailData = {
      leadName: lead.full_name,
      leadEmail: lead.email,
      eventTitle: lead.event.title,
      eventStartDate: lead.event.start_date,
      eventEndDate: lead.event.end_date,
      eventLocation: lead.event.location,
      eventDescription: lead.event.description,
      eventCategory: lead.event.category,
      organizationName: lead.organization,
      referenceNumber: lead.reference_number,
    };

    // Get appropriate email template based on inquiry type
    const emailTemplate = getEmailTemplate(lead.inquiry_type, emailData);

    // Prepare attachments (calendar invite if requested and for certain inquiry types)
    const attachments = [];
    const shouldIncludeCalendar = validatedData.includeCalendarInvite ||
                                   ['register_now', 'group_registration'].includes(lead.inquiry_type);

    if (shouldIncludeCalendar) {
      try {
        const calendarAttachment = generateCalendarAttachment(
          lead.event.title,
          lead.event.description || `Event registration for ${lead.event.title}`,
          lead.event.location,
          lead.event.start_date,
          lead.event.end_date,
          lead.email,
          lead.full_name
        );
        attachments.push(calendarAttachment);
        console.log('Calendar invite attached for:', lead.inquiry_type);
      } catch (error) {
        console.error('Error generating calendar invite:', error);
        // Continue without calendar invite rather than failing
      }
    }

    // Send email
    const emailResult = await sendEmailWithFallback({
      to: lead.email,
      subject: emailTemplate.subject,
      html: emailTemplate.html,
      text: emailTemplate.text,
      attachments: attachments.length > 0 ? attachments : undefined,
    });

    if (!emailResult.success) {
      console.error('Failed to send email:', emailResult.error);
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Failed to send email: ' + emailResult.error
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Log email activity
    try {
      await supabase.from('activities').insert({
        lead_id: lead.id,
        activity_type: 'email',
        summary: `Confirmation email sent: ${emailTemplate.subject}`,
        details: `Automated confirmation email sent based on inquiry type: ${lead.inquiry_type}`,
        logged_by: 'system',
      });
    } catch (error) {
      // Don't fail the request if activity logging fails
      console.error('Failed to log activity:', error);
    }

    console.log('Confirmation email sent successfully:', emailResult.messageId);

    return new Response(
      JSON.stringify({
        success: true,
        messageId: emailResult.messageId,
        inquiryType: lead.inquiry_type,
        calendarIncluded: shouldIncludeCalendar,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error('Error in send-confirmation-email:', error);

    if (error instanceof z.ZodError) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Validation error',
          details: error.errors,
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
};

serve(handler);
