import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import JournalView from "./JournalView";
import type { PersistenceHandle } from "../persistence";
import type { JournalEntry } from "../persistence/schemas";
const fake = {
  journal: {
    list: async () => [],
    save: async (e: JournalEntry) => e,
    softDelete: async () => {},
    permanentlyDelete: async () => {},
  },
} as unknown as PersistenceHandle;
describe("JournalView", () => {
  it("renders labelled journal fields and all disclosure categories with neutral default", () => {
    const html = renderToString(
      <JournalView
        persistence={fake}
        tracks={[]}
        tasks={[]}
        saving={false}
        onRefresh={async () => {}}
      />,
    );
    expect(html).toContain("What I learned");
    expect(html).toContain("What blocked me");
    expect(html).toContain("What I’ll do next");
    expect(html).toContain("Not recorded");
    expect(html).toContain("Unknown");
    expect(html).toContain("AI-use summary");
    expect(html).toContain("Confidence (1–5)");
  });
});
