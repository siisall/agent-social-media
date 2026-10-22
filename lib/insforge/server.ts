import { createServerClient } from "@insforge/sdk/ssr";
import { cookies } from "next/headers";

export async function getInsForgeServerClient() {
  return createServerClient({ cookies: await cookies() });
}

export async function getCurrentUser() {
  const insforge = await getInsForgeServerClient();
  const { data, error } = await insforge.auth.getCurrentUser();

  return error ? null : data.user;
}


export async function getUserCampaign(userId: string) {
  const insforge = await getInsForgeServerClient();
  const { data, error } = await insforge.database
    .from("campaign")
    .select("id, name, icon, office, created_at")
    .eq("user_id", userId)
    .limit(1);

  if (error) throw new Error(`Unable to load campaign: ${error.message}`);
  return data?.[0] ?? null;
}

export async function getUserCampaigns(userId: string) {
  const insforge = await getInsForgeServerClient();
  const { data, error } = await insforge.database
    .from("campaign")
    .select("id, name, icon, office, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: true });

  if (error) throw new Error(`Unable to load campaigns: ${error.message}`);
  return data ?? [];
}
