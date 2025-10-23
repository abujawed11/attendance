import { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { API_ENDPOINTS } from '../config/api';

export default function AttendanceHistory() {
  const { sectionId } = useParams();
  const location = useLocation();
  const { token } = useAuth();
  const navigate = useNavigate();

  const [section, setSection] = useState(location.state?.section || null);
  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: '',
  });

  useEffect(() => {
    fetchSessions();
  }, [sectionId]);

  const fetchSessions = async (customDates = null) => {
    try {
      setLoading(true);
      setError(null);

      let url = `${API_ENDPOINTS.GET_SESSIONS}?sectionId=${sectionId}`;

      if (customDates?.startDate && customDates?.endDate) {
        url += `&startDate=${customDates.startDate}&endDate=${customDates.endDate}`;
      }

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        setSessions(data.data);
      } else {
        setError(data.message || 'Failed to fetch sessions');
      }
    } catch (err) {
      setError('Failed to connect to server');
      console.error('Fetch sessions error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSessionDetail = async (sessionId) => {
    try {
      const response = await fetch(API_ENDPOINTS.GET_SESSION_DETAIL(sessionId), {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        setSelectedSession(data.data);
      } else {
        setError(data.message || 'Failed to fetch session details');
      }
    } catch (err) {
      setError('Failed to connect to server');
      console.error('Fetch session detail error:', err);
    }
  };

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    if (dateRange.startDate && dateRange.endDate) {
      fetchSessions(dateRange);
    }
  };

  const handleClearFilter = () => {
    setDateRange({ startDate: '', endDate: '' });
    fetchSessions();
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading attendance history...</p>
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
              <h1 className="text-3xl font-bold text-gray-900">Attendance History</h1>
              <p className="mt-1 text-gray-600">{section?.name || 'Section'}</p>
            </div>
            <button
              onClick={() => navigate('/attendance')}
              className="px-4 py-2 text-indigo-600 hover:text-indigo-800 font-medium"
            >
              ← Back
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

        {/* Sessions List */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Left: Session Cards */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Sessions ({sessions.length})</h3>
            {sessions.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-8 text-center">
                <div className="text-6xl mb-4">📅</div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">No Sessions Found</h4>
                <p className="text-gray-600">No attendance sessions have been created yet.</p>
              </div>
            ) : (
              sessions.map((session) => (
                <div
                  key={session.id}
                  onClick={() => fetchSessionDetail(session.id)}
                  className={`bg-white rounded-lg shadow p-6 cursor-pointer transition-all ${
                    selectedSession?.id === session.id
                      ? 'ring-2 ring-indigo-500 shadow-lg'
                      : 'hover:shadow-md'
                  }`}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900">
                        {new Date(session.date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </h4>
                      <p className="text-sm text-gray-600">{session.subject || 'No subject'}</p>
                    </div>
                    <span className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm font-medium">
                      {session._count.punches} students
                    </span>
                  </div>
                  {session.notes && (
                    <p className="text-sm text-gray-500 mb-2">📝 {session.notes}</p>
                  )}
                  <p className="text-xs text-gray-400">By {session.faculty.fullName}</p>
                </div>
              ))
            )}
          </div>

          {/* Right: Session Details */}
          <div className="sticky top-4">
            {!selectedSession ? (
              <div className="bg-white rounded-lg shadow p-8 text-center">
                <div className="text-6xl mb-4">👈</div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">Select a Session</h4>
                <p className="text-gray-600">Click on a session to view detailed attendance records</p>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow overflow-hidden">
                {/* Session Header */}
                <div className="bg-indigo-600 text-white p-6">
                  <h3 className="text-xl font-bold mb-2">
                    {new Date(selectedSession.date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </h3>
                  <p className="text-indigo-100">{selectedSession.subject || 'No subject'}</p>
                  {selectedSession.notes && (
                    <p className="text-indigo-100 text-sm mt-2">📝 {selectedSession.notes}</p>
                  )}
                </div>

                {/* Statistics */}
                <div className="p-6 bg-gray-50 border-b">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-green-600">
                        {selectedSession.punches.filter((p) => p.status === 'PRESENT').length}
                      </div>
                      <div className="text-xs text-gray-500">Present</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-red-600">
                        {selectedSession.punches.filter((p) => p.status === 'ABSENT').length}
                      </div>
                      <div className="text-xs text-gray-500">Absent</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-yellow-600">
                        {selectedSession.punches.filter((p) => p.status === 'LATE').length}
                      </div>
                      <div className="text-xs text-gray-500">Late</div>
                    </div>
                  </div>
                </div>

                {/* Student List */}
                <div className="max-h-96 overflow-y-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 sticky top-0">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Student
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {selectedSession.punches
                        .sort((a, b) =>
                          a.enrollment.student.fullName.localeCompare(b.enrollment.student.fullName)
                        )
                        .map((punch) => (
                          <tr key={punch.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3">
                              <div className="text-sm font-medium text-gray-900">
                                {punch.enrollment.student.fullName}
                              </div>
                              <div className="text-xs text-gray-500">
                                {punch.enrollment.student.studentSchoolProfile?.rollNo ||
                                  punch.enrollment.student.studentCollegeProfile?.regNo ||
                                  '-'}
                              </div>
                              {punch.remarks && (
                                <div className="text-xs text-gray-500 italic mt-1">
                                  {punch.remarks}
                                </div>
                              )}
                            </td>
                            <td className="px-4 py-3">
                              <span
                                className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                                  punch.status
                                )}`}
                              >
                                {punch.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
