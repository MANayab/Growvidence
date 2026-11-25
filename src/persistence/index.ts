import type { IDBPDatabase } from "idb";

import {
  openDatabase,
  type GrowvidenceDB,
  type DatabaseOpenOptions,
  MigrationError,
} from "./database";
import {
  PersistenceError,
  toPersistenceError,
  type StorageNotice,
} from "./errors";
import { IndexedDbEvidenceRepository, IndexedDbReviewsRepository } from "./evidence";
import { IndexedDbEvidenceRepository, IndexedDbReviewsRepository } from "./evidence";
import {
  IndexedDbSettingsRepository,
  IndexedDbTasksRepository,
  IndexedDbTracksRepository,
  IndexedDbJournalEntriesRepository,
} from "./repositories";

export { PersistenceError } from "./errors";
export type { StorageNotice } from "./errors";
export {
  TrackSchema,
  TaskSchema,
  TaskStatusSchema,
  TaskPrioritySchema,
  LocalDateSchema,
  SettingsSchema,
  ThemePreferenceSchema,
  JournalEntrySchema,
  AiUseDisclosureSchema,
  AiUseModeSchema,
  CompetencySlugSchema,
  EvidenceSchema,
  ReviewSchema,
} from "./schemas";
export type {
  Track,
  Task,
  TaskStatus,
  TaskPriority,
  Settings,
  ThemePreference,
  JournalEntry,
  AiUseDisclosure,
  Evidence,
  Review,
  CompetencySlug,
} from "./schemas";
export { DATABASE_NAME, DATABASE_VERSION, applyMigrations } from "./database";

export interface PersistenceHandle {
  database: IDBPDatabase<GrowvidenceDB>;
  settings: IndexedDbSettingsRepository;
  tracks: IndexedDbTracksRepository;
  tasks: IndexedDbTasksRepository;
  journal: IndexedDbJournalEntriesRepository;
  evidence: IndexedDbEvidenceRepository;
  reviews: IndexedDbReviewsRepository;
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
            "This tab closed its older connection so another tab can upgrade it. Reload this tab.",
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
      tasks: new IndexedDbTasksRepository(database),
      journal: new IndexedDbJournalEntriesRepository(database),
      evidence: new IndexedDbEvidenceRepository(database),
      reviews: new IndexedDbReviewsRepository(database),
      close: () => database.close(),
    };
  } catch (error) {
    if (error instanceof MigrationError)
      throw new PersistenceError("migration-failed", error.message, {
        cause: error,
      });
    throw toPersistenceError(error);
  }
}
