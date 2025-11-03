// import { useAuth } from '../context/AuthContext';
// import { useNavigate } from 'react-router-dom';

// export default function Dashboard() {
//   const { user, logout } = useAuth();
//   const navigate = useNavigate();

//   const handleLogout = () => {
//     logout();
//     navigate('/login');
//   };

//   const getRoleDisplay = (roleType) => {
//     const roles = {
//       STUDENT: 'Student',
//       FACULTY: 'Faculty',
//       PARENT: 'Parent',
//       ADMIN: 'Admin',
//     };
//     return roles[roleType] || roleType;
//   };

//   const getGreeting = () => {
//     const hour = new Date().getHours();
//     if (hour < 12) return 'Good Morning';
//     if (hour < 18) return 'Good Afternoon';
//     return 'Good Evening';
//   };

//   return (
//     <div className="min-h-screen bg-gray-50">
//       {/* Header */}
//       <header className="bg-white shadow">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
//           <h1 className="text-2xl font-bold text-gray-900">Attendance System</h1>
//           <button
//             onClick={handleLogout}
//             className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
//           >
//             Logout
//           </button>
//         </div>
//       </header>

//       {/* Main Content */}
//       <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
//         {/* Welcome Card */}
//         <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
//           <div className="flex items-center space-x-4">
//             <div className="w-16 h-16 bg-indigo-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
//               {user?.fullName?.charAt(0).toUpperCase()}
//             </div>
//             <div>
//               <h2 className="text-3xl font-bold text-gray-900">
//                 {getGreeting()}, {user?.fullName}!
//               </h2>
//               <p className="text-gray-600 mt-1">
//                 Welcome to your dashboard
//               </p>
//             </div>
//           </div>
//         </div>

//         {/* User Info Card */}
//         <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
//           <h3 className="text-xl font-semibold mb-4 text-gray-900">Account Information</h3>
//           <div className="grid sm:grid-cols-2 gap-4">
//             <div>
//               <p className="text-sm text-gray-500">Full Name</p>
//               <p className="text-lg font-medium text-gray-900">{user?.fullName}</p>
//             </div>
//             <div>
//               <p className="text-sm text-gray-500">Email</p>
//               <p className="text-lg font-medium text-gray-900">{user?.email}</p>
//             </div>
//             <div>
//               <p className="text-sm text-gray-500">Role</p>
//               <span className="inline-block px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm font-medium">
//                 {getRoleDisplay(user?.roleType)}
//               </span>
//             </div>
//             <div>
//               <p className="text-sm text-gray-500">User ID</p>
//               <p className="text-lg font-medium text-gray-900">{user?.publicId}</p>
//             </div>
//             {user?.phone && (
//               <div>
//                 <p className="text-sm text-gray-500">Phone</p>
//                 <p className="text-lg font-medium text-gray-900">{user.phone}</p>
//               </div>
//             )}
//             {user?.institution && (
//               <div>
//                 <p className="text-sm text-gray-500">Institution</p>
//                 <p className="text-lg font-medium text-gray-900">
//                   {user.institution.name}
//                   <span className="ml-2 text-sm text-gray-500">
//                     ({user.institution.type})
//                   </span>
//                 </p>
//               </div>
//             )}
//           </div>
//         </div>

//         {/* Quick Actions */}
//         <div className="bg-white rounded-2xl shadow-lg p-8">
//           <h3 className="text-xl font-semibold mb-4 text-gray-900">Quick Actions</h3>
//           <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
//             {/* Attendance Action - Role-specific */}
//             {user?.roleType === 'FACULTY' && (
//               <button
//                 onClick={() => navigate('/attendance')}
//                 className="p-4 border-2 border-indigo-500 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors text-left"
//               >
//                 <div className="text-3xl mb-2">✓</div>
//                 <h4 className="font-semibold text-gray-900">Manage Attendance</h4>
//                 <p className="text-sm text-gray-500">Mark and view attendance for your sections</p>
//               </button>
//             )}

//             {user?.roleType === 'STUDENT' && (
//               <button
//                 onClick={() => navigate('/my-attendance')}
//                 className="p-4 border-2 border-indigo-500 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors text-left"
//               >
//                 <div className="text-3xl mb-2">📊</div>
//                 <h4 className="font-semibold text-gray-900">My Attendance</h4>
//                 <p className="text-sm text-gray-500">View your attendance records and statistics</p>
//               </button>
//             )}

