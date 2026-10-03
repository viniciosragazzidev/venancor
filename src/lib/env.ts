import { z } from "zod";

const schema = z.object({
  DATABASE_URL: z.url(),
  BETTER_AUTH_SECRET: z.string().min(32).optional(),
  OTP_SECRET: z.string().min(32).optional(),
  BETTER_AUTH_URL: z.url().optional(),
  APP_URL: z.url().optional(),
  ADMIN_EMAIL: z.email().optional(),
  ADMIN_PASSWORD: z.string().min(12).optional(),
  PAYMENT_PROVIDER: z.enum(["fake", "asaas"]).default("fake"),
  MESSAGING_PROVIDER: z.enum(["fake", "meta"]).default("fake"),
  SIGNATURE_PROVIDER: z.literal("inhouse").default("inhouse"),
  STORAGE_DRIVER: z
    .enum(["local", "supabase"])
    .default(process.env.NODE_ENV === "production" ? "supabase" : "local"),
  ASAAS_API_KEY: z.string().optional(),
  ASAAS_ENV: z.enum(["sandbox", "production"]).default("sandbox"),
  ASAAS_WEBHOOK_TOKEN: z.string().optional(),
  META_ACCESS_TOKEN: z.string().optional(),
  META_PHONE_NUMBER_ID: z.string().optional(),
  META_GRAPH_VERSION: z.string().optional(),
  META_VERIFY_TOKEN: z.string().optional(),
  META_APP_SECRET: z.string().optional(),
  SUPABASE_URL: z.url().optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),
  RESEND_API_KEY: z.string().optional(),
  RESEND_FROM_EMAIL: z.email().optional(),
  WEBHOOK_SECRET_TOKEN: z.string().optional(),
  NEXT_PUBLIC_MODO_TESTE: z.enum(["true", "false"]).default("false"),
});

export type ServerEnv = z.infer<typeof schema>;
export function getServerEnv(): ServerEnv {
  return schema.parse(process.env);
}
