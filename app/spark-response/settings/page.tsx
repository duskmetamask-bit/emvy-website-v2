"use client";

import { useState } from "react";

const SECTIONS = [
  {
    id: "vapi",
    label: "VAPI",
    icon: "Phone",
    accent: "#06b6d4",
    fields: [
      { key: "VAPI_PRIVATE_KEY", label: "Private Key", placeholder: "vapi_private_..." },
      { key: "VAPI_PHONE_NUMBER_ID", label: "Phone Number ID", placeholder: "pn_..." },
      { key: "VAPI_ASSISTANT_ID", label: "Assistant ID", placeholder: "asst_..." },
    ],
    instructions: [
      "Create account at vapi.ai and add credits",
      "Buy or port a phone number in the VAPI dashboard",
      "Create an assistant with the system prompt for your use case",
      "Copy the Private Key, Phone Number ID, and Assistant ID below",
    ],
  },
  {
    id: "notifications",
    label: "Notifications",
    icon: "Bell",
    accent: "#f59e0b",
    fields: [
      { key: "OWNER_PHONE", label: "Your Phone Number", placeholder: "+61 4XX XXX XXX" },
      { key: "OWNER_TELEGRAM_CHAT_ID", label: "Telegram Chat ID (optional)", placeholder: "123456789" },
    ],
    instructions: [
      "Enter the phone number that should receive call notifications",
      "Optionally add your Telegram Chat ID for Telegram alerts",
      "Find your Telegram Chat ID by messaging @userinfobot",
    ],
  },
  {
    id: "booking",
    label: "Calendar",
    icon: "Calendar",
    accent: "#10b981",
    fields: [{ key: "CAL_BOOKING_URL", label: "Cal.com Booking URL", placeholder: "https://cal.com/jake-emvy/..." }],
    instructions: [
      "Create a Cal.com account and set up your booking calendar",
      "Paste your booking URL above — used in call transfer flows",
    ],
  },
];

function IconComponent({ name, size = 14 }: { name: string; size?: number }) {
  // Inline SVG icons to avoid lucide-react import issues in Next.js
  const icons: Record<string, string> = {
    Phone: `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.22h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.9a16 16 0 0 0 6 6l.95-.95a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.73 16.92z"/></svg>`,
    Bell: `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>`,
    Calendar: `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>`,
  };
  return <span dangerouslySetInnerHTML={{ __html: icons[name] || "" }} />;
}

