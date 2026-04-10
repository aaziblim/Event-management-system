export const dynamic = "force-dynamic";

import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { TicketUtilityActions } from "@/components/ticket-utility-actions";
import { getTicketByCode } from "@/lib/data";
import { buildTicketDownloadUrl, buildTicketUrl, createTicketStatusLabel, generateTicketQrCode } from "@/lib/tickets";
import { formatDateTime } from "@/lib/utils";

export default async function TicketPage({ params }: { params: Promise<{ ticketCode: string }> }) {
  const { ticketCode } = await params;
  const ticket = await getTicketByCode(ticketCode);

  if (!ticket) {
    notFound();
  }

  const qrCode = await generateTicketQrCode(ticket.ticketCode);
  const statusLabel = createTicketStatusLabel({ checkedIn: ticket.checkedIn, checkedInAt: ticket.checkedInAt });
  const accessLabel = ticket.session ? ticket.session.title : "Full event access";
  const scheduleLabel = ticket.session ? formatDateTime(ticket.session.startsAt) : "Access valid for the full event";

  return (
    <main className="mx-auto max-w-6xl space-y-8 pb-12">
      <section className="print-hidden space-y-3">
        <p className="text-xs uppercase tracking-[0.3em] text-brass">Digital ticket</p>
        <h2 className="text-3xl font-semibold tracking-[-0.05em] sm:text-4xl">Your admission pass is ready</h2>
        <p className="max-w-3xl text-black/62">
          Download the ticket for offline access, or copy the secure ticket link to reopen it later from any device.
        </p>
      </section>

      <section className="ticket-print-shell panel overflow-hidden">
        <div className="grid lg:grid-cols-[1.6fr_0.9fr]">
          <div className="space-y-8 p-6 sm:p-8 lg:p-10">
            <div className="space-y-4">
              <div className="inline-flex items-center rounded-full border border-brass/20 bg-brass/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-brass">
                Event Management Platform
              </div>
              <div>
                <p className="text-sm uppercase tracking-[0.24em] text-black/40">Verified admission pass</p>
                <h3 className="mt-3 text-3xl font-semibold tracking-[-0.05em] text-black sm:text-5xl">{ticket.user.name}</h3>
              </div>
              <p className="max-w-2xl text-base leading-7 text-black/62">
                Present this ticket at check-in. The QR code and ticket ID both point to the same validated record.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-[1.75rem] bg-[#f6f2eb] p-5 sm:p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-black/45">Event</p>
                <p className="mt-3 break-words text-2xl font-semibold tracking-[-0.04em] text-black">{ticket.event.title}</p>
              </div>
              <div className="rounded-[1.75rem] bg-[#eef3ef] p-5 sm:p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-black/45">Access</p>
                <p className="mt-3 break-words text-2xl font-semibold tracking-[-0.04em] text-black">{accessLabel}</p>
              </div>
              <div className="rounded-[1.75rem] border border-black/8 bg-white p-5 sm:p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-black/45">Schedule</p>
                <p className="mt-3 text-xl font-semibold tracking-[-0.03em] text-black">{scheduleLabel}</p>
              </div>
              <div className="rounded-[1.75rem] border border-black/8 bg-white p-5 sm:p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-black/45">Status</p>
                <p className="mt-3 text-xl font-semibold tracking-[-0.03em] text-black">{statusLabel}</p>
              </div>
            </div>

            <div className="rounded-[1.75rem] border border-dashed border-black/15 bg-white p-5 sm:p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-black/45">Ticket ID</p>
                  <p className="mt-3 break-all text-2xl font-semibold tracking-[0.02em] text-black">{ticket.ticketCode}</p>
                </div>
                <div className="text-sm leading-6 text-black/55 sm:max-w-xs sm:text-right">
                  If scanning is unavailable, the check-in desk can validate this ID manually.
                </div>
              </div>
            </div>
          </div>

          <div className="relative overflow-hidden bg-[#151515] px-6 py-8 text-white sm:px-8 sm:py-10 lg:min-h-full">
            <div className="absolute inset-y-10 left-0 hidden w-px border-l border-dashed border-white/20 lg:block" />
            <div className="space-y-6 lg:pl-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#d1b48a]">Scan to validate</p>
                <p className="mt-3 text-sm leading-6 text-white/72">
                  Use this QR code for fast entry. You can also reopen this same ticket later from its digital link.
                </p>
              </div>

              <div className="rounded-[2rem] bg-white p-4 sm:p-5">
                <Image
                  src={qrCode}
                  alt={`QR code for ticket ${ticket.ticketCode}`}
                  width={320}
                  height={320}
                  className="mx-auto h-auto w-full max-w-[280px] rounded-[1.5rem]"
                  unoptimized
                />
              </div>

              <div className="rounded-[1.5rem] bg-white/6 p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#d1b48a]">Digital link</p>
                <p className="mt-3 break-all text-sm leading-6 text-white/80">{buildTicketUrl(ticket.ticketCode)}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="print-hidden space-y-5">
        <TicketUtilityActions ticketUrl={buildTicketUrl(ticket.ticketCode)} downloadUrl={buildTicketDownloadUrl(ticket.ticketCode)} />

        <div className="actions-row">
          <Link href="/admin/check-in" className="button-secondary">
            Open check-in desk
          </Link>
        </div>
      </section>
    </main>
  );
}

