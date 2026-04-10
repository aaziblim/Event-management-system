import { notFound } from "next/navigation";
import { NextResponse } from "next/server";

import { getTicketByCode } from "@/lib/data";
import { createTicketStatusLabel, generateTicketDownloadPng } from "@/lib/tickets";
import { formatDateTime } from "@/lib/utils";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ ticketCode: string }> }
) {
  const { ticketCode } = await params;
  const ticket = await getTicketByCode(ticketCode);

  if (!ticket) {
    notFound();
  }

  const fileContent = await generateTicketDownloadPng({
    ticketCode: ticket.ticketCode,
    attendeeName: ticket.user.name,
    eventTitle: ticket.event.title,
    accessLabel: ticket.session ? ticket.session.title : "Full event access",
    sessionDateLabel: ticket.session ? formatDateTime(ticket.session.startsAt) : null,
    statusLabel: createTicketStatusLabel({
      checkedIn: ticket.checkedIn,
      checkedInAt: ticket.checkedInAt
    })
  });

  return new NextResponse(new Uint8Array(fileContent), {
    headers: {
      "Content-Type": "image/png",
      "Content-Disposition": `attachment; filename="${ticket.ticketCode}.png"`
    }
  });
}
