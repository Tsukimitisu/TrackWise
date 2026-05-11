export type RoleName =
  | 'Super Admin'
  | 'Organization Admin'
  | 'Coordinator'
  | 'Supervisor'
  | 'Student'
  | 'Viewer';

export interface AuthUser {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  email_verified_at?: string | null;
  phone?: string;
  role: { id: number; name: RoleName };
  organization?: { id: number; name: string } | null;
  userPrograms?: Array<{
    id: number;
    required_hours: number;
    completed_hours: number;
    status: string;
    program?: { id: number; name: string };
  }>;
}
