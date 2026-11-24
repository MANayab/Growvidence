import type { IDBPDatabase } from "idb";

import type { GrowvidenceDB } from "./database";
import { PersistenceError, toPersistenceError } from "./errors";
import {
  SettingsSchema,
  TaskSchema,
  TrackSchema,
  type Settings,
  type Task,
  type TaskStatus,
  type ThemePreference,
  type Track,
} from "./schemas";

export interface SettingsRepository {
  get(): Promise<Settings | undefined>;
  save(theme: ThemePreference): Promise<Settings>;
}
export interface TracksRepository {
  get(id: string): Promise<Track | undefined>;
  list(includeArchived?: boolean, includeDeleted?: boolean): Promise<Track[]>;
  save(track: Track): Promise<Track>;
  archive(id: string): Promise<Track>;
  softDelete(id: string): Promise<void>;
  permanentlyDelete(id: string): Promise<void>;
}
export interface TasksRepository {
  get(id: string): Promise<Task | undefined>;
  list(options?: { includeDeleted?: boolean }): Promise<Task[]>;
  save(task: Task): Promise<Task>;
  softDelete(id: string): Promise<void>;
  permanentlyDelete(id: string): Promise<void>;
  move(id: string, status: TaskStatus): Promise<Task>;
}

export class IndexedDbSettingsRepository implements SettingsRepository {
  constructor(private readonly database: IDBPDatabase<GrowvidenceDB>) {}
  async get(): Promise<Settings | undefined> {
    try {
      const record = await this.database.get("settings", "user-settings");
      return record ? SettingsSchema.parse(record) : undefined;
    } catch (error) {
      throw toPersistenceError(error);
    }
  }
  async save(theme: ThemePreference): Promise<Settings> {
    const now = new Date().toISOString();
    try {
      const existing = await this.get();
      const settings = SettingsSchema.parse({
        id: "user-settings",
        schemaVersion: 1,
        createdAt: existing?.createdAt ?? now,
        updatedAt: now,
        deletedAt: null,
        theme,
      });
      await this.database.put("settings", settings);
      return settings;
    } catch (error) {
      if (error instanceof PersistenceError) throw error;
      throw toPersistenceError(error);
    }
  }
}

export class IndexedDbTracksRepository implements TracksRepository {
  constructor(private readonly database: IDBPDatabase<GrowvidenceDB>) {}
  async get(id: string): Promise<Track | undefined> {
    try {
      const record = await this.database.get("tracks", id);
      return record ? TrackSchema.parse(record) : undefined;
    } catch (error) {
      throw toPersistenceError(error);
    }
  }
  async list(
    includeArchived = false,
    includeDeleted = false,
  ): Promise<Track[]> {
    try {
      const records = await this.database.getAll("tracks");
      return records
        .map((record) => TrackSchema.parse(record))
        .filter(
          (record) =>
            (includeDeleted || record.deletedAt === null) &&
            (includeArchived || record.archivedAt === null),
        )
        .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    } catch (error) {
      throw toPersistenceError(error);
    }
  }
  async save(input: Track): Promise<Track> {
    try {
      const track = TrackSchema.parse(input);
      await this.database.put("tracks", track);
      return track;
    } catch (error) {
      if (error instanceof PersistenceError) throw error;
      throw toPersistenceError(error);
    }
  }
  async archive(id: string): Promise<Track> {
    try {
      const existing = await this.get(id);
      if (!existing || existing.deletedAt)
        throw new PersistenceError(
          "unknown",
          "That learning track no longer exists.",
        );
      const now = new Date().toISOString();
      return this.save(
        TrackSchema.parse({
          ...existing,
          archivedAt: existing.archivedAt ?? now,
          updatedAt: now,
        }),
      );
    } catch (error) {
      if (error instanceof PersistenceError) throw error;
      throw toPersistenceError(error);
    }
  }
  async softDelete(id: string): Promise<void> {
    try {
      const tx = this.database.transaction(["tracks", "tasks"], "readwrite");
      void tx.done.catch(() => undefined);
      const track = await tx.objectStore("tracks").get(id);
      if (!track) {
        await tx.done;
        return;
      }
      const now = new Date().toISOString();
      await tx
        .objectStore("tracks")
        .put(TrackSchema.parse({ ...track, deletedAt: now, updatedAt: now }));
      for (
        let cursor = await tx
          .objectStore("tasks")
          .index("by_trackId")
          .openCursor(id);
        cursor;
        cursor = await cursor.continue()
      ) {
        const task = TaskSchema.parse(cursor.value);
        if (!task.deletedAt)
          await cursor.update(
            TaskSchema.parse({ ...task, deletedAt: now, updatedAt: now }),
          );
      }
      await tx.done;
    } catch (error) {
      throw toPersistenceError(error);
    }
  }
  async permanentlyDelete(id: string): Promise<void> {
    try {
      const tx = this.database.transaction(["tracks", "tasks"], "readwrite");
      void tx.done.catch(() => undefined);
      for (
        let cursor = await tx
          .objectStore("tasks")
          .index("by_trackId")
          .openCursor(id);
        cursor;
        cursor = await cursor.continue()
      ) {
        await cursor.delete();
      }
      await tx.objectStore("tracks").delete(id);
      await tx.done;
    } catch (error) {
      throw toPersistenceError(error);
    }
  }
}

