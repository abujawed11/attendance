import { useState } from 'react';

export default function EditUserModal({ user, type, institutionType, formData, onSave, onClose, isSaving }) {
  const [editData, setEditData] = useState(formData);
  const [errors, setErrors] = useState({});

  const handleChange = (field, value) => {
    setEditData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Common validations
    if (!editData.fullName?.trim()) {
      newErrors.fullName = 'Full Name is required';
    }

    if (type === 'faculty') {
      // Faculty validations
      if (!editData.email?.trim()) {
        newErrors.email = 'Email is required';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editData.email)) {
        newErrors.email = 'Invalid email format';
      }

      if (!editData.phone?.trim()) {
        newErrors.phone = 'Phone is required';
      } else if (!/^\d{10}$/.test(editData.phone.replace(/\s/g, ''))) {
        newErrors.phone = 'Phone must be 10 digits';
      }

      if (!editData.employeeId?.trim()) {
        newErrors.employeeId = 'Employee ID is required';
      }

      if (!editData.department?.trim()) {
        newErrors.department = 'Department is required';
      }

      if (institutionType === 'COLLEGE' && !editData.designation?.trim()) {
        newErrors.designation = 'Designation is required';
      }

      if (!editData.qualification?.trim()) {
        newErrors.qualification = 'Qualification is required';
      }
    } else {
      // Student validations
      if (!editData.dateOfBirth?.trim()) {
        newErrors.dateOfBirth = 'Date of Birth is required';
      }

      if (!editData.rollNumber?.trim()) {
        newErrors.rollNumber = institutionType === 'SCHOOL' ? 'Roll Number is required' : 'Registration Number is required';
      }

      if (institutionType === 'SCHOOL') {
        // School student validations
        if (!editData.class?.trim()) {
          newErrors.class = 'Class is required';
        }

        if (!editData.section?.trim()) {
          newErrors.section = 'Section is required';
        }

        if (!editData.parentName?.trim()) {
          newErrors.parentName = 'Parent Name is required';
        }

        if (!editData.parentEmail?.trim()) {
          newErrors.parentEmail = 'Parent Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editData.parentEmail)) {
          newErrors.parentEmail = 'Invalid parent email format';
        }

        if (!editData.parentPhone?.trim()) {
          newErrors.parentPhone = 'Parent Phone is required';
        } else if (!/^\d{10}$/.test(editData.parentPhone.replace(/\s/g, ''))) {
          newErrors.parentPhone = 'Parent phone must be 10 digits';
        }
      } else if (institutionType === 'COLLEGE') {
        // College student validations
        if (!editData.email?.trim()) {
          newErrors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editData.email)) {
          newErrors.email = 'Invalid email format';
        }

        if (!editData.phone?.trim()) {
          newErrors.phone = 'Phone is required';
        } else if (!/^\d{10}$/.test(editData.phone.replace(/\s/g, ''))) {
          newErrors.phone = 'Phone must be 10 digits';
        }

        if (!editData.department?.trim()) {
          newErrors.department = 'Department is required';
        }

        if (!editData.yearOfStudy) {
          newErrors.yearOfStudy = 'Year of Study is required';
        } else if (editData.yearOfStudy < 1 || editData.yearOfStudy > 5) {
          newErrors.yearOfStudy = 'Year must be between 1 and 5';
        }

        if (!editData.semester) {
          newErrors.semester = 'Semester is required';
        } else if (editData.semester < 1 || editData.semester > 10) {
          newErrors.semester = 'Semester must be between 1 and 10';
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (validateForm()) {
      onSave(editData);
    } else {
      // Scroll to first error
      const firstErrorField = Object.keys(errors)[0];
      document.querySelector(`input[name="${firstErrorField}"]`)?.focus();
    }
  };

  const renderField = (label, field, fieldType = 'text', required = true) => {
    const hasError = errors[field];
    return (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {required && <span className="text-red-500"> *</span>}
        </label>
        <input
          type={fieldType}
          name={field}
          value={editData[field] || ''}
          onChange={(e) => handleChange(field, e.target.value)}
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
            hasError ? 'border-red-500 bg-red-50' : 'border-gray-300'
          }`}
          required={required}
        />
        {hasError && (
          <p className="text-red-600 text-sm mt-1">{hasError}</p>
        )}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-gray-900">
              Edit {type === 'faculty' ? 'Faculty' : 'Student'}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <span className="text-2xl">×</span>
            </button>
          </div>

          {/* Validation Summary */}
          {Object.keys(errors).length > 0 && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <h4 className="text-sm font-semibold text-red-800 mb-2">
                Please fix the following errors:
              </h4>
              <ul className="list-disc list-inside text-sm text-red-700 space-y-1">
                {Object.entries(errors).map(([field, error]) => (
                  <li key={field}>{error}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Common Fields */}
            {renderField('Full Name', 'fullName')}

            {type === 'faculty' ? (
              <>
                {/* Faculty Fields */}
                {renderField('Email', 'email', 'email')}
                {renderField('Phone', 'phone', 'tel')}
                {renderField('Employee ID', 'employeeId')}
                {renderField('Department', 'department')}
                {institutionType === 'COLLEGE' && renderField('Designation', 'designation')}
                {renderField('Qualification', 'qualification')}
                {renderField('Subject', 'subject', 'text', false)}
              </>
            ) : (
              <>
                {/* Student Fields */}
                {renderField('Date of Birth', 'dateOfBirth', 'date')}
                {renderField('Roll/Reg Number', 'rollNumber')}

                {institutionType === 'SCHOOL' ? (
                  <>
                    {renderField('Class', 'class')}
                    {renderField('Section', 'section')}
                    {renderField('Parent Name', 'parentName')}
                    {renderField('Parent Email', 'parentEmail', 'email')}
                    {renderField('Parent Phone', 'parentPhone', 'tel')}
                  </>
                ) : (
                  <>
                    {renderField('Email', 'email', 'email')}
                    {renderField('Phone', 'phone', 'tel')}
                    {renderField('Department', 'department')}
                    {renderField('Year of Study', 'yearOfStudy', 'number')}
                    {renderField('Semester', 'semester', 'number')}
                  </>
                )}
              </>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <button
                type="button"
                onClick={onClose}
                disabled={isSaving}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors disabled:opacity-50"
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
