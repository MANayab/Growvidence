# Privacy wording proposal — Slice 4

Do not apply this proposal to the live privacy page without separate approval.

## Current sentences that become incomplete

**Learning data stays in this browser:** “Tracks, tasks, journal entries, and your theme preference are stored in this browser's IndexedDB.” This sentence is incomplete because Slice 4 adds evidence records (title, description, criterion, context, artifact URL, optional journal/task links) and review records (reviewer type/label, feedback, outcome, reviewed date) to local IndexedDB.

**Deleting your data:** “In the learner workspace, use Delete on a track, task or journal entry to move it to deleted records, then use Permanently delete for that record. Permanent deletion cannot be undone.” This sentence is incomplete because evidence and review records can also be soft-deleted and permanently deleted; permanent evidence deletion removes its associated reviews.

## Proposed replacement wording

“Tracks, tasks, journal entries, evidence records, reviews, and your theme preference are stored in this browser's IndexedDB. Evidence may include titles, descriptions, competency criteria, context, artifact URLs, and optional links to journal entries or tasks. Reviews may include reviewer type and label, feedback, outcome, and review date. Learner records remain local to this browser; the app does not send them to a Growvidence backend. Browser storage is not a backup and can be cleared or lost.”

“In the learner workspace, use Delete on tracks, tasks, journal entries, evidence or reviews to move them to deleted records, then use Permanently delete for a record. Permanently deleting evidence also permanently deletes its associated reviews. Permanent deletion cannot be undone.”

## Data handling

Artifact URLs are not fetched, previewed or embedded. They are ordinary external links with `rel="noopener noreferrer"`. No backend, analytics, telemetry or upload behavior is introduced. Navigating to a user-selected external artifact may expose ordinary request data to that external site.


## Integrity-model disclosure update — 2026-11-27
The review form accepts reviewer type and reviewer label as learner-entered text. The app does not authenticate reviewers; therefore a record marked "external" is not independently verified. Avoid wording that implies the app validates reviewer identity. This is a trust-model correction and does not add any external data transmission. The proposal remains unapproved; the live `/privacy/` page was not changed.
