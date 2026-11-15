import type { Verdict } from "@/lib/types";

export const VERDICT_COLOR: Record<Verdict, string> = {
  pass: "var(--pass)",
  rework: "var(--rework)",
  stop: "var(--stop)",
};

export const VERDICT_SOFT: Record<Verdict, string> = {
  pass: "var(--pass-soft)",
  rework: "var(--rework-soft)",
  stop: "var(--stop-soft)",
};

// Pass = circle, Rework = triangle, Stop = square. Color is never the only signal.
export function Shape({ verdict, size = 16 }: { verdict: Verdict; size?: number }) {
  const fill = VERDICT_COLOR[verdict];
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" className="shrink-0">
      {verdict === "pass" && <circle cx="12" cy="12" r="10" fill={fill} />}
      {verdict === "rework" && <polygon points="12,2 22,21 2,21" fill={fill} />}
      {verdict === "stop" && <rect x="2" y="2" width="20" height="20" rx="2" fill={fill} />}
    </svg>
  );
}
