import React, { useEffect, useState } from "react";

/**
 * InstallAppPrompt — shows a slim bottom banner when the browser fires
 * `beforeinstallprompt`. Dismissed selection persists for 30 days.
 */
const DISMISS_KEY = "viva_install_dismissed_until";

export default function InstallAppPrompt() {
  const [deferred, setDeferred] = useState(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const dismissUntil = parseInt(localStorage.getItem(DISMISS_KEY) || "0", 10);
    if (Date.now() < dismissUntil) return;

    const onPrompt = (e) => {
      e.preventDefault();
      setDeferred(e);
      setVisible(true);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);

    const onInstalled = () => {
      setVisible(false);
      setDeferred(null);
      localStorage.setItem(DISMISS_KEY, String(Date.now() + 365 * 24 * 60 * 60 * 1000));
    };
    window.addEventListener("appinstalled", onInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  if (!visible || !deferred) return null;

  const dismiss = () => {
    localStorage.setItem(DISMISS_KEY, String(Date.now() + 30 * 24 * 60 * 60 * 1000));
    setVisible(false);
  };

  const install = async () => {
    try {
      await deferred.prompt();
      await deferred.userChoice;
    } catch {}
    setVisible(false);
    setDeferred(null);
  };

  return (
    <div className="fixed bottom-20 sm:bottom-4 inset-x-3 sm:inset-x-auto sm:right-4 z-[60] max-w-sm mx-auto sm:mx-0">
      <div className="rounded-2xl shadow-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-4 flex items-center gap-3">
        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-md shrink-0">
          <span className="text-white text-xl">⚡</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-slate-900 dark:text-white">Install ReachRipple</p>
          <p className="text-xs text-slate-600 dark:text-slate-400 truncate">Faster, full-screen, one-tap launch.</p>
        </div>
        <button
          onClick={dismiss}
          className="text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 px-2 py-1 no-tap-min"
        >
          Later
        </button>
        <button
          onClick={install}
          className="rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold px-3 py-2 shadow-sm shadow-amber-500/30 transition"
        >
          Install
        </button>
      </div>
    </div>
  );
}
