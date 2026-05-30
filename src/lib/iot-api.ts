// Sends commands to ESP32 via Supabase Edge Function proxy.
// Falls back to simulated success when no edge function URL is configured.

export type DeviceCommand =
  | "fan_on"
  | "fan_off"
  | "light_on"
  | "light_off"
  | "all_on"
  | "all_off"
  | "test_connection";

// Replace with your deployed Supabase edge function URL when ready.
// Example: https://YOUR_PROJECT_REF.supabase.co/functions/v1/esp32-command
export const SUPABASE_EDGE_FUNCTION_URL = "";

export interface CommandResult {
  ok: boolean;
  message: string;
  simulated?: boolean;
}

export async function sendDeviceCommand(
  command: DeviceCommand,
  esp32Ip: string,
): Promise<CommandResult> {
  if (!SUPABASE_EDGE_FUNCTION_URL) {
    // Simulated mode — backend not wired yet
    await new Promise((r) => setTimeout(r, 350));
    return { ok: true, message: `Simulated: ${command}`, simulated: true };
  }

  if (!esp32Ip && command !== "test_connection") {
    return { ok: false, message: "ESP32 IP not configured" };
  }

  try {
    const res = await fetch(SUPABASE_EDGE_FUNCTION_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ esp32Ip, command }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return { ok: false, message: data?.error || `HTTP ${res.status}` };
    }
    return { ok: true, message: data?.message || "Command sent" };
  } catch (err) {
    return { ok: false, message: err instanceof Error ? err.message : "Network error" };
  }
}
