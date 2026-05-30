import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ParsedCommand } from "@/lib/voice";

export type VoiceResult = "idle" | "success" | "failed" | "unrecognized";

interface VoiceControlProps {
  listening: boolean;
  supported: boolean;
  transcript: string;
  result: VoiceResult;
  resultText: string;
  parsedCommand: ParsedCommand;
  onToggleMic: () => void;
  onChipClick: (text: string) => void;
}

const CHIPS = [
  "kale mama fan on",
  "kale mama fan off",
  "kale mama light on",
  "kale mama light off",
  "kale mama all on",
  "kale mama all off",
];

export function VoiceControl({
  listening, supported, transcript, result, resultText, parsedCommand,
  onToggleMic, onChipClick,
}: VoiceControlProps) {
  const ResultIcon =
    result === "success" ? CheckCircle2 :
    result === "failed" ? XCircle :
    result === "unrecognized" ? AlertCircle : null;

  return (
    <Card className="overflow-hidden border-border/60 bg-card p-6 shadow-[var(--shadow-card)] sm:p-8">
      <div className="flex flex-col items-center text-center">
        <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-gold">
          Voice Control
        </div>
        <h2 className="text-xl font-semibold text-foreground sm:text-2xl">
          Tap and say: <span className="text-navy">“Kale Mama fan on”</span>
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {supported ? "Speech recognition ready (en-IN)" : "Speech recognition not supported in this browser"}
        </p>

        <button
          type="button"
          onClick={onToggleMic}
          disabled={!supported}
          aria-label={listening ? "Stop listening" : "Start listening"}
          className={cn(
            "group relative mt-7 flex h-28 w-28 items-center justify-center rounded-full text-white transition-all active:scale-95 disabled:opacity-50 sm:h-32 sm:w-32",
            listening ? "animate-pulse-ring" : "",
          )}
          style={{
            background: listening
              ? "linear-gradient(135deg, oklch(0.62 0.16 150), oklch(0.55 0.18 155))"
              : "var(--gradient-navy)",
            boxShadow: listening
              ? "0 0 50px oklch(0.62 0.16 150 / 0.5)"
              : "var(--shadow-elevated)",
          }}
        >
          <span
            aria-hidden
            className="absolute inset-0 rounded-full ring-2 ring-gold/40"
          />
          {listening ? <MicOff className="h-10 w-10" /> : <Mic className="h-10 w-10" />}
        </button>

        <div className="mt-5 min-h-[3rem] w-full max-w-md">
          {transcript ? (
            <div className="rounded-xl border border-border bg-muted/50 px-4 py-3 text-left">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Recognized</p>
              <p className="mt-0.5 text-sm font-medium text-foreground">{transcript}</p>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              {listening ? "Listening…" : "Press the mic and speak a command"}
            </p>
          )}
        </div>

        {ResultIcon && (
          <div
            className={cn(
              "mt-3 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold ring-1 ring-inset",
              result === "success" && "bg-success/15 text-success ring-success/30",
              result === "failed" && "bg-destructive/10 text-destructive ring-destructive/30",
              result === "unrecognized" && "bg-accent text-accent-foreground ring-gold/40",
            )}
          >
            <ResultIcon className="h-3.5 w-3.5" />
            {resultText}
            {parsedCommand && <span className="opacity-70">· {parsedCommand}</span>}
          </div>
        )}

        <div className="mt-7 w-full">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Try these commands
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {CHIPS.map((c) => (
              <Button
                key={c}
                variant="outline"
                size="sm"
                onClick={() => onChipClick(c)}
                className="rounded-full border-border/80 bg-background text-xs font-medium text-foreground hover:border-gold hover:bg-accent hover:text-accent-foreground"
              >
                {c}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}
