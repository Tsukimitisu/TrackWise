interface ModulePageProps {
  title: string;
  description: string;
}

export default function ModulePage({ title, description }: ModulePageProps) {
  return (
    <section className="rounded-[2rem] border border-white/70 bg-white/80 p-6 shadow-soft backdrop-blur-xl">
      <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Module</p>
      <h1 className="mt-2 text-3xl font-black tracking-tight text-ink-900">{title}</h1>
      <p className="mt-3 max-w-3xl text-slate-600">{description}</p>
    </section>
  );
}
