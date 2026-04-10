"use client";

import { adminLoginAction } from "@/app/actions";
import { FormSubmitButton } from "@/components/form-submit-button";

export function AdminLoginForm({ hasAccessCode }: { hasAccessCode: boolean }) {
  return (
    <form action={adminLoginAction} className="mt-8 space-y-5">
      <div>
        <label htmlFor="email" className="label">
          Admin email
        </label>
        <input id="email" name="email" type="email" className="input" placeholder="admin@example.com" required />
      </div>
      <div>
        <label htmlFor="accessCode" className="label">
          Access code
        </label>
        <input
          id="accessCode"
          name="accessCode"
          type="password"
          className="input"
          placeholder={hasAccessCode ? "Enter admin access code" : "No access code configured yet"}
          required={hasAccessCode}
        />
      </div>
      <FormSubmitButton idleLabel="Continue to dashboard" pendingLabel="Signing in..." />
    </form>
  );
}
