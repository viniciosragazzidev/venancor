import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { betterAuth } from "better-auth/minimal";
import { nextCookies } from "better-auth/next-js";

import { db } from "@/db/client";
import * as schema from "@/db/schema";

export const auth = betterAuth({
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL,
  database: drizzleAdapter(db, { provider: "pg", schema }),
  emailAndPassword: { enabled: true, disableSignUp: true },
  rateLimit: {
    enabled: true,
    storage: "database",
    customRules: { "/sign-in/email": { window: 60, max: 5 } },
  },
  advanced: { database: { joins: true } },
  plugins: [nextCookies()],
});
