import type {
  Evidence,
  JournalEntry,
  Review,
  CompetencySlug,
  Task,
} from "../persistence/schemas";
import {
  COMPETENCY_RULES,
  CONSISTENCY_DAYS,
  STALE_AFTER_DAYS,
} from "./competencyRules";
export type CompetencyStatus =
  "Not started" | "In progress" | "Demonstrated" | "Consistent";
export type CriterionAssessment = {
  criterionKey: string;
  label: string;
  requirement: string;
  satisfied: boolean;
  evidence: Evidence[];
  explanation: string;
};
export type CompetencyAssessment = {
  slug: CompetencySlug;
  title: string;
  status: CompetencyStatus;
  criteria: CriterionAssessment[];
  lastEvidenced: string | null;
  mayBeStale: boolean;
  explanation: string;
};
const DAY = 86400000;
const evidenceDate = (e: Evidence, journals: JournalEntry[]) =>
  journals.find((x) => x.id === e.journalEntryId && !x.deletedAt)?.date ??
  e.createdAt.slice(0, 10);
const isValidDate = (date: string) =>
  /^\d{4}-\d{2}-\d{2}$/.test(date) &&
  Number.isFinite(Date.parse(date + "T00:00:00Z")) &&\n  new Date(Date.parse(date + "T00:00:00Z")).toISOString().slice(0, 10) === date;
function qualifies(e: Evidence, rule: CriterionRuleLike, journals: JournalEntry[]) {
  const hasLink = !!e.linkUrl && /^https?:\/\//i.test(e.linkUrl);
  const entry = journals.find((x) => x.id === e.journalEntryId && !x.deletedAt);
  return (
    (hasLink || !!entry) &&
    (!rule.requiresUnassisted || (!!entry && entry.aiUse.mode === "unassisted"))
  );
}
type CriterionRuleLike = { requiresUnassisted: boolean };
export function computeCompetencies(
  evidence: Evidence[],
  reviews: Review[],
  journals: JournalEntry[],
  tasks: Task[],
  now = new Date(),
): CompetencyAssessment[] {
  void tasks;
  void reviews;
  const today = now.toISOString().slice(0, 10);
  return COMPETENCY_RULES.map((comp) => {
    const criteria = comp.criteria.map((rule) => {
      const good = evidence.filter((e) => {
        const date = evidenceDate(e, journals);
        return (
          !e.deletedAt &&
          e.competencySlug === comp.slug &&
          e.criterionKey === rule.key &&
          isValidDate(date) &&
          date <= today &&
          qualifies(e, rule, journals)
        );
      });
      const any = evidence.some((e) => {
        const date = evidenceDate(e, journals);
        return (
          !e.deletedAt &&
          e.competencySlug === comp.slug &&
          e.criterionKey === rule.key &&
          isValidDate(date) &&
          date <= today
        );
      });
      return {
        criterionKey: rule.key,
        label: rule.label,
        requirement: rule.requirement,
        satisfied: good.length > 0,
        evidence: good,
        explanation: good.length
          ? "Satisfied by " + good.length + " qualifying item(s)."
          : any
            ? "Evidence is present but does not satisfy this criterion's rules, or is dated in the future."
            : "No qualifying evidence yet.",
      };
    });
    const valid = criteria.flatMap((x) => x.evidence),
      complete = criteria.every((x) => x.satisfied);
    // Review labels and external-review claims are self-entered locally, not authenticated.
    // Reviews therefore never independently elevate competency status.
    const repeat = valid.some((a) =>
      valid.some((b) => {
        if (a.id === b.id || a.criterionKey !== b.criterionKey) return false;
        const dateA = evidenceDate(a, journals);
        const dateB = evidenceDate(b, journals);
        if (!isValidDate(dateA) || !isValidDate(dateB)) return false;
        const dayA = Date.parse(dateA + "T00:00:00Z");
        const dayB = Date.parse(dateB + "T00:00:00Z");
        return (
          dayB - dayA >= CONSISTENCY_DAYS * DAY &&
          ((a.taskId && b.taskId && a.taskId !== b.taskId) ||
            (a.context &&
              b.context &&
              a.context.trim().toLowerCase() !== b.context.trim().toLowerCase()))
        );
      }),
    );
    const status: CompetencyStatus = complete
      ? repeat
        ? "Consistent"
        : "Demonstrated"
      : criteria.some((criterion) => criterion.evidence.length > 0)
        ? "In progress"
        : "Not started";
    const dated = valid.map((e) => evidenceDate(e, journals)).sort();
    const last = dated.at(-1) ?? null;
    const age = last
      ? Math.floor((now.getTime() - Date.parse(last + "T00:00:00Z")) / DAY)
      : 0;
    const stale = !!last && age > STALE_AFTER_DAYS;
    const explanation =
      status === "Consistent"
        ? "Mandatory criteria are evidenced and a repeat at least 14 days later in a distinct context/task exists. Reviews entered in this app are self-reported and do not independently verify competency."
        : status === "Demonstrated"
          ? "Every mandatory criterion has qualifying evidence; a qualifying repeat is not yet met. Reviews entered in this app are self-reported and do not independently verify competency."
          : status === "In progress"
            ? "Evidence exists, but mandatory criteria are still missing."
            : "No evidence has been recorded.";
    return {
      slug: comp.slug,
      title: comp.title,
      status,
      criteria,
      lastEvidenced: last,
      mayBeStale: stale,
      explanation,
    };
  });
}
