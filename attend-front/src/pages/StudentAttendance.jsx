import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { API_ENDPOINTS } from '../config/api';

export default function StudentAttendance() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [attendanceData, setAttendanceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: '',
  });

  useEffect(() => {
    fetchAttendance();
  }, []);

  const fetchAttendance = async (customDates = null) => {
    try {
      setLoading(true);
      setError(null);

      let url = API_ENDPOINTS.MY_ATTENDANCE;

      if (customDates?.startDate && customDates?.endDate) {
        url += `?startDate=${customDates.startDate}&endDate=${customDates.endDate}`;
      }

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        setAttendanceData(data.data);
      } else {
        setError(data.message || 'Failed to fetch attendance');
      }
    } catch (err) {
      setError('Failed to connect to server');
      console.error('Fetch attendance error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    if (dateRange.startDate && dateRange.endDate) {
      fetchAttendance(dateRange);
    }
  };

  const handleClearFilter = () => {
    setDateRange({ startDate: '', endDate: '' });
    fetchAttendance();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PRESENT':
        return 'bg-green-100 text-green-800';
      case 'ABSENT':
        return 'bg-red-100 text-red-800';
      case 'LATE':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getAttendanceColor = (percentage) => {
    if (percentage >= 75) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading attendance...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Attendance</h1>
              <p className="mt-1 text-gray-600">View your attendance records and statistics</p>
            </div>
            <button
              onClick={() => navigate('/dashboard')}
              className="px-4 py-2 text-indigo-600 hover:text-indigo-800 font-medium"
            >
              ← Back to Dashboard
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Date Filter */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">Filter by Date Range</h3>
          <form onSubmit={handleFilterSubmit} className="flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
              <input
                type="date"
                value={dateRange.startDate}
                onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
              <input
                type="date"
                value={dateRange.endDate}
                onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                disabled={!dateRange.startDate || !dateRange.endDate}
              >
                Apply Filter
              </button>
              {(dateRange.startDate || dateRange.endDate) && (
                <button
                  type="button"
                  onClick={handleClearFilter}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Clear
                </button>
              )}
            </div>
          </form>
        </div>

        {!attendanceData || attendanceData.sections.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <div className="text-6xl mb-4">📊</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Attendance Records</h3>
            <p className="text-gray-600">
              You don't have any attendance records yet. Your attendance will appear here once your
              faculty marks it.
            </p>
          </div>
        ) : (
          <>
            {/* Overall Summary */}
            {attendanceData.summary && (
              <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 rounded-lg shadow-lg p-6 mb-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold mb-1">Overall Attendance</h3>
                    <p className="text-indigo-100">Across {attendanceData.summary.totalSections} section(s)</p>
                  </div>
                  <div className="text-right">
                    <div className="text-4xl font-bold">
                      {attendanceData.summary.overallAttendance.toFixed(1)}%
                    </div>
                    <p className="text-indigo-100 text-sm">Average</p>
                  </div>
                </div>
              </div>
            )}

            {/* Section-wise Attendance */}
            <div className="space-y-6">
              {attendanceData.sections.map((sectionData) => (
                <div key={sectionData.enrollmentId} className="bg-white rounded-lg shadow overflow-hidden">
                  {/* Section Header */}
                  <div className="bg-gray-50 px-6 py-4 border-b">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900">
                          {sectionData.section.name}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                          {sectionData.section.department && `${sectionData.section.department} • `}
                          {sectionData.section.schoolClass && `Class ${sectionData.section.schoolClass}`}
                          {sectionData.section.yearOfStudy && `Year ${sectionData.section.yearOfStudy}`}
                        </p>
                      </div>
                      <div className={`text-3xl font-bold ${getAttendanceColor(sectionData.statistics.attendancePercentage)}`}>
                        {sectionData.statistics.attendancePercentage}%
                      </div>
                    </div>
                  </div>

                  {/* Statistics */}
                  <div className="px-6 py-4 bg-gray-50 border-b">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-gray-900">
                          {sectionData.statistics.totalSessions}
                        </div>
                        <div className="text-sm text-gray-500">Total Sessions</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">
                          {sectionData.statistics.presentCount}
                        </div>
                        <div className="text-sm text-gray-500">Present</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-red-600">
                          {sectionData.statistics.absentCount}
                        </div>
                        <div className="text-sm text-gray-500">Absent</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-yellow-600">
                          {sectionData.statistics.lateCount}
                        </div>
                        <div className="text-sm text-gray-500">Late</div>
                      </div>
                    </div>
                  </div>

                  {/* Records */}
                  {sectionData.records.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                              Date
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                              Subject
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                              Status
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                              Faculty
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                              Remarks
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {sectionData.records.map((record) => (
                            <tr key={record.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {new Date(record.date).toLocaleDateString('en-US', {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric',
                                })}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {record.subject || '-'}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span
                                  className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                                    record.status
                                  )}`}
                                >
                                  {record.status}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {record.faculty}
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-500">
                                {record.remarks || '-'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="px-6 py-8 text-center text-gray-500">
                      No attendance records for this section
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}

        {/* Info Card */}
        {attendanceData && attendanceData.sections.length > 0 && (
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h4 className="font-semibold text-blue-900 mb-2">Attendance Guidelines</h4>
            <ul className="text-blue-800 text-sm space-y-1">
              <li>• Minimum 75% attendance is typically required for course completion</li>
              <li>• Contact your faculty if you notice any discrepancies</li>
              <li>• Late arrivals count towards attendance but are tracked separately</li>
            </ul>
          </div>
        )}
      </main>
    </div>
  );
}
