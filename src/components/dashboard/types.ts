export type ConnectionStatus = "idle" | "connected" | "error" | "sent";

export interface ActivityEntry {
  id: string;
  message: string;
  source: "voice" | "button" | "system";
  status: "success" | "failed";
  at: number;
}
