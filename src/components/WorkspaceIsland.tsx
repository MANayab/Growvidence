import { useEffect, useMemo, useState } from "react";
import type { SyntheticEvent } from "react";

import {
  addLocalDays,
  addLocalMonths,
  dateRangeFor,
  isDateInRange,
  localDateKey,
  type CalendarView,
} from "../domain/dates";
import {
  openPersistence,
  PersistenceError,
  type PersistenceHandle,
  type StorageNotice,
} from "../persistence";
import TaskBoard from "./TaskBoard";
import JournalView from "./JournalView";
import CompetenciesView from "./CompetenciesView";
import type {
  Task,
  TaskPriority,
  TaskStatus,
  ThemePreference,
  Track,
} from "../persistence/schemas";

const navigation = [
  { id: "tracks", label: "Tracks" },
  { id: "tasks", label: "Tasks" },
  { id: "journal", label: "Journal" },
  { id: "competencies", label: "Competencies" },
  { id: "settings", label: "Settings" },
] as const;
type WorkspaceRoute = (typeof navigation)[number]["id"];
const routeIds = new Set<string>(navigation.map((item) => item.id));
const statuses: Array<{ value: TaskStatus; label: string }> = [
  { value: "backlog", label: "Backlog" },
  { value: "today", label: "Today" },
  { value: "in_progress", label: "In progress" },
  { value: "review", label: "Review" },
  { value: "done", label: "Done" },
];
const starterTracks = [
  {
    title: "Independent coding",
    description: "Build and explain working solutions independently.",
  },
  {
    title: "Debugging",
    description: "Reproduce defects, test hypotheses and verify fixes.",
  },
  {
    title: "Architecture",
    description: "Describe system boundaries and compare design trade-offs.",
  },
  {
    title: "Testing",
    description: "Practice behavior, boundary and regression testing.",
  },
  {
    title: "Commercial validation",
    description: "Validate real user problems with ethical evidence.",
  },
  {
    title: "Technical fundamentals",
    description: "Apply and explain core language, browser and data concepts.",
  },
];

