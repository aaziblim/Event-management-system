import type { Metadata } from "next";
import Link from "next/link";
import NextTopLoader from "nextjs-toploader";

import { isAdminAuthenticated } from "@/lib/auth";

import "./globals.css";

export const metadata: Metadata = {
  title: "Event Management Platform",
  description:
    "A modern platform for event publishing, registration, ticketing, reminder emails, and check-in operations."
};

export default async function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const isAdmin = await isAdminAuthenticated();

  return (
    <html lang="en">
      <body>
        <NextTopLoader color="#111111" showSpinner={false} />
        <div className="shell py-6">
          <header className="mb-8 flex flex-col gap-4 rounded-[2rem] border border-black/5 bg-white/70 px-6 py-5 backdrop-blur sm:flex-row sm:items-center sm:justify-between">
            <Link href="/" className="space-y-1">
              <p className="text-xs uppercase tracking-[0.3em] text-black/45">Event Management Platform</p>
              <h1 className="text-xl font-semibold tracking-[-0.03em]">Registration, Ticketing & Check-In</h1>
            </Link>
            <nav className="flex flex-wrap items-center gap-3">
              <Link href="/#events" className="button-secondary border-brass/20 text-brass shadow-sm hover:bg-brass/[0.03]">
                Events
              </Link>
              {isAdmin ? (
                <Link href="/admin" className="button-primary">
                  Dashboard
                </Link>
              ) : null}
            </nav>
          </header>
          {children}
        </div>
      </body>
    </html>
  );
}
