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
