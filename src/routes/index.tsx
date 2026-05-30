import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { DeviceCard } from "@/components/dashboard/DeviceCard";
import { VoiceControl, type VoiceResult } from "@/components/dashboard/VoiceControl";
import { ConnectionSettings } from "@/components/dashboard/ConnectionSettings";
import { ActivityLog } from "@/components/dashboard/ActivityLog";
import { DashboardFooter } from "@/components/dashboard/DashboardFooter";
import { Toaster } from "@/components/ui/sonner";
import { sendDeviceCommand, type DeviceCommand } from "@/lib/iot-api";
import { commandSpeech, parseVoiceCommand, speak, useSpeechRecognition, type ParsedCommand } from "@/lib/voice";
import type { ActivityEntry, ConnectionStatus } from "@/components/dashboard/types";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Virtual Kale Mama — IoT Voice Automation" },
      { name: "description", content: "Voice-controlled IoT classroom automation dashboard for RIT Polytechnic AIML Department." },
      { property: "og:title", content: "Virtual Kale Mama" },
      { property: "og:description", content: "Voice-controlled IoT classroom automation dashboard." },
    ],
  }),
  component: Dashboard,
});

const IP_STORAGE_KEY = "vkm.esp32Ip";

function Dashboard() {
  const [fanState, setFanState] = useState(false);
  const [lightState, setLightState] = useState(false);
  const [fanUpdated, setFanUpdated] = useState<Date | null>(null);
  const [lightUpdated, setLightUpdated] = useState<Date | null>(null);

  const [esp32Ip, setEsp32Ip] = useState("");
  const [draftIp, setDraftIp] = useState("");
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>("idle");
  const [connectionMessage, setConnectionMessage] = useState("");

  const [voiceResult, setVoiceResult] = useState<VoiceResult>("idle");
  const [voiceResultText, setVoiceResultText] = useState("");
  const [parsedCommand, setParsedCommand] = useState<ParsedCommand>(null);

  const [activity, setActivity] = useState<ActivityEntry[]>([]);
  const [busy, setBusy] = useState(false);

  // Hydrate IP from localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = window.localStorage.getItem(IP_STORAGE_KEY) ?? "";
    setEsp32Ip(saved);
    setDraftIp(saved);
  }, []);

  const pushActivity = useCallback((entry: Omit<ActivityEntry, "id" | "at">) => {
    setActivity((prev) => [
      { ...entry, id: crypto.randomUUID(), at: Date.now() },
      ...prev,
    ].slice(0, 50));
  }, []);

  const applyCommandToState = useCallback((cmd: DeviceCommand) => {
    const now = new Date();
    switch (cmd) {
      case "fan_on":  setFanState(true);  setFanUpdated(now); break;
      case "fan_off": setFanState(false); setFanUpdated(now); break;
      case "light_on":  setLightState(true);  setLightUpdated(now); break;
      case "light_off": setLightState(false); setLightUpdated(now); break;
      case "all_on":
        setFanState(true); setLightState(true);
        setFanUpdated(now); setLightUpdated(now); break;
      case "all_off":
        setFanState(false); setLightState(false);
        setFanUpdated(now); setLightUpdated(now); break;
      default: break;
    }
  }, []);

  const labelForCommand = (cmd: DeviceCommand, source: "voice" | "button"): string => {
    const via = source === "voice" ? "by voice" : "by button";
    switch (cmd) {
      case "fan_on":   return `Fan turned ON ${via}`;
      case "fan_off":  return `Fan turned OFF ${via}`;
      case "light_on": return `Light turned ON ${via}`;
      case "light_off":return `Light turned OFF ${via}`;
      case "all_on":   return `All devices turned ON ${via}`;
      case "all_off":  return `All devices turned OFF ${via}`;
      case "test_connection": return "Connection test sent";
    }
  };

  const runCommand = useCallback(
    async (cmd: DeviceCommand, source: "voice" | "button") => {
      setBusy(true);
      const res = await sendDeviceCommand(cmd, esp32Ip);
      setBusy(false);

      if (res.ok) {
        applyCommandToState(cmd);
        setConnectionStatus("sent");
        setConnectionMessage(res.simulated ? "Simulated — backend not configured" : "Command sent");
        pushActivity({
          message: labelForCommand(cmd, source),
          source,
          status: "success",
        });
        toast.success(labelForCommand(cmd, source));
      } else {
        setConnectionStatus("error");
        setConnectionMessage(res.message);
        pushActivity({
          message: `${labelForCommand(cmd, source)} — failed: ${res.message}`,
          source,
          status: "failed",
        });
        toast.error(`Failed: ${res.message}`);
      }
      return res.ok;
    },
    [esp32Ip, applyCommandToState, pushActivity],
  );

  // Voice handling
  const handleVoiceResult = useCallback(
    async (text: string) => {
      const parsed = parseVoiceCommand(text);
      setParsedCommand(parsed);
      if (!parsed) {
        setVoiceResult("unrecognized");
        setVoiceResultText("Command not recognized");
        speak("Command not recognized");
        pushActivity({ message: `Unrecognized voice: “${text}”`, source: "voice", status: "failed" });
        return;
      }
      const ok = await runCommand(parsed, "voice");
      setVoiceResult(ok ? "success" : "failed");
      setVoiceResultText(ok ? commandSpeech(parsed) : "Command failed");
      if (ok) speak(commandSpeech(parsed));
    },
    [runCommand, pushActivity],
  );

  const voice = useSpeechRecognition(handleVoiceResult);

  const onToggleMic = () => {
    if (!voice.supported) {
      toast.error("Speech recognition not supported in this browser.");
      return;
    }
    if (voice.listening) voice.stop();
    else {
      setVoiceResult("idle");
      setVoiceResultText("");
      setParsedCommand(null);
      voice.start();
    }
  };

  const onChipClick = (text: string) => {
    handleVoiceResult(text);
  };

  const onSaveIp = () => {
    const trimmed = draftIp.trim();
    setEsp32Ip(trimmed);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(IP_STORAGE_KEY, trimmed);
    }
    setConnectionStatus(trimmed ? "connected" : "idle");
    setConnectionMessage(trimmed ? `IP saved: ${trimmed}` : "IP cleared");
    pushActivity({
      message: trimmed ? `ESP32 IP saved (${trimmed})` : "ESP32 IP cleared",
      source: "system",
      status: "success",
    });
    toast.success(trimmed ? "ESP32 IP saved" : "ESP32 IP cleared");
  };

  const onTestConnection = async () => {
    setBusy(true);
    const res = await sendDeviceCommand("test_connection", esp32Ip || draftIp);
    setBusy(false);
    if (res.ok) {
      setConnectionStatus("connected");
      setConnectionMessage(res.simulated ? "Simulated connection OK" : "Connected");
      pushActivity({ message: "Connection test successful", source: "system", status: "success" });
      toast.success("Connection OK");
    } else {
      setConnectionStatus("error");
      setConnectionMessage(res.message);
      pushActivity({ message: `Connection test failed: ${res.message}`, source: "system", status: "failed" });
      toast.error(`Connection failed: ${res.message}`);
    }
  };

  const allOnDisabled = useMemo(() => busy, [busy]);

  return (
    <div className="min-h-screen bg-background">
      <Toaster position="top-center" richColors />
      <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-8 lg:py-10">
        <div className="space-y-6">
          <DashboardHeader />

          {/* Device grid */}
          <section className="grid gap-4 md:grid-cols-2">
            <DeviceCard
              kind="fan"
              state={fanState}
              lastUpdated={fanUpdated}
              busy={busy}
              onTurnOn={() => runCommand("fan_on", "button")}
              onTurnOff={() => runCommand("fan_off", "button")}
            />
            <DeviceCard
              kind="light"
              state={lightState}
              lastUpdated={lightUpdated}
              busy={busy}
              onTurnOn={() => runCommand("light_on", "button")}
              onTurnOff={() => runCommand("light_off", "button")}
            />
          </section>

          {/* All on / off quick actions */}
          <section className="grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              disabled={allOnDisabled}
              onClick={() => runCommand("all_on", "button")}
              className="group flex items-center justify-center gap-2 rounded-2xl border border-success/30 bg-success/10 px-5 py-3.5 text-sm font-semibold text-success transition-all hover:bg-success hover:text-success-foreground active:scale-[0.98]"
            >
              Turn ALL ON
            </button>
            <button
              type="button"
              disabled={allOnDisabled}
              onClick={() => runCommand("all_off", "button")}
              className="group flex items-center justify-center gap-2 rounded-2xl border border-destructive/30 bg-destructive/10 px-5 py-3.5 text-sm font-semibold text-destructive transition-all hover:bg-destructive hover:text-destructive-foreground active:scale-[0.98]"
            >
              Turn ALL OFF
            </button>
          </section>

          <VoiceControl
            listening={voice.listening}
            supported={voice.supported}
            transcript={voice.transcript}
            result={voiceResult}
            resultText={voiceResultText}
            parsedCommand={parsedCommand}
            onToggleMic={onToggleMic}
            onChipClick={onChipClick}
          />

          <div className="grid gap-4 lg:grid-cols-2">
            <ConnectionSettings
              esp32Ip={esp32Ip}
              draftIp={draftIp}
              status={connectionStatus}
              statusMessage={connectionMessage}
              onDraftChange={setDraftIp}
              onSave={onSaveIp}
              onTest={onTestConnection}
              busy={busy}
            />
            <ActivityLog entries={activity} />
          </div>

          <DashboardFooter />
        </div>
      </div>
    </div>
  );
}
