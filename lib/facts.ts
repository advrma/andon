export type Counts = { added: number; removed: number; files: number };

export type Facts = {
  testFileChanged: boolean;
  assertionRemoved: boolean;
  assertionWeakened: boolean;
  testSkipped: boolean;
  suppressionAdded: boolean;
  configTouched: boolean;
  emptyCatch: boolean;
  testWithNoAssert: boolean;
  counts: Counts;
};

type FileDiff = { path: string; added: string[]; removed: string[]; body: string[] };

export const TEST_PATH = /(\.(test|spec)\.[^/]+$)|((^|\/)test_[^/]*\.py$)|((^|\/)(__tests__|tests)\/)/;
const CONFIG_PATH = /(\.github\/workflows\/)|(tsconfig[^/]*\.json$)|((eslint|vitest|jest)\.config\.)|(\.eslintrc)/;
const ASSERT = /expect\(|\bassert\b/;
const STRICT_MATCHER = /\.(toBe|toEqual|toStrictEqual)\(|assertEqual\(/;
// A bare `assert x` is a Python assertion with no comparison, just a truthy check.
const WEAK_MATCHER = /\.(toBeTruthy|toBeDefined)\(|expect\.anything\(|^\s*assert\s+[\w.]+\s*$/;
const SKIP = /\.skip\(|\bxit\(|\bxdescribe\(|test\.todo|@pytest\.mark\.skip/;
const SUPPRESSION = /@ts-ignore|@ts-expect-error|eslint-disable|# type: ignore|# noqa/;
const CATCH_OPEN = /\bcatch\b\s*(\([^)]*\))?\s*\{/;
// Not preceded by a dot, so `RE.test(x)` is not mistaken for a test case.
const TEST_OPEN = /(^|[^.\w])(it|test)\s*\(/;
const COMMENT_OR_BLANK = /^\s*(\/\/.*|\/\*.*|\*.*|#.*)?\s*$/;

function stripPrefix(raw: string): string {
  return raw.trim().replace(/^[ab]\//, "");
}

function newFile(path: string): FileDiff {
  return { path, added: [], removed: [], body: [] };
}

function parse(diff: string): FileDiff[] {
  const files: FileDiff[] = [];
  let cur: FileDiff | null = null;
  for (const line of diff.split("\n")) {
    if (line.startsWith("diff --git ")) {
      const match = /^diff --git a\/(.+?) b\/(.+)$/.exec(line);
      cur = newFile(match ? match[2] : "");
      files.push(cur);
      continue;
    }
    if (line.startsWith("--- ")) {
      // Only start a new file here when there was no `diff --git` header for it.
      if (!cur || cur.body.length > 0) {
        cur = newFile("");
        files.push(cur);
      }
      const path = stripPrefix(line.slice(4));
      if (path !== "/dev/null" && !cur.path) cur.path = path;
      continue;
    }
    if (line.startsWith("+++ ")) {
      if (!cur) {
        cur = newFile("");
        files.push(cur);
      }
      const path = stripPrefix(line.slice(4));
      if (path !== "/dev/null") cur.path = path;
      continue;
    }
    if (!cur || line.startsWith("@@") || line.startsWith("index ") || line.startsWith("\\")) continue;
    if (line.startsWith("+")) cur.added.push(line.slice(1));
    else if (line.startsWith("-")) cur.removed.push(line.slice(1));
    cur.body.push(line.slice(1));
  }
  return files.filter((f) => f.path || f.body.length > 0);
}

function count(lines: string[], re: RegExp): number {
  return lines.filter((l) => re.test(l)).length;
}

function hasEmptyCatch(added: string[]): boolean {
  for (let i = 0; i < added.length; i++) {
    const match = CATCH_OPEN.exec(added[i]);
    if (!match) continue;
    const rest = added[i].slice(match.index + match[0].length);
    if (/^\s*(\/\/.*|\/\*.*\*\/)?\s*\}/.test(rest)) return true;
    if (rest.trim() !== "" && !rest.trim().startsWith("//")) continue;
    let j = i + 1;
    while (j < added.length && COMMENT_OR_BLANK.test(added[j])) j++;
    if (j < added.length && /^\s*\}/.test(added[j])) return true;
  }
  return false;
}

function hasTestWithNoAssert(added: string[]): boolean {
  let inTest = false;
  let seenAssert = false;
  for (const line of added) {
    if (TEST_OPEN.test(line)) {
      if (inTest && !seenAssert) return true;
      inTest = true;
      seenAssert = false;
      continue;
    }
    if (inTest && ASSERT.test(line)) seenAssert = true;
  }
  return inTest && !seenAssert;
}

function scriptsTouched(file: FileDiff): boolean {
  return /(^|\/)package\.json$/.test(file.path) && file.body.some((l) => /"scripts"/.test(l));
}

export function extractFacts(diff: string): Facts {
  const files = parse(diff);
  const added = files.flatMap((f) => f.added);
  return {
    testFileChanged: files.some((f) => TEST_PATH.test(f.path)),
    assertionRemoved: files.some((f) => count(f.removed, ASSERT) > count(f.added, ASSERT)),
    assertionWeakened: files.some(
      (f) => f.removed.some((l) => STRICT_MATCHER.test(l)) && f.added.some((l) => WEAK_MATCHER.test(l)),
    ),
    testSkipped: added.some((l) => SKIP.test(l)),
    suppressionAdded: added.some((l) => SUPPRESSION.test(l)),
    configTouched: files.some((f) => CONFIG_PATH.test(f.path) || scriptsTouched(f)),
    emptyCatch: files.some((f) => hasEmptyCatch(f.added)),
    testWithNoAssert: files.some((f) => hasTestWithNoAssert(f.added)),
    counts: {
      added: added.length,
      removed: files.reduce((n, f) => n + f.removed.length, 0),
      files: files.length,
    },
  };
}
