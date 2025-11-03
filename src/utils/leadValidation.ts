import { z } from 'zod';

export const leadFormSchema = z.object({
  full_name: z.string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be less than 100 characters")
    .regex(/^[a-zA-Z\s'-]+$/, "Name contains invalid characters"),
  
  email: z.string()
    .email("Invalid email address")
    .max(255, "Email must be less than 255 characters"),
  
  phone: z.string()
    .min(10, "Phone number is too short")
    .max(20, "Phone number is too long")
    .regex(/^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/, "Invalid phone format"),

  organization: z.string()
    .min(2, "Organization name is required")
    .max(200, "Organization name is too long"),

  country: z.string()
    .min(1, "Please select a country"),

  // New: Event ID replaces training_interest
  event_id: z.string()
    .uuid("Please select an event"),

  // New: Inquiry type dropdown
  inquiry_type: z.enum([
    'send_writeup',
    'contact_discuss',
    'group_registration',
    'corporate_training',
    'register_now',
    'just_browsing',
  ], {
    errorMap: () => ({ message: "Please select what you'd like us to do" })
  }),

  source: z.string().optional(),

  // Message is now optional (max 500 chars)
  message: z.string()
    .max(500, "Message must be less than 500 characters")
    .optional(),
});

export type LeadFormData = z.infer<typeof leadFormSchema>;
