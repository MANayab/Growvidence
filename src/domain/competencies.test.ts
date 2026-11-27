import { describe, expect, it } from "vitest";
import { computeCompetencies } from "./competencies";
import type {
  Evidence,
  JournalEntry,
  Review,
  Task,
} from "../persistence/schemas";
const common = {
  schemaVersion: 1,
  updatedAt: "2026-11-01T00:00:00Z",
  deletedAt: null,
};
const make = (
  id: string,
  key: string,
  date: string,
  taskId: string | null,
  context = "",
  url: string | null = "https://example.org",
): Evidence => ({
  ...common,
  id,
  createdAt: date + "T00:00:00Z",
  competencySlug: "independent_coding",
  criterionKey: key,
  title: id,
  description: "",
  context,
  linkUrl: url,
  journalEntryId: null,
  taskId,
});
const journal = (
  id: string,
  date: string,
  mode: JournalEntry["aiUse"]["mode"],
): JournalEntry => ({
  ...common,
  id,
  createdAt: date + "T00:00:00Z",
  title: "Practice",
  learned: "",
  blocked: "",
  next: "",
  trackId: null,
  taskId: null,
  confidence: 3,
  minutesSpent: 0,
  date,
  aiUse: { mode, tool: "", whatWasGenerated: "" },
});
const reviews: Review[] = [],
  tasks: Task[] = [];
