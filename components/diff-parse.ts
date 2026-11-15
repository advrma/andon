export type DiffLine = { kind: "add" | "del" | "ctx"; oldNo: number | null; newNo: number | null; text: string };
export type DiffHunk = { header: string; lines: DiffLine[] };
export type DiffFile = { path: string; name: string; hunks: DiffHunk[] };

const HUNK = /^@@ -(\d+)(?:,\d+)? \+(\d+)(?:,\d+)? @@ ?(.*)$/;
// File-level metadata lines the viewer hides.
const META = /^(index |new file mode|deleted file mode|old mode|new mode|similarity index|rename from|rename to|Binary files)/;

function fileFor(path: string): DiffFile {
  return { path, name: path.split("/").pop() ?? path, hunks: [] };
}

function stripPrefix(raw: string): string {
  return raw.trim().replace(/^[ab]\//, "");
}

// Turns a unified diff into files with hunks and old/new line numbers. No external parser.
export function parseDiff(diff: string): DiffFile[] {
  const files: DiffFile[] = [];
  let file: DiffFile | null = null;
  let hunk: DiffHunk | null = null;
  let oldNo = 0;
  let newNo = 0;

  for (const raw of diff.split("\n")) {
    if (raw.startsWith("diff --git ")) {
      const m = /^diff --git a\/(.+?) b\/(.+)$/.exec(raw);
      file = fileFor(m ? m[2] : "");
      files.push(file);
      hunk = null;
      continue;
    }
    if (raw.startsWith("--- ")) {
      if (!file || file.hunks.length > 0) {
        file = fileFor("");
        files.push(file);
      }
      const path = stripPrefix(raw.slice(4));
      if (path !== "/dev/null" && !file.path) Object.assign(file, fileFor(path));
      continue;
    }
    if (raw.startsWith("+++ ")) {
      if (!file) {
        file = fileFor("");
        files.push(file);
      }
      const path = stripPrefix(raw.slice(4));
      if (path !== "/dev/null") Object.assign(file, fileFor(path), { hunks: file.hunks });
      continue;
    }
    if (META.test(raw) || raw.startsWith("\\")) continue;

    const h = HUNK.exec(raw);
    if (h) {
      if (!file) {
        file = fileFor("");
        files.push(file);
      }
      oldNo = Number(h[1]);
      newNo = Number(h[2]);
      hunk = { header: h[3] ?? "", lines: [] };
      file.hunks.push(hunk);
      continue;
    }
    if (!hunk) continue;

    if (raw.startsWith("+")) hunk.lines.push({ kind: "add", oldNo: null, newNo: newNo++, text: raw.slice(1) });
    else if (raw.startsWith("-")) hunk.lines.push({ kind: "del", oldNo: oldNo++, newNo: null, text: raw.slice(1) });
    else hunk.lines.push({ kind: "ctx", oldNo: oldNo++, newNo: newNo++, text: raw.slice(1) });
  }
  return files.filter((f) => f.hunks.length > 0);
}
