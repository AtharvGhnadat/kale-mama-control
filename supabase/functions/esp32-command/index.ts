// Supabase Edge Function: esp32-command
// Proxies HTTP commands from the Virtual Kale Mama dashboard to an ESP32
// running an HTTP server on the local network.
//
// Request body:
//   { "esp32Ip": "192.168.1.100", "command": "fan_on" }
//
// Supported commands:
//   fan_on | fan_off | light_on | light_off | all_on | all_off | test_connection
//
// The ESP32 sketch is expected to expose endpoints like:
//   GET http://<esp32Ip>/fan/on
//   GET http://<esp32Ip>/fan/off
//   GET http://<esp32Ip>/light/on
//   GET http://<esp32Ip>/light/off
//   GET http://<esp32Ip>/all/on
//   GET http://<esp32Ip>/all/off
//   GET http://<esp32Ip>/ping        (for test_connection)

import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

type Command =
  | "fan_on" | "fan_off"
  | "light_on" | "light_off"
  | "all_on" | "all_off"
  | "test_connection";

const COMMAND_PATHS: Record<Command, string> = {
  fan_on: "/fan/on",
  fan_off: "/fan/off",
  light_on: "/light/on",
  light_off: "/light/off",
  all_on: "/all/on",
  all_off: "/all/off",
  test_connection: "/ping",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders },
  });
}

function isValidIp(ip: string): boolean {
  // Accept IPv4 or hostname (basic check)
  if (!ip) return false;
  if (/^(\d{1,3}\.){3}\d{1,3}$/.test(ip)) {
    return ip.split(".").every((p) => Number(p) >= 0 && Number(p) <= 255);
  }
  return /^[a-zA-Z0-9.-]+$/.test(ip) && ip.length <= 253;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  if (req.method !== "POST") {
    return json({ error: "Method not allowed" }, 405);
  }

  let payload: { esp32Ip?: string; command?: string };
  try {
    payload = await req.json();
  } catch {
    return json({ error: "Invalid JSON body" }, 400);
  }

  const { esp32Ip, command } = payload;
  if (!command || !(command in COMMAND_PATHS)) {
    return json({ error: `Unknown command: ${command}` }, 400);
  }
  if (!esp32Ip || !isValidIp(esp32Ip)) {
    return json({ error: "Invalid or missing esp32Ip" }, 400);
  }

  const path = COMMAND_PATHS[command as Command];
  const url = `http://${esp32Ip}${path}`;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    const resp = await fetch(url, { method: "GET", signal: controller.signal });
    clearTimeout(timeout);
    const text = await resp.text().catch(() => "");
    if (!resp.ok) {
      return json(
        { error: `ESP32 responded with ${resp.status}`, body: text },
        502,
      );
    }
    return json({
      ok: true,
      command,
      esp32Ip,
      message: "Command delivered to ESP32",
      esp32Response: text || null,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return json({ error: `Failed to reach ESP32: ${message}` }, 504);
  }
});
