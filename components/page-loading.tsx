export function PageLoading({ title = "Loading page" }: { title?: string }) {
  return (
    <main className="space-y-8 pb-12 animate-pulse">
      <section className="panel p-6 sm:p-8 lg:p-10">
        <div className="h-3 w-40 rounded-full bg-black/10" />
        <div className="mt-5 h-10 w-3/4 rounded-full bg-black/10" />
        <div className="mt-4 h-4 w-full rounded-full bg-black/10" />
        <div className="mt-3 h-4 w-5/6 rounded-full bg-black/10" />
        <p className="mt-6 text-sm text-black/45">{title}</p>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <div className="panel p-6 sm:p-8">
          <div className="h-5 w-40 rounded-full bg-black/10" />
          <div className="mt-6 space-y-3">
            <div className="h-16 rounded-[1.5rem] bg-black/5" />
            <div className="h-16 rounded-[1.5rem] bg-black/5" />
            <div className="h-16 rounded-[1.5rem] bg-black/5" />
          </div>
        </div>
        <div className="panel p-6 sm:p-8">
          <div className="h-5 w-32 rounded-full bg-black/10" />
          <div className="mt-6 h-64 rounded-[1.5rem] bg-black/5" />
        </div>
      </section>
    </main>
  );
}
