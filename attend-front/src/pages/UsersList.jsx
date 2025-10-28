import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import EditUserModal from '../components/EditUserModal';

export default function UsersList() {
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Get type from URL (faculty or students)
  const type = searchParams.get('type') || 'students';

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [institutionTypeFromBackend, setInstitutionTypeFromBackend] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });

  // Edit modal states
  const [editingUser, setEditingUser] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  // Filter states
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('');
  const [designation, setDesignation] = useState('');
  const [qualification, setQualification] = useState('');
  const [studentClass, setStudentClass] = useState('');
  const [section, setSection] = useState('');
  const [yearOfStudy, setYearOfStudy] = useState('');
  const [parentPhone, setParentPhone] = useState('');

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  // Use institution type from backend response (more reliable)
  const institutionType = institutionTypeFromBackend || currentUser?.adminProfile?.institutionType;

  useEffect(() => {
    fetchUsers();
  }, [type, pagination.page]);

  const fetchUsers = async () => {
    try {
      setLoading(true);

      // Build query params
      const params = new URLSearchParams({
        page: pagination.page,
        limit: pagination.limit,
      });

      // Institution ID is automatically taken from logged-in admin (backend)
      if (search) params.append('search', search);

      if (type === 'faculty') {
        if (department) params.append('department', department);
        if (designation) params.append('designation', designation);
        if (qualification) params.append('qualification', qualification);
      } else {
        if (studentClass) params.append('class', studentClass);
        if (section) params.append('section', section);
        if (department) params.append('department', department);
        if (yearOfStudy) params.append('yearOfStudy', yearOfStudy);
        if (parentPhone) params.append('parentPhone', parentPhone);
      }

      const endpoint = type === 'faculty' ? '/admin/faculty' : '/admin/students';
      const response = await fetch(`${API_URL}${endpoint}?${params}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        setUsers(data.data[type] ?? []);
        setPagination(data.data.pagination);
        // Set institution type from backend response
        if (data.data.institutionType) {
          setInstitutionTypeFromBackend(data.data.institutionType);
        }
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPagination(prev => ({ ...prev, page: 1 }));
    fetchUsers();
  };

  const handleClearFilters = () => {
    setSearch('');
    setDepartment('');
    setDesignation('');
    setQualification('');
    setStudentClass('');
    setSection('');
    setYearOfStudy('');
    setParentPhone('');
    setPagination(prev => ({ ...prev, page: 1 }));
    fetchUsers();
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const handleTypeChange = (newType) => {
    setSearchParams({ type: newType });
    handleClearFilters();
  };

  const handleEditUser = (user) => {
    setEditingUser(user);

    const profile = type === 'faculty'
      ? (user.facultySchoolProfile || user.facultyCollegeProfile)
      : (user.studentSchoolProfile || user.studentCollegeProfile);

    // Prepare form data based on user type
    const formData = {
      fullName: user.fullName || '',
      email: user.email || '',
      phone: user.phone || '',
    };

    if (type === 'faculty') {
      formData.employeeId = profile?.employeeId || '';
      formData.department = profile?.department || '';
      formData.designation = profile?.designation || '';
      formData.qualification = profile?.qualification || '';
      formData.subject = profile?.subject || '';
    } else {
      // Student
      formData.dateOfBirth = profile?.dob ? new Date(profile.dob).toISOString().split('T')[0] : '';
      formData.rollNumber = profile?.rollNo || profile?.regNo || '';

      if (institutionType === 'SCHOOL') {
        formData.class = profile?.class || '';
        formData.section = profile?.section || '';
        formData.parentName = profile?.parentName || '';
        formData.parentEmail = profile?.parentEmail || '';
        formData.parentPhone = profile?.parentPhone || '';
      } else if (institutionType === 'COLLEGE') {
        formData.department = profile?.department || '';
        formData.yearOfStudy = profile?.yearOfStudy?.toString() || '';
        formData.semester = profile?.semester?.toString() || '';
      }
    }

    setEditFormData(formData);
  };

  const handleCloseEditModal = () => {
    setEditingUser(null);
    setEditFormData({});
  };

  const handleSaveEdit = async (formData) => {
    try {
      setIsSaving(true);

      const response = await fetch(`${API_URL}/admin/users/${editingUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        // Refresh the user list
        await fetchUsers();
        handleCloseEditModal();

        // Show success message
        const successDiv = document.createElement('div');
        successDiv.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
        successDiv.textContent = '✓ User updated successfully!';
        document.body.appendChild(successDiv);
        setTimeout(() => successDiv.remove(), 3000);
      } else {
        // Show error alert
        alert(`❌ Failed to update user:\n\n${data.message}`);
      }
    } catch (error) {
      console.error('Error updating user:', error);
      alert('❌ Failed to update user. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const typeLabel = type === 'faculty' ? 'Faculty' : 'Students';
  const typeColor = type === 'faculty' ? 'blue' : 'green';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">View {typeLabel}</h1>
              <p className="mt-1 text-gray-600">Browse and search {typeLabel.toLowerCase()} in your institution</p>
            </div>
            <button
              onClick={() => navigate('/admin')}
              className="px-4 py-2 text-indigo-600 hover:text-indigo-800 font-medium"
            >
              ← Back to Admin
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Type Toggle */}
        <div className="mb-6 flex gap-4">
          <button
            onClick={() => handleTypeChange('students')}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              type === 'students'
                ? 'bg-green-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
            }`}
          >
            👨‍🎓 Students
          </button>
          <button
            onClick={() => handleTypeChange('faculty')}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              type === 'faculty'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
            }`}
          >
            👨‍🏫 Faculty
          </button>
        </div>

        {/* Filters Card */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Filters</h2>

          <form onSubmit={handleSearch} className="space-y-4">
            {/* Search Box */}
            <div className="flex gap-4">
              <input
                type="text"
                placeholder={`Search by name, email${type === 'students' ? ', or roll number' : ''}...`}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              <button
                type="submit"
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium"
              >
                🔍 Search
              </button>
            </div>

            {/* Faculty Filters */}
            {type === 'faculty' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input
                  type="text"
                  placeholder="Department"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                {institutionType === 'COLLEGE' && (
                  <input
                    type="text"
                    placeholder="Designation"
                    value={designation}
                    onChange={(e) => setDesignation(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                )}
                <input
                  type="text"
                  placeholder="Qualification"
                  value={qualification}
                  onChange={(e) => setQualification(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}

            {/* Student Filters - School */}
            {type === 'students' && institutionType === 'SCHOOL' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input
                  type="text"
                  placeholder="Class (e.g., 10)"
                  value={studentClass}
                  onChange={(e) => setStudentClass(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                />
                <input
                  type="text"
                  placeholder="Section (e.g., A)"
                  value={section}
                  onChange={(e) => setSection(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                />
                <input
                  type="text"
                  placeholder="Parent Phone"
                  value={parentPhone}
                  onChange={(e) => setParentPhone(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                />
              </div>
            )}

            {/* Student Filters - College */}
            {type === 'students' && institutionType === 'COLLEGE' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Department"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                />
                <input
                  type="number"
                  placeholder="Year of Study (1-4)"
                  value={yearOfStudy}
                  onChange={(e) => setYearOfStudy(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                />
              </div>
            )}

            <button
              type="button"
              onClick={handleClearFilters}
              className="text-gray-600 hover:text-gray-800 text-sm font-medium"
            >
              ✕ Clear all filters
            </button>
          </form>
        </div>

        {/* Results */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className={`bg-gradient-to-r from-${typeColor}-500 to-${typeColor}-600 p-4 text-white flex items-center justify-between`}>
            <h2 className="text-xl font-bold">
              {pagination.total} {typeLabel} Found
            </h2>
            <span className="text-sm text-white opacity-90">
              Page {pagination.page} of {pagination.totalPages}
            </span>
          </div>

          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading {typeLabel.toLowerCase()}...</p>
            </div>
          ) : users.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <p>No {typeLabel.toLowerCase()} found matching your filters.</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      {type === 'faculty' ? (
                        <>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Department
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            {institutionType === 'COLLEGE' ? 'Designation' : 'Employee ID'}
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Qualification
                          </th>
                        </>
                      ) : (
                        <>
                          {institutionType === 'SCHOOL' ? (
                            <>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Class/Section
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Roll No
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Parent Phone
                              </th>
                            </>
                          ) : (
                            <>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Department
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Year/Semester
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Reg No
                              </th>
                            </>
                          )}
                        </>
                      )}
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {users.map((user) => {
                      const profile = type === 'faculty'
                        ? (user.facultySchoolProfile || user.facultyCollegeProfile)
                        : (user.studentSchoolProfile || user.studentCollegeProfile);

                      return (
                        <tr key={user.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{user.fullName}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">{user.email}</div>
                          </td>
                          {type === 'faculty' ? (
                            <>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {profile?.department || '-'}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {institutionType === 'COLLEGE'
                                  ? (profile?.designation || '-')
                                  : (profile?.employeeId || '-')}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {profile?.qualification || '-'}
                              </td>
                            </>
                          ) : (
                            <>
                              {institutionType === 'SCHOOL' ? (
                                <>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {profile?.class}/{profile?.section}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {profile?.rollNo}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {profile?.parentPhone || '-'}
                                  </td>
                                </>
                              ) : (
                                <>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {profile?.department}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    Year {profile?.yearOfStudy}, Sem {profile?.semester}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {profile?.regNo}
                                  </td>
                                </>
                              )}
                            </>
                          )}
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <button
                              onClick={() => handleEditUser(user)}
                              className="text-blue-600 hover:text-blue-800 font-medium"
                            >
                              Edit
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-t border-gray-200">
                  <button
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page === 1}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <span className="text-sm text-gray-700">
                    Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
                  </span>
                  <button
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page === pagination.totalPages}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {/* Edit User Modal */}
      {editingUser && (
        <EditUserModal
          user={editingUser}
          type={type}
          institutionType={institutionType}
          formData={editFormData}
          onSave={handleSaveEdit}
          onClose={handleCloseEditModal}
          isSaving={isSaving}
        />
      )}
    </div>
  );
}
