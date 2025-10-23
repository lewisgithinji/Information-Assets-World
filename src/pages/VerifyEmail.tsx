import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const token = searchParams.get("token");

    if (!token) {
      setStatus("error");
      setMessage("Invalid verification link. Please check your email and try again.");
      return;
    }

    verifyEmail(token);
  }, [searchParams]);

  const verifyEmail = async (token: string) => {
    try {
      // Find the lead with this verification token
      const { data: lead, error: findError } = await supabase
        .from("leads")
        .select("id, email, verified, reference_number")
        .eq("verification_token", token)
        .single();

      if (findError || !lead) {
        throw new Error("Invalid or expired verification token");
      }

      if (lead.verified) {
        setStatus("success");
        setMessage("Your email has already been verified. Thank you!");
        return;
      }

      // Update the lead to mark as verified
      const { error: updateError } = await supabase
        .from("leads")
        .update({ 
          verified: true,
          verification_token: null, // Clear the token after use
        })
        .eq("id", lead.id);

      if (updateError) throw updateError;

      // Log the verification activity
      await supabase.from("activities").insert([{
        lead_id: lead.id,
        activity_type: "note",
        summary: "Email Verified",
        details: `Lead verified their email address successfully.`,
      }]);

      setStatus("success");
      setMessage(`Email verified successfully! Your reference number is: ${lead.reference_number}`);
    } catch (error: any) {
      console.error("Email verification error:", error);
      setStatus("error");
      setMessage(error.message || "Failed to verify email. The link may be invalid or expired.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      
      <main className="flex-grow container mx-auto px-4 py-16">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Email Verification</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            {status === "loading" && (
              <>
                <Loader2 className="w-16 h-16 mx-auto animate-spin text-primary" />
                <p className="text-muted-foreground">Verifying your email...</p>
              </>
            )}

            {status === "success" && (
              <>
                <CheckCircle className="w-16 h-16 mx-auto text-green-500" />
                <p className="text-lg font-medium">{message}</p>
                <p className="text-sm text-muted-foreground">
                  Our team will contact you shortly to discuss your training needs.
                </p>
              </>
            )}

            {status === "error" && (
              <>
                <XCircle className="w-16 h-16 mx-auto text-destructive" />
                <p className="text-lg font-medium text-destructive">{message}</p>
                <p className="text-sm text-muted-foreground">
                  If you continue to experience issues, please contact our support team.
                </p>
              </>
            )}

            <div className="pt-4">
              <Button onClick={() => navigate("/")} variant="outline">
                Return to Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
}
