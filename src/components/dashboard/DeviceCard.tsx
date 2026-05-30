import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusPill } from "./StatusPill";
import { Fan, Lightbulb, Clock, Cpu } from "lucide-react";
import { cn } from "@/lib/utils";

interface DeviceCardProps {
  kind: "fan" | "light";
  state: boolean;
  lastUpdated: Date | null;
  onTurnOn: () => void;
  onTurnOff: () => void;
  busy?: boolean;
}

export function DeviceCard({ kind, state, lastUpdated, onTurnOn, onTurnOff, busy }: DeviceCardProps) {
  const isFan = kind === "fan";
  const Icon = isFan ? Fan : Lightbulb;
  const name = isFan ? "Fan" : "Light";
  const gpio = isFan ? "GPIO 25" : "GPIO 27";

  return (
    <Card className="group relative overflow-hidden border-border/60 bg-card p-5 shadow-[var(--shadow-card)] transition-all hover:shadow-[var(--shadow-elevated)] sm:p-6">
      <div
        aria-hidden
        className={cn(
          "absolute -right-12 -top-12 h-40 w-40 rounded-full blur-3xl transition-opacity",
          state ? "opacity-30" : "opacity-0",
        )}
        style={{
          background: state
            ? "radial-gradient(circle, oklch(0.78 0.16 90 / 0.6), transparent 70%)"
            : undefined,
        }}
      />

      <div className="relative flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "flex h-12 w-12 items-center justify-center rounded-2xl transition-colors",
              state ? "bg-success/15 text-success" : "bg-muted text-muted-foreground",
            )}
          >
            <Icon className={cn("h-6 w-6", state && isFan && "animate-spin-slow")} />
          </div>
          <div>
            <h3 className="text-lg font-semibold leading-tight text-foreground">{name}</h3>
            <p className="flex items-center gap-1 text-xs text-muted-foreground">
              <Cpu className="h-3 w-3" /> Relay {gpio}
            </p>
          </div>
        </div>
        <StatusPill state={state ? "on" : "off"} />
      </div>

      <div className="relative mt-5 grid grid-cols-2 gap-2.5">
        <Button
          disabled={busy}
          onClick={onTurnOn}
          className={cn(
            "h-11 rounded-xl text-sm font-semibold transition-all active:scale-[0.97]",
            state
              ? "bg-success text-success-foreground hover:bg-success/90 shadow-[0_4px_14px_oklch(0.62_0.16_150/0.35)]"
              : "bg-secondary text-secondary-foreground hover:bg-success hover:text-success-foreground",
          )}
        >
          ON
        </Button>
        <Button
          disabled={busy}
          onClick={onTurnOff}
          variant="outline"
          className={cn(
            "h-11 rounded-xl text-sm font-semibold transition-all active:scale-[0.97]",
            !state
              ? "border-destructive/40 bg-destructive/5 text-destructive hover:bg-destructive/10"
              : "hover:border-destructive/40 hover:bg-destructive/5 hover:text-destructive",
          )}
        >
          OFF
        </Button>
      </div>

      <div className="relative mt-4 flex items-center gap-1.5 text-xs text-muted-foreground">
        <Clock className="h-3.5 w-3.5" />
        {lastUpdated ? (
          <span>Last updated {lastUpdated.toLocaleTimeString()}</span>
        ) : (
          <span>Not yet controlled</span>
        )}
      </div>
    </Card>
  );
}
