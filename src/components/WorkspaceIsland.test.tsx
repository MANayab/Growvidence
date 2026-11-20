import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";

import WorkspaceIsland from "./WorkspaceIsland";

describe("WorkspaceIsland smoke test", () => {
  it("renders accessible navigation and an honest loading state", () => {
    const html = renderToString(<WorkspaceIsland />);
    expect(html).toContain('aria-label="Workspace sections"');
    expect(html).toContain("Tracks");
    expect(html).toContain("Tasks");
    expect(html).toContain("Checking this browser&#x27;s storage");
    expect(html).toContain("Learner records are not uploaded");
  });
});
