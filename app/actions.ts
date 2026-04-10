"use server";

import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  clearAdminCookie,
  isAllowedAdminEmail,
  isValidAdminAccessCode,
  setAdminCookie
} from "@/lib/auth";
import { getEventReminderRecipients } from "@/lib/data";
import { isMailConfigured, sendTicketEmail } from "@/lib/email";
import { prisma } from "@/lib/prisma";
import { createRegistrationGroup, createTicketCode } from "@/lib/tickets";
import { slugify } from "@/lib/utils";

function getString(formData: FormData, key: string) {
  return String(formData.get(key) || "").trim();
}

function getOptionalString(formData: FormData, key: string) {
  const value = getString(formData, key);
  return value || null;
}

function normalizeTicketInput(value: string) {
  const trimmed = value.trim();

  if (!trimmed) {
    return "";
  }

  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    const parts = trimmed.split("/").filter(Boolean);
    return (parts[parts.length - 1] || "").toUpperCase();
  }

  return trimmed.toUpperCase();
}

function redirectToCheckIn(query: string): never {
  redirect(`/admin/check-in${query}` as any);
}

type TicketEmailBatchResult = {
  configured: boolean;
  attempted: number;
  sent: number;
  failed: number;
};

async function emailTicketsForRecipients(
  recipients: Array<Awaited<ReturnType<typeof getEventReminderRecipients>>[number]>,
  mode: "confirmation" | "reminder",
  customMessage?: string
): Promise<TicketEmailBatchResult> {
  if (!isMailConfigured()) {
    return {
      configured: false,
      attempted: 0,
      sent: 0,
      failed: 0
    };
  }

  let attempted = 0;
  let sent = 0;
  let failed = 0;

  for (const recipientTickets of recipients) {
    if (recipientTickets.length === 0) {
      continue;
    }

    attempted += 1;

    try {
      await sendTicketEmail({
        recipientEmail: recipientTickets[0].user.email,
        recipientName: recipientTickets[0].user.name,
        mode,
        customMessage,
        communityLink: (recipientTickets[0].event as any).communityLink || null,
        tickets: recipientTickets.map((ticket) => ({
          ticketCode: ticket.ticketCode,
          eventTitle: ticket.event.title,
          eventEndDate: ticket.event.endDate,
          sessionTitle: ticket.session?.title || null,
          sessionStartsAt: ticket.session?.startsAt || null
        }))
      });

      sent += 1;
    } catch {
      failed += 1;
    }
  }

  return {
    configured: true,
    attempted,
    sent,
    failed
  };
}

export async function adminLoginAction(formData: FormData) {
  const email = getString(formData, "email").toLowerCase();
  const accessCode = getString(formData, "accessCode");

  if (!email || !isAllowedAdminEmail(email)) {
    redirect("/admin/login?error=unauthorized");
  }

  if (!isValidAdminAccessCode(accessCode)) {
    redirect("/admin/login?error=invalid-code");
  }

  await setAdminCookie(email);
  redirect("/admin");
}

export async function adminLogoutAction() {
  await clearAdminCookie();
  redirect("/admin/login");
}

type SessionInput = {
  title: string;
  startsAt: string;
  capacity: number | null;
};

export async function createEventAction(formData: FormData) {
  const title = getString(formData, "title");
  const description = getString(formData, "description");
  const startDate = getString(formData, "startDate");
  const endDate = getString(formData, "endDate");
  const communityLink = getString(formData, "communityLink") || null;
  const sessionsRaw = getString(formData, "sessions");

  if (!title || !description || !startDate || !endDate) {
    redirect("/admin/events/new?error=missing-fields");
  }

  let sessions: SessionInput[] = [];

  try {
    sessions = JSON.parse(sessionsRaw) as SessionInput[];
  } catch {
    redirect("/admin/events/new?error=invalid-sessions");
  }

  if (!sessions.length) {
    redirect("/admin/events/new?error=no-sessions");
  }

  const slugBase = slugify(title);
  let slug = slugBase;
  let count = 1;

  while (await prisma.event.findUnique({ where: { slug } })) {
    count += 1;
    slug = `${slugBase}-${count}`;
  }

  await prisma.event.create({
    data: {
      slug,
      title,
      description,
      communityLink,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      sessions: {
        create: sessions.map((session) => ({
          title: session.title,
          startsAt: new Date(session.startsAt),
          capacity: session.capacity
        }))
      }
    }
  });

  revalidatePath("/");
  revalidatePath("/admin");
  redirect("/admin");
}

