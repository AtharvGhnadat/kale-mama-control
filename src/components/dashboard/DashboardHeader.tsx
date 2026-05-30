import { GraduationCap } from "lucide-react";

export function DashboardHeader() {
  return (
    <header
      className="relative overflow-hidden rounded-3xl border border-gold/30 px-5 py-6 sm:px-8 sm:py-8"
      style={{ background: "var(--gradient-navy)" }}
    >
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-px"
        style={{ background: "var(--gradient-gold)" }}
      />
      <div
        aria-hidden
        className="absolute -right-24 -top-24 h-64 w-64 rounded-full opacity-20 blur-3xl"
        style={{ background: "var(--gradient-gold)" }}
      />

      <div className="relative flex flex-col items-center gap-5 text-center sm:flex-row sm:items-center sm:gap-6 sm:text-left">
        {/* Circular logo placeholder */}
        <div className="shrink-0">
          <div
            className="flex h-20 w-20 items-center justify-center rounded-full border-2 border-gold bg-navy/40 shadow-[0_0_30px_oklch(0.78_0.13_85/0.35)] sm:h-24 sm:w-24"
            aria-label="College logo placeholder"
          >
            <GraduationCap className="h-9 w-9 text-gold sm:h-11 sm:w-11" />
          </div>
        </div>

        <div className="flex-1">
          <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-gold/40 bg-white/5 px-3 py-1 text-[11px] font-medium uppercase tracking-wider text-gold backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full bg-gold" />
            IoT Voice Automation System
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-4xl">
            Virtual <span className="text-gold">Kale Mama</span>
          </h1>
          <p className="mt-1 text-sm font-medium text-white/85 sm:text-base">
            RIT Polytechnic, Lohegaon
          </p>
          <p className="text-xs text-white/60 sm:text-sm">AIML Department</p>
        </div>
      </div>
    </header>
  );
}
