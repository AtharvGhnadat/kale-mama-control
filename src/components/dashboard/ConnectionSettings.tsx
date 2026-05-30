import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Wifi, Save, Zap } from "lucide-react";
import { StatusPill } from "./StatusPill";
import type { ConnectionStatus } from "./types";

interface Props {
  esp32Ip: string;
  draftIp: string;
  status: ConnectionStatus;
  statusMessage: string;
  onDraftChange: (v: string) => void;
  onSave: () => void;
  onTest: () => void;
  busy?: boolean;
}

export function ConnectionSettings({
  esp32Ip, draftIp, status, statusMessage, onDraftChange, onSave, onTest, busy,
}: Props) {
  const pillState =
    status === "connected" ? "connected" :
    status === "error" ? "error" :
    status === "sent" ? "connected" : "waiting";

  return (
    <Card className="border-border/60 bg-card p-5 shadow-[var(--shadow-card)] sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-navy text-gold">
            <Wifi className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-foreground">Connection Settings</h3>
            <p className="text-xs text-muted-foreground">ESP32 device endpoint</p>
          </div>
        </div>
        <StatusPill state={pillState} />
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-[1fr_auto_auto]">
        <Input
          inputMode="numeric"
          placeholder="192.168.1.100"
          value={draftIp}
          onChange={(e) => onDraftChange(e.target.value)}
          className="h-11 rounded-xl font-mono text-sm"
        />
        <Button
          onClick={onSave}
          className="h-11 rounded-xl bg-navy text-navy-foreground hover:bg-navy/90"
        >
          <Save className="mr-2 h-4 w-4" /> Save IP
        </Button>
        <Button
          onClick={onTest}
          disabled={busy}
          variant="outline"
          className="h-11 rounded-xl border-gold/50 bg-accent text-accent-foreground hover:bg-gold hover:text-gold-foreground"
        >
          <Zap className="mr-2 h-4 w-4" /> Test
        </Button>
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs">
        {esp32Ip ? (
          <span className="font-mono text-muted-foreground">
            Saved: <span className="text-foreground">{esp32Ip}</span>
          </span>
        ) : (
          <span className="text-muted-foreground">
            Enter your ESP32 IP address to start controlling devices.
          </span>
        )}
        {statusMessage && (
          <span className="text-muted-foreground">{statusMessage}</span>
        )}
      </div>
    </Card>
  );
}
