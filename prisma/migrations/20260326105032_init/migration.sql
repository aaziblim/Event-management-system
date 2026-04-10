-- CreateTable
CREATE TABLE "Event" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "startsAt" TIMESTAMP(3) NOT NULL,
    "capacity" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Ticket" (
    "id" TEXT NOT NULL,
    "ticketCode" TEXT NOT NULL,
    "registrationGroup" TEXT NOT NULL,
    "registrationScope" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "sessionId" TEXT,
    "checkedIn" BOOLEAN NOT NULL DEFAULT false,
    "checkedInAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Ticket_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CheckInLog" (
    "id" TEXT NOT NULL,
    "ticketId" TEXT NOT NULL,
    "checkedInAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "source" TEXT NOT NULL DEFAULT 'manual',

    CONSTRAINT "CheckInLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Event_slug_key" ON "Event"("slug");

-- CreateIndex
CREATE INDEX "Session_eventId_startsAt_idx" ON "Session"("eventId", "startsAt");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Ticket_ticketCode_key" ON "Ticket"("ticketCode");

-- CreateIndex
CREATE INDEX "Ticket_eventId_checkedIn_idx" ON "Ticket"("eventId", "checkedIn");

-- CreateIndex
CREATE INDEX "Ticket_sessionId_checkedIn_idx" ON "Ticket"("sessionId", "checkedIn");

-- CreateIndex
CREATE UNIQUE INDEX "Ticket_userId_eventId_registrationScope_key" ON "Ticket"("userId", "eventId", "registrationScope");

-- CreateIndex
CREATE INDEX "CheckInLog_ticketId_checkedInAt_idx" ON "CheckInLog"("ticketId", "checkedInAt");

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CheckInLog" ADD CONSTRAINT "CheckInLog_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "Ticket"("id") ON DELETE CASCADE ON UPDATE CASCADE;
