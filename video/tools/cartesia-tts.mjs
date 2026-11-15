// Cartesia TTS with word timestamps. Usage:
//   CARTESIA_API_KEY=... CARTESIA_VOICE_ID=... node tools/cartesia-tts.mjs lines.txt assets/vo
// Writes NN.wav and NN.words.json per line. Key comes from the environment only.
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { join } from "node:path";

const [linesPath, outDir] = process.argv.slice(2);
const key = process.env.CARTESIA_API_KEY;
const voice = process.env.CARTESIA_VOICE_ID;
const model = process.env.CARTESIA_MODEL || "sonic-3";
if (!key || !voice || !linesPath || !outDir) {
  console.error("need CARTESIA_API_KEY, CARTESIA_VOICE_ID, lines file, out dir");
  process.exit(1);
}
mkdirSync(outDir, { recursive: true });
const lines = readFileSync(linesPath, "utf8").split("\n").map((l) => l.trim()).filter(Boolean);

async function synth(text, n) {
  const res = await fetch("https://api.cartesia.ai/tts/sse", {
    method: "POST",
    headers: { "X-API-Key": key, "Cartesia-Version": "2025-04-16", "Content-Type": "application/json" },
    body: JSON.stringify({
      model_id: model,
      transcript: text,
      voice: { mode: "id", id: voice },
      language: "en",
      add_timestamps: true,
      output_format: { container: "raw", encoding: "pcm_s16le", sample_rate: 44100 },
    }),
  });
  if (!res.ok) throw new Error(`${n}: HTTP ${res.status} ${await res.text()}`);
  const body = await res.text();
  const chunks = [];
  const words = [];
  for (const block of body.split("\n\n")) {
    const line = block.split("\n").find((l) => l.startsWith("data:"));
    if (!line) continue;
    let ev;
    try { ev = JSON.parse(line.slice(5).trim()); } catch { continue; }
    if (ev.type === "chunk" && ev.data) chunks.push(Buffer.from(ev.data, "base64"));
    if (ev.type === "timestamps" && ev.word_timestamps) {
      const w = ev.word_timestamps;
      w.words.forEach((t, i) => words.push({ id: `w${words.length}`, text: t, start: w.start[i], end: w.end[i] }));
    }
    if (ev.type === "error") throw new Error(`${n}: ${JSON.stringify(ev)}`);
  }
  const pcm = Buffer.concat(chunks);
  const raw = join(outDir, `${n}.pcm`);
  const wav = join(outDir, `${n}.wav`);
  writeFileSync(raw, pcm);
  execFileSync("ffmpeg", ["-y", "-loglevel", "error", "-f", "s16le", "-ar", "44100", "-ac", "1", "-i", raw, wav]);
  execFileSync("rm", [raw]);
  writeFileSync(join(outDir, `${n}.words.json`), JSON.stringify(words, null, 2));
  const dur = pcm.length / 2 / 44100;
  console.log(`${n} ${dur.toFixed(2)}s ${words.length} words  ${text}`);
}

for (let i = 0; i < lines.length; i++) {
  await synth(lines[i], String(i + 1).padStart(2, "0"));
}
