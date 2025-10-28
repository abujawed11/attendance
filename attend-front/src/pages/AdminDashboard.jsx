import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ImportWizard from '../components/ImportWizard';
import AddUsersPanel from '../components/AddUsersPanel';

export default function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showAddManualModal, setShowAddManualModal] = useState(false);
  const [uploadType, setUploadType] = useState(null); // 'faculty' or 'student'
  const [stats, setStats] = useState({
    totalFaculty: 0,
    totalStudents: 0,
    totalSections: 0,
    todaysSessions: 0,
  });
  const [loadingStats, setLoadingStats] = useState(true);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoadingStats(true);
      const response = await fetch(`${API_URL}/admin/stats`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoadingStats(false);
    }
  };

  const handleFeedFaculty = () => {
    setUploadType('faculty');
    setShowUploadModal(true);
  };

  const handleFeedStudents = () => {
    setUploadType('student');
    setShowUploadModal(true);
  };

  const handleAddFacultyManually = () => {
    setUploadType('faculty');
    setShowAddManualModal(true);
  };

  const handleAddStudentsManually = () => {
    setUploadType('student');
    setShowAddManualModal(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="mt-1 text-gray-600">Manage your institution's data</p>
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
        {/* Welcome Card */}
        <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 rounded-lg shadow-lg p-8 mb-8 text-white">
          <h2 className="text-2xl font-bold mb-2">Welcome, {user?.fullName}</h2>
          <p className="text-indigo-100">
            Use the bulk import tools below to quickly add faculty and students to your institution.
          </p>
        </div>

        {/* Main Actions */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Feed Faculty Data Card */}
          <div className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow overflow-hidden">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 text-white">
              <div className="flex items-center mb-2">
                <span className="text-4xl mr-3">👨‍🏫</span>
                <h3 className="text-2xl font-bold">Feed Faculty Data</h3>
              </div>
              <p className="text-blue-100">
                Bulk import faculty members using Excel/CSV file
              </p>
            </div>
            <div className="p-6">
              <ul className="space-y-2 text-sm text-gray-600 mb-6">
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">✓</span>
                  Import multiple faculty records at once
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">✓</span>
                  Auto-validate data and detect errors
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">✓</span>
                  Preview before saving to database
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">✓</span>
                  Update existing faculty or add new ones
                </li>
              </ul>
              <div className="space-y-3">
                <button
                  onClick={handleFeedFaculty}
                  className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
                >
                  📤 Bulk Import (Excel)
                </button>
                <button
                  onClick={handleAddFacultyManually}
                  className="w-full px-6 py-3 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 font-medium transition-colors border-2 border-blue-300"
                >
                  ✏️ Add Manually (1-10 users)
                </button>
              </div>
            </div>
          </div>

          {/* Feed Student Data Card */}
          <div className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow overflow-hidden">
            <div className="bg-gradient-to-r from-green-500 to-green-600 p-6 text-white">
              <div className="flex items-center mb-2">
                <span className="text-4xl mr-3">👨‍🎓</span>
                <h3 className="text-2xl font-bold">Feed Student Data</h3>
              </div>
              <p className="text-green-100">
                Bulk import students using Excel/CSV file
              </p>
            </div>
            <div className="p-6">
              <ul className="space-y-2 text-sm text-gray-600 mb-6">
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  Import entire class rosters quickly
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  Include guardian/parent information
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  Automatic validation and error reports
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  Auto-enroll students in sections
                </li>
              </ul>
              <div className="space-y-3">
                <button
                  onClick={handleFeedStudents}
                  className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-colors"
                >
                  📤 Bulk Import (Excel)
                </button>
                <button
                  onClick={handleAddStudentsManually}
                  className="w-full px-6 py-3 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 font-medium transition-colors border-2 border-green-300"
                >
                  ✏️ Add Manually (1-10 users)
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* View Users Section */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-6 text-white">
            <div className="flex items-center mb-2">
              <span className="text-4xl mr-3">👥</span>
              <h3 className="text-2xl font-bold">View Users</h3>
            </div>
            <p className="text-indigo-100">
              Browse, search, and filter faculty and students
            </p>
          </div>
          <div className="p-6">
            <p className="text-gray-600 mb-6">
              View all faculty and students in your institution with advanced search and filtering options.
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              <button
                onClick={() => navigate('/admin/users?type=faculty')}
                className="flex items-center justify-center gap-3 px-6 py-4 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 font-medium transition-colors border-2 border-blue-200"
              >
                <span className="text-2xl">👨‍🏫</span>
                <span>View Faculty</span>
              </button>
              <button
                onClick={() => navigate('/admin/users?type=students')}
                className="flex items-center justify-center gap-3 px-6 py-4 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 font-medium transition-colors border-2 border-green-200"
              >
                <span className="text-2xl">👨‍🎓</span>
                <span>View Students</span>
              </button>
            </div>
          </div>
        </div>

        {/* Section Management */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-purple-500 to-pink-600 p-6 text-white">
            <div className="flex items-center mb-2">
              <span className="text-4xl mr-3">📚</span>
              <h3 className="text-2xl font-bold">Section Management</h3>
            </div>
            <p className="text-purple-100">
              Create and manage classes/sections for your institution
            </p>
          </div>
          <div className="p-6">
            <p className="text-gray-600 mb-6">
              Create sections (classes for school, departments for college) and assign faculty to teach them.
            </p>
            <button
              onClick={() => navigate('/admin/sections')}
              className="w-full px-6 py-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium transition-colors"
            >
              📚 Manage Sections
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h3 className="text-xl font-semibold mb-4">Quick Stats</h3>
          {loadingStats ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-3xl font-bold text-blue-600">{stats.totalFaculty}</div>
                <div className="text-sm text-gray-600">Total Faculty</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-3xl font-bold text-green-600">{stats.totalStudents}</div>
                <div className="text-sm text-gray-600">Total Students</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-3xl font-bold text-purple-600">{stats.totalSections}</div>
                <div className="text-sm text-gray-600">Total Sections</div>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <div className="text-3xl font-bold text-orange-600">{stats.todaysSessions}</div>
                <div className="text-sm text-gray-600">Today's Sessions</div>
              </div>
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h4 className="font-semibold text-blue-900 mb-3 flex items-center">
            <span className="text-2xl mr-2">💡</span>
            How it works
          </h4>
          <ol className="list-decimal list-inside text-blue-800 space-y-2 text-sm ml-8">
            <li>Click on either "Start Faculty Import" or "Start Student Import"</li>
            <li>Download the Excel template provided</li>
            <li>Fill in your data following the template format</li>
            <li>Upload the completed file</li>
            <li>Review and map columns if needed</li>
            <li>Validate data and fix any errors</li>
            <li>Preview the changes before saving</li>
            <li>Confirm to save all records to your institution</li>
          </ol>
        </div>
      </main>

      {/* Import Wizard */}
      {showUploadModal && (
        <ImportWizard
          type={uploadType}
          onClose={(shouldRefresh) => {
            setShowUploadModal(false);
            setUploadType(null);
            if (shouldRefresh) {
              fetchStats(); // Refresh stats after import
            }
          }}
        />
      )}

      {/* Add Users Manually Panel */}
      {showAddManualModal && (
        <AddUsersPanel
          type={uploadType}
          institutionType={user?.institution?.type}
          onClose={(shouldRefresh) => {
            setShowAddManualModal(false);
            setUploadType(null);
            if (shouldRefresh) {
              fetchStats(); // Refresh stats after adding users
            }
          }}
        />
      )}
    </div>
  );
}