//             {user?.roleType === 'ADMIN' && (
//               <button
//                 onClick={() => navigate('/admin')}
//                 className="p-4 border-2 border-indigo-500 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors text-left"
//               >
//                 <div className="text-3xl mb-2">⚙️</div>
//                 <h4 className="font-semibold text-gray-900">Admin Panel</h4>
//                 <p className="text-sm text-gray-500">Manage institution data and bulk imports</p>
//               </button>
//             )}

//             <button className="p-4 border-2 border-gray-200 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-colors text-left">
//               <div className="text-3xl mb-2">👤</div>
//               <h4 className="font-semibold text-gray-900">Profile Settings</h4>
//               <p className="text-sm text-gray-500">Update your profile information</p>
//             </button>

//             <button className="p-4 border-2 border-gray-200 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-colors text-left">
//               <div className="text-3xl mb-2">📝</div>
//               <h4 className="font-semibold text-gray-900">Reports</h4>
//               <p className="text-sm text-gray-500">Generate attendance reports</p>
//             </button>
//           </div>
//         </div>

//         {/* Role-specific Information */}
//         {user?.roleType === 'FACULTY' && (
//           <div className="mt-6 bg-indigo-50 border border-indigo-200 rounded-lg p-4">
//             <p className="text-indigo-800 text-center">
//               <span className="font-semibold">Faculty Dashboard:</span> Manage attendance for all your assigned sections from the Attendance Management panel.
//             </p>
//           </div>
//         )}

//         {user?.roleType === 'STUDENT' && (
//           <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
//             <p className="text-green-800 text-center">
//               <span className="font-semibold">Student Dashboard:</span> Track your attendance percentage and maintain good academic standing!
//             </p>
//           </div>
//         )}

