export const dynamic = "force-dynamic";

import Link from "next/link";
import { notFound } from "next/navigation";

import { RegisterForm } from "@/components/register-form";
import { getEventBySlug } from "@/lib/data";
import { formatDateTime } from "@/lib/utils";

const errorCopy: Record<string, string> = {
  "missing-fields": "Please complete all required fields before continuing.",
  "no-sessions": "Choose at least one session when registering by session.",
  duplicate: "This email is already registered for the selected event or session.",
  capacity: "One of the selected sessions has reached capacity.",
  "invalid-sessions": "We could not confirm the selected sessions. Please try again.",
  retry: "Your registration could not be completed safely. Please try once more."
};

export default async function RegisterPage({
  params,
  searchParams
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { slug } = await params;
  const { error } = await searchParams;
  const event = await getEventBySlug(slug);

  if (!event) {
    notFound();
  }

  return (
    <main className="grid gap-8 pb-12 lg:grid-cols-[0.9fr_1.1fr]">
      <section className="space-y-5">
        <Link href={`/events/${event.slug}`} className="text-sm text-black/55 hover:text-black">
          Back to event
        </Link>
        <div className="panel p-6 sm:p-8">
          <p className="text-xs uppercase tracking-[0.25em] text-brass">Registration</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-[-0.05em] sm:text-4xl">Reserve your place</h2>
          <p className="mt-4 text-black/66">Complete the details below to receive your digital ticket for {event.title}.</p>
          {error ? <div className="alert-error mt-6">{errorCopy[error] || "We could not complete your registration. Please try again."}</div> : null}
        </div>

        <div className="panel p-6">
          <div className="inline-meta gap-3">
            <h3 className="text-lg font-semibold">Available sessions</h3>
            <p className="muted">{event.sessions.length} listed</p>
          </div>
          <div className="mt-4 space-y-3">
            {event.sessions.map((session) => (
              <div key={session.id} className="surface-soft">
                <p className="font-medium">{session.title}</p>
                <p className="mt-1 text-sm text-black/55">{formatDateTime(session.startsAt)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <RegisterForm
        eventId={event.id}
        eventSlug={event.slug}
        sessions={event.sessions.map((session) => ({
          id: session.id,
          title: session.title,
          startsAtLabel: formatDateTime(session.startsAt),
          capacityLabel: session.capacity ? `${session.capacity} seats` : "Open"
        }))}
      />
    </main>
  );
}