export default function SparkSettingsPage() {
  const [activeSection, setActiveSection] = useState("vapi");
  const [saved, setSaved] = useState<string | null>(null);
  const [values, setValues] = useState<Record<string, string>>({});

  const section = SECTIONS.find((s) => s.id === activeSection)!;

  function handleChange(key: string, val: string) {
    setValues((prev) => ({ ...prev, [key]: val }));
  }

  async function handleSave() {
    // POST to a config API route (to be built — saves to convex settings table)
    // For now, show saved feedback
    setSaved(activeSection);
    setTimeout(() => setSaved(null), 2000);
  }

  return (
    <div
      className="min-h-screen px-4 py-8 md:px-8"
      style={{ background: "var(--canvas)", fontFamily: "var(--font-sans)" }}
    >
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Page header */}
        <div>
          <h1
            className="text-xl"
            style={{
              color: "var(--text-primary)",
              fontWeight: 590,
              letterSpacing: "-0.025em",
            }}
          >
            Spark Response — Settings
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: 13 }}>
            Configure your VAPI voice agent and notification preferences.
          </p>
        </div>

        <div className="flex gap-6">
          {/* Section nav */}
          <div className="w-44 flex-shrink-0 space-y-0.5">
            {SECTIONS.map((s) => {
              const isActive = activeSection === s.id;
              return (
                <button
                  key={s.id}
                  onClick={() => setActiveSection(s.id)}
                  className="w-full flex items-center gap-2.5 transition-colors duration-100"
                  style={{
                    padding: "7px 8px",
                    borderRadius: 6,
                    background: isActive ? "rgba(255,255,255,0.06)" : "transparent",
                    color: isActive ? "var(--text-primary)" : "var(--text-muted)",
                    borderLeft: isActive ? `2px solid ${s.accent}` : "2px solid transparent",
                    marginLeft: isActive ? 0 : 2,
                    fontSize: 13,
                    fontWeight: 510,
                    textAlign: "left",
                  }}
                >
                  <span style={{ color: isActive ? s.accent : "var(--text-muted)" }}>
                    <IconComponent name={s.icon} />
                  </span>
                  <span>{s.label}</span>
                </button>
              );
            })}
          </div>

          {/* Panel */}
          <div
            className="flex-1 rounded-xl px-6 py-5 space-y-5"
            style={{
              background: "var(--surface-1)",
              border: "1px solid var(--border-subtle)",
              maxWidth: 560,
            }}
          >
            {/* Panel header */}
            <div className="flex items-center gap-3 pb-4" style={{ borderBottom: "1px solid var(--border-subtle)" }}>
              <div
                className="flex items-center justify-center rounded-lg flex-shrink-0"
                style={{
                  width: 32,
                  height: 32,
                  background: `${section.accent}18`,
                  border: `1px solid ${section.accent}30`,
                }}
              >
                <span style={{ color: section.accent }}>
                  <IconComponent name={section.icon} size={14} />
                </span>
              </div>
              <div>
                <h2 style={{ color: "var(--text-primary)", fontWeight: 590, fontSize: 14 }}>
                  {section.label}
                </h2>
                <p style={{ color: "var(--text-muted)", fontSize: 12 }}>
                  API credentials and configuration
                </p>
              </div>
            </div>

            {/* Instructions */}
            <div
              className="rounded-lg p-4 space-y-3"
              style={{
                background: "rgba(255,255,255,0.02)",
                border: "1px solid var(--border-subtle)",
              }}
            >
              <p
                className="text-xs uppercase tracking-wider"
                style={{ color: "var(--text-muted)", fontWeight: 510, letterSpacing: "0.06em", fontSize: 10 }}
              >
                Setup Instructions
              </p>
              {section.instructions.map((step, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div
                    className="flex items-center justify-center rounded-full flex-shrink-0"
                    style={{
                      width: 18,
                      height: 18,
                      background: `${section.accent}18`,
                      color: section.accent,
                      fontWeight: 590,
                      fontSize: 10,
                      marginTop: 1,
                    }}
                  >
                    {i + 1}
                  </div>
                  <p style={{ color: "var(--text-secondary)", fontSize: 13, lineHeight: 1.5 }}>
                    {step}
                  </p>
                </div>
              ))}
            </div>

            {/* Fields */}
            <div className="space-y-3">
              {section.fields.map((f) => (
                <div key={f.key} className="space-y-1.5">
                  <label
                    htmlFor={f.key}
                    className="text-xs uppercase tracking-wider"
                    style={{
                      color: "var(--text-muted)",
                      fontWeight: 510,
                      letterSpacing: "0.06em",
                      fontSize: 10,
                    }}
                  >
                    {f.label}
                  </label>
                  <input
                    id={f.key}
                    type="password"
                    value={values[f.key] || ""}
                    onChange={(e) => handleChange(f.key, e.target.value)}
                    placeholder={f.placeholder}
                    className="w-full px-3 py-2.5 rounded-lg text-sm transition-colors duration-100"
                    style={{
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid var(--border-standard)",
                      color: "var(--text-primary)",
                      fontSize: 13,
                      outline: "none",
                    }}
                    onFocus={(e) => (e.currentTarget.style.borderColor = `${section.accent}66`)}
                    onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border-standard)")}
                  />
                </div>
              ))}
            </div>

            {/* Save button */}
            <button
              onClick={handleSave}
              className="w-full py-2.5 rounded-lg text-sm font-medium transition-colors duration-100"
              style={{
                background: section.accent,
                color: "#ffffff",
                fontWeight: 510,
                letterSpacing: "-0.01em",
              }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.opacity = "0.9")}
              onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.opacity = "1")}
            >
              {saved === activeSection ? "Saved!" : `Save ${section.label} Settings`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
