import { messages } from "@career-craft/shared/content";

const sharedClass =
  "flex w-full items-center justify-center gap-3 rounded-xl border px-4 py-3 text-sm font-semibold";

type GoogleSignInButtonProps =
  | {
      intent: "login";
      redirectTo: string;
      disabled?: boolean;
    }
  | {
      intent: "register";
      redirectTo: string;
      fullName: string;
      phone: string;
      collegeName?: string;
      disabled?: boolean;
    };

export function GoogleSignInButton(props: GoogleSignInButtonProps) {
  const { redirectTo, disabled = false } = props;
  const label =
    props.intent === "login" ? messages.auth.signInWithGoogle : messages.auth.signUpWithGoogle;

  if (disabled) {
    return (
      <span
        aria-disabled
        className={`${sharedClass} cursor-not-allowed border-slate-200 bg-slate-50 text-slate-400 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-500`}
      >
        <GoogleIcon muted />
        {label}
      </span>
    );
  }

  if (props.intent === "login") {
    const href = `/api/auth/google?next=${encodeURIComponent(redirectTo)}&intent=login`;

    return (
      <a
        href={href}
        className={`${sharedClass} border-slate-200 bg-white text-slate-800 shadow-sm transition hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700`}
      >
        <GoogleIcon />
        {label}
      </a>
    );
  }

  const { fullName, phone, collegeName = "" } = props;

  return (
    <form method="POST" action="/api/auth/google" className="w-full">
      <input type="hidden" name="intent" value="register" />
      <input type="hidden" name="next" value={redirectTo} />
      <input type="hidden" name="fullName" value={fullName.trim()} />
      <input type="hidden" name="phone" value={phone} />
      {collegeName.trim() ? <input type="hidden" name="collegeName" value={collegeName.trim()} /> : null}
      <button
        type="submit"
        className={`${sharedClass} border-slate-200 bg-white text-slate-800 shadow-sm transition hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700`}
      >
        <GoogleIcon />
        {label}
      </button>
    </form>
  );
}

function GoogleIcon({ muted = false }: { muted?: boolean }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      aria-hidden
      className={muted ? "opacity-50" : undefined}
    >
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}
