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
  role: { id: number; name: RoleName };
  organization?: { id: number; name: string } | null;
}
