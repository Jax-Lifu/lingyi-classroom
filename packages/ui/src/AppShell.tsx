import { lazy, Suspense, useCallback, useEffect, useRef, useState } from "react";
import { resolveLocale, type Platform } from "@lingyi-classroom/shared";
import { initI18n, useTranslation } from "@lingyi-classroom/i18n";
import { useSettings } from "./store/settings";
import { applyAppearance, watchSystemTheme } from "./theme";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { Button } from "./components/button";
import { LearningApp } from "./learning/LearningApp";

import "./styles/theme.css";

const SettingsPage = lazy(() => import("./pages/SettingsPage").then((m) => ({ default: m.SettingsPage })));

type Route = "home" | "settings";
const readRoute = (): Route => window.location.hash === "#/settings" ? "settings" : "home";

export function AppShell({ platform, onReady, onError }: {
  platform: Platform;
  onReady?: () => void | Promise<void>;
  onError?: (error: unknown) => void;
}) {
  const { t } = useTranslation();
  const { ready, error, readFailed } = useSettings();
  const [route, setRoute] = useState<Route>(readRoute);
  const [startupError, setStartupError] = useState("");
  const notified = useRef(false);
  const navigate = useCallback((next: Route) => {
    setRoute(next);
    if (readRoute() !== next) {
      window.location.hash = next === "home" ? "/" : "/settings";
    }
  }, []);

  useEffect(() => {
    const onHashChange = () => setRoute(readRoute());
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  useEffect(() => {
    let active = true;
    void useSettings.getState().hydrate(platform).then(async () => {
      if (!active || notified.current) return;
      notified.current = true;
      await onReady?.();
    }).catch((error: unknown) => {
      if (active) setStartupError(error instanceof Error ? error.message : String(error));
      onError?.(error);
    });
    return () => { active = false; };
  }, [platform, onReady, onError]);

  useEffect(() => useSettings.getState().watch(platform), [platform]);

  useEffect(() => { if (error) onError?.(error); }, [error, onError]);

  useEffect(() => watchSystemTheme(() => {
    const { settings, readFailed } = useSettings.getState();
    applyAppearance(settings, !readFailed);
  }), []);

  useEffect(() => {
    const onLanguage = () => {
      const { locale } = useSettings.getState().settings;
      if (locale === "system") {
        const resolved = resolveLocale(locale);
        void Promise.all([initI18n(resolved), platform.setNativeLocale?.(resolved)]).catch((error: unknown) => {
          setStartupError(error instanceof Error ? error.message : String(error));
          onError?.(error);
        });
      }
    };
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && !event.altKey && !event.shiftKey && event.key === ",") {
        event.preventDefault();
        navigate("settings");
      }
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("languagechange", onLanguage);
    return () => { window.removeEventListener("keydown", onKey); window.removeEventListener("languagechange", onLanguage); };
  }, [onError, navigate]);

  return <ErrorBoundary onError={onError}>
    <>
        {(error || startupError) && <div className="error-banner" role="alert">
          <div><strong>{readFailed ? t("error.settingsRead") : error ? t("error.settingsSave") : t("error.operation")}</strong><p>{error?.message || startupError}</p></div>
          {readFailed ? <Button variant="outline" onClick={() => {
            setStartupError("");
            void useSettings.getState().hydrate(platform, true).catch((error: unknown) => onError?.(error));
          }}>{t("error.retry")}</Button>
            : <Button variant="outline" onClick={() => location.reload()}>{t("error.reload")}</Button>}
        </div>}
      <Suspense fallback={<p className="loading-state" role="status">{t("app.loading")}</p>}>
      {!ready ? <p className="loading-state" role="status">{t("app.loading")}</p> : route === "home"
        ? <LearningApp platform={platform} onOpenSettings={() => navigate("settings")} />
        : <main className="workspace">
            <nav className="workspace-bar" aria-label={t("nav.label")}>
              <Button variant="ghost" onClick={() => navigate("home")}><span aria-hidden="true">←</span>{t("nav.home")}</Button>
            </nav>
            <SettingsPage platform={platform} onError={onError} />
          </main>}
      </Suspense>
    </>
  </ErrorBoundary>;
}
