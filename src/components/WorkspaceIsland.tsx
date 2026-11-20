import { useEffect, useState } from "react";

import {
  openPersistence,
  PersistenceError,
  type PersistenceHandle,
  type StorageNotice,
} from "../persistence";
import type { ThemePreference, Track } from "../persistence/schemas";

const navigation = [
  { id: "tracks", label: "Tracks" },
  { id: "tasks", label: "Tasks" },
  { id: "journal", label: "Journal" },
  { id: "competencies", label: "Competencies" },
  { id: "settings", label: "Settings" },
] as const;

type WorkspaceRoute = (typeof navigation)[number]["id"];
const routeIds = new Set<string>(navigation.map((item) => item.id));

function getRoute(): WorkspaceRoute {
  const route = window.location.hash.replace(/^#\/?/, "").split("/")[0];
  return routeIds.has(route) ? (route as WorkspaceRoute) : "tracks";
}

function applyTheme(theme: ThemePreference): void {
  if (theme === "system") document.documentElement.removeAttribute("data-theme");
  else document.documentElement.dataset.theme = theme;
}

function describeError(notice: StorageNotice): string {
  switch (notice.code) {
    case "upgrade-blocked":
      return "Another Growvidence tab is using an older database connection. Close other Growvidence tabs or reload the stale tab. No records were deleted.";
    case "quota-exceeded":
      return "Your browser could not save this change because storage is full. The save did not complete and existing records were not removed. Free browser storage, then retry.";
    case "storage-cleared":
      return "The browser closed the local database unexpectedly. Site data may have been cleared or storage may be unavailable. Reload to check; deleted browser data cannot be recovered by Growvidence.";
    case "migration-failed":
      return "Growvidence could not safely upgrade its local data. The existing database was not deliberately replaced. Close other tabs and reload; do not clear site data if you need to preserve existing records.";
    case "storage-unavailable":
      return "Browser storage is unavailable in this context. Private-browsing restrictions or browser settings may prevent saving. No save has been reported as successful.";
    default:
      return notice.message;
  }
}

export default function WorkspaceIsland() {
  const [route, setRoute] = useState<WorkspaceRoute>("tracks");
  const [notice, setNotice] = useState<StorageNotice>({
    code: "storage-unavailable",
    message: "Opening local storage…",
  });
  const [ready, setReady] = useState(false);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [theme, setTheme] = useState<ThemePreference>("system");
  const [persistence, setPersistence] = useState<PersistenceHandle | null>(null);
  const [savingTheme, setSavingTheme] = useState(false);

  useEffect(() => {
    const updateRoute = () => setRoute(getRoute());
    window.addEventListener("hashchange", updateRoute);
    updateRoute();
    return () => window.removeEventListener("hashchange", updateRoute);
  }, []);

  useEffect(() => {
    let active = true;
    let handle: PersistenceHandle | null = null;
    void openPersistence({
      onNotice: (nextNotice) => {
        if (active) setNotice(nextNotice);
      },
    })
      .then(async (opened) => {
        handle = opened;
        if (!active) {
          opened.close();
          return;
        }
        setPersistence(opened);
        const [savedSettings, savedTracks] = await Promise.all([
          opened.settings.get(),
          opened.tracks.list(),
        ]);
        if (!active) return;
        if (savedSettings) {
          setTheme(savedSettings.theme);
          applyTheme(savedSettings.theme);
        }
        setTracks(savedTracks);
        setReady(true);
        setNotice({ code: "ready", message: "Local storage is ready." });
      })
      .catch((error: unknown) => {
        if (!active) return;
        const message = error instanceof PersistenceError
          ? error.message
          : "Growvidence could not open browser storage. No existing database was deleted.";
        setNotice({
          code: error instanceof PersistenceError ? error.code : "storage-unavailable",
          message,
        });
      });
    return () => {
      active = false;
      handle?.close();
    };
  }, []);

  async function changeTheme(nextTheme: ThemePreference): Promise<void> {
    if (!persistence || savingTheme) return;
    setSavingTheme(true);
    try {
      await persistence.settings.save(nextTheme);
      setTheme(nextTheme);
      applyTheme(nextTheme);
      setNotice({ code: "ready", message: "Theme preference saved on this device." });
    } catch (error) {
      const nextNotice: StorageNotice = error instanceof PersistenceError
        ? { code: error.code, message: error.message }
        : {
            code: "storage-unavailable",
            message: "The theme preference could not be saved. Your previous setting remains unchanged.",
          };
      setNotice(nextNotice);
    } finally {
      setSavingTheme(false);
    }
  }

  const activeItem = navigation.find((item) => item.id === route);

  return (
    <section className="workspace" aria-label="Learner workspace">
      <div className="workspace-frame">
        <aside className="workspace-sidebar" aria-label="Workspace navigation">
          <a className="workspace-brand" href={import.meta.env.BASE_URL}>
            <span className="workspace-mark" aria-hidden="true">G</span>
            <span>Growvidence</span>
          </a>
          <nav className="workspace-nav" aria-label="Workspace sections">
            {navigation.map((item) => (
              <a
                aria-current={route === item.id ? "page" : undefined}
                className="workspace-nav-link"
                href={`#/${item.id}`}
                key={item.id}
              >
                {item.label}
                {item.id !== "tracks" && item.id !== "settings" ? (
                  <span className="nav-status">Planned</span>
                ) : null}
              </a>
            ))}
          </nav>
          <p className="sidebar-note">Your learning data stays in this browser profile.</p>
        </aside>
        <div className="workspace-content">
          <header className="workspace-topbar">
            <div>
              <p className="workspace-eyebrow">Learner workspace</p>
              <h1>{activeItem?.label ?? "Workspace"}</h1>
            </div>
            <a className="public-site-link" href={import.meta.env.BASE_URL}>Public site</a>
          </header>
          <div className="storage-status" role="status" aria-live="polite">
            <span className={notice.code === "ready" ? "status-dot ready" : "status-dot"} aria-hidden="true" />
            <span>{notice.code === "ready" ? notice.message : describeError(notice)}</span>
          </div>
          <main className="workspace-main" id="workspace-main" tabIndex={-1}>
            {!ready ? (
              <section className="workspace-card" aria-labelledby="storage-heading">
                <h2 id="storage-heading">Checking this browser's storage</h2>
                <p>Growvidence is opening its local database. Learner records are not uploaded.</p>
                {notice.code !== "ready" && notice.message !== "Opening local storage…" ? (
                  <p className="error-detail">{describeError(notice)}</p>
                ) : null}
              </section>
            ) : route === "tracks" ? (
              <section className="workspace-card" aria-labelledby="tracks-heading">
                <p className="workspace-eyebrow">Your learning paths</p>
                <h2 id="tracks-heading">Learning tracks</h2>
                {tracks.length === 0 ? (
                  <div className="empty-state">
                    <span className="empty-icon" aria-hidden="true">↗</span>
                    <h3>No learning tracks yet</h3>
                    <p>Your workspace is ready, but you have not created a track. Track creation and editing are part of Slice 2.</p>
                  </div>
                ) : (
                  <ul className="track-list">
                    {tracks.map((track) => (
                      <li className="track-card" key={track.id}>
                        <h3>{track.title}</h3>
                        {track.description ? <p>{track.description}</p> : null}
                        <span>{track.archivedAt ? "Archived" : "Active"}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            ) : route === "settings" ? (
              <section className="workspace-card" aria-labelledby="settings-heading">
                <p className="workspace-eyebrow">Local preferences</p>
                <h2 id="settings-heading">Appearance</h2>
                <p>Choose how this workspace is displayed. The preference is stored in this browser's IndexedDB.</p>
                <div className="theme-control" role="group" aria-label="Color theme">
                  {(["system", "light", "dark"] as const).map((option) => (
                    <button
                      aria-pressed={theme === option}
                      disabled={savingTheme || !persistence}
                      key={option}
                      onClick={() => void changeTheme(option)}
                      type="button"
                    >
                      {option[0].toUpperCase() + option.slice(1)}
                    </button>
                  ))}
                </div>
              </section>
            ) : (
              <section className="workspace-card" aria-labelledby="planned-heading">
                <p className="workspace-eyebrow">Not in this slice</p>
                <h2 id="planned-heading">{activeItem?.label}</h2>
                <p>This section is not available yet. Slice 1 provides the app shell, settings storage and minimal tracks repository. No {activeItem?.label.toLowerCase()} data is being collected.</p>
              </section>
            )}
          </main>
          <footer className="workspace-footer">
            <p>Task completion is activity, not proof of competency.</p>
            <p>Browser storage can be cleared and is not a backup.</p>
          </footer>
        </div>
      </div>
    </section>
  );
}
