import Link from "next/link";

import { AdminCheckInForm } from "@/components/admin-check-in-form";
import { requireAdmin } from "@/lib/auth";
import { getAdminDashboardData, getAdminEventOptions } from "@/lib/data";

const errorCopy: Record<string, string> = {
  "missing-ticket": "Enter a ticket ID before checking in an attendee.",
  "not-found": "No ticket matched that code.",
  "wrong-event": "That ticket belongs to a different event.",
  "duplicate-scan": "This ticket has already been checked in."
};

export default async function CheckInPage({
  searchParams
}: {
  searchParams: Promise<{ error?: string; success?: string; eventId?: string; ticketCode?: string }>;
}) {
  await requireAdmin();
  const { error, success, eventId, ticketCode } = await searchParams;
  const [eventOptions, dashboard] = await Promise.all([getAdminEventOptions(), getAdminDashboardData()]);
  const focusedEvent = dashboard.events.find((event) => event.id === eventId) || dashboard.events[0] || null;

  return (
    <main className="grid gap-8 pb-12 lg:grid-cols-[0.95fr_1.05fr]">
      <section className="space-y-6">
        <div>
          <Link href="/admin" className="text-sm text-black/55 hover:text-black">
            Back to dashboard
          </Link>
          <p className="mt-4 text-xs uppercase tracking-[0.28em] text-brass">Check-in desk</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-[-0.05em] sm:text-4xl">Confirm attendance quickly</h2>
        </div>

        <AdminCheckInForm
          events={eventOptions}
          defaultEventId={focusedEvent?.id || ""}
          defaultTicketCode={ticketCode}
          error={error ? errorCopy[error] || "We could not complete check-in. Please try again." : undefined}
          success={success ? `Ticket ${success} has been checked in.` : undefined}
        />
      </section>

      <section className="space-y-4">
        {focusedEvent ? (
          <>
            <div className="panel p-6 sm:p-8">
              <p className="text-sm uppercase tracking-[0.22em] text-black/45">Selected event</p>
              <h3 className="mt-2 text-2xl font-semibold tracking-[-0.04em] sm:text-3xl">{focusedEvent.title}</h3>
              <p className="mt-3 text-black/62">{focusedEvent.description}</p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="stat-card">
                <p className="muted">Registrations</p>
                <p className="mt-2 text-3xl font-semibold">{focusedEvent._count.tickets}</p>
              </div>
              <div className="stat-card">
                <p className="muted">Checked in</p>
                <p className="mt-2 text-3xl font-semibold">
                  {focusedEvent.tickets.filter((ticket) => ticket.checkedIn).length}
                </p>
              </div>
            </div>

            <div className="table-shell">
              <table className="table-base">
                <thead className="table-head">
                  <tr>
                    <th className="table-cell font-medium">Session</th>
                    <th className="table-cell font-medium">Registrations</th>
                    <th className="table-cell font-medium">Capacity</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/8 bg-white">
                  {focusedEvent.sessions.map((session) => (
                    <tr key={session.id}>
                      <td className="table-cell font-medium">{session.title}</td>
                      <td className="table-cell text-black/60">{session._count.tickets}</td>
                      <td className="table-cell text-black/60">{session.capacity ?? "Open"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <div className="panel p-8">
            <h3 className="text-2xl font-semibold">No events available</h3>
            <p className="mt-3 text-black/62">Create an event before opening the check-in desk.</p>
          </div>
        )}
      </section>
    </main>
  );
}
