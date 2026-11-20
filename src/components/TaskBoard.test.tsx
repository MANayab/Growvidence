import { renderToString } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import TaskBoard from "./TaskBoard";
import type { Task } from "../persistence/schemas";

const task: Task = {
  id: "f11b83a0-16f0-4d1a-9e2f-29b1b85b04a2", schemaVersion: 1,
  createdAt: "2026-11-21T00:00:00.000Z", updatedAt: "2026-11-21T00:00:00.000Z", deletedAt: null,
  trackId: "4b6b3c1e-43a7-4c31-9e6e-b2d62d9e4c4f", title: "Build test", description: "",
  status: "backlog", priority: "normal", dueDate: null, estimatedMinutes: null, actualMinutes: null, tags: [],
};
describe("TaskBoard keyboard-accessible status controls", () => {
  it("renders native labeled Move to selects and all five status options", () => {
    const html = renderToString(<TaskBoard tasks={[task]} tracks={[]} onMove={vi.fn()} onEdit={vi.fn()} />);
    expect(html).toContain('aria-label="Task status board"');
    expect(html).toContain('aria-label="Move Build test to status"');
    for (const label of ["Backlog", "Today", "In progress", "Review", "Done"]) expect(html).toContain(label);
    expect(html).toContain("<select");
  });
});
