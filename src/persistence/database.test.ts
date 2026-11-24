import "fake-indexeddb/auto";

import { openDB } from "idb";
import { afterEach, describe, expect, it } from "vitest";

import { DATABASE_VERSION, openDatabase, type GrowvidenceDB } from "./database";

const opened: Array<{ close: () => void }> = [];
let databaseSequence = 0;

function nextName(): string {
  databaseSequence += 1;
  return `growvidence-migration-test-${databaseSequence}`;
}

afterEach(() => {
  for (const database of opened.splice(0)) database.close();
});

describe("database migrations", () => {
  it("upgrades version 1 and preserves existing tracks", async () => {
    const name = nextName();
    const previous = await openDB<GrowvidenceDB>(name, 1, {
      upgrade(db) {
        db.createObjectStore("meta", { keyPath: "key" });
        db.createObjectStore("settings", { keyPath: "id" });
        db.createObjectStore("tracks", { keyPath: "id" });
      },
    });
    await previous.put("tracks", {
      id: "4b6b3c1e-43a7-4c31-9e6e-b2d62d9e4c4f",
      schemaVersion: 1,
      createdAt: "2026-11-21T00:00:00.000Z",
      updatedAt: "2026-11-21T00:00:00.000Z",
      deletedAt: null,
      title: "Preserved track",
      description: "",
      archivedAt: null,
    });
    previous.close();

    const upgraded = await openDatabase({ databaseName: name });
    opened.push(upgraded);
    expect(upgraded.version).toBe(DATABASE_VERSION);
    expect(
      upgraded.transaction("tracks").store.indexNames.contains("by_updatedAt"),
    ).toBe(true);
    expect(upgraded.objectStoreNames.contains("tasks")).toBe(true);
    expect(upgraded.objectStoreNames.contains("journalEntries")).toBe(true);
    const journalStore = upgraded.transaction("journalEntries").store;
    for (const index of [
      "by_trackId",
      "by_taskId",
      "by_date",
      "by_updatedAt",
    ] as const)
      expect(journalStore.indexNames.contains(index)).toBe(true);
    expect(
      upgraded.transaction("tasks").store.indexNames.contains("by_trackId"),
    ).toBe(true);
    expect(
      upgraded.transaction("tasks").store.indexNames.contains("by_status"),
    ).toBe(true);
    expect(
      upgraded.transaction("tasks").store.indexNames.contains("by_dueDate"),
    ).toBe(true);
    expect(
      await upgraded.get("tracks", "4b6b3c1e-43a7-4c31-9e6e-b2d62d9e4c4f"),
    ).toMatchObject({
      title: "Preserved track",
    });
    expect(await upgraded.get("meta", "schemaVersion")).toEqual({
      key: "schemaVersion",
      value: 4,
    });
  });

  it("upgrades the version 2 schema to version 4 and creates task and journal stores", async () => {
    const name = nextName();
    const previous = await openDB<GrowvidenceDB>(name, 2, {
      upgrade(db) {
        db.createObjectStore("meta", { keyPath: "key" });
        db.createObjectStore("settings", { keyPath: "id" });
        const tracks = db.createObjectStore("tracks", { keyPath: "id" });
        tracks.createIndex("by_updatedAt", "updatedAt");
      },
    });
    previous.close();

    const upgraded = await openDatabase({ databaseName: name });
    opened.push(upgraded);
    expect(upgraded.version).toBe(4);
    const taskStore = upgraded.transaction("tasks").store;
    expect(taskStore.indexNames.contains("by_trackId")).toBe(true);
    expect(taskStore.indexNames.contains("by_status")).toBe(true);
    expect(taskStore.indexNames.contains("by_dueDate")).toBe(true);
    expect(taskStore.indexNames.contains("by_updatedAt")).toBe(true);
    expect(upgraded.objectStoreNames.contains("journalEntries")).toBe(true);
    const journalStore = upgraded.transaction("journalEntries").store;
    for (const index of [
      "by_trackId",
      "by_taskId",
      "by_date",
      "by_updatedAt",
    ] as const)
      expect(journalStore.indexNames.contains(index)).toBe(true);
    expect(await upgraded.get("meta", "schemaVersion")).toEqual({
      key: "schemaVersion",
      value: 4,
    });
  });

  it("upgrades version 3 to 4 and preserves existing tracks, tasks and settings", async () => {
    const name = nextName();
    const existingSettings = {
      id: "user-settings" as const,
      schemaVersion: 1,
      createdAt: "2026-11-21T00:00:00.000Z",
      updatedAt: "2026-11-21T00:00:00.000Z",
      deletedAt: null,
      theme: "dark" as const,
    };
    const existingTrack = {
      id: "4b6b3c1e-43a7-4c31-9e6e-b2d62d9e4c4f",
      schemaVersion: 1,
      createdAt: "2026-11-21T00:00:00.000Z",
      updatedAt: "2026-11-21T00:00:00.000Z",
      deletedAt: null,
      title: "Preserved track",
      description: "Track record must survive the v4 upgrade.",
      archivedAt: null,
    };
    const existingTask = {
      id: "f11b83a0-16f0-4d1a-9e2f-29b1b85b04a2",
      schemaVersion: 1,
      createdAt: "2026-11-21T00:00:00.000Z",
      updatedAt: "2026-11-21T00:00:00.000Z",
      deletedAt: null,
      trackId: existingTrack.id,
      title: "Preserved task",
      description: "Task record must survive the v4 upgrade.",
      status: "today" as const,
      priority: "high" as const,
      dueDate: "2026-11-21",
      estimatedMinutes: 45,
      actualMinutes: 30,
      tags: ["migration-test"],
    };
    const previous = await openDB<GrowvidenceDB>(name, 3, {
      upgrade(db) {
        const meta = db.createObjectStore("meta", { keyPath: "key" });
        meta.put({ key: "schemaVersion", value: 3 });
        meta.put({ key: "sentinel", value: "keep" });
        db.createObjectStore("settings", { keyPath: "id" });
        const tracks = db.createObjectStore("tracks", { keyPath: "id" });
        tracks.createIndex("by_updatedAt", "updatedAt");
        const tasks = db.createObjectStore("tasks", { keyPath: "id" });
        tasks.createIndex("by_trackId", "trackId");
        tasks.createIndex("by_status", "status");
        tasks.createIndex("by_dueDate", "dueDate");
        tasks.createIndex("by_updatedAt", "updatedAt");
      },
    });
    await previous.put("settings", existingSettings);
    await previous.put("tracks", existingTrack);
    await previous.put("tasks", existingTask);
    previous.close();

    const upgraded = await openDatabase({ databaseName: name });
    opened.push(upgraded);
    expect(upgraded.version).toBe(4);
    expect(upgraded.objectStoreNames.contains("journalEntries")).toBe(true);
    expect(await upgraded.get("settings", existingSettings.id)).toEqual(existingSettings);
    expect(await upgraded.get("tracks", existingTrack.id)).toEqual(existingTrack);
    expect(await upgraded.get("tasks", existingTask.id)).toEqual(existingTask);
    expect(await upgraded.get("meta", "sentinel")).toEqual({
      key: "sentinel",
      value: "keep",
    });
    expect(await upgraded.get("meta", "schemaVersion")).toEqual({
      key: "schemaVersion",
      value: 4,
    });
  });

  it("aborts a broken upgrade, preserves prior data/version and handles transaction rejection", async () => {
    const name = nextName();
    const previous = await openDB<GrowvidenceDB>(name, 1, {
      upgrade(db) {
        const meta = db.createObjectStore("meta", { keyPath: "key" });
        meta.put({ key: "schemaVersion", value: 1 });
        meta.put({ key: "sentinel", value: 41 });
      },
    });
    previous.close();

    await expect(openDatabase({ databaseName: name })).rejects.toThrow(
      "could not safely upgrade",
    );

    // Allow the IndexedDB abort and Node's unhandled-rejection checkpoint to
    // run. Vitest treats any leaked transaction.done rejection as a test error.
    await new Promise<void>((resolve) => setTimeout(resolve, 0));

    const stillVersionOne = await openDB<GrowvidenceDB>(name, 1);
    opened.push(stillVersionOne);
    expect(stillVersionOne.version).toBe(1);
    expect(await stillVersionOne.get("meta", "schemaVersion")).toEqual({
      key: "schemaVersion",
      value: 1,
    });
    expect(await stillVersionOne.get("meta", "sentinel")).toEqual({
      key: "sentinel",
      value: 41,
    });
  });
  it("aborts a v3 migration and retains the old version, settings, tracks and tasks without an unhandled rejection", async () => {
    const name = nextName();
    const retainedSettings = {
      id: "user-settings" as const,
      schemaVersion: 1,
      createdAt: "2026-11-21T00:00:00.000Z",
      updatedAt: "2026-11-21T00:00:00.000Z",
      deletedAt: null,
      theme: "light" as const,
    };
    const retainedTrack = {
      id: "4b6b3c1e-43a7-4c31-9e6e-b2d62d9e4c4f",
      schemaVersion: 1,
      createdAt: "2026-11-21T00:00:00.000Z",
      updatedAt: "2026-11-21T00:00:00.000Z",
      deletedAt: null,
      title: "Old track remains",
      description: "",
      archivedAt: null,
    };
    const retainedTask = {
      id: "f11b83a0-16f0-4d1a-9e2f-29b1b85b04a2",
      schemaVersion: 1,
      createdAt: "2026-11-21T00:00:00.000Z",
      updatedAt: "2026-11-21T00:00:00.000Z",
      deletedAt: null,
      trackId: retainedTrack.id,
      title: "Old task remains",
      description: "",
      status: "backlog" as const,
      priority: "normal" as const,
      dueDate: null,
      estimatedMinutes: null,
      actualMinutes: null,
      tags: [],
    };
    const prior = await openDB<GrowvidenceDB>(name, 3, {
      upgrade(db) {
        const meta = db.createObjectStore("meta", { keyPath: "key" });
        meta.put({ key: "schemaVersion", value: 3 });
        meta.put({ key: "sentinel", value: "keep" });
        db.createObjectStore("settings", { keyPath: "id" });
        const tracks = db.createObjectStore("tracks", { keyPath: "id" });
        tracks.createIndex("by_updatedAt", "updatedAt");
        const tasks = db.createObjectStore("tasks", { keyPath: "id" });
        tasks.createIndex("by_trackId", "trackId");
        tasks.createIndex("by_status", "status");
        tasks.createIndex("by_dueDate", "dueDate");
        tasks.createIndex("by_updatedAt", "updatedAt");
        // Deliberately pre-create the store that v4 migration creates to fail
        // inside the versionchange transaction.
        db.createObjectStore("journalEntries", { keyPath: "id" });
      },
    });
    await prior.put("settings", retainedSettings);
    await prior.put("tracks", retainedTrack);
    await prior.put("tasks", retainedTask);
    prior.close();

    await expect(openDatabase({ databaseName: name })).rejects.toThrow(
      "safely upgrade",
    );
    // Wait through the rejection checkpoint. The migration attaches a handler
    // to transaction.done so the abort rejection is not left unhandled.
    await new Promise<void>((resolve) => setTimeout(resolve, 0));

    const retained = await openDB<GrowvidenceDB>(name, 3);
    opened.push(retained);
    expect(retained.version).toBe(3);
    expect(await retained.get("settings", retainedSettings.id)).toEqual(retainedSettings);
    expect(await retained.get("tracks", retainedTrack.id)).toEqual(retainedTrack);
    expect(await retained.get("tasks", retainedTask.id)).toEqual(retainedTask);
    expect(await retained.get("meta", "schemaVersion")).toEqual({
      key: "schemaVersion",
      value: 3,
    });
    expect(await retained.get("meta", "sentinel")).toEqual({
      key: "sentinel",
      value: "keep",
    });
  });
});
