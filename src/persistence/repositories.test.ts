import "fake-indexeddb/auto";

import { afterEach, describe, expect, it } from "vitest";

import { openPersistence, type PersistenceHandle } from "./index";
import type { Task, Track } from "./schemas";

const handles: PersistenceHandle[] = [];
let databaseSequence = 0;

async function createPersistence(): Promise<PersistenceHandle> {
  databaseSequence += 1;
  const handle = await openPersistence({
    databaseName: `growvidence-repository-test-${databaseSequence}`,
  });
  handles.push(handle);
  return handle;
}

const track: Track = {
  id: "4b6b3c1e-43a7-4c31-9e6e-b2d62d9e4c4f",
  schemaVersion: 1,
  createdAt: "2026-11-21T00:00:00.000Z",
  updatedAt: "2026-11-21T00:00:00.000Z",
  deletedAt: null,
  title: "Learn TypeScript",
  description: "Build small typed programs.",
  archivedAt: null,
};

afterEach(() => {
  for (const handle of handles.splice(0)) handle.close();
});

describe("settings repository", () => {
  it("saves and reads a theme preference", async () => {
    const persistence = await createPersistence();
    expect(await persistence.settings.get()).toBeUndefined();
    const saved = await persistence.settings.save("dark");
    expect(saved.theme).toBe("dark");
    expect((await persistence.settings.get())?.theme).toBe("dark");
  });
});

describe("tracks repository", () => {
  it("persists tracks and excludes soft-deleted records from normal lists", async () => {
    const persistence = await createPersistence();
    await persistence.tracks.save(track);
    expect(await persistence.tracks.get(track.id)).toMatchObject({
      title: track.title,
    });
    expect(await persistence.tracks.list()).toHaveLength(1);
    await persistence.tracks.save({
      ...track,
      deletedAt: "2026-11-21T01:00:00.000Z",
    });
    expect(await persistence.tracks.list()).toHaveLength(0);
  });
});

const task: Task = {
  id: "f11b83a0-16f0-4d1a-9e2f-29b1b85b04a2",
  schemaVersion: 1,
  createdAt: "2026-11-21T00:00:00.000Z",
  updatedAt: "2026-11-21T00:00:00.000Z",
  deletedAt: null,
  trackId: track.id,
  title: "Write a test",
  description: "",
  status: "today",
  priority: "high",
  dueDate: "2026-11-21",
  estimatedMinutes: 30,
  actualMinutes: 15,
  tags: ["practice"],
};

describe("task repository", () => {
  it("validates task fields and requires an active track", async () => {
    const persistence = await createPersistence();
    await persistence.tracks.save(track);
    await persistence.tasks.save(task);
    expect(await persistence.tasks.get(task.id)).toMatchObject({ title: task.title, actualMinutes: 15 });
    await expect(persistence.tasks.save({ ...task, dueDate: "2026-02-30" })).rejects.toThrow();
    await expect(persistence.tasks.save({ ...task, trackId: "c2f3d74c-27b7-4d1f-9f80-4b7d2f36b4c9" })).rejects.toThrow("active learning track");
  });

  it("soft-deletes tracks and dependent tasks, then permanently removes both", async () => {
    const persistence = await createPersistence();
    await persistence.tracks.save(track);
    await persistence.tasks.save(task);
    await persistence.tracks.softDelete(track.id);
    expect(await persistence.tracks.list()).toHaveLength(0);
    expect(await persistence.tracks.list(true, true)).toHaveLength(1);
    expect(await persistence.tasks.list()).toHaveLength(0);
    expect(await persistence.tasks.list({ includeDeleted: true })).toHaveLength(1);
    await persistence.tracks.permanentlyDelete(track.id);
    expect(await persistence.tracks.get(track.id)).toBeUndefined();
    expect(await persistence.tasks.get(task.id)).toBeUndefined();
  });

  it("archives tracks without deleting tasks", async () => {
    const persistence = await createPersistence();
    await persistence.tracks.save(track);
    await persistence.tasks.save(task);
    await persistence.tracks.archive(track.id);
    expect(await persistence.tasks.get(task.id)).toBeDefined();
    expect(await persistence.tasks.move(task.id, "done")).toMatchObject({ status: "done" });
  });

  it("soft-deletes and permanently deletes an individual task", async () => {
    const persistence = await createPersistence();
    await persistence.tracks.save(track);
    await persistence.tasks.save(task);
    await persistence.tasks.softDelete(task.id);
    expect(await persistence.tasks.list()).toHaveLength(0);
    expect(await persistence.tasks.list({ includeDeleted: true })).toHaveLength(1);
    await persistence.tasks.permanentlyDelete(task.id);
    expect(await persistence.tasks.get(task.id)).toBeUndefined();
  });
});
