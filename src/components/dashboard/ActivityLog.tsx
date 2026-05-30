import { Card } from "@/components/ui/card";
import { Activity, Mic, MousePointerClick, Settings2, CheckCircle2, XCircle } from "lucide-react";
import type { ActivityEntry } from "./types";
import { cn } from "@/lib/utils";

function formatTime(ts: number) {
  const d = new Date(ts);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

export function ActivityLog({ entries }: { entries: ActivityEntry[] }) {
  return (
    <Card className="border-border/60 bg-card p-5 shadow-[var(--shadow-card)] sm:p-6">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-navy text-gold">
          <Activity className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-base font-semibold text-foreground">Activity Log</h3>
          <p className="text-xs text-muted-foreground">Recent command history</p>
        </div>
      </div>

      {entries.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-muted/30 px-4 py-8 text-center">
          <p className="text-sm text-muted-foreground">No commands yet.</p>
        </div>
      ) : (
        <ul className="space-y-2">
          {entries.slice(0, 12).map((e) => {
            const SourceIcon = e.source === "voice" ? Mic : e.source === "button" ? MousePointerClick : Settings2;
            const StatusIcon = e.status === "success" ? CheckCircle2 : XCircle;
            return (
              <li
                key={e.id}
                className="group flex items-center gap-3 rounded-xl border border-border/60 bg-background/60 px-3 py-2.5 transition-colors hover:bg-muted/40"
              >
                <div
                  className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                    e.status === "success" ? "bg-success/15 text-success" : "bg-destructive/10 text-destructive",
                  )}
                >
                  <SourceIcon className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">{e.message}</p>
                  <p className="text-[11px] text-muted-foreground">{formatTime(e.at)} · {e.source}</p>
                </div>
                <StatusIcon
                  className={cn(
                    "h-4 w-4 shrink-0",
                    e.status === "success" ? "text-success" : "text-destructive",
                  )}
                />
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}
