import Link from "next/link";

import { adminLogoutAction } from "@/app/actions";
import { SendRemindersModal } from "@/components/send-reminders-modal";
import { requireAdmin } from "@/lib/auth";
import { getAdminAttendees, getAdminDashboardData, getAdminEventOptions } from "@/lib/data";
import { formatDateTime } from "@/lib/utils";

const reminderCopy: Record<string, string> = {
  sent: "Reminder emails were sent to registered attendees for this event.",
  partial: "Some reminder emails were delivered, but a few could not be sent.",
  unavailable: "Email delivery is not configured yet, so reminders could not be sent.",
  failed: "We could not send the reminder campaign.",
  empty: "There are no registered attendees to remind yet.",
  missing: "Choose an event before sending a reminder."
};

const reminderTone: Record<string, "alert-success" | "alert-error"> = {
  sent: "alert-success",
  partial: "alert-error",
  unavailable: "alert-error",
  failed: "alert-error",
  empty: "alert-error",
  missing: "alert-error"
};

export default async function AdminDashboardPage({
  searchParams
}: {
  searchParams: Promise<{ eventId?: string; q?: string; reminder?: string; sentCount?: string; failedCount?: string }>;
}) {
  await requireAdmin();
  const { eventId, q, reminder, sentCount, failedCount } = await searchParams;
  const [data, eventOptions, attendees] = await Promise.all([
    getAdminDashboardData(),
    getAdminEventOptions(),
    getAdminAttendees({ eventId, query: q })
  ]);

  const reminderMessage =
    reminder === "partial"
      ? `${reminderCopy.partial} ${sentCount || "0"} delivered, ${failedCount || "0"} failed.`
      : reminder === "sent" && sentCount
        ? `${reminderCopy.sent} ${sentCount} delivered.`
        : reminder
          ? reminderCopy[reminder] || reminderCopy.failed
          : null;

  const reminderClass = reminder ? reminderTone[reminder] || "alert-error" : null;

  return (
    <main className="space-y-8 pb-12">
      <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.32em] text-brass">Admin dashboard</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-[-0.05em] sm:text-4xl">Event operations</h2>
          <p className="mt-3 text-black/66">Track registrations, attendance, and event performance from one place.</p>
        </div>
        <div className="actions-row">
          <Link href="/admin/events/new" className="button-primary">
            Create event
          </Link>
          <Link href="/admin/check-in" className="button-secondary">
            Open check-in desk
          </Link>
          <form action={adminLogoutAction} className="w-full sm:w-auto">
            <button type="submit" className="button-secondary">
              Sign out
            </button>
          </form>
        </div>
      </section>

      {reminderMessage && reminderClass ? <div className={reminderClass}>{reminderMessage}</div> : null}

      <section className="grid gap-4 md:grid-cols-3">
        <div className="stat-card">
          <p className="muted">Total registrations</p>
          <p className="mt-3 text-4xl font-semibold tracking-[-0.05em]">{data.registrationCount}</p>
        </div>
        <div className="stat-card">
          <p className="muted">Total check-ins</p>
          <p className="mt-3 text-4xl font-semibold tracking-[-0.05em]">{data.checkInCount}</p>
        </div>
        <div className="stat-card">
          <p className="muted">Active events</p>
          <p className="mt-3 text-4xl font-semibold tracking-[-0.05em]">{data.events.length}</p>
        </div>
      </section>

      <section className="panel p-6 sm:p-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-black/45">Attendees</p>
            <h3 className="mt-2 text-2xl font-semibold tracking-[-0.04em]">Search and export registrations</h3>
          </div>
          <form className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]" method="get">
            <select name="eventId" defaultValue={eventId || ""} className="input">
              <option value="">All events</option>
              {eventOptions.map((event) => (
                <option key={event.id} value={event.id}>
                  {event.title}
                </option>
              ))}
            </select>
            <input name="q" defaultValue={q || ""} className="input" placeholder="Search by name, email, phone, or ticket code" />
            <div className="actions-row sm:justify-end">
              <button type="submit" className="button-secondary">
                Apply filters
              </button>
              <Link
                href={`/admin/export${eventId || q ? `?${new URLSearchParams({ ...(eventId ? { eventId } : {}), ...(q ? { q } : {}) }).toString()}` : ""}`}
                className="button-primary"
              >
                Export CSV
              </Link>
            </div>
          </form>
        </div>

        <div className="table-shell mt-6">
          <table className="table-base">
            <thead className="table-head">
              <tr>
                <th className="table-cell font-medium">Attendee</th>
                <th className="table-cell font-medium">Ticket</th>
                <th className="table-cell font-medium">Access</th>
                <th className="table-cell font-medium">Status</th>
                <th className="table-cell font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/8 bg-white">
              {attendees.length === 0 ? (
                <tr>
                  <td colSpan={5} className="table-cell text-black/55">
                    No attendees matched your current filters.
                  </td>
                </tr>
              ) : (
                attendees.map((ticket) => (
                  <tr key={ticket.id}>
                    <td className="table-cell">
                      <div className="font-medium">{ticket.user.name}</div>
                      <div className="text-sm text-black/55">{ticket.user.email}</div>
                      <div className="text-sm text-black/45">{ticket.user.phone}</div>
                    </td>
                    <td className="table-cell">
                      <div className="font-medium">{ticket.ticketCode}</div>
                      <div className="text-sm text-black/55">{ticket.event.title}</div>
                    </td>
                    <td className="table-cell text-black/60">{ticket.session?.title || "Full event access"}</td>
                    <td className="table-cell text-black/60">
                      {ticket.checkedIn && ticket.checkedInAt ? `Checked in ${formatDateTime(ticket.checkedInAt)}` : "Not checked in"}
                    </td>
                    <td className="table-cell">
                      <div className="actions-row">
                        <Link href={`/tickets/${ticket.ticketCode}`} className="button-secondary">
                          View ticket
                        </Link>
                        <a href={`mailto:${ticket.user.email}?subject=${encodeURIComponent(`Your event ticket ${ticket.ticketCode}`)}`} className="button-secondary">
                          Email attendee
                        </a>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="space-y-4">
        {data.events.map((event) => {
          const eventCheckIns = event.tickets.filter((ticket) => ticket.checkedIn).length;

          return (
            <article key={event.id} className="panel p-6 sm:p-8">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-black/40">{formatDateTime(event.startDate)}</p>
                  <h3 className="mt-2 text-2xl font-semibold tracking-[-0.04em] sm:text-3xl">{event.title}</h3>
                  <p className="mt-3 max-w-2xl text-black/62">{event.description}</p>
                </div>
                <div className="actions-row lg:justify-end">
                  <SendRemindersModal
                    eventId={event.id}
                    eventTitle={event.title}
                    recipientCount={new Set(event.tickets.map((t) => t.userId)).size}
                  />
                  <Link href={`/events/${event.slug}`} className="button-secondary">
                    View event page
                  </Link>
                  <Link href={`/admin/check-in?eventId=${event.id}`} className="button-primary">
                    Open check-in
                  </Link>
                </div>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-3">
                <div className="surface-soft">
                  <p className="muted">Registrations</p>
                  <p className="mt-2 text-2xl font-semibold">{event._count.tickets}</p>
                </div>
                <div className="surface-soft">
                  <p className="muted">Check-ins</p>
                  <p className="mt-2 text-2xl font-semibold">{eventCheckIns}</p>
                </div>
                <div className="surface-soft">
                  <p className="muted">Sessions</p>
                  <p className="mt-2 text-2xl font-semibold">{event.sessions.length}</p>
                </div>
              </div>

              <div className="table-shell mt-6">
                <table className="table-base">
                  <thead className="table-head">
                    <tr>
                      <th className="table-cell font-medium">Session</th>
                      <th className="table-cell font-medium">Starts</th>
                      <th className="table-cell font-medium">Capacity</th>
                      <th className="table-cell font-medium">Registrations</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/8 bg-white">
                    {event.sessions.map((session) => (
                      <tr key={session.id}>
                        <td className="table-cell font-medium">{session.title}</td>
                        <td className="table-cell text-black/60">{formatDateTime(session.startsAt)}</td>
                        <td className="table-cell text-black/60">{session.capacity ?? "Open"}</td>
                        <td className="table-cell text-black/60">{session._count.tickets}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </article>
          );
        })}
      </section>
    </main>
  );
}

