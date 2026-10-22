"use client";

import { CSSProperties, FormEvent, useEffect, useState, useTransition } from "react";
import Image from "next/image";
import { signOutAction, updateCampaignAction } from "@/app/actions/auth";
import { ArrowUpRight, Bell, BarChart3, Bot, CalendarDays, Check, ChevronDown, CircleHelp, FileText, LayoutDashboard, LogOut, Menu, Pencil, Plus, Settings2, Sparkles, Users, X } from "lucide-react";

type Campaign = { id: string; name: string; icon: string; office: string };
type Props = { name: string; email: string; campaign: Campaign; campaigns: Campaign[]; view: string; date: string };
const navigation = [
  { label: "Overview", icon: LayoutDashboard, color: "blue", active: true },
  { label: "AI Agent", icon: Bot, color: "violet" },
  { label: "Posts", icon: FileText, color: "coral" },
  { label: "Calendar", icon: CalendarDays, color: "amber" },
  { label: "Analytics", icon: BarChart3, color: "green" },
  { label: "Accounts", icon: Users, color: "pink" },
];

const sectionTitles: Record<string, string> = { overview: "Overview", "ai-agent": "AI Agent", posts: "Posts", calendar: "Calendar", analytics: "Analytics", accounts: "Accounts", settings: "Settings", campaign: "Campaign" };

