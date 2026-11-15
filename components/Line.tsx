"use client";

import { motion } from "framer-motion";
import { useEffect, useRef } from "react";
import type { EventRow } from "@/lib/db";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Shape, VERDICT_COLOR, VERDICT_SOFT } from "./Shape";
import { VERDICT_WORD } from "./words";

type Props = {
  events: EventRow[];
  selectedId: number | null;
  stoppedId: number | null;
  message: string | null;
  onSelect: (id: number) => void;
};

const SLIDE_IN = { duration: 0.2, ease: "easeOut" as const };
const DROP = { type: "spring" as const, stiffness: 400, damping: 22 };

function Chip({ e, selected, dim, stopped, hold, onSelect }: {
  e: EventRow;
  selected: boolean;
  dim: boolean;
  stopped: boolean;
  hold: boolean;
  onSelect: (id: number) => void;
}) {
  const size = stopped ? 44 : 36;
  const color = VERDICT_COLOR[e.verdict];
  const soft = e.verdict === "pass" ? "var(--card)" : VERDICT_SOFT[e.verdict];
  return (
    <motion.div
      className="flex w-11 flex-col items-center gap-2"
      initial={hold ? false : stopped ? { y: -28, opacity: 0 } : { x: 24, opacity: 0 }}
      animate={{ x: 0, y: stopped ? -4 : 0, opacity: dim ? 0.45 : 1 }}
      transition={stopped ? DROP : SLIDE_IN}
    >
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            id={`chip-${e.id}`}
            type="button"
            aria-pressed={selected}
            aria-label={`Check ${e.id}: ${VERDICT_WORD[e.verdict]}`}
            onClick={() => onSelect(e.id)}
            className="flex items-center justify-center rounded-lg"
            style={{
              width: size,
              height: size,
              background: selected ? VERDICT_SOFT[e.verdict] : soft,
              border: `${selected ? 2 : 1}px solid ${selected || stopped ? color : "var(--rule)"}`,
            }}
          >
            <Shape verdict={e.verdict} size={16} />
          </button>
        </TooltipTrigger>
        <TooltipContent>
          Check {e.id}: {VERDICT_WORD[e.verdict]}. {e.reason}
        </TooltipContent>
      </Tooltip>
      <span className="text-[15px] leading-none text-graphite">{e.id}</span>
    </motion.div>
  );
}

// The rail: one chip per check, newest on the right, like parts on a conveyor.
export function Line({ events, selectedId, stoppedId, message, onSelect }: Props) {
  const viewport = useRef<HTMLDivElement>(null);
  const stopped = stoppedId !== null;
  const newestId = events[events.length - 1]?.id;

  useEffect(() => {
    const el = viewport.current;
    if (el) el.scrollTo({ left: el.scrollWidth, behavior: "smooth" });
  }, [newestId]);

  const onKeyDown = (ev: React.KeyboardEvent) => {
    if (ev.key !== "ArrowLeft" && ev.key !== "ArrowRight") return;
    const i = events.findIndex((e) => e.id === selectedId);
    const next = events[i === -1 ? events.length - 1 : i + (ev.key === "ArrowRight" ? 1 : -1)];
    if (!next) return;
    ev.preventDefault();
    onSelect(next.id);
    document.getElementById(`chip-${next.id}`)?.focus();
  };

  return (
    <section aria-label="The line" className="flex h-[128px] shrink-0 flex-col rounded-xl border border-rule bg-card">
      <div className="flex items-center gap-4 px-5 pt-3">
        <h2 className="text-[15px] text-graphite">The line</h2>
        {message && <p className="text-[15px] text-graphite">{message}</p>}
      </div>
      <ScrollArea viewportRef={viewport} horizontal className="min-h-0 flex-1">
        <div className="relative flex min-w-max items-start gap-4 px-5 pt-3 pb-2" onKeyDown={onKeyDown}>
          <div aria-hidden="true" className="absolute inset-x-0 top-[29px] h-0.5 bg-rule" />
          {events.map((e) => (
            <Chip
              key={e.id}
              e={e}
              selected={e.id === selectedId}
              dim={stopped && e.id !== stoppedId}
              stopped={e.id === stoppedId}
              // While the line is stopped, newly queued chips appear without sliding in.
              hold={stopped && e.id !== stoppedId && e.id === newestId}
              onSelect={onSelect}
            />
          ))}
        </div>
      </ScrollArea>
    </section>
  );
}
