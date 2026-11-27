import { useEffect, useState } from "react";
import type { SyntheticEvent } from "react";
import { COMPETENCY_RULES } from "../domain/competencyRules";
import { computeCompetencies } from "../domain/competencies";
import type {
  Evidence,
  JournalEntry,
  Review,
  Task,
  CompetencySlug,
} from "../persistence/schemas";
import type { PersistenceHandle } from "../persistence";
type Props = {
  persistence: PersistenceHandle;
  journals: JournalEntry[];
  tasks: Task[];
};
const base = (old?: { id: string; createdAt: string }) => {
  const now = new Date().toISOString();
  return {
    id: old?.id ?? crypto.randomUUID(),
    schemaVersion: 1,
    createdAt: old?.createdAt ?? now,
    updatedAt: now,
    deletedAt: null,
  };
};
export default function CompetenciesView({
  persistence,
  journals,
  tasks,
}: Props) {
  const [evidence, setEvidence] = useState<Evidence[]>([]),
    [reviews, setReviews] = useState<Review[]>([]),
    [deletedEvidence, setDeletedEvidence] = useState<Evidence[]>([]),
    [deletedReviews, setDeletedReviews] = useState<Review[]>([]);
  const [slug, setSlug] = useState<CompetencySlug>("independent_coding"),
    [criterion, setCriterion] = useState("IC-1"),
    [title, setTitle] = useState(""),
    [url, setUrl] = useState(""),
    [context, setContext] = useState(""),
    [description, setDescription] = useState(""),
    [journalId, setJournalId] = useState(""),
    [taskId, setTaskId] = useState(""),
    [editId, setEditId] = useState<string | null>(null);
  const [reviewEvidence, setReviewEvidence] = useState(""),
    [reviewId, setReviewId] = useState<string | null>(null),
    [reviewType, setReviewType] = useState<"self" | "external">("self"),
    [reviewer, setReviewer] = useState(""),
    [feedback, setFeedback] = useState(""),
    [outcome, setOutcome] = useState<Review["outcome"]>("confirm"),
    [statusMessage, setStatusMessage] = useState("");
  async function refresh() {
    const [e, r] = await Promise.all([
      persistence.evidence.list({ includeDeleted: true }),
      persistence.reviews.list({ includeDeleted: true }),
    ]);
    setEvidence(e.filter((item) => !item.deletedAt));
    setReviews(r.filter((item) => !item.deletedAt));
    setDeletedEvidence(e.filter((item) => !!item.deletedAt));
    setDeletedReviews(r.filter((item) => !!item.deletedAt));
  }
  useEffect(() => {
    void refresh();
  }, [persistence]);
  const def = COMPETENCY_RULES.find((x) => x.slug === slug)!;
  const computed = computeCompetencies(evidence, reviews, journals, tasks);
  function resetEvidence() {
    setEditId(null);
    setTitle("");
    setUrl("");
    setContext("");
    setDescription("");
    setJournalId("");
    setTaskId("");
  }
  async function saveEvidence(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    const old = evidence.find((x) => x.id === editId);
    try {
      await persistence.evidence.save({
        ...base(old),
        competencySlug: slug,
        criterionKey: criterion,
        title,
        linkUrl: url.trim() || null,
        context,
        description,
        journalEntryId: journalId || null,
        taskId: taskId || null,
      });
      await refresh();
      resetEvidence();
      setStatusMessage("Saved evidence; status recalculated.");
    } catch (e) {
      setStatusMessage(
        e instanceof Error ? e.message : "Evidence could not be saved.",
      );
    }
  }
  async function saveReview(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    const old = reviews.find((x) => x.id === reviewId);
    try {
      await persistence.reviews.save({
        ...base(old),
        evidenceId: reviewEvidence,
        reviewerType: reviewType,
        reviewerLabel: reviewer,
        feedback,
        outcome,
        reviewedAt: new Date().toISOString(),
      });
      await refresh();
      setReviewId(null);
      setReviewEvidence("");
      setReviewer("");
      setFeedback("");
      setStatusMessage("Review saved.");
    } catch (e) {
      setStatusMessage(
        e instanceof Error ? e.message : "Review could not be saved.",
      );
    }
  }
  return (
    <section
      className="workspace-card competency-view"
      aria-labelledby="competencies-title"
    >
      <p className="workspace-eyebrow">Computed, evidence-based</p>
      <h2 id="competencies-title">Competencies</h2>
      <p>
        Task completion never changes competency status. Deleting evidence
        recalculates status immediately.
      </p>
      <p role="status" aria-live="polite">
        {statusMessage}
      </p>
      {computed.map((item) => (
        <article className="competency-panel" key={item.slug}>
          <h3>
            {item.title}{" "}
            <span className="competency-status">{item.status}</span>
          </h3>
          <p>{item.explanation}</p>
          {item.lastEvidenced && (
            <p>
              Last evidenced: {item.lastEvidenced}
              {item.mayBeStale ? " — May be stale (over 180 days)" : ""}
            </p>
          )}
          {item.criteria.map((c) => (
            <section className="criterion-panel" key={c.criterionKey}>
              <h4>
                {c.criterionKey}: {c.label}
              </h4>
              <p>{c.requirement}</p>
              <p>{c.explanation}</p>
              {c.evidence.map((ev) => (
                <div className="evidence-row" key={ev.id}>
                  <strong>{ev.title}</strong>
                  {ev.description && <p>{ev.description}</p>}
                  {ev.context && <p>Context: {ev.context}</p>}
                  {ev.linkUrl && (
                    <p>
                      <a
                        href={ev.linkUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Open external artifact
                      </a>
                    </p>
                  )}
                  {ev.journalEntryId && (
                    <p>
                      Journal:{" "}
                      {journals.find((j) => j.id === ev.journalEntryId)
                        ?.title ?? "Unavailable/deleted entry"}
                    </p>
                  )}
                  {ev.taskId && (
                    <p>
                      Task:{" "}
                      {tasks.find((t) => t.id === ev.taskId)?.title ??
                        "Unavailable/deleted task"}
                    </p>
                  )}
                  <div className="form-actions">
                    <button
                      type="button"
                      className="secondary"
                      onClick={() => {
                        setEditId(ev.id);
                        setSlug(ev.competencySlug);
                        setCriterion(ev.criterionKey);
                        setTitle(ev.title);
                        setUrl(ev.linkUrl ?? "");
                        setContext(ev.context);
                        setDescription(ev.description);
                        setJournalId(ev.journalEntryId ?? "");
                        setTaskId(ev.taskId ?? "");
                      }}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="danger"
                      onClick={() => {
                        if (
                          confirm(
                            "Soft-delete this evidence? Competency status will recalculate immediately.",
                          )
                        )
                          void persistence.evidence
                            .softDelete(ev.id)
                            .then(refresh)
                            .then(() =>
                              setStatusMessage(
                                "Evidence deleted; status recalculated.",
                              ),
                            );
                      }}
                    >
                      Delete
                    </button>
                    <button
                      type="button"
                      className="secondary"
                      onClick={() => {
                        if (
                          confirm(
                            "Permanently delete this evidence and its reviews?",
                          )
                        )
                          void persistence.evidence
                            .permanentlyDelete(ev.id)
                            .then(refresh)
                            .then(() =>
                              setStatusMessage(
                                "Evidence and reviews permanently deleted.",
                              ),
                            );
                      }}
                    >
                      Permanently delete
                    </button>
                  </div>
                  {reviews
                    .filter((r) => !r.deletedAt && r.evidenceId === ev.id)
                    .map((r) => (
                      <div className="review-row" key={r.id}>
                        <p>
                          <strong>
                            {r.reviewerType === "external"
                              ? "External"
                              : "Self"}{" "}
                            review
                          </strong>{" "}
                          · {r.reviewerLabel} · {r.outcome}
                        </p>
                        <p>{r.feedback}</p>
                        <button
                          type="button"
                          className="secondary"
                          onClick={() => {
                            setReviewEvidence(ev.id);
                            setReviewId(r.id);
                            setReviewType(r.reviewerType);
                            setReviewer(r.reviewerLabel);
                            setFeedback(r.feedback);
                            setOutcome(r.outcome);
                          }}
                        >
                          Edit review
                        </button>
                        <button
                          type="button"
                          className="danger"
                          onClick={() => {
                            if (confirm("Soft-delete review?"))
                              void persistence.reviews
                                .softDelete(r.id)
                                .then(refresh);
                          }}
                        >
                          Delete review
                        </button>
                        <button
                          type="button"
                          className="secondary"
                          onClick={() => {
                            if (confirm("Permanently delete review?"))
                              void persistence.reviews
                                .permanentlyDelete(r.id)
                                .then(refresh);
                          }}
                        >
                          Permanently delete
                        </button>
                      </div>
                    ))}
                </div>
              ))}
            </section>
          ))}
        </article>
      ))}
      <form className="workspace-form" onSubmit={saveEvidence}>
        <h3>{editId ? "Edit evidence" : "Add evidence"}</h3>
        <label>
          Competency
          <select
            value={slug}
            onChange={(ev) => {
              const next = ev.target.value as CompetencySlug;
              setSlug(next);
              setCriterion(
                COMPETENCY_RULES.find((x) => x.slug === next)!.criteria[0].key,
              );
            }}
          >
            {COMPETENCY_RULES.map((x) => (
              <option value={x.slug} key={x.slug}>
                {x.title}
              </option>
            ))}
          </select>
        </label>
        <label>
          Criterion
          <select
            value={criterion}
            onChange={(ev) => setCriterion(ev.target.value)}
          >
            {def.criteria.map((x) => (
              <option key={x.key} value={x.key}>
                {x.key} · {x.label}
              </option>
            ))}
          </select>
        </label>
        <label>
          Title
          <input
            required
            maxLength={160}
            value={title}
            onChange={(ev) => setTitle(ev.target.value)}
          />
        </label>
        <label>
          Description
          <textarea
            maxLength={4000}
            value={description}
            onChange={(ev) => setDescription(ev.target.value)}
          />
        </label>
        <label>
          Context (repeat proof)
          <input
            maxLength={120}
            value={context}
            onChange={(ev) => setContext(ev.target.value)}
            placeholder="Separate task/project"
          />
        </label>
        <label>
          Artifact link (HTTP/HTTPS)
          <input
            type="url"
            value={url}
            onChange={(ev) => setUrl(ev.target.value)}
            placeholder="https://..."
          />
        </label>
        <label>
          Journal entry
          <select
            value={journalId}
            onChange={(ev) => setJournalId(ev.target.value)}
          >
            <option value="">None</option>
            {journals
              .filter((j) => !j.deletedAt)
              .map((j) => (
                <option value={j.id} key={j.id}>
                  {j.date} · {j.title} · {j.aiUse.mode}
                </option>
              ))}
          </select>
        </label>
        <label>
          Task
          <select value={taskId} onChange={(ev) => setTaskId(ev.target.value)}>
            <option value="">None</option>
            {tasks
              .filter((t) => !t.deletedAt)
              .map((t) => (
                <option value={t.id} key={t.id}>
                  {t.title}
                </option>
              ))}
          </select>
        </label>
        <div className="form-actions">
          <button type="submit">
            {editId ? "Save edit" : "Save evidence"}
          </button>
          {editId && (
            <button type="button" className="secondary" onClick={resetEvidence}>
              Cancel
            </button>
          )}
        </div>
      </form>
      <form className="workspace-form" onSubmit={saveReview}>
        <h3>{reviewId ? "Edit review" : "Add review"}</h3>
        <label>
          Evidence
          <select
            required
            value={reviewEvidence}
            onChange={(ev) => setReviewEvidence(ev.target.value)}
          >
            <option value="">Select evidence</option>
            {evidence.map((e) => (
              <option value={e.id} key={e.id}>
                {e.title}
              </option>
            ))}
          </select>
        </label>
        <label>
          Reviewer type
          <select
            value={reviewType}
            onChange={(ev) =>
              setReviewType(ev.target.value as "self" | "external")
            }
          >
            <option value="self">Self</option>
            <option value="external">External</option>
          </select>
        </label>
        <label>
          Reviewer label
          <input
            required
            maxLength={120}
            value={reviewer}
            onChange={(ev) => setReviewer(ev.target.value)}
          />
        </label>
        <label>
          Outcome
          <select
            value={outcome}
            onChange={(ev) => setOutcome(ev.target.value as Review["outcome"])}
          >
            <option value="confirm">Confirms</option>
            <option value="mixed">Mixed</option>
            <option value="needs_revision">Needs revision</option>
            <option value="informational">Informational</option>
          </select>
        </label>
        <label>
          Feedback
          <textarea
            required
            maxLength={5000}
            value={feedback}
            onChange={(ev) => setFeedback(ev.target.value)}
          />
        </label>
        <div className="form-actions">
          <button type="submit">Save review</button>
          <button
            type="button"
            className="secondary"
            onClick={() => {
              setReviewId(null);
              setReviewEvidence("");
            }}
          >
            Cancel
          </button>
        </div>
      </form>
      <section className="deleted-records" aria-labelledby="deleted-competency-records">
        <h3 id="deleted-competency-records">Deleted evidence and reviews</h3>
        <p>Restore evidence before restoring its reviews. Permanently deleting evidence also deletes its associated reviews.</p>
        {deletedEvidence.length === 0 && deletedReviews.length === 0 ? <p>No deleted competency records.</p> : null}
        {deletedEvidence.map((item) => (
          <article className="evidence-row" key={item.id}>
            <strong>{item.title}</strong> · {item.criterionKey} · deleted {item.deletedAt}
            <div className="form-actions">
              <button type="button" className="secondary" onClick={() => void persistence.evidence.restore(item.id).then(refresh).then(() => setStatusMessage("Evidence restored; status recalculated."))}>Restore</button>
              <button type="button" className="danger" onClick={() => { if (confirm("Permanently delete this evidence and all associated reviews? This cannot be undone.")) void persistence.evidence.permanentlyDelete(item.id).then(refresh).then(() => setStatusMessage("Evidence and associated reviews permanently deleted.")); }}>Permanently delete</button>
            </div>
          </article>
        ))}
        {deletedReviews.map((item) => (
          <article className="review-row" key={item.id}>
            <strong>{item.reviewerLabel}</strong> · {item.outcome} · deleted {item.deletedAt}
            <p>{item.feedback}</p>
            <div className="form-actions">
              <button type="button" className="secondary" onClick={() => void persistence.reviews.restore(item.id).then(refresh).then(() => setStatusMessage("Review restored."))}>Restore</button>
              <button type="button" className="danger" onClick={() => { if (confirm("Permanently delete this review? This cannot be undone.")) void persistence.reviews.permanentlyDelete(item.id).then(refresh).then(() => setStatusMessage("Review permanently deleted.")); }}>Permanently delete</button>
            </div>
          </article>
        ))}
      </section>
      <p>
        Reviews and reviewer labels are self-reported. Selecting “External” does not authenticate the reviewer or independently verify the feedback. Competency thresholds remain NEEDS APPROVAL.
      </p>
    </section>
  );
}
