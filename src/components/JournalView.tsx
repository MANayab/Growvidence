import "./JournalView.css";
import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import { filterJournalEntries, summarizeJournal, AI_USE_MODES } from "../domain/journal";
import type { PersistenceHandle } from "../persistence";
import type { AiUseMode, JournalEntry, Task, Track } from "../persistence/schemas";

interface Props {
  persistence: PersistenceHandle;
  tracks: Track[];
  tasks: Task[];
  saving: boolean;
  onRefresh: () => Promise<void>;
}
const modeLabels: Record<AiUseMode, string> = {
  assisted: "AI assisted",
  unassisted: "No AI assistance",
  partially_assisted: "Partially assisted",
  unknown: "Unknown",
  not_recorded: "Not recorded",
};
const localDate = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
};
export default function JournalView({ persistence, tracks, tasks, saving, onRefresh }: Props) {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [editing, setEditing] = useState<JournalEntry | null>(null);
  const [title, setTitle] = useState("");
  const [learned, setLearned] = useState("");
  const [blocked, setBlocked] = useState("");
  const [next, setNext] = useState("");
  const [trackId, setTrackId] = useState("");
  const [taskId, setTaskId] = useState("");
  const [confidence, setConfidence] = useState("3");
  const [minutes, setMinutes] = useState("0");
  const [date, setDate] = useState(localDate());
  const [mode, setMode] = useState<AiUseMode>("not_recorded");
  const [tool, setTool] = useState("");
  const [generated, setGenerated] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [filterTrack, setFilterTrack] = useState("all");
  const [filterMode, setFilterMode] = useState<AiUseMode | "all">("all");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{ title?: string; confidence?: string; minutes?: string; date?: string }>({});
  const headingRef = useRef<HTMLHeadingElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const titleRef = useRef<HTMLInputElement>(null);
  async function reload() {
    try {
      setEntries(await persistence.journal.list({ includeDeleted: true }));
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Could not load journal records.");
    }
  }
  useEffect(() => {
    void reload();
  }, [persistence]);
  const activeEntries = entries.filter((entry) => entry.deletedAt === null);
  const deletedEntries = entries.filter((entry) => entry.deletedAt !== null);
  const dateRangeError = Boolean(startDate && endDate && endDate < startDate);\n  const visible = dateRangeError ? [] : filterJournalEntries(activeEntries, { trackId: filterTrack, startDate, endDate, aiUseMode: filterMode });
  const summary = summarizeJournal(activeEntries);
  function clearForm() {
    setEditing(null);
    setTitle(""); setLearned(""); setBlocked(""); setNext("");
    setTrackId(""); setTaskId(""); setConfidence("3"); setMinutes("0");
    setDate(localDate()); setMode("not_recorded"); setTool(""); setGenerated(""); setError("");
  }
  function editEntry(entry: JournalEntry) {
    setEditing(entry); setTitle(entry.title); setLearned(entry.learned); setBlocked(entry.blocked); setNext(entry.next);
    setTrackId(entry.trackId ?? ""); setTaskId(entry.taskId ?? ""); setConfidence(String(entry.confidence));
    setMinutes(String(entry.minutesSpent)); setDate(entry.date); setMode(entry.aiUse.mode); setTool(entry.aiUse.tool);
    setGenerated(entry.aiUse.whatWasGenerated); setError(""); setMessage(""); setFieldErrors({});
    titleRef.current?.focus();
  }
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(""); setMessage("");
    if (endDate && startDate && endDate < startDate) {
      setError("The end date for the filter must be on or after the start date.");
      return;
    }
    const parsedConfidence = Number(confidence);
    const parsedMinutes = Number(minutes);
    const validationErrors: { title?: string; confidence?: string; minutes?: string; date?: string } = {};
    if (!title.trim()) validationErrors.title = "Enter a journal title.";
    if (!Number.isInteger(parsedConfidence) || parsedConfidence < 1 || parsedConfidence > 5) validationErrors.confidence = "Choose a whole number from 1 to 5.";
    if (!Number.isInteger(parsedMinutes) || parsedMinutes < 0 || parsedMinutes > 10080) validationErrors.minutes = "Enter a whole number from 0 to 10,080.";
    if (!/^\\d{4}-\\d{2}-\\d{2}$/.test(date)) validationErrors.date = "Choose a valid local date.";
    if (Object.keys(validationErrors).length) {
      setFieldErrors(validationErrors);
      setError("Please correct the highlighted fields.");
      if (validationErrors.title) titleRef.current?.focus();
      return;
    }
    if (trackId && taskId) {
      const selectedTask = tasks.find((task) => task.id === taskId);
      if (selectedTask && selectedTask.trackId !== trackId) {
        setError("Choose a task that belongs to the selected track, or clear the task selection.");
        return;
      }
    }
    setBusy(true);
    const now = new Date().toISOString();
    const record: JournalEntry = {
      id: editing?.id ?? crypto.randomUUID(), schemaVersion: 1,
      createdAt: editing?.createdAt ?? now, updatedAt: now, deletedAt: null,
      title: title.trim(), learned, blocked, next,
      trackId: trackId || null, taskId: taskId || null,
      confidence: parsedConfidence, minutesSpent: parsedMinutes, date,
      aiUse: { mode, tool: tool.trim(), whatWasGenerated: generated },
    };
    try {
      await persistence.journal.save(record);
      await reload();
      await onRefresh();
      const wasEditing = Boolean(editing);
      clearForm();
      setMessage(wasEditing ? "Journal entry updated." : "Journal entry saved.");
      headingRef.current?.focus();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Save failed. Your form contents remain available.");
    } finally {
      setBusy(false);
    }
  }
  async function softDelete(entry: JournalEntry) {
    if (!window.confirm("Soft-delete this journal entry? It remains in JSON backups until permanently deleted.")) return;
    setBusy(true); setError(""); setMessage("");
    try {
      await persistence.journal.softDelete(entry.id);
      await reload();
      setMessage("Entry moved to deleted records.");
      headingRef.current?.focus();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Could not delete entry.");
    } finally { setBusy(false); }
  }
  async function permanentlyDelete(entry: JournalEntry) {
    if (!window.confirm("Permanently delete this journal entry? This cannot be undone. It will no longer appear in future backups.")) return;
    setBusy(true); setError(""); setMessage("");
    try {
      await persistence.journal.permanentlyDelete(entry.id);
      await reload();
      setMessage("Entry permanently deleted.");
      headingRef.current?.focus();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Could not permanently delete entry.");
    } finally { setBusy(false); }
  }
  const trackName = (id: string | null) => tracks.find((track) => track.id === id)?.title ?? (id ? "Deleted or unavailable track" : "No track");
  const taskName = (id: string | null) => tasks.find((task) => task.id === id)?.title ?? (id ? "Deleted or unavailable task" : "No task");
  const linkedTask = taskId ? tasks.find((task) => task.id === taskId) : undefined;
  const disabled = saving || busy;
  return <section className="workspace-card journal-view" aria-labelledby="journal-heading">
    <h2 id="journal-heading" tabIndex={-1} ref={headingRef}>Learning journal</h2>
    <p>Record your learning honestly. AI disclosure is for clarity, not judgment. Not recorded is the default until you choose.</p>
    <form className="workspace-form" onSubmit={submit} ref={formRef}>
      <h3>{editing ? "Edit journal entry" : "New journal entry"}</h3>
      <label htmlFor="journal-title">Title<input id="journal-title" ref={titleRef} required maxLength={160} value={title} onChange={(event) => setTitle(event.target.value)} aria-describedby="journal-title-hint" /></label>
      <p id="journal-title-hint" className="field-hint">A short name for this learning session.</p>
      <label htmlFor="journal-learned">What I learned<textarea id="journal-learned" maxLength={5000} rows={3} value={learned} onChange={(event) => setLearned(event.target.value)} /></label>
      <label htmlFor="journal-blocked">What blocked me<textarea id="journal-blocked" maxLength={5000} rows={3} value={blocked} onChange={(event) => setBlocked(event.target.value)} /></label>
      <label htmlFor="journal-next">What I’ll do next<textarea id="journal-next" maxLength={5000} rows={3} value={next} onChange={(event) => setNext(event.target.value)} /></label>
      <div className="form-grid">
        <label htmlFor="journal-track">Track (optional)<select id="journal-track" value={trackId} onChange={(event) => { setTrackId(event.target.value); setTaskId(""); }}><option value="">No track</option>{trackId && !tracks.some((track) => track.id === trackId && !track.deletedAt) && <option value={trackId}>Deleted or unavailable track (keep link)</option>}{tracks.filter((track) => !track.deletedAt).map((track) => <option key={track.id} value={track.id}>{track.title}{track.archivedAt ? " (archived)" : ""}</option>)}</select></label>
        <label htmlFor="journal-task">Task (optional)<select id="journal-task" value={taskId} onChange={(event) => setTaskId(event.target.value)}><option value="">No task</option>{taskId && (!linkedTask || linkedTask.deletedAt || (trackId && linkedTask.trackId !== trackId))) && <option value={taskId}>Deleted or unavailable task (keep link)</option>}{tasks.filter((task) => !task.deletedAt && (!trackId || task.trackId === trackId)).map((task) => <option key={task.id} value={task.id}>{task.title}{task.deletedAt ? " (deleted)" : ""}</option>)}</select></label>
        <label htmlFor="journal-confidence">Confidence (1–5)<select id="journal-confidence" required value={confidence} aria-invalid={Boolean(fieldErrors.confidence)} aria-describedby="journal-confidence-error" onChange={(event) => { setConfidence(event.target.value); setFieldErrors((prev) => ({ ...prev, confidence: undefined })); }}>{[1,2,3,4,5].map((value) => <option key={value} value={value}>{value}</option>)}</select></label>
        <label htmlFor="journal-minutes">Minutes spent<input id="journal-minutes" type="number" min="0" max="10080" step="1" value={minutes} aria-invalid={Boolean(fieldErrors.minutes)} aria-describedby="journal-minutes-error" onChange={(event) => { setMinutes(event.target.value); setFieldErrors((prev) => ({ ...prev, minutes: undefined })); }} /></label>
        <label htmlFor="journal-date">Learning date<input id="journal-date" required type="date" value={date} aria-invalid={Boolean(fieldErrors.date)} aria-describedby="journal-date-error" onChange={(event) => { setDate(event.target.value); setFieldErrors((prev) => ({ ...prev, date: undefined })); }} /></label>{fieldErrors.date && <p id="journal-date-error" className="error-detail">{fieldErrors.date}</p>}
      </div>
      <fieldset><legend>AI-use disclosure</legend><p>Select the option that best describes this entry. Unknown and not recorded are separate from unassisted.</p>
        <label htmlFor="journal-ai-mode">AI-use type<select id="journal-ai-mode" value={mode} onChange={(event) => setMode(event.target.value as AiUseMode)}>{AI_USE_MODES.map((value) => <option key={value} value={value}>{modeLabels[value]}</option>)}</select></label>
        <label htmlFor="journal-ai-tool">Tool used (optional)<input id="journal-ai-tool" maxLength={120} value={tool} onChange={(event) => setTool(event.target.value)} placeholder="e.g. ChatGPT, Copilot, Claude" /></label>
        <label htmlFor="journal-ai-generated">What the AI generated (optional)<textarea id="journal-ai-generated" rows={3} maxLength={3000} value={generated} onChange={(event) => setGenerated(event.target.value)} placeholder="Describe what the AI provided, if applicable." /></label>
      </fieldset>
      {error && <p className="error-detail" role="alert">{error}</p>}
      {message && <p role="status" aria-live="polite">{message}</p>}
      <div className="form-actions"><button type="submit" disabled={disabled}>{busy ? "Saving…" : editing ? "Save changes" : "Save entry"}</button>{editing && <button type="button" className="secondary" disabled={disabled} onClick={clearForm}>Cancel edit</button>}</div>
    </form>
    <section aria-labelledby="journal-summary-heading"><h3 id="journal-summary-heading">AI-use summary</h3><p>Counts and time are separate for every disclosure state; unknown and not recorded are not combined with unassisted.</p><ul>{summary.map((item) => <li key={item.mode}>{modeLabels[item.mode]}: {item.count} entries · {item.minutes} minutes</li>)}</ul></section>
    <div className="task-toolbar journal-filters">
      <label htmlFor="journal-filter-track">Track filter<select id="journal-filter-track" value={filterTrack} onChange={(event) => setFilterTrack(event.target.value)}><option value="all">All tracks</option>{tracks.filter((track) => !track.deletedAt).map((track) => <option key={track.id} value={track.id}>{track.title}</option>)}</select></label>
      <label htmlFor="journal-start-date">Start date<input id="journal-start-date" type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} /></label>
      <label htmlFor="journal-end-date">End date<input id="journal-end-date" type="date" value={endDate} onChange={(event) => setEndDate(event.target.value)} /></label>
      <label htmlFor="journal-filter-mode">AI-use type<select id="journal-filter-mode" value={filterMode} onChange={(event) => setFilterMode(event.target.value as AiUseMode | "all")}><option value="all">All types</option>{AI_USE_MODES.map((value) => <option key={value} value={value}>{modeLabels[value]}</option>)}</select></label>
    </div>
    {error && <p className="error-detail" role="alert">{error}</p>}
    {message && <p role="status" aria-live="polite">{message}</p>}
    <h3>Entries ({visible.length})</h3>
    {visible.length === 0 ? <div className="empty-state"><h4>No journal entries match</h4><p>Try adjusting filters or record your first learning attempt.</p></div> : <ul className="task-list">{visible.map((entry) => <li className="task-card" key={entry.id}><div><h4>{entry.title}</h4><p>{entry.date} · {entry.minutesSpent} min · Confidence {entry.confidence}/5</p><p>Track: {trackName(entry.trackId)} · Task: {taskName(entry.taskId)}</p><p><strong>AI-use:</strong> {modeLabels[entry.aiUse.mode]}</p>{entry.aiUse.tool && <p>Tool: {entry.aiUse.tool}</p>}{entry.aiUse.whatWasGenerated && <p>Generated: {entry.aiUse.whatWasGenerated}</p>}{entry.learned && <p><strong>Learned:</strong> {entry.learned}</p>}{entry.blocked && <p><strong>Blocked:</strong> {entry.blocked}</p>}{entry.next && <p><strong>Next:</strong> {entry.next}</p>}</div><div className="form-actions"><button type="button" className="secondary" disabled={disabled} onClick={() => editEntry(entry)}>Edit</button><button type="button" className="danger" disabled={disabled} onClick={() => void softDelete(entry)}>Delete</button></div></li>)}</ul>}
    {deletedEntries.length > 0 && <section className="deleted-records" aria-labelledby="deleted-journal-heading"><h3 id="deleted-journal-heading">Deleted journal entries</h3><ul className="task-list">{deletedEntries.map((entry) => <li className="task-card" key={entry.id}><span>{entry.title}</span><button type="button" className="danger" disabled={disabled} onClick={() => void permanentlyDelete(entry)}>Permanently delete</button></li>)}</ul></section>}
  </section>;
}
