import { redirect } from "next/navigation";
import { AuthForm } from "@/components/auth/auth-form";
import { getCurrentUser, getUserCampaign } from "@/lib/insforge/server";

export default async function SignUpPage() {
  const user = await getCurrentUser();
  if (user) redirect((await getUserCampaign(user.id)) ? "/dashboard" : "/create-campaign");
  return <AuthForm mode="signup" />;
}
