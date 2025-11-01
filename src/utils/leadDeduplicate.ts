import { supabase } from "@/integrations/supabase/client";

export interface DuplicateLeadCheck {
  isDuplicate: boolean;
  existingLead?: {
    id: string;
    reference_number: string;
    full_name: string;
    email: string;
    created_at: string;
    status: string;
  };
}

/**
 * Check if a lead with the same email already exists
 * @param email - Email address to check
 * @returns DuplicateLeadCheck object with duplicate status and existing lead details
 */
export async function checkDuplicateLead(email: string): Promise<DuplicateLeadCheck> {
  try {
    const { data, error } = await supabase
      .from("leads")
      .select("id, reference_number, full_name, email, created_at, status")
      .eq("email", email.toLowerCase().trim())
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (error) {
      // If error is "PGRST116" (no rows returned), it's not a duplicate
      if (error.code === "PGRST116") {
        return { isDuplicate: false };
      }
      // For other errors, log and return not duplicate to allow submission
      console.error("Error checking for duplicate lead:", error);
      return { isDuplicate: false };
    }

    if (data) {
      return {
        isDuplicate: true,
        existingLead: data,
      };
    }

    return { isDuplicate: false };
  } catch (error) {
    console.error("Unexpected error checking for duplicate lead:", error);
    return { isDuplicate: false };
  }
}

/**
 * Format the duplicate lead message for display
 * @param existingLead - Existing lead data
 * @returns Formatted message string
 */
export function formatDuplicateMessage(existingLead: DuplicateLeadCheck["existingLead"]): string {
  if (!existingLead) return "";

  const createdDate = new Date(existingLead.created_at).toLocaleDateString();
  return `A lead with this email already exists (Reference: ${existingLead.reference_number}, submitted on ${createdDate}, current status: ${existingLead.status}). If you need to update your information, please contact us directly.`;
}
