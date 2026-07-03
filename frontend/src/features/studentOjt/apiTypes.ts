export interface Assignment {
  id: number;
  user_id: number;
  required_hours: number | string;
  completed_hours: number | string;
  department?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  status: string;
  user?: {
    id: number;
    first_name: string;
    last_name: string;
    name?: string;
    email: string;
    phone?: string | null;
    student_number?: string | null;
    course?: string | null;
    year_level?: string | null;
    organization?: { name: string } | null;
  };
  program?: {
    name: string;
    organization?: { name: string } | null;
  };
  supervisor?: { name?: string; first_name: string; last_name: string } | null;
  coordinator?: { name?: string; first_name: string; last_name: string } | null;
}

export interface AttendanceLog {
  id: number;
  user_program_id: number;
  date: string;
  time_in?: string | null;
  time_out?: string | null;
  break_minutes: number;
  total_hours: number | string;
  status: string;
  approval_status: string;
  remarks?: string | null;
}

export interface DocumentationRecord {
  id: number;
  user_program_id: number;
  title: string;
  description: string;
  caption?: string | null;
  file_type: string;
  download_url: string;
  taken_at: string;
  daily_report_id?: number | null;
  weekly_report_id?: number | null;
  attendance_log_id?: number | null;
}

export function unwrapList<T>(payload: unknown): T[] {
  if (Array.isArray(payload)) return payload as T[];
  if (payload && typeof payload === 'object' && 'data' in payload) {
    const data = (payload as { data?: unknown }).data;
    return Array.isArray(data) ? data as T[] : [];
  }
  return [];
}

export function displayName(person?: { name?: string; first_name?: string; last_name?: string } | null) {
  return person?.name || [person?.first_name, person?.last_name].filter(Boolean).join(' ') || 'Not assigned';
}

export function formatHours(value: number | string | null | undefined) {
  return `${Number(value || 0).toFixed(2)} hrs`;
}
