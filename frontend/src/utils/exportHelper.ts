import client from '../api/client';

export const exportToCSV = async (endpoint: string, filename: string, filters?: any) => {
  try {
    const response = await client.get(endpoint, {
      params: filters,
      responseType: 'blob',
    });

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.parentNode?.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Export failed:', error);
    throw new Error('Failed to export data');
  }
};

export const downloadDailyReportsCSV = (filters?: any) => {
  return exportToCSV('/export/daily-reports', 'daily-reports.csv', filters);
};

export const downloadWeeklyReportsCSV = (filters?: any) => {
  return exportToCSV('/export/weekly-reports', 'weekly-reports.csv', filters);
};

export const downloadAssignmentsCSV = (filters?: any) => {
  return exportToCSV('/export/assignments', 'assignments.csv', filters);
};

export const downloadStudentDataCSV = (userProgramId: number) => {
  return exportToCSV('/export/student-data', `student-data-${userProgramId}.csv`, { 
    user_program_id: userProgramId 
  });
};
