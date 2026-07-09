import { betterAuth } from "better-auth";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false // Required for Neon serverless postgres ssl connections
  }
});

export const auth = betterAuth({
  database: pool,
  emailAndPassword: {
    enabled: true,
  },
  // Ensure that the domain is trusted
  trustedOrigins: [
    "http://localhost:3000",
    "http://crm.localhost:3000",
    "https://crm.localhost:3000",
    "https://venacorseguros.com",
    "https://www.venacorseguros.com",
    "https://crm.venacorseguros.com",
    "http://venacorseguros.com",
    "http://www.venacorseguros.com",
    "http://crm.venacorseguros.com"
  ],
});
