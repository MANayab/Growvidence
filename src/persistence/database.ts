import {
  openDB,
  type DBSchema,
  type IDBPDatabase,
  type IDBPTransaction,
} from "idb";

export const DATABASE_NAME = "growvidence-local";
export const DATABASE_VERSION = 4;

interface MetaRecord {
  key: string;
  value: number;
}
export interface GrowvidenceDB extends DBSchema {
  meta: { key: string; value: MetaRecord };
  settings: { key: string; value: import("./schemas").Settings };
  tracks: {
    key: string;
    value: import("./schemas").Track;
    indexes: { by_updatedAt: string };
  };
  tasks: {
    key: string;
    value: import("./schemas").Task;
    indexes: {
      by_trackId: string;
      by_status: string;
      by_dueDate: string;
      by_updatedAt: string;
    };
  };
}
type UpgradeTransaction = IDBPTransaction<
  GrowvidenceDB,
  ("meta" | "settings" | "tracks" | "tasks" | "journalEntries")[],
  "versionchange"
>;

export class MigrationError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = "MigrationError";
  }
}
export function applyMigrations(
  db: IDBPDatabase<GrowvidenceDB>,
  oldVersion: number,
  transaction: UpgradeTransaction,
): void {
  try {
    if (oldVersion < 1) {
      if (!db.objectStoreNames.contains("meta"))
        db.createObjectStore("meta", { keyPath: "key" });
      if (!db.objectStoreNames.contains("settings"))
        db.createObjectStore("settings", { keyPath: "id" });
      if (!db.objectStoreNames.contains("tracks"))
        db.createObjectStore("tracks", { keyPath: "id" });
      transaction.objectStore("meta").put({ key: "schemaVersion", value: 1 });
    }
    if (oldVersion < 2) {
      const tracks = transaction.objectStore("tracks");
      if (!tracks.indexNames.contains("by_updatedAt"))
        tracks.createIndex("by_updatedAt", "updatedAt");
      transaction.objectStore("meta").put({ key: "schemaVersion", value: 2 });
    }
    if (oldVersion < 3) {
      const tasks = db.createObjectStore("tasks", { keyPath: "id" });
      tasks.createIndex("by_trackId", "trackId");
      tasks.createIndex("by_status", "status");
      tasks.createIndex("by_dueDate", "dueDate");
      tasks.createIndex("by_updatedAt", "updatedAt");
      transaction.objectStore("meta").put({ key: "schemaVersion", value: 3 });
    }
    if (oldVersion < 4) {
      const journal = db.createObjectStore("journalEntries", { keyPath: "id" });
      journal.createIndex("by_trackId", "trackId");
      journal.createIndex("by_taskId", "taskId");
      journal.createIndex("by_date", "date");
      journal.createIndex("by_updatedAt", "updatedAt");
      transaction.objectStore("meta").put({ key: "schemaVersion", value: 4 });
    }
  } catch (error) {
    throw new MigrationError(
      "The local database migration was aborted. Existing data was not intentionally deleted.",
      { cause: error },
    );
  }
}
export interface DatabaseOpenOptions {
  databaseName?: string;
  onBlocked?: () => void;
  onBlocking?: () => void;
  onUnexpectedClose?: () => void;
}
export async function openDatabase(
  options: DatabaseOpenOptions = {},
): Promise<IDBPDatabase<GrowvidenceDB>> {
  let migrationFailed = false;
  let upgradeTransactionError: unknown;
  if (typeof indexedDB === "undefined")
    throw new DOMException(
      "IndexedDB is unavailable in this browsing context.",
      "SecurityError",
    );
  try {
    return await openDB<GrowvidenceDB>(
      options.databaseName ?? DATABASE_NAME,
      DATABASE_VERSION,
      {
        upgrade(db, oldVersion, _newVersion, transaction) {
          void transaction.done.catch((error: unknown) => {
            upgradeTransactionError = error;
          });
          try {
            applyMigrations(db, oldVersion, transaction);
          } catch (error) {
            migrationFailed = true;
            throw error;
          }
        },
        blocked() {
          options.onBlocked?.();
        },
        blocking(_currentVersion, _blockedVersion, event) {
          options.onBlocking?.();
          (event.target as IDBDatabase | null)?.close();
        },
        terminated() {
          options.onUnexpectedClose?.();
        },
      },
    );
  } catch (error) {
    if (migrationFailed)
      throw new MigrationError(
        "Growvidence could not safely upgrade its local database. The previous database version was retained.",
        { cause: upgradeTransactionError ?? error },
      );
    throw error;
  }
}
