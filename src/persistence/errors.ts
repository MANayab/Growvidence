export type PersistenceErrorCode =
  | "upgrade-blocked"
  | "quota-exceeded"
  | "storage-unavailable"
  | "storage-cleared"
  | "migration-failed"
  | "unknown";

export interface StorageNotice {
  code: PersistenceErrorCode | "ready";
  message: string;
}

export class PersistenceError extends Error {
  readonly code: PersistenceErrorCode;

  constructor(code: PersistenceErrorCode, message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = "PersistenceError";
    this.code = code;
  }
}

export function toPersistenceError(error: unknown): PersistenceError {
  if (error instanceof PersistenceError) return error;
  const name = error instanceof Error ? error.name : "";

  if (name === "QuotaExceededError") {
    return new PersistenceError(
      "quota-exceeded",
      "The browser's storage quota was exceeded. The save did not complete; existing records were not removed.",
      { cause: error },
    );
  }
  if (name === "VersionError") {
    return new PersistenceError(
      "migration-failed",
      "This browser profile contains a newer Growvidence database version. This app will not downgrade or replace it; open the newer app version to continue.",
      { cause: error },
    );
  }
  if (name === "NotFoundError") {
    return new PersistenceError(
      "storage-cleared",
      "The local database or a required store is no longer available. Browser site data may have been cleared; Growvidence cannot recover deleted data.",
      { cause: error },
    );
  }
  if (["SecurityError", "InvalidStateError", "NotAllowedError", "ReferenceError"].includes(name)) {
    return new PersistenceError(
      "storage-unavailable",
      "Browser storage is unavailable or blocked in this browsing context. The save did not complete.",
      { cause: error },
    );
  }
  if (name === "AbortError" || name === "UnknownError") {
    return new PersistenceError(
      "storage-unavailable",
      "The browser aborted the storage operation. The save did not complete; retry after checking browser storage settings.",
      { cause: error },
    );
  }
  return new PersistenceError(
    "unknown",
    "The local storage operation failed. The save did not complete; existing records were not deliberately removed.",
    { cause: error },
  );
}
