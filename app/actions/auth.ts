"use server";

import { createAuthActions } from "@insforge/sdk/ssr";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getInsForgeServerClient } from "@/lib/insforge/server";

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

export async function resendSignupVerificationEmailAction(email: string): Promise<{ error?: string }> {
  const normalizedEmail = email.trim().toLowerCase();
  if (!normalizedEmail) return { error: "Enter a valid email address and try again." };

  const insforge = await getInsForgeServerClient();
  const result = await insforge.auth.resendVerificationEmail({
    email: normalizedEmail,
    redirectTo: `${getAppUrl()}/signin`,
  });

  if (result.error) return { error: result.error.message };
  return {};
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

export async function createCampaignAction(formData: FormData): Promise<{ error?: string; campaignId?: string }> {
  const name = String(formData.get("name") || "").trim();
  const icon = String(formData.get("icon") || "");
  const office = String(formData.get("office") || "");
  const offices = ["/offices/modern-office.png", "/offices/wooden-office.png"];
  if (!name || name.length > 80) return { error: "Enter a campaign name between 1 and 80 characters." };
  if (!icon || icon.length > 900_000) return { error: "Choose an icon or upload an image under 650 KB." };
  if (!offices.includes(office)) return { error: "Choose an AI Agent Office to continue." };

  const insforge = await getInsForgeServerClient();
  const { data: userData, error: userError } = await insforge.auth.getCurrentUser();
  if (userError || !userData.user) return { error: "Your session expired. Sign in again to create a campaign." };

  const { data: created, error } = await insforge.database.from("campaign").insert([{
    user_id: userData.user.id,
    name,
    icon,
    office,
  }]).select("id");
  if (error) return { error: error.message };
  return { campaignId: created?.[0]?.id };
}

export async function updateCampaignAction(formData: FormData): Promise<{ error?: string }> {
  const id = String(formData.get("id") || "");
  const name = String(formData.get("name") || "").trim();
  const icon = String(formData.get("icon") || "");
  const office = String(formData.get("office") || "");
  const offices = ["/offices/modern-office.png", "/offices/wooden-office.png"];
  if (!id || !name || name.length > 80) return { error: "Enter a campaign name between 1 and 80 characters." };
  if (!icon || icon.length > 900_000) return { error: "Choose a valid campaign icon." };
  if (!offices.includes(office)) return { error: "Choose an AI Agent Office to continue." };

  const insforge = await getInsForgeServerClient();
  const { data: userData, error: userError } = await insforge.auth.getCurrentUser();
  if (userError || !userData.user) return { error: "Your session expired. Sign in again." };

  const { error } = await insforge.database.from("campaign").update({ name, icon, office }).eq("id", id).eq("user_id", userData.user.id);
  if (error) return { error: error.message };
  return {};
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
