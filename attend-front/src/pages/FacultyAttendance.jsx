import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { API_ENDPOINTS } from '../config/api';

export default function FacultyAttendance() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchSections();
  }, []);

  const fetchSections = async () => {
    try {
      setLoading(true);
      const response = await fetch(API_ENDPOINTS.FACULTY_SECTIONS, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        setSections(data.data);
      } else {
        setError(data.message || 'Failed to fetch sections');
      }
    } catch (err) {
      setError('Failed to connect to server');
      console.error('Fetch sections error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAttendance = (section) => {
    navigate(`/attendance/mark/${section.id}`, { state: { section } });
  };

  const handleViewHistory = (section) => {
    navigate(`/attendance/history/${section.id}`, { state: { section } });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading sections...</p>
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
              <h1 className="text-3xl font-bold text-gray-900">Attendance Management</h1>
              <p className="mt-1 text-gray-600">Manage attendance for your assigned sections</p>
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

        {sections.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <div className="text-6xl mb-4">📚</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Sections Assigned</h3>
            <p className="text-gray-600 mb-4">
              You don't have any sections assigned yet. Please contact your administrator.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {sections.map((section) => (
              <div
                key={section.id}
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden"
              >
                {/* Card Header */}
                <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 p-6 text-white">
                  <h3 className="text-xl font-bold mb-2">{section.name}</h3>
                  <p className="text-indigo-100 text-sm">
                    {section.subject && `${section.subject} • `}
                    {section.institution.name}
                  </p>
                </div>

                {/* Card Body */}
                <div className="p-6">
                  <div className="space-y-3 mb-6">
                    {section.schoolClass && (
                      <div className="flex items-center text-sm">
                        <span className="text-gray-500 w-24">Class:</span>
                        <span className="font-medium text-gray-900">
                          {section.schoolClass} {section.schoolSection}
                        </span>
                      </div>
                    )}
                    {section.department && (
                      <div className="flex items-center text-sm">
                        <span className="text-gray-500 w-24">Department:</span>
                        <span className="font-medium text-gray-900">{section.department}</span>
                      </div>
                    )}
                    {section.yearOfStudy && (
                      <div className="flex items-center text-sm">
                        <span className="text-gray-500 w-24">Year:</span>
                        <span className="font-medium text-gray-900">
                          Year {section.yearOfStudy}
                          {section.semester && ` • Sem ${section.semester}`}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center text-sm">
                      <span className="text-gray-500 w-24">Students:</span>
                      <span className="font-medium text-gray-900">{section.studentCount}</span>
                    </div>
                    {section.board && (
                      <div className="flex items-center text-sm">
                        <span className="text-gray-500 w-24">Board:</span>
                        <span className="font-medium text-gray-900">{section.board}</span>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-2">
                    <button
                      onClick={() => handleMarkAttendance(section)}
                      className="w-full px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium transition-colors flex items-center justify-center"
                    >
                      <span className="mr-2">✓</span>
                      Mark Attendance
                    </button>
                    <button
                      onClick={() => handleViewHistory(section)}
                      className="w-full px-4 py-3 border-2 border-gray-200 text-gray-700 rounded-lg hover:border-indigo-500 hover:text-indigo-600 font-medium transition-colors flex items-center justify-center"
                    >
                      <span className="mr-2">📊</span>
                      View History
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Info Card */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h4 className="font-semibold text-blue-900 mb-2">Quick Tips</h4>
          <ul className="text-blue-800 text-sm space-y-1">
            <li>• Click "Mark Attendance" to record attendance for today's class</li>
            <li>• Click "View History" to see past attendance records</li>
            <li>• You can mark attendance as Present, Absent, or Late</li>
          </ul>
        </div>
      </main>
    </div>
  );
}
