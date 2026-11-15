import { describe, expect, it } from "vitest";
import type { Facts } from "./facts";
import { decide } from "./rules";

function facts(overrides: Partial<Facts> = {}): Facts {
  return {
    testFileChanged: false,
    assertionRemoved: false,
    assertionWeakened: false,
    testSkipped: false,
    suppressionAdded: false,
    configTouched: false,
    emptyCatch: false,
    testWithNoAssert: false,
    counts: { added: 0, removed: 0, files: 0 },
    ...overrides,
  };
}

describe("decide", () => {
  it("rule 1: config touched and check_disabled high stops the line", () => {
    const result = decide(facts({ configTouched: true }), {
      check_disabled: { probability: 0.8, confidence: 0.9 },
    });
    expect(result.verdict).toBe("stop");
    expect(result.firedBy).toBe("configTouched");
  });

  it("rule 2: any answer at or above stop stops the line", () => {
    const result = decide(facts(), {
      special_case: { probability: 0.2, confidence: 0.9 },
      test_weakened: { probability: 0.75, confidence: 0.9 },
    });
    expect(result.verdict).toBe("stop");
    expect(result.firedBy).toBe("test_weakened");
    expect(result.reason).toBe("A test was changed to check less, and the spec gives no reason for it.");
  });

  it("rule 3: an answer between rework and stop asks for rework", () => {
    const result = decide(facts(), {
      out_of_scope: { probability: 0.1, confidence: 0.9 },
      error_hidden: { probability: 0.5, confidence: 0.9 },
    });
    expect(result.verdict).toBe("rework");
    expect(result.firedBy).toBe("error_hidden");
  });

  it("rule 4: a low-confidence answer in the unsure band escalates", () => {
    const result = decide(facts(), {
      special_case: { probability: 0.3, confidence: 0.4 },
      out_of_scope: { probability: 0.1, confidence: 0.9 },
    });
    expect(result.verdict).toBe("rework");
    expect(result.escalate).toBe(true);
    expect(result.firedBy).toBe("special_case");
  });

  it("rule 4 does not fire when confidence is high", () => {
    const result = decide(facts(), { special_case: { probability: 0.3, confidence: 0.9 } });
    expect(result.verdict).toBe("pass");
    expect(result.escalate).toBeUndefined();
  });

  it("rule 5: low answers pass", () => {
    const result = decide(facts(), {
      special_case: { probability: 0.1, confidence: 0.9 },
      out_of_scope: { probability: 0.34, confidence: 0.9 },
    });
    expect(result.verdict).toBe("pass");
    expect(result.firedBy).toBeNull();
  });
});
