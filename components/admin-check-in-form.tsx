"use client";

import { useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import jsQR from "jsqr";

import { checkInAction } from "@/app/actions";

type AdminCheckInFormProps = {
  events: Array<{ id: string; title: string }>;
  defaultEventId: string;
  defaultTicketCode?: string;
  error?: string;
  success?: string;
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="button-primary">
      {pending ? "Processing..." : "Mark as checked in"}
    </button>
  );
}

export function AdminCheckInForm({
  events,
  defaultEventId,
  defaultTicketCode = "",
  error,
  success
}: AdminCheckInFormProps) {
  const [ticketCode, setTicketCode] = useState(defaultTicketCode);
  const [scannerOpen, setScannerOpen] = useState(false);
  const [scannerMessage, setScannerMessage] = useState("Open the camera to scan a QR code.");
  const [eventId, setEventId] = useState(defaultEventId);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const frameRef = useRef<number | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    return () => {
      stopScanner();
    };
  }, []);

  function stopScanner() {
    if (frameRef.current) {
      cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    }

    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setScannerOpen(false);
  }

  function scanLoop() {
    const video = videoRef.current;

    if (!video || video.readyState !== video.HAVE_ENOUGH_DATA) {
      if (streamRef.current) {
        frameRef.current = requestAnimationFrame(scanLoop);
      }
      return;
    }

    if (!canvasRef.current) {
      canvasRef.current = document.createElement("canvas");
    }

    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext("2d", { willReadFrequently: true });

    if (context) {
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
      
      const code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: "dontInvert",
      });

      if (code?.data) {
        setTicketCode(code.data);
        setScannerMessage("QR code captured. You can submit the check-in now.");
        stopScanner();
        
        // Explicitly set scannerOpen back to false without destroying streams, wait, stopScanner already does this.
        return;
      }
    }

    frameRef.current = requestAnimationFrame(scanLoop);
  }

  async function startScanner() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: {
            ideal: "environment"
          }
        },
        audio: false
      });

      streamRef.current = stream;
      setScannerOpen(true);
      setScannerMessage("Scanning for a QR code...");

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      frameRef.current = requestAnimationFrame(scanLoop);
    } catch {
      setScannerMessage("Camera access was blocked. You can still paste the ticket code manually.");
      stopScanner();
    }
  }

  return (
    <form action={checkInAction} className="panel space-y-5 p-6 sm:p-8">
      <div>
        <label htmlFor="eventId" className="label">
          Event
        </label>
        <select id="eventId" name="eventId" value={eventId} onChange={(event) => setEventId(event.target.value)} className="input">
          {events.map((event) => (
            <option key={event.id} value={event.id}>
              {event.title}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="ticketCode" className="label">
          Ticket ID or scanned QR payload
        </label>
        <input
          id="ticketCode"
          name="ticketCode"
          className="input"
          placeholder="EVT-ABC123DEF4"
          autoCapitalize="characters"
          value={ticketCode}
          onChange={(event) => setTicketCode(event.target.value)}
          required
        />
        <p className="mt-2 text-sm text-black/50">You can paste a ticket ID, paste a ticket URL, or scan the QR code live.</p>
      </div>

      <div className="surface-soft space-y-3">
        <div className="inline-meta gap-3">
          <div>
            <p className="text-sm font-medium text-black/70">QR scanner</p>
            <p className="muted">{scannerMessage}</p>
          </div>
          <div className="actions-row sm:justify-end">
            <button type="button" onClick={startScanner} className="button-secondary">
              Open camera
            </button>
            {scannerOpen ? (
              <button type="button" onClick={stopScanner} className="button-secondary">
                Stop
              </button>
            ) : null}
          </div>
        </div>
        {scannerOpen ? <video ref={videoRef} className="w-full rounded-[1.5rem] bg-black" muted playsInline /> : null}
      </div>

      {error ? <div className="alert-error">{error}</div> : null}
      {success ? <div className="alert-success">{success}</div> : null}

      <SubmitButton />
    </form>
  );
}


