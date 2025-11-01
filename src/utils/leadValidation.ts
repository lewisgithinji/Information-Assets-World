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

  training_interest: z.string()
    .min(1, "Please select a training interest"),

  source: z.string().optional(),

  message: z.string()
    .min(10, "Please provide more details (at least 10 characters)")
    .max(1000, "Message must be less than 1000 characters"),
});

export type LeadFormData = z.infer<typeof leadFormSchema>;
