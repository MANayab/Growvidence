import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import { filterJournalEntries, summarizeJournal, AI_USE_MODES } from "../domain/journal";
import type { PersistenceHandle } from "../persistence";
import type { AiUseMode, JournalEntry, Task, Track } from "../persistence/schemas";

interface Props { persistence: PersistenceHandle; tracks: Track[]; tasks: Task[]; saving: boolean; onRefresh: () => Promise<void>; }
const modeLabels: Record<AiUseMode, string> = {
  assisted: "AI assisted",
  unassisted: "No AI assistance",
  partially_assisted: "Partially assisted",
  unknown: "Unknown",
  not_recorded: "Not recorded",
};
const localDate = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,"0")}-${String(now.getDate()).padStart(2,"0")}`;
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
  const focusTarget = useRef<HTMLHeadingElement>(null);
  async function reload() { try { setEntries(await persistence.journal.list({ includeDeleted: true })); } catch (e) { setError(e instanceof Error ? e.message : "Could not load journal records."); } }
  useEffect(() => { void reload(); }, [persistence]);
  const activeEntries = entries.filter((entry) => entry.deletedAt === null);
  const deletedEntries = entries.filter((entry) => entry.deletedAt !== null);
  const visible = filterJournalEntries(activeEntries, { trackId: filterTrack, startDate, endDate, aiUseMode: filterMode });
  const summary = summarizeJournal(activeEntries);
  function clearForm() {
    setEditing(null); setTitle(""); setLearned(""); setBlocked(""); setNext(""); setTrackId(""); setTaskId(""); setConfidence("3"); setMinutes("0"); setDate(localDate()); setMode("not_recorded"); setTool(""); setGenerated(""); setError("");
  }
  function editEntry(entry: JournalEntry) {
    setEditing(entry); setTitle(entry.title); setLearned(entry.learned); setBlocked(entry.blocked); setNext(entry.next); setTrackId(entry.trackId ?? ""); setTaskId(entry.taskId ?? ""); setConfidence(String(entry.confidence)); setMinutes(String(entry.minutesSpent)); setDate(entry.date); setMode(entry.aiUse.mode); setTool(entry.aiUse.tool); setGenerated(entry.aiUse.whatWasGenerated); setError("");
    focusTarget.current?.focus();
  }
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(""); setMessage("");
    const now = new Date().toISOString();
    const record: JournalEntry = {
      id: editing?.id ?? crypto.randomUUID(), schemaVersion: 1,
      createdAt: editing?.createdAt ?? now, updatedAt: now, deletedAt: null,
      title: title.trim(), learned, blocked, next,
      trackId: trackId || null, taskId: taskId || null,
      confidence: Number(confidence), minutesSpent: Number(minutes), date,
      aiUse: { mode, tool: tool.trim(), whatWasGenerated: generated },
    };
    try {
      await persistence.journal.save(record);
      await reload(); await onRefresh();
      clearForm(); setMessage(editing ? "Journal entry updated." : "Journal entry saved."); focusTarget.current?.focus();
    } catch (e) { setError(e instanceof Error ? e.message : "Save failed. Your form contents remain available."); }
  }
  async function softDelete(entry: JournalEntry) {
    if (!window.confirm("Soft-delete this journal entry? It remains in JSON backups until permanently deleted.")) return;
    try { await persistence.journal.softDelete(entry.id); await reload(); setMessage("Entry moved to deleted records."); focusTarget.current?.focus(); }
    catch(e) { setError(e instanceof Error ? e.message : "Could not delete entry."); }
  }
  async function permanentlyDelete(entry: JournalEntry) {
    if (!window.confirm("Permanently delete this journal entry? This cannot be undone. It will no longer appear in future backups.")) return;
    try { await persistence.journal.permanentlyDelete(entry.id); await reload(); setMessage("Entry permanently deleted."); focusTarget.current?.focus(); }
    catch(e) { setError(e instanceof Error ? e.message : "Could not permanently delete entry."); }
  }
  const trackName = (id: string | null) => tracks.find((t) => t.id === id)?.title ?? (id ? "Deleted or unavailable track" : "No track");
  const taskName = (id: string | null) => tasks.find((t) => t.id === id)?.title ?? (id ? "Deleted or unavailable task" : "No task");
  return <section className="workspace-card journal-view" aria-labelledby="journal-heading">
    <h2 id="journal-heading" tabIndex={-1} ref={focusTarget}>Learning journal</h2>
    <p>Record your learning honestly. AI disclosure is for clarity, not judgment. Not recorded is the default until you choose.</p>
    <form className="workspace-form" onSubmit={submit}>
      <h3>{editing ? "Edit journal entry" : "New journal entry"}</h3>
      <label>Title<input required maxLength={160} value={title} onChange={(e)=>setTitle(e.target.value)} /></label>
      <label>What I learned<textarea maxLength={5000} rows={3} value={learned} onChange={(e)=>setLearned(e.target.value)} /></label>
      <label>What blocked me<textarea maxLength={5000} rows={3} value={blocked} onChange={(e)=>setBlocked(e.target.value)} /></label>
      <label>What I’ll do next<textarea maxLength={5000} rows={3} value={next} onChange={(e)=>setNext(e.target.value)} /></label>
      <div className="form-grid">
        <label>Track (optional)<select value={trackId} onChange={(e)=>{setTrackId(e.target.value);setTaskId("");}}><option value="">No track</option>{trackId && !tracks.some(t=>t.id===trackId) && <option value={trackId}>Deleted or unavailable track (keep link)</option>}{tracks.filter(t=>!t.deletedAt).map(t=><option key={t.id} value={t.id}>{t.title}{t.archivedAt?" (archived)":""}</option>)}</select></label>
        <label>Task (optional)<select value={taskId} onChange={(e)=>setTaskId(e.target.value)}><option value="">No task</option>{taskId && !tasks.some(t=>t.id===taskId) && <option value={taskId}>Deleted or unavailable task (keep link)</option>}{tasks.filter(t=>!t.deletedAt&&(!trackId||t.trackId===trackId)).map(t=><option key={t.id} value={t.id}>{t.title}</option>)}</select></label>
        <label>Confidence (1–5)<select required value={confidence} onChange={(e)=>setConfidence(e.target.value)}>{[1,2,3,4,5].map(n=><option key={n} value={n}>{n}</option>)}</select></label>
        <label>Minutes spent<input type="number" min="0" max="10080" step="1" value={minutes} onChange={(e)=>setMinutes(e.target.value)} /></label>
        <label>Learning date<input required type="date" value={date} onChange={(e)=>setDate(e.target.value)} /></label>
      </div>
      <fieldset><legend>AI-use disclosure</legend><p>Select the option that best describes this entry. Unknown and not recorded are separate from unassisted.</p>
        <label>AI-use type<select value={mode} onChange={(e)=>setMode(e.target.value as AiUseMode)}>{AI_USE_MODES.map(m=><option key={m} value={m}>{modeLabels[m]}</option>)}</select></label>
        <label>Tool used (optional)<input maxLength={120} value={tool} onChange={(e)=>setTool(e.target.value)} placeholder="e.g. ChatGPT, Copilot, Claude" /></label>
        <label>What the AI generated (optional)<textarea rows={3} maxLength={3000} value={generated} onChange={(e)=>setGenerated(e.target.value)} placeholder="Describe what the AI provided, if applicable." /></label>
      </fieldset>
      {error && <p className="error-detail" role="alert">{error}</p>}
      {message && <p role="status" aria-live="polite">{message}</p>}
      <div className="form-actions"><button disabled={saving}>{editing?"Save changes":"Save entry"}</button>{editing&&<button type="button" className="secondary" onClick={clearForm}>Cancel edit</button>}</div>
    </form>
    <section aria-labelledby="journal-summary-heading"><h3 id="journal-summary-heading">AI-use summary</h3><p>Counts and time are separate for every disclosure state; unknown and not recorded are not combined with unassisted.</p><ul>{summary.map(item=><li key={item.mode}>{modeLabels[item.mode]}: {item.count} entries · {item.minutes} minutes</li>)}</ul></section>
    <div className="task-toolbar journal-filters">
      <label>Track filter<select value={filterTrack} onChange={(e)=>setFilterTrack(e.target.value)}><option value="all">All tracks</option>{tracks.filter(t=>!t.deletedAt).map(t=><option key={t.id} value={t.id}>{t.title}</option>)}</select></label>
      <label>Start date<input type="date" value={startDate} onChange={(e)=>setStartDate(e.target.value)} /></label>
      <label>End date<input type="date" value={endDate} onChange={(e)=>setEndDate(e.target.value)} /></label>
      <label>AI-use type<select value={filterMode} onChange={(e)=>setFilterMode(e.target.value as AiUseMode|"all")}><option value="all">All types</option>{AI_USE_MODES.map(m=><option key={m} value={m}>{modeLabels[m]}</option>)}</select></label>
    </div>
    <h3>Entries ({visible.length})</h3>
    {visible.length===0?<div className="empty-state"><h4>No journal entries match</h4><p>Try adjusting filters or record your first learning attempt.</p></div>:<ul className="task-list">{visible.map(entry=><li className="task-card" key={entry.id}><div><h4>{entry.title}</h4><p>{entry.date} · {entry.minutesSpent} min · Confidence {entry.confidence}/5</p><p>Track: {trackName(entry.trackId)} · Task: {taskName(entry.taskId)}</p><p><strong>AI-use:</strong> {modeLabels[entry.aiUse.mode]}</p>{entry.aiUse.tool&&<p>Tool: {entry.aiUse.tool}</p>}{entry.aiUse.whatWasGenerated&&<p>Generated: {entry.aiUse.whatWasGenerated}</p>}{entry.learned&&<p><strong>Learned:</strong> {entry.learned}</p>}{entry.blocked&&<p><strong>Blocked:</strong> {entry.blocked}</p>}{entry.next&&<p><strong>Next:</strong> {entry.next}</p>}</div><div className="form-actions"><button type="button" className="secondary" onClick={()=>editEntry(entry)}>Edit</button><button type="button" className="danger" onClick={()=>void softDelete(entry)}>Delete</button></div></li>)}</ul>}
    {deletedEntries.length>0&&<section className="deleted-records" aria-labelledby="deleted-journal-heading"><h3 id="deleted-journal-heading">Deleted journal entries</h3><ul className="task-list">{deletedEntries.map(entry=><li className="task-card" key={entry.id}><span>{entry.title}</span><button type="button" className="danger" disabled={saving} onClick={()=>void permanentlyDelete(entry)}>Permanently delete</button></li>)}</ul></section>}
  </section>;
}