//         {!['FACULTY', 'STUDENT'].includes(user?.roleType) && (
//           <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
//             <p className="text-blue-800 text-center">
//               <span className="font-semibold">Coming Soon:</span> More features will be added to your dashboard!
//             </p>
//           </div>
//         )}
//       </main>
//     </div>
//   );
// }


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

  const getRoleColor = (roleType) => {
    const colors = {
      STUDENT: 'from-blue-500 to-cyan-500',
      FACULTY: 'from-purple-500 to-pink-500',
      PARENT: 'from-green-500 to-emerald-500',
      ADMIN: 'from-orange-500 to-red-500',
    };
    return colors[roleType] || 'from-gray-500 to-gray-600';
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const getGreetingIcon = () => {
    const hour = new Date().getHours();
    if (hour < 12) return '🌅';
    if (hour < 18) return '☀️';
    return '🌙';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      {/* Modern Header with Gradient */}
      <header className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-white">Attendance System</h1>
            </div>
            <button
              onClick={handleLogout}
              className="px-6 py-2.5 bg-white/10 backdrop-blur-sm text-white rounded-xl hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <span className="flex items-center space-x-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span>Logout</span>
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Enhanced Welcome Card with Gradient Avatar */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 mb-8 border border-gray-100 overflow-hidden relative">
          {/* Decorative Gradient Background */}
          <div className={`absolute top-0 right-0 w-96 h-96 bg-gradient-to-br ${getRoleColor(user?.roleType)} opacity-10 rounded-full blur-3xl -mr-48 -mt-48`}></div>
          
          <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6 relative z-10">
            <div className={`w-24 h-24 bg-gradient-to-br ${getRoleColor(user?.roleType)} rounded-2xl flex items-center justify-center text-white text-3xl font-bold shadow-lg transform hover:scale-105 transition-transform duration-200`}>
              {user?.fullName?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start space-x-2 mb-2">
                <span className="text-2xl">{getGreetingIcon()}</span>
                <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
                  {getGreeting()}, {user?.fullName?.split(' ')[0]}!
                </h2>
              </div>
              <p className="text-gray-600 text-lg">
                Welcome back to your dashboard
              </p>
              <div className="mt-3">
                <span className={`inline-block px-4 py-1.5 bg-gradient-to-r ${getRoleColor(user?.roleType)} text-white rounded-full text-sm font-semibold shadow-md`}>
                  {getRoleDisplay(user?.roleType)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced User Info Card */}
        <div className="bg-white rounded-3xl shadow-xl p-8 mb-8 border border-gray-100">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900">Account Information</h3>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl hover:shadow-md transition-shadow duration-200">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Full Name</p>
              <p className="text-lg font-bold text-gray-900">{user?.fullName}</p>
            </div>
            
            <div className="p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl hover:shadow-md transition-shadow duration-200">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Email</p>
              <p className="text-lg font-bold text-gray-900 break-all">{user?.email}</p>
            </div>
            
            <div className="p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl hover:shadow-md transition-shadow duration-200">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Role</p>
              <span className={`inline-block px-4 py-2 bg-gradient-to-r ${getRoleColor(user?.roleType)} text-white rounded-lg text-sm font-bold shadow-md`}>
                {getRoleDisplay(user?.roleType)}
              </span>
            </div>
            
            <div className="p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl hover:shadow-md transition-shadow duration-200">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">User ID</p>
              <p className="text-lg font-bold text-gray-900 font-mono">{user?.publicId}</p>
            </div>
            
            {user?.phone && (
              <div className="p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl hover:shadow-md transition-shadow duration-200">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Phone</p>
                <p className="text-lg font-bold text-gray-900">{user.phone}</p>
              </div>
            )}
            
            {user?.institution && (
              <div className="p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl hover:shadow-md transition-shadow duration-200">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Institution</p>
                <p className="text-lg font-bold text-gray-900">
                  {user.institution.name}
                  <span className="ml-2 text-sm font-normal text-gray-600">
                    ({user.institution.type})
                  </span>
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Enhanced Quick Actions */}
        <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900">Quick Actions</h3>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Role-specific Actions */}
            {user?.roleType === 'FACULTY' && (
              <button
                onClick={() => navigate('/attendance')}
                className="group p-6 bg-gradient-to-br from-indigo-50 to-purple-50 border-2 border-indigo-200 rounded-2xl hover:border-indigo-400 hover:shadow-xl transition-all duration-300 text-left transform hover:-translate-y-1"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                </div>
                <h4 className="font-bold text-gray-900 text-lg mb-1">Manage Attendance</h4>
                <p className="text-sm text-gray-600">Mark and view attendance for your sections</p>
              </button>
            )}

            {user?.roleType === 'STUDENT' && (
              <button
                onClick={() => navigate('/my-attendance')}
                className="group p-6 bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-2xl hover:border-blue-400 hover:shadow-xl transition-all duration-300 text-left transform hover:-translate-y-1"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h4 className="font-bold text-gray-900 text-lg mb-1">My Attendance</h4>
                <p className="text-sm text-gray-600">View your attendance records and statistics</p>
              </button>
            )}

            {user?.roleType === 'ADMIN' && (
              <button
                onClick={() => navigate('/admin')}
                className="group p-6 bg-gradient-to-br from-orange-50 to-red-50 border-2 border-orange-200 rounded-2xl hover:border-orange-400 hover:shadow-xl transition-all duration-300 text-left transform hover:-translate-y-1"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <h4 className="font-bold text-gray-900 text-lg mb-1">Admin Panel</h4>
                <p className="text-sm text-gray-600">Manage institution data and bulk imports</p>
              </button>
            )}

            <button className="group p-6 bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-200 rounded-2xl hover:border-indigo-400 hover:shadow-xl transition-all duration-300 text-left transform hover:-translate-y-1">
              <div className="w-12 h-12 bg-gradient-to-br from-gray-400 to-gray-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h4 className="font-bold text-gray-900 text-lg mb-1">Profile Settings</h4>
              <p className="text-sm text-gray-600">Update your profile information</p>
            </button>

            <button className="group p-6 bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-200 rounded-2xl hover:border-indigo-400 hover:shadow-xl transition-all duration-300 text-left transform hover:-translate-y-1">
              <div className="w-12 h-12 bg-gradient-to-br from-gray-400 to-gray-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h4 className="font-bold text-gray-900 text-lg mb-1">Reports</h4>
              <p className="text-sm text-gray-600">Generate attendance reports</p>
            </button>
          </div>
        </div>

        {/* Enhanced Role-specific Information */}
        {user?.roleType === 'FACULTY' && (
          <div className="mt-8 bg-gradient-to-r from-indigo-50 to-purple-50 border-2 border-indigo-200 rounded-2xl p-6 shadow-lg">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-indigo-900 font-bold text-lg mb-1">Faculty Dashboard</p>
                <p className="text-indigo-700">Manage attendance for all your assigned sections from the Attendance Management panel.</p>
              </div>
            </div>
          </div>
        )}

        {user?.roleType === 'STUDENT' && (
          <div className="mt-8 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl p-6 shadow-lg">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-green-900 font-bold text-lg mb-1">Student Dashboard</p>
                <p className="text-green-700">Track your attendance percentage and maintain good academic standing!</p>
              </div>
            </div>
          </div>
        )}

        {!['FACULTY', 'STUDENT'].includes(user?.roleType) && (
          <div className="mt-8 bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-2xl p-6 shadow-lg">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-blue-900 font-bold text-lg mb-1">Coming Soon</p>
                <p className="text-blue-700">More features will be added to your dashboard!</p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}