import { prisma } from "@/lib/prisma";

type AdminAttendeeFilters = {
  eventId?: string;
  query?: string;
};

export async function getHomepageEvents() {
  return prisma.event.findMany({
    include: {
      sessions: {
        orderBy: {
          startsAt: "asc"
        }
      },
      _count: {
        select: {
          tickets: true
        }
      }
    },
    orderBy: {
      startDate: "asc"
    }
  });
}

export async function getEventBySlug(slug: string) {
  return prisma.event.findUnique({
    where: { slug },
    include: {
      sessions: {
        orderBy: {
          startsAt: "asc"
        }
      }
    }
  });
}

export async function getTicketByCode(ticketCode: string) {
  return prisma.ticket.findUnique({
    where: { ticketCode },
    include: {
      event: true,
      session: true,
      user: true,
      checkInLogs: {
        orderBy: {
          checkedInAt: "desc"
        }
      }
    }
  });
}

export async function getTicketsByRegistrationGroup(registrationGroup: string) {
  return prisma.ticket.findMany({
    where: { registrationGroup },
    include: {
      event: true,
      session: true,
      user: true
    },
    orderBy: {
      createdAt: "asc"
    }
  });
}

export async function getEventReminderRecipients(eventId: string) {
  const tickets = await prisma.ticket.findMany({
    where: { eventId },
    include: {
      user: true,
      event: true,
      session: true
    },
    orderBy: {
      createdAt: "asc"
    }
  });

  const grouped = new Map<string, typeof tickets>();

  for (const ticket of tickets) {
    const key = ticket.user.email.toLowerCase();
    const current = grouped.get(key) || [];
    current.push(ticket);
    grouped.set(key, current);
  }

  return Array.from(grouped.values());
}

export async function getAdminDashboardData() {
  const [events, registrationCount, checkInCount] = await Promise.all([
    prisma.event.findMany({
      include: {
        tickets: true,
        sessions: {
          include: {
            _count: {
              select: {
                tickets: true
              }
            }
          },
          orderBy: {
            startsAt: "asc"
          }
        },
        _count: {
          select: {
            tickets: true
          }
        }
      },
      orderBy: {
        startDate: "asc"
      }
    }),
    prisma.ticket.count(),
    prisma.ticket.count({
      where: {
        checkedIn: true
      }
    })
  ]);

  return {
    events,
    registrationCount,
    checkInCount
  };
}

export async function getAdminEventOptions() {
  return prisma.event.findMany({
    select: {
      id: true,
      title: true
    },
    orderBy: {
      startDate: "asc"
    }
  });
}

export async function getAdminAttendees(filters: AdminAttendeeFilters = {}) {
  const query = filters.query?.trim();

  return prisma.ticket.findMany({
    where: {
      ...(filters.eventId ? { eventId: filters.eventId } : {}),
      ...(query
        ? {
            OR: [
              { ticketCode: { contains: query, mode: "insensitive" } },
              { user: { name: { contains: query, mode: "insensitive" } } },
              { user: { email: { contains: query, mode: "insensitive" } } },
              { user: { phone: { contains: query, mode: "insensitive" } } }
            ]
          }
        : {})
    },
    include: {
      user: true,
      event: true,
      session: true
    },
    orderBy: {
      createdAt: "desc"
    },
    take: 100
  });
}
