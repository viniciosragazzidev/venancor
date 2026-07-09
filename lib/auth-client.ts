import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  // baseURL is auto-detected on client side if not provided
});

export const { signIn, signUp, signOut, useSession } = authClient;
