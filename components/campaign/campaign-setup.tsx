"use client";

import Image from "next/image";
import { FormEvent, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Check, Flame, Layers3, Leaf, Megaphone, Rocket, Sparkles, Star, Upload } from "lucide-react";
import { createCampaignAction } from "@/app/actions/auth";

const icons = [
  { value: "rocket", label: "Rocket", Component: Rocket, color: "#347ff0" },
  { value: "sparkles", label: "Sparkles", Component: Sparkles, color: "#a34ee8" },
  { value: "megaphone", label: "Megaphone", Component: Megaphone, color: "#f06c46" },
  { value: "leaf", label: "Leaf", Component: Leaf, color: "#20aa79" },
  { value: "flame", label: "Flame", Component: Flame, color: "#ed9a27" },
  { value: "star", label: "Star", Component: Star, color: "#368ce9" },
];
const offices = [
  { src: "/offices/modern-office.png", name: "Sunlit Creative Studio", description: "A bright, open space for fresh ideas." },
  { src: "/offices/wooden-office.png", name: "Studio with Mountain Views", description: "A warm studio with room to think big." },
];

export function CampaignSetup() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [icon, setIcon] = useState(icons[0].value);
  const [office, setOffice] = useState("");
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();
  const selectedIcon = icons.find((item) => item.value === icon);
  const SelectedIcon = selectedIcon?.Component;

  function uploadIcon(file?: File) {
    if (!file) return;
    if (!file.type.startsWith("image/") || file.size > 650 * 1024) {
      setError("Choose an image under 650 KB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => { setIcon(String(reader.result)); setError(""); };
    reader.readAsDataURL(file);
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const formData = new FormData();
    formData.set("name", name);
    formData.set("icon", icon);
    formData.set("office", office);
    startTransition(async () => {
      const result = await createCampaignAction(formData);
      if (result.error) setError(result.error);
      else { router.replace("/dashboard"); router.refresh(); }
    });
  }

  return (
    <main className="campaign-setup-shell">
      <header className="campaign-setup-header">
        <a className="campaign-wordmark" href="/dashboard"><span className="campaign-brand-mark"><Layers3 size={18} /></span> Social Agent</a>
        <span className="campaign-save-note"><i /> Workspace setup</span>
      </header>
      <div className="campaign-stepper" aria-label={`Step ${step} of 2`}>
        <div className={step === 1 ? "campaign-step is-current" : "campaign-step is-done"}><span>{step > 1 ? <Check size={15} /> : "1"}</span><div><b>Campaign</b></div></div>
        <i className={step > 1 ? "is-done" : ""} />
        <div className={`campaign-step ${step === 2 ? "is-current" : ""}`}><span>2</span><div><b>Office space</b></div></div>
      </div>
      <section className="campaign-setup-card" aria-labelledby="campaign-title">
        {step === 1 ? <div className="campaign-step-content">
          <h1 id="campaign-title" className="campaign-step-title">Create your first campaign</h1>
          <p className="campaign-step-description">Give it a name and a logo. You can change these later.</p>
          <label className="campaign-field-label" htmlFor="campaign-name">Campaign name</label>
          <input id="campaign-name" className="campaign-name-input" maxLength={80} onChange={(event) => setName(event.target.value)} placeholder="e.g. Summer product launch" value={name} />
          <div className="campaign-icon-heading"><span className="campaign-field-label">Logo</span><small>Choose a style that feels like you</small></div>
          <div className="campaign-icon-options" role="radiogroup" aria-label="Campaign icon">
            {icons.map(({ value, label, Component, color }) => <button aria-checked={icon === value} aria-label={label} className={`campaign-icon-choice ${icon === value ? "is-selected" : ""}`} key={value} onClick={() => setIcon(value)} role="radio" style={{ "--icon-color": color } as React.CSSProperties} type="button"><Component size={20} strokeWidth={2} /></button>)}
            <label className={`campaign-upload-choice ${icon.startsWith("data:") ? "is-selected" : ""}`} title="Upload a custom icon">
              {icon.startsWith("data:") ? <img alt="Custom campaign icon" src={icon} /> : <><Upload size={16} /><span>Upload</span></>}
              <input accept="image/*" onChange={(event) => uploadIcon(event.target.files?.[0])} type="file" />
            </label>
          </div>
          <div className="campaign-preview"><div className="campaign-preview-icon" style={icon.startsWith("data:") ? undefined : { "--icon-color": selectedIcon?.color } as React.CSSProperties}>{icon.startsWith("data:") ? <img alt="" src={icon} /> : SelectedIcon && <SelectedIcon size={21} />}</div><div><small>CAMPAIGN PREVIEW</small><b>{name || "Your campaign"}</b></div><span>Workspace</span></div>
          {error && <p className="campaign-error" role="alert">{error}</p>}
          <button className="campaign-primary-button" disabled={!name.trim()} onClick={() => { setStep(2); setError(""); }} type="button">Continue <ArrowRight size={16} /></button>
        </div> : <form className="campaign-step-content" onSubmit={submit}>
          <h1 id="campaign-title" className="campaign-step-title">Pick an office space</h1>
          <p className="campaign-step-description">This is where your AI creative team will work on <strong>{name || "your campaign"}</strong>.</p>
          <div className="campaign-office-grid">
            {offices.map((item) => <button aria-pressed={office === item.src} className={`campaign-office-card ${office === item.src ? "is-selected" : ""}`} key={item.src} onClick={() => setOffice(item.src)} type="button">
              <div className="campaign-office-image"><Image alt={item.name} fill sizes="(max-width: 700px) 100vw, 520px" src={item.src} /></div>
              <div className="campaign-office-copy"><span className="campaign-office-radio" /><div><b>{item.name}</b><small>{item.description}</small></div></div>
            </button>)}
          </div>
          {error && <p className="campaign-error" role="alert">{error}</p>}
          <div className="campaign-step-actions"><button className="campaign-back-button" onClick={() => setStep(1)} type="button"><ArrowLeft size={16} /> Back</button><button className="campaign-primary-button" disabled={!office || pending} type="submit">{pending ? "Creating campaign…" : "Create campaign"}<ArrowRight size={16} /></button></div>
        </form>}
      </section>
    </main>
  );
}
