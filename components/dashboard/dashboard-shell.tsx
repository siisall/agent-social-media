"use client";

import { CSSProperties, FormEvent, useEffect, useMemo, useState, useTransition } from "react";
import Image from "next/image";
import { signOutAction, updateCampaignAction } from "@/app/actions/auth";
import { ArrowUpRight, Bell, BarChart3, Bot, CalendarDays, Camera, Check, ChevronDown, CircleHelp, FileText, Flame, House, LayoutDashboard, Leaf, Link2, LogOut, Megaphone, Menu, Music2, Orbit, Pencil, Play, Plus, Rocket, Search, Settings2, Sparkles, Star, Users, X } from "lucide-react";

type Campaign = { id: string; name: string; icon: string; office: string };
type Props = { name: string; email: string; campaign: Campaign; campaigns: Campaign[]; view: string; date: string };

const navigation = [
  { label: "Overview", icon: House, color: "blue", active: true },
  { label: "AI Agents", icon: Bot, color: "violet" },
  { label: "Posts", icon: FileText, color: "coral" },
  { label: "Calendar", icon: CalendarDays, color: "amber" },
  { label: "Analytics", icon: BarChart3, color: "green" },
  { label: "Accounts", icon: Link2, color: "pink" },
];

const sectionTitles: Record<string, string> = { overview: "Overview", "ai-agent": "AI Agent", posts: "Posts", calendar: "Calendar", analytics: "Analytics", accounts: "Accounts", settings: "Settings", campaign: "Campaign" };

const socialPlatforms = [
  { label: "Instagram", icon: "IG", color: "linear-gradient(135deg,#f6a33d,#df3e78,#7250c8)", count: 12 },
  { label: "TikTok", icon: "TT", color: "#111111", count: 8 },
  { label: "YouTube", icon: "YT", color: "#FF0000", count: 6 },
  { label: "LinkedIn", icon: "in", color: "#0077B5", count: 4 },
  { label: "X", icon: "X", color: "#000000", count: 5 },
];

const campaignIcons = { rocket: Rocket, sparkles: Sparkles, megaphone: Megaphone, leaf: Leaf, flame: Flame, star: Star };

function CampaignIcon({ value, name, size = 16 }: { value: string; name: string; size?: number }) {
  if (value.startsWith("data:image/")) return <img alt={name} src={value} />;
  if (value === "rocket") return <span className="workspace-rocket-emoji" style={{ fontSize: size + 4 }} aria-label={name}>🚀</span>;
  const Icon = campaignIcons[value as keyof typeof campaignIcons] ?? Sparkles;
  return <Icon size={size} />;
}

function SocialIcon({ platform, fallback }: { platform: string; fallback: string }) {
  if (platform === "Instagram") return <Camera size={15} strokeWidth={2.5} />;
  if (platform === "TikTok") return <Music2 size={15} strokeWidth={2.5} />;
  if (platform === "YouTube") return <Play size={14} fill="currentColor" strokeWidth={1.5} />;
  return fallback;
}

