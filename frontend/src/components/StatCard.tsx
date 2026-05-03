interface StatCardProps {
  label: string;
  value: string;
  detail?: string;
}

export default function StatCard({ label, value, detail }: StatCardProps) {
  return (
    <article className="rounded-3xl border border-white/70 bg-white/80 p-5 shadow-soft backdrop-blur-xl">
      <div className="text-sm font-medium text-slate-500">{label}</div>
      <div className="mt-2 text-3xl font-black tracking-tight text-ink-900">{value}</div>
      {detail ? <div className="mt-2 text-sm text-slate-500">{detail}</div> : null}
    </article>
  );
}
