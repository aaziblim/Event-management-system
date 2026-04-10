export const dynamic = "force-dynamic";

import Link from "next/link";
import { notFound } from "next/navigation";

import { getTicketsByRegistrationGroup } from "@/lib/data";
import { buildTicketDownloadUrl } from "@/lib/tickets";
import { formatDateTime } from "@/lib/utils";

const emailCopy: Record<string, string> = {
  sent: "A copy of your ticket has also been sent to your email address.",
  unavailable: "Your ticket is ready below. Email delivery is not configured yet, so keep this page or download the ticket now.",
  failed: "Your registration is confirmed. We could not send the ticket email, but your ticket is ready below.",
  pending: "Your registration is confirmed and your ticket is ready below."
};

const emailTone: Record<string, "alert-success" | "alert-error"> = {
  sent: "alert-success",
  unavailable: "alert-error",
  failed: "alert-error",
  pending: "alert-success"
};

export default async function TicketGroupPage({
  params,
  searchParams
}: {
  params: Promise<{ registrationGroup: string }>;
  searchParams: Promise<{ email?: string }>;
}) {
  const { registrationGroup } = await params;
  const { email } = await searchParams;
  const tickets = await getTicketsByRegistrationGroup(registrationGroup);

  if (!tickets.length) {
    notFound();
  }

  const primary = tickets[0];
  const emailMessage = email ? emailCopy[email] || emailCopy.pending : null;
  const emailClass = email ? emailTone[email] || "alert-success" : null;

  return (
    <main className="space-y-8 pb-12">
      <section className="panel p-8 sm:p-10">
        <p className="text-xs uppercase tracking-[0.3em] text-brass">Registration confirmed</p>
        <h2 className="mt-3 text-4xl font-semibold tracking-[-0.05em]">Your ticket is ready</h2>
        <p className="mt-4 max-w-2xl text-black/66">
          {primary.user.name}, you are successfully registered for {primary.event.title}. Use the ticket below at check-in.
        </p>
        {emailMessage && emailClass ? <div className={`${emailClass} mt-6`}>{emailMessage}</div> : null}

        {primary.event.communityLink && (
          <div className="mt-8 flex flex-col items-start justify-between gap-5 rounded-[1.5rem] border border-amber-100 bg-amber-50 p-6 sm:flex-row sm:items-center">
            <div>
              <p className="mb-1 font-semibold text-amber-800">Stay connected</p>
              <p className="max-w-lg text-sm text-amber-700/80">
                Join the official event channel for updates, directions, and important event-day information.
              </p>
            </div>
            <a
              href={primary.event.communityLink}
              target="_blank"
              rel="noopener noreferrer"
              className="button-primary whitespace-nowrap bg-amber-600 text-white hover:bg-amber-700"
            >
              Join the channel
            </a>
          </div>
        )}
      </section>

      <section className="grid gap-4">
        {tickets.map((ticket) => (
          <article key={ticket.id} className="panel flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-black/40">{ticket.ticketCode}</p>
              <h3 className="mt-2 text-2xl font-semibold tracking-[-0.03em]">
                {ticket.session ? ticket.session.title : `${ticket.event.title} pass`}
              </h3>
              <p className="mt-2 text-black/60">
                {ticket.session ? formatDateTime(ticket.session.startsAt) : `${ticket.event.title} full event access`}
              </p>
            </div>
            <div className="actions-row sm:justify-end">
              <a href={buildTicketDownloadUrl(ticket.ticketCode)} className="button-secondary" download>
                Download ticket
              </a>
              <Link href={`/tickets/${ticket.ticketCode}`} className="button-primary">
                Open ticket
              </Link>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
