import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/auth";
import { getAdminAttendees } from "@/lib/data";

function csvEscape(value: string) {
  return `"${value.replaceAll('"', '""')}"`;
}

export async function GET(request: Request) {
  await requireAdmin();

  const { searchParams } = new URL(request.url);
  const eventId = searchParams.get("eventId") || undefined;
  const query = searchParams.get("q") || undefined;
  const attendees = await getAdminAttendees({ eventId, query });

  const rows = [
    ["Ticket Code", "Name", "Email", "Phone", "Event", "Session", "Checked In", "Checked In At"],
    ...attendees.map((ticket) => [
      ticket.ticketCode,
      ticket.user.name,
      ticket.user.email,
      ticket.user.phone,
      ticket.event.title,
      ticket.session?.title || "Full event access",
      ticket.checkedIn ? "Yes" : "No",
      ticket.checkedInAt?.toISOString() || ""
    ])
  ];

  const csv = rows.map((row) => row.map((cell) => csvEscape(String(cell))).join(",")).join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": "attachment; filename=attendees-export.csv"
    }
  });
}
