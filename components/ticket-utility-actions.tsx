"use client";

type TicketUtilityActionsProps = {
  ticketUrl: string;
  downloadUrl: string;
};

export function TicketUtilityActions({ ticketUrl, downloadUrl }: TicketUtilityActionsProps) {
  async function copyLink() {
    try {
      await navigator.clipboard.writeText(ticketUrl);
    } catch {
      window.prompt("Copy ticket link", ticketUrl);
    }
  }

  return (
    <div className="actions-row">
      <a href={downloadUrl} className="button-primary" download>
        Download ticket
      </a>
      <button type="button" onClick={copyLink} className="button-secondary">
        Copy ticket link
      </button>
    </div>
  );
}
