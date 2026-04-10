import { Resvg } from "@resvg/resvg-js";
import QRCode from "qrcode";

import { formatDateTime, getBaseUrl } from "@/lib/utils";

export function createTicketCode() {
  const suffix = crypto.randomUUID().replace(/-/g, "").slice(0, 10).toUpperCase();
  return `EVT-${suffix}`;
}

export function createRegistrationGroup() {
  return crypto.randomUUID();
}

export function buildTicketUrl(ticketCode: string) {
  return `${getBaseUrl()}/tickets/${ticketCode}`;
}

export function buildTicketDownloadUrl(ticketCode: string) {
  return `${getBaseUrl()}/tickets/${ticketCode}/download`;
}

export async function generateTicketQrCode(ticketCode: string) {
  return QRCode.toDataURL(buildTicketUrl(ticketCode), {
    errorCorrectionLevel: "M",
    margin: 1,
    width: 320
  });
}

function escapeXml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function wrapText(value: string, maxCharsPerLine: number, maxLines: number) {
  const words = value.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;

    if (candidate.length <= maxCharsPerLine) {
      current = candidate;
      continue;
    }

    if (current) {
      lines.push(current);
      current = word;
    } else {
      lines.push(word.slice(0, maxCharsPerLine));
      current = word.slice(maxCharsPerLine);
    }

    if (lines.length === maxLines) {
      break;
    }
  }

  if (lines.length < maxLines && current) {
    lines.push(current);
  }

  if (lines.length > maxLines) {
    return lines.slice(0, maxLines);
  }

  if (lines.length === maxLines && words.join(" ").length > lines.join(" ").length) {
    const lastIndex = lines.length - 1;
    lines[lastIndex] = `${lines[lastIndex].slice(0, Math.max(0, maxCharsPerLine - 1)).trimEnd()}...`;
  }

  return lines;
}

function renderTextBlock(lines: string[], x: number, y: number, fontSize: number, lineHeight: number, color: string, weight = 400) {
  return `
    <text x="${x}" y="${y}" font-size="${fontSize}" font-weight="${weight}" fill="${color}" font-family="Inter, Arial, sans-serif">
      ${lines
        .map((line, index) => `<tspan x="${x}" dy="${index === 0 ? 0 : lineHeight}">${escapeXml(line)}</tspan>`)
        .join("")}
    </text>
  `;
}

