import { useState } from 'react';

const STEPS = [
  { id: 1, name: 'Download Template', icon: '📥' },
  { id: 2, name: 'Upload File', icon: '📤' },
  { id: 3, name: 'Validate & Map', icon: '🔍' },
  { id: 4, name: 'Preview', icon: '👀' },
  { id: 5, name: 'Save', icon: '💾' },
];

export default function ImportWizard({ type, onClose }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [parsedData, setParsedData] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [importResults, setImportResults] = useState(null);

  const typeLabel = type === 'faculty' ? 'Faculty' : 'Student';
  const typeColor = type === 'faculty' ? 'blue' : 'green';

  const handleNext = async () => {
    // If moving from step 2 to step 3, parse the file
    if (currentStep === 2 && uploadedFile) {
      await parseUploadedFile();
    }

    // Block moving from step 3 if there are no rows
    if (currentStep === 3 && parsedData) {
      if (parsedData.stats.total === 0) {
        alert('⚠️ No rows available to import!\n\nYou have deleted all rows. Please go back to Step 2 and upload a file with data.');
        return;
      }

      // Block if there are errors
      if (parsedData.stats.withErrors > 0) {
        alert('Please fix all errors before proceeding. You can edit your Excel file and re-upload from Step 2.');
        return;
      }
    }

    // If moving from step 4 to step 5, save the data
    if (currentStep === 4) {
      await saveImportData();
    }

    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleReset = () => {
    // Reset all state
    setCurrentStep(1);
    setUploadedFile(null);
    setParsedData(null);
    setIsProcessing(false);
    setIsSaving(false);
    setImportResults(null);
  };

  const parseUploadedFile = async () => {
    setIsProcessing(true);
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

    try {
      const formData = new FormData();
      formData.append('file', uploadedFile);
      formData.append('type', type);

      const response = await fetch(`${API_URL}/admin/import/parse`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to parse file');
      }

      const result = await response.json();
      setParsedData(result.data);
    } catch (error) {
      console.error('Parse error:', error);
      alert(`Failed to parse file: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const saveImportData = async () => {
    setIsSaving(true);
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

    try {
      // Extract only valid rows
      const validRows = parsedData.rows
        .filter(row => !row.hasErrors)
        .map(row => row.data);

      const response = await fetch(`${API_URL}/admin/import/save`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          type,
          rows: validRows
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to save import data');
      }

      const result = await response.json();
      setImportResults(result.results);
    } catch (error) {
      console.error('Save error:', error);
      alert(`Failed to save data: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return <StepDownloadTemplate type={type} typeColor={typeColor} />;
      case 2:
        return <StepUploadFile type={type} typeColor={typeColor} uploadedFile={uploadedFile} setUploadedFile={setUploadedFile} />;
      case 3:
        return <StepValidateMap type={type} typeColor={typeColor} parsedData={parsedData} isProcessing={isProcessing} setParsedData={setParsedData} />;
      case 4:
        return <StepPreview type={type} typeColor={typeColor} parsedData={parsedData} />;
      case 5:
        return <StepSave type={type} typeColor={typeColor} parsedData={parsedData} importResults={importResults} isSaving={isSaving} onReset={handleReset} />;
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className={`bg-gradient-to-r from-${typeColor}-500 to-${typeColor}-600 p-6 text-white`}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Import {typeLabel} Data</h2>
              <p className="text-sm opacity-90 mt-1">Follow the steps below to import your data</p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-colors"
            >
              <span className="text-2xl">×</span>
            </button>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="bg-gray-50 px-6 py-4 border-b">
          <div className="flex items-center justify-between">
            {STEPS.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-semibold transition-colors ${
                      currentStep === step.id
                        ? `bg-${typeColor}-600 text-white`
                        : currentStep > step.id
                        ? `bg-${typeColor}-100 text-${typeColor}-600`
                        : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    {currentStep > step.id ? '✓' : step.icon}
                  </div>
                  <div className={`text-xs mt-2 font-medium ${
                    currentStep === step.id ? `text-${typeColor}-600` : 'text-gray-500'
                  }`}>
                    {step.name}
                  </div>
                </div>
                {index < STEPS.length - 1 && (
                  <div className={`w-12 h-1 mx-2 mb-6 ${
                    currentStep > step.id ? `bg-${typeColor}-600` : 'bg-gray-300'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {renderStepContent()}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 border-t flex items-center justify-between">
          <button
            onClick={handlePrevious}
            disabled={currentStep === 1 || (currentStep === 5 && importResults !== null)}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
              currentStep === 1 || (currentStep === 5 && importResults !== null)
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            ← Previous
          </button>

          <div className="text-sm text-gray-500">
            Step {currentStep} of {STEPS.length}
          </div>

          <button
            onClick={handleNext}
            disabled={currentStep === STEPS.length || isProcessing || (currentStep === 2 && !uploadedFile)}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
              currentStep === STEPS.length || isProcessing || (currentStep === 2 && !uploadedFile)
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : `bg-${typeColor}-600 text-white hover:bg-${typeColor}-700`
            }`}
          >
            {isProcessing ? 'Processing...' : 'Next →'}
          </button>
        </div>
      </div>
    </div>
  );
}

// Step 1: Download Template
function StepDownloadTemplate({ type, typeColor }) {
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  const handleDownload = async () => {
    try {
      const response = await fetch(`${API_URL}/admin/template/${type}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to download template');
      }

      // Extract filename from Content-Disposition header
      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = `${type}_import_template.xlsx`; // Fallback filename

      console.log('Content-Disposition header:', contentDisposition);

      if (contentDisposition) {
        // Match filename from Content-Disposition header (handles quoted and unquoted values)
        const filenameMatch = contentDisposition.match(/filename[^;=\n]*=\s*(['"]?)(.+?)\1(?:;|$)/);
        console.log('Filename match:', filenameMatch);
        if (filenameMatch && filenameMatch[2]) {
          filename = filenameMatch[2];
        }
      }

      console.log('Final filename:', filename);

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Download error:', error);
      alert('Failed to download template. Please try again.');
    }
  };

  return (
    <div className="space-y-6">
      <div className={`bg-${typeColor}-50 border border-${typeColor}-200 rounded-lg p-6`}>
        <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          <span className="text-3xl mr-3">📥</span>
          Download Import Template
        </h3>
        <p className="text-gray-700 mb-4">
          Download the Excel template with pre-defined columns and format. Fill in your data following the template structure.
        </p>
        <button
          onClick={handleDownload}
          className={`px-6 py-3 bg-${typeColor}-600 text-white rounded-lg hover:bg-${typeColor}-700 font-medium transition-colors flex items-center`}
        >
          <span className="mr-2">📥</span>
          Download {type === 'faculty' ? 'Faculty' : 'Student'} Template
        </button>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <h4 className="font-semibold text-yellow-900 mb-3 flex items-center">
          <span className="text-xl mr-2">⚠️</span>
          Important Instructions
        </h4>
        <ul className="list-disc list-inside text-yellow-800 space-y-2 text-sm">
          <li>Do not modify the column headers (first row)</li>
          <li>Fill data starting from the second row</li>
          <li>Required fields are marked with (*) in header</li>
          <li>Use the exact format shown in example row</li>
          <li>Remove example row before uploading</li>
          <li>Date format: DD-MM-YYYY (e.g., 15-01-2000)</li>
          <li>Phone format: 10 digits without spaces (e.g., 9876543210)</li>
          <li>Email must be valid and unique</li>
        </ul>
      </div>

      <div className="bg-gray-50 rounded-lg p-6">
        <h4 className="font-semibold text-gray-900 mb-3">Template Columns</h4>
        <div className="grid md:grid-cols-2 gap-4 text-sm">
          {type === 'faculty' ? (
            <>
              <div>
                <span className="font-medium">Basic Info:</span> Full Name*, Email*, Phone*, Employee ID*
              </div>
              <div>
                <span className="font-medium">Institution:</span> Department*, Designation*, Subject
              </div>
            </>
          ) : (
            <>
              <div>
                <span className="font-medium">Basic Info:</span> Full Name*, Email*, Phone*, Roll Number*, DOB*
              </div>
              <div>
                <span className="font-medium">Academic:</span> Class*, Section*, Department, Year, Semester
              </div>
              <div>
                <span className="font-medium">Guardian:</span> Guardian Name, Guardian Phone, Relation
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// Step 2: Upload File
function StepUploadFile({ type, typeColor, uploadedFile, setUploadedFile }) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileSelect = (file) => {
    // Validate file type
    const validTypes = [
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/csv'
    ];

    if (!validTypes.includes(file.type)) {
      alert('Please upload only Excel (.xlsx, .xls) or CSV files');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    setUploadedFile(file);
  };

  const handleFileInput = (e) => {
    const files = e.target.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleRemoveFile = () => {
    setUploadedFile(null);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          <span className="text-3xl mr-3">📤</span>
          Upload Your File
        </h3>
        <p className="text-gray-600 mb-6">
          Upload the completed Excel or CSV file with your {type === 'faculty' ? 'faculty' : 'student'} data.
        </p>
      </div>

      {!uploadedFile ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
            isDragging
              ? `border-${typeColor}-500 bg-${typeColor}-50`
              : 'border-gray-300 hover:border-gray-400'
          }`}
        >
          <div className="text-6xl mb-4">📁</div>
          <h4 className="text-lg font-semibold text-gray-900 mb-2">
            Drag and drop your file here
          </h4>
          <p className="text-gray-500 mb-4">or</p>
          <label className={`px-6 py-3 bg-${typeColor}-600 text-white rounded-lg hover:bg-${typeColor}-700 font-medium cursor-pointer inline-block transition-colors`}>
            Browse Files
            <input
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleFileInput}
              className="hidden"
            />
          </label>
          <p className="text-sm text-gray-500 mt-4">
            Supported formats: .xlsx, .xls, .csv (Max size: 5MB)
          </p>
        </div>
      ) : (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start">
              <span className="text-4xl mr-4">📄</span>
              <div>
                <h4 className="font-semibold text-gray-900">{uploadedFile.name}</h4>
                <p className="text-sm text-gray-600">
                  {(uploadedFile.size / 1024).toFixed(2)} KB
                </p>
                <p className="text-sm text-green-600 mt-2">✓ File uploaded successfully</p>
              </div>
            </div>
            <button
              onClick={handleRemoveFile}
              className="text-red-600 hover:text-red-800 font-medium"
            >
              Remove
            </button>
          </div>
        </div>
      )}

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <span className="font-semibold">💡 Tip:</span> Make sure you've removed the example row from the template before uploading.
        </p>
      </div>
    </div>
  );
}

// Step 3: Validate & Map
function StepValidateMap({ type, typeColor, parsedData, isProcessing, setParsedData }) {
  const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'valid', 'warnings', 'errors'
  const [editingRow, setEditingRow] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [selectedRows, setSelectedRows] = useState(new Set());

  if (isProcessing) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4 animate-pulse">🔍</div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Processing Your File...
        </h3>
        <p className="text-gray-600">
          Parsing data and validating all rows. Please wait...
        </p>
      </div>
    );
  }

  if (!parsedData) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">⚠️</div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          No Data Available
        </h3>
        <p className="text-gray-600">
          Please go back and upload a file first.
        </p>
      </div>
    );
  }

  const { stats, rows, validationResults, mapping, unmapped, institutionType } = parsedData;

  const filteredRows = rows.filter(row => {
    if (filterStatus === 'all') return true;
    if (filterStatus === 'valid') return !row.hasErrors && !row.hasWarnings;
    if (filterStatus === 'warnings') return row.hasWarnings && !row.hasErrors;
    if (filterStatus === 'errors') return row.hasErrors;
    return true;
  });

  const getRowValidation = (rowIndex) => {
    return validationResults.find(v => v.rowIndex === rowIndex);
  };

  // Helper function to revalidate all duplicate errors across all rows
  const revalidateDuplicates = (rows, validationResults) => {
    const institutionType = parsedData?.institutionType;
    const isSchoolStudent = type === 'student' && institutionType === 'SCHOOL';

    // Clear all duplicate-related errors first
    const clearedValidations = validationResults.map(v => ({
      ...v,
      errors: v.errors.filter(e =>
        !e.message.includes('Duplicate') &&
        !e.message.includes('inconsistent') &&
        !e.message.includes('already exists in database')
      ),
      warnings: v.warnings
    }));

    // Track parent email/phone consistency for school students
    const parentEmailToPhone = new Map();
    const parentPhoneToEmail = new Map();

    // Re-check duplicates for all rows
    rows.forEach((currentRow, index) => {
      const validation = clearedValidations.find(v => v.rowIndex === currentRow.rowIndex);
      if (!validation) return;

      const otherRows = rows.filter(r => r.rowIndex !== currentRow.rowIndex);

      // Email duplicates (only for faculty and college students)
      if (!isSchoolStudent && currentRow.data.email) {
        const emailDuplicates = otherRows.filter(r =>
          r.data.email && r.data.email.toLowerCase().trim() === currentRow.data.email.toLowerCase().trim()
        );
        if (emailDuplicates.length > 0) {
          validation.errors.push({
            field: 'email',
            message: `Duplicate email in Excel file (also in rows: ${emailDuplicates.map(r => r.rowIndex).join(', ')})`
          });
        }
      }

      // Phone duplicates (only for faculty and college students)
      if (!isSchoolStudent && currentRow.data.phone) {
        const phoneDuplicates = otherRows.filter(r =>
          r.data.phone && String(r.data.phone).trim() === String(currentRow.data.phone).trim()
        );
        if (phoneDuplicates.length > 0) {
          validation.errors.push({
            field: 'phone',
            message: `Duplicate phone number in Excel file (also in rows: ${phoneDuplicates.map(r => r.rowIndex).join(', ')})`
          });
        }
      }

      // Employee ID duplicates (faculty only)
      if (type === 'faculty' && currentRow.data.employeeId) {
        const employeeIdDuplicates = otherRows.filter(r =>
          r.data.employeeId && String(r.data.employeeId).trim() === String(currentRow.data.employeeId).trim()
        );
        if (employeeIdDuplicates.length > 0) {
          validation.errors.push({
            field: 'employeeId',
            message: `Duplicate employee ID in Excel file (also in rows: ${employeeIdDuplicates.map(r => r.rowIndex).join(', ')})`
          });
        }
      }

      // Roll number duplicates (student only)
      if (type === 'student' && currentRow.data.rollNumber) {
        let rollNumberDuplicates;

        if (isSchoolStudent) {
          // For school: Check duplicates by rollNumber + class + section combination
          // Same roll number can exist in different sections
          rollNumberDuplicates = otherRows.filter(r =>
            r.data.rollNumber &&
            String(r.data.rollNumber).trim() === String(currentRow.data.rollNumber).trim() &&
            String(r.data.class || '').trim() === String(currentRow.data.class || '').trim() &&
            String(r.data.section || '').trim() === String(currentRow.data.section || '').trim()
          );
        } else {
          // For college: Registration number must be unique across all students
          rollNumberDuplicates = otherRows.filter(r =>
            r.data.rollNumber && String(r.data.rollNumber).trim() === String(currentRow.data.rollNumber).trim()
          );
        }

        if (rollNumberDuplicates.length > 0) {
          const errorMsg = isSchoolStudent
            ? `Duplicate roll number in Excel file for Class ${currentRow.data.class}, Section ${currentRow.data.section} (also in rows: ${rollNumberDuplicates.map(r => r.rowIndex).join(', ')})`
            : `Duplicate registration number in Excel file (also in rows: ${rollNumberDuplicates.map(r => r.rowIndex).join(', ')})`;

          validation.errors.push({
            field: 'rollNumber',
            message: errorMsg
          });
        }
      }

      // Parent email/phone consistency checks (for school students only)
      if (isSchoolStudent && currentRow.data.parentEmail && currentRow.data.parentPhone) {
        const parentEmail = String(currentRow.data.parentEmail).trim().toLowerCase();
        const parentPhone = String(currentRow.data.parentPhone).trim();

        // Check if this parent email already exists with a different phone
        if (parentEmailToPhone.has(parentEmail)) {
          const existingPhone = parentEmailToPhone.get(parentEmail);
          if (existingPhone !== parentPhone) {
            validation.errors.push({
              field: 'parentEmail',
              message: `Parent email has inconsistent phone numbers in Excel file (${existingPhone} vs ${parentPhone})`
            });
          }
        } else {
          parentEmailToPhone.set(parentEmail, parentPhone);
        }

        // Check if this parent phone already exists with a different email
        if (parentPhoneToEmail.has(parentPhone)) {
          const existingEmail = parentPhoneToEmail.get(parentPhone);
          if (existingEmail !== parentEmail) {
            validation.errors.push({
              field: 'parentPhone',
              message: `Parent phone has inconsistent emails in Excel file (${existingEmail} vs ${parentEmail})`
            });
          }
        } else {
          parentPhoneToEmail.set(parentPhone, parentEmail);
        }
      }

      // Update row error status
      currentRow.hasErrors = validation.errors.length > 0;
      currentRow.hasWarnings = validation.warnings.length > 0;
    });

    return clearedValidations;
  };

  const handleDeleteRow = (rowIndex) => {
    if (!confirm('Are you sure you want to delete this row?')) return;

    // Remove the row from parsedData
    const updatedRows = parsedData.rows.filter(r => r.rowIndex !== rowIndex);
    let updatedValidationResults = parsedData.validationResults.filter(v => v.rowIndex !== rowIndex);

    // Revalidate duplicates for all remaining rows
    updatedValidationResults = revalidateDuplicates(updatedRows, updatedValidationResults);

    // Recalculate stats
    const newStats = {
      total: updatedRows.length,
      valid: updatedRows.filter(r => !r.hasErrors && !r.hasWarnings).length,
      withWarnings: updatedRows.filter(r => r.hasWarnings && !r.hasErrors).length,
      withErrors: updatedRows.filter(r => r.hasErrors).length
    };

    setParsedData({
      ...parsedData,
      rows: updatedRows,
      validationResults: updatedValidationResults,
      stats: newStats
    });
  };

  // Helper function to convert date to YYYY-MM-DD format for HTML date input
  const excelSerialToDateInput = (serial) => {
    if (!serial) return '';

    let date;

    // If it's already a formatted date string (DD-MM-YYYY or DD/MM/YYYY), parse it
    if (typeof serial === 'string') {
      const parts = serial.split(/[-\/]/);
      if (parts.length === 3) {
        const day = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10);
        const year = parseInt(parts[2], 10);

        // Create date object
        const fullYear = year < 100 ? 2000 + year : year;
        date = new Date(fullYear, month - 1, day);
      } else {
        return '';
      }
    }
    // Handle Excel serial number
    else if (typeof serial === 'number' && serial > 1000) {
      const excelEpoch = new Date(1900, 0, 1);
      const daysOffset = serial - 2;
      date = new Date(excelEpoch.getTime() + daysOffset * 24 * 60 * 60 * 1000);
    } else {
      return '';
    }

    // Convert to YYYY-MM-DD format for HTML date input
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  };

  const handleEditRow = (row) => {
    setEditingRow(row);

    // Define all expected fields based on type and institution
    let allFields = {};

    if (type === 'faculty') {
      allFields = {
        fullName: '',
        email: '',
        phone: '',
        employeeId: '',
        department: '',
        designation: '',
        qualification: '',
        subject: ''
      };
    } else if (type === 'student') {
      const commonFields = {
        fullName: '',
        rollNumber: '',
        dateOfBirth: ''
      };

      if (institutionType === 'SCHOOL') {
        allFields = {
          ...commonFields,
          class: '',
          section: '',
          parentName: '',
          parentEmail: '',
          parentPhone: ''
        };
      } else if (institutionType === 'COLLEGE') {
        allFields = {
          ...commonFields,
          email: '',
          phone: '',
          department: '',
          yearOfStudy: '',
          semester: ''
        };
      }
    }

    // Merge with actual data (actual data overrides empty defaults)
    const formattedData = { ...allFields, ...row.data };

    // Convert date fields to YYYY-MM-DD format for date input
    if (formattedData.dateOfBirth) {
      formattedData.dateOfBirth = excelSerialToDateInput(formattedData.dateOfBirth);
    }
    if (formattedData.joiningDate) {
      formattedData.joiningDate = excelSerialToDateInput(formattedData.joiningDate);
    }

    setEditFormData(formattedData);
  };

  const handleSaveEdit = () => {
    // Update the row data
    const updatedRows = parsedData.rows.map(r => {
      if (r.rowIndex === editingRow.rowIndex) {
        return {
          ...r,
          data: editFormData
        };
      }
      return r;
    });

    // Get the original validation for this row
    const originalValidation = parsedData.validationResults.find(v => v.rowIndex === editingRow.rowIndex);

    // Start with empty arrays for re-validation
    const errors = [];
    const warnings = [];

    // Keep database-related errors from original validation (we can't check DB from frontend)
    if (originalValidation) {
      originalValidation.errors.forEach(err => {
        if (err.message.includes('already exists in database')) {
          // Check if the field value has changed
          const originalData = editingRow.data;
          const fieldChanged = editFormData[err.field] !== originalData[err.field];

          // Only keep the error if field hasn't changed
          if (!fieldChanged) {
            errors.push(err);
          }
          // If field changed, we assume user is trying to fix it
        }
      });
    }

    // Comprehensive client-side validation
    const editedRow = updatedRows.find(r => r.rowIndex === editingRow.rowIndex);

    // Required fields validation
    if (!editFormData.fullName || String(editFormData.fullName).trim() === '') {
      errors.push({ field: 'fullName', message: 'Full Name is required' });
    }

    // Email and phone validation - only for faculty and college students
    const institutionType = parsedData?.institutionType;
    const isSchoolStudent = type === 'student' && institutionType === 'SCHOOL';

    if (!isSchoolStudent) {
      // For faculty and college students, email and phone are required
      if (!editFormData.email || String(editFormData.email).trim() === '') {
        errors.push({ field: 'email', message: 'Email is required' });
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(editFormData.email).trim())) {
        errors.push({ field: 'email', message: 'Invalid email format' });
      }

      if (!editFormData.phone || String(editFormData.phone).trim() === '') {
        errors.push({ field: 'phone', message: 'Phone is required' });
      } else if (!/^\d{10}$/.test(String(editFormData.phone).replace(/\s/g, ''))) {
        errors.push({ field: 'phone', message: 'Phone must be 10 digits' });
      }
    }

    // Type-specific validation
    if (type === 'faculty') {
      if (!editFormData.employeeId || String(editFormData.employeeId).trim() === '') {
        errors.push({ field: 'employeeId', message: 'Employee ID is required' });
      }
      if (!editFormData.department || String(editFormData.department).trim() === '') {
        errors.push({ field: 'department', message: 'Department is required' });
      }
      if (!editFormData.designation || String(editFormData.designation).trim() === '') {
        errors.push({ field: 'designation', message: 'Designation is required' });
      }
      if (!editFormData.qualification || String(editFormData.qualification).trim() === '') {
        errors.push({ field: 'qualification', message: 'Qualification is required' });
      }
    } else if (type === 'student') {
      if (!editFormData.rollNumber || String(editFormData.rollNumber).trim() === '') {
        errors.push({ field: 'rollNumber', message: 'Roll Number is required' });
      }
      if (!editFormData.dateOfBirth || String(editFormData.dateOfBirth).trim() === '') {
        errors.push({ field: 'dateOfBirth', message: 'Date of Birth is required' });
      }

      // School student specific validations
      if (institutionType === 'SCHOOL') {
        if (!editFormData.class || String(editFormData.class).trim() === '') {
          errors.push({ field: 'class', message: 'Class is required' });
        }
        if (!editFormData.section || String(editFormData.section).trim() === '') {
          errors.push({ field: 'section', message: 'Section is required' });
        }

        // Parent info required for school students
        if (!editFormData.parentName || String(editFormData.parentName).trim() === '') {
          errors.push({ field: 'parentName', message: 'Parent Name is required' });
        }
        if (!editFormData.parentEmail || String(editFormData.parentEmail).trim() === '') {
          errors.push({ field: 'parentEmail', message: 'Parent Email is required' });
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(editFormData.parentEmail).trim())) {
          errors.push({ field: 'parentEmail', message: 'Invalid parent email format' });
        }
        if (!editFormData.parentPhone || String(editFormData.parentPhone).trim() === '') {
          errors.push({ field: 'parentPhone', message: 'Parent Phone is required' });
        } else if (!/^\d{10}$/.test(String(editFormData.parentPhone).replace(/\s/g, ''))) {
          errors.push({ field: 'parentPhone', message: 'Parent phone must be 10 digits' });
        }
      } else if (institutionType === 'COLLEGE') {
        // College student specific validations
        if (!editFormData.department || String(editFormData.department).trim() === '') {
          errors.push({ field: 'department', message: 'Department is required' });
        }
        if (!editFormData.yearOfStudy) {
          errors.push({ field: 'yearOfStudy', message: 'Year of Study is required' });
        }
        if (!editFormData.semester) {
          errors.push({ field: 'semester', message: 'Semester is required' });
        }
      }
    }

    // Check for duplicates within Excel (excluding current row)
    const otherRows = updatedRows.filter(r => r.rowIndex !== editingRow.rowIndex);

    // Email/phone duplicates - only for faculty and college students
    if (!isSchoolStudent) {
      // Email duplicates
      const emailDuplicates = otherRows.filter(r =>
        r.data.email && r.data.email.toLowerCase().trim() === editFormData.email?.toLowerCase().trim()
      );
      if (emailDuplicates.length > 0) {
        errors.push({
          field: 'email',
          message: `Duplicate email in Excel file (also in rows: ${emailDuplicates.map(r => r.rowIndex).join(', ')})`
        });
      }

      // Phone duplicates
      const phoneDuplicates = otherRows.filter(r =>
        r.data.phone && String(r.data.phone).trim() === String(editFormData.phone).trim()
      );
      if (phoneDuplicates.length > 0) {
        errors.push({
          field: 'phone',
          message: `Duplicate phone number in Excel file (also in rows: ${phoneDuplicates.map(r => r.rowIndex).join(', ')})`
        });
      }
    }

    // Employee ID duplicates (faculty only)
    if (type === 'faculty') {
      const employeeIdDuplicates = otherRows.filter(r =>
        r.data.employeeId && String(r.data.employeeId).trim() === String(editFormData.employeeId).trim()
      );
      if (employeeIdDuplicates.length > 0) {
        errors.push({
          field: 'employeeId',
          message: `Duplicate employee ID in Excel file (also in rows: ${employeeIdDuplicates.map(r => r.rowIndex).join(', ')})`
        });
      }
    }

    // Roll number duplicates (student only)
    if (type === 'student') {
      let rollNumberDuplicates;

      if (isSchoolStudent) {
        // For school: Check duplicates by rollNumber + class + section combination
        rollNumberDuplicates = otherRows.filter(r =>
          r.data.rollNumber &&
          String(r.data.rollNumber).trim() === String(editFormData.rollNumber || '').trim() &&
          String(r.data.class || '').trim() === String(editFormData.class || '').trim() &&
          String(r.data.section || '').trim() === String(editFormData.section || '').trim()
        );
      } else {
        // For college: Registration number must be unique
        rollNumberDuplicates = otherRows.filter(r =>
          r.data.rollNumber && String(r.data.rollNumber).trim() === String(editFormData.rollNumber).trim()
        );
      }

      if (rollNumberDuplicates.length > 0) {
        const errorMsg = isSchoolStudent
          ? `Duplicate roll number in Excel file for Class ${editFormData.class}, Section ${editFormData.section} (also in rows: ${rollNumberDuplicates.map(r => r.rowIndex).join(', ')})`
          : `Duplicate registration number in Excel file (also in rows: ${rollNumberDuplicates.map(r => r.rowIndex).join(', ')})`;

        errors.push({
          field: 'rollNumber',
          message: errorMsg
        });
      }
    }

    editedRow.hasErrors = errors.length > 0;
    editedRow.hasWarnings = warnings.length > 0;

    // Update validation results for edited row
    let updatedValidationResults = parsedData.validationResults.map(v => {
      if (v.rowIndex === editingRow.rowIndex) {
        return {
          ...v,
          errors,
          warnings
        };
      }
      return v;
    });

    // Revalidate duplicates for ALL rows (to clear duplicate errors on other rows)
    updatedValidationResults = revalidateDuplicates(updatedRows, updatedValidationResults);

    // Recalculate stats
    const newStats = {
      total: updatedRows.length,
      valid: updatedRows.filter(r => !r.hasErrors && !r.hasWarnings).length,
      withWarnings: updatedRows.filter(r => r.hasWarnings && !r.hasErrors).length,
      withErrors: updatedRows.filter(r => r.hasErrors).length
    };

    setParsedData({
      ...parsedData,
      rows: updatedRows,
      validationResults: updatedValidationResults,
      stats: newStats
    });

    setEditingRow(null);
    setEditFormData({});
  };

  const handleCancelEdit = () => {
    setEditingRow(null);
    setEditFormData({});
  };

  // Selection handlers
  const handleSelectAll = () => {
    const allRowIndices = filteredRows.map(row => row.rowIndex);
    setSelectedRows(new Set(allRowIndices));
  };

  const handleUnselectAll = () => {
    setSelectedRows(new Set());
  };

  const handleToggleRow = (rowIndex) => {
    const newSelected = new Set(selectedRows);
    if (newSelected.has(rowIndex)) {
      newSelected.delete(rowIndex);
    } else {
      newSelected.add(rowIndex);
    }
    setSelectedRows(newSelected);
  };

  const handleBulkDelete = () => {
    if (selectedRows.size === 0) {
      alert('No rows selected');
      return;
    }

    if (!confirm(`Are you sure you want to delete ${selectedRows.size} selected row(s)?`)) {
      return;
    }

    // Remove selected rows
    const updatedRows = parsedData.rows.filter(r => !selectedRows.has(r.rowIndex));
    let updatedValidationResults = parsedData.validationResults.filter(v => !selectedRows.has(v.rowIndex));

    // Revalidate duplicates for all remaining rows
    updatedValidationResults = revalidateDuplicates(updatedRows, updatedValidationResults);

    // Recalculate stats
    const newStats = {
      total: updatedRows.length,
      valid: updatedRows.filter(r => !r.hasErrors && !r.hasWarnings).length,
      withWarnings: updatedRows.filter(r => r.hasWarnings && !r.hasErrors).length,
      withErrors: updatedRows.filter(r => r.hasErrors).length
    };

    setParsedData({
      ...parsedData,
      rows: updatedRows,
      validationResults: updatedValidationResults,
      stats: newStats
    });

    // Clear selection
    setSelectedRows(new Set());
  };

  const handleRemoveAllDuplicates = () => {
    // Find all rows that have database duplicate errors
    const duplicateRowIndices = parsedData.validationResults
      .filter(v => v.errors.some(err => err.message.includes('already exists in database')))
      .map(v => v.rowIndex);

    if (duplicateRowIndices.length === 0) {
      alert('No duplicate records found in the database. All records are new!');
      return;
    }

    if (!confirm(`Found ${duplicateRowIndices.length} existing records in database. Do you want to remove them from import?\n\nThis will keep only NEW records that don't exist in the database yet.`)) {
      return;
    }

    // Remove duplicate rows
    const updatedRows = parsedData.rows.filter(r => !duplicateRowIndices.includes(r.rowIndex));
    let updatedValidationResults = parsedData.validationResults.filter(v => !duplicateRowIndices.includes(v.rowIndex));

    // Revalidate duplicates for all remaining rows
    updatedValidationResults = revalidateDuplicates(updatedRows, updatedValidationResults);

    // Recalculate stats
    const newStats = {
      total: updatedRows.length,
      valid: updatedRows.filter(r => !r.hasErrors && !r.hasWarnings).length,
      withWarnings: updatedRows.filter(r => r.hasWarnings && !r.hasErrors).length,
      withErrors: updatedRows.filter(r => r.hasErrors).length
    };

    setParsedData({
      ...parsedData,
      rows: updatedRows,
      validationResults: updatedValidationResults,
      stats: newStats
    });

    alert(`✅ Removed ${duplicateRowIndices.length} duplicate records. Remaining: ${updatedRows.length} records to import.`);
  };

  const handleRemoveAllInvalid = () => {
    const invalidRowCount = stats.withErrors;

    if (invalidRowCount === 0) {
      alert('No invalid rows found. All rows are valid!');
      return;
    }

    if (!confirm(`Found ${invalidRowCount} row(s) with errors. Do you want to remove all invalid rows?\n\nThis will keep only VALID records without any errors.`)) {
      return;
    }

    // Remove all rows with errors
    const updatedRows = parsedData.rows.filter(r => !r.hasErrors);
    let updatedValidationResults = parsedData.validationResults.filter(v => {
      const row = parsedData.rows.find(r => r.rowIndex === v.rowIndex);
      return row && !row.hasErrors;
    });

    // Revalidate duplicates for all remaining rows
    updatedValidationResults = revalidateDuplicates(updatedRows, updatedValidationResults);

    // Recalculate stats
    const newStats = {
      total: updatedRows.length,
      valid: updatedRows.filter(r => !r.hasErrors && !r.hasWarnings).length,
      withWarnings: updatedRows.filter(r => r.hasWarnings && !r.hasErrors).length,
      withErrors: updatedRows.filter(r => r.hasErrors).length // Recalculate instead of hardcoding 0
    };

    setParsedData({
      ...parsedData,
      rows: updatedRows,
      validationResults: updatedValidationResults,
      stats: newStats
    });

    // Clear selection
    setSelectedRows(new Set());

    alert(`✅ Removed ${invalidRowCount} invalid records. Remaining: ${updatedRows.length} valid records.`);
  };

  return (
    <div className="space-y-6">
      {/* Statistics Header */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-gray-50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
          <div className="text-sm text-gray-600">Total Rows</div>
        </div>
        <div className="bg-green-50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-green-600">{stats.valid}</div>
          <div className="text-sm text-gray-600">Valid</div>
        </div>
        <div className="bg-yellow-50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-yellow-600">{stats.withWarnings}</div>
          <div className="text-sm text-gray-600">Warnings</div>
        </div>
        <div className="bg-red-50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-red-600">{stats.withErrors}</div>
          <div className="text-sm text-gray-600">Errors</div>
        </div>
      </div>

      {/* Bulk Actions Toolbar */}
      <div className="bg-gray-50 border rounded-lg p-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <span className="font-semibold text-gray-700">Bulk Actions:</span>
            <button
              onClick={handleSelectAll}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm transition-colors"
            >
              ✓ Select All ({filteredRows.length})
            </button>
            <button
              onClick={handleUnselectAll}
              disabled={selectedRows.size === 0}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                selectedRows.size === 0
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-600 text-white hover:bg-gray-700'
              }`}
            >
              ✗ Unselect All
            </button>
            <button
              onClick={handleBulkDelete}
              disabled={selectedRows.size === 0}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                selectedRows.size === 0
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-red-600 text-white hover:bg-red-700'
              }`}
            >
              🗑️ Delete Selected ({selectedRows.size})
            </button>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleRemoveAllDuplicates}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium text-sm transition-colors"
              title="Remove all records that already exist in database"
            >
              🔄 Remove All Duplicates
            </button>
            <button
              onClick={handleRemoveAllInvalid}
              disabled={stats.withErrors === 0}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                stats.withErrors === 0
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-orange-600 text-white hover:bg-orange-700'
              }`}
              title="Remove all rows with validation errors"
            >
              🚫 Remove All Invalid ({stats.withErrors})
            </button>
          </div>
        </div>

        {/* Selection Info */}
        {selectedRows.size > 0 && (
          <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <span className="font-semibold">📌 {selectedRows.size} row(s) selected</span>
              {selectedRows.size === filteredRows.length && filteredRows.length < stats.total && (
                <span> (from current filter)</span>
              )}
            </p>
          </div>
        )}
      </div>

      {/* Smart Actions Info */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-lg p-4">
        <h4 className="font-semibold text-indigo-900 mb-2 flex items-center">
          <span className="text-xl mr-2">✨</span>
          Smart Actions Available
        </h4>
        <div className="grid md:grid-cols-2 gap-3 text-sm">
          <div className="bg-white rounded-lg p-3">
            <div className="font-semibold text-purple-700 mb-1">🔄 Remove All Duplicates</div>
            <p className="text-gray-600 text-xs">
              Automatically removes all records that already exist in the database.
              Perfect when you want to import ONLY NEW records.
            </p>
          </div>
          <div className="bg-white rounded-lg p-3">
            <div className="font-semibold text-orange-700 mb-1">🚫 Remove All Invalid</div>
            <p className="text-gray-600 text-xs">
              Removes all rows with validation errors at once.
              Keeps only clean, valid records ready to import.
            </p>
          </div>
        </div>
      </div>

      {/* Unmapped Columns Warning */}
      {unmapped && unmapped.length > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <h4 className="font-semibold text-orange-900 mb-2 flex items-center">
            <span className="text-xl mr-2">⚠️</span>
            Unmapped Columns Detected
          </h4>
          <p className="text-sm text-orange-800 mb-2">
            The following columns could not be automatically mapped. They will be ignored during import.
          </p>
          <div className="flex flex-wrap gap-2">
            {unmapped.map((col, idx) => (
              <span key={idx} className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm">
                {col.header}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex gap-2 border-b">
        <button
          onClick={() => setFilterStatus('all')}
          className={`px-4 py-2 font-medium transition-colors ${
            filterStatus === 'all'
              ? `border-b-2 border-${typeColor}-600 text-${typeColor}-600`
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          All ({stats.total})
        </button>
        <button
          onClick={() => setFilterStatus('valid')}
          className={`px-4 py-2 font-medium transition-colors ${
            filterStatus === 'valid'
              ? 'border-b-2 border-green-600 text-green-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Valid ({stats.valid})
        </button>
        <button
          onClick={() => setFilterStatus('warnings')}
          className={`px-4 py-2 font-medium transition-colors ${
            filterStatus === 'warnings'
              ? 'border-b-2 border-yellow-600 text-yellow-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Warnings ({stats.withWarnings})
        </button>
        <button
          onClick={() => setFilterStatus('errors')}
          className={`px-4 py-2 font-medium transition-colors ${
            filterStatus === 'errors'
              ? 'border-b-2 border-red-600 text-red-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Errors ({stats.withErrors})
        </button>
      </div>

      {/* Data Grid */}
      <div className="max-h-96 overflow-y-auto border rounded-lg">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 sticky top-0">
            <tr>
              <th className="px-3 py-2 text-center font-medium text-gray-700 border-b w-12">
                <input
                  type="checkbox"
                  checked={filteredRows.length > 0 && filteredRows.every(row => selectedRows.has(row.rowIndex))}
                  onChange={(e) => {
                    if (e.target.checked) {
                      handleSelectAll();
                    } else {
                      handleUnselectAll();
                    }
                  }}
                  className="w-4 h-4 cursor-pointer"
                  title="Select/Unselect all rows"
                />
              </th>
              <th className="px-3 py-2 text-left font-medium text-gray-700 border-b">Row</th>
              <th className="px-3 py-2 text-left font-medium text-gray-700 border-b">Status</th>
              <th className="px-3 py-2 text-left font-medium text-gray-700 border-b">Data Preview</th>
              <th className="px-3 py-2 text-left font-medium text-gray-700 border-b">Issues</th>
              <th className="px-3 py-2 text-center font-medium text-gray-700 border-b">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredRows.map((row, idx) => {
              const validation = getRowValidation(row.rowIndex);
              const hasIssues = validation && (validation.errors.length > 0 || validation.warnings.length > 0);
              const isSelected = selectedRows.has(row.rowIndex);

              return (
                <tr key={idx} className={`border-b hover:bg-gray-50 ${isSelected ? 'bg-blue-50' : ''}`}>
                  <td className="px-3 py-2 text-center">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleToggleRow(row.rowIndex)}
                      className="w-4 h-4 cursor-pointer"
                    />
                  </td>
                  <td className="px-3 py-2 text-gray-600">{row.rowIndex}</td>
                  <td className="px-3 py-2">
                    {row.hasErrors ? (
                      <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-medium">
                        Error
                      </span>
                    ) : row.hasWarnings ? (
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-xs font-medium">
                        Warning
                      </span>
                    ) : (
                      <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">
                        Valid
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-2">
                    <div className="text-gray-700 truncate max-w-xs">
                      {row.data.fullName || row.data.email || 'No preview'}
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    {hasIssues && (
                      <div className="space-y-1">
                        {validation.errors.map((err, errIdx) => (
                          <div key={`err-${errIdx}`} className="text-xs text-red-600">
                            • {err.field}: {err.message}
                          </div>
                        ))}
                        {validation.warnings.map((warn, warnIdx) => (
                          <div key={`warn-${warnIdx}`} className="text-xs text-yellow-600">
                            • {warn.field}: {warn.message}
                          </div>
                        ))}
                      </div>
                    )}
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => handleEditRow(row)}
                        className="text-blue-600 hover:text-blue-800 font-medium text-xs px-2 py-1 rounded hover:bg-blue-50"
                        title="Edit row"
                      >
                        ✏️ Edit
                      </button>
                      <button
                        onClick={() => handleDeleteRow(row.rowIndex)}
                        className="text-red-600 hover:text-red-800 font-medium text-xs px-2 py-1 rounded hover:bg-red-50"
                        title="Delete row"
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Summary Message */}
      {stats.total === 0 ? (
        <div className="bg-orange-50 border border-orange-300 rounded-lg p-6 text-center">
          <div className="text-5xl mb-3">📭</div>
          <p className="text-lg font-semibold text-orange-900 mb-2">
            ⚠️ No Rows Available!
          </p>
          <p className="text-sm text-orange-800">
            You have deleted all rows from the import. Please go back to <strong>Step 2</strong> and upload a file with data.
          </p>
        </div>
      ) : stats.withErrors > 0 ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-800">
            <span className="font-semibold">⚠️ Cannot proceed:</span> Please fix {stats.withErrors} row(s) with errors before continuing.
            You can edit or delete rows with errors, or re-upload your Excel file.
          </p>
        </div>
      ) : (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-sm text-green-800">
            <span className="font-semibold">✓ Ready to import:</span> {stats.valid} valid rows found.
            {stats.withWarnings > 0 && ` ${stats.withWarnings} row(s) have warnings but can still be imported.`}
          </p>
        </div>
      )}

      {/* Edit Modal */}
      {editingRow && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Edit Row {editingRow.rowIndex}
              </h3>

              <div className="space-y-4">
                {(() => {
                  // Define fields to show based on type and institution
                  let fieldsToShow = [];

                  if (type === 'faculty') {
                    fieldsToShow = [
                      { key: 'fullName', label: 'Full Name', type: 'text', required: true },
                      { key: 'email', label: 'Email', type: 'email', required: true },
                      { key: 'phone', label: 'Phone', type: 'tel', required: true },
                      { key: 'employeeId', label: 'Employee ID', type: 'text', required: true },
                      { key: 'department', label: 'Department', type: 'text', required: true },
                      { key: 'designation', label: 'Designation', type: 'text', required: true },
                      { key: 'qualification', label: 'Qualification', type: 'text', required: true },
                      { key: 'subject', label: 'Subject', type: 'text', required: false }
                    ];
                  } else if (type === 'student') {
                    if (institutionType === 'SCHOOL') {
                      fieldsToShow = [
                        { key: 'fullName', label: 'Full Name', type: 'text', required: true },
                        { key: 'rollNumber', label: 'Roll Number', type: 'text', required: true },
                        { key: 'dateOfBirth', label: 'Date of Birth', type: 'date', required: true },
                        { key: 'class', label: 'Class', type: 'text', required: true },
                        { key: 'section', label: 'Section', type: 'text', required: true },
                        { key: 'parentName', label: 'Parent Name', type: 'text', required: true },
                        { key: 'parentEmail', label: 'Parent Email', type: 'email', required: true },
                        { key: 'parentPhone', label: 'Parent Phone', type: 'tel', required: true }
                      ];
                    } else if (institutionType === 'COLLEGE') {
                      fieldsToShow = [
                        { key: 'fullName', label: 'Full Name', type: 'text', required: true },
                        { key: 'email', label: 'Email', type: 'email', required: true },
                        { key: 'phone', label: 'Phone', type: 'tel', required: true },
                        { key: 'dateOfBirth', label: 'Date of Birth', type: 'date', required: true },
                        { key: 'rollNumber', label: 'Roll/Reg Number', type: 'text', required: true },
                        { key: 'department', label: 'Department', type: 'text', required: true },
                        { key: 'yearOfStudy', label: 'Year of Study', type: 'text', required: true },
                        { key: 'semester', label: 'Semester', type: 'text', required: true }
                      ];
                    }
                  }

                  return fieldsToShow.map((field) => (
                    <div key={field.key}>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {field.label}
                        {field.required && ' *'}
                      </label>
                      <input
                        type={field.type}
                        value={editFormData[field.key] || ''}
                        onChange={(e) => setEditFormData({ ...editFormData, [field.key]: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder={field.label}
                      />
                    </div>
                  ));
                })()}
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={handleCancelEdit}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEdit}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Step 4: Preview
function StepPreview({ type, typeColor, parsedData }) {
  const [showAll, setShowAll] = useState(false);

  // Helper function to format Excel serial dates
  const formatValue = (value, fieldName) => {
    if (value === null || value === undefined || value === '') return '-';

    // Check if this is a date field and if the value is an Excel serial number
    const dateFields = ['dateOfBirth', 'joiningDate', 'dob'];
    if (dateFields.includes(fieldName) && typeof value === 'number' && value > 1000) {
      // Convert Excel serial number to date
      const excelEpoch = new Date(1900, 0, 1);
      const daysOffset = value - 2; // Excel incorrectly treats 1900 as a leap year
      const date = new Date(excelEpoch.getTime() + daysOffset * 24 * 60 * 60 * 1000);

      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();

      return `${day}-${month}-${year}`;
    }

    return value;
  };

  if (!parsedData) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">⚠️</div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          No Data Available
        </h3>
        <p className="text-gray-600">
          Please go back and complete the validation step first.
        </p>
      </div>
    );
  }

  const { stats, rows } = parsedData;

  // Only show valid rows (no errors)
  const validRows = rows.filter(row => !row.hasErrors);
  const displayRows = showAll ? validRows : validRows.slice(0, 10);

  // Get all field names from first row
  const sampleRow = validRows[0];
  const fieldNames = sampleRow ? Object.keys(sampleRow.data) : [];

  return (
    <div className="space-y-6">
      {/* Summary Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
        <h3 className="text-xl font-semibold text-gray-900 mb-3 flex items-center">
          <span className="text-3xl mr-3">👀</span>
          Preview {type === 'faculty' ? 'Faculty' : 'Student'} Data
        </h3>
        <div className="grid grid-cols-3 gap-4 mt-4">
          <div className="bg-white rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-green-600">{validRows.length}</div>
            <div className="text-sm text-gray-600">Ready to Import</div>
          </div>
          <div className="bg-white rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-yellow-600">{stats.withWarnings}</div>
            <div className="text-sm text-gray-600">With Warnings</div>
          </div>
          <div className="bg-white rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-red-600">{stats.withErrors}</div>
            <div className="text-sm text-gray-600">Skipped (Errors)</div>
          </div>
        </div>
      </div>

      {/* Data Preview Table */}
      <div className="border rounded-lg overflow-hidden">
        <div className="max-h-96 overflow-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-100 sticky top-0">
              <tr>
                <th className="px-3 py-2 text-left font-medium text-gray-700 border-b">#</th>
                {fieldNames.map((field, idx) => (
                  <th key={idx} className="px-3 py-2 text-left font-medium text-gray-700 border-b capitalize">
                    {field.replace(/([A-Z])/g, ' $1').trim()}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {displayRows.map((row, idx) => (
                <tr key={idx} className="border-b hover:bg-gray-50">
                  <td className="px-3 py-2 text-gray-600">{idx + 1}</td>
                  {fieldNames.map((field, fieldIdx) => (
                    <td key={fieldIdx} className="px-3 py-2 text-gray-700">
                      {formatValue(row.data[field], field)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Show More/Less Toggle */}
      {validRows.length > 10 && (
        <div className="text-center">
          <button
            onClick={() => setShowAll(!showAll)}
            className={`px-4 py-2 bg-${typeColor}-100 text-${typeColor}-700 rounded-lg hover:bg-${typeColor}-200 font-medium transition-colors`}
          >
            {showAll ? 'Show Less' : `Show All ${validRows.length} Rows`}
          </button>
        </div>
      )}

      {/* Important Notes */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h4 className="font-semibold text-yellow-900 mb-2 flex items-center">
          <span className="text-xl mr-2">💡</span>
          What happens next?
        </h4>
        <ul className="list-disc list-inside text-sm text-yellow-800 space-y-1 ml-6">
          <li>All {validRows.length} valid records will be imported</li>
          <li>Existing records (duplicate email/ID) will be updated</li>
          <li>New records will be created with auto-generated passwords</li>
          <li>Users will be assigned to your institution automatically</li>
          {type === 'faculty' && <li>Faculty members can log in immediately after import</li>}
          {type === 'student' && <li>Students can log in immediately after import</li>}
          <li>Rows with errors ({stats.withErrors}) will be skipped</li>
        </ul>
      </div>

      {/* Action Info */}
      <div className="text-center text-gray-600">
        <p className="text-sm">
          Review the data above carefully. Click <strong>"Next"</strong> to proceed with the import.
        </p>
      </div>
    </div>
  );
}

// Step 5: Save
function StepSave({ type, typeColor, parsedData, importResults, isSaving, onReset }) {
  if (isSaving) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4 animate-pulse">💾</div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Saving Records to Database...
        </h3>
        <p className="text-gray-600">
          This may take a few moments. Please don't close this window.
        </p>
        <div className="mt-6">
          <div className="w-64 mx-auto bg-gray-200 rounded-full h-2">
            <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{ width: '75%' }}></div>
          </div>
        </div>
      </div>
    );
  }

  if (!importResults) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">⏳</div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Waiting to Save...
        </h3>
      </div>
    );
  }

  const totalProcessed = importResults.created + importResults.updated + importResults.failed;
  const successRate = totalProcessed > 0 ? ((importResults.created + importResults.updated) / totalProcessed * 100).toFixed(1) : 0;

  return (
    <div className="space-y-6">
      {/* Success Header */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-8 border border-green-200 text-center">
        <div className="text-6xl mb-4">🎉</div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">
          Import Completed Successfully!
        </h3>
        <p className="text-gray-700">
          Your {type === 'faculty' ? 'faculty' : 'student'} data has been imported to the database.
        </p>
      </div>

      {/* Results Summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-green-50 rounded-lg p-6 text-center border border-green-200">
          <div className="text-3xl font-bold text-green-600">{importResults.created}</div>
          <div className="text-sm text-gray-700 mt-1">New Records Created</div>
        </div>
        <div className="bg-blue-50 rounded-lg p-6 text-center border border-blue-200">
          <div className="text-3xl font-bold text-blue-600">{importResults.updated}</div>
          <div className="text-sm text-gray-700 mt-1">Existing Records Updated</div>
        </div>
        <div className="bg-red-50 rounded-lg p-6 text-center border border-red-200">
          <div className="text-3xl font-bold text-red-600">{importResults.failed}</div>
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
      {importResults.errors && importResults.errors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h4 className="font-semibold text-red-900 mb-3 flex items-center">
            <span className="text-xl mr-2">⚠️</span>
            Failed Records ({importResults.errors.length})
          </h4>
          <div className="max-h-48 overflow-y-auto space-y-2">
            {importResults.errors.map((err, idx) => (
              <div key={idx} className="bg-white rounded p-3 text-sm">
                <div className="font-medium text-red-800">Row {err.row}</div>
                <div className="text-red-600">{err.error}</div>
                <div className="text-gray-600 text-xs mt-1">
                  {err.data.fullName} ({err.data.email})
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Next Steps */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h4 className="font-semibold text-blue-900 mb-3 flex items-center">
          <span className="text-xl mr-2">💡</span>
          What's Next?
        </h4>
        <ul className="list-disc list-inside text-sm text-blue-800 space-y-2 ml-6">
          <li>All imported users can now log in with their credentials</li>
          <li>Default passwords: First 4 letters of FIRST NAME + Last 4 digits of phone</li>
          <li>Titles (Mr., Dr., Ms., etc.) are automatically removed</li>
          <li>Examples:</li>
          <li className="ml-6">→ "Dr. Meera Iyer" + "9123456780" = Password: "meer6780"</li>
          <li className="ml-6">→ "Mr. John Doe" + "9876543210" = Password: "john3210"</li>
          <li>⚠️ Advise all users to change their password after first login</li>
          {type === 'student' && <li>Students can be enrolled in sections from Admin Panel</li>}
          {type === 'faculty' && <li>Faculty can be assigned to sections from Admin Panel</li>}
        </ul>
      </div>

      {/* Actions */}
      <div className="flex gap-4 justify-center">
        <button
          onClick={onReset}
          className={`px-6 py-3 bg-${typeColor}-600 text-white rounded-lg hover:bg-${typeColor}-700 font-medium transition-colors`}
        >
          Import More Data
        </button>
        <button
          onClick={() => window.location.href = '/admin'}
          className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium transition-colors"
        >
          Back to Dashboard
        </button>
      </div>
    </div>
  );
}
