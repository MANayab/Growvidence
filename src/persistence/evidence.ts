import type { IDBPDatabase } from "idb";
import type { GrowvidenceDB } from "./database";
import {
  EvidenceSchema,
  ReviewSchema,
  type Evidence,
  type Review,
} from "./schemas";
import { COMPETENCY_RULES } from "../domain/competencyRules";
export class IndexedDbEvidenceRepository {
  constructor(private readonly database: IDBPDatabase<GrowvidenceDB>) {}
  async list(options: { includeDeleted?: boolean } = {}): Promise<Evidence[]> {
    return (await this.database.getAll("evidence"))
      .map((item) => EvidenceSchema.parse(item))
      .filter((x) => options.includeDeleted || x.deletedAt === null)
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }
  async get(id: string): Promise<Evidence | undefined> {
    const item = await this.database.get("evidence", id);
    return item ? EvidenceSchema.parse(item) : undefined;
  }
  async save(input: Evidence): Promise<Evidence> {
    const item = EvidenceSchema.parse(input);
    const rule = COMPETENCY_RULES.find((x) => x.slug === item.competencySlug);
    if (!rule?.criteria.some((c) => c.key === item.criterionKey)) {
      throw new Error("Select a criterion that belongs to this competency.");
    }
    const stores = ["evidence", "journalEntries", "tasks"] as const;
    const tx = this.database.transaction(stores, "readwrite");
    void tx.done.catch(() => undefined);
    if (item.journalEntryId) {
      const journal = await tx.objectStore("journalEntries").get(item.journalEntryId);
      if (!journal || journal.deletedAt) {
        tx.abort();
        throw new Error("Evidence must link to an existing, active journal entry.");
      }
    }
    if (item.taskId) {
      const task = await tx.objectStore("tasks").get(item.taskId);
      if (!task || task.deletedAt) {
        tx.abort();
        throw new Error("Evidence must link to an existing, active task.");
      }
    }
    await tx.objectStore("evidence").put(item);
    await tx.done;
    return item;
  }
  async softDelete(id: string): Promise<void> {
    const item = await this.get(id);
    if (!item || item.deletedAt) return;
    const now = new Date().toISOString();
    await this.database.put(
      "evidence",
      EvidenceSchema.parse({ ...item, deletedAt: now, updatedAt: now }),
    );
  }
  async restore(id: string): Promise<void> {
    const item = await this.get(id);
    if (!item || !item.deletedAt) return;
    const now = new Date().toISOString();
    await this.database.put(
      "evidence",
      EvidenceSchema.parse({ ...item, deletedAt: null, updatedAt: now }),
    );
  }
  async permanentlyDelete(id: string): Promise<void> {
    const tx = this.database.transaction(["evidence", "reviews"], "readwrite");
    void tx.done.catch(() => undefined);
    for (
      let cursor = await tx.objectStore("reviews").index("by_evidenceId").openCursor(id);
      cursor;
      cursor = await cursor.continue()
    ) {
      await cursor.delete();
    }
    await tx.objectStore("evidence").delete(id);
    await tx.done;
  }
}
export class IndexedDbReviewsRepository {
  constructor(private readonly database: IDBPDatabase<GrowvidenceDB>) {}
  async list(options: { includeDeleted?: boolean } = {}): Promise<Review[]> {
    return (await this.database.getAll("reviews"))
      .map((item) => ReviewSchema.parse(item))
      .filter((x) => options.includeDeleted || x.deletedAt === null)
      .sort((a, b) => b.reviewedAt.localeCompare(a.reviewedAt));
  }
  async get(id: string): Promise<Review | undefined> {
    const item = await this.database.get("reviews", id);
    return item ? ReviewSchema.parse(item) : undefined;
  }
  async save(input: Review): Promise<Review> {
    const item = ReviewSchema.parse(input);
    const tx = this.database.transaction(["reviews", "evidence"], "readwrite");
    void tx.done.catch(() => undefined);
    const evidence = await tx.objectStore("evidence").get(item.evidenceId);
    if (!evidence || evidence.deletedAt) {
      tx.abort();
      throw new Error("Review must belong to existing, active evidence.");
    }
    await tx.objectStore("reviews").put(item);
    await tx.done;
    return item;
  }
  async softDelete(id: string): Promise<void> {
    const item = await this.get(id);
    if (!item || item.deletedAt) return;
    const now = new Date().toISOString();
    await this.database.put(
      "reviews",
      ReviewSchema.parse({ ...item, deletedAt: now, updatedAt: now }),
    );
  }
  async restore(id: string): Promise<void> {
    const item = await this.get(id);
    if (!item || !item.deletedAt) return;
    const evidence = await this.database.get("evidence", item.evidenceId);
    if (!evidence || evidence.deletedAt) {
      throw new Error("Restore the linked evidence first.");
    }
    const now = new Date().toISOString();
    await this.database.put(
      "reviews",
      ReviewSchema.parse({ ...item, deletedAt: null, updatedAt: now }),
    );
  }
  async permanentlyDelete(id: string): Promise<void> {
    await this.database.delete("reviews", id);
  }
}
