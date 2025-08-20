import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { employeeSchema, EmployeeFormData } from '@/lib/validations/employee';
import { BLOOD_GROUPS, DEPARTMENTS, EMPLOYMENT_TYPES, QUALIFICATIONS, SKILL_CATEGORIES } from '@/types/employee';
import { salaryCodesService, SalaryCode } from '@/lib/salary-codes-service';

const EmployeeRegistrationForm: React.FC = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [chequeFile, setChequeFile] = useState<File | null>(null);
  const [aadhaarFront, setAadhaarFront] = useState<File | null>(null);
  const [aadhaarBack, setAadhaarBack] = useState<File | null>(null);
  const [panFront, setPanFront] = useState<File | null>(null);
  const [panBack, setPanBack] = useState<File | null>(null);
  const [voterFront, setVoterFront] = useState<File | null>(null);
  const [voterBack, setVoterBack] = useState<File | null>(null);
  const [passbookFront, setPassbookFront] = useState<File | null>(null);
  const [salaryCodes, setSalaryCodes] = useState<SalaryCode[]>([]);
  const [loadingSalaryCodes, setLoadingSalaryCodes] = useState(true);

  // Fetch salary codes on component mount
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

    fetchSalaryCodes();
  }, []);

  // Single useForm initialization with correct type
  const { register, handleSubmit, formState: { errors }, reset, watch } = useForm<EmployeeFormData>({
    resolver: zodResolver(employeeSchema),
    defaultValues: {
      pfApplicability: false,
      esicApplicability: false,
      professionalTaxApplicability: false,
      experienceDuration: 0,
      salaryAdvanceOrLoan: 0
    }
      });

  const onSubmit = async (data: EmployeeFormData) => {
    setIsSubmitting(true);
    try {
      const formData = new FormData();

      // Map frontend field names to backend field names
      const fieldMapping: Record<string, string> = {
        dateOfBirth: 'date_of_birth',
        maritalStatus: 'marital_status',
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

      // Map department names to department IDs
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
        if (frontendKey === 'fullName') return; // Already handled above

        const backendKey = fieldMapping[frontendKey] || frontendKey;

        // Skip empty strings and null/undefined values for optional fields
        if (value === undefined || value === null || value === '') {
          return;
        }

        // Handle special mappings
        let finalValue = value;
        if (frontendKey === 'department' && typeof value === 'string') {
          finalValue = departmentMapping[value] || value;
        }

        // Handle boolean fields
        if (typeof finalValue === 'boolean') {
          formData.append(backendKey, finalValue.toString());
        } else {
          formData.append(backendKey, finalValue.toString());
        }
      });

      // Log the form data for debugging
      console.log('Form data being sent:');
      for (let [key, value] of formData.entries()) {
        console.log(`${key}: ${value}`);
      }

      // Append file if present
      if (chequeFile) formData.append('cheque', chequeFile);
      if (aadhaarFront) formData.append('aadhaar_front', aadhaarFront);
      if (aadhaarBack) formData.append('aadhaar_back', aadhaarBack);
      if (panFront) formData.append('pan_front', panFront);
      if (panBack) formData.append('pan_back', panBack);
      if (voterFront) formData.append('voter_front', voterFront);
      if (voterBack) formData.append('voter_back', voterBack);
      if (passbookFront) formData.append('passbook_front', passbookFront);

      console.log('Submitting employee data:', data);
      console.log('Cheque file:', chequeFile);

      // Submit to backend API
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const response = await fetch(`${apiUrl}/employees/register`, {
        method: 'POST',
        body: formData
      });

      const result = await response.json();

      if (result.success) {
        alert('Employee registered successfully!');
        reset();
        setChequeFile(null);
        setAadhaarFront(null);
        setAadhaarBack(null);
        setPanFront(null);
        setPanBack(null);
        setVoterFront(null);
        setVoterBack(null);
        setPassbookFront(null);
      } else {
        alert(`Error: ${result.message}`);
      }
    } catch (error) {
      console.error('Error submitting employee:', error);
      alert('Error registering employee. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setChequeFile(file);
    }
  };

  const handleDocChange = (setter: React.Dispatch<React.SetStateAction<File | null>>) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setter(file);
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-white rounded-xl shadow-lg p-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">Employee Registration</h2>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Personal Information */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-xl font-semibold text-gray-700 mb-4">Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                <input
                  {...register('fullName')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter full name"
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
                  placeholder="e.g., Indian"
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

          {/* Contact Information */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-xl font-semibold text-gray-700 mb-4">Contact Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Permanent Address *</label>
                <textarea
                  {...register('permanentAddress')}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter complete permanent address"
                />
                {errors.permanentAddress && <p className="text-red-500 text-xs mt-1">{errors.permanentAddress.message}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number *</label>
                <input
                  {...register('mobileNumber')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter mobile number"
                />
                {errors.mobileNumber && <p className="text-red-500 text-xs mt-1">{errors.mobileNumber.message}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Alternate Contact Number</label>
                <input
                  {...register('alternateContactNumber')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter alternate contact number"
                />
              </div>
            </div>
          </div>

          {/* Government IDs */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-xl font-semibold text-gray-700 mb-4">Government IDs</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Aadhaar Number *</label>
                <input
                  {...register('aadhaarNumber')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="12-digit Aadhaar number"
                  maxLength={12}
                />
                {errors.aadhaarNumber && <p className="text-red-500 text-xs mt-1">{errors.aadhaarNumber.message}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">PAN Card Number *</label>
                <input
                  {...register('panCardNumber')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="ABCDE1234F"
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
                  placeholder="Enter ID number"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">UAN</label>
                <input
                  {...register('uanNumber')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Universal Account Number"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ESIC Number</label>
                <input
                  {...register('esicNumber')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="ESIC Number"
                />
              </div>
            </div>
          </div>

          {/* Employment Details */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-xl font-semibold text-gray-700 mb-4">Employment Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              
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
                  placeholder="e.g., Software Developer"
                />
                {errors.designation && <p className="text-red-500 text-xs mt-1">{errors.designation.message}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Work Location *</label>
                <input
                  {...register('workLocation')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Head Office, Mumbai"
                />
                {errors.workLocation && <p className="text-red-500 text-xs mt-1">{errors.workLocation.message}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reporting Manager</label>
                <input
                  {...register('reportingManager')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Manager's name"
                />
              </div>
            </div>
          </div>

          {/* Salary & Benefits */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-xl font-semibold text-gray-700 mb-4">Salary & Benefits</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Salary Advance/Loan</label>
                <input
                  type="number"
                  {...register('salaryAdvanceOrLoan', { valueAsNumber: true })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Amount if any"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Experience Duration (years) *</label>
                <input
                  type="number"
                  {...register('experienceDuration', { valueAsNumber: true })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Years of experience"
                />
                {errors.experienceDuration && <p className="text-red-500 text-xs mt-1">{errors.experienceDuration.message}</p>}
              </div>
            </div>
            
            {/* Checkboxes for applicability */}
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

          {/* Bank Details */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-xl font-semibold text-gray-700 mb-4">Bank Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bank Account Number *</label>
                <input
                  {...register('bankAccountNumber')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Account number"
                />
                {errors.bankAccountNumber && <p className="text-red-500 text-xs mt-1">{errors.bankAccountNumber.message}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bank Name *</label>
                <input
                  {...register('bankName')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Bank name"
                />
                {errors.bankName && <p className="text-red-500 text-xs mt-1">{errors.bankName.message}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">IFSC Code *</label>
                <input
                  {...register('ifscCode')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="IFSC Code"
                  style={{ textTransform: 'uppercase' }}
                />
                {errors.ifscCode && <p className="text-red-500 text-xs mt-1">{errors.ifscCode.message}</p>}
              </div>
            </div>
          </div>

          {/* Education */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-xl font-semibold text-gray-700 mb-4">Education</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                  placeholder="YYYY"
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
                  placeholder="List additional certifications"
                />
              </div>
            </div>
          </div>

           {/* Emergency Contact */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-xl font-semibold text-gray-700 mb-4">Emergency Contact</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contact Name *</label>
                <input
                  {...register('emergencyContactName')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Full name"
                />
                {errors.emergencyContactName && <p className="text-red-500 text-xs mt-1">{errors.emergencyContactName.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Relationship *</label>
                <input
                  {...register('emergencyRelationship')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Spouse, Friend"
                />
                {errors.emergencyRelationship && <p className="text-red-500 text-xs mt-1">{errors.emergencyRelationship.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
                <input
                  {...register('emergencyPhoneNumber')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Contact number"
                />
                {errors.emergencyPhoneNumber && <p className="text-red-500 text-xs mt-1">{errors.emergencyPhoneNumber.message}</p>}
              </div>
            </div>
          </div>

          {/* File Upload */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-xl font-semibold text-gray-700 mb-4">Supporting Documents</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Aadhaar Front</label>
                <input type="file" accept=".jpg,.jpeg,.png,.pdf" onChange={handleDocChange(setAadhaarFront)} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                {aadhaarFront && <p className="text-xs text-green-600 mt-1">{aadhaarFront.name}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Aadhaar Back</label>
                <input type="file" accept=".jpg,.jpeg,.png,.pdf" onChange={handleDocChange(setAadhaarBack)} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                {aadhaarBack && <p className="text-xs text-green-600 mt-1">{aadhaarBack.name}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">PAN Front</label>
                <input type="file" accept=".jpg,.jpeg,.png,.pdf" onChange={handleDocChange(setPanFront)} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                {panFront && <p className="text-xs text-green-600 mt-1">{panFront.name}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">PAN Back</label>
                <input type="file" accept=".jpg,.jpeg,.png,.pdf" onChange={handleDocChange(setPanBack)} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                {panBack && <p className="text-xs text-green-600 mt-1">{panBack.name}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Voter ID Front</label>
                <input type="file" accept=".jpg,.jpeg,.png,.pdf" onChange={handleDocChange(setVoterFront)} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                {voterFront && <p className="text-xs text-green-600 mt-1">{voterFront.name}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Voter ID Back</label>
                <input type="file" accept=".jpg,.jpeg,.png,.pdf" onChange={handleDocChange(setVoterBack)} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                {voterBack && <p className="text-xs text-green-600 mt-1">{voterBack.name}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Passbook Front Page</label>
                <input type="file" accept=".jpg,.jpeg,.png,.pdf" onChange={handleDocChange(setPassbookFront)} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                {passbookFront && <p className="text-xs text-green-600 mt-1">{passbookFront.name}</p>}
              </div>
              <div className="md:col-span-2 lg:col-span-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">Cancelled Cheque (optional)</label>
                <input type="file" accept=".jpg,.jpeg,.png,.pdf" onChange={handleFileChange} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                {chequeFile && <p className="text-xs text-green-600 mt-1">{chequeFile.name}</p>}
              </div>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={() => {
                reset();
                setChequeFile(null);
                setAadhaarFront(null);
                setAadhaarBack(null);
                setPanFront(null);
                setPanBack(null);
                setVoterFront(null);
                setVoterBack(null);
                setPassbookFront(null);
              }}
              className="px-6 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400"
              disabled={isSubmitting}
            >
              Reset
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : 'Submit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EmployeeRegistrationForm;