export class IndexedDbTasksRepository implements TasksRepository {
  constructor(private readonly database: IDBPDatabase<GrowvidenceDB>) {}
  async get(id: string): Promise<Task | undefined> {
    try {
      const record = await this.database.get("tasks", id);
      return record ? TaskSchema.parse(record) : undefined;
    } catch (error) {
      throw toPersistenceError(error);
    }
  }
  async list(options: { includeDeleted?: boolean } = {}): Promise<Task[]> {
    try {
      const records = await this.database.getAll("tasks");
      return records
        .map((record) => TaskSchema.parse(record))
        .filter((record) => options.includeDeleted || record.deletedAt === null)
        .sort(
          (a, b) =>
            (a.dueDate ?? "9999-12-31").localeCompare(
              b.dueDate ?? "9999-12-31",
            ) || b.updatedAt.localeCompare(a.updatedAt),
        );
    } catch (error) {
      throw toPersistenceError(error);
    }
  }
  async save(input: Task): Promise<Task> {
    try {
      const task = TaskSchema.parse(input);
      const tx = this.database.transaction(["tracks", "tasks"], "readwrite");
      void tx.done.catch(() => undefined);
      const track = await tx.objectStore("tracks").get(task.trackId);
      const existing = await tx.objectStore("tasks").get(task.id);
      if (
        !track ||
        track.deletedAt ||
        (track.archivedAt && (!existing || existing.trackId !== task.trackId))
      ) {
        tx.abort();
        throw new PersistenceError(
          "unknown",
          "Choose an active learning track before creating a task. Existing tasks in archived tracks may still be updated.",
        );
      }
      await tx.objectStore("tasks").put(task);
      await tx.done;
      return task;
    } catch (error) {
      if (error instanceof PersistenceError) throw error;
      throw toPersistenceError(error);
    }
  }
  async softDelete(id: string): Promise<void> {
    try {
      const task = await this.get(id);
      if (!task) return;
      const now = new Date().toISOString();
      await this.database.put(
        "tasks",
        TaskSchema.parse({ ...task, deletedAt: now, updatedAt: now }),
      );
    } catch (error) {
      throw toPersistenceError(error);
    }
  }
  async permanentlyDelete(id: string): Promise<void> {
    try {
      await this.database.delete("tasks", id);
    } catch (error) {
      throw toPersistenceError(error);
    }
  }
  async move(id: string, status: TaskStatus): Promise<Task> {
    const task = await this.get(id);
    if (!task || task.deletedAt)
      throw new PersistenceError("unknown", "That task no longer exists.");
    const now = new Date().toISOString();
    return this.save(TaskSchema.parse({ ...task, status, updatedAt: now }));
  }
}
