import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { employeeSchema, EmployeeFormData } from '@/lib/validations/employee';
import { BLOOD_GROUPS, DEPARTMENTS, EMPLOYMENT_TYPES, QUALIFICATIONS, SKILL_CATEGORIES } from '@/types/employee';
import { salaryCodesService, SalaryCode } from '@/lib/salary-codes-service';

interface ComprehensiveEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  employee: any;
  onSave: (data: any) => Promise<void>;
}

export const ComprehensiveEditModal: React.FC<ComprehensiveEditModalProps> = ({
  isOpen,
  onClose,
  employee,
  onSave
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [salaryCodes, setSalaryCodes] = useState<SalaryCode[]>([]);
  const [loadingSalaryCodes, setLoadingSalaryCodes] = useState(true);
  const [activeTab, setActiveTab] = useState('personal');
  const [tabValidationErrors, setTabValidationErrors] = useState<Record<string, string[]>>({});
  const [hasAttemptedSave, setHasAttemptedSave] = useState(false);

  // File states for document uploads
  const [chequeFile, setChequeFile] = useState<File | null>(null);
  const [aadhaarFront, setAadhaarFront] = useState<File | null>(null);
  const [aadhaarBack, setAadhaarBack] = useState<File | null>(null);
  const [panFront, setPanFront] = useState<File | null>(null);
  const [panBack, setPanBack] = useState<File | null>(null);
  const [voterFront, setVoterFront] = useState<File | null>(null);
  const [voterBack, setVoterBack] = useState<File | null>(null);
  const [passbookFront, setPassbookFront] = useState<File | null>(null);

  // Fetch salary codes and handle body scroll lock
  useEffect(() => {
    const fetchSalaryCodes = async () => {
      try {
        setLoadingSalaryCodes(true);
        const codes = await salaryCodesService.getSalaryCodes();
        setSalaryCodes(codes);
      } catch (error) {
        console.error('Error fetching salary codes:', error);
      } finally {
        setLoadingSalaryCodes(false);
      }
    };

    if (isOpen) {
      fetchSalaryCodes();
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = '0px'; // Prevent layout shift
    } else {
      // Restore body scroll when modal closes
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    }

    // Cleanup on unmount
    return () => {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    };
  }, [isOpen]);

  // Form initialization with employee data
  const { register, handleSubmit, formState: { errors }, reset, watch } = useForm<EmployeeFormData>({
    resolver: zodResolver(employeeSchema),
    defaultValues: {
      fullName: employee ? `${employee.first_name} ${employee.last_name}` : '',
      dateOfBirth: employee?.date_of_birth || '',
      gender: employee?.gender || '',
      maritalStatus: employee?.marital_status || '',
      nationality: employee?.nationality || '',
      bloodGroup: employee?.blood_group || '',
      permanentAddress: employee?.address || '',
      mobileNumber: employee?.phone_number || '',
      alternateContactNumber: employee?.alternate_contact_number || '',
      aadhaarNumber: employee?.adhar_number || '',
      panCardNumber: employee?.pan_card_number || '',
      voterIdOrLicense: employee?.voter_id_driving_license || '',
      uanNumber: employee?.uan || '',
      esicNumber: employee?.esic_number || '',
      dateOfJoining: employee?.hire_date || '',
      employmentType: employee?.employment_type || '',
      department: employee?.department_id || '',
      designation: employee?.designation || '',
      workLocation: employee?.work_location || '',
      reportingManager: employee?.reporting_manager || '',
      salaryCode: employee?.salary_code || '',
      skillCategory: employee?.skill_category || '',
      pfApplicability: employee?.pf_applicability || false,
      esicApplicability: employee?.esic_applicability || false,
      professionalTaxApplicability: employee?.professional_tax_applicability || false,
      salaryAdvanceOrLoan: employee?.salary_advance_loan || 0,
      bankAccountNumber: employee?.bank_account_number || '',
      bankName: employee?.bank_name || '',
      ifscCode: employee?.ifsc_code || '',
      highestQualification: employee?.highest_qualification || '',
      yearOfPassing: employee?.year_of_passing || new Date().getFullYear(),
      additionalCertifications: employee?.additional_certifications || '',
      experienceDuration: employee?.experience_duration || 0,
      emergencyContactName: employee?.emergency_contact_name || '',
      emergencyRelationship: employee?.emergency_contact_relationship || '',
      emergencyPhoneNumber: employee?.emergency_contact_phone || ''
    }
  });

  // Reset form when employee changes
  useEffect(() => {
    if (employee && isOpen) {
      // Debug: Log the employee data to see what fields are available
      // console.log('Employee data received in modal:', employee);
      // console.log('Available fields:', Object.keys(employee));

      // Helper function to safely get employee field value with multiple possible field names
      const getEmployeeField = (fieldNames: string[]) => {
        for (const fieldName of fieldNames) {
          const value = employee[fieldName];
          if (value !== undefined && value !== null && value !== '') {
            // console.log(`Found field ${fieldName}:`, value);
            return value;
          }
        }
        // console.log(`No value found for fields:`, fieldNames);
        return '';
      };

      // Helper function to safely get boolean field value
      const getBooleanField = (fieldNames: string[]) => {
        for (const fieldName of fieldNames) {
          const value = employee[fieldName];
          if (value !== undefined && value !== null) {
            // console.log(`Found boolean field ${fieldName}:`, value);
            return Boolean(value);
          }
        }
        // console.log(`No boolean value found for fields:`, fieldNames);
        return false;
      };

      // Helper function to safely get number field value
      const getNumberField = (fieldNames: string[], defaultValue: number = 0) => {
        for (const fieldName of fieldNames) {
          const value = employee[fieldName];
          if (value !== undefined && value !== null && value !== '') {
            const numValue = Number(value);
            if (!isNaN(numValue)) {
              // console.log(`Found number field ${fieldName}:`, numValue);
              return numValue;
            }
          }
        }
        // console.log(`No valid number found for fields:`, fieldNames, 'using default:', defaultValue);
        return defaultValue;
      };

      const formData = {
        fullName: `${employee.first_name || ''} ${employee.last_name || ''}`.trim(),
        dateOfBirth: getEmployeeField(['date_of_birth', 'dateOfBirth']),
        gender: getEmployeeField(['gender']),
        maritalStatus: getEmployeeField(['marital_status', 'maritalStatus']),
        nationality: getEmployeeField(['nationality']),
        bloodGroup: getEmployeeField(['blood_group', 'bloodGroup']),
        permanentAddress: getEmployeeField(['address', 'permanentAddress']),
        mobileNumber: getEmployeeField(['phone_number', 'mobileNumber']),
        alternateContactNumber: getEmployeeField(['alternate_contact_number', 'alternateContactNumber']),
        aadhaarNumber: getEmployeeField(['adhar_number', 'aadhaarNumber']),
        panCardNumber: getEmployeeField(['pan_card_number', 'panCardNumber']),
        voterIdOrLicense: getEmployeeField(['voter_id_driving_license', 'voterIdOrLicense']),
        uanNumber: getEmployeeField(['uan', 'uanNumber']),
        esicNumber: getEmployeeField(['esic_number', 'esicNumber']),
        dateOfJoining: getEmployeeField(['hire_date', 'dateOfJoining']),
        employmentType: getEmployeeField(['employment_type', 'employmentType']) || undefined,
        department: getEmployeeField(['department_id', 'department']),
        designation: getEmployeeField(['designation']),
        workLocation: getEmployeeField(['work_location', 'workLocation']),
        reportingManager: getEmployeeField(['reporting_manager', 'reportingManager']),
        salaryCode: getEmployeeField(['salary_code', 'salaryCode']),
        skillCategory: getEmployeeField(['skill_category', 'skillCategory']),
        pfApplicability: getBooleanField(['pf_applicability', 'pfApplicability']),
        esicApplicability: getBooleanField(['esic_applicability', 'esicApplicability']),
        professionalTaxApplicability: getBooleanField(['professional_tax_applicability', 'professionalTaxApplicability']),
        salaryAdvanceOrLoan: getNumberField(['salary_advance_loan', 'salaryAdvanceOrLoan'], 0),
        bankAccountNumber: getEmployeeField(['bank_account_number', 'bankAccountNumber']),
        bankName: getEmployeeField(['bank_name', 'bankName']),
        ifscCode: getEmployeeField(['ifsc_code', 'ifscCode']),
        highestQualification: getEmployeeField(['highest_qualification', 'highestQualification']),
        yearOfPassing: getNumberField(['year_of_passing', 'yearOfPassing'], new Date().getFullYear()),
        additionalCertifications: getEmployeeField(['additional_certifications', 'additionalCertifications']),
        experienceDuration: getNumberField(['experience_duration', 'experienceDuration'], 0),
        emergencyContactName: getEmployeeField(['emergency_contact_name', 'emergencyContactName']),
        emergencyRelationship: getEmployeeField(['emergency_contact_relationship', 'emergencyRelationship']),
        emergencyPhoneNumber: getEmployeeField(['emergency_contact_phone', 'emergencyPhoneNumber'])
      };

      // console.log('Final form data being set:', formData);
      reset(formData);

      // Don't validate mandatory fields on initial load - only after save attempt
      // setTimeout(() => validateMandatoryFields(formData), 100);
    }
  }, [employee, isOpen, reset]);

  const onSubmit = async (data: EmployeeFormData) => {
    setHasAttemptedSave(true);
    setIsSubmitting(true);

    // Validate mandatory fields before submission
    const isValid = validateMandatoryFields(data);
    if (!isValid) {
      setIsSubmitting(false);
      // Switch to the first tab with errors
      const firstTabWithErrors = Object.keys(tabValidationErrors)[0];
      if (firstTabWithErrors) {
        setActiveTab(firstTabWithErrors);
      }
      return;
    }

    try {
      const formData = new FormData();

      // Field mapping (same as registration form)
      const fieldMapping: Record<string, string> = {
        dateOfBirth: 'date_of_birth',
        gender: 'gender',
        maritalStatus: 'marital_status',
        nationality: 'nationality',
        bloodGroup: 'blood_group',
        permanentAddress: 'address',
        mobileNumber: 'phone_number',
        alternateContactNumber: 'alternate_contact_number',
        aadhaarNumber: 'adhar_number',
        panCardNumber: 'pan_card_number',
        voterIdOrLicense: 'voter_id_driving_license',
        uanNumber: 'uan',
        esicNumber: 'esic_number',
        dateOfJoining: 'hire_date',
        employmentType: 'employment_type',
        department: 'department_id',
        designation: 'designation',
        workLocation: 'work_location',
        reportingManager: 'reporting_manager',
        salaryCode: 'salary_code',
        skillCategory: 'skill_category',
        pfApplicability: 'pf_applicability',
        esicApplicability: 'esic_applicability',
        professionalTaxApplicability: 'professional_tax_applicability',
        salaryAdvanceOrLoan: 'salary_advance_loan',
        bankAccountNumber: 'bank_account_number',
        bankName: 'bank_name',
        ifscCode: 'ifsc_code',
        highestQualification: 'highest_qualification',
        yearOfPassing: 'year_of_passing',
        additionalCertifications: 'additional_certifications',
        experienceDuration: 'experience_duration',
        emergencyContactName: 'emergency_contact_name',
        emergencyRelationship: 'emergency_contact_relationship',
        emergencyPhoneNumber: 'emergency_contact_phone'
      };

      // Department mapping
      const departmentMapping: Record<string, string> = {
        'HR': 'HR',
        'IT': 'IT',
        'Finance': 'FIN',
        'Marketing': 'MKT',
        'Operations': 'OPS',
        'Sales': 'SAL',
        'Engineering': 'ENG',
        'Customer Support': 'CS',
        'Legal': 'LEG',
        'Administration': 'ADM'
      };

      // Split fullName into first_name and last_name
      const nameParts = data.fullName.trim().split(' ').filter(part => part.length > 0);
      const firstName = nameParts[0] || '';
      const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : 'N/A';

      formData.append('first_name', firstName);
      formData.append('last_name', lastName);

      // Append mapped fields
      Object.entries(data).forEach(([frontendKey, value]) => {
        if (frontendKey === 'fullName') return;

        const backendKey = fieldMapping[frontendKey] || frontendKey;

        if (value === undefined || value === null || value === '') {
          return;
        }

        let finalValue = value;
        if (frontendKey === 'department' && typeof value === 'string') {
          finalValue = departmentMapping[value] || value;
        }

        if (typeof finalValue === 'boolean') {
          formData.append(backendKey, finalValue.toString());
        } else {
          formData.append(backendKey, finalValue.toString());
        }
      });

      // Append files
      if (chequeFile) formData.append('cheque', chequeFile);
      if (aadhaarFront) formData.append('aadhaar_front', aadhaarFront);
      if (aadhaarBack) formData.append('aadhaar_back', aadhaarBack);
      if (panFront) formData.append('pan_front', panFront);
      if (panBack) formData.append('pan_back', panBack);
      if (voterFront) formData.append('voter_front', voterFront);
      if (voterBack) formData.append('voter_back', voterBack);
      if (passbookFront) formData.append('passbook_front', passbookFront);

      await onSave(formData);
      onClose();
    } catch (error) {
      console.error('Error updating employee:', error);
      alert('Error updating employee. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDocChange = (setter: React.Dispatch<React.SetStateAction<File | null>>) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setter(file);
  };

  // Define mandatory fields for each tab
  const mandatoryFieldsByTab = {
    personal: ['fullName', 'dateOfBirth', 'gender', 'maritalStatus', 'nationality'],
    contact: ['permanentAddress', 'mobileNumber', 'aadhaarNumber'],
    employment: ['dateOfJoining', 'employmentType', 'department', 'designation', 'workLocation'],
    financial: ['salaryCode', 'bankAccountNumber', 'bankName', 'ifscCode'],
    education: ['highestQualification', 'yearOfPassing', 'experienceDuration', 'emergencyContactName', 'emergencyRelationship', 'emergencyPhoneNumber'],
    documents: [] // No mandatory fields for documents tab
  };

  const tabs = [
    { id: 'personal', label: 'Personal Info' },
    { id: 'contact', label: 'Contact & IDs' },
    { id: 'employment', label: 'Employment' },
    { id: 'financial', label: 'Financial' },
    { id: 'education', label: 'Education' },
    { id: 'documents', label: 'Documents' }
  ];

  // Function to validate mandatory fields and update tab errors
  const validateMandatoryFields = (formData: any) => {
    const newTabErrors: Record<string, string[]> = {};

    Object.entries(mandatoryFieldsByTab).forEach(([tabId, fields]) => {
      const missingFields: string[] = [];

      fields.forEach(field => {
        const value = formData[field];
        if (value === undefined || value === null || value === '' || (typeof value === 'string' && value.trim() === '')) {
          // Convert field name to display name
          const displayName = field.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
          missingFields.push(displayName);
        }
      });

      if (missingFields.length > 0) {
        newTabErrors[tabId] = missingFields;
      }
    });

    setTabValidationErrors(newTabErrors);
    return Object.keys(newTabErrors).length === 0;
  };

  if (!isOpen) return null;

  return (
    <div
  className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-2 sm:p-4 ml-14"
>
  <div
    className="bg-white rounded-lg shadow-2xl w-full mx-4 sm:mx-8 md:mx-auto max-w-sm sm:max-w-2xl md:max-w-4xl lg:max-w-6xl xl:max-w-7xl max-h-[95vh] sm:max-h-[92vh] md:max-h-[90vh] overflow-hidden flex flex-col"
  >
    <div className="flex justify-between items-center p-3 sm:p-4 md:p-6 border-b flex-shrink-0">
      <h2 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-gray-800 truncate pr-2">
        Edit Employee: {employee?.first_name} {employee?.last_name}
      </h2>
      <button
        onClick={onClose}
        className="text-gray-500 hover:text-gray-700 text-2xl sm:text-3xl font-bold flex-shrink-0 w-8 h-8 flex items-center justify-center"
        disabled={isSubmitting}
        aria-label="Close"
      >
        ×
      </button>
    </div>

        {/* Tab Navigation */}
        <div className="border-b flex-shrink-0">
          <nav className="flex overflow-x-auto px-4 sm:px-6 scrollbar-hide">
            {tabs.map(tab => {
              const hasErrors = hasAttemptedSave && tabValidationErrors[tab.id]?.length > 0;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-3 px-2 sm:px-4 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap flex-shrink-0 relative ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : hasErrors
                        ? 'border-red-500 text-red-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                  title={hasErrors ? `Missing: ${tabValidationErrors[tab.id].join(', ')}` : undefined}
                >
                  {tab.label}
                  {hasErrors && (
                    <span className="ml-1 inline-block w-2 h-2 bg-red-500 rounded-full" title={`Missing: ${tabValidationErrors[tab.id].join(', ')}`}></span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="overflow-y-auto flex-1">
          <form onSubmit={handleSubmit(onSubmit)} className="p-4 sm:p-6">
            {/* Personal Information Tab */}
            {activeTab === 'personal' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-700 mb-4">Personal Information</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                    <input
                      {...register('fullName')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName.message}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth *</label>
                    <input
                      type="date"
                      {...register('dateOfBirth')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {errors.dateOfBirth && <p className="text-red-500 text-xs mt-1">{errors.dateOfBirth.message}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Gender *</label>
                    <select
                      {...register('gender')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                    {errors.gender && <p className="text-red-500 text-xs mt-1">{errors.gender.message}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Marital Status *</label>
                    <select
                      {...register('maritalStatus')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Status</option>
                      <option value="Single">Single</option>
                      <option value="Married">Married</option>
                      <option value="Divorced">Divorced</option>
                      <option value="Widowed">Widowed</option>
                    </select>
                    {errors.maritalStatus && <p className="text-red-500 text-xs mt-1">{errors.maritalStatus.message}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nationality *</label>
                    <input
                      {...register('nationality')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {errors.nationality && <p className="text-red-500 text-xs mt-1">{errors.nationality.message}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Blood Group</label>
                    <select
                      {...register('bloodGroup')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Blood Group</option>
                      {BLOOD_GROUPS.map(group => (
                        <option key={group} value={group}>{group}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Contact Information & IDs Tab */}
            {activeTab === 'contact' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-4">Contact Information</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Permanent Address *</label>
                      <textarea
                        {...register('permanentAddress')}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      {errors.permanentAddress && <p className="text-red-500 text-xs mt-1">{errors.permanentAddress.message}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number *</label>
                      <input
                        {...register('mobileNumber')}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      {errors.mobileNumber && <p className="text-red-500 text-xs mt-1">{errors.mobileNumber.message}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Alternate Contact Number</label>
                      <input
                        {...register('alternateContactNumber')}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-4">Government IDs</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Aadhaar Number *</label>
                      <input
                        {...register('aadhaarNumber')}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        maxLength={12}
                      />
                      {errors.aadhaarNumber && <p className="text-red-500 text-xs mt-1">{errors.aadhaarNumber.message}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">PAN Card Number *</label>
                      <input
                        {...register('panCardNumber')}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        maxLength={10}
                        style={{ textTransform: 'uppercase' }}
                      />
                      {errors.panCardNumber && <p className="text-red-500 text-xs mt-1">{errors.panCardNumber.message}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Voter ID / Driving License</label>
                      <input
                        {...register('voterIdOrLicense')}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">UAN</label>
                      <input
                        {...register('uanNumber')}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">ESIC Number</label>
                      <input
                        {...register('esicNumber')}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Employment Tab */}
            {activeTab === 'employment' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-700 mb-4">Employment Details</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date of Joining *</label>
                    <input
                      type="date"
                      {...register('dateOfJoining')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {errors.dateOfJoining && <p className="text-red-500 text-xs mt-1">{errors.dateOfJoining.message}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Employment Type *</label>
                    <select
                      {...register('employmentType')}
                      value={watch('employmentType') || ''}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Type</option>
                      {EMPLOYMENT_TYPES.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                    {errors.employmentType && <p className="text-red-500 text-xs mt-1">{errors.employmentType.message}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Department *</label>
                    <select
                      {...register('department')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Department</option>
                      {DEPARTMENTS.map(dept => (
                        <option key={dept} value={dept}>{dept}</option>
                      ))}
                    </select>
                    {errors.department && <p className="text-red-500 text-xs mt-1">{errors.department.message}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Designation *</label>
                    <input
                      {...register('designation')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {errors.designation && <p className="text-red-500 text-xs mt-1">{errors.designation.message}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Work Location *</label>
                    <input
                      {...register('workLocation')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {errors.workLocation && <p className="text-red-500 text-xs mt-1">{errors.workLocation.message}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Reporting Manager</label>
                    <input
                      {...register('reportingManager')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Experience Duration (years) *</label>
                    <input
                      type="number"
                      {...register('experienceDuration', { valueAsNumber: true })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {errors.experienceDuration && <p className="text-red-500 text-xs mt-1">{errors.experienceDuration.message}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Skill Category</label>
                    <select
                      {...register('skillCategory')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Category</option>
                      {SKILL_CATEGORIES.map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Financial Tab */}
            {activeTab === 'financial' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-4">Salary & Benefits</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Salary Code *</label>
                      <select
                        {...register('salaryCode')}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        disabled={loadingSalaryCodes}
                      >
                        <option value="">
                          {loadingSalaryCodes ? 'Loading salary codes...' : 'Select Salary Code'}
                        </option>
                        {salaryCodes.map(code => (
                          <option key={code.id} value={code.salary_code}>
                            {code.display_name}
                          </option>
                        ))}
                      </select>
                      {errors.salaryCode && <p className="text-red-500 text-xs mt-1">{errors.salaryCode.message}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Salary Advance/Loan</label>
                      <input
                        type="number"
                        {...register('salaryAdvanceOrLoan', { valueAsNumber: true })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="mt-4 space-y-3">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        {...register('pfApplicability')}
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <label className="ml-2 text-sm text-gray-700">PF Applicability</label>
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        {...register('esicApplicability')}
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <label className="ml-2 text-sm text-gray-700">ESIC Applicability</label>
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        {...register('professionalTaxApplicability')}
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <label className="ml-2 text-sm text-gray-700">Professional Tax Applicability</label>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-4">Bank Details</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Bank Account Number *</label>
                      <input
                        {...register('bankAccountNumber')}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      {errors.bankAccountNumber && <p className="text-red-500 text-xs mt-1">{errors.bankAccountNumber.message}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Bank Name *</label>
                      <input
                        {...register('bankName')}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      {errors.bankName && <p className="text-red-500 text-xs mt-1">{errors.bankName.message}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">IFSC Code *</label>
                      <input
                        {...register('ifscCode')}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        style={{ textTransform: 'uppercase' }}
                      />
                      {errors.ifscCode && <p className="text-red-500 text-xs mt-1">{errors.ifscCode.message}</p>}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Education Tab */}
            {activeTab === 'education' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-4">Education</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Highest Qualification *</label>
                      <select
                        {...register('highestQualification')}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select Qualification</option>
                        {QUALIFICATIONS.map(qual => (
                          <option key={qual} value={qual}>{qual}</option>
                        ))}
                      </select>
                      {errors.highestQualification && <p className="text-red-500 text-xs mt-1">{errors.highestQualification.message}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Year of Passing *</label>
                      <input
                        type="number"
                        {...register('yearOfPassing', { valueAsNumber: true })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        min="1900"
                        max={new Date().getFullYear()}
                      />
                      {errors.yearOfPassing && <p className="text-red-500 text-xs mt-1">{errors.yearOfPassing.message}</p>}
                    </div>

                    <div className="md:col-span-2 lg:col-span-1">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Additional Certifications</label>
                      <textarea
                        {...register('additionalCertifications')}
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-4">Emergency Contact</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Contact Name *</label>
                      <input
                        {...register('emergencyContactName')}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      {errors.emergencyContactName && <p className="text-red-500 text-xs mt-1">{errors.emergencyContactName.message}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Relationship *</label>
                      <input
                        {...register('emergencyRelationship')}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      {errors.emergencyRelationship && <p className="text-red-500 text-xs mt-1">{errors.emergencyRelationship.message}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
                      <input
                        {...register('emergencyPhoneNumber')}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      {errors.emergencyPhoneNumber && <p className="text-red-500 text-xs mt-1">{errors.emergencyPhoneNumber.message}</p>}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Documents Tab */}
            {activeTab === 'documents' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-700 mb-4">Supporting Documents</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Aadhaar Front</label>
                    <input
                      type="file"
                      accept=".jpg,.jpeg,.png,.pdf"
                      onChange={handleDocChange(setAadhaarFront)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                    {aadhaarFront && <p className="text-xs text-green-600 mt-1">{aadhaarFront.name}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Aadhaar Back</label>
                    <input
                      type="file"
                      accept=".jpg,.jpeg,.png,.pdf"
                      onChange={handleDocChange(setAadhaarBack)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                    {aadhaarBack && <p className="text-xs text-green-600 mt-1">{aadhaarBack.name}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">PAN Front</label>
                    <input
                      type="file"
                      accept=".jpg,.jpeg,.png,.pdf"
                      onChange={handleDocChange(setPanFront)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                    {panFront && <p className="text-xs text-green-600 mt-1">{panFront.name}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">PAN Back</label>
                    <input
                      type="file"
                      accept=".jpg,.jpeg,.png,.pdf"
                      onChange={handleDocChange(setPanBack)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                    {panBack && <p className="text-xs text-green-600 mt-1">{panBack.name}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Voter ID Front</label>
                    <input
                      type="file"
                      accept=".jpg,.jpeg,.png,.pdf"
                      onChange={handleDocChange(setVoterFront)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                    {voterFront && <p className="text-xs text-green-600 mt-1">{voterFront.name}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Voter ID Back</label>
                    <input
                      type="file"
                      accept=".jpg,.jpeg,.png,.pdf"
                      onChange={handleDocChange(setVoterBack)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                    {voterBack && <p className="text-xs text-green-600 mt-1">{voterBack.name}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Passbook Front Page</label>
                    <input
                      type="file"
                      accept=".jpg,.jpeg,.png,.pdf"
                      onChange={handleDocChange(setPassbookFront)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                    {passbookFront && <p className="text-xs text-green-600 mt-1">{passbookFront.name}</p>}
                  </div>

                  <div className="md:col-span-2 lg:col-span-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Cancelled Cheque (optional)</label>
                    <input
                      type="file"
                      accept=".jpg,.jpeg,.png,.pdf"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) setChequeFile(file);
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                    {chequeFile && <p className="text-xs text-green-600 mt-1">{chequeFile.name}</p>}
                  </div>
                </div>
              </div>
            )}
          </form>
        </div>

        {/* Footer with action buttons */}
        <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4 p-4 sm:p-6 border-t bg-gray-50 flex-shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 sm:px-6 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 text-sm sm:text-base"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit(onSubmit)}
            className="px-4 sm:px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 text-sm sm:text-base"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
};