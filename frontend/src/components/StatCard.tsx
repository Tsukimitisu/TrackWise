import Surface from './ui/Surface';

interface StatCardProps {
  label: string;
  value: string;
  detail?: string;
}

export default function StatCard({ label, value, detail }: StatCardProps) {
  return (
    <Surface className="group overflow-hidden p-5 transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(59,130,246,0.12)]">
      <div className="mb-4 h-1.5 w-16 rounded-full bg-gradient-to-r from-indigo-500 via-cyan-500 to-emerald-400" />
      <div className="text-sm font-semibold text-slate-500 dark:text-slate-400">{label}</div>
      <div className="mt-2 text-3xl font-black tracking-tight text-slate-900 dark:text-slate-50">{value}</div>
      {detail ? <div className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">{detail}</div> : null}
    </Surface>
  );
}
