import { useState, useEffect } from 'react';

export default function AddUsersPanel({ type, onClose, institutionType }) {
  const [rows, setRows] = useState([createEmptyRow()]);
  const [isSaving, setIsSaving] = useState(false);
  const [saveResults, setSaveResults] = useState(null);

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
  };

  const validateRows = () => {
    const errors = [];

    rows.forEach((row, index) => {
      const rowErrors = [];

      // Common validations
      if (!row.fullName?.trim()) rowErrors.push('Full Name is required');
      if (!row.dateOfBirth?.trim()) rowErrors.push('Date of Birth is required');

      if (type === 'faculty') {
        if (!row.email?.trim()) rowErrors.push('Email is required');
        if (!row.phone?.trim()) rowErrors.push('Phone is required');
        if (!row.employeeId?.trim()) rowErrors.push('Employee ID is required');
        if (!row.department?.trim()) rowErrors.push('Department is required');
        if (!row.designation?.trim()) rowErrors.push('Designation is required');
        if (!row.qualification?.trim()) rowErrors.push('Qualification is required');
      } else {
        // Student validations
        if (!row.rollNumber?.trim()) rowErrors.push('Roll Number is required');

        if (institutionType === 'SCHOOL') {
          if (!row.class?.trim()) rowErrors.push('Class is required');
          if (!row.section?.trim()) rowErrors.push('Section is required');
          if (!row.parentName?.trim()) rowErrors.push('Parent Name is required');
          if (!row.parentEmail?.trim()) rowErrors.push('Parent Email is required');
          if (!row.parentPhone?.trim()) rowErrors.push('Parent Phone is required');
        } else {
          if (!row.email?.trim()) rowErrors.push('Email is required');
          if (!row.phone?.trim()) rowErrors.push('Phone is required');
          if (!row.department?.trim()) rowErrors.push('Department is required');
          if (!row.yearOfStudy?.trim()) rowErrors.push('Year of Study is required');
          if (!row.semester?.trim()) rowErrors.push('Semester is required');
        }
      }

      if (rowErrors.length > 0) {
        errors.push({ row: index + 1, errors: rowErrors });
      }
    });

    return errors;
  };

  const handleSave = async () => {
    const validationErrors = validateRows();

    if (validationErrors.length > 0) {
      const errorMessage = validationErrors.map(e =>
        `Row ${e.row}: ${e.errors.join(', ')}`
      ).join('\n');
      alert(`Please fix the following errors:\n\n${errorMessage}`);
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

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to save users');
      }

      const result = await response.json();
      setSaveResults(result.data);
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
function RowForm({ row, index, type, institutionType, onFieldChange, onRemove, canRemove }) {
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
    if (options) {
      return (
        <div className="flex-1 min-w-[200px]">
          <label className="block text-xs font-medium text-gray-700 mb-1">{label}</label>
          <select
            value={row[field] || ''}
            onChange={(e) => onFieldChange(row.id, field, e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select...</option>
            {options.map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
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
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder={label}
        />
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
