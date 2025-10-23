import { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { API_ENDPOINTS } from '../config/api';

export default function MarkAttendance() {
  const { sectionId } = useParams();
  const location = useLocation();
  const { token } = useAuth();
  const navigate = useNavigate();

  const [section, setSection] = useState(location.state?.section || null);
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [subject, setSubject] = useState(section?.subject || '');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchStudents();
  }, [sectionId]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const response = await fetch(API_ENDPOINTS.SECTION_STUDENTS(sectionId), {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        setSection(data.data.section);
        setStudents(data.data.students);

        // Initialize all students as PRESENT by default
        const initialAttendance = {};
        data.data.students.forEach((student) => {
          initialAttendance[student.enrollmentId] = {
            status: 'PRESENT',
            remarks: '',
          };
        });
        setAttendance(initialAttendance);
      } else {
        setError(data.message || 'Failed to fetch students');
      }
    } catch (err) {
      setError('Failed to connect to server');
      console.error('Fetch students error:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateAttendance = (enrollmentId, field, value) => {
    setAttendance((prev) => ({
      ...prev,
      [enrollmentId]: {
        ...prev[enrollmentId],
        [field]: value,
      },
    }));
  };

  const markAllAs = (status) => {
    const updated = {};
    students.forEach((student) => {
      updated[student.enrollmentId] = {
        status,
        remarks: attendance[student.enrollmentId]?.remarks || '',
      };
    });
    setAttendance(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      // Step 1: Create attendance session
      const sessionResponse = await fetch(API_ENDPOINTS.CREATE_SESSION, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          sectionId: parseInt(sectionId),
          date,
          subject: subject || null,
          notes: notes || null,
        }),
      });

      const sessionData = await sessionResponse.json();

      if (!sessionData.success) {
        throw new Error(sessionData.message || 'Failed to create session');
      }

      const sessionId = sessionData.data.id;

      // Step 2: Mark attendance for all students
      const punches = students.map((student) => ({
        enrollmentId: student.enrollmentId,
        status: attendance[student.enrollmentId].status,
        remarks: attendance[student.enrollmentId].remarks || null,
      }));

      const attendanceResponse = await fetch(API_ENDPOINTS.MARK_ATTENDANCE(sessionId), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ punches }),
      });

      const attendanceData = await attendanceResponse.json();

      if (attendanceData.success) {
        setSuccess(true);
        setTimeout(() => {
          navigate('/attendance');
        }, 2000);
      } else {
        throw new Error(attendanceData.message || 'Failed to mark attendance');
      }
    } catch (err) {
      setError(err.message || 'Failed to submit attendance');
      console.error('Submit attendance error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PRESENT':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'ABSENT':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'LATE':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusCount = () => {
    const counts = { PRESENT: 0, ABSENT: 0, LATE: 0 };
    Object.values(attendance).forEach((a) => {
      counts[a.status]++;
    });
    return counts;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading students...</p>
        </div>
      </div>
    );
  }

  const statusCounts = getStatusCount();

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Mark Attendance</h1>
              <p className="mt-1 text-gray-600">{section?.name}</p>
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

        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-green-800 font-medium">
              ✓ Attendance marked successfully! Redirecting...
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Session Details */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Session Details</h2>
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g., Mathematics"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Optional notes"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => markAllAs('PRESENT')}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Mark All Present
              </button>
              <button
                type="button"
                onClick={() => markAllAs('ABSENT')}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Mark All Absent
              </button>
              <button
                type="button"
                onClick={() => markAllAs('LATE')}
                className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
              >
                Mark All Late
              </button>
            </div>

            {/* Status Summary */}
            <div className="mt-4 flex gap-6 text-sm">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                <span>Present: {statusCounts.PRESENT}</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                <span>Absent: {statusCounts.ABSENT}</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
                <span>Late: {statusCounts.LATE}</span>
              </div>
            </div>
          </div>

          {/* Student List */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 bg-gray-50 border-b">
              <h2 className="text-xl font-semibold">
                Students ({students.length})
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      #
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Roll No
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Remarks
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {students.map((student, index) => (
                    <tr key={student.enrollmentId} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {index + 1}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {student.rollNo || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {student.fullName}
                          </div>
                          <div className="text-sm text-gray-500">{student.email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex gap-2">
                          {['PRESENT', 'ABSENT', 'LATE'].map((status) => (
                            <button
                              key={status}
                              type="button"
                              onClick={() => updateAttendance(student.enrollmentId, 'status', status)}
                              className={`px-3 py-1 text-xs font-medium rounded-full border-2 transition-colors ${
                                attendance[student.enrollmentId]?.status === status
                                  ? getStatusColor(status)
                                  : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                              }`}
                            >
                              {status}
                            </button>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="text"
                          value={attendance[student.enrollmentId]?.remarks || ''}
                          onChange={(e) =>
                            updateAttendance(student.enrollmentId, 'remarks', e.target.value)
                          }
                          placeholder="Optional"
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Submit Button */}
          <div className="mt-6 flex justify-end gap-4">
            <button
              type="button"
              onClick={() => navigate('/attendance')}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={submitting || students.length === 0}
            >
              {submitting ? 'Submitting...' : 'Submit Attendance'}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
