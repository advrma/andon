"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { BOARD } from "@/lib/config";
import type { EventRow, LineRow, Stats } from "@/lib/db";

async function getJson<T>(url: string): Promise<T> {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`${url} -> ${res.status}`);
  return (await res.json()) as T;
}

// Polls the gate once a second. On failure it keeps the last known state and flags the gate as down.
export function useBoard() {
  const [events, setEvents] = useState<EventRow[]>([]);
  const [line, setLine] = useState<LineRow | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [diff, setDiff] = useState<string | null>(null);
  const [apiDown, setApiDown] = useState(false);
  const [resumed, setResumed] = useState(false);
  const eventsRef = useRef<EventRow[]>([]);
  const diffs = useRef(new Map<number, string>());

  useEffect(() => {
    let alive = true;
    const tick = async () => {
      const last = eventsRef.current[eventsRef.current.length - 1];
      // First load takes the newest tiles directly; after that, only what arrived since.
      const query = last ? `after=${last.id}` : `last=${BOARD.keepTiles}`;
      try {
        const [ev, ln, st] = await Promise.all([
          getJson<{ events: EventRow[] }>(`/api/events?${query}`),
          getJson<LineRow>("/api/line"),
          getJson<Stats>("/api/stats"),
        ]);
        if (!alive) return;
        if (ev.events.length > 0) {
          const next = [...eventsRef.current, ...ev.events].slice(-BOARD.keepTiles);
          const newest = next[next.length - 1]!.id;
          eventsRef.current = next;
          setEvents(next);
          // Selection follows the newest tile unless the user has picked an older one.
          setSelectedId((sel) => (sel === null || sel === last?.id ? newest : sel));
          setResumed(false);
        }
        setLine(ln);
        setStats(st);
        setApiDown(false);
      } catch (err) {
        if (!alive) return;
        console.warn("[andon] poll failed", err);
        setApiDown(true);
      }
    };
    void tick();
    const timer = setInterval(() => void tick(), BOARD.pollMs);
    return () => {
      alive = false;
      clearInterval(timer);
    };
  }, []);

  useEffect(() => {
    if (selectedId === null) return;
    const cached = diffs.current.get(selectedId);
    if (cached !== undefined) {
      setDiff(cached);
      return;
    }
    let alive = true;
    getJson<{ diff: string }>(`/api/events/${selectedId}`)
      .then((r) => {
        diffs.current.set(selectedId, r.diff);
        if (alive) setDiff(r.diff);
      })
      .catch((err: unknown) => {
        console.warn("[andon] diff fetch failed", err);
        if (alive) setDiff(null);
      });
    return () => {
      alive = false;
    };
  }, [selectedId]);

  const resume = useCallback(async (note: string) => {
    const res = await fetch("/api/line/resume", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ note }),
    });
    if (!res.ok) throw new Error(`resume failed: ${res.status}`);
    setLine((await res.json()) as LineRow);
    setResumed(true);
  }, []);

  return { events, line, stats, selectedId, setSelectedId, diff, apiDown, resumed, resume };
}
