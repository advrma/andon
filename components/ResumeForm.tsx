"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { WORDS } from "./words";

// Asked inline under the reason. No modal.
export function ResumeForm({ onResume }: { onResume: (note: string) => Promise<void> }) {
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      await onResume(note.trim());
      setNote("");
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="flex items-center gap-3">
      <Input
        autoFocus
        aria-label={WORDS.resumeInput}
        placeholder={WORDS.resumeInput}
        value={note}
        onChange={(e) => setNote(e.target.value)}
      />
      <Button type="submit" disabled={busy}>
        {WORDS.resumeButton}
      </Button>
    </form>
  );
}
