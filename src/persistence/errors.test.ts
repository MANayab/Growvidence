import { describe, expect, it } from "vitest";

import { toPersistenceError } from "./errors";

describe("persistence error classification", () => {
  it("surfaces quota exhaustion without implying a successful save", () => {
    const error = toPersistenceError(new DOMException("Quota full", "QuotaExceededError"));
    expect(error.code).toBe("quota-exceeded");
    expect(error.message).toContain("save did not complete");
  });

  it("surfaces blocked or unavailable storage as recoverable", () => {
    const error = toPersistenceError(new DOMException("Blocked", "SecurityError"));
    expect(error.code).toBe("storage-unavailable");
  });

  it("refuses to downgrade a newer database version", () => {
    const error = toPersistenceError(new DOMException("Newer version", "VersionError"));
    expect(error.code).toBe("migration-failed");
    expect(error.message).toContain("will not downgrade");
  });

  it("explains when the local database is no longer available", () => {
    const error = toPersistenceError(new DOMException("Missing store", "NotFoundError"));
    expect(error.code).toBe("storage-cleared");
  });
});
