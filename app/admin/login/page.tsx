import { AdminLoginForm } from "@/components/admin-login-form";
import { isAdminAccessCodeConfigured } from "@/lib/auth";

const errorCopy: Record<string, string> = {
  unauthorized: "This email is not listed in ADMIN_EMAILS. Update your environment variables to allow access.",
  "invalid-code": "The admin access code is incorrect."
};

export default async function AdminLoginPage({
  searchParams
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const hasAccessCode = isAdminAccessCodeConfigured();

  return (
    <main className="mx-auto max-w-xl pb-12">
      <section className="panel p-8 sm:p-10">
        <p className="text-xs uppercase tracking-[0.3em] text-brass">Admin access</p>
        <h2 className="mt-3 text-4xl font-semibold tracking-[-0.05em]">Sign in with your admin email</h2>
        <p className="mt-4 text-black/66">
          Admin sessions are now signed and can also require a shared access code for the event operations team.
        </p>

        {error ? <div className="alert-error mt-6">{errorCopy[error] || "We could not sign you in."}</div> : null}

        <AdminLoginForm hasAccessCode={hasAccessCode} />
      </section>
    </main>
  );
}
