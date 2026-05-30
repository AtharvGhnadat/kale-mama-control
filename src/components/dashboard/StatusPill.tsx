import { cn } from "@/lib/utils";

export function StatusPill({
  state,
  className,
}: {
  state: "on" | "off" | "connected" | "error" | "waiting";
  className?: string;
}) {
  const map = {
    on:        { label: "ON",        cls: "bg-success/15 text-success ring-success/30" },
    off:       { label: "OFF",       cls: "bg-destructive/10 text-destructive ring-destructive/30" },
    connected: { label: "Connected", cls: "bg-success/15 text-success ring-success/30" },
    error:     { label: "Error",     cls: "bg-destructive/10 text-destructive ring-destructive/30" },
    waiting:   { label: "Waiting",   cls: "bg-muted text-muted-foreground ring-border" },
  } as const;
  const { label, cls } = map[state];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold uppercase tracking-wide ring-1 ring-inset transition-colors",
        cls,
        className,
      )}
    >
      <span className={cn(
        "h-1.5 w-1.5 rounded-full",
        state === "on" || state === "connected" ? "bg-success animate-pulse" :
        state === "off" || state === "error" ? "bg-destructive" : "bg-muted-foreground",
      )} />
      {label}
    </span>
  );
}
