"use client";

import { AnimatePresence, MotionConfig, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { DiffViewer } from "./DiffViewer";
import { Line } from "./Line";
import { Scorecard, type ScorecardResults } from "./Scorecard";
import { TopBar, type Pill, type View } from "./TopBar";
import { useBoard } from "./useBoard";
import { VerdictCard } from "./VerdictCard";
import { WORDS } from "./words";

const RESUMED_MS = 2000;
const FADE = { duration: 0.15 };

type Props = { task: string; results: ScorecardResults | null };

export function Board({ task, results }: Props) {
  const b = useBoard();
  const [view, setView] = useState<View>("live");
  const [showResumed, setShowResumed] = useState(false);

  const stopped = b.line?.stopped ?? false;
  const stoppedId = stopped ? (b.line?.event_id ?? null) : null;
  const selected = b.events.find((e) => e.id === b.selectedId) ?? null;
  const pill: Pill = stopped ? "stopped" : showResumed ? "resumed" : "running";
  const message = b.apiDown ? WORDS.down : WORDS.empty;

  // "Line resumed" holds for two seconds, then the pill goes back to "Line running".
  useEffect(() => {
    if (!b.resumed) return;
    setShowResumed(true);
    const t = setTimeout(() => setShowResumed(false), RESUMED_MS);
    return () => clearTimeout(t);
  }, [b.resumed]);

  const openCase = (id: string) => {
    const match = b.events.find((e) => e.run_id.includes(id));
    if (match) b.setSelectedId(match.id);
    setView("live");
  };

  return (
    <MotionConfig reducedMotion="user">
      <main className="mx-auto flex h-screen w-full max-w-[1360px] min-w-[1280px] flex-col gap-6 px-8 py-6">
        <TopBar task={task} view={view} onView={setView} pill={pill} stats={b.stats} />
        <AnimatePresence mode="wait" initial={false}>
          {view === "live" ? (
            <motion.div
              key="live"
              className="flex min-h-0 flex-1 flex-col gap-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={FADE}
            >
              <Line
                events={b.events}
                selectedId={b.selectedId}
                stoppedId={stoppedId}
                message={b.events.length === 0 ? message : b.apiDown ? WORDS.down : null}
                onSelect={b.setSelectedId}
              />
              <div className="grid min-h-0 flex-1 grid-cols-[62fr_38fr] gap-6">
                <DiffViewer
                  event={selected}
                  diff={selected ? b.diff : null}
                  flashStop={stopped && selected?.id === stoppedId}
                  message={message}
                />
                <VerdictCard event={selected} stopped={stopped} onResume={b.resume} />
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="scorecard"
              className="flex min-h-0 flex-1 flex-col"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={FADE}
            >
              <Scorecard results={results} onOpenCase={openCase} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </MotionConfig>
  );
}
