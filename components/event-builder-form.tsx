"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";

import { createEventAction } from "@/app/actions";

type DraftSession = {
  title: string;
  startsAt: string;
  capacity: string;
};

const emptySession = (): DraftSession => ({
  title: "",
  startsAt: "",
  capacity: ""
});

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="button-primary">
      {pending ? "Creating event..." : "Create event"}
    </button>
  );
}

export function EventBuilderForm() {
  const [sessions, setSessions] = useState<DraftSession[]>([emptySession()]);

  function updateSession(index: number, key: keyof DraftSession, value: string) {
    setSessions((current) =>
      current.map((session, sessionIndex) =>
        sessionIndex === index ? { ...session, [key]: value } : session
      )
    );
  }

  function addSession() {
    setSessions((current) => [...current, emptySession()]);
  }

  function removeSession(index: number) {
    setSessions((current) => current.filter((_, currentIndex) => currentIndex !== index));
  }

  const serializedSessions = JSON.stringify(
    sessions
      .filter((session) => session.title && session.startsAt)
      .map((session) => ({
        title: session.title.trim(),
        startsAt: session.startsAt,
        capacity: session.capacity ? Number(session.capacity) : null
      }))
  );

  return (
    <form action={createEventAction} className="space-y-8">
      <div className="panel grid gap-5 p-6 sm:grid-cols-2 sm:p-8">
        <div className="sm:col-span-2">
          <label htmlFor="title" className="label">
            Event title
          </label>
          <input id="title" name="title" className="input" placeholder="Future of Learning Summit" required />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="description" className="label">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            className="textarea"
            placeholder="Describe the event, who it is for, and what attendees can expect."
            required
          />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="communityLink" className="label flex gap-2 items-center">
            WhatsApp / Telegram group link <span className="text-xs font-normal opacity-50">(Optional)</span>
          </label>
          <input
            id="communityLink"
            name="communityLink"
            type="url"
            className="input"
            placeholder="https://chat.whatsapp.com/..."
          />
        </div>
        <div>
          <label htmlFor="startDate" className="label">
            Event start
          </label>
          <input id="startDate" name="startDate" type="datetime-local" className="input" required />
        </div>
        <div>
          <label htmlFor="endDate" className="label">
            Event end
          </label>
          <input id="endDate" name="endDate" type="datetime-local" className="input" required />
        </div>
      </div>

      <div className="panel space-y-5 p-6 sm:p-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold tracking-[-0.03em]">Sessions</h2>
            <p className="muted">Add the programme blocks attendees can register for.</p>
          </div>
          <button type="button" onClick={addSession} className="button-secondary">
            Add session
          </button>
        </div>

        <div className="space-y-4">
          {sessions.map((session, index) => (
            <div key={index} className="rounded-[1.5rem] border border-black/10 bg-sand/55 p-5">
              <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="font-medium">Session {index + 1}</p>
                {sessions.length > 1 ? (
                  <button type="button" onClick={() => removeSession(index)} className="button-secondary">
                    Remove
                  </button>
                ) : null}
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="sm:col-span-3">
                  <label className="label">Title</label>
                  <input
                    value={session.title}
                    onChange={(event) => updateSession(index, "title", event.target.value)}
                    className="input"
                    placeholder="Workshop or session title"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="label">Date & time</label>
                  <input
                    value={session.startsAt}
                    onChange={(event) => updateSession(index, "startsAt", event.target.value)}
                    type="datetime-local"
                    className="input"
                  />
                </div>
                <div>
                  <label className="label">Capacity</label>
                  <input
                    value={session.capacity}
                    onChange={(event) => updateSession(index, "capacity", event.target.value)}
                    type="number"
                    min="1"
                    className="input"
                    placeholder="Optional"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <input type="hidden" name="sessions" value={serializedSessions} />
      </div>

      <SubmitButton />
    </form>
  );
}
