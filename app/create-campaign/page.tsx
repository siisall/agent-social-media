import { redirect } from "next/navigation";
import { CampaignSetup } from "@/components/campaign/campaign-setup";
import { getCurrentUser } from "@/lib/insforge/server";

export default async function CreateCampaignPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/signin");
  return <CampaignSetup />;
}
