"use client";

import { useMemo, useState } from "react";

import { registerAction } from "@/app/actions";
import { FormSubmitButton } from "@/components/form-submit-button";

type SessionOption = {
  id: string;
  title: string;
  startsAtLabel: string;
  capacityLabel: string;
};

export function RegisterForm({
  eventId,
  eventSlug,
  sessions
}: {
  eventId: string;
  eventSlug: string;
  sessions: SessionOption[];
}) {
  const [registrationType, setRegistrationType] = useState<"event" | "sessions">("event");

  const helper = useMemo(() => {
    if (registrationType === "event") {
      return "One ticket gives the attendee access to the full event.";
    }

    return "Choose one or more sessions. Separate tickets will be issued for each selected session.";
  }, [registrationType]);

  return (
    <form action={registerAction} className="panel space-y-6 p-6 sm:p-8">
      <input type="hidden" name="eventId" value={eventId} />
      <input type="hidden" name="eventSlug" value={eventSlug} />

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label htmlFor="name" className="label">
            Full name
          </label>
          <input id="name" name="name" className="input" placeholder="Ama Owusu" autoComplete="name" required />
        </div>
        <div>
          <label htmlFor="email" className="label">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            className="input"
            placeholder="johndoe@example.com"
            autoComplete="email"
            required
          />
        </div>
        <div>
          <label htmlFor="phone" className="label">
            Phone
          </label>
          <input
            id="phone"
            name="phone"
            className="input"
            placeholder="+233 20 123 4567"
            autoComplete="tel"
            inputMode="tel"
            required
          />
        </div>
      </div>

      <div className="space-y-4 rounded-[1.5rem] border border-black/10 bg-sand/60 p-5">
        <div className="space-y-2">
          <p className="text-sm font-medium text-black/70">Registration type</p>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="choice-card">
              <input
                type="radio"
                name="registrationType"
                value="event"
                checked={registrationType === "event"}
                onChange={() => setRegistrationType("event")}
                className="mt-1 accent-[#40534c]"
              />
              <span>
                <span className="block font-medium">Full event access</span>
                <span className="muted">Best for attendees joining the entire programme.</span>
              </span>
            </label>
            <label className="choice-card">
              <input
                type="radio"
                name="registrationType"
                value="sessions"
                checked={registrationType === "sessions"}
                onChange={() => setRegistrationType("sessions")}
                className="mt-1 accent-[#40534c]"
              />
              <span>
                <span className="block font-medium">Specific sessions</span>
                <span className="muted">Choose only the sessions the attendee plans to attend.</span>
              </span>
            </label>
          </div>
        </div>

        <p className="muted">{helper}</p>

        <div className={`space-y-3 ${registrationType === "sessions" ? "block" : "hidden"}`}>
          {sessions.map((session) => (
            <label key={session.id} className="choice-card flex-col sm:flex-row sm:items-center sm:justify-between">
              <span>
                <span className="block font-medium">{session.title}</span>
                <span className="muted">{session.startsAtLabel}</span>
              </span>
              <span className="flex items-center justify-between gap-3 sm:justify-end">
                <span className="muted">{session.capacityLabel}</span>
                <input type="checkbox" name="sessionIds" value={session.id} className="h-4 w-4 accent-[#40534c]" />
              </span>
            </label>
          ))}
        </div>
      </div>

      <FormSubmitButton idleLabel="Complete registration" pendingLabel="Registering..." />
    </form>
  );
}