describe("competency computation", () => {
  it("task completion does not create evidence", () =>
    expect(
      computeCompetencies([], reviews, [], tasks).find(
        (x) => x.slug === "independent_coding",
      )?.status,
    ).toBe("Not started"));
  it.each(["unknown", "not_recorded"] as const)(
    "blocks unassisted criterion for %s",
    (mode) => {
      const e = [
        {
          ...make("a", "IC-1", "2026-11-01", null),
          linkUrl: null,
          journalEntryId: "j",
        },
      ];
      expect(
        computeCompetencies(
          e,
          reviews,
          [journal("j", "2026-11-01", mode)],
          tasks,
        )[0].criteria[0].satisfied,
      ).toBe(false);
    },
  );
  it("unassisted linked journal qualifies while incomplete rubric stays In progress", () => {
    const e = [
      {
        ...make("a", "IC-1", "2026-11-01", null),
        linkUrl: null,
        journalEntryId: "j",
      },
    ];
    const a = computeCompetencies(
      e,
      reviews,
      [journal("j", "2026-11-01", "unassisted")],
      tasks,
    )[0];
    expect(a.criteria[0].satisfied).toBe(true);
    expect(a.status).toBe("In progress");
  });
  it("14-day boundary requires different task/context and later evidence", () => {
    const js = [
      journal("j1", "2026-11-01", "unassisted"),
      journal("j2", "2026-11-15", "unassisted"),
    ];
    const e = [
      {
        ...make("a", "IC-1", "2026-11-01", "task-a"),
        linkUrl: null,
        journalEntryId: "j1",
      },
      {
        ...make("b", "IC-1", "2026-11-15", "task-b"),
        linkUrl: null,
        journalEntryId: "j2",
      },
      make("c", "IC-2", "2026-11-15", "task-c"),
      {
        ...make("d", "IC-3", "2026-11-15", "task-d"),
        linkUrl: null,
        journalEntryId: "j2",
      },
    ];
    expect(computeCompetencies(e, reviews, js, tasks)[0].status).toBe(
      "Consistent",
    );
  });
  it("13-day repeat remains Demonstrated", () => {
    const e = [
      make("a", "IC-1", "2026-11-01", "task-a", "context-a"),
      make("b", "IC-1", "2026-11-14", "task-b", "context-b"),
      make("c", "IC-2", "2026-11-14", "task-c"),
      make("d", "IC-3", "2026-11-14", "task-d"),
    ];
    const result = computeCompetencies(
      e,
      reviews,
      [],
      tasks,
      new Date("2026-11-20T12:00:00Z"),
    )[0];
    expect(result.status).toBe("Demonstrated");
  });
  it("same-day repeat remains Demonstrated", () => {
    const journals = [
      journal("j1", "2026-11-01", "unassisted"),
      journal("j2", "2026-11-01", "unassisted"),
    ];
    const evidence = [
      {
        ...make("a", "IC-1", "2026-11-01", "a"),
        linkUrl: null,
        journalEntryId: "j1",
      },
      {
        ...make("b", "IC-1", "2026-11-01", "b"),
        linkUrl: null,
        journalEntryId: "j2",
      },
      make("c", "IC-2", "2026-11-01", "c"),
      {
        ...make("d", "IC-3", "2026-11-01", "d"),
        linkUrl: null,
        journalEntryId: "j1",
      },
    ];
    expect(
      computeCompetencies(evidence, reviews, journals, tasks)[0].status,
    ).toBe("Demonstrated");
  });
  it("self and externally labelled confirm reviews do not elevate status", () => {
    const e = [
      {
        ...make("a", "IC-1", "2026-11-01", "a"),
        linkUrl: null,
        journalEntryId: "j1",
      },
      make("b", "IC-2", "2026-11-01", "b"),
      {
        ...make("c", "IC-3", "2026-11-01", "c"),
        linkUrl: null,
        journalEntryId: "j1",
      },
    ];
    const j = [journal("j1", "2026-11-01", "unassisted")];
    const r: Review = {
      ...common,
      id: "r",
      createdAt: "2026-11-01T00:00:00Z",
      evidenceId: "a",
      reviewerType: "self",
      reviewerLabel: "Learner",
      feedback: "Good",
      outcome: "confirm",
      reviewedAt: "2026-11-01T00:00:00Z",
    };
    expect(computeCompetencies(e, [r], j, tasks)[0].status).toBe(
      "Demonstrated",
    );
    expect(
      computeCompetencies(e, [{ ...r, reviewerType: "external" }], j, tasks)[0]
        .status,
    ).toBe("Demonstrated");
  });
  it("future-dated evidence cannot satisfy a criterion or repeat consistency", () => {
    const e = [
      make("future-a", "IC-1", "2026-12-01", "task-a", "context-a"),
      make("future-b", "IC-1", "2026-12-15", "task-b", "context-b"),
      make("future-c", "IC-2", "2026-12-15", "task-c"),
      make("future-d", "IC-3", "2026-12-15", "task-d"),
    ];
    const result = computeCompetencies(
      e,
      reviews,
      [],
      tasks,
      new Date("2026-11-27T12:00:00Z"),
    )[0];
    expect(result.status).toBe("Not started");
    expect(result.criteria[0].satisfied).toBe(false);
    expect(result.criteria[0].evidence).toHaveLength(0);
    expect(result.status).not.toBe("Consistent");
  });
  it("soft deleted evidence is ignored and old evidence flagged stale", () => {
    const e = [
      make("a", "IC-1", "2026-05-01", "a"),
      make("b", "IC-2", "2026-05-01", "b"),
      make("c", "IC-3", "2026-05-01", "c"),
    ];
    const now = new Date("2026-11-25T00:00:00Z");
    expect(
      computeCompetencies(
        [{ ...e[0], deletedAt: "2026-05-02T00:00:00Z" }, e[1], e[2]],
        reviews,
        [],
        tasks,
        now,
      )[0].status,
    ).toBe("In progress");
    expect(computeCompetencies(e, reviews, [], tasks, now)[0].mayBeStale).toBe(
      true,
    );
  });
  it("ignores evidence whose linked journal or task is deleted", () => {
    const deletedJournal = {
      ...journal("j-deleted", "2026-11-01", "unassisted"),
      deletedAt: "2026-11-02T00:00:00Z",
    };
    const deletedTask = {
      ...common,
      id: "task-deleted",
      deletedAt: "2026-11-02T00:00:00Z",
    } as Task;
    const e = [
      {
        ...make("journal-evidence", "IC-1", "2026-11-01", null),
        linkUrl: null,
        journalEntryId: "j-deleted",
      },
      make("task-evidence", "IC-2", "2026-11-01", "task-deleted"),
    ];
    const result = computeCompetencies(
      e,
      reviews,
      [deletedJournal],
      [deletedTask],
      new Date("2026-11-27T12:00:00Z"),
    )[0];
    expect(result.criteria[0].satisfied).toBe(false);
    expect(result.criteria[1].satisfied).toBe(false);
    expect(result.status).toBe("Not started");
  });
});
