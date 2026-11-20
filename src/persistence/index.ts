import type { IDBPDatabase } from "idb";

import {
  openDatabase,
  type GrowvidenceDB,
  type DatabaseOpenOptions,
} from "./database";
import { MigrationError } from "./database";
import {
  PersistenceError,
  toPersistenceError,
  type StorageNotice,
} from "./errors";
import {
  IndexedDbSettingsRepository,
  IndexedDbTracksRepository,
} from "./repositories";

export { PersistenceError } from "./errors";
export type { StorageNotice } from "./errors";
export { TrackSchema, SettingsSchema, ThemePreferenceSchema } from "./schemas";
export type { Track, Settings, ThemePreference } from "./schemas";
export { DATABASE_NAME, DATABASE_VERSION, applyMigrations } from "./database";

export interface PersistenceHandle {
  database: IDBPDatabase<GrowvidenceDB>;
  settings: IndexedDbSettingsRepository;
  tracks: IndexedDbTracksRepository;
  close(): void;
}

export interface OpenPersistenceOptions extends DatabaseOpenOptions {
  onNotice?: (notice: StorageNotice) => void;
}

export async function openPersistence(
  options: OpenPersistenceOptions = {},
): Promise<PersistenceHandle> {
  try {
    const database = await openDatabase({
      databaseName: options.databaseName,
      onBlocked: () =>
        options.onNotice?.({
          code: "upgrade-blocked",
          message: "Database upgrade is waiting for another open tab.",
        }),
      onBlocking: () =>
        options.onNotice?.({
          code: "upgrade-blocked",
          message:
            "This tab closed its older connection so another tab can upgrade the database. Reload this tab.",
        }),
      onUnexpectedClose: () =>
        options.onNotice?.({
          code: "storage-cleared",
          message: "The local database connection closed unexpectedly.",
        }),
    });
    return {
      database,
      settings: new IndexedDbSettingsRepository(database),
      tracks: new IndexedDbTracksRepository(database),
      close: () => database.close(),
    };
  } catch (error) {
    if (error instanceof MigrationError) {
      throw new PersistenceError("migration-failed", error.message, {
        cause: error,
      });
    }
    throw toPersistenceError(error);
  }
}
