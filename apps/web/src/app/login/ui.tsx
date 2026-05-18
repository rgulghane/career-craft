"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import {
  isValidAuthProfile,
  isValidFullNameTwoWords,
  isValidIndianPhone,
  messages,
  normalizeIndianPhone,
} from "@career-craft/shared";
import { GoogleSignInButton } from "@/components/google-sign-in-button";
import { theme } from "@/lib/theme";

type Mode = "login" | "register";

type SessionUser = {
  email: string;
  fullName: string;
};

function ProfileFields({
  fullName,
  phone,
  collegeName,
  onFullNameChange,
  onPhoneChange,
  onCollegeNameChange,
  disabled,
  showFieldHints,
}: {
  fullName: string;
  phone: string;
  collegeName: string;
  onFullNameChange: (value: string) => void;
  onPhoneChange: (value: string) => void;
  onCollegeNameChange: (value: string) => void;
  disabled?: boolean;
  showFieldHints?: boolean;
}) {
  const nameInvalid = showFieldHints && fullName.length > 0 && !isValidFullNameTwoWords(fullName);
  const phoneDigits = normalizeIndianPhone(phone);
  const phoneInvalid = showFieldHints && phone.length > 0 && !isValidIndianPhone(phone);

  return (
    <div className="space-y-4">
      <label className="block">
        <span className={theme.label}>
          {messages.auth.fullNameLabel}
          <span className="normal-case tracking-normal text-rose-500 dark:text-rose-400"> *</span>
        </span>
        <input
          className={disabled ? theme.inputDisabled : theme.input}
          autoComplete="name"
          placeholder="e.g. Rahul Sharma"
          value={fullName}
          onChange={(ev) => onFullNameChange(ev.target.value)}
          disabled={disabled}
          required
          aria-invalid={nameInvalid}
        />
        <p className={`mt-1 text-xs ${nameInvalid ? theme.error : "text-slate-500 dark:text-slate-400"}`}>
          {messages.auth.fullNameHint}
        </p>
      </label>

      <label className="block">
        <span className={theme.label}>
          {messages.auth.phoneLabel}
          <span className="normal-case tracking-normal text-rose-500 dark:text-rose-400"> *</span>
        </span>
        <input
          className={disabled ? theme.inputDisabled : theme.input}
          type="tel"
          inputMode="numeric"
          autoComplete="tel"
          placeholder="10-digit mobile number"
          value={phone}
          onChange={(ev) => onPhoneChange(ev.target.value.replace(/[^\d\s-]/g, "").slice(0, 14))}
          disabled={disabled}
          required
          aria-invalid={phoneInvalid}
        />
        <p className={`mt-1 text-xs ${phoneInvalid ? theme.error : "text-slate-500 dark:text-slate-400"}`}>
          {phoneInvalid
            ? messages.auth.phoneHint
            : phoneDigits.length > 0
              ? `${phoneDigits.length}/10 digits`
              : messages.auth.phoneHint}
        </p>
      </label>

      <label className="block">
        <span className={theme.label}>
          {messages.auth.collegeLabel}{" "}
          <span className="font-normal normal-case tracking-normal text-slate-400">({messages.auth.collegeOptional})</span>
        </span>
        <input
          className={disabled ? theme.inputDisabled : theme.input}
          autoComplete="organization"
          placeholder="Your college or university"
          value={collegeName}
          onChange={(ev) => onCollegeNameChange(ev.target.value)}
          disabled={disabled}
        />
      </label>
    </div>
  );
}

