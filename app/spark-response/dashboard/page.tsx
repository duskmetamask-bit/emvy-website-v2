"use client";

import { useState } from "react";
import { useQuery } from "convex/react";

const api = {
  sparkResponse: {
    listByOwner: "sparkResponse:listByOwner" as const,
  },
} as any;

type CallRecord = {
  _id: string;
  callSid: string;
  callerName?: string;
  callerPhone?: string;
  jobType?: string;
  address?: string;
  outcome: string;
  ownerPhone: string;
  ownerTelegramChatId?: string;
  durationSeconds?: number;
  notes?: string;
  calBookingUrl?: string;
  smsSentToCaller?: boolean;
  telegramNotified?: boolean;
  createdAt: number;
};

function formatDuration(seconds: number | undefined): string {
  if (!seconds) return "—";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function formatTime(ts: number): string {
  return new Date(ts).toLocaleString("en-AU", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function outcomeBadge(outcome: string) {
  const map: Record<string, { label: string; color: string; bg: string }> = {
    booked: { label: "Booked", color: "#10b981", bg: "rgba(16,185,129,0.12)" },
    message_taken: { label: "Message Taken", color: "#06b6d4", bg: "rgba(6,182,212,0.12)" },
    callback_requested: { label: "Callback", color: "#f59e0b", bg: "rgba(245,158,11,0.12)" },
    no_answer: { label: "No Answer", color: "#6b7280", bg: "rgba(107,114,128,0.12)" },
    failed: { label: "Failed", color: "#ef4444", bg: "rgba(239,68,68,0.12)" },
  };
  const style = map[outcome] ?? { label: outcome, color: "#9ca3af", bg: "rgba(156,163,175,0.1)" };
  return (
    <span
      style={{
        color: style.color,
        background: style.bg,
        border: `1px solid ${style.color}30`,
        fontSize: 11,
        fontWeight: 510,
        padding: "2px 8px",
        borderRadius: 999,
        letterSpacing: "0.02em",
      }}
    >
      {style.label}
    </span>
  );
}

export default function SparkDashboardPage() {
  const [ownerPhone, setOwnerPhone] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const calls = useQuery(
    api.sparkResponse.listByOwner,
    submitted && ownerPhone ? { ownerPhone } : "skip"
  ) as CallRecord[] | undefined | null;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (ownerPhone.trim()) setSubmitted(true);
  }

  if (!submitted) {
    return (
      <div
        className="min-h-screen flex items-center justify-center px-4"
        style={{ background: "var(--canvas)", fontFamily: "var(--font-sans)" }}
      >
        <div
          className="w-full max-w-sm rounded-2xl p-8 space-y-6"
          style={{
            background: "var(--surface-1)",
            border: "1px solid var(--border-subtle)",
          }}
        >
          <div className="space-y-1">
            <h1
              className="text-xl"
              style={{
                color: "var(--text-primary)",
                fontWeight: 590,
                letterSpacing: "-0.025em",
              }}
            >
              Spark Response Dashboard
            </h1>
            <p style={{ color: "var(--text-muted)", fontSize: 13 }}>
              Enter your phone number to view your call history.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label
                htmlFor="ownerPhone"
                style={{
                  color: "var(--text-muted)",
                  fontSize: 11,
                  fontWeight: 510,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                }}
              >
                Your Phone Number
              </label>
              <input
                id="ownerPhone"
                type="tel"
                value={ownerPhone}
                onChange={(e) => setOwnerPhone(e.target.value)}
                placeholder="+61 4XX XXX XXX"
                className="w-full px-3 py-2.5 rounded-lg text-sm"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid var(--border-standard)",
                  color: "var(--text-primary)",
                  fontSize: 14,
                  outline: "none",
                }}
                onFocus={(e) =>
                  (e.currentTarget.style.borderColor = "rgba(6,182,212,0.4)")
                }
                onBlur={(e) =>
                  (e.currentTarget.style.borderColor = "var(--border-standard)")
                }
              />
            </div>
            <button
              type="submit"
              className="w-full py-2.5 rounded-lg text-sm font-medium"
              style={{
                background: "var(--accent)",
                color: "#ffffff",
                fontWeight: 510,
              }}
            >
              View My Calls
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen px-4 py-8 md:px-8"
      style={{ background: "var(--canvas)", fontFamily: "var(--font-sans)" }}
    >
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1
              className="text-xl"
              style={{
                color: "var(--text-primary)",
                fontWeight: 590,
                letterSpacing: "-0.025em",
              }}
            >
              Spark Response — Your Calls
            </h1>
            <p style={{ color: "var(--text-muted)", fontSize: 13 }}>
              {ownerPhone}
            </p>
          </div>
          <button
            onClick={() => setSubmitted(false)}
            className="text-xs px-3 py-1.5 rounded-lg"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid var(--border-standard)",
              color: "var(--text-muted)",
            }}
          >
            Change number
          </button>
        </div>

        {/* Stats row */}
        {calls && calls.length > 0 && (
          <div className="grid grid-cols-3 gap-3">
            {[
              {
                label: "Total Calls",
                value: calls.length,
                color: "var(--text-primary)",
              },
              {
                label: "Booked",
                value: calls.filter((c) => c.outcome === "booked").length,
                color: "#10b981",
              },
              {
                label: "No Answer",
                value: calls.filter((c) => c.outcome === "no_answer").length,
                color: "#6b7280",
              },
            ].map((stat) => (
              <div
                key={stat.label}
                className="rounded-xl px-4 py-3"
                style={{
                  background: "var(--surface-1)",
                  border: "1px solid var(--border-subtle)",
                }}
              >
                <div
                  style={{
                    fontSize: 28,
                    fontWeight: 590,
                    color: stat.color,
                    letterSpacing: "-0.04em",
                    lineHeight: 1,
                  }}
                >
                  {stat.value}
                </div>
                <div
                  style={{
                    color: "var(--text-muted)",
                    fontSize: 11,
                    marginTop: 4,
                    letterSpacing: "0.04em",
                    textTransform: "uppercase",
                  }}
                >
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Calls list */}
        <div
          className="rounded-xl overflow-hidden"
          style={{
            background: "var(--surface-1)",
            border: "1px solid var(--border-subtle)",
          }}
        >
          {calls === undefined || calls === null ? (
            <div className="py-16 text-center" style={{ color: "var(--text-muted)", fontSize: 13 }}>
              Loading...
            </div>
          ) : calls.length === 0 ? (
            <div className="py-16 text-center space-y-2">
              <div style={{ color: "var(--text-muted)", fontSize: 13 }}>
                No calls found for this number.
              </div>
              <div style={{ color: "var(--text-subtle)", fontSize: 12 }}>
                Make sure your VAPI agent is configured and receiving calls.
              </div>
            </div>
          ) : (
            <div className="divide-y" style={{ borderColor: "var(--border-subtle)" }}>
              {calls.map((call) => (
                <div key={call._id} className="px-5 py-4 space-y-2">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div
                        style={{
                          color: "var(--text-primary)",
                          fontSize: 14,
                          fontWeight: 510,
                        }}
                      >
                        {call.callerName || "Unknown Caller"}
                      </div>
                      <div
                        style={{
                          color: "var(--text-muted)",
                          fontSize: 12,
                          marginTop: 1,
                        }}
                      >
                        {call.callerPhone || "—"} &middot; {formatTime(call.createdAt)}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {outcomeBadge(call.outcome)}
                      <span
                        style={{
                          color: "var(--text-subtle)",
                          fontSize: 11,
                          fontFamily: "monospace",
                        }}
                      >
                        {formatDuration(call.durationSeconds)}
                      </span>
                    </div>
                  </div>
                  {(call.jobType || call.address) && (
                    <div
                      className="rounded-lg px-3 py-2"
                      style={{
                        background: "rgba(255,255,255,0.02)",
                        border: "1px solid var(--border-subtle)",
                      }}
                    >
                      {call.jobType && (
                        <span style={{ color: "var(--text-secondary)", fontSize: 12 }}>
                          Job: {call.jobType}
                        </span>
                      )}
                      {call.jobType && call.address && (
                        <span style={{ color: "var(--text-subtle)", fontSize: 12 }}> &middot; </span>
                      )}
                      {call.address && (
                        <span style={{ color: "var(--text-secondary)", fontSize: 12 }}>
                          {call.address}
                        </span>
                      )}
                    </div>
                  )}
                  {call.calBookingUrl && (
                    <a
                      href={call.calBookingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs"
                      style={{ color: "#06b6d4", textDecoration: "none" }}
                    >
                      View booking →
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
