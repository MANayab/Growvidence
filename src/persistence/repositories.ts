import type { IDBPDatabase } from "idb";

import type { GrowvidenceDB } from "./database";
import { PersistenceError, toPersistenceError } from "./errors";
import {
  SettingsSchema,
  TrackSchema,
  type Settings,
  type ThemePreference,
  type Track,
} from "./schemas";

export interface SettingsRepository {
  get(): Promise<Settings | undefined>;
  save(theme: ThemePreference): Promise<Settings>;
}

export interface TracksRepository {
  get(id: string): Promise<Track | undefined>;
  list(): Promise<Track[]>;
  save(track: Track): Promise<Track>;
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

  async list(): Promise<Track[]> {
    try {
      const records = await this.database.getAll("tracks");
      return records
        .map((record) => TrackSchema.parse(record))
        .filter((record) => record.deletedAt === null)
        .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt));
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
}
