import { redirect } from "next/navigation";
import { getCurrentUser, getUserCampaigns } from "@/lib/insforge/server";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";

const sections = ["overview", "ai-agent", "posts", "calendar", "analytics", "accounts", "settings", "campaign"];

export default async function DashboardPage({ searchParams }: { searchParams: Promise<{ campaignId?: string; view?: string }> }) {
  const user = await getCurrentUser();
  if (!user) redirect("/signin");

  const campaigns = await getUserCampaigns(user.id);
  if (!campaigns.length) redirect("/create-campaign");

  const params = await searchParams;
  const campaign = campaigns.find((item) => item.id === params.campaignId) ?? campaigns[0];
  const view = sections.includes(params.view ?? "") ? params.view! : "overview";
  const name = user.profile?.name || user.email.split("@")[0];
  const date = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    timeZone: "Asia/Jakarta",
  }).format(new Date()).toUpperCase();

  return <DashboardShell name={name} email={user.email} campaign={campaign} campaigns={campaigns} view={view} date={date} />;
}
