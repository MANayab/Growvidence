# Slice 1 learning exercise

## I should write this myself

Implement a pure function named `formatStorageUsage(bytes: number): string` in a separate practice file, then write its Vitest tests.

Requirements:

- Return a readable byte value for values below 1 KiB.
- Use KiB for values from 1 KiB up to (but not including) 1 MiB.
- Use MiB for values of 1 MiB and above.
- Reject negative, non-finite and non-number input with a documented error.
- Test boundary values: 0, 1023, 1024, 1 MiB, and invalid input.

Do not copy an implementation from the application. Write the function and tests yourself, then explain why formatting is a pure function and should not access IndexedDB or browser globals.
