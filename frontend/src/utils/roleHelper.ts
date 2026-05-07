export const hasRole = (user: any, roles: string[]): boolean => {
  if (!user) return false;
  const userRole = (user.role as any)?.name || user.role;
  return roles.includes(userRole);
};

export const isSupervisor = (user: any): boolean => hasRole(user, ['supervisor', 'coordinator', 'admin']);
export const isAdmin = (user: any): boolean => hasRole(user, ['admin', 'coordinator']);
export const isStudent = (user: any): boolean => hasRole(user, ['student']);
