# Slice 2 learning exercise

## I should write this myself

Implement a pure function named `transitionTaskStatus(current, requested)` in a separate practice file, then write Vitest tests for it. Do not modify the application implementation for this exercise.

Requirements:

- Accept only the five Growvidence statuses: `backlog`, `today`, `in_progress`, `review` and `done`.
- Return the requested status only when the transition is allowed by a transition table that you define and document.
- Return a structured rejection reason for an unknown status or a disallowed transition; do not silently coerce a value.
- Do not infer competency or mastery from a transition to `done`.
- Test every allowed transition, every rejected transition, same-status behavior and invalid input.

After writing the tests, explain why status transition rules belong in a pure domain function rather than in a React click handler or an IndexedDB repository.