export function AuthCard({
  mode,
  heading,
  redirectTo = "/dashboard",
  sessionUser = null,
  alternateAuthHref,
  referralCode = "",
  googleAuthEnabled = false,
  initialError = null,
}: {
  mode: Mode;
  heading: string;
  redirectTo?: string;
  sessionUser?: SessionUser | null;
  alternateAuthHref?: string;
  referralCode?: string;
  googleAuthEnabled?: boolean;
  initialError?: string | null;
}) {
  const router = useRouter();
  const emailLocked = sessionUser !== null;
  const googleLogin = mode === "login" && googleAuthEnabled && !emailLocked;
  const googleRegister = mode === "register" && googleAuthEnabled && !emailLocked;
  const showLoginEmailForm = mode === "login" && !googleAuthEnabled && !emailLocked;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState(sessionUser?.fullName ?? "");
  const [phone, setPhone] = useState("");
  const [collegeName, setCollegeName] = useState("");
  const [showFieldHints, setShowFieldHints] = useState(false);
  const [error, setError] = useState<string | null>(initialError);
  const [loading, setLoading] = useState(false);

  const normalizedPhone = useMemo(() => normalizeIndianPhone(phone), [phone]);
  const profileComplete = isValidAuthProfile(fullName, phone);

  const switchHref =
    alternateAuthHref ?? (mode === "login" ? "/register" : "/login");

  async function onLoginWithEmail(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const r = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!r.ok) {
        const bodyJson = (await r.json()) as { error?: string };
        setError(bodyJson.error ?? messages.errors.generic);
        return;
      }
      router.push(redirectTo);
      router.refresh();
    } catch {
      setError(messages.errors.network);
    } finally {
      setLoading(false);
    }
  }

  function continueEnroll() {
    router.push(redirectTo);
    router.refresh();
  }

  return (
    <div className={theme.card}>
      <p className={theme.eyebrow}>{mode === "login" ? "Welcome back" : "Join Cohort 4"}</p>
      <h1 className={`mt-2 ${theme.title}`}>{heading}</h1>
      {referralCode ? (
        <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-sm font-medium text-amber-900 dark:bg-amber-500/15 dark:text-amber-200">
          Referral code <span className="font-mono tracking-wide">{referralCode}</span> will be applied when you
          enroll.
        </p>
      ) : null}
      <p className={`mt-3 ${theme.body}`}>
        {mode === "login" ? (
          <>
            New here?{" "}
            <Link className={theme.link} href={switchHref}>
              {messages.nav.register}
            </Link>
          </>
        ) : (
          <>
            Already have an account?{" "}
            <Link className={theme.link} href={switchHref}>
              {messages.nav.signIn}
            </Link>
          </>
        )}
      </p>

      {emailLocked && mode === "register" ? (
        <div className="mt-8 space-y-4">
          <p className={theme.body}>
            Signed in as <span className="font-medium text-slate-900 dark:text-white">{sessionUser?.email}</span>
          </p>
          <button className={`w-full ${theme.btnPrimary}`} type="button" onClick={continueEnroll}>
            {messages.auth.continueEnrollCta}
          </button>
        </div>
      ) : null}

      {googleLogin ? (
        <div className="mt-8">
          <GoogleSignInButton intent="login" redirectTo={redirectTo} disabled={loading} />
          {error ? <p className={`mt-4 ${theme.error}`}>{error}</p> : null}
        </div>
      ) : null}

      {googleRegister ? (
        <div className="mt-8">
          <ProfileFields
            fullName={fullName}
            phone={phone}
            collegeName={collegeName}
            onFullNameChange={setFullName}
            onPhoneChange={setPhone}
            onCollegeNameChange={setCollegeName}
            showFieldHints={showFieldHints}
          />
          <div className="mt-6">
            <GoogleSignInButton
              intent="register"
              redirectTo={redirectTo}
              fullName={fullName}
              phone={normalizedPhone}
              collegeName={collegeName}
              disabled={!profileComplete || loading}
            />
            {!profileComplete ? (
              <p className="mt-2 text-center text-xs text-slate-500 dark:text-slate-400">
                {messages.auth.completeProfileForGoogle}
              </p>
            ) : null}
          </div>
          {error ? <p className={`mt-4 ${theme.error}`}>{error}</p> : null}
        </div>
      ) : null}

      {mode === "register" && !googleAuthEnabled && !emailLocked ? (
        <p className={`mt-8 ${theme.error}`}>{messages.auth.googleSignInFailed}</p>
      ) : null}

      {showLoginEmailForm ? (
        <form className="mt-8 space-y-4" onSubmit={onLoginWithEmail}>
          <label className="block">
            <span className={theme.label}>{messages.auth.emailLabel}</span>
            <input
              className={theme.input}
              type="email"
              autoComplete="email"
              value={email}
              onChange={(ev) => {
                setEmail(ev.target.value);
              }}
              required
            />
          </label>
          <label className="block">
            <span className={theme.label}>{messages.auth.passwordLabel}</span>
            <input
              className={theme.input}
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(ev) => {
                setPassword(ev.target.value);
              }}
              minLength={8}
              required
            />
          </label>
          {error ? <p className={theme.error}>{error}</p> : null}
          <button className={`w-full ${theme.btnPrimary}`} type="submit" disabled={loading}>
            {loading ? "Please wait…" : messages.auth.signInCta}
          </button>
        </form>
      ) : null}
    </div>
  );
}