function buildTicketSvg(input: {
  ticketCode: string;
  attendeeName: string;
  eventTitle: string;
  accessLabel: string;
  statusLabel: string;
  sessionDateLabel?: string | null;
  qrDataUrl: string;
}) {
  const attendeeLines = wrapText(input.attendeeName, 22, 2);
  const eventLines = wrapText(input.eventTitle, 30, 3);
  const accessLines = wrapText(input.accessLabel, 34, 2);
  const scheduleLines = wrapText(input.sessionDateLabel || "Full event access", 32, 2);
  const statusLines = wrapText(input.statusLabel, 28, 2);
  const urlLines = wrapText(buildTicketUrl(input.ticketCode), 48, 2);

  return `
    <svg width="1600" height="900" viewBox="0 0 1600 900" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="ticketBg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#faf7f1" />
          <stop offset="100%" stop-color="#eef3ef" />
        </linearGradient>
        <linearGradient id="heroBg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#141414" />
          <stop offset="100%" stop-color="#2b3934" />
        </linearGradient>
      </defs>

      <rect width="1600" height="900" fill="url(#ticketBg)" />
      <rect x="48" y="48" width="1504" height="804" rx="40" fill="#ffffff" stroke="#e9e2d7" stroke-width="2" />
      <rect x="48" y="48" width="1070" height="804" rx="40" fill="#ffffff" />
      <rect x="1118" y="48" width="434" height="804" rx="40" fill="url(#heroBg)" />

      <circle cx="1118" cy="252" r="18" fill="url(#ticketBg)" />
      <circle cx="1118" cy="648" r="18" fill="url(#ticketBg)" />
      <line x1="1118" y1="120" x2="1118" y2="780" stroke="#d8cbb9" stroke-width="3" stroke-dasharray="10 14" />

      <text x="124" y="126" font-size="22" letter-spacing="6" fill="#9a6b35" font-family="Inter, Arial, sans-serif">EVENT MANAGEMENT PLATFORM</text>
      <text x="124" y="186" font-size="64" font-weight="700" fill="#111111" font-family="Inter, Arial, sans-serif">Admission Pass</text>
      <text x="124" y="228" font-size="24" fill="#5f5a52" font-family="Inter, Arial, sans-serif">Designed for fast check-in, clear identity, and a calmer arrival experience.</text>

      <rect x="124" y="276" width="198" height="42" rx="21" fill="#f5eee4" />
      <text x="154" y="304" font-size="18" font-weight="600" fill="#8c6030" font-family="Inter, Arial, sans-serif">Verified ticket</text>

      <text x="124" y="384" font-size="18" letter-spacing="3" fill="#7a746c" font-family="Inter, Arial, sans-serif">ATTENDEE</text>
      ${renderTextBlock(attendeeLines, 124, 438, 46, 54, "#111111", 700)}

      <text x="124" y="546" font-size="18" letter-spacing="3" fill="#7a746c" font-family="Inter, Arial, sans-serif">EVENT</text>
      ${renderTextBlock(eventLines, 124, 600, 38, 46, "#111111", 700)}

      <rect x="124" y="676" width="442" height="126" rx="28" fill="#f6f2eb" />
      <text x="156" y="718" font-size="16" letter-spacing="2.4" fill="#7a746c" font-family="Inter, Arial, sans-serif">ACCESS</text>
      ${renderTextBlock(accessLines, 156, 760, 28, 34, "#111111", 600)}

      <rect x="590" y="676" width="496" height="126" rx="28" fill="#eef3ef" />
      <text x="622" y="718" font-size="16" letter-spacing="2.4" fill="#5d6a65" font-family="Inter, Arial, sans-serif">SCHEDULE</text>
      ${renderTextBlock(scheduleLines, 622, 760, 28, 34, "#111111", 600)}

      <text x="1188" y="122" font-size="18" letter-spacing="3" fill="#cbb28f" font-family="Inter, Arial, sans-serif">SCAN TO VALIDATE</text>
      <rect x="1188" y="156" width="294" height="294" rx="32" fill="#ffffff" />
      <image x="1225" y="193" width="220" height="220" href="${input.qrDataUrl}" />

      <text x="1188" y="516" font-size="18" letter-spacing="3" fill="#cbb28f" font-family="Inter, Arial, sans-serif">TICKET ID</text>
      <text x="1188" y="564" font-size="34" font-weight="700" fill="#ffffff" font-family="Inter, Arial, sans-serif">${escapeXml(input.ticketCode)}</text>

      <text x="1188" y="634" font-size="18" letter-spacing="3" fill="#cbb28f" font-family="Inter, Arial, sans-serif">STATUS</text>
      ${renderTextBlock(statusLines, 1188, 682, 28, 34, "#ffffff", 600)}

      <text x="1188" y="764" font-size="16" letter-spacing="2.4" fill="#cbb28f" font-family="Inter, Arial, sans-serif">DIGITAL ACCESS</text>
      ${renderTextBlock(urlLines, 1188, 802, 20, 28, "#f7efe4", 500)}
    </svg>
  `.trim();
}

export async function generateTicketDownloadPng(input: {
  ticketCode: string;
  attendeeName: string;
  eventTitle: string;
  accessLabel: string;
  statusLabel: string;
  sessionDateLabel?: string | null;
}): Promise<Buffer> {
  const qrDataUrl = await QRCode.toDataURL(buildTicketUrl(input.ticketCode), {
    errorCorrectionLevel: "M",
    margin: 1,
    width: 360,
    color: {
      dark: "#111111",
      light: "#ffffff"
    }
  });

  const svg = buildTicketSvg({
    ...input,
    qrDataUrl
  });

  const pngData = new Resvg(svg, {
    fitTo: {
      mode: "width",
      value: 1600
    }
  }).render();

  return pngData.asPng();
}

export function createTicketStatusLabel(input: { checkedIn: boolean; checkedInAt?: Date | null }) {
  if (input.checkedIn && input.checkedInAt) {
    return `Checked in on ${formatDateTime(input.checkedInAt)}`;
  }

  return "Not checked in yet";
}
