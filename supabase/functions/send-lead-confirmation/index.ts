import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import React from "npm:react@18.3.1";
import { Resend } from "npm:resend@4.0.0";
import { renderAsync } from "npm:@react-email/components@0.0.22";
import ConfirmationEmail from "./_templates/ConfirmationEmail.tsx";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface LeadConfirmationRequest {
  fullName: string;
  email: string;
  trainingInterest: string;
  referenceNumber: string;
  verificationUrl?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Processing lead confirmation email request");

    const { fullName, email, trainingInterest, referenceNumber, verificationUrl }: LeadConfirmationRequest = await req.json();

    console.log(`Sending confirmation to ${email} for ${trainingInterest}`);

    // Render the React Email template
    const emailHtml = await renderAsync(
      React.createElement(ConfirmationEmail, {
        fullName,
        trainingInterest,
        referenceNumber,
        verificationUrl,
      })
    );

    // Send email via Resend
    const emailResponse = await resend.emails.send({
      from: "RIMEA Training <training@rimeastafrica.org>",
      to: [email],
      subject: "Thank you for your interest - RIMEA Training",
      html: emailHtml,
    });

    if (emailResponse.error) {
      console.error("Resend API error:", emailResponse.error);
      throw emailResponse.error;
    }

    console.log("Email sent successfully:", emailResponse.data);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Confirmation email sent",
        data: emailResponse.data 
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (error: any) {
    console.error("Error in send-lead-confirmation function:", error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message || "Failed to send confirmation email",
        details: error.toString()
      }),
      {
        status: 500,
        headers: { 
          "Content-Type": "application/json",
          ...corsHeaders 
        },
      }
    );
  }
};

serve(handler);
