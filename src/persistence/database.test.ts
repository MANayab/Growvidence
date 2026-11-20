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
    expect(
      await upgraded.get("tracks", "4b6b3c1e-43a7-4c31-9e6e-b2d62d9e4c4f"),
    ).toMatchObject({
      title: "Preserved track",
    });
    expect(await upgraded.get("meta", "schemaVersion")).toEqual({
      key: "schemaVersion",
      value: 2,
    });
  });

  it("aborts a broken upgrade and leaves the previous version intact", async () => {
    const name = nextName();
    const previous = await openDB<GrowvidenceDB>(name, 1, {
      upgrade(db) {
        db.createObjectStore("meta", { keyPath: "key" });
      },
    });
    previous.close();

    await expect(openDatabase({ databaseName: name })).rejects.toThrow(
      "could not safely upgrade",
    );

    const stillVersionOne = await openDB<GrowvidenceDB>(name, 1);
    opened.push(stillVersionOne);
    expect(stillVersionOne.version).toBe(1);
  });
});
