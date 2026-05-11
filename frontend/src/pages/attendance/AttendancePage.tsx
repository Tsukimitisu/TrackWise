import { useEffect, useState } from 'react';
import client from '../../api/client';
import PageHeader from '../../components/ui/PageHeader';
import Badge from '../../components/ui/Badge';
import { Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow } from '../../components/ui/Table';

interface AttendanceLogItem {
  id: number;
  date: string;
  time_in: string | null;
  time_out: string | null;
  total_hours: number;
  status: string;
  approval_status: string;
  userProgram?: {
    id: number;
    program?: { name: string };
  };
}

export default function AttendancePage() {
  const [logs, setLogs] = useState<AttendanceLogItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadLogs = async () => {
      try {
        const response = await client.get('/attendance-logs');
        setLogs(response.data.data ?? []);
      } catch (err) {
        console.error('Failed to load attendance logs', err);
      } finally {
        setLoading(false);
      }
    };
    void loadLogs();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'present':
        return 'approved';
      case 'absent':
        return 'rejected';
      case 'late':
        return 'warning';
      default:
        return 'pending';
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <PageHeader
        title="Attendance Records"
        description="View your complete attendance history with time-in, time-out, and approval status"
      />

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {[
          { label: 'Total Records', value: logs.length, color: 'from-blue-50 to-blue-100' },
          { label: 'Approved', value: logs.filter(l => l.approval_status === 'approved').length, color: 'from-green-50 to-green-100' },
          { label: 'Pending', value: logs.filter(l => l.approval_status === 'pending').length, color: 'from-orange-50 to-orange-100' },
        ].map((stat, i) => (
          <div key={i} className={`bg-gradient-to-br ${stat.color} rounded-xl p-6 border border-opacity-20 shadow-sm`}>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-600 mb-2">{stat.label}</p>
            <p className="text-3xl font-bold text-slate-900">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-bold text-slate-900">Attendance Log</h2>
          <p className="text-sm text-slate-600 mt-1">Complete history of your time in/out records</p>
        </div>

        {loading ? (
          <div className="p-12 text-center">
            <div className="text-5xl mb-4">⏳</div>
            <p className="text-slate-600">Loading attendance records...</p>
          </div>
        ) : logs.length > 0 ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHead>
                <TableRow>
                  <TableHeaderCell>Date</TableHeaderCell>
                  <TableHeaderCell>Program</TableHeaderCell>
                  <TableHeaderCell>Time In</TableHeaderCell>
                  <TableHeaderCell>Time Out</TableHeaderCell>
                  <TableHeaderCell>Hours</TableHeaderCell>
                  <TableHeaderCell>Status</TableHeaderCell>
                  <TableHeaderCell>Approval</TableHeaderCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {logs.map((log) => (
                  <TableRow key={log.id} className="hover:bg-blue-50 transition-colors">
                    <TableCell className="font-semibold text-slate-900">{log.date}</TableCell>
                    <TableCell>{log.userProgram?.program?.name ?? 'N/A'}</TableCell>
                    <TableCell>{log.time_in ?? '—'}</TableCell>
                    <TableCell>{log.time_out ?? '—'}</TableCell>
                    <TableCell>
                      <span className="font-semibold text-slate-900">
                        {Number(log.total_hours).toFixed(1)} <span className="text-xs text-slate-600">hrs</span>
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge status={getStatusColor(log.status)} variant="subtle" size="sm">
                        {log.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        status={log.approval_status === 'approved' ? 'approved' : log.approval_status === 'rejected' ? 'rejected' : 'pending'}
                        variant="solid"
                        size="sm"
                      >
                        {log.approval_status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="p-12 text-center">
            <div className="text-5xl mb-4">📋</div>
            <p className="text-slate-600">No attendance records found. Start by recording your time in/out.</p>
          </div>
        )}
      </div>
    </div>
  );
}
