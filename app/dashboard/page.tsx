import { redirect } from "next/navigation";
import { signOutAction } from "@/app/actions/auth";
import { getCurrentUser, getUserCampaign } from "@/lib/insforge/server";
import Image from "next/image";
import { ArrowUpRight, Bell, CalendarDays, ChevronDown, CircleHelp, Flame, LayoutDashboard, Leaf, Megaphone, Plus, Rocket, Sparkles, Star, Users } from "lucide-react";

const campaignIcons = new Map([
  ["rocket", Rocket],
  ["sparkles", Sparkles],
  ["megaphone", Megaphone],
  ["leaf", Leaf],
  ["flame", Flame],
  ["star", Star],
]);

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/signin");
  const campaign = await getUserCampaign(user.id);
  if (!campaign) redirect("/create-campaign");

  const name = user.profile?.name || user.email.split("@")[0];
  const CampaignIcon = campaignIcons.get(campaign.icon) ?? Sparkles;

  return (
    <main className="dashboard-shell">
      <header className="dashboard-header">
        <a className="dashboard-brand" href="/dashboard"><span className="dashboard-brand-mark"><Sparkles size={17} /></span> Social Agent</a>
        <div className="dashboard-header-actions"><button className="dashboard-icon-button" aria-label="Notifications" type="button"><Bell size={17} /></button><button className="dashboard-help-button" type="button"><CircleHelp size={16} /> Help</button><form action={signOutAction}><button className="dashboard-signout" type="submit">Sign out</button></form></div>
      </header>
      <div className="dashboard-layout">
        <aside className="dashboard-sidebar">
          <p className="dashboard-sidebar-label">WORKSPACE</p>
          <a className="dashboard-nav-item is-active" href="/dashboard"><LayoutDashboard size={17} /> Overview</a>
          <div className="dashboard-sidebar-bottom"><div className="dashboard-user"><span>{name.slice(0, 1).toUpperCase()}</span><div><b>{name}</b><small>{user.email}</small></div><ChevronDown size={15} /></div></div>
        </aside>
        <section className="dashboard-content">
          <div className="dashboard-welcome-row"><div><p className="dashboard-eyebrow">YOUR WORKSPACE</p><h1>Good morning, {name.split(" ")[0]}</h1><p className="dashboard-subtitle">Here’s what’s happening with your social presence.</p></div><button className="dashboard-create-button" type="button"><Plus size={17} /> Create a post</button></div>
          <div className="dashboard-campaign-card"><div className="dashboard-campaign-copy"><span className="dashboard-campaign-icon">{campaign.icon.startsWith("data:") ? <img alt="" src={campaign.icon} /> : <CampaignIcon size={21} />}</span><div><small>ACTIVE CAMPAIGN</small><h2>{campaign.name}</h2><p>Your creative workspace is ready for its first idea.</p></div></div><div className="dashboard-office-thumb"><Image alt="Selected AI Agent Office" fill sizes="220px" src={campaign.office} /></div></div>
          <div className="dashboard-section-heading"><div><h2>Workspace overview</h2><p>Your social team, ready when you are.</p></div><button type="button">This week <ChevronDown size={14} /></button></div>
          <div className="dashboard-metrics"><article><span className="dashboard-metric-icon blue"><CalendarDays size={17} /></span><small>Scheduled posts</small><b>—</b><p>Nothing scheduled yet</p></article><article><span className="dashboard-metric-icon green"><Users size={17} /></span><small>Channels connected</small><b>0</b><p>Connect a channel to begin</p></article><article><span className="dashboard-metric-icon violet"><Sparkles size={17} /></span><small>AI team activity</small><b>Ready</b><p>Your agents are standing by</p></article></div>
          <div className="dashboard-empty-card"><span className="dashboard-empty-sparkle"><Sparkles size={20} /></span><div><b>Your next great post starts here</b><p>Connect a social channel or invite your AI team to start planning.</p></div><button type="button">Explore your AI team <ArrowUpRight size={15} /></button></div>
        </section>
      </div>
    </main>
  );
}
