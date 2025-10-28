import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function SectionManagement() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [sections, setSections] = useState([]);
  const [institutionType, setInstitutionType] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Students modal state
  const [showStudentsModal, setShowStudentsModal] = useState(false);
  const [selectedSection, setSelectedSection] = useState(null);
  const [sectionStudents, setSectionStudents] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(false);

  // Faculty assignment modal state
  const [showAssignFacultyModal, setShowAssignFacultyModal] = useState(false);
  const [facultyList, setFacultyList] = useState([]);
  const [loadingFaculty, setLoadingFaculty] = useState(false);
  const [assignmentData, setAssignmentData] = useState({
    facultyUserId: '',
    subject: '',
  });
  const [isAssigning, setIsAssigning] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    schoolClass: '',
    schoolSection: '',
    board: '',
    department: '',
    yearOfStudy: '',
    semester: '',
    collegeSection: '',
    batch: '',
    sectionType: '',
    maxCapacity: '',
    roomNumber: '',
  });

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    fetchSections();
  }, []);

  const fetchSections = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/admin/sections`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        setSections(data.data.sections);
        setInstitutionType(data.data.institutionType || user?.institution?.type);
      }
    } catch (error) {
      console.error('Error fetching sections:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSection = async (e) => {
    e.preventDefault();

    try {
      setIsSaving(true);

      const response = await fetch(`${API_URL}/admin/sections`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        await fetchSections();
        setShowCreateModal(false);
        resetForm();

        // Show success message
        const successDiv = document.createElement('div');
        successDiv.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
        successDiv.textContent = '✓ Section created successfully!';
        document.body.appendChild(successDiv);
        setTimeout(() => successDiv.remove(), 3000);
      } else {
        alert(`Failed to create section: ${data.message}`);
      }
    } catch (error) {
      console.error('Error creating section:', error);
      alert('Failed to create section');
    } finally {
      setIsSaving(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      schoolClass: '',
      schoolSection: '',
      board: '',
      department: '',
      yearOfStudy: '',
      semester: '',
      collegeSection: '',
      batch: '',
      sectionType: '',
      maxCapacity: '',
      roomNumber: '',
    });
  };

  const handleSyncSection = async (sectionId) => {
    try {
      const confirmed = window.confirm('This will enroll all matching students into this section. Continue?');
      if (!confirmed) return;

      const response = await fetch(`${API_URL}/admin/sections/${sectionId}/sync-enrollments`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        await fetchSections();

        // Show success message
        const successDiv = document.createElement('div');
        successDiv.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
        successDiv.textContent = `✓ ${data.message}`;
        document.body.appendChild(successDiv);
        setTimeout(() => successDiv.remove(), 3000);
      } else {
        alert(`Failed to sync enrollments: ${data.message}`);
      }
    } catch (error) {
      console.error('Error syncing section:', error);
      alert('Failed to sync enrollments');
    }
  };

  const handleViewStudents = async (section) => {
    try {
      setSelectedSection(section);
      setShowStudentsModal(true);
      setLoadingStudents(true);

      const response = await fetch(`${API_URL}/admin/sections/${section.id}/enrollments`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        setSectionStudents(data.data);
      } else {
        alert(`Failed to fetch students: ${data.message}`);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
      alert('Failed to fetch students');
    } finally {
      setLoadingStudents(false);
    }
  };

  const handleAssignFaculty = async (section) => {
    try {
      setSelectedSection(section);
      setShowAssignFacultyModal(true);
      setLoadingFaculty(true);

      // Fetch faculty list
      const response = await fetch(`${API_URL}/admin/faculty`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        setFacultyList(data.data);
      } else {
        alert(`Failed to fetch faculty: ${data.message}`);
      }
    } catch (error) {
      console.error('Error fetching faculty:', error);
      alert('Failed to fetch faculty');
    } finally {
      setLoadingFaculty(false);
    }
  };

  const handleSubmitAssignment = async (e) => {
    e.preventDefault();

    if (!assignmentData.facultyUserId) {
      alert('Please select a faculty member');
      return;
    }

    try {
      setIsAssigning(true);

      const response = await fetch(`${API_URL}/admin/faculty-assignments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          facultyUserId: parseInt(assignmentData.facultyUserId),
          sectionId: selectedSection.id,
          subject: assignmentData.subject || null,
        }),
      });

      const data = await response.json();

      if (data.success) {
        await fetchSections();
        setShowAssignFacultyModal(false);
        setAssignmentData({ facultyUserId: '', subject: '' });

        // Show success message
        const successDiv = document.createElement('div');
        successDiv.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
        successDiv.textContent = '✓ Faculty assigned successfully!';
        document.body.appendChild(successDiv);
        setTimeout(() => successDiv.remove(), 3000);
      } else {
        alert(`Failed to assign faculty: ${data.message}`);
      }
    } catch (error) {
      console.error('Error assigning faculty:', error);
      alert('Failed to assign faculty');
    } finally {
      setIsAssigning(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    // Auto-generate section name based on type
    if (institutionType === 'SCHOOL') {
      if (field === 'schoolClass' || field === 'schoolSection' || field === 'board') {
        const updatedData = { ...formData, [field]: value };
        const className = updatedData.schoolClass;
        const section = updatedData.schoolSection;
        const board = updatedData.board;

        if (className && section) {
          const name = board
            ? `Class ${className} ${section} - ${board}`
            : `Class ${className} ${section}`;
          setFormData(prev => ({ ...prev, name }));
        }
      }
    } else if (institutionType === 'COLLEGE') {
      if (field === 'department' || field === 'yearOfStudy' || field === 'semester' || field === 'collegeSection' || field === 'batch') {
        const updatedData = { ...formData, [field]: value };
        const dept = updatedData.department;
        const year = updatedData.yearOfStudy;
        const sem = updatedData.semester;
        const section = updatedData.collegeSection;
        const batch = updatedData.batch;

        if (dept && year && sem) {
          let name = `${dept} - Year ${year} - Sem ${sem}`;
          if (section) {
            name += ` - Section ${section}`;
          }
          if (batch) {
            name += ` - ${batch}`;
          }
          setFormData(prev => ({ ...prev, name }));
        }
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Section Management</h1>
              <p className="text-sm text-gray-600 mt-1">
                Manage classes and sections for your institution
              </p>
            </div>
            <button
              onClick={() => navigate('/admin')}
              className="px-4 py-2 text-gray-700 hover:text-gray-900"
            >
              ← Back to Dashboard
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Create Section Button */}
        <div className="mb-6 flex justify-between items-center">
          <div className="text-sm text-gray-600">
            Total Sections: <span className="font-semibold text-gray-900">{sections.length}</span>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium transition-colors"
          >
            + Create New Section
          </button>
        </div>

        {/* Sections List */}
        <div className="bg-white rounded-lg shadow">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading sections...</p>
            </div>
          ) : sections.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📚</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Sections Yet</h3>
              <p className="text-gray-600 mb-4">Create your first section to get started</p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium transition-colors"
              >
                Create Section
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Section Name
                    </th>
                    {institutionType === 'SCHOOL' && (
                      <>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Class
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Section
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Board
                        </th>
                      </>
                    )}
                    {institutionType === 'COLLEGE' && (
                      <>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Department
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Year
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Semester
                        </th>
                      </>
                    )}
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Students
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Faculty
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {sections.map((section) => (
                    <tr
                      key={section.id}
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={() => handleViewStudents(section)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{section.name}</div>
                        <div className="text-xs text-gray-500">{section.publicId}</div>
                      </td>
                      {institutionType === 'SCHOOL' && (
                        <>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {section.schoolClass || '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {section.schoolSection || '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {section.board || '-'}
                          </td>
                        </>
                      )}
                      {institutionType === 'COLLEGE' && (
                        <>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {section.department || '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {section.yearOfStudy || '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {section.semester || '-'}
                          </td>
                        </>
                      )}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                          {section._count.enrollments} students
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                          {section._count.facultySections} faculty
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex gap-3">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSyncSection(section.id);
                            }}
                            className="text-indigo-600 hover:text-indigo-900 font-medium"
                            title="Sync students to this section"
                          >
                            🔄 Sync
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAssignFaculty(section);
                            }}
                            className="text-green-600 hover:text-green-900 font-medium"
                            title="Assign faculty to this section"
                          >
                            👨‍🏫 Assign
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Create Section Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-900">Create New Section</h3>
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    resetForm();
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <span className="text-2xl">×</span>
                </button>
              </div>

              <form onSubmit={handleCreateSection} className="space-y-4">
                {institutionType === 'SCHOOL' ? (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Class <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={formData.schoolClass}
                        onChange={(e) => handleChange('schoolClass', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        required
                      >
                        <option value="">Select Class</option>
                        {[...Array(12)].map((_, i) => (
                          <option key={i + 1} value={i + 1}>{i + 1}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Section <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={formData.schoolSection}
                        onChange={(e) => handleChange('schoolSection', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        required
                      >
                        <option value="">Select Section</option>
                        {['A', 'B', 'C', 'D', 'E', 'F'].map(sec => (
                          <option key={sec} value={sec}>{sec}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Board
                      </label>
                      <select
                        value={formData.board}
                        onChange={(e) => handleChange('board', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      >
                        <option value="">Select Board (Optional)</option>
                        <option value="CBSE">CBSE</option>
                        <option value="ICSE">ICSE</option>
                        <option value="State">State Board</option>
                        <option value="IB">IB</option>
                      </select>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Department <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={formData.department}
                        onChange={(e) => handleChange('department', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        required
                      >
                        <option value="">Select Department</option>
                        <option value="Computer Science">Computer Science</option>
                        <option value="Mechanical">Mechanical Engineering</option>
                        <option value="Civil">Civil Engineering</option>
                        <option value="Electrical">Electrical Engineering</option>
                        <option value="Electronics">Electronics Engineering</option>
                        <option value="IT">Information Technology</option>
                        <option value="Commerce">Commerce</option>
                        <option value="Arts">Arts</option>
                        <option value="Science">Science</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Year of Study <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={formData.yearOfStudy}
                        onChange={(e) => handleChange('yearOfStudy', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        required
                      >
                        <option value="">Select Year</option>
                        {[1, 2, 3, 4, 5].map(year => (
                          <option key={year} value={year}>Year {year}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Semester <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={formData.semester}
                        onChange={(e) => handleChange('semester', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        required
                      >
                        <option value="">Select Semester</option>
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(sem => (
                          <option key={sem} value={sem}>Semester {sem}</option>
                        ))}
                      </select>
                    </div>

                    {/* NEW FIELDS FOR COLLEGE SECTIONS */}
                    <div className="col-span-2 border-t pt-4">
                      <p className="text-sm font-medium text-gray-700 mb-3">Division & Batch Details (Optional but Recommended)</p>
                      <p className="text-xs text-gray-600 mb-4">
                        For large departments (e.g., 400 students), divide them into sections (A, B, C...) following AICTE norms (60 students per section)
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Section / Division
                      </label>
                      <select
                        value={formData.collegeSection}
                        onChange={(e) => handleChange('collegeSection', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      >
                        <option value="">No Section (All Students)</option>
                        {['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'].map(sec => (
                          <option key={sec} value={sec}>Section {sec}</option>
                        ))}
                      </select>
                      <p className="text-xs text-gray-500 mt-1">Typically 60 students per section (AICTE norm)</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Batch / Shift
                      </label>
                      <select
                        value={formData.batch}
                        onChange={(e) => handleChange('batch', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      >
                        <option value="">No Batch</option>
                        <option value="Morning">Morning Batch</option>
                        <option value="Evening">Evening Batch</option>
                        <option value="Weekend">Weekend Batch</option>
                      </select>
                      <p className="text-xs text-gray-500 mt-1">For colleges with multiple shifts</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Section Type
                      </label>
                      <select
                        value={formData.sectionType}
                        onChange={(e) => handleChange('sectionType', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      >
                        <option value="">Select Type</option>
                        <option value="Theory">Theory Class</option>
                        <option value="Lab">Lab Session</option>
                        <option value="Tutorial">Tutorial</option>
                        <option value="Elective">Elective</option>
                      </select>
                      <p className="text-xs text-gray-500 mt-1">Helps organize different types of classes</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Max Capacity
                      </label>
                      <input
                        type="number"
                        value={formData.maxCapacity}
                        onChange={(e) => handleChange('maxCapacity', e.target.value)}
                        placeholder="e.g., 60 for theory, 30 for lab"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      />
                      <p className="text-xs text-gray-500 mt-1">Maximum students allowed in this section</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Room Number
                      </label>
                      <input
                        type="text"
                        value={formData.roomNumber}
                        onChange={(e) => handleChange('roomNumber', e.target.value)}
                        placeholder="e.g., Lab 101, Room 305"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      />
                      <p className="text-xs text-gray-500 mt-1">Classroom or lab assignment</p>
                    </div>
                  </>
                )}

                {/* Auto-generated Section Name (Preview) */}
                {formData.name && (
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <strong>Section Name:</strong> {formData.name}
                    </p>
                  </div>
                )}

                <div className="flex justify-end gap-3 pt-4 border-t">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateModal(false);
                      resetForm();
                    }}
                    disabled={isSaving}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving || !formData.name}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium transition-colors disabled:opacity-50"
                  >
                    {isSaving ? 'Creating...' : 'Create Section'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Students Modal */}
      {showStudentsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Header */}
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    Students in {selectedSection?.name}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {selectedSection?.publicId} • {sectionStudents.length} student(s)
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowStudentsModal(false);
                    setSelectedSection(null);
                    setSectionStudents([]);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <span className="text-2xl">×</span>
                </button>
              </div>

              {/* Students List */}
              {loadingStudents ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                  <p className="mt-4 text-gray-600">Loading students...</p>
                </div>
              ) : sectionStudents.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">👨‍🎓</div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">No Students Enrolled</h4>
                  <p className="text-gray-600 mb-4">
                    Click the "🔄 Sync" button to enroll matching students
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Student Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          ID
                        </th>
                        {institutionType === 'SCHOOL' && (
                          <>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Class
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Roll No
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Parent
                            </th>
                          </>
                        )}
                        {institutionType === 'COLLEGE' && (
                          <>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Email
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Reg No
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Year/Sem
                            </th>
                          </>
                        )}
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {sectionStudents.map((enrollment) => (
                        <tr key={enrollment.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {enrollment.student.fullName}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {enrollment.student.publicId}
                          </td>
                          {institutionType === 'SCHOOL' && (
                            <>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {enrollment.student.studentSchoolProfile?.class} {enrollment.student.studentSchoolProfile?.section}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {enrollment.student.studentSchoolProfile?.rollNo}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                <div>{enrollment.student.studentSchoolProfile?.parentName}</div>
                                <div className="text-xs text-gray-500">{enrollment.student.studentSchoolProfile?.parentPhone}</div>
                              </td>
                            </>
                          )}
                          {institutionType === 'COLLEGE' && (
                            <>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                {enrollment.student.email}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {enrollment.student.studentCollegeProfile?.regNo}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                Year {enrollment.student.studentCollegeProfile?.yearOfStudy} / Sem {enrollment.student.studentCollegeProfile?.semester}
                              </td>
                            </>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Footer */}
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => {
                    setShowStudentsModal(false);
                    setSelectedSection(null);
                    setSectionStudents([]);
                  }}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Assign Faculty Modal */}
      {showAssignFacultyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              {/* Header */}
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    Assign Faculty
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {selectedSection?.name}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowAssignFacultyModal(false);
                    setSelectedSection(null);
                    setAssignmentData({ facultyUserId: '', subject: '' });
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <span className="text-2xl">×</span>
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmitAssignment} className="space-y-4">
                {/* Faculty Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Select Faculty <span className="text-red-500">*</span>
                  </label>
                  {loadingFaculty ? (
                    <div className="text-center py-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600 mx-auto"></div>
                      <p className="text-xs text-gray-600 mt-2">Loading faculty...</p>
                    </div>
                  ) : (
                    <select
                      value={assignmentData.facultyUserId}
                      onChange={(e) => setAssignmentData(prev => ({ ...prev, facultyUserId: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      required
                    >
                      <option value="">Select a faculty member</option>
                      {facultyList.map((faculty) => (
                        <option key={faculty.id} value={faculty.id}>
                          {faculty.fullName} ({faculty.email})
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                {/* Subject */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Subject (Optional)
                  </label>
                  <input
                    type="text"
                    value={assignmentData.subject}
                    onChange={(e) => setAssignmentData(prev => ({ ...prev, subject: e.target.value }))}
                    placeholder="e.g., Mathematics, Physics, English"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Specify which subject this faculty will teach for this section
                  </p>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3 pt-4 border-t">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAssignFacultyModal(false);
                      setSelectedSection(null);
                      setAssignmentData({ facultyUserId: '', subject: '' });
                    }}
                    disabled={isAssigning}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isAssigning || !assignmentData.facultyUserId}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-colors disabled:opacity-50"
                  >
                    {isAssigning ? 'Assigning...' : 'Assign Faculty'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
