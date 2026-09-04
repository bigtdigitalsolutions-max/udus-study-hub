import { useEffect, useState } from "react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

const DISMISS_KEY = "pwa-install-dismissed";

/**
 * Custom PWA install banner. Captures the `beforeinstallprompt` event and
 * shows a stylish bottom banner with Install / Dismiss actions.
 * Manifest-only home-screen support — no service worker.
 */
export function InstallBanner() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(
    null,
  );
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Respect a previous dismiss for ~14 days.
    try {
      const dismissedAt = Number(localStorage.getItem(DISMISS_KEY) ?? 0);
      if (dismissedAt && Date.now() - dismissedAt < 14 * 86400000) return;
    } catch {
      // ignore storage errors
    }

    const onPrompt = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
      setVisible(true);
    };

    const onInstalled = () => {
      setDeferred(null);
      setVisible(false);
    };

    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  if (!visible || !deferred) return null;

  const install = async () => {
    try {
      await deferred.prompt();
      const { outcome } = await deferred.userChoice;
      if (outcome === "accepted" || outcome === "dismissed") {
        setVisible(false);
        setDeferred(null);
        if (outcome === "dismissed") {
          try {
            localStorage.setItem(DISMISS_KEY, String(Date.now()));
          } catch {
            // ignore
          }
        }
      }
    } catch {
      setVisible(false);
    }
  };

  const dismiss = () => {
    setVisible(false);
    try {
      localStorage.setItem(DISMISS_KEY, String(Date.now()));
    } catch {
      // ignore
    }
  };

  return (
    <div
      role="dialog"
      aria-label="Install app prompt"
      className="fixed inset-x-0 bottom-0 z-50 px-4 pb-4"
    >
      <div className="glossy mx-auto flex max-w-md items-center gap-3 rounded-2xl px-4 py-3 shadow-2xl">
        <div className="chrome grid size-10 shrink-0 place-items-center rounded-xl shadow">
          <span className="font-display text-sm font-extrabold text-ink">
            SV
          </span>
        </div>
        <p className="flex-1 font-mono text-[12px] leading-tight text-ink">
          Install UDUS Vault App for fast access
        </p>
        <button
          onClick={dismiss}
          aria-label="Dismiss install prompt"
          className="shrink-0 rounded-full px-2 py-1 font-mono text-[11px] text-ink/60 ring-1 ring-ink/20"
        >
          ✕
        </button>
        <button
          onClick={install}
          className="shrink-0 rounded-full bg-ink px-4 py-2 font-mono text-[12px] font-bold text-cream"
        >
          Install
        </button>
      </div>
    </div>
  );
}
