import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Validation schema
const leadSchema = z.object({
  full_name: z.string().min(2).max(100).regex(/^[a-zA-Z\s'-]+$/),
  email: z.string().email().max(255),
  phone: z.string().min(10).max(20),
  organization: z.string().min(2).max(200),
  country: z.string().min(1),
  training_interest: z.string().min(1),
  source: z.string().optional(),
  message: z.string().max(1000).optional(),
  captchaToken: z.string().min(1),
  // Honeypot fields - should be empty
  website: z.string().max(0).optional(),
  company_name: z.string().max(0).optional(),
});

interface SubmitLeadRequest extends z.infer<typeof leadSchema> {}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Get client IP address
    const clientIp = req.headers.get("x-forwarded-for")?.split(",")[0] || 
                     req.headers.get("x-real-ip") || 
                     "unknown";

    console.log("Lead submission request from IP:", clientIp);

    const requestData: SubmitLeadRequest = await req.json();

    // 1. HONEYPOT CHECK - Reject if honeypot fields are filled
    if (requestData.website || requestData.company_name) {
      console.log("Bot detected - honeypot triggered");
      return new Response(
        JSON.stringify({ error: "Invalid submission" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 2. VALIDATE INPUT
    const validatedData = leadSchema.parse(requestData);

    // 3. VERIFY CAPTCHA
    const turnstileResponse = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          secret: Deno.env.get("TURNSTILE_SECRET_KEY"),
          response: validatedData.captchaToken,
          remoteip: clientIp,
        }),
      }
    );

    const turnstileResult = await turnstileResponse.json();
    
    if (!turnstileResult.success) {
      console.log("CAPTCHA verification failed:", turnstileResult);
      return new Response(
        JSON.stringify({ error: "CAPTCHA verification failed" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("CAPTCHA verified successfully");

    // 4. RATE LIMITING - Check submissions from this IP in the last hour
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    
    const { data: recentSubmissions, error: rateCheckError } = await supabase
      .from("lead_submissions")
      .select("id")
      .eq("ip_address", clientIp)
      .gte("submitted_at", oneHourAgo);

    if (rateCheckError) {
      console.error("Rate limit check error:", rateCheckError);
      throw rateCheckError;
    }

    if (recentSubmissions && recentSubmissions.length >= 3) {
      console.log("Rate limit exceeded for IP:", clientIp);
      return new Response(
        JSON.stringify({ 
          error: "Too many submissions. Please try again later." 
        }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Rate limit check passed");

    // 5. GENERATE VERIFICATION TOKEN
    const verificationToken = crypto.randomUUID();

    // 6. INSERT LEAD
    const { data: lead, error: insertError } = await supabase
      .from("leads")
      .insert([{
        full_name: validatedData.full_name,
        email: validatedData.email,
        phone: validatedData.phone,
        organization: validatedData.organization,
        country: validatedData.country,
        training_interest: validatedData.training_interest,
        source: validatedData.source || "Website",
        message: validatedData.message,
        status: "new",
        verified: false,
        verification_token: verificationToken,
        verification_sent_at: new Date().toISOString(),
      }])
      .select()
      .single();

    if (insertError) {
      console.error("Lead insert error:", insertError);
      throw insertError;
    }

    console.log("Lead created successfully:", lead.id);

    // 7. LOG IP SUBMISSION
    const { error: submissionLogError } = await supabase
      .from("lead_submissions")
      .insert([{
        ip_address: clientIp,
        lead_id: lead.id,
      }]);

    if (submissionLogError) {
      console.error("Failed to log submission:", submissionLogError);
      // Don't throw - submission was successful
    }

    // 8. LOG ACTIVITY
    await supabase.from("activities").insert([{
      lead_id: lead.id,
      activity_type: "note",
      summary: "Lead Created via Website Form",
      details: `Lead submitted from website inquiry form. Training interest: ${validatedData.training_interest}. IP: ${clientIp}`,
    }]);

    // 9. SEND CONFIRMATION EMAIL WITH VERIFICATION LINK
    try {
      const verificationUrl = `${req.headers.get("origin") || "https://rimea-training.lovable.app"}/verify-email?token=${verificationToken}`;
      
      await supabase.functions.invoke("send-lead-confirmation", {
        body: {
          fullName: validatedData.full_name,
          email: validatedData.email,
          trainingInterest: validatedData.training_interest,
          referenceNumber: lead.reference_number,
          verificationUrl,
        },
      });
      
      console.log("Confirmation email sent successfully");
    } catch (emailError) {
      console.error("Failed to send confirmation email:", emailError);
      // Don't throw - submission was successful
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        referenceNumber: lead.reference_number,
        message: "Please check your email to verify your submission."
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );

  } catch (error: any) {
    console.error("Error in submit-lead function:", error);
    
    if (error instanceof z.ZodError) {
      return new Response(
        JSON.stringify({ 
          error: "Invalid input data",
          details: error.errors 
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
};

serve(handler);
