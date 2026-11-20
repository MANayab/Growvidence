import "fake-indexeddb/auto";

import { afterEach, describe, expect, it } from "vitest";

import { openPersistence, type PersistenceHandle } from "./index";
import type { Track } from "./schemas";

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
    expect(await persistence.tracks.get(track.id)).toMatchObject({ title: track.title });
    expect(await persistence.tracks.list()).toHaveLength(1);
    await persistence.tracks.save({ ...track, deletedAt: "2026-11-21T01:00:00.000Z" });
    expect(await persistence.tracks.list()).toHaveLength(0);
  });
});