export async function registerAction(formData: FormData) {
  const name = getString(formData, "name");
  const email = getString(formData, "email").toLowerCase();
  const phone = getString(formData, "phone");
  const eventId = getString(formData, "eventId");
  const registrationType = getString(formData, "registrationType");
  const sessionIds = formData.getAll("sessionIds").map((value) => String(value));
  const eventSlug = getString(formData, "eventSlug");

  if (!name || !email || !phone || !eventId) {
    redirect(`/events/${eventSlug}/register?error=missing-fields`);
  }

  const event = await prisma.event.findUnique({
    where: { id: eventId },
    include: {
      sessions: true
    }
  });

  if (!event) {
    redirect("/");
  }

  const wantsFullEvent = registrationType === "event";
  const selectedSessionIds = wantsFullEvent ? [] : Array.from(new Set(sessionIds));

  if (!wantsFullEvent && selectedSessionIds.length === 0) {
    redirect(`/events/${event.slug}/register?error=no-sessions`);
  }

  const validSessions = event.sessions.filter((session) => selectedSessionIds.includes(session.id));

  if (!wantsFullEvent && validSessions.length !== selectedSessionIds.length) {
    redirect(`/events/${event.slug}/register?error=invalid-sessions`);
  }

  const user = await prisma.user.upsert({
    where: { email },
    update: { name, phone },
    create: { email, name, phone }
  });

  const requestedScopes = wantsFullEvent ? ["event"] : validSessions.map((session) => `session:${session.id}`);
  const registrationGroup = createRegistrationGroup();

  try {
    await prisma.$transaction(
      async (tx) => {
        const existingTickets = await tx.ticket.findMany({
          where: {
            userId: user.id,
            eventId
          }
        });

        const hasEventPass = existingTickets.some((ticket) => ticket.registrationScope === "event");
        const hasMatchingSessionTicket = existingTickets.some((ticket) => requestedScopes.includes(ticket.registrationScope));

        if (hasEventPass || hasMatchingSessionTicket || (wantsFullEvent && existingTickets.length > 0)) {
          throw new Error("DUPLICATE_REGISTRATION");
        }

        for (const session of validSessions) {
          if (session.capacity === null) {
            continue;
          }

          const currentCount = await tx.ticket.count({
            where: {
              sessionId: session.id
            }
          });

          if (currentCount >= session.capacity) {
            throw new Error("SESSION_FULL");
          }
        }

        for (const scope of requestedScopes) {
          const sessionId = scope.startsWith("session:") ? scope.replace("session:", "") : null;

          await tx.ticket.create({
            data: {
              ticketCode: createTicketCode(),
              registrationGroup,
              registrationScope: scope,
              userId: user.id,
              eventId,
              sessionId
            }
          });
        }
      },
      {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable
      }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "";

    if (message === "DUPLICATE_REGISTRATION") {
      redirect(`/events/${event.slug}/register?error=duplicate`);
    }

    if (message === "SESSION_FULL") {
      redirect(`/events/${event.slug}/register?error=capacity`);
    }

    redirect(`/events/${event.slug}/register?error=retry`);
  }

  let emailStatus = "pending";

  try {
    const recipients = await getEventReminderRecipients(eventId);
    const recipient = recipients.find((group) => group[0]?.user.email.toLowerCase() === email);
    const emailResult = recipient ? await emailTicketsForRecipients([recipient], "confirmation") : null;

    if (!emailResult) {
      emailStatus = "failed";
    } else if (!emailResult.configured) {
      emailStatus = "unavailable";
    } else if (emailResult.sent > 0) {
      emailStatus = "sent";
    } else {
      emailStatus = "failed";
    }
  } catch {
    emailStatus = "failed";
  }

  revalidatePath("/");
  revalidatePath(`/events/${event.slug}`);
  revalidatePath("/admin");
  redirect(`/tickets/group/${registrationGroup}?email=${emailStatus}`);
}

export async function sendReminderEmailsAction(formData: FormData) {
  const eventId = getString(formData, "eventId");
  const customMessage = getOptionalString(formData, "customMessage");

  if (!eventId) {
    redirect("/admin?reminder=missing");
  }

  const recipients = await getEventReminderRecipients(eventId);

  if (recipients.length === 0) {
    redirect(`/admin?reminder=empty&eventId=${eventId}`);
  }

  const emailResult = await emailTicketsForRecipients(recipients, "reminder", customMessage ?? undefined);

  if (!emailResult.configured) {
    redirect(`/admin?reminder=unavailable&eventId=${eventId}`);
  }

  if (emailResult.sent === emailResult.attempted) {
    redirect(`/admin?reminder=sent&eventId=${eventId}&sentCount=${emailResult.sent}`);
  }

  if (emailResult.sent > 0) {
    redirect(`/admin?reminder=partial&eventId=${eventId}&sentCount=${emailResult.sent}&failedCount=${emailResult.failed}`);
  }

  redirect(`/admin?reminder=failed&eventId=${eventId}`);
}

export async function checkInAction(formData: FormData) {
  const ticketCode = normalizeTicketInput(getString(formData, "ticketCode"));
  const eventId = getOptionalString(formData, "eventId");

  if (!ticketCode) {
    redirectToCheckIn(eventId ? `?eventId=${eventId}&error=missing-ticket` : "?error=missing-ticket");
  }

  const ticket = await prisma.ticket.findUnique({
    where: { ticketCode },
    include: { event: true }
  });

  if (!ticket) {
    redirectToCheckIn(eventId ? `?eventId=${eventId}&error=not-found` : "?error=not-found");
  }

  if (eventId && ticket.eventId !== eventId) {
    redirectToCheckIn(`?eventId=${eventId}&error=wrong-event`);
  }

  if (ticket.checkedIn) {
    redirectToCheckIn(eventId ? `?eventId=${ticket.eventId}&error=duplicate-scan` : "?error=duplicate-scan");
  }

  await prisma.ticket.update({
    where: { id: ticket.id },
    data: {
      checkedIn: true,
      checkedInAt: new Date(),
      checkInLogs: {
        create: { source: "manual" }
      }
    }
  });

  revalidatePath("/admin");
  revalidatePath("/admin/check-in");
  revalidatePath(`/tickets/${ticket.ticketCode}`);
  redirectToCheckIn(`?eventId=${ticket.eventId}&success=${ticket.ticketCode}`);
}
