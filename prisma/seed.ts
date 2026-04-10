import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const slug = "future-of-learning-summit-2026";

  await prisma.checkInLog.deleteMany();
  await prisma.ticket.deleteMany();
  await prisma.session.deleteMany();
  await prisma.event.deleteMany();

  await prisma.event.create({
    data: {
      slug,
      title: "Future of Learning Summit",
      description:
        "A two-day conference exploring digital learning, community building, operational excellence, and modern event experiences.",
      startDate: new Date("2026-05-21T08:00:00.000Z"),
      endDate: new Date("2026-05-22T17:00:00.000Z"),
      sessions: {
        create: [
          {
            title: "Opening Keynote: Building Better Learning Experiences",
            startsAt: new Date("2026-05-21T09:00:00.000Z"),
            capacity: 250
          },
          {
            title: "Designing Inclusive Hybrid Programmes",
            startsAt: new Date("2026-05-21T13:00:00.000Z"),
            capacity: 120
          },
          {
            title: "Operational Analytics for Event Teams",
            startsAt: new Date("2026-05-22T10:00:00.000Z"),
            capacity: 90
          }
        ]
      }
    }
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