export function DashboardShell({ name, email, campaign, campaigns, view, date }: Props) {
  const [collapsed, setCollapsed] = useState(false);
  const [campaignMenuOpen, setCampaignMenuOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [editCampaignOpen, setEditCampaignOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);
  const [campaignError, setCampaignError] = useState("");
  const [campaignPending, startCampaignUpdate] = useTransition();
  const [search, setSearch] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [activePost, setActivePost] = useState<number | null>(null);
  const firstName = name.split(" ")[0];
  const campaignQuery = `campaignId=${encodeURIComponent(campaign.id)}`;
  const sectionHref = (section: string) => `/dashboard?${campaignQuery}&view=${section}`;
  const postTitles = ["Launch Announcement", "Behind the Scenes", "Product Demo Short", "Trend Take: AI for Founders"];
  const postDates = ["Oct 20, 9:00 AM", "Oct 21, 12:00 PM", "Oct 22, 3:00 PM", "Oct 23, 6:00 PM"];
  const searchResults = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return [];
    return [
      ...campaigns.filter((item) => item.name.toLowerCase().includes(query)).map((item) => ({ label: item.name, href: `/dashboard?campaignId=${encodeURIComponent(item.id)}`, type: "Campaign" })),
      ...postTitles.map((title) => ({ label: title, href: sectionHref("posts"), type: "Post" })).filter((item) => item.label.toLowerCase().includes(query)),
      ...["Overview", "AI Agents", "Posts", "Calendar", "Analytics", "Accounts", "Settings"].filter((label) => label.toLowerCase().includes(query)).map((label) => ({ label, href: sectionHref(label.toLowerCase().replace(" ", "-")), type: "Workspace" })),
    ].slice(0, 6);
  }, [campaigns, search, campaign.id]);

  useEffect(() => {
    function handleSidebarShortcut(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "b") {
        event.preventDefault();
        setCollapsed((value) => !value);
      }
    }
    window.addEventListener("keydown", handleSidebarShortcut);
    return () => window.removeEventListener("keydown", handleSidebarShortcut);
  }, []);

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
    <main className={`workspace ${collapsed ? "is-collapsed" : ""}`} style={{ "--workspace-accent": "#6258e5" } as CSSProperties}>
      <aside className="workspace-sidebar">
        <div className="workspace-sidebar-header">
          <a className="workspace-logo" href="/dashboard" aria-label="Socialix home"><span className="workspace-logo-mark"><Sparkles size={16} fill="currentColor" /></span><span className="workspace-logo-copy">Socialix</span></a>
          <div className="workspace-search"><input className="workspace-search-input" type="search" placeholder="Search campaigns, content, or insights..." /><span className="workspace-search-icon"><Bell size={15} /></span></div>
        </div>
        <div className="workspace-campaign-wrap">
          <button className="workspace-campaign" type="button" aria-expanded={campaignMenuOpen} onClick={() => setCampaignMenuOpen(!campaignMenuOpen)}>
            <span className="workspace-campaign-icon"><Flame size={18} fill="white" strokeWidth={2.5} /></span><span className="workspace-campaign-copy"><small>Campaign</small><b>{campaign.name}</b></span><ChevronDown className="workspace-campaign-chevron" size={13} />
          </button>
          {campaignMenuOpen && <div className="workspace-campaign-menu"><span className="workspace-menu-label">CAMPAIGNS</span>{campaigns.map((item) => <div className="workspace-campaign-option-row" key={item.id}><a href={`/dashboard?campaignId=${encodeURIComponent(item.id)}&view=${view}`} className={`workspace-campaign-option ${item.id === campaign.id ? "is-selected" : ""}`}><span className="workspace-option-dot"><CampaignIcon value={item.icon} name={item.name} size={13} /></span><span>{item.name}</span>{item.id === campaign.id && <Check size={13} />}</a><button className="workspace-edit-campaign" type="button" aria-label={`Edit ${item.name}`} title={`Edit ${item.name}`} onClick={() => { setEditingCampaign(item); setEditCampaignOpen(true); setCampaignMenuOpen(false); setCampaignError(""); }}><Pencil size={11} /></button></div>)}<a href="/create-campaign" className="workspace-create-campaign"><Plus size={14} /> Create new campaign</a></div>}
        </div>
        <div className="workspace-nav-heading">WORKSPACE</div>
        <nav className="workspace-nav" aria-label="Main navigation">{navigation.map(({ label, icon: Icon, color }) => { const section = label.toLowerCase().replace(" ", "-"); return <a key={label} href={sectionHref(section)} className={`workspace-nav-link ${view === section ? "is-active" : ""}`} title={collapsed ? label : undefined}><span className={`workspace-nav-icon icon-${color}`}><Icon size={17} strokeWidth={2} /></span><span className="workspace-nav-label">{label}</span>{view === section && <span className="workspace-active-dot" />}</a>; })}</nav>
        <div className="workspace-sidebar-bottom"><a href={sectionHref("settings")} className={`workspace-nav-link workspace-settings-link ${view === "settings" ? "is-active" : ""}`} title={collapsed ? "Settings" : undefined}><span className="workspace-nav-icon icon-slate"><Settings2 size={17} strokeWidth={2} /></span><span className="workspace-nav-label">Settings</span></a><button aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"} title={collapsed ? "Expand sidebar" : "Collapse sidebar"} className="workspace-collapse-sidebar" type="button" onClick={() => setCollapsed(!collapsed)}><span className="workspace-nav-icon icon-slate"><Menu size={16} /></span><span className="workspace-nav-label">{collapsed ? "Expand" : "Collapse"}</span><kbd></kbd></button><div className="workspace-profile"><span className="workspace-avatar">{firstName.slice(0, 1).toUpperCase()}</span><span className="workspace-profile-copy"><b>{name}</b><small>{email}</small></span><form action={signOutAction}><button type="submit" className="workspace-signout" title="Sign out"><LogOut size={14} /></button></form></div></div>
      </aside>
      <section className="workspace-main">
        <header className="workspace-header"><div className="workspace-top-search-wrap"><label className="workspace-top-search"><Search size={15} /><input aria-label="Search campaigns, posts, or anything" placeholder="Search campaigns, posts, or anything..." value={search} onFocus={() => setSearchOpen(true)} onChange={(event) => { setSearch(event.target.value); setSearchOpen(true); }} onKeyDown={(event) => { if (event.key === "Escape") setSearchOpen(false); }} /><kbd>&#8984;K</kbd></label>{searchOpen && search.trim() && <div className="workspace-search-results">{searchResults.length ? searchResults.map((result, index) => <a key={`${result.type}-${index}`} href={result.href} onClick={() => setSearchOpen(false)}><span>{result.label}</span><small>{result.type}</small></a>) : <p>No matches found</p>}</div>}</div><div className="workspace-header-actions"><div className="workspace-header-popover-wrap"><button className="workspace-header-icon workspace-notification" type="button" aria-expanded={notificationsOpen} aria-label="Notifications" onClick={() => { setNotificationsOpen(!notificationsOpen); setHelpOpen(false); setAccountOpen(false); }}><Bell size={17} /><i /></button>{notificationsOpen && <div className="workspace-header-popover"><b>Notifications</b><p>You’re all caught up. New updates will appear here.</p></div>}</div><div className="workspace-header-popover-wrap"><button className="workspace-header-avatar" type="button" aria-label="Account menu" aria-expanded={accountOpen} onClick={() => { setAccountOpen(!accountOpen); setHelpOpen(false); setNotificationsOpen(false); }}>{firstName.slice(0, 1).toUpperCase()}</button>{accountOpen && <div className="workspace-account-menu"><div className="workspace-account-summary"><span className="workspace-avatar">{firstName.slice(0, 1).toUpperCase()}</span><span><b>{name}</b><small>{email}</small></span></div><a href={sectionHref("accounts")}><Users size={14} /> Account &amp; connected channels</a><a href={sectionHref("settings")}><Settings2 size={14} /> Settings</a><form action={signOutAction}><button type="submit"><LogOut size={14} /> Sign out</button></form></div>}</div></div></header>
        <div className="workspace-content">
          {view === "overview" ? (
            <>
              <div className="workspace-overview-layout">
                <div className="workspace-overview-column">
              <div className="workspace-welcome-row"><div><p className="workspace-eyebrow"> Wellcome, {firstName} </p><h1>Your AI Creative Team is on it.</h1><p className="workspace-subtitle">From trends to content to posting, your agents work together to turn ideas into real growth.</p></div></div>
              <section className="workspace-campaign-overview"><div className="workspace-campaign-card"><div className="workspace-campaign-media"><span className="workspace-campaign-icon-lg"><CampaignIcon value={campaign.icon} name={campaign.name} size={30} /></span></div><div className="workspace-campaign-info"><div className="workspace-campaign-heading"><h2>{campaign.name}</h2><span className="workspace-campaign-status"><span className="workspace-status-dot" />In Progress</span></div><p className="workspace-campaign-desc">Creating engaging content, researching trends, and scheduling posts to grow your brand.</p><div className="workspace-campaign-progress"><span className="workspace-progress-label">0%</span><span className="workspace-progress-complete">Complete</span></div><div className="workspace-progress-bar"><div className="workspace-progress-fill" style={{ width: "0%" }} /></div></div></div></section>
              <section className="workspace-upcoming-posts"><div className="workspace-section-heading"><h2>Upcoming Posts</h2><a className="workspace-view-calendar" href={sectionHref("calendar")}>View Calendar <ArrowUpRight size={14} /></a></div><div className="workspace-empty-card"><span className="workspace-empty-icon"><CalendarDays size={25} /></span><h3>No posts scheduled yet</h3><p>Schedule your first post to get started.</p><a className="workspace-empty-button" href={sectionHref("posts")}><Plus size={14} /> Create post</a></div></section>
              <section className="workspace-recent-activity"><div className="workspace-section-heading"><h2>Recent Activity</h2></div><div className="workspace-empty-card"><span className="workspace-empty-icon"><FileText size={23} /></span><h3>No recent activity</h3><p>Your campaign activity will appear here.</p></div></section>
                </div>
                <div className="workspace-right-panel">
                  <Image alt="The social media AI team working in their creative office" className="workspace-office-backdrop" fill sizes="(max-width: 900px) 100vw, 54vw" src="/offices/dashboard-team.png" priority />
                </div>
              </div>
            </>
          ) : (
            <section className="workspace-section-view"><div className="workspace-section-page-heading"><div><p className="workspace-eyebrow">{campaign.name.toUpperCase()}</p><h1>{sectionTitles[view]}</h1></div><a className="workspace-primary-button" href={sectionHref("overview")}><LayoutDashboard size={15} /> Overview</a></div>
              {view === "ai-agent" && <><p className="workspace-section-intro">Your creative team works together to grow this campaign.</p><div className="workspace-agent-grid">{[["Research Agent", "Finds trends and topics for your audience."], ["Content Agent", "Turns ideas into engaging post drafts."], ["Scheduler Agent", "Plans content across your calendar."], ["Analytics Agent", "Tracks how your content performs."]].map(([title, description]) => <article className="workspace-agent-card" key={title}><span className="workspace-coming-icon"><Bot size={19} /></span><h2>{title}</h2><p>{description}</p><span className="workspace-agent-status">Ready for this campaign</span></article>)}</div></>}
              {view === "posts" && <><p className="workspace-section-intro">Scheduled content for {campaign.name}.</p><div className="workspace-posts-table">{postTitles.map((title, i) => <button className="workspace-section-post-row" key={title} type="button" onClick={() => setActivePost(i)}><span className="workspace-post-icon" style={{ background: socialPlatforms[i].color }}><SocialIcon platform={socialPlatforms[i].label} fallback={socialPlatforms[i].icon} /></span><span><b>{title}</b><small>{postDates[i]} · {socialPlatforms[i].label}</small></span><span className="workspace-post-status">Scheduled</span></button>)}</div></>}
              {view === "calendar" && <><p className="workspace-section-intro">Upcoming posts scheduled for this campaign.</p><div className="workspace-calendar-list">{postTitles.map((title, i) => <article className="workspace-calendar-item" key={title}><div><b>{postDates[i].split(",")[0]}</b><small>{postDates[i].split(", ")[1]}</small></div><span className="workspace-post-icon" style={{ background: socialPlatforms[i].color }}><SocialIcon platform={socialPlatforms[i].label} fallback={socialPlatforms[i].icon} /></span><p>{title}<small>{socialPlatforms[i].label} · Scheduled</small></p><button type="button" onClick={() => setActivePost(i)} aria-label={`View ${title}`}><ArrowUpRight size={14} /></button></article>)}</div></>}
              {view === "analytics" && <><p className="workspace-section-intro">Performance snapshot for your campaign.</p><div className="workspace-analytics-grid"><article><small>Total Reach</small><b>128.4K</b><span>↑ 32%</span></article><article><small>Engagement Rate</small><b>8.6%</b><span>↑ 12%</span></article><article><small>Content Created</small><b>28</b><span>↑ 56%</span></article></div></>}
              {view === "accounts" && <div className="workspace-account-empty"><span className="workspace-coming-icon"><Users size={21} /></span><h2>No social accounts connected</h2><p>Connect a social channel in Settings to publish and track campaign content.</p><a className="workspace-primary-button" href={sectionHref("settings")}><Settings2 size={15} /> Open settings</a></div>}
              {view === "settings" && <div className="workspace-setting-card"><span className="workspace-coming-icon"><Settings2 size={20} /></span><div><h2>Campaign settings</h2><p>Update the campaign name, icon, or AI Agent office.</p></div><button className="workspace-primary-button" type="button" onClick={() => { setEditingCampaign(campaign); setEditCampaignOpen(true); setCampaignError(""); }}><Pencil size={14} /> Edit campaign</button></div>}
              {view === "campaign" && <div className="workspace-setting-card"><span className="workspace-coming-icon"><Rocket size={20} /></span><div><h2>{campaign.name}</h2><p>Campaign workspace and AI Agent office.</p></div><button className="workspace-primary-button" type="button" onClick={() => { setEditingCampaign(campaign); setEditCampaignOpen(true); }}><Pencil size={14} /> Edit campaign</button></div>}
            </section>
          )}
          <footer className={`workspace-footer ${view === "overview" ? "workspace-footer-overview" : ""}`}><span>Made for your next big idea <span>✦</span></span><span>orbit<span style={{color: '#6258e8', fontWeight: 600, marginLeft: '-3px'}}>.</span> · 2026</span></footer>
        </div>
      </section>
      {editCampaignOpen && editingCampaign && <div className="workspace-dialog-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setEditCampaignOpen(false); }}><section className="workspace-edit-dialog" role="dialog" aria-modal="true" aria-labelledby="edit-campaign-title"><button className="workspace-dialog-close" type="button" aria-label="Close edit campaign" onClick={() => setEditCampaignOpen(false)}><X size={17} /></button><span className="workspace-coming-icon"><Pencil size={19} /></span><h2 id="edit-campaign-title">Edit campaign</h2><p>Update the name and workspace used for this campaign.</p><form onSubmit={saveCampaign}><input type="hidden" name="id" value={editingCampaign.id} /><label>Campaign name<input name="name" defaultValue={editingCampaign.name} maxLength={80} required /></label><label>Campaign icon<select name="icon" defaultValue={editingCampaign.icon.startsWith("data:") ? "sparkles" : editingCampaign.icon}><option value="sparkles">Sparkles</option><option value="rocket">Rocket</option><option value="megaphone">Megaphone</option><option value="leaf">Leaf</option><option value="flame">Flame</option><option value="star">Star</option></select></label><label>AI Agent Office<select name="office" defaultValue={editingCampaign.office}><option value="/offices/modern-office.png">Sunlit Creative Studio</option><option value="/offices/wooden-office.png">Studio with Mountain Views</option></select></label>{campaignError && <p className="workspace-form-error" role="alert">{campaignError}</p>}<div className="workspace-dialog-actions"><button type="button" onClick={() => setEditCampaignOpen(false)}>Cancel</button><button className="workspace-primary-button" type="submit" disabled={campaignPending}>{campaignPending ? "Saving…" : "Save changes"}</button></div></form></section></div>}
    {activePost !== null && <div className="workspace-dialog-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setActivePost(null); }}><section className="workspace-edit-dialog" role="dialog" aria-modal="true" aria-labelledby="post-detail-title"><button className="workspace-dialog-close" type="button" aria-label="Close post details" onClick={() => setActivePost(null)}><X size={17} /></button><span className="workspace-coming-icon"><FileText size={19} /></span><h2 id="post-detail-title">{postTitles[activePost]}</h2><p>This post is scheduled for {postDates[activePost]} on {socialPlatforms[activePost].label}.</p><div className="workspace-dialog-actions"><a className="workspace-primary-button" href={sectionHref("calendar")}>Open calendar</a><button type="button" onClick={() => setActivePost(null)}>Close</button></div></section></div>}</main>
  );
}
