export interface StudentOjtProfile {
  studentName: string;
  studentNumber: string;
  course: string;
  yearLevel: string;
  school: string;
  ojtSite: string;
  department: string;
  supervisorName: string;
  requiredHours: number;
  startDate: string;
  endDate: string;
  contactNumber: string;
  email: string;
}

export interface DtrEntry {
  id: string;
  date: string;
  timeIn: string;
  timeOut: string;
  breakMinutes: number;
  attendanceStatus: 'Present' | 'Late' | 'Half day' | 'Absent';
  activities: string;
  remarks: string;
  signatureName: string;
}

export interface NarrativeReport {
  id: string;
  title: string;
  periodStart: string;
  periodEnd: string;
  activities: string;
  learnings: string;
  challenges: string;
  reflection: string;
}

export interface DocumentationItem {
  id: string;
  title: string;
  date: string;
  description: string;
  evidenceType: 'photo' | 'certificate' | 'memo' | 'other';
  fileName: string;
}

export interface OjtData {
  profile: StudentOjtProfile;
  dtrEntries: DtrEntry[];
  narrativeReports: NarrativeReport[];
  documentation: DocumentationItem[];
}

const storageKey = 'trackwise_student_ojt';

export const defaultProfile: StudentOjtProfile = {
  studentName: 'Student Trainee',
  studentNumber: '',
  course: '',
  yearLevel: '',
  school: '',
  ojtSite: '',
  department: '',
  supervisorName: '',
  requiredHours: 486,
  startDate: '',
  endDate: '',
  contactNumber: '',
  email: '',
};

export const defaultOjtData: OjtData = {
  profile: defaultProfile,
  dtrEntries: [],
  narrativeReports: [],
  documentation: [],
};

export function createId(prefix: string) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export function loadOjtData(): OjtData {
  const raw = localStorage.getItem(storageKey);
  if (!raw) return defaultOjtData;

  try {
    const parsed = JSON.parse(raw) as Partial<OjtData>;
    return {
      profile: { ...defaultProfile, ...parsed.profile },
      dtrEntries: parsed.dtrEntries ?? [],
      narrativeReports: parsed.narrativeReports ?? [],
      documentation: parsed.documentation ?? [],
    };
  } catch {
    return defaultOjtData;
  }
}

export function saveOjtData(data: OjtData) {
  localStorage.setItem(storageKey, JSON.stringify(data));
  window.dispatchEvent(new Event('trackwise_student_ojt_updated'));
}

export function calculateDtrHours(entry: Pick<DtrEntry, 'timeIn' | 'timeOut' | 'breakMinutes'>) {
  if (!entry.timeIn || !entry.timeOut) return 0;

  const [inHour, inMinute] = entry.timeIn.split(':').map(Number);
  const [outHour, outMinute] = entry.timeOut.split(':').map(Number);
  const startMinutes = inHour * 60 + inMinute;
  let endMinutes = outHour * 60 + outMinute;

  if (endMinutes < startMinutes) {
    endMinutes += 24 * 60;
  }

  const renderedMinutes = Math.max(endMinutes - startMinutes - Number(entry.breakMinutes || 0), 0);
  return renderedMinutes / 60;
}

export function calculateCompletedHours(entries: DtrEntry[]) {
  return entries.reduce((sum, entry) => sum + calculateDtrHours(entry), 0);
}

export function formatHours(hours: number) {
  return hours.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}
