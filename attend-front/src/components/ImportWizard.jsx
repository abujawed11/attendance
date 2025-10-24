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

  const typeLabel = type === 'faculty' ? 'Faculty' : 'Student';
  const typeColor = type === 'faculty' ? 'blue' : 'green';

  const handleNext = async () => {
    // If moving from step 2 to step 3, parse the file
    if (currentStep === 2 && uploadedFile) {
      await parseUploadedFile();
    }

    // Block moving from step 3 if there are errors
    if (currentStep === 3 && parsedData && parsedData.stats.withErrors > 0) {
      alert('Please fix all errors before proceeding. You can edit your Excel file and re-upload from Step 2.');
      return;
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

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return <StepDownloadTemplate type={type} typeColor={typeColor} />;
      case 2:
        return <StepUploadFile type={type} typeColor={typeColor} uploadedFile={uploadedFile} setUploadedFile={setUploadedFile} />;
      case 3:
        return <StepValidateMap type={type} typeColor={typeColor} parsedData={parsedData} isProcessing={isProcessing} />;
      case 4:
        return <StepPreview type={type} typeColor={typeColor} parsedData={parsedData} />;
      case 5:
        return <StepSave type={type} typeColor={typeColor} parsedData={parsedData} />;
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
            disabled={currentStep === 1}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
              currentStep === 1
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

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${type}_import_template.xlsx`;
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
function StepValidateMap({ type, typeColor, parsedData, isProcessing }) {
  const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'valid', 'warnings', 'errors'

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

  const { stats, rows, validationResults, mapping, unmapped } = parsedData;

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
              <th className="px-3 py-2 text-left font-medium text-gray-700 border-b">Row</th>
              <th className="px-3 py-2 text-left font-medium text-gray-700 border-b">Status</th>
              <th className="px-3 py-2 text-left font-medium text-gray-700 border-b">Data Preview</th>
              <th className="px-3 py-2 text-left font-medium text-gray-700 border-b">Issues</th>
            </tr>
          </thead>
          <tbody>
            {filteredRows.map((row, idx) => {
              const validation = getRowValidation(row.rowIndex);
              const hasIssues = validation && (validation.errors.length > 0 || validation.warnings.length > 0);

              return (
                <tr key={idx} className="border-b hover:bg-gray-50">
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
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Summary Message */}
      {stats.withErrors > 0 ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-800">
            <span className="font-semibold">⚠️ Cannot proceed:</span> Please fix {stats.withErrors} row(s) with errors before continuing.
            You can edit your Excel file and re-upload.
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
    </div>
  );
}

// Step 4: Preview
function StepPreview({ type, typeColor, parsedData }) {
  const [showAll, setShowAll] = useState(false);

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
                      {row.data[field] || '-'}
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

// Step 5: Save (Placeholder)
function StepSave({ type, typeColor }) {
  return (
    <div className="text-center py-12">
      <div className="text-6xl mb-4">💾</div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">
        Save Records
      </h3>
      <p className="text-gray-600">
        Commit all valid records to your institution.
        <br />
        (Will be implemented in Step 5)
      </p>
    </div>
  );
}
