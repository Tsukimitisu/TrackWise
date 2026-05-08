import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface OverviewData {
  users: {
    total: number;
    by_role: Record<string, number>;
  };
  organizations: {
    total: number;
  };
  programs: {
    total: number;
    active: number;
    completed: number;
  };
  assignments: {
    total: number;
    active: number;
    completed: number;
  };
}

interface UserActivityData {
  total_active_users: number;
  users_with_reports: number;
  recent_users: Array<{ id: number; name: string; email: string; role: string; created_at: string }>;
  last_active_users: Array<{ id: number; name: string; last_active: string | null }>;
}

interface ReportingData {
  range_days: number;
  range_label: string;
  total: number;
  submitted: number;
  approved: number;
  rejected: number;
  needs_revision: number;
  avg_submission_time_days: number;
  reports_last_period: Array<{ date: string; count: number }>;
  reports_by_program: Array<{ name: string; report_count: number }>;
}

interface OrganizationData {
  organizations: Array<{ id: number; name: string; type: string; status: string; assignments_count: number; programs_count: number }>;
  by_status: Record<string, number>;
}

interface ProgramData {
  programs: Array<{ id: number; name: string; required_hours: number; status: string; assignments: number; avg_hours: number | null }>;
  by_status: Record<string, number>;
  by_report_frequency: Record<string, number>;
}

interface HealthData {
  activity: {
    reports_last_7_days: number;
    reports_last_30_days: number;
    pending_reviews: number;
  };
  health_score: number;
  data_integrity: {
    users_with_assignments: number;
    assignments_with_reports: number;
    orphaned_reports: number;
  };
}

interface AdminStatisticsExportData {
  overview: OverviewData;
  userActivity: UserActivityData;
  reporting: ReportingData;
  organizations: OrganizationData;
  programs: ProgramData;
  health: HealthData;
}

export const downloadAdminStatisticsPdf = (data: AdminStatisticsExportData) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 14;
  let cursorY = 16;

  const sectionTitle = (title: string) => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(17, 24, 39);
    doc.text(title, margin, cursorY);
    cursorY += 6;
  };

  const addMetricRow = (label: string, value: string | number, x: number, y: number, width = 58) => {
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(x, y, width, 18, 3, 3, 'F');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text(label, x + 3, y + 6);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(15, 23, 42);
    doc.text(String(value), x + 3, y + 13);
  };

  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, pageWidth, 30, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text('TrackWise Admin Statistics Report', margin, 14);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(`Exported at ${new Date().toLocaleString()}`, margin, 22);

  cursorY = 38;
  sectionTitle('Overview');
  addMetricRow('Total Users', data.overview.users.total, margin, cursorY);
  addMetricRow('Organizations', data.overview.organizations.total, margin + 62, cursorY);
  addMetricRow('Programs', data.overview.programs.total, margin + 124, cursorY);
  addMetricRow('Assignments', data.overview.assignments.total, margin + 186, cursorY);
  cursorY += 26;

  sectionTitle('Health and Reporting');
  addMetricRow('Health Score', `${data.health.health_score}%`, margin, cursorY);
  addMetricRow('Pending Reviews', data.health.activity.pending_reviews, margin + 62, cursorY);
  addMetricRow('Total Reports', data.reporting.total, margin + 124, cursorY);
  addMetricRow('Avg Review Delay', `${data.reporting.avg_submission_time_days} days`, margin + 186, cursorY);
  cursorY += 28;

  sectionTitle('Reports by Status');
  autoTable(doc, {
    startY: cursorY,
    head: [['Metric', 'Count']],
    body: [
      ['Submitted', String(data.reporting.submitted)],
      ['Approved', String(data.reporting.approved)],
      ['Rejected', String(data.reporting.rejected)],
      ['Needs Revision', String(data.reporting.needs_revision)],
    ],
    theme: 'striped',
    styles: { fontSize: 9, cellPadding: 3 },
    headStyles: { fillColor: [15, 23, 42] },
  });
  cursorY = (doc as any).lastAutoTable.finalY + 10;

  sectionTitle('Users by Role');
  autoTable(doc, {
    startY: cursorY,
    head: [['Role', 'Users']],
    body: Object.entries(data.overview.users.by_role).map(([role, count]) => [role, String(count)]),
    theme: 'striped',
    styles: { fontSize: 9, cellPadding: 3 },
    headStyles: { fillColor: [79, 70, 229] },
  });
  cursorY = (doc as any).lastAutoTable.finalY + 10;

  sectionTitle('Top Programs');
  autoTable(doc, {
    startY: cursorY,
    head: [['Program', 'Reports']],
    body: data.reporting.reports_by_program.slice(0, 10).map((program) => [program.name, String(program.report_count)]),
    theme: 'striped',
    styles: { fontSize: 9, cellPadding: 3 },
    headStyles: { fillColor: [16, 185, 129] },
  });
  cursorY = (doc as any).lastAutoTable.finalY + 10;

  if (cursorY > 245) {
    doc.addPage();
    cursorY = 16;
  }

  sectionTitle('Recent Users');
  autoTable(doc, {
    startY: cursorY,
    head: [['Name', 'Email', 'Role']],
    body: data.userActivity.recent_users.slice(0, 10).map((user) => [user.name, user.email, user.role]),
    theme: 'striped',
    styles: { fontSize: 8, cellPadding: 2.5 },
    headStyles: { fillColor: [59, 130, 246] },
  });

  doc.save(`trackwise-admin-statistics-${new Date().toISOString().slice(0, 10)}.pdf`);
};
