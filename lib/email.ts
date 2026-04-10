import nodemailer from "nodemailer";

import { buildTicketUrl } from "@/lib/tickets";
import { formatDateTime } from "@/lib/utils";

type TicketEmailTicket = {
  ticketCode: string;
  eventTitle: string;
  eventEndDate: Date;
  sessionTitle: string | null;
  sessionStartsAt: Date | null;
};

type TicketEmailPayload = {
  recipientEmail: string;
  recipientName: string;
  tickets: TicketEmailTicket[];
  mode: "confirmation" | "reminder";
  customMessage?: string;
  communityLink?: string | null;
};

function getMailerConfig() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || "587");
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.SMTP_FROM;
  const secure = process.env.SMTP_SECURE === "true";

  return {
    host,
    port,
    user,
    pass,
    from,
    secure
  };
}

export function isMailConfigured() {
  const config = getMailerConfig();
  return Boolean(config.host && config.port && config.user && config.pass && config.from);
}

function createTransporter() {
  const config = getMailerConfig();

  if (!isMailConfigured()) {
    throw new Error("MAIL_NOT_CONFIGURED");
  }

  return nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: {
      user: config.user,
      pass: config.pass
    }
  });
}

function createSubject(mode: "confirmation" | "reminder", eventTitle?: string) {
  if (mode === "confirmation") {
    return eventTitle ? `Your ticket for ${eventTitle}` : "Your event ticket";
  }

  return eventTitle ? `Reminder: your ticket for ${eventTitle}` : "Reminder: your event ticket";
}

function createIntro(mode: "confirmation" | "reminder") {
  if (mode === "confirmation") {
    return "Your registration is confirmed. Your ticket links are below.";
  }

  return "This is a reminder for your upcoming event. Your ticket links are below.";
}

function createHtml({ recipientName, tickets, mode, customMessage, communityLink }: TicketEmailPayload) {
  const intro = createIntro(mode);
  const customMessageHtml = customMessage
    ? `<div style="margin-bottom:24px;padding:16px;background:#fff9f0;border-left:4px solid #a46f2c;border-radius:8px;font-style:italic;color:#4b5563;">${customMessage.replace(/\n/g, "<br>")}</div>`
    : "";

  const ticketBlocks = tickets
    .map((ticket) => {
      const label = ticket.sessionTitle || `${ticket.eventTitle} full event access`;
      const dateLabel = ticket.sessionStartsAt
        ? formatDateTime(ticket.sessionStartsAt)
        : `Available until ${formatDateTime(ticket.eventEndDate)}`;
      const url = buildTicketUrl(ticket.ticketCode);

      return `
        <div style="padding:16px;border:1px solid #e5e7eb;border-radius:18px;background:#ffffff;margin-bottom:12px;">
          <div style="font-size:12px;letter-spacing:0.12em;text-transform:uppercase;color:#8b7355;">${ticket.ticketCode}</div>
          <div style="font-size:18px;font-weight:600;color:#111111;margin-top:8px;">${label}</div>
          <div style="font-size:14px;color:#4b5563;margin-top:6px;">${dateLabel}</div>
          <div style="margin-top:14px;">
            <a href="${url}" style="display:inline-block;padding:12px 18px;background:#111111;color:#ffffff;border-radius:999px;text-decoration:none;font-weight:600;">Open ticket</a>
          </div>
        </div>
      `;
    })
    .join("");

  return `
    <div style="font-family:Arial,sans-serif;background:#f6f1e8;padding:32px;color:#111111;">
      <div style="max-width:640px;margin:0 auto;background:#fcfaf6;border-radius:28px;padding:32px;border:1px solid rgba(17,17,17,0.06);">
        <div style="font-size:12px;letter-spacing:0.3em;text-transform:uppercase;color:#a46f2c;">EVENT MANAGEMENT PLATFORM</div>
        <h1 style="font-size:32px;line-height:1.1;margin:16px 0 12px;">Hello ${recipientName},</h1>
        <p style="font-size:16px;line-height:1.7;color:#374151;margin:0 0 24px;">${intro}</p>
        ${customMessageHtml}
        ${
          communityLink
            ? `<div style="background-color:#fffbeb;border:1px solid #fef3c7;padding:24px;border-radius:16px;margin:24px 0 32px;">
                 <p style="margin:0 0 8px;font-weight:bold;color:#92400e;">Join the official event channel</p>
                 <p style="margin:0 0 16px;color:#b45309;font-size:14px;line-height:1.6;">Stay up to date with event-day changes, updates, and shared resources.</p>
                 <a href="${communityLink}" style="display:inline-block;padding:10px 20px;background:#d97706;color:#ffffff;text-decoration:none;border-radius:8px;font-weight:600;font-size:14px;">Join the channel</a>
               </div>`
            : ""
        }
        ${ticketBlocks}
        <p style="font-size:14px;line-height:1.7;color:#6b7280;margin-top:20px;">Keep this email so you can reopen your tickets later, even if you do not download them right away.</p>
      </div>
    </div>
  `;
}

function createText({ recipientName, tickets, mode, customMessage, communityLink }: TicketEmailPayload) {
  const intro = createIntro(mode);

  return [
    `Hello ${recipientName},`,
    "",
    intro,
    "",
    ...(customMessage ? [customMessage, ""] : []),
    ...(communityLink ? ["Join the official event channel for updates:", communityLink, ""] : []),
    ...tickets.flatMap((ticket) => {
      const label = ticket.sessionTitle || `${ticket.eventTitle} full event access`;
      const dateLabel = ticket.sessionStartsAt
        ? formatDateTime(ticket.sessionStartsAt)
        : `Available until ${formatDateTime(ticket.eventEndDate)}`;

      return [`${ticket.ticketCode} - ${label}`, dateLabel, buildTicketUrl(ticket.ticketCode), ""];
    })
  ].join("\n");
}

export async function sendTicketEmail(payload: TicketEmailPayload) {
  const transporter = createTransporter();
  const subject = createSubject(payload.mode, payload.tickets[0]?.eventTitle);
  const config = getMailerConfig();

  await transporter.sendMail({
    from: config.from,
    to: payload.recipientEmail,
    subject,
    html: createHtml(payload),
    text: createText(payload)
  });
}
