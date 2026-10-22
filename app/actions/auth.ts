"use server";

import { createAuthActions } from "@insforge/sdk/ssr";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

type AuthActionResult =
  | { error: string; needsVerification?: never; email?: never; authenticated?: never }
  | { error?: never; needsVerification: true; email: string; authenticated?: never }
  | { error?: never; authenticated: true; needsVerification?: never; email?: never };

type VerificationActionResult =
  | { error: string; authenticated?: never }
  | { error?: never; authenticated: true };

function getAppUrl() {
  return (process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000").replace(/\/$/, "");
}

export async function signUpAction(formData: FormData): Promise<AuthActionResult> {
  const name = String(formData.get("name") || "").trim();
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");

  if (!name || !email || password.length < 6) {
    return { error: "Enter your name, a valid email, and a password with at least 6 characters." };
  }

  const auth = createAuthActions({ cookies: await cookies() });
  const { data, error } = await auth.signUp({ email, password, name });

  if (error) return { error: error.message };
  if (data?.requireEmailVerification) {
    return { needsVerification: true, email };
  }
  if (!data?.user) return { error: "We couldn't create your account. Please try again." };

  return { authenticated: true };
}

export async function verifySignupEmailAction(email: string, otp: string): Promise<VerificationActionResult> {
  const auth = createAuthActions({ cookies: await cookies() });
  const { data, error } = await auth.verifyEmail({ email, otp });

  if (error) return { error: error.message };
  if (!data?.user) return { error: "We couldn't verify your email. Request a new code and try again." };

  return { authenticated: true };
}

export async function signInAction(formData: FormData): Promise<AuthActionResult> {
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");

  if (!email || !password) return { error: "Enter your email and password." };

  const auth = createAuthActions({ cookies: await cookies() });
  const { data, error } = await auth.signInWithPassword({ email, password });

  if (error) {
    return {
      error:
        error.statusCode === 403
          ? "Verify your email before signing in."
          : error.message,
    };
  }
  if (!data?.user) return { error: "We couldn't sign you in. Please try again." };

  return { authenticated: true };
}

export async function startGoogleOAuth() {
  const cookieStore = await cookies();
  const auth = createAuthActions({ cookies: cookieStore });
  const { data, error } = await auth.signInWithOAuth("google", {
    redirectTo: `${getAppUrl()}/api/auth/callback`,
    skipBrowserRedirect: true,
    additionalParams: { prompt: "select_account" },
  });

  if (error || !data.url || !data.codeVerifier) {
    redirect("/signin?error=google");
  }

  cookieStore.set("insforge_code_verifier", data.codeVerifier, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 600,
  });

  redirect(data.url);
}

export async function signOutAction() {
  const auth = createAuthActions({ cookies: await cookies() });
  await auth.signOut();
  redirect("/signin");
}
