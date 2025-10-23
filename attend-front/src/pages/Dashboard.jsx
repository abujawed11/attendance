import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getRoleDisplay = (roleType) => {
    const roles = {
      STUDENT: 'Student',
      FACULTY: 'Faculty',
      PARENT: 'Parent',
      ADMIN: 'Admin',
    };
    return roles[roleType] || roleType;
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Attendance System</h1>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-indigo-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
              {user?.fullName?.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-900">
                {getGreeting()}, {user?.fullName}!
              </h2>
              <p className="text-gray-600 mt-1">
                Welcome to your dashboard
              </p>
            </div>
          </div>
        </div>

        {/* User Info Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
          <h3 className="text-xl font-semibold mb-4 text-gray-900">Account Information</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Full Name</p>
              <p className="text-lg font-medium text-gray-900">{user?.fullName}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Email</p>
              <p className="text-lg font-medium text-gray-900">{user?.email}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Role</p>
              <span className="inline-block px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm font-medium">
                {getRoleDisplay(user?.roleType)}
              </span>
            </div>
            <div>
              <p className="text-sm text-gray-500">User ID</p>
              <p className="text-lg font-medium text-gray-900">{user?.publicId}</p>
            </div>
            {user?.phone && (
              <div>
                <p className="text-sm text-gray-500">Phone</p>
                <p className="text-lg font-medium text-gray-900">{user.phone}</p>
              </div>
            )}
            {user?.institution && (
              <div>
                <p className="text-sm text-gray-500">Institution</p>
                <p className="text-lg font-medium text-gray-900">
                  {user.institution.name}
                  <span className="ml-2 text-sm text-gray-500">
                    ({user.institution.type})
                  </span>
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h3 className="text-xl font-semibold mb-4 text-gray-900">Quick Actions</h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Attendance Action - Role-specific */}
            {user?.roleType === 'FACULTY' && (
              <button
                onClick={() => navigate('/attendance')}
                className="p-4 border-2 border-indigo-500 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors text-left"
              >
                <div className="text-3xl mb-2">✓</div>
                <h4 className="font-semibold text-gray-900">Manage Attendance</h4>
                <p className="text-sm text-gray-500">Mark and view attendance for your sections</p>
              </button>
            )}

            {user?.roleType === 'STUDENT' && (
              <button
                onClick={() => navigate('/my-attendance')}
                className="p-4 border-2 border-indigo-500 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors text-left"
              >
                <div className="text-3xl mb-2">📊</div>
                <h4 className="font-semibold text-gray-900">My Attendance</h4>
                <p className="text-sm text-gray-500">View your attendance records and statistics</p>
              </button>
            )}

            <button className="p-4 border-2 border-gray-200 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-colors text-left">
              <div className="text-3xl mb-2">👤</div>
              <h4 className="font-semibold text-gray-900">Profile Settings</h4>
              <p className="text-sm text-gray-500">Update your profile information</p>
            </button>

            <button className="p-4 border-2 border-gray-200 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-colors text-left">
              <div className="text-3xl mb-2">📝</div>
              <h4 className="font-semibold text-gray-900">Reports</h4>
              <p className="text-sm text-gray-500">Generate attendance reports</p>
            </button>
          </div>
        </div>

        {/* Role-specific Information */}
        {user?.roleType === 'FACULTY' && (
          <div className="mt-6 bg-indigo-50 border border-indigo-200 rounded-lg p-4">
            <p className="text-indigo-800 text-center">
              <span className="font-semibold">Faculty Dashboard:</span> Manage attendance for all your assigned sections from the Attendance Management panel.
            </p>
          </div>
        )}

        {user?.roleType === 'STUDENT' && (
          <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-green-800 text-center">
              <span className="font-semibold">Student Dashboard:</span> Track your attendance percentage and maintain good academic standing!
            </p>
          </div>
        )}

        {!['FACULTY', 'STUDENT'].includes(user?.roleType) && (
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-blue-800 text-center">
              <span className="font-semibold">Coming Soon:</span> More features will be added to your dashboard!
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