function getRoute(): WorkspaceRoute {
  const route = window.location.hash.replace(/^#\/?/, "").split("/")[0];
  return routeIds.has(route) ? (route as WorkspaceRoute) : "tracks";
}
function applyTheme(theme: ThemePreference): void {
  if (theme === "system")
    document.documentElement.removeAttribute("data-theme");
  else document.documentElement.dataset.theme = theme;
}
function describeError(notice: StorageNotice): string {
  switch (notice.code) {
    case "upgrade-blocked":
      return "Another Growvidence tab is using an older database connection. Close other tabs or reload the stale tab. No records were deleted.";
    case "quota-exceeded":
      return "Browser storage is full. This save did not complete; existing records were not removed.";
    case "storage-cleared":
      return "The local database closed unexpectedly. Browser site data may have been cleared; deleted data cannot be recovered by Growvidence.";
    case "migration-failed":
      return "Growvidence could not safely upgrade local data. The previous database was retained. Close other tabs and reload; do not clear site data.";
    case "storage-unavailable":
      return "Browser storage is unavailable in this context. Private-browsing restrictions or browser settings may prevent saving.";
    default:
      return notice.message;
  }
}
function makeRecordBase(existing?: { id: string; createdAt: string }) {
  const now = new Date().toISOString();
  return {
    id: existing?.id ?? crypto.randomUUID(),
    schemaVersion: 1,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
    deletedAt: null,
  };
}
function statusLabel(status: TaskStatus): string {
  return statuses.find((item) => item.value === status)?.label ?? status;
}

export default function WorkspaceIsland() {
  const [route, setRoute] = useState<WorkspaceRoute>("tracks");
  const [notice, setNotice] = useState<StorageNotice>({
    code: "storage-unavailable",
    message: "Opening local storage…",
  });
  const [ready, setReady] = useState(false);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [deletedTasks, setDeletedTasks] = useState<Task[]>([]);
  const [journalEntries, setJournalEntries] = useState<import("../persistence/schemas").JournalEntry[]>([]);
  const [theme, setTheme] = useState<ThemePreference>("system");
  const [persistence, setPersistence] = useState<PersistenceHandle | null>(
    null,
  );
  const [saving, setSaving] = useState(false);
  const [trackTitle, setTrackTitle] = useState("");
  const [trackDescription, setTrackDescription] = useState("");
  const [editingTrackId, setEditingTrackId] = useState<string | null>(null);
  const [taskId, setTaskId] = useState<string | null>(null);
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [taskTrackId, setTaskTrackId] = useState("");
  const [taskStatus, setTaskStatus] = useState<TaskStatus>("backlog");
  const [taskPriority, setTaskPriority] = useState<TaskPriority>("normal");
  const [taskDueDate, setTaskDueDate] = useState("");
  const [taskEstimate, setTaskEstimate] = useState("");
  const [taskActual, setTaskActual] = useState("");
  const [taskTags, setTaskTags] = useState("");
  const [view, setView] = useState<"list" | "board">("list");
  const [calendarView, setCalendarView] = useState<"all" | CalendarView>("all");
  const [selectedDate, setSelectedDate] = useState(localDateKey(new Date()));
  const [filterTrack, setFilterTrack] = useState("all");

  useEffect(() => {
    const updateRoute = () => setRoute(getRoute());
    window.addEventListener("hashchange", updateRoute);
    updateRoute();
    return () => window.removeEventListener("hashchange", updateRoute);
  }, []);

  async function refresh(handle: PersistenceHandle): Promise<void> {
    const [savedSettings, savedTracks, allTasks, allJournalEntries] = await Promise.all([
      handle.settings.get(),
      handle.tracks.list(true, true),
      handle.tasks.list({ includeDeleted: true }),
      handle.journal.list({ includeDeleted: true }),
    ]);
    setTracks(savedTracks);
    setTasks(allTasks.filter((task) => task.deletedAt === null));
    setDeletedTasks(allTasks.filter((task) => task.deletedAt !== null));
    setJournalEntries(allJournalEntries.filter((entry) => entry.deletedAt === null));
    if (savedSettings) {
      setTheme(savedSettings.theme);
      applyTheme(savedSettings.theme);
    }
  }
  useEffect(() => {
    let active = true;
    let handle: PersistenceHandle | null = null;
    void openPersistence({
      onNotice: (next) => {
        if (active) setNotice(next);
      },
    })
      .then(async (opened) => {
        handle = opened;
        if (!active) {
          opened.close();
          return;
        }
        setPersistence(opened);
        await refresh(opened);
        if (!active) return;
        setReady(true);
        setNotice({ code: "ready", message: "Saved locally in this browser." });
      })
      .catch((error: unknown) => {
        if (!active) return;
        setNotice({
          code:
            error instanceof PersistenceError
              ? error.code
              : "storage-unavailable",
          message:
            error instanceof Error
              ? error.message
              : "Could not open local storage.",
        });
      });
    return () => {
      active = false;
      handle?.close();
    };
  }, []);

  async function perform(
    action: () => Promise<unknown>,
    success: string,
  ): Promise<boolean> {
    if (!persistence || saving) return false;
    setSaving(true);
    try {
      await action();
      await refresh(persistence);
      setNotice({ code: "ready", message: success });
      return true;
    } catch (error) {
      setNotice({
        code: error instanceof PersistenceError ? error.code : "unknown",
        message:
          error instanceof Error
            ? error.message
            : "The change could not be saved.",
      });
      return false;
    } finally {
      setSaving(false);
    }
  }
  async function changeTheme(next: ThemePreference): Promise<void> {
    if (!persistence || saving) return;
    setSaving(true);
    try {
      await persistence.settings.save(next);
      setTheme(next);
      applyTheme(next);
      setNotice({
        code: "ready",
        message: "Theme preference saved on this device.",
      });
    } catch (error) {
      setNotice({
        code: error instanceof PersistenceError ? error.code : "unknown",
        message:
          error instanceof Error ? error.message : "Theme could not be saved.",
      });
    } finally {
      setSaving(false);
    }
  }
  async function saveTrack(
    event: SyntheticEvent<HTMLFormElement>,
  ): Promise<void> {
    event.preventDefault();
    const existing = tracks.find((item) => item.id === editingTrackId);
    const base = makeRecordBase(existing);
    const saved = await perform(
      () =>
        persistence!.tracks.save({
          ...base,
          title: trackTitle,
          description: trackDescription,
          archivedAt: existing?.archivedAt ?? null,
        }),
      existing ? "Track updated." : "Track created.",
    );
    if (saved) {
      setTrackTitle("");
      setTrackDescription("");
      setEditingTrackId(null);
    }
  }
  async function addStarterTracks(): Promise<void> {
    if (!persistence || saving) return;
    await perform(async () => {
      for (const item of starterTracks)
        await persistence!.tracks.save({
          ...makeRecordBase(),
          title: item.title,
          description: item.description,
          archivedAt: null,
        });
    }, "Starter tracks added. You can rename or archive them any time.");
  }
  function editTask(task: Task): void {
    setTaskId(task.id);
    setTaskTitle(task.title);
    setTaskDescription(task.description);
    setTaskTrackId(task.trackId);
    setTaskStatus(task.status);
    setTaskPriority(task.priority);
    setTaskDueDate(task.dueDate ?? "");
    setTaskEstimate(
      task.estimatedMinutes === null ? "" : String(task.estimatedMinutes),
    );
    setTaskActual(
      task.actualMinutes === null ? "" : String(task.actualMinutes),
    );
    setTaskTags(task.tags.join(", "));
  }
  function clearTaskForm(): void {
    setTaskId(null);
    setTaskTitle("");
    setTaskDescription("");
    setTaskStatus("backlog");
    setTaskPriority("normal");
    setTaskDueDate("");
    setTaskEstimate("");
    setTaskActual("");
    setTaskTags("");
  }
  async function saveTask(
    event: SyntheticEvent<HTMLFormElement>,
  ): Promise<void> {
    event.preventDefault();
    const existing = tasks.find((item) => item.id === taskId);
    const base = makeRecordBase(existing);
    const record: Task = {
      ...base,
      trackId: taskTrackId,
      title: taskTitle,
      description: taskDescription,
      status: taskStatus,
      priority: taskPriority,
      dueDate: taskDueDate || null,
      estimatedMinutes: taskEstimate === "" ? null : Number(taskEstimate),
      actualMinutes: taskActual === "" ? null : Number(taskActual),
      tags: [
        ...new Set(
          taskTags
            .split(",")
            .map((tag) => tag.trim())
            .filter(Boolean),
        ),
      ],
    };
    const saved = await perform(
      () => persistence!.tasks.save(record),
      existing ? "Task updated." : "Task created.",
    );
    if (saved) clearTaskForm();
  }
  async function moveTask(id: string, status: TaskStatus): Promise<void> {
    await perform(
      () => persistence!.tasks.move(id, status),
      `Task moved to ${statusLabel(status)}.`,
    );
  }

  const activeTracks = tracks.filter(
    (track) => !track.archivedAt && !track.deletedAt,
  );
  const taskTrackOptions = tracks.filter(
    (track) =>
      !track.deletedAt && (!track.archivedAt || track.id === taskTrackId),
  );
  const canSaveTask =
    activeTracks.length > 0 ||
    Boolean(
      taskId && taskTrackOptions.some((track) => track.id === taskTrackId),
    );
  const range =
    calendarView === "all" ? null : dateRangeFor(selectedDate, calendarView);
  const visibleTasks = useMemo(
    () =>
      tasks.filter(
        (task) =>
          (filterTrack === "all" || task.trackId === filterTrack) &&
          (calendarView === "all" ||
            (range !== null && isDateInRange(task.dueDate, range))),
      ),
    [tasks, filterTrack, calendarView, range?.start, range?.end],
  );
  const activeItem = navigation.find((item) => item.id === route);

  return (
    <section className="workspace" aria-label="Learner workspace">
      <div className="workspace-frame">
        <aside className="workspace-sidebar" aria-label="Workspace navigation">
          <a className="workspace-brand" href={import.meta.env.BASE_URL}>
            <span className="workspace-mark" aria-hidden="true">
              G
            </span>
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
                {item.id !== "tracks" &&
                item.id !== "tasks" &&
                item.id !== "settings" &&
                item.id !== "journal" ? (
                  <span className="nav-status">Planned</span>
                ) : null}
              </a>
            ))}
          </nav>
          <p className="sidebar-note">
            Your learning data stays in this browser profile.
          </p>
        </aside>
        <div className="workspace-content">
          <header className="workspace-topbar">
            <div>
              <p className="workspace-eyebrow">Learner workspace</p>
              <h1>{activeItem?.label ?? "Workspace"}</h1>
            </div>
            <a className="public-site-link" href={import.meta.env.BASE_URL}>
              Public site
            </a>
          </header>
          <div className="storage-status" role="status" aria-live="polite">
            <span
              className={
                notice.code === "ready" ? "status-dot ready" : "status-dot"
              }
              aria-hidden="true"
            />
            <span>
              {notice.code === "ready" ? notice.message : describeError(notice)}
            </span>
          </div>
          <section
            className="workspace-main"
            id="workspace-main"
            aria-label="Current workspace section"
            tabIndex={-1}
          >
            {!ready ? (
              <section
                className="workspace-card"
                aria-labelledby="storage-heading"
              >
                <h2 id="storage-heading">Checking this browser's storage</h2>
                <p>
                  Growvidence is opening its local database. Learner records are
                  not uploaded.
                </p>
                {notice.message !== "Opening local storage…" ? (
                  <p className="error-detail">{describeError(notice)}</p>
                ) : null}
              </section>
            ) : route === "tracks" ? (
              <section
                className="workspace-card"
                aria-labelledby="tracks-heading"
              >
                <p className="workspace-eyebrow">Your learning paths</p>
                <h2 id="tracks-heading">Learning tracks</h2>
                {tracks.length === 0 ? (
                  <div className="empty-state">
                    <h3>No learning tracks yet</h3>
                    <p>
                      Create your own track or optionally add the six suggested
                      learning areas. Nothing is seeded automatically.
                    </p>
                  </div>
                ) : null}
                <form
                  className="workspace-form"
                  onSubmit={(event) => void saveTrack(event)}
                >
                  <h3>
                    {editingTrackId ? "Rename or edit track" : "Create a track"}
                  </h3>
                  <label>
                    Track name
                    <input
                      required
                      maxLength={120}
                      value={trackTitle}
                      onChange={(event) => setTrackTitle(event.target.value)}
                    />
                  </label>
                  <label>
                    Description
                    <textarea
                      maxLength={2000}
                      rows={2}
                      value={trackDescription}
                      onChange={(event) =>
                        setTrackDescription(event.target.value)
                      }
                    />
                  </label>
                  <div className="form-actions">
                    <button type="submit" disabled={saving || !persistence}>
                      {editingTrackId ? "Save track" : "Create track"}
                    </button>
                    {editingTrackId ? (
                      <button
                        type="button"
                        className="secondary"
                        onClick={() => {
                          setEditingTrackId(null);
                          setTrackTitle("");
                          setTrackDescription("");
                        }}
                      >
                        Cancel
                      </button>
                    ) : null}
                  </div>
                </form>
                {tracks.length === 0 ? (
                  <button
                    type="button"
                    className="secondary"
                    disabled={saving}
                    onClick={() => void addStarterTracks()}
                  >
                    Add six suggested starter tracks
                  </button>
                ) : null}
                <ul className="track-list">
                  {tracks.map((track) => (
                    <li className="track-card" key={track.id}>
                      <div className="card-heading">
                        <div>
                          <h3>{track.title}</h3>
                          {track.description ? (
                            <p>{track.description}</p>
                          ) : null}
                          <span>
                            {track.deletedAt
                              ? "Deleted"
                              : track.archivedAt
                                ? "Archived"
                                : "Active"}
                          </span>
                        </div>
                      </div>
                      <div className="form-actions">
                        {!track.deletedAt ? (
                          <button
                            type="button"
                            className="secondary"
                            onClick={() => {
                              setEditingTrackId(track.id);
                              setTrackTitle(track.title);
                              setTrackDescription(track.description);
                            }}
                          >
                            Edit
                          </button>
                        ) : null}
                        {!track.archivedAt && !track.deletedAt ? (
                          <button
                            type="button"
                            className="secondary"
                            disabled={saving}
                            onClick={() =>
                              void perform(
                                () => persistence!.tracks.archive(track.id),
                                "Track archived.",
                              )
                            }
                          >
                            Archive
                          </button>
                        ) : null}
                        {!track.deletedAt ? (
                          <button
                            type="button"
                            className="danger"
                            disabled={saving}
                            onClick={() => {
                              if (
                                window.confirm(
                                  "Soft-delete this track and its tasks? They will remain in JSON backups until permanently deleted.",
                                )
                              )
                                void perform(
                                  () =>
                                    persistence!.tracks.softDelete(track.id),
                                  "Track and its tasks moved to deleted records.",
                                );
                            }}
                          >
                            Delete
                          </button>
                        ) : null}
                        {track.deletedAt ? (
                          <button
                            type="button"
                            className="danger"
                            disabled={saving}
                            onClick={() => {
                              if (
                                window.confirm(
                                  "Permanently delete this track and every task in it? This cannot be undone. Soft-deleted items stay in backups until permanently deleted.",
                                )
                              )
                                void perform(
                                  () =>
                                    persistence!.tracks.permanentlyDelete(
                                      track.id,
                                    ),
                                  "Track and its tasks permanently deleted.",
                                );
                            }}
                          >
                            Permanently delete
                          </button>
                        ) : null}
                      </div>
                    </li>
                  ))}
                </ul>
              </section>
            ) : route === "tasks" ? (
              <section
                className="workspace-card"
                aria-labelledby="tasks-heading"
              >
                <p className="workspace-eyebrow">Plan practice, not mastery</p>
                <h2 id="tasks-heading">Tasks</h2>
                {activeTracks.length === 0 ? (
                  <div className="empty-state">
                    <h3>Create a track first</h3>
                    <p>
                      Tasks belong to an active learning track. Create or
                      restore a track before adding tasks.
                    </p>
                    <a href="#/tracks">Go to tracks</a>
                  </div>
                ) : null}
                <form
                  className="workspace-form"
                  onSubmit={(event) => void saveTask(event)}
                >
                  <h3>{taskId ? "Edit task" : "Create a task"}</h3>
                  <label>
                    Title
                    <input
                      required
                      maxLength={160}
                      value={taskTitle}
                      onChange={(event) => setTaskTitle(event.target.value)}
                    />
                  </label>
                  <label>
                    Description
                    <textarea
                      rows={3}
                      maxLength={5000}
                      value={taskDescription}
                      onChange={(event) =>
                        setTaskDescription(event.target.value)
                      }
                    />
                  </label>
                  <div className="form-grid">
                    <label>
                      Track
                      <select
                        required
                        value={taskTrackId}
                        onChange={(event) => setTaskTrackId(event.target.value)}
                      >
                        <option value="">Choose a track</option>
                        {taskTrackOptions.map((track) => (
                          <option key={track.id} value={track.id}>
                            {track.title}
                            {track.archivedAt ? " (archived)" : ""}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label>
                      Priority
                      <select
                        value={taskPriority}
                        onChange={(event) =>
                          setTaskPriority(event.target.value as TaskPriority)
                        }
                      >
                        <option value="low">Low</option>
                        <option value="normal">Normal</option>
                        <option value="high">High</option>
                      </select>
                    </label>
                    <label>
                      Status
                      <select
                        value={taskStatus}
                        onChange={(event) =>
                          setTaskStatus(event.target.value as TaskStatus)
                        }
                      >
                        {statuses.map((item) => (
                          <option key={item.value} value={item.value}>
                            {item.label}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label>
                      Due date
                      <input
                        type="date"
                        value={taskDueDate}
                        onChange={(event) => setTaskDueDate(event.target.value)}
                      />
                    </label>
                    <label>
                      Estimate (minutes)
                      <input
                        type="number"
                        min="0"
                        max="10080"
                        value={taskEstimate}
                        onChange={(event) =>
                          setTaskEstimate(event.target.value)
                        }
                      />
                    </label>
                    <label>
                      Actual minutes
                      <input
                        type="number"
                        min="0"
                        max="10080"
                        value={taskActual}
                        onChange={(event) => setTaskActual(event.target.value)}
                      />
                    </label>
                  </div>
                  <label>
                    Tags (comma separated)
                    <input
                      value={taskTags}
                      onChange={(event) => setTaskTags(event.target.value)}
                      placeholder="practice, portfolio, review"
                    />
                  </label>
                  <div className="form-actions">
                    <button
                      type="submit"
                      disabled={saving || !persistence || !canSaveTask}
                    >
                      {taskId ? "Save task" : "Add task"}
                    </button>
                    {taskId ? (
                      <button
                        type="button"
                        className="secondary"
                        onClick={clearTaskForm}
                      >
                        Cancel edit
                      </button>
                    ) : null}
                  </div>
                </form>
                <div className="task-toolbar">
                  <div
                    className="view-switch"
                    role="group"
                    aria-label="Task presentation"
                  >
                    <button
                      type="button"
                      aria-pressed={view === "list"}
                      onClick={() => setView("list")}
                    >
                      List
                    </button>
                    <button
                      type="button"
                      aria-pressed={view === "board"}
                      onClick={() => setView("board")}
                    >
                      Status board
                    </button>
                  </div>
                  <label>
                    Track filter
                    <select
                      value={filterTrack}
                      onChange={(event) => setFilterTrack(event.target.value)}
                    >
                      <option value="all">All tracks</option>
                      {activeTracks.map((track) => (
                        <option key={track.id} value={track.id}>
                          {track.title}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
                <div className="calendar-toolbar">
                  <label>
                    Calendar range
                    <select
                      value={calendarView}
                      onChange={(event) =>
                        setCalendarView(event.target.value as CalendarView)
                      }
                    >
                      <option value="all">All dates</option>
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                    </select>
                  </label>
                  <label>
                    Anchor date
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={(event) =>
                        setSelectedDate(
                          event.target.value || localDateKey(new Date()),
                        )
                      }
                    />
                  </label>
                  <button
                    type="button"
                    className="secondary"
                    disabled={calendarView === "all"}
                    onClick={() =>
                      setSelectedDate(
                        calendarView === "monthly"
                          ? addLocalMonths(selectedDate, -1)
                          : addLocalDays(
                              selectedDate,
                              calendarView === "daily" ? -1 : -7,
                            ),
                      )
                    }
                  >
                    Previous
                  </button>
                  <button
                    type="button"
                    className="secondary"
                    disabled={calendarView === "all"}
                    onClick={() =>
                      setSelectedDate(
                        calendarView === "monthly"
                          ? addLocalMonths(selectedDate, 1)
                          : addLocalDays(
                              selectedDate,
                              calendarView === "daily" ? 1 : 7,
                            ),
                      )
                    }
                  >
                    Next
                  </button>
                  <span className="range-label">
                    {range ? `${range.start} – ${range.end}` : "All dates"}
                  </span>
                </div>
                {visibleTasks.length === 0 ? (
                  <div className="empty-state">
                    <h3>No tasks in this view</h3>
                    <p>
                      Create a task or change the selected date, range or track
                      filter.
                    </p>
                  </div>
                ) : view === "list" ? (
                  <ul className="task-list">
                    {visibleTasks.map((task) => (
                      <li className="task-card" key={task.id}>
                        <div>
                          <h3>{task.title}</h3>
                          <p>
                            {tracks.find((track) => track.id === task.trackId)
                              ?.title ?? "Unknown track"}{" "}
                            · {statusLabel(task.status)} · {task.priority}{" "}
                            priority
                          </p>
                          {task.description ? <p>{task.description}</p> : null}
                          <p>
                            {task.dueDate
                              ? `Due ${task.dueDate}`
                              : "No due date"}
                            {task.tags.length
                              ? ` · ${task.tags.join(", ")}`
                              : ""}
                          </p>
                        </div>
                        <div className="form-actions">
                          <button
                            type="button"
                            className="secondary"
                            onClick={() => editTask(task)}
                          >
                            Edit
                          </button>
                          <label className="move-control">
                            Move to…
                            <select
                              aria-label={`Move ${task.title} to status`}
                              value={task.status}
                              onChange={(event) =>
                                void moveTask(
                                  task.id,
                                  event.target.value as TaskStatus,
                                )
                              }
                            >
                              {statuses.map((item) => (
                                <option key={item.value} value={item.value}>
                                  {item.label}
                                </option>
                              ))}
                            </select>
                          </label>
                          <button
                            type="button"
                            className="danger"
                            onClick={() => {
                              if (
                                window.confirm(
                                  "Soft-delete this task? It remains in JSON backups until permanently deleted.",
                                )
                              )
                                void perform(
                                  () => persistence!.tasks.softDelete(task.id),
                                  "Task moved to deleted records.",
                                );
                            }}
                          >
                            Delete
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <TaskBoard
                    tasks={visibleTasks}
                    tracks={tracks}
                    onMove={(id, status) => void moveTask(id, status)}
                    onEdit={editTask}
                    onDelete={(task) => {
                      if (
                        window.confirm(
                          "Soft-delete this task? It remains in JSON backups until permanently deleted.",
                        )
                      )
                        void perform(
                          () => persistence!.tasks.softDelete(task.id),
                          "Task moved to deleted records.",
                        );
                    }}
                  />
                )}
                {deletedTasks.length > 0 ? (
                  <section
                    className="deleted-records"
                    aria-labelledby="deleted-tasks-heading"
                  >
                    <h3 id="deleted-tasks-heading">Deleted tasks</h3>
                    <p>
                      Soft-deleted tasks remain in JSON backups until
                      permanently deleted.
                    </p>
                    <ul className="task-list">
                      {deletedTasks.map((task) => (
                        <li className="task-card" key={task.id}>
                          <span>{task.title}</span>
                          <button
                            type="button"
                            className="danger"
                            disabled={saving}
                            onClick={() => {
                              if (
                                window.confirm(
                                  "Permanently delete this task? This cannot be undone. It will no longer appear in future backups.",
                                )
                              )
                                void perform(
                                  () =>
                                    persistence!.tasks.permanentlyDelete(
                                      task.id,
                                    ),
                                  "Task permanently deleted.",
                                );
                            }}
                          >
                            Permanently delete
                          </button>
                        </li>
                      ))}
                    </ul>
                  </section>
                ) : null}
              </section>
            ) : route === "journal" && persistence ? (
              <JournalView
                persistence={persistence}
                tracks={tracks}
                tasks={tasks}
                saving={saving}
                onRefresh={() => refresh(persistence)}
              />
            ) : route === "competencies" && persistence ? (
              <CompetenciesView persistence={persistence} journals={journalEntries} tasks={tasks} />
            ) : route === "settings" ? (
              <section
                className="workspace-card"
                aria-labelledby="settings-heading"
              >
                <p className="workspace-eyebrow">Local preferences</p>
                <h2 id="settings-heading">Appearance</h2>
                <p>Theme preference is stored in this browser's IndexedDB.</p>
                <div
                  className="theme-control"
                  role="group"
                  aria-label="Color theme"
                >
                  {(["system", "light", "dark"] as const).map((option) => (
                    <button
                      aria-pressed={theme === option}
                      disabled={saving || !persistence}
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
              <section
                className="workspace-card"
                aria-labelledby="planned-heading"
              >
                <p className="workspace-eyebrow">Not in this slice</p>
                <h2 id="planned-heading">{activeItem?.label}</h2>
                <p>
                  This section is not available yet. No{" "}
                  {activeItem?.label.toLowerCase()} data is being collected.
                </p>
              </section>
            )}
          </section>
          <footer className="workspace-footer">
            <p>Task completion is activity, not proof of competency.</p>
            <p>Browser storage can be cleared and is not a backup.</p>
          </footer>
        </div>
      </div>
    </section>
  );
}
