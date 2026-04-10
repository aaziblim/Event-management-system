export const dynamic = "force-dynamic";

import Link from "next/link";

import { isAdminAuthenticated } from "@/lib/auth";
import { getHomepageEvents } from "@/lib/data";
import { formatLongDate, formatTime } from "@/lib/utils";

export default async function HomePage() {
  const [events, isAdmin] = await Promise.all([getHomepageEvents(), isAdminAuthenticated()]);

  return (
    <main className="space-y-8 pb-12">
      <section className="panel overflow-hidden p-6 sm:p-8 lg:p-12">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-brass/20 bg-brass/5 px-3 py-1.5 text-xs font-medium text-brass backdrop-blur-sm shadow-[0_0_15px_rgba(164,111,44,0.1)]">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full rounded-full bg-brass opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-brass"></span>
              </span>
              Live event operations platform
            </div>
            <div className="space-y-5">
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-brass">Event Management Platform</p>
              <h2 className="max-w-3xl text-4xl font-semibold tracking-[-0.06em] text-ink sm:text-5xl lg:text-6xl text-balance">
                A clean system for modern event operations.
              </h2>
              <p className="max-w-2xl text-base leading-7 text-black/68 sm:text-lg sm:leading-8 text-balance">
                Publish events, manage registrations, issue tickets, send reminders, and validate attendance through one calm, cohesive workflow.
              </p>
              {isAdmin ? (
                <div className="actions-row">
                  <Link href="/admin" className="button-primary">
                    Open admin dashboard
                  </Link>
                  <Link href="/admin/events/new" className="button-secondary">
                    Create event
                  </Link>
                </div>
              ) : null}
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
            <div className="stat-card">
              <p className="muted">Active events</p>
              <p className="mt-3 text-4xl font-semibold tracking-[-0.05em]">{events.length}</p>
            </div>
            <div className="stat-card">
              <p className="muted">Experience</p>
              <p className="mt-3 text-lg font-medium">Registration, tickets, reminders, and check-in in one flow</p>
            </div>
            <div className="stat-card">
              <p className="muted">Audience</p>
              <p className="mt-3 text-lg font-medium">Teams, institutions, communities, and event organisers</p>
            </div>
          </div>
        </div>
      </section>

      <section id="events" className="space-y-4 scroll-mt-8">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-black/45">Upcoming events</p>
            <h3 className="text-2xl font-semibold tracking-[-0.04em]">Open registrations</h3>
          </div>
        </div>

        {events.length === 0 ? (
          <div className="panel p-8">
            <h4 className="text-xl font-semibold">No events published yet</h4>
            <p className="mt-3 max-w-xl text-black/65">
              {isAdmin
                ? "Create your first event from the admin dashboard and it will appear here automatically."
                : "Check back soon for upcoming events published through this platform."}
            </p>
          </div>
        ) : (
          <div className="grid gap-5 lg:grid-cols-2">
            {events.map((event) => (
              <article key={event.id} className="panel flex h-full flex-col gap-6 p-6 sm:p-8">
                <div className="space-y-3">
                  <p className="text-xs uppercase tracking-[0.24em] text-black/45">{formatLongDate(event.startDate)}</p>
                  <h4 className="text-2xl font-semibold tracking-[-0.04em] sm:text-3xl">{event.title}</h4>
                  <p className="max-w-2xl text-black/66">{event.description}</p>
                </div>
                <div className="surface-soft grid gap-3">
                  {event.sessions.slice(0, 3).map((session) => (
                    <div key={session.id} className="inline-meta gap-2 text-sm">
                      <span className="font-medium">{session.title}</span>
                      <span className="text-black/55">{formatTime(session.startsAt)}</span>
                    </div>
                  ))}
                </div>
                <div className="inline-meta mt-auto gap-3">
                  {isAdmin ? <p className="muted">{event._count.tickets} registrations so far</p> : <div />}
                  <Link href={`/events/${event.slug}`} className="button-primary">
                    View event
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
