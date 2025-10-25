import { useState, useEffect } from 'react';

export default function AddUsersPanel({ type, onClose, institutionType }) {
  const [rows, setRows] = useState([createEmptyRow()]);
  const [isSaving, setIsSaving] = useState(false);
  const [saveResults, setSaveResults] = useState(null);
  const [rowErrors, setRowErrors] = useState({}); // Store errors per row: { rowId: { field: 'error message' } }

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  const typeLabel = type === 'faculty' ? 'Faculty' : 'Student';
  const typeColor = type === 'faculty' ? 'blue' : 'green';

  // Create empty row based on type and institution type
  function createEmptyRow() {
    const baseFields = {
      id: Date.now() + Math.random(),
      fullName: '',
      dateOfBirth: '',
    };

    if (type === 'faculty') {
      return {
        ...baseFields,
        email: '',
        phone: '',
        employeeId: '',
        department: '',
        designation: '',
        qualification: '',
        subject: '',
      };
    } else {
      // Student
      const studentBase = {
        ...baseFields,
        rollNumber: '',
      };

      if (institutionType === 'SCHOOL') {
        return {
          ...studentBase,
          class: '',
          section: '',
          parentName: '',
          parentEmail: '',
          parentPhone: '',
        };
      } else {
        return {
          ...studentBase,
          email: '',
          phone: '',
          department: '',
          yearOfStudy: '',
          semester: '',
        };
      }
    }
  }

  const handleAddRow = () => {
    setRows([...rows, createEmptyRow()]);
  };

  const handleRemoveRow = (id) => {
    if (rows.length === 1) {
      alert('At least one row is required');
      return;
    }
    setRows(rows.filter(row => row.id !== id));
  };

  const handleFieldChange = (id, field, value) => {
    setRows(rows.map(row =>
      row.id === id ? { ...row, [field]: value } : row
    ));

    // Clear error for this field when user starts typing
    if (rowErrors[id]?.[field]) {
      setRowErrors(prev => ({
        ...prev,
        [id]: {
          ...prev[id],
          [field]: null
        }
      }));
    }
  };

  const validateRows = () => {
    const newErrors = {};
    let hasErrors = false;

    rows.forEach((row) => {
      const errors = {};

      // Common validations
      if (!row.fullName?.trim()) {
        errors.fullName = 'Full Name is required';
        hasErrors = true;
      }
      if (!row.dateOfBirth?.trim()) {
        errors.dateOfBirth = 'Date of Birth is required';
        hasErrors = true;
      }

      if (type === 'faculty') {
        if (!row.email?.trim()) {
          errors.email = 'Email is required';
          hasErrors = true;
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(row.email)) {
          errors.email = 'Invalid email format';
          hasErrors = true;
        }
        if (!row.phone?.trim()) {
          errors.phone = 'Phone is required';
          hasErrors = true;
        } else if (!/^\d{10}$/.test(row.phone.replace(/\s/g, ''))) {
          errors.phone = 'Phone must be 10 digits';
          hasErrors = true;
        }
        if (!row.employeeId?.trim()) {
          errors.employeeId = 'Employee ID is required';
          hasErrors = true;
        }
        if (!row.department?.trim()) {
          errors.department = 'Department is required';
          hasErrors = true;
        }
        if (!row.designation?.trim()) {
          errors.designation = 'Designation is required';
          hasErrors = true;
        }
        if (!row.qualification?.trim()) {
          errors.qualification = 'Qualification is required';
          hasErrors = true;
        }
      } else {
        // Student validations
        if (!row.rollNumber?.trim()) {
          errors.rollNumber = 'Roll Number is required';
          hasErrors = true;
        }

        if (institutionType === 'SCHOOL') {
          if (!row.class?.trim()) {
            errors.class = 'Class is required';
            hasErrors = true;
          }
          if (!row.section?.trim()) {
            errors.section = 'Section is required';
            hasErrors = true;
          }
          if (!row.parentName?.trim()) {
            errors.parentName = 'Parent Name is required';
            hasErrors = true;
          }
          if (!row.parentEmail?.trim()) {
            errors.parentEmail = 'Parent Email is required';
            hasErrors = true;
          } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(row.parentEmail)) {
            errors.parentEmail = 'Invalid email format';
            hasErrors = true;
          }
          if (!row.parentPhone?.trim()) {
            errors.parentPhone = 'Parent Phone is required';
            hasErrors = true;
          } else if (!/^\d{10}$/.test(row.parentPhone.replace(/\s/g, ''))) {
            errors.parentPhone = 'Phone must be 10 digits';
            hasErrors = true;
          }
        } else {
          if (!row.email?.trim()) {
            errors.email = 'Email is required';
            hasErrors = true;
          } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(row.email)) {
            errors.email = 'Invalid email format';
            hasErrors = true;
          }
          if (!row.phone?.trim()) {
            errors.phone = 'Phone is required';
            hasErrors = true;
          } else if (!/^\d{10}$/.test(row.phone.replace(/\s/g, ''))) {
            errors.phone = 'Phone must be 10 digits';
            hasErrors = true;
          }
          if (!row.department?.trim()) {
            errors.department = 'Department is required';
            hasErrors = true;
          }
          if (!row.yearOfStudy?.trim()) {
            errors.yearOfStudy = 'Year of Study is required';
            hasErrors = true;
          }
          if (!row.semester?.trim()) {
            errors.semester = 'Semester is required';
            hasErrors = true;
          }
        }
      }

      if (Object.keys(errors).length > 0) {
        newErrors[row.id] = errors;
      }
    });

    setRowErrors(newErrors);
    return hasErrors;
  };

  const handleSave = async () => {
    // Clear previous errors
    setRowErrors({});

    // Validate all rows
    const hasErrors = validateRows();

    if (hasErrors) {
      alert('Please fix the validation errors shown below each field');
      return;
    }

    setIsSaving(true);

    try {
      // Prepare data for API
      const dataToSend = rows.map(row => {
        const { id, ...data } = row;
        return data;
      });

      const response = await fetch(`${API_URL}/admin/users/add-manual`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          type,
          users: dataToSend,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to save users');
      }

      // Check if there are any errors from backend
      if (result.data.errors && result.data.errors.length > 0) {
        // Map backend errors to row errors
        const newRowErrors = {};

        result.data.errors.forEach(err => {
          const rowIndex = err.row - 1; // Backend sends 1-based row numbers
          const row = rows[rowIndex];

          if (row) {
            // Parse error message to determine which field has the error
            const errorMsg = err.error.toLowerCase();

            if (!newRowErrors[row.id]) {
              newRowErrors[row.id] = {};
            }

            // Match error message to field
            if (errorMsg.includes('parentemail') || errorMsg.includes('parent email')) {
              newRowErrors[row.id].parentEmail = err.error;
            } else if (errorMsg.includes('parentphone') || errorMsg.includes('parent phone')) {
              newRowErrors[row.id].parentPhone = err.error;
            } else if (errorMsg.includes('email') && errorMsg.includes('already exists')) {
              newRowErrors[row.id].email = 'Email already exists';
            } else if (errorMsg.includes('email') || errorMsg.includes('user_email_key')) {
              newRowErrors[row.id].email = err.error;
            } else if (errorMsg.includes('phone') || errorMsg.includes('user_phone_key')) {
              newRowErrors[row.id].phone = 'Phone number already exists';
            } else if (errorMsg.includes('employee') || errorMsg.includes('employeeid')) {
              newRowErrors[row.id].employeeId = 'Employee ID already exists';
            } else if (errorMsg.includes('roll') || errorMsg.includes('registration')) {
              newRowErrors[row.id].rollNumber = err.error;
            } else if (errorMsg.includes('date of birth') || errorMsg.includes('dateofbirth') || errorMsg.includes('invalid date')) {
              newRowErrors[row.id].dateOfBirth = err.error;
            } else {
              // Generic error - show on fullName field or first field
              newRowErrors[row.id].fullName = err.error;
            }
          }
        });

        setRowErrors(newRowErrors);
        alert(`Some records failed to save. Please check the errors shown below each field.`);

        // If some records succeeded, show partial success
        if (result.data.created > 0 || result.data.updated > 0) {
          alert(`✅ ${result.data.created + result.data.updated} users saved successfully.\n❌ ${result.data.failed} failed (see errors below).`);
        }
      } else {
        // All successful
        setSaveResults(result.data);
      }
    } catch (error) {
      console.error('Save error:', error);
      alert(`Failed to save users: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setRows([createEmptyRow()]);
    setSaveResults(null);
  };

  const handleClose = () => {
    if (saveResults) {
      onClose(true); // Refresh parent
    } else {
      onClose(false);
    }
  };

  // Render success view
  if (saveResults) {
    const totalAttempted = saveResults.created + saveResults.updated + saveResults.failed;
    const successRate = Math.round(((saveResults.created + saveResults.updated) / totalAttempted) * 100);

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
          {/* Header */}
          <div className={`bg-gradient-to-r from-${typeColor}-500 to-${typeColor}-600 p-6 text-white`}>
            <h2 className="text-2xl font-bold">✅ Users Added Successfully!</h2>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Results Summary */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-green-50 rounded-lg p-6 text-center border border-green-200">
                <div className="text-3xl font-bold text-green-600">{saveResults.created}</div>
                <div className="text-sm text-gray-700 mt-1">New Records Created</div>
              </div>
              <div className="bg-blue-50 rounded-lg p-6 text-center border border-blue-200">
                <div className="text-3xl font-bold text-blue-600">{saveResults.updated}</div>
                <div className="text-sm text-gray-700 mt-1">Existing Records Updated</div>
              </div>
              <div className="bg-red-50 rounded-lg p-6 text-center border border-red-200">
                <div className="text-3xl font-bold text-red-600">{saveResults.failed}</div>
                <div className="text-sm text-gray-700 mt-1">Failed</div>
              </div>
            </div>

            {/* Success Rate */}
            <div className="bg-white rounded-lg p-6 border">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-gray-700">Success Rate</span>
                <span className="text-2xl font-bold text-green-600">{successRate}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-green-600 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${successRate}%` }}
                ></div>
              </div>
            </div>

            {/* Error Details (if any) */}
            {saveResults.errors && saveResults.errors.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h4 className="font-semibold text-red-900 mb-3">
                  ⚠️ Failed Records ({saveResults.errors.length})
                </h4>
                <div className="max-h-48 overflow-y-auto space-y-2">
                  {saveResults.errors.map((err, idx) => (
                    <div key={idx} className="bg-white rounded p-3 text-sm">
                      <div className="font-medium text-red-800">Row {err.row}</div>
                      <div className="text-red-600">{err.error}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Next Steps */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h4 className="font-semibold text-blue-900 mb-3">💡 What's Next?</h4>
              <ul className="list-disc list-inside text-sm text-blue-800 space-y-2">
                <li>All imported users can now log in with their credentials</li>
                <li>Default passwords: First 4 letters of FIRST NAME + Last 4 digits of phone</li>
                <li>⚠️ Advise all users to change their password after first login</li>
              </ul>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-6 py-4 border-t flex items-center justify-between">
            <button
              onClick={handleReset}
              className={`px-6 py-2 bg-${typeColor}-600 text-white rounded-lg hover:bg-${typeColor}-700 font-medium transition-colors`}
            >
              Add More Users
            </button>
            <button
              onClick={handleClose}
              className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Render form view
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-7xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className={`bg-gradient-to-r from-${typeColor}-500 to-${typeColor}-600 p-6 text-white`}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Add {typeLabel} Manually</h2>
              <p className="text-sm opacity-90 mt-1">Fill in the details below and add multiple rows if needed</p>
            </div>
            <button
              onClick={handleClose}
              className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-colors"
            >
              <span className="text-2xl">×</span>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-4">
            {rows.map((row, index) => (
              <RowForm
                key={row.id}
                row={row}
                index={index}
                type={type}
                institutionType={institutionType}
                onFieldChange={handleFieldChange}
                onRemove={handleRemoveRow}
                canRemove={rows.length > 1}
                errors={rowErrors[row.id] || {}}
              />
            ))}

            <button
              onClick={handleAddRow}
              className={`w-full py-3 border-2 border-dashed border-${typeColor}-300 rounded-lg text-${typeColor}-600 hover:bg-${typeColor}-50 font-medium transition-colors`}
            >
              + Add Another Row
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 border-t flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Total Rows: <span className="font-semibold">{rows.length}</span>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleClose}
              disabled={isSaving}
              className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className={`px-6 py-2 bg-${typeColor}-600 text-white rounded-lg hover:bg-${typeColor}-700 font-medium transition-colors disabled:opacity-50`}
            >
              {isSaving ? 'Saving...' : `Save All ${rows.length} ${rows.length === 1 ? 'User' : 'Users'}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Individual row form component
function RowForm({ row, index, type, institutionType, onFieldChange, onRemove, canRemove, errors }) {
  // Dropdown options
  const SCHOOL_DEPARTMENTS = ['English', 'Physics', 'Chemistry', 'Mathematics', 'Biology', 'History', 'Geography', 'Economics', 'Computer Science', 'Physical Education'];

  const COLLEGE_DEPARTMENTS = [
    'Computer Science Engineering',
    'Mechanical Engineering',
    'Civil Engineering',
    'Electrical Engineering',
    'Electronics and Communication',
    'Information Technology',
    'Business Administration',
    'Commerce',
    'Arts',
    'Science'
  ];

  const DESIGNATIONS = [
    'Professor',
    'Associate Professor',
    'Assistant Professor',
    'Lecturer',
    'Senior Lecturer',
    'Guest Lecturer',
    'Teaching Assistant'
  ];

  const QUALIFICATIONS = [
    'B.Ed',
    'M.Ed',
    'Ph.D',
    'B.Tech',
    'M.Tech',
    'B.Sc',
    'M.Sc',
    'B.A',
    'M.A',
    'B.Com',
    'M.Com',
    'BBA',
    'MBA',
    'Other'
  ];

  const SUBJECTS = [
    'English',
    'Physics',
    'Chemistry',
    'Mathematics',
    'Biology',
    'History',
    'Geography',
    'Economics',
    'Computer Science',
    'Physical Education',
    'Hindi',
    'Sanskrit',
    'Social Studies',
    'General Science'
  ];

  const renderField = (label, field, fieldType = 'text', options = null) => {
    const hasError = errors[field];
    const borderClass = hasError ? 'border-red-500' : 'border-gray-300';

    if (options) {
      return (
        <div className="flex-1 min-w-[200px]">
          <label className="block text-xs font-medium text-gray-700 mb-1">{label}</label>
          <select
            value={row[field] || ''}
            onChange={(e) => onFieldChange(row.id, field, e.target.value)}
            className={`w-full px-3 py-2 border ${borderClass} rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
          >
            <option value="">Select...</option>
            {options.map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
          {hasError && (
            <p className="text-xs text-red-600 mt-1">{hasError}</p>
          )}
        </div>
      );
    }

    return (
      <div className="flex-1 min-w-[200px]">
        <label className="block text-xs font-medium text-gray-700 mb-1">{label}</label>
        <input
          type={fieldType}
          value={row[field] || ''}
          onChange={(e) => onFieldChange(row.id, field, e.target.value)}
          className={`w-full px-3 py-2 border ${borderClass} rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
          placeholder={label}
        />
        {hasError && (
          <p className="text-xs text-red-600 mt-1">{hasError}</p>
        )}
      </div>
    );
  };

  return (
    <div className="bg-gray-50 rounded-lg p-4 border-2 border-gray-200">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-semibold text-gray-900">Row {index + 1}</h4>
        {canRemove && (
          <button
            onClick={() => onRemove(row.id)}
            className="text-red-600 hover:text-red-800 text-sm font-medium"
          >
            🗑️ Remove
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-3">
        {/* Common fields */}
        {renderField('Full Name *', 'fullName')}
        {renderField('Date of Birth *', 'dateOfBirth', 'date')}

        {/* Type-specific fields */}
        {type === 'faculty' && (
          <>
            {renderField('Email *', 'email', 'email')}
            {renderField('Phone * (10 digits)', 'phone', 'tel')}
            {renderField('Employee ID *', 'employeeId')}
            {renderField('Department *', 'department', 'text', institutionType === 'SCHOOL' ? SCHOOL_DEPARTMENTS : COLLEGE_DEPARTMENTS)}
            {renderField('Designation *', 'designation', 'text', DESIGNATIONS)}
            {renderField('Qualification *', 'qualification', 'text', QUALIFICATIONS)}
            {renderField('Subject', 'subject', 'text', SUBJECTS)}
          </>
        )}

        {type === 'student' && institutionType === 'SCHOOL' && (
          <>
            {renderField('Roll Number *', 'rollNumber')}
            {renderField('Class *', 'class')}
            {renderField('Section *', 'section')}
            {renderField('Parent Name *', 'parentName')}
            {renderField('Parent Email *', 'parentEmail', 'email')}
            {renderField('Parent Phone * (10 digits)', 'parentPhone', 'tel')}
          </>
        )}

        {type === 'student' && institutionType === 'COLLEGE' && (
          <>
            {renderField('Email *', 'email', 'email')}
            {renderField('Phone * (10 digits)', 'phone', 'tel')}
            {renderField('Roll/Reg Number *', 'rollNumber')}
            {renderField('Department *', 'department', 'text', COLLEGE_DEPARTMENTS)}
            {renderField('Year of Study *', 'yearOfStudy', 'text', ['1', '2', '3', '4', '5'])}
            {renderField('Semester *', 'semester', 'text', ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'])}
          </>
        )}
      </div>
    </div>
  );
}