export function DashboardShell({ name, email, campaign, campaigns, view, date }: Props) {
  const [collapsed, setCollapsed] = useState(true);
  const [campaignMenuOpen, setCampaignMenuOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [editCampaignOpen, setEditCampaignOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);
  const [campaignError, setCampaignError] = useState("");
  const [campaignPending, startCampaignUpdate] = useTransition();
  const [accent, setAccent] = useState("#6258e5");
  const [darkMode, setDarkMode] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [period, setPeriod] = useState("This week");
  const firstName = name.split(" ")[0];
  const campaignQuery = `campaignId=${encodeURIComponent(campaign.id)}`;
  const sectionHref = (section: string) => `/dashboard?${campaignQuery}&view=${section}`;

  useEffect(() => {
    const preferences = window.localStorage.getItem("social-agent-preferences");
    if (!preferences) return;
    try {
      const saved = JSON.parse(preferences) as { accent?: string; darkMode?: boolean; reducedMotion?: boolean };
      if (saved.accent) setAccent(saved.accent);
      if (typeof saved.darkMode === "boolean") setDarkMode(saved.darkMode);
      if (typeof saved.reducedMotion === "boolean") setReducedMotion(saved.reducedMotion);
    } catch { window.localStorage.removeItem("social-agent-preferences"); }
  }, []);

  function savePreferences(next: Partial<{ accent: string; darkMode: boolean; reducedMotion: boolean }>) {
    const current = { accent, darkMode, reducedMotion, ...next };
    window.localStorage.setItem("social-agent-preferences", JSON.stringify(current));
    if (next.accent) setAccent(next.accent);
    if (typeof next.darkMode === "boolean") setDarkMode(next.darkMode);
    if (typeof next.reducedMotion === "boolean") setReducedMotion(next.reducedMotion);
  }

  function saveCampaign(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setCampaignError("");
    const formData = new FormData(event.currentTarget);
    startCampaignUpdate(async () => {
      const result = await updateCampaignAction(formData);
      if (result.error) setCampaignError(result.error);
      else window.location.reload();
    });
  }

  return (
    <main className={`workspace ${collapsed ? "is-collapsed" : ""} ${darkMode ? "workspace-dark" : ""} ${reducedMotion ? "workspace-reduced-motion" : ""}`} style={{ "--workspace-accent": accent } as CSSProperties}>
      <aside className="workspace-sidebar">
        <a className="workspace-logo" href="/dashboard" aria-label="Social Agent home"><span className="workspace-logo-mark"><Sparkles size={19} /></span><span className="workspace-logo-copy">social<span>agent</span><small>STUDIO</small></span></a>
        <div className="workspace-campaign-wrap">
          <button className="workspace-campaign" type="button" aria-expanded={campaignMenuOpen} onClick={() => setCampaignMenuOpen(!campaignMenuOpen)}>
            <span className="workspace-campaign-icon">{campaign.icon.startsWith("data:") ? <img src={campaign.icon} alt="" /> : <Sparkles size={16} />}</span><span className="workspace-campaign-copy"><small>YOUR CAMPAIGN</small><b>{campaign.name}</b></span><ChevronDown className="workspace-campaign-chevron" size={15} />
          </button>
          {campaignMenuOpen && <div className="workspace-campaign-menu"><span className="workspace-menu-label">CAMPAIGNS</span>{campaigns.map((item) => <div className="workspace-campaign-option-row" key={item.id}><a href={`/dashboard?campaignId=${encodeURIComponent(item.id)}&view=${view}`} className={`workspace-campaign-option ${item.id === campaign.id ? "is-selected" : ""}`}><span className="workspace-option-dot">{item.icon.startsWith("data:") ? <img src={item.icon} alt="" /> : <Sparkles size={14} />}</span><span>{item.name}</span>{item.id === campaign.id && <Check size={15} />}</a><button className="workspace-edit-campaign" type="button" aria-label={`Edit ${item.name}`} title={`Edit ${item.name}`} onClick={() => { setEditingCampaign(item); setEditCampaignOpen(true); setCampaignMenuOpen(false); setCampaignError(""); }}><Pencil size={13} /></button></div>)}<a href="/create-campaign" className="workspace-create-campaign"><Plus size={15} /> Create new campaign</a></div>}
        </div>
        <div className="workspace-nav-heading">WORKSPACE</div>
        <nav className="workspace-nav" aria-label="Main navigation">{navigation.map(({ label, icon: Icon, color }) => { const section = label.toLowerCase().replace(" ", "-"); return <a key={label} href={sectionHref(section)} className={`workspace-nav-link ${view === section ? "is-active" : ""}`} title={collapsed ? label : undefined}><span className={`workspace-nav-icon icon-${color}`}><Icon size={17} strokeWidth={2} /></span><span className="workspace-nav-label">{label}</span>{view === section && <span className="workspace-active-dot" />}</a>; })}</nav>
        <div className="workspace-sidebar-bottom"><button type="button" onClick={() => setSettingsOpen(!settingsOpen)} className={`workspace-nav-link workspace-settings-trigger ${settingsOpen ? "is-active" : ""}`} title={collapsed ? "Settings" : undefined}><span className="workspace-nav-icon icon-slate"><Settings2 size={17} /></span><span className="workspace-nav-label">Settings</span><ChevronDown className="workspace-settings-chevron" size={13} /></button>{settingsOpen && <div className="workspace-settings-menu"><b>Workspace settings</b><div className="workspace-setting-row"><span>Accent color</span><span className="workspace-accent-options"><button type="button" aria-label="Purple accent" aria-pressed={accent === "#6258e5"} style={{ background: "#6258e5" }} onClick={() => savePreferences({ accent: "#6258e5" })} /><button type="button" aria-label="Blue accent" aria-pressed={accent === "#3287e8"} style={{ background: "#3287e8" }} onClick={() => savePreferences({ accent: "#3287e8" })} /><button type="button" aria-label="Coral accent" aria-pressed={accent === "#e87969"} style={{ background: "#e87969" }} onClick={() => savePreferences({ accent: "#e87969" })} /></span></div><label className="workspace-setting-row">Dark appearance<input type="checkbox" checked={darkMode} onChange={(event) => savePreferences({ darkMode: event.target.checked })} /></label><label className="workspace-setting-row">Reduce motion<input type="checkbox" checked={reducedMotion} onChange={(event) => savePreferences({ reducedMotion: event.target.checked })} /></label><button className="workspace-settings-done" type="button" onClick={() => setSettingsOpen(false)}>Done</button></div>}<div className="workspace-sidebar-divider" /><div className="workspace-profile"><span className="workspace-avatar">{firstName.slice(0, 1).toUpperCase()}</span><span className="workspace-profile-copy"><b>{name}</b><small>{email}</small></span><form action={signOutAction}><button type="submit" className="workspace-signout" title="Sign out"><LogOut size={15} /></button></form></div></div>
      </aside>
      <section className="workspace-main">
        <header className="workspace-header"><button className="workspace-collapse-button" type="button" aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"} onClick={() => setCollapsed(!collapsed)}>{collapsed ? <Menu size={18} /> : <X size={18} />}</button><div className="workspace-breadcrumb"><span>Workspace</span><span className="workspace-breadcrumb-slash">/</span><b>{sectionTitles[view]}</b></div><div className="workspace-header-actions"><span className="workspace-status"><i /> All systems operational</span><div className="workspace-header-popover-wrap"><button className="workspace-header-icon" type="button" aria-expanded={helpOpen} aria-label="Help" onClick={() => { setHelpOpen(!helpOpen); setNotificationsOpen(false); setAccountOpen(false); }}><CircleHelp size={17} /></button>{helpOpen && <div className="workspace-header-popover"><b>Need a hand?</b><p>Help and support resources will be available here.</p></div>}</div><div className="workspace-header-popover-wrap"><button className="workspace-header-icon workspace-notification" type="button" aria-expanded={notificationsOpen} aria-label="Notifications" onClick={() => { setNotificationsOpen(!notificationsOpen); setHelpOpen(false); setAccountOpen(false); }}><Bell size={17} /><i /></button>{notificationsOpen && <div className="workspace-header-popover"><b>Notifications</b><p>You’re all caught up. New updates will appear here.</p></div>}</div><div className="workspace-header-popover-wrap"><button className="workspace-header-avatar" type="button" aria-label="Account menu" aria-expanded={accountOpen} onClick={() => { setAccountOpen(!accountOpen); setHelpOpen(false); setNotificationsOpen(false); }}>{firstName.slice(0, 1).toUpperCase()}</button>{accountOpen && <div className="workspace-account-menu"><div className="workspace-account-summary"><span className="workspace-avatar">{firstName.slice(0, 1).toUpperCase()}</span><span><b>{name}</b><small>{email}</small></span></div><a href={sectionHref("accounts")}><Users size={15} /> Account &amp; connected channels</a><button type="button" onClick={() => { setSettingsOpen(true); setAccountOpen(false); }}><Settings2 size={15} /> Preferences</button><form action={signOutAction}><button type="submit"><LogOut size={15} /> Sign out</button></form></div>}</div></div></header>
        <div className="workspace-content">
          {view === "overview" ? <><div className="workspace-welcome-row"><div><p className="workspace-eyebrow">{date}</p><h1>Good morning, {firstName} <span>✦</span></h1><p className="workspace-subtitle">Your creative corner of the internet. Here’s what’s happening today.</p></div><a className="workspace-primary-button" href={sectionHref("posts")}><Plus size={17} /> Create a post</a></div>
          <section className="workspace-campaign-hero"><div className="workspace-hero-copy"><span className="workspace-hero-tag"><i /> ACTIVE CAMPAIGN</span><h2>{campaign.name}</h2><p>Your creative workspace is ready for its next big idea.</p><a href={sectionHref("campaign")} className="workspace-hero-link">Explore campaign <ArrowUpRight size={15} /></a></div><div className="workspace-hero-art"><div className="workspace-orbit orbit-one" /><div className="workspace-orbit orbit-two" /><div className="workspace-art-sparkle sparkle-one">✳</div><div className="workspace-art-sparkle sparkle-two">✦</div>{campaign.office && <Image className="workspace-office-image" alt="Campaign workspace" fill sizes="(max-width: 700px) 35vw, 300px" src={campaign.office} />}</div><div className="workspace-hero-mark"><Sparkles size={20} /></div></section>
          <section className="workspace-overview"><div className="workspace-section-heading"><div><h2>Your overview</h2><p>A little snapshot of your social world.</p></div><select aria-label="Overview period" className="workspace-period" value={period} onChange={(event) => setPeriod(event.target.value)}><option>This week</option><option>This month</option><option>This year</option></select></div><div className="workspace-stats-grid"><article className="workspace-stat-card"><div className="workspace-stat-top"><span className="workspace-stat-icon stat-blue"><CalendarDays size={17} /></span><span className="workspace-stat-note">{period.toUpperCase()}</span></div><small>Scheduled posts</small><strong>—</strong><p>Nothing scheduled just yet</p></article><article className="workspace-stat-card"><div className="workspace-stat-top"><span className="workspace-stat-icon stat-green"><Users size={17} /></span><span className="workspace-stat-note">CONNECTED</span></div><small>Social accounts</small><strong>0</strong><p>Connect your first channel</p></article><article className="workspace-stat-card"><div className="workspace-stat-top"><span className="workspace-stat-icon stat-violet"><Sparkles size={17} /></span><span className="workspace-live-pill">Ready to go</span></div><small>AI agent</small><strong className="workspace-ready">Standing by<span>✦</span></strong><p>Your creative partner is ready</p></article></div></section>
          <section className="workspace-start-card"><div className="workspace-start-illustration"><span><Sparkles size={20} /></span><i className="start-dot dot-one" /><i className="start-dot dot-two" /><i className="start-dot dot-three" /></div><div className="workspace-start-copy"><span className="workspace-start-kicker">YOUR NEXT CHAPTER</span><h3>Every great post starts with an idea.</h3><p>Connect your socials and let your AI agent help bring your next one to life.</p></div><a href={sectionHref("accounts")} className="workspace-start-button">Connect accounts <ArrowUpRight size={16} /></a></section>
          </> : <section className="workspace-coming-soon"><span className="workspace-coming-icon"><Sparkles size={22} /></span><p className="workspace-eyebrow">YOUR WORKSPACE</p><h1>{sectionTitles[view]}</h1><p>This area is ready for your {sectionTitles[view].toLowerCase()} workflow. Its tools and content will appear here.</p><a className="workspace-primary-button" href={`/dashboard?campaignId=${encodeURIComponent(campaign.id)}`}><LayoutDashboard size={16} /> Back to overview</a></section>}
          <footer className="workspace-footer"><span>Made for your next big idea <span>✦</span></span><span>Social Agent Studio · 2026</span></footer>
        </div>
      </section>
      {editCampaignOpen && editingCampaign && <div className="workspace-dialog-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setEditCampaignOpen(false); }}><section className="workspace-edit-dialog" role="dialog" aria-modal="true" aria-labelledby="edit-campaign-title"><button className="workspace-dialog-close" type="button" aria-label="Close edit campaign" onClick={() => setEditCampaignOpen(false)}><X size={17} /></button><span className="workspace-coming-icon"><Pencil size={19} /></span><h2 id="edit-campaign-title">Edit campaign</h2><p>Update the name and workspace used for this campaign.</p><form onSubmit={saveCampaign}><input type="hidden" name="id" value={editingCampaign.id} /><label>Campaign name<input name="name" defaultValue={editingCampaign.name} maxLength={80} required /></label><label>Campaign icon<select name="icon" defaultValue={editingCampaign.icon.startsWith("data:") ? "sparkles" : editingCampaign.icon}><option value="sparkles">Sparkles</option><option value="rocket">Rocket</option><option value="megaphone">Megaphone</option><option value="leaf">Leaf</option><option value="flame">Flame</option><option value="star">Star</option></select></label><label>AI Agent Office<select name="office" defaultValue={editingCampaign.office}><option value="/offices/modern-office.png">Sunlit Creative Studio</option><option value="/offices/wooden-office.png">Studio with Mountain Views</option></select></label>{campaignError && <p className="workspace-form-error" role="alert">{campaignError}</p>}<div className="workspace-dialog-actions"><button type="button" onClick={() => setEditCampaignOpen(false)}>Cancel</button><button className="workspace-primary-button" type="submit" disabled={campaignPending}>{campaignPending ? "Saving…" : "Save changes"}</button></div></form></section></div>}
    </main>
  );
}
