import Link from "next/link";

import { EventBuilderForm } from "@/components/event-builder-form";
import { requireAdmin } from "@/lib/auth";

const errorCopy: Record<string, string> = {
  "missing-fields": "Please add the event details and at least one session.",
  "invalid-sessions": "We could not read the session list. Review the schedule section and try again.",
  "no-sessions": "Add at least one session before publishing this event."
};

export default async function NewEventPage({
  searchParams
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  await requireAdmin();
  const { error } = await searchParams;

  return (
    <main className="space-y-6 pb-12">
      <div className="space-y-3">
        <Link href="/admin" className="text-sm text-black/55 hover:text-black">
          Back to dashboard
        </Link>
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-brass">New event</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-[-0.05em] sm:text-4xl">Create an event</h2>
        </div>
      </div>

      {error ? <div className="alert-error">{errorCopy[error] || "We could not create this event. Please try again."}</div> : null}

      <EventBuilderForm />
    </main>
  );
}
