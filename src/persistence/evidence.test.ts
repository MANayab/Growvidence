import "fake-indexeddb/auto";
import { afterEach, describe, expect, it } from "vitest";
import { openPersistence } from "./index";
import type { Evidence, JournalEntry, Track, Task } from "./schemas";
const ids = {
  track: "11111111-1111-4111-8111-111111111111",
  task: "22222222-2222-4222-8222-222222222222",
  journal: "33333333-3333-4333-8333-333333333333",
  evidence: "44444444-4444-4444-8444-444444444444",
  review: "55555555-5555-4555-8555-555555555555",
};
const stamp = "2026-11-01T00:00:00.000Z";
const recordBase = { schemaVersion: 1, createdAt: stamp, updatedAt: stamp, deletedAt: null };
const track: Track = {
  ...recordBase, id: ids.track, title: "Track", description: "", archivedAt: null,
};
const task: Task = {
  ...recordBase, id: ids.task, trackId: ids.track, title: "Task", description: "",
  status: "done", priority: "normal", dueDate: null, estimatedMinutes: null,
  actualMinutes: null, tags: [],
};
const journal: JournalEntry = {
  ...recordBase, id: ids.journal, title: "Journal", learned: "", blocked: "", next: "",
  trackId: ids.track, taskId: ids.task, confidence: 3, minutesSpent: 10,
  date: "2026-11-01", aiUse: { mode: "unassisted", tool: "", whatWasGenerated: "" },
};
const evidence: Evidence = {
  ...recordBase, id: ids.evidence, competencySlug: "independent_coding", criterionKey: "IC-1",
  title: "Artifact", description: "", context: "task", linkUrl: "https://example.org",
  journalEntryId: ids.journal, taskId: ids.task,
};
const opened: Awaited<ReturnType<typeof openPersistence>>[] = [];
afterEach(() => opened.splice(0).forEach((p) => p.close()));
async function setup() {
  const p = await openPersistence({ databaseName: "growvidence-evidence-repository-" + crypto.randomUUID() });
  opened.push(p);
  await p.tracks.save(track);
  await p.tasks.save(task);
  await p.journal.save(journal);
  return p;
}
describe("evidence/review persistence", () => {
  it("rejects evidence linked to a missing or deleted journal/task", async () => {
    const p = await setup();
    await expect(p.evidence.save({ ...evidence, journalEntryId: "66666666-6666-4666-8666-666666666666" })).rejects.toThrow("active journal");
    await p.tasks.softDelete(ids.task);
    await expect(p.evidence.save(evidence)).rejects.toThrow("active task");
  });
  it("rejects a criterion key that does not belong to the competency", async () => {
    const p = await setup();
    await expect(p.evidence.save({ ...evidence, criterionKey: "DB-1" })).rejects.toThrow("belongs to this competency");
  });
  it("soft deletes and restores evidence and reviews, and cascade-deletes reviews", async () => {
    const p = await setup();
    await p.evidence.save(evidence);
    const review = {
      ...recordBase, id: ids.review, evidenceId: ids.evidence, reviewerType: "self" as const,
      reviewerLabel: "Learner", feedback: "Feedback", outcome: "confirm" as const, reviewedAt: stamp,
    };
    await p.reviews.save(review);
    await p.evidence.softDelete(ids.evidence);
    await expect(p.reviews.save({ ...review, id: "77777777-7777-4777-8777-777777777777" })).rejects.toThrow("active evidence");
    expect(await p.evidence.list()).toHaveLength(0);
    expect(await p.evidence.list({ includeDeleted: true })).toHaveLength(1);
    await p.evidence.restore(ids.evidence);
    expect(await p.evidence.list()).toHaveLength(1);
    await p.reviews.softDelete(ids.review);
    expect(await p.reviews.list()).toHaveLength(0);
    await p.reviews.restore(ids.review);
    expect(await p.reviews.list()).toHaveLength(1);
    await p.evidence.permanentlyDelete(ids.evidence);
    expect(await p.evidence.list({ includeDeleted: true })).toHaveLength(0);
    expect(await p.reviews.list({ includeDeleted: true })).toHaveLength(0);
  });
  it("refuses review restore if its evidence was deleted", async () => {
    const p = await setup();
    await p.evidence.save(evidence);
    const review = {
      ...recordBase, id: ids.review, evidenceId: ids.evidence, reviewerType: "self" as const,
      reviewerLabel: "Learner", feedback: "Feedback", outcome: "confirm" as const, reviewedAt: stamp,
    };
    await p.reviews.save(review);
    await p.evidence.softDelete(ids.evidence);
    await p.reviews.softDelete(ids.review);
    await expect(p.reviews.restore(ids.review)).rejects.toThrow("linked evidence first");
  });
  it("refuses evidence restore while a linked journal is deleted", async () => {
    const p = await setup();
    await p.evidence.save(evidence);
    await p.journal.softDelete(ids.journal);
    await p.evidence.softDelete(ids.evidence);
    await expect(p.evidence.restore(ids.evidence)).rejects.toThrow(
      "Restore the linked journal entry first.",
    );
  });
});
