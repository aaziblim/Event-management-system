"use client";

import { useFormStatus } from "react-dom";

export function FormSubmitButton({
  idleLabel,
  pendingLabel,
  className = "button-primary",
  fullWidth = false
}: {
  idleLabel: string;
  pendingLabel: string;
  className?: string;
  fullWidth?: boolean;
}) {
  const { pending } = useFormStatus();

  return (
    <button type="submit" disabled={pending} className={`${className}${fullWidth ? " w-full" : ""}`}>
      {pending ? pendingLabel : idleLabel}
    </button>
  );
}
