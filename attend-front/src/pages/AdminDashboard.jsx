import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ImportWizard from '../components/ImportWizard';

export default function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadType, setUploadType] = useState(null); // 'faculty' or 'student'

  const handleFeedFaculty = () => {
    setUploadType('faculty');
    setShowUploadModal(true);
  };

  const handleFeedStudents = () => {
    setUploadType('student');
    setShowUploadModal(true);
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
              <button
                onClick={handleFeedFaculty}
                className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
              >
                Start Faculty Import
              </button>
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
              <button
                onClick={handleFeedStudents}
                className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-colors"
              >
                Start Student Import
              </button>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h3 className="text-xl font-semibold mb-4">Quick Stats</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-3xl font-bold text-blue-600">--</div>
              <div className="text-sm text-gray-600">Total Faculty</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-3xl font-bold text-green-600">--</div>
              <div className="text-sm text-gray-600">Total Students</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-3xl font-bold text-purple-600">--</div>
              <div className="text-sm text-gray-600">Total Sections</div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-3xl font-bold text-orange-600">--</div>
              <div className="text-sm text-gray-600">Active Sessions</div>
            </div>
          </div>
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
          onClose={() => {
            setShowUploadModal(false);
            setUploadType(null);
          }}
        />
      )}
    </div>
  );
}
