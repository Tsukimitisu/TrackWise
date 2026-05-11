import type { ReactNode, TableHTMLAttributes } from 'react';

interface TableProps extends TableHTMLAttributes<HTMLTableElement> {
  hoverable?: boolean;
}

export function Table({ hoverable = true, className = '', ...props }: TableProps) {
  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700">
      <table className={['w-full text-sm', className].filter(Boolean).join(' ')} {...props} />
    </div>
  );
}

interface TableHeadProps extends TableHTMLAttributes<HTMLTableSectionElement> {}

export function TableHead({ className = '', ...props }: TableHeadProps) {
  return <thead className={['bg-slate-50 dark:bg-slate-900/50', className].filter(Boolean).join(' ')} {...props} />;
}

interface TableBodyProps extends TableHTMLAttributes<HTMLTableSectionElement> {}

export function TableBody({ className = '', ...props }: TableBodyProps) {
  return <tbody className={['divide-y divide-slate-200 dark:divide-slate-700', className].filter(Boolean).join(' ')} {...props} />;
}

interface TableRowProps extends TableHTMLAttributes<HTMLTableRowElement> {
  hoverable?: boolean;
}

export function TableRow({ hoverable = true, className = '', ...props }: TableRowProps) {
  return (
    <tr
      className={[
        hoverable ? 'transition-colors duration-200 hover:bg-slate-50 dark:hover:bg-slate-800/50' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...props}
    />
  );
}

interface TableHeaderCellProps extends TableHTMLAttributes<HTMLTableCellElement> {}

export function TableHeaderCell({ className = '', ...props }: TableHeaderCellProps) {
  return <th className={['px-6 py-3 text-left font-semibold text-slate-900 dark:text-slate-100', className].filter(Boolean).join(' ')} {...props} />;
}

interface TableCellProps extends TableHTMLAttributes<HTMLTableCellElement> {}

export function TableCell({ className = '', ...props }: TableCellProps) {
  return <td className={['px-6 py-4 text-slate-600 dark:text-slate-400', className].filter(Boolean).join(' ')} {...props} />;
}
