export const dynamic = "force-dynamic";

import Link from "next/link";
import { notFound } from "next/navigation";

import { getEventBySlug } from "@/lib/data";
import { isAdminAuthenticated } from "@/lib/auth";
import { formatDateTime, formatLongDate } from "@/lib/utils";

export default async function EventPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [event, isAdmin] = await Promise.all([getEventBySlug(slug), isAdminAuthenticated()]);

  if (!event) {
    notFound();
  }

  return (
    <main className="space-y-8 pb-12">
      <section className="panel overflow-hidden p-6 sm:p-8 lg:p-12">
        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-5">
            <p className="text-xs uppercase tracking-[0.32em] text-brass">Event overview</p>
            <h2 className="max-w-3xl text-4xl font-semibold tracking-[-0.05em] sm:text-5xl lg:text-6xl">{event.title}</h2>
            <p className="max-w-2xl text-base leading-7 text-black/68 sm:text-lg sm:leading-8">{event.description}</p>
            <div className="actions-row">
              <Link href={`/events/${event.slug}/register`} className="button-primary">
                Register now
              </Link>
              {isAdmin && (
                <Link href="/admin/check-in" className="button-secondary">
                  Open admin check-in
                </Link>
              )}
            </div>
          </div>

          <div className="panel bg-white p-6">
            <p className="muted">Event details</p>
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
              <div>
                <p className="text-sm text-black/55">Starts</p>
                <p className="text-lg font-medium">{formatLongDate(event.startDate)}</p>
              </div>
              <div>
                <p className="text-sm text-black/55">Ends</p>
                <p className="text-lg font-medium">{formatLongDate(event.endDate)}</p>
              </div>
              <div>
                <p className="text-sm text-black/55">Sessions</p>
                <p className="text-lg font-medium">{event.sessions.length} scheduled sessions</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div>
          <p className="text-sm uppercase tracking-[0.25em] text-black/45">Programme</p>
          <h3 className="text-2xl font-semibold tracking-[-0.04em]">Sessions</h3>
        </div>

        <div className="grid gap-4">
          {event.sessions.map((session) => (
            <article key={session.id} className="panel flex flex-col gap-4 p-6 sm:p-7 lg:flex-row lg:items-center lg:justify-between">
              <div className="space-y-2">
                <h4 className="text-xl font-semibold tracking-[-0.03em]">{session.title}</h4>
                <p className="text-black/60">{formatDateTime(session.startsAt)}</p>
              </div>
              <div className="surface-soft w-full text-sm text-black/55 lg:w-auto lg:min-w-44 lg:text-right">
                {session.capacity ? `${session.capacity} seats available` : "Open attendance"}
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
