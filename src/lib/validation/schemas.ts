import { z } from "zod";

/**
 * Zod schemas — the single source of validation truth, shared by React Hook Form
 * (client) and the service/route-handler layer (server). Validating on both sides
 * is defense in depth: never trust client input.
 */

export const LoginSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  remember: z.boolean().optional(),
});
export type LoginInput = z.infer<typeof LoginSchema>;

export const RegisterSchema = z
  .object({
    name: z.string().min(2, "Enter your full name"),
    email: z.string().email("Enter a valid email address"),
    company: z.string().min(2, "Enter your company name"),
    password: z
      .string()
      .min(8, "Use at least 8 characters")
      .regex(/[A-Z]/, "Include an uppercase letter")
      .regex(/[0-9]/, "Include a number"),
    confirmPassword: z.string(),
    acceptTerms: z.literal(true, {
      message: "You must accept the terms to continue",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });
export type RegisterInput = z.infer<typeof RegisterSchema>;

export const ForgotPasswordSchema = z.object({
  email: z.string().email("Enter a valid email address"),
});
export type ForgotPasswordInput = z.infer<typeof ForgotPasswordSchema>;

export const CustomerCreateSchema = z.object({
  name: z.string().min(2, "Company name is required"),
  contactName: z.string().min(2, "Contact name is required"),
  email: z.string().email("Enter a valid email address"),
  phone: z.string().min(7, "Enter a valid phone number"),
  industry: z.string().min(2, "Industry is required"),
  tier: z.enum(["enterprise", "business", "startup"]),
  status: z.enum(["active", "prospect", "on_hold", "churned"]),
  mrr: z.number({ message: "Enter a valid amount" }).min(0, "MRR cannot be negative"),
});
export type CustomerCreateInput = z.infer<typeof CustomerCreateSchema>;

export const ProjectCreateSchema = z.object({
  name: z.string().min(2, "Project name is required"),
  customerId: z.string().min(1, "Select a customer"),
  status: z.enum(["planning", "active", "on_hold", "completed", "cancelled"]),
  priority: z.enum(["low", "medium", "high", "critical"]),
  budget: z
    .number({ message: "Enter a valid amount" })
    .min(0, "Budget cannot be negative"),
  dueDate: z.string().min(1, "Due date is required"),
});
export type ProjectCreateInput = z.infer<typeof ProjectCreateSchema>;

export const InvoiceCreateSchema = z.object({
  customerId: z.string().min(1, "Select a customer"),
  amount: z
    .number({ message: "Enter a valid amount" })
    .positive("Amount must be greater than zero"),
  status: z.enum(["draft", "sent", "paid", "overdue", "void"]),
  dueAt: z.string().min(1, "Due date is required"),
});
export type InvoiceCreateInput = z.infer<typeof InvoiceCreateSchema>;

export const ProfileUpdateSchema = z.object({
  name: z.string().min(2, "Enter your full name"),
  title: z.string().min(2, "Enter your job title"),
  department: z.string().min(2, "Enter your department"),
});
export type ProfileUpdateInput = z.infer<typeof ProfileUpdateSchema>;

export const SettingsSchema = z.object({
  organizationName: z.string().min(2, "Organization name is required"),
  timezone: z.string().min(1, "Select a timezone"),
  weeklyDigest: z.boolean(),
  securityAlerts: z.boolean(),
  twoFactor: z.boolean(),
});
export type SettingsInput = z.infer<typeof SettingsSchema>;
