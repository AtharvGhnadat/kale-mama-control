import { useEffect, useRef, useState } from "react";

type SR = typeof window extends { SpeechRecognition: infer T }
  ? T
  : unknown;

export interface VoiceHookState {
  supported: boolean;
  listening: boolean;
  transcript: string;
  start: () => void;
  stop: () => void;
}

export function speak(text: string) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = "en-IN";
  utter.rate = 1;
  utter.pitch = 1;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utter);
}

export function useSpeechRecognition(onResult: (t: string) => void): VoiceHookState {
  const [supported, setSupported] = useState(false);
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const w = window as any;
    const SRCtor = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!SRCtor) return;
    setSupported(true);
    const rec = new SRCtor();
    rec.lang = "en-IN";
    rec.interimResults = false;
    rec.maxAlternatives = 3;
    rec.continuous = false;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    rec.onresult = (e: any) => {
      const text = Array.from(e.results)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .map((r: any) => r[0].transcript)
        .join(" ")
        .trim();
      setTranscript(text);
      onResult(text);
    };
    rec.onend = () => setListening(false);
    rec.onerror = () => setListening(false);
    recRef.current = rec;
    return () => {
      try { rec.stop(); } catch { /* noop */ }
    };
  }, [onResult]);

  return {
    supported,
    listening,
    transcript,
    start: () => {
      if (!recRef.current) return;
      try {
        setTranscript("");
        recRef.current.start();
        setListening(true);
      } catch { /* already started */ }
    },
    stop: () => {
      try { recRef.current?.stop(); } catch { /* noop */ }
      setListening(false);
    },
  };
}

export type ParsedCommand =
  | "fan_on" | "fan_off"
  | "light_on" | "light_off"
  | "all_on" | "all_off"
  | null;

export function parseVoiceCommand(raw: string): ParsedCommand {
  const t = raw.toLowerCase().replace(/[^a-z\s]/g, " ").replace(/\s+/g, " ").trim();
  if (!t.includes("kale mama") && !t.includes("kalemama") && !t.includes("kaale mama")) {
    // Be a bit lenient — allow without prefix too
  }
  const has = (...words: string[]) => words.every((w) => t.includes(w));
  if (has("all", "on")) return "all_on";
  if (has("all", "off")) return "all_off";
  if (has("fan", "on")) return "fan_on";
  if (has("fan", "off")) return "fan_off";
  if (has("light", "on")) return "light_on";
  if (has("light", "off")) return "light_off";
  return null;
}

export function commandSpeech(cmd: ParsedCommand): string {
  switch (cmd) {
    case "fan_on": return "Fan turned on";
    case "fan_off": return "Fan turned off";
    case "light_on": return "Light turned on";
    case "light_off": return "Light turned off";
    case "all_on": return "All devices turned on";
    case "all_off": return "All devices turned off";
    default: return "Command not recognized";
  }
}
