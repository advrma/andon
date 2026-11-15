import { describe, expect, it } from "vitest";
import { extractFacts } from "./facts";

function fileDiff(path: string, removed: string[], added: string[]): string {
  const hunk = [...removed.map((l) => `-${l}`), ...added.map((l) => `+${l}`)].join("\n");
  return `diff --git a/${path} b/${path}\n--- a/${path}\n+++ b/${path}\n@@ -1,1 +1,1 @@\n${hunk}\n`;
}

describe("testFileChanged", () => {
  it("fires for a spec file", () => {
    expect(extractFacts(fileDiff("src/price.spec.ts", [], ["x"])).testFileChanged).toBe(true);
  });
  it("stays off for a source file", () => {
    expect(extractFacts(fileDiff("src/price.ts", [], ["x"])).testFileChanged).toBe(false);
  });
});

describe("assertionRemoved", () => {
  it("fires when an expect is removed with no replacement", () => {
    const diff = fileDiff("a.test.ts", ["  expect(total).toBe(99.99);"], []);
    expect(extractFacts(diff).assertionRemoved).toBe(true);
  });
  it("stays off when the removed expect is replaced", () => {
    const diff = fileDiff("a.test.ts", ["  expect(total).toBe(99.99);"], ["  expect(total).toBe(89.99);"]);
    expect(extractFacts(diff).assertionRemoved).toBe(false);
  });
});

describe("assertionWeakened", () => {
  it("fires when toBe becomes toBeTruthy", () => {
    const diff = fileDiff("a.test.ts", ["  expect(total).toBe(99.99);"], ["  expect(total).toBeTruthy();"]);
    expect(extractFacts(diff).assertionWeakened).toBe(true);
  });
  it("stays off when toBe stays strict", () => {
    const diff = fileDiff("a.test.ts", ["  expect(total).toBe(99.99);"], ["  expect(total).toEqual(99.99);"]);
    expect(extractFacts(diff).assertionWeakened).toBe(false);
  });
});

describe("testSkipped", () => {
  it("fires for it.skip", () => {
    const diff = fileDiff("a.test.ts", ["  it('rounds', () => {"], ["  it.skip('rounds', () => {"]);
    expect(extractFacts(diff).testSkipped).toBe(true);
  });
  it("stays off for a normal it", () => {
    expect(extractFacts(fileDiff("a.test.ts", [], ["  it('rounds', () => {"])).testSkipped).toBe(false);
  });
});

describe("suppressionAdded", () => {
  it("fires for ts-ignore", () => {
    expect(extractFacts(fileDiff("a.ts", [], ["  // @ts-ignore"])).suppressionAdded).toBe(true);
  });
  it("stays off for a plain comment", () => {
    expect(extractFacts(fileDiff("a.ts", [], ["  // round to cents"])).suppressionAdded).toBe(false);
  });
});

describe("configTouched", () => {
  it("fires for a workflow file", () => {
    expect(extractFacts(fileDiff(".github/workflows/ci.yml", [], ["x"])).configTouched).toBe(true);
  });
  it("fires for package.json scripts", () => {
    const diff = fileDiff("package.json", ['    "test": "vitest run"'], ['    "test": "echo ok"']).replace(
      "@@ -1,1 +1,1 @@",
      '@@ -1,1 +1,1 @@\n   "scripts": {',
    );
    expect(extractFacts(diff).configTouched).toBe(true);
  });
  it("stays off for a source file", () => {
    expect(extractFacts(fileDiff("src/price.ts", [], ["x"])).configTouched).toBe(false);
  });
});

describe("emptyCatch", () => {
  it("fires for a catch with only a comment", () => {
    const diff = fileDiff("a.ts", [], ["try {", "  run();", "} catch (e) {", "  // ignore", "}"]);
    expect(extractFacts(diff).emptyCatch).toBe(true);
  });
  it("fires for an inline empty catch", () => {
    expect(extractFacts(fileDiff("a.ts", [], ["} catch {}"])).emptyCatch).toBe(true);
  });
  it("stays off for a catch that rethrows", () => {
    const diff = fileDiff("a.ts", [], ["} catch (e) {", "  throw e;", "}"]);
    expect(extractFacts(diff).emptyCatch).toBe(false);
  });
});

describe("testWithNoAssert", () => {
  it("fires for a test body without expect", () => {
    const diff = fileDiff("a.test.ts", [], ["it('works', () => {", "  total([]);", "});"]);
    expect(extractFacts(diff).testWithNoAssert).toBe(true);
  });
  it("stays off for a test with expect", () => {
    const diff = fileDiff("a.test.ts", [], ["it('works', () => {", "  expect(total([])).toBe(0);", "});"]);
    expect(extractFacts(diff).testWithNoAssert).toBe(false);
  });
  it("stays off for a regex .test() call", () => {
    const diff = fileDiff("a.ts", [], ["return /^\\w+$/.test(name);"]);
    expect(extractFacts(diff).testWithNoAssert).toBe(false);
  });
});

describe("counts", () => {
  it("counts added, removed, and files", () => {
    const diff = fileDiff("a.ts", ["old"], ["new1", "new2"]) + fileDiff("b.ts", [], ["x"]);
    expect(extractFacts(diff).counts).toEqual({ added: 3, removed: 1, files: 2 });
  });
});
