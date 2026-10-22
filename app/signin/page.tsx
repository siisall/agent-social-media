import { redirect } from "next/navigation";
import { AuthForm } from "@/components/auth/auth-form";
import { getCurrentUser, getUserCampaign } from "@/lib/insforge/server";

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const user = await getCurrentUser();
  if (user) redirect((await getUserCampaign(user.id)) ? "/dashboard" : "/create-campaign");
  const { error } = await searchParams;

  return <AuthForm mode="signin" googleError={error === "google"} />;
}
