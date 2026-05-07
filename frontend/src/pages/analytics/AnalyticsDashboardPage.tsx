import { useEffect, useState } from 'react';
import axios from 'axios';

interface DashboardData {
  assignments: {
    total: number;
    active: number;
    completed: number;
  };
  reports: {
    total: number;
    approved: number;
    submitted: number;
    needs_revision: number;
  };
  hours: {
    required: number;
    completed: number;
    remaining: number;
  };
  metrics: {
    average_reports_per_student: number;
    approval_rate: number;
    completion_rate: number;
  };
}

const AnalyticsDashboardPage = () => {
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/analytics/dashboard`);
      setDashboard(response.data);
    } catch (err) {
      console.error('Error fetching dashboard:', err);
      setError('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  const KPICard = ({ title, value, unit = '', bgColor = 'bg-blue-50', textColor = 'text-blue-700' }: any) => (
    <div className={`${bgColor} rounded-lg p-6 border-l-4 ${textColor} border-current`}>
      <p className="text-sm text-gray-600">{title}</p>
      <p className="text-3xl font-bold mt-2">{value}{unit}</p>
    </div>
  );

  if (loading) {
    return <div className="p-6 text-center">Loading analytics...</div>;
  }

  if (error) {
    return <div className="p-6 text-center text-red-600">{error}</div>;
  }

  if (!dashboard) {
    return <div className="p-6 text-center">No data available</div>;
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Analytics Dashboard</h1>

      {/* Key Metrics */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Key Metrics</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <KPICard 
            title="Completion Rate" 
            value={dashboard.metrics.completion_rate}
            unit="%"
            bgColor="bg-green-50"
            textColor="text-green-700"
          />
          <KPICard 
            title="Approval Rate" 
            value={dashboard.metrics.approval_rate}
            unit="%"
            bgColor="bg-purple-50"
            textColor="text-purple-700"
          />
          <KPICard 
            title="Avg Reports/Student" 
            value={dashboard.metrics.average_reports_per_student}
            bgColor="bg-orange-50"
            textColor="text-orange-700"
          />
        </div>
      </section>

      {/* Assignments */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Assignments</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <KPICard 
            title="Total Assignments" 
            value={dashboard.assignments.total}
            bgColor="bg-blue-50"
            textColor="text-blue-700"
          />
          <KPICard 
            title="Active Assignments" 
            value={dashboard.assignments.active}
            bgColor="bg-green-50"
            textColor="text-green-700"
          />
          <KPICard 
            title="Completed Assignments" 
            value={dashboard.assignments.completed}
            bgColor="bg-gray-50"
            textColor="text-gray-700"
          />
        </div>
      </section>

      {/* Reports */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Reports Status</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <KPICard 
            title="Total Reports" 
            value={dashboard.reports.total}
            bgColor="bg-blue-50"
            textColor="text-blue-700"
          />
          <KPICard 
            title="Approved" 
            value={dashboard.reports.approved}
            bgColor="bg-green-50"
            textColor="text-green-700"
          />
          <KPICard 
            title="Submitted" 
            value={dashboard.reports.submitted}
            bgColor="bg-yellow-50"
            textColor="text-yellow-700"
          />
          <KPICard 
            title="Needs Revision" 
            value={dashboard.reports.needs_revision}
            bgColor="bg-red-50"
            textColor="text-red-700"
          />
        </div>
      </section>

      {/* Hours Tracking */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Hours Tracking</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <KPICard 
            title="Required Hours" 
            value={Math.round(dashboard.hours.required)}
            unit=" hrs"
            bgColor="bg-blue-50"
            textColor="text-blue-700"
          />
          <KPICard 
            title="Completed Hours" 
            value={Math.round(dashboard.hours.completed)}
            unit=" hrs"
            bgColor="bg-green-50"
            textColor="text-green-700"
          />
          <KPICard 
            title="Remaining Hours" 
            value={Math.round(dashboard.hours.remaining)}
            unit=" hrs"
            bgColor="bg-orange-50"
            textColor="text-orange-700"
          />
        </div>
        
        {/* Progress Bar */}
        <div className="mt-4 bg-white rounded-lg p-6">
          <div className="flex justify-between mb-2">
            <span className="text-sm font-semibold text-gray-700">Hours Completion</span>
            <span className="text-sm font-semibold text-gray-600">
              {Math.round((dashboard.hours.completed / dashboard.hours.required) * 100)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
            <div 
              className="bg-green-500 h-full rounded-full transition-all duration-500"
              style={{ 
                width: `${Math.min((dashboard.hours.completed / dashboard.hours.required) * 100, 100)}%` 
              }}
            />
          </div>
        </div>
      </section>

      {/* Summary Stats */}
      <section>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Summary</h2>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-gray-600 text-sm">Report Submissions</p>
              <p className="text-2xl font-bold text-gray-900">{dashboard.reports.submitted}</p>
              <p className="text-xs text-gray-500">pending review</p>
            </div>
            <div className="text-center">
              <p className="text-gray-600 text-sm">Active Programs</p>
              <p className="text-2xl font-bold text-gray-900">{dashboard.assignments.active}</p>
              <p className="text-xs text-gray-500">in progress</p>
            </div>
            <div className="text-center">
              <p className="text-gray-600 text-sm">Approval Status</p>
              <p className="text-2xl font-bold text-green-600">{dashboard.metrics.approval_rate}%</p>
              <p className="text-xs text-gray-500">of reports approved</p>
            </div>
            <div className="text-center">
              <p className="text-gray-600 text-sm">Program Status</p>
              <p className="text-2xl font-bold text-blue-600">{dashboard.metrics.completion_rate}%</p>
              <p className="text-xs text-gray-500">completed</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AnalyticsDashboardPage;
