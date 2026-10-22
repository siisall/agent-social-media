"use client";

import { FormEvent, useEffect, useState, useTransition } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  signInAction,
  resendSignupVerificationEmailAction,
  signUpAction,
  startGoogleOAuth,
  verifySignupEmailAction,
} from "@/app/actions/auth";

type AuthFormProps = {
  mode: "signin" | "signup";
  googleError?: boolean;
};

export function AuthForm({ mode, googleError = false }: AuthFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState(googleError ? "Google sign-in didn't complete. Please try again." : "");
  const [verificationEmail, setVerificationEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    const pendingEmail = window.sessionStorage.getItem("pending-signup-verification-email");
    if (pendingEmail) setVerificationEmail(pendingEmail);
  }, []);

  function goToDashboard() {
    router.replace("/dashboard");
    router.refresh();
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setNotice("");
    const formData = new FormData(event.currentTarget);

    startTransition(async () => {
      try {
        const result = mode === "signup" ? await signUpAction(formData) : await signInAction(formData);
        if (result.error) {
          setError(result.error);
        } else if ("needsVerification" in result && result.needsVerification) {
          window.sessionStorage.setItem("pending-signup-verification-email", result.email);
          setVerificationEmail(result.email);
          setNotice("We sent a 6-digit verification code to your email.");
        } else if ("authenticated" in result && result.authenticated) {
          goToDashboard();
        }
      } catch {
        setError("Sign-in or sign-up failed. Please try again.");
      }
    });
  }

  async function handleVerify(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    startTransition(async () => {
      try {
        const result = await verifySignupEmailAction(verificationEmail, verificationCode.trim());
        if (result.error) setError(result.error);
        else if (result.authenticated) {
          window.sessionStorage.removeItem("pending-signup-verification-email");
          goToDashboard();
        }
      } catch {
        setError("Email verification failed. Please try again.");
      }
    });
  }

  function handleResendVerification() {
    setError("");
    setNotice("");

    startTransition(async () => {
      try {
        const result = await resendSignupVerificationEmailAction(verificationEmail);
        if (result.error) setError(result.error);
        else {
          setVerificationCode("");
          setNotice("A new verification code has been sent to your email.");
        }
      } catch {
        setError("We couldn't resend the verification code. Please try again.");
      }
    });
  }

  const isSignUp = mode === "signup";

  return (
    <main className="auth-shell">
      <section className="auth-card" aria-labelledby="auth-title">
        <aside className="auth-visual" aria-label="Social media workspace preview">
          <Link className="auth-logo" href="/signin" aria-label="Agent Social Media sign in">
            <span className="auth-logo-icon" aria-hidden="true"><AgentMark /></span>
            <span>agent<span className="auth-logo-light">social</span></span>
          </Link>
          <p className="auth-visual-kicker">Your social team, always on.</p>
          <h2>Make every post<br />work harder.</h2>
          <p className="auth-visual-copy">Plan, create, and grow across every channel with AI agents that work alongside you.</p>
          <div className="social-preview" aria-hidden="true">
            <div className="preview-topbar"><span /><span /><span /><i>CONTENT OVERVIEW</i><b>...</b></div>
            <div className="preview-body">
              <div className="preview-rail"><span className="rail-active">C</span><span>P</span><span>A</span><span>S</span></div>
              <div className="preview-main">
                <div className="preview-heading"><span>Good morning, Alex <b>*</b></span><small>Weekly overview</small></div>
                <div className="preview-stats"><div><small>Reach</small><strong>24.8k <em>+18%</em></strong><span className="chart chart-one" /></div><div><small>Engagement</small><strong>8.6% <em>+12%</em></strong><span className="chart chart-two" /></div></div>
                <div className="preview-calendar"><div><b>Upcoming posts</b><small>View calendar &gt;</small></div><p><span className="channel channel-instagram">IG</span><span><b>Behind the scenes</b><small>Today | Instagram</small></span><i>Ready</i></p><p><span className="channel channel-linkedin">in</span><span><b>Our latest launch</b><small>Tomorrow | LinkedIn</small></span><i>Draft</i></p></div>
              </div>
            </div>
            <div className="preview-agent"><span>*</span><div><b>Your AI agent</b><small>Found your best time to post</small></div><strong>+</strong></div>
          </div>
          <div className="auth-visual-footer"><span className="avatar-stack"><i>A</i><i>M</i><i>J</i></span><span>Made for teams building what is next.</span></div>
          <div className="visual-orbit orbit-one" /><div className="visual-orbit orbit-two" />
        </aside>

        <div className="auth-panel">
          <div className="auth-panel-top"><span className="auth-panel-brand"><span className="auth-logo-icon" aria-hidden="true"><AgentMark /></span> agent<span>social</span></span><span className="auth-secure"><i /> Secure workspace</span></div>
          <div className="auth-content">
            <p className="auth-eyebrow">{verificationEmail ? "One last step" : isSignUp ? "Get started for free" : "Welcome back"}</p>
            <h1 id="auth-title">{verificationEmail ? "Check your email" : isSignUp ? "Create your account" : "Sign in to your account"}</h1>
            <p className="auth-description">
              {verificationEmail
                ? `Enter the verification code we sent to ${verificationEmail}.`
                : isSignUp
                  ? "Bring your social channels together and let your AI team get to work."
                  : "Your content workspace is right where you left it."}
            </p>

        {verificationEmail ? (
          <form className="auth-form" onSubmit={handleVerify}>
            <label htmlFor="verification-code">6-digit verification code</label>
            <input
              autoComplete="one-time-code"
              id="verification-code"
              inputMode="numeric"
              maxLength={6}
              onChange={(event) => setVerificationCode(event.target.value.replace(/\D/g, ""))}
              pattern="[0-9]{6}"
              required
              value={verificationCode}
            />
            {notice && <p className="auth-notice" role="status">{notice}</p>}
            {error && <p className="auth-error" role="alert">{error}</p>}
            <button className="auth-primary-button" disabled={isPending} type="submit">
              {isPending ? "Verifying…" : "Verify email"}
            </button>
            <button className="auth-google-button" disabled={isPending} onClick={handleResendVerification} type="button">
              {isPending ? "Please wait…" : "Resend verification code"}
            </button>
          </form>
        ) : (
          <>
            <form className="auth-form" onSubmit={handleSubmit}>
              {isSignUp && (
                <>
                  <label htmlFor="name">Full name</label>
                  <input autoComplete="name" id="name" name="name" placeholder="Your name" required />
                </>
              )}
              <label htmlFor="email">Email address</label>
              <input autoComplete="email" id="email" name="email" placeholder="you@example.com" required type="email" />
              <div className="auth-label-row"><label htmlFor="password">Password</label>{!isSignUp && <span className="auth-password-hint">At least 6 characters</span>}</div>
              <input
                autoComplete={isSignUp ? "new-password" : "current-password"}
                id="password"
                minLength={6}
                name="password"
                placeholder="At least 6 characters"
                required
                type="password"
              />
              {error && <p className="auth-error" role="alert">{error}</p>}
              {notice && <p className="auth-notice" role="status">{notice}</p>}
              <button className="auth-primary-button" disabled={isPending} type="submit">
                {isPending ? "Please wait…" : isSignUp ? "Create account" : "Sign in"}
              </button>
            </form>

            <div className="auth-divider"><span>or sign in with</span></div>

            <form action={startGoogleOAuth}>
              <GoogleOAuthSubmitButton />
            </form>
          </>
        )}

        {!verificationEmail && (
          <p className="auth-switch">
            {isSignUp ? "Already have an account? " : "New to Agent Social? "}
            <Link href={isSignUp ? "/signin" : "/signup"}>{isSignUp ? "Sign in" : "Create an account"}</Link>
          </p>
        )}
          <p className="auth-legal">One workspace. Every social channel. Your AI team.</p>
          </div>
        </div>
      </section>
    </main>
  );
}

function GoogleOAuthSubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button aria-busy={pending} className="auth-google-button" disabled={pending} type="submit">
      <GoogleMark />
      {pending ? "Connecting to Google…" : "Continue with Google"}
    </button>
  );
}

function AgentMark() {
  return <svg aria-hidden="true" viewBox="0 0 32 32" fill="none"><path d="M16 3.5 19.3 12l8.5 3.3-8.5 3.3-3.3 8.5-3.3-8.5-8.5-3.3 8.5-3.3L16 3.5Z" fill="currentColor"/><circle cx="24.5" cy="7.5" r="2" fill="currentColor" opacity=".6"/></svg>;
}

function GoogleMark() {
  return (
    <svg aria-hidden="true" className="google-mark" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M21.6 12.23c0-.72-.06-1.41-.18-2.08H12v3.94h5.38a4.6 4.6 0 0 1-2 3.02v2.55h3.24c1.9-1.75 2.98-4.33 2.98-7.43Z" />
      <path fill="#34A853" d="M12 22c2.7 0 4.97-.9 6.63-2.44l-3.24-2.55c-.9.6-2.05.96-3.39.96-2.6 0-4.8-1.76-5.59-4.12H3.06v2.63A10 10 0 0 0 12 22Z" />
      <path fill="#FBBC05" d="M6.41 13.85a6.02 6.02 0 0 1 0-3.7V7.52H3.06a10 10 0 0 0 0 8.96l3.35-2.63Z" />
      <path fill="#EA4335" d="M12 6.03c1.47 0 2.79.5 3.83 1.52l2.87-2.87C16.96 3.03 14.7 2 12 2a10 10 0 0 0-8.94 5.52l3.35 2.63C7.2 7.8 9.4 6.03 12 6.03Z" />
    </svg>
  );
}

