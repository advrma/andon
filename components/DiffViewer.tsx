"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { EventRow } from "@/lib/db";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { parseDiff, type DiffFile } from "./diff-parse";
import { firstFileIndex, flagFor } from "./flags";
import { VERDICT_COLOR } from "./Shape";
import { timeAgo } from "./words";

type Props = {
  event: EventRow | null;
  diff: string | null;
  flashStop: boolean;
  message: string | null;
};

const ROW_BG = { add: "bg-diff-add", del: "bg-diff-del", ctx: "" };
const MARK = { add: "+", del: "-", ctx: " " };
const MARK_COLOR = { add: "text-pass", del: "text-stop", ctx: "text-graphite" };

function FileBody({ file, event, flashStop }: { file: DiffFile; event: EventRow; flashStop: boolean }) {
  const flagged = useRef<HTMLDivElement>(null);
  const flashedFor = useRef<number | null>(null);
  const color = VERDICT_COLOR[event.verdict];

  // Step 6 of the stop moment: the flagged line flashes once and scrolls into view.
  useEffect(() => {
    const el = flagged.current;
    if (!flashStop || !el || flashedFor.current === event.id) return;
    flashedFor.current = event.id;
    el.scrollIntoView({ block: "center" });
    el.classList.add("flash-stop");
  }, [flashStop, event.id, file.path]);

  let seenFlag = false;
  return (
    <div className="min-w-max font-mono text-[15px] leading-[1.6]">
      {file.hunks.map((hunk, hi) => (
        <div key={hi}>
          <div className="px-4 py-1 text-graphite select-none">
            {hi > 0 && <span aria-hidden="true">···</span>}
          </div>
          {hunk.lines.map((line, li) => {
            const flag = flagFor(line, event.facts);
            const first = flag !== null && !seenFlag;
            if (first) seenFlag = true;
            return (
              <div
                key={li}
                ref={first ? flagged : undefined}
                className={`flex items-stretch ${ROW_BG[line.kind]}`}
                style={{ boxShadow: flag ? `inset 3px 0 0 ${color}` : undefined }}
              >
                <span className="w-12 shrink-0 pr-2 text-right text-graphite select-none">{line.oldNo ?? ""}</span>
                <span className="w-12 shrink-0 pr-3 text-right text-graphite select-none">{line.newNo ?? ""}</span>
                <span className={`w-5 shrink-0 select-none ${MARK_COLOR[line.kind]}`}>{MARK[line.kind]}</span>
                <span className="whitespace-pre pr-6 text-ink">{line.text}</span>
                {flag && (
                  <span className="ml-auto shrink-0 pr-4 font-sans text-[15px] font-medium" style={{ color }}>
                    {flag}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

function Files({ event, diff, flashStop }: { event: EventRow; diff: string; flashStop: boolean }) {
  const files = useMemo(() => parseDiff(diff), [diff]);
  const [index, setIndex] = useState(() => firstFileIndex(files, event.facts));
  const file = files[index] ?? files[0];
  if (!file) return null;

  return (
    <>
      <Tabs value={String(index)} onValueChange={(v) => setIndex(Number(v))} className="px-5 pb-3">
        <TabsList aria-label="Files">
          {files.map((f, i) => (
            <Tooltip key={f.path}>
              <TooltipTrigger asChild>
                <TabsTrigger value={String(i)}>{f.name}</TabsTrigger>
              </TooltipTrigger>
              <TooltipContent>{f.path}</TooltipContent>
            </Tooltip>
          ))}
        </TabsList>
      </Tabs>
      <ScrollArea horizontal className="min-h-0 flex-1 border-t border-rule">
        <FileBody file={file} event={event} flashStop={flashStop} />
      </ScrollArea>
    </>
  );
}

export function DiffViewer({ event, diff, flashStop, message }: Props) {
  const count = event?.files.length ?? 0;
  return (
    <section aria-label="Change viewer" className="flex min-h-0 flex-col rounded-xl border border-rule bg-card">
      {event === null ? (
        <p className="px-6 py-6 text-[17px] text-graphite">{message}</p>
      ) : (
        <>
          <div className="flex items-baseline gap-4 px-5 pt-5 pb-3">
            <h2 className="text-[17px] font-semibold text-ink">Check {event.id}</h2>
            <span className="text-[15px] text-graphite">
              {count} {count === 1 ? "file" : "files"} changed
            </span>
            <span className="ml-auto text-[15px] text-graphite">{timeAgo(event.ts, Date.now())}</span>
          </div>
          {diff !== null && <Files key={event.id} event={event} diff={diff} flashStop={flashStop} />}
        </>
      )}
    </section>
  );
}
