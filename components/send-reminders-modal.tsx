"use client";

import { useMemo, useState } from "react";
import { useFormStatus } from "react-dom";

import { sendReminderEmailsAction } from "@/app/actions";

type SendRemindersModalProps = {
  eventId: string;
  eventTitle: string;
  recipientCount: number;
};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button type="submit" disabled={pending} className="button-primary">
      {pending ? "Sending..." : "Send reminder"}
    </button>
  );
}

export function SendRemindersModal({ eventId, eventTitle, recipientCount }: SendRemindersModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [customMessage, setCustomMessage] = useState("");

  const messageCount = useMemo(() => customMessage.trim().length, [customMessage]);

  if (!isOpen) {
    return (
      <button onClick={() => setIsOpen(true)} className="button-secondary">
        Send reminder
      </button>
    );
  }

  return (
    <>
      <button disabled className="button-secondary cursor-not-allowed opacity-50">
        Send reminder
      </button>

      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={() => setIsOpen(false)}
      >
        <div
          className="panel max-h-[90vh] w-full max-w-2xl space-y-6 overflow-y-auto p-6 shadow-2xl animate-in zoom-in-95 duration-200 sm:p-8"
          onClick={(event) => event.stopPropagation()}
        >
          <header>
            <div className="mb-3 flex items-center justify-between gap-4">
              <div className="rounded-full border border-brass/20 bg-brass/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-brass">
                Reminder email
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-full p-2 text-black/40 transition-colors hover:bg-black/[0.04] hover:text-black"
                aria-label="Close"
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M15 5L5 15M5 5l10 10" />
                </svg>
              </button>
            </div>
            <h3 className="text-2xl font-semibold tracking-tight sm:text-3xl">Send a reminder to registered attendees</h3>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-black/60 sm:text-base">
              This email goes once to each registered attendee for <span className="font-medium text-black">{eventTitle}</span>
              and includes their saved ticket link.
            </p>
          </header>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="surface-soft">
              <p className="text-xs uppercase tracking-[0.18em] text-black/45">Recipients</p>
              <p className="mt-2 text-3xl font-semibold tracking-[-0.04em]">{recipientCount}</p>
              <p className="mt-2 text-sm text-black/55">Unique attendees who have already registered.</p>
            </div>
            <div className="surface-soft">
              <p className="text-xs uppercase tracking-[0.18em] text-black/45">Included</p>
              <p className="mt-2 text-lg font-semibold">Ticket link + note</p>
              <p className="mt-2 text-sm text-black/55">Each email includes the attendee's ticket link and your optional note.</p>
            </div>
            <div className="surface-soft">
              <p className="text-xs uppercase tracking-[0.18em] text-black/45">Delivery</p>
              <p className="mt-2 text-lg font-semibold">Send now</p>
              <p className="mt-2 text-sm text-black/55">The reminder starts sending as soon as you confirm.</p>
            </div>
          </div>

          <form
            action={async (formData) => {
              await sendReminderEmailsAction(formData);
              setIsOpen(false);
            }}
            className="space-y-5"
          >
            <input type="hidden" name="eventId" value={eventId} />

            <div className="space-y-3">
              <div className="flex items-center justify-between gap-4">
                <label htmlFor="customMessage" className="label mb-0">
                  Optional note
                </label>
                <p className="text-xs text-black/40">{messageCount}/280</p>
              </div>
              <textarea
                id="customMessage"
                name="customMessage"
                className="textarea text-sm"
                placeholder="Example: Please arrive 15 minutes early for check-in and bring any required ID or confirmation details."
                rows={5}
                maxLength={280}
                value={customMessage}
                onChange={(event) => setCustomMessage(event.target.value)}
              />
              <p className="text-xs leading-6 text-black/45">
                Use this only for timely event-day instructions. The ticket link stays the main focus of the email.
              </p>
            </div>

            <div className="rounded-[1.5rem] border border-amber-100 bg-amber-50 p-4 sm:p-5">
              <div className="flex gap-3">
                <div className="mt-0.5 text-amber-600">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                </div>
                <div className="text-sm leading-relaxed text-amber-800">
                  <p className="font-semibold">Before you send</p>
                  <p className="opacity-80">
                    Use reminders for meaningful updates only. Everyone currently registered for this event will receive this message.
                  </p>
                </div>
              </div>
            </div>

            <footer className="flex flex-col-reverse gap-3 border-t border-black/5 pt-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs leading-6 text-black/45">Keep the note short and practical for the best attendee experience.</p>
              <div className="flex flex-col-reverse gap-3 sm:flex-row">
                <button type="button" onClick={() => setIsOpen(false)} className="button-ghost">
                  Cancel
                </button>
                <SubmitButton />
              </div>
            </footer>
          </form>
        </div>
      </div>
    </>
  );
}

