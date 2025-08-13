// src/app/api/employees/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { employeeSchema, EmployeeInput } from '@/lib/validations/employee';

// Comprehensive validation schema for employee data
// const employeeSchema = z.object({
//   // Personal Information
//   fullName: z.string().min(1, 'Full name is required'),
//   dateOfBirth: z.string().min(1, 'Date of birth is required'),
//   gender: z.enum(['Male', 'Female', 'Other']),
//   maritalStatus: z.enum(['Single', 'Married', 'Divorced', 'Widowed']),
//   nationality: z.string().min(1, 'Nationality is required'),
//   bloodGroup: z.string().optional(),
  
//   // Contact Information
//   permanentAddress: z.string().min(1, 'Permanent address is required'),
//   mobileNumber: z.string().min(10, 'Valid mobile number is required'),
//   alternateContactNumber: z.string().optional(),
  
//   // Government IDs
//   aadhaarNumber: z.string().regex(/^\d{12}$/, 'Aadhaar number must be 12 digits'),
//   panCardNumber: z.string().regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, 'Invalid PAN format'),
//   voterIdOrLicense: z.string().optional(),
//   uanNumber: z.string().optional(),
//   esicNumber: z.string().optional(),
  
//   // Employment Details
//   employeeId: z.string().min(1, 'Employee ID is required'),
//   dateOfJoining: z.string().min(1, 'Date of joining is required'),
//   employmentType: z.enum(['Full-time', 'Part-time', 'Contract', 'Intern']),
//   department: z.string().min(1, 'Department is required'),
//   designation: z.string().min(1, 'Designation is required'),
//   workLocation: z.string().min(1, 'Work location is required'),
//   reportingManager: z.string().optional(),
  
//   // Salary & Benefits
//   baseSalary: z.number().min(0, 'Base salary must be positive'),
//   skillCategory: z.string().optional(),
//   wageRate: z.number().optional(),
//   pfApplicability: z.boolean(),
//   esicApplicability: z.boolean(),
//   professionalTaxApplicability: z.boolean(),
//   salaryAdvanceOrLoan: z.number().optional(),
//   experienceDuration: z.number().min(0),
  
//   // Bank Details
//   bankAccountNumber: z.string().min(1, 'Bank account number is required'),
//   bankName: z.string().min(1, 'Bank name is required'),
//   ifscCode: z.string().regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, 'Invalid IFSC code format'),
  
//   // Education
//   highestQualification: z.string().min(1, 'Highest qualification is required'),
//   yearOfPassing: z.number().min(1900).max(new Date().getFullYear()),
//   additionalCertifications: z.string().optional(),
  
//   // Emergency Contact
//   emergencyContactName: z.string().min(1, 'Emergency contact name is required'),
//   emergencyRelationship: z.string().min(1, 'Relationship is required'),
//   emergencyPhoneNumber: z.string().min(10, 'Valid emergency phone number is required'),
// });

// Helper function to save uploaded files
async function saveFile(file: File, employeeId: string): Promise<string> {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  
  // Create uploads directory if it doesn't exist
  const uploadsDir = join(process.cwd(), 'public', 'uploads', 'employees', employeeId);
  await mkdir(uploadsDir, { recursive: true });
  
  // Generate unique filename
  const extension = file.name.split('.').pop();
  const filename = `cheque_${Date.now()}.${extension}`;
  const filepath = join(uploadsDir, filename);
  
  // Save file
  await writeFile(filepath, buffer);
  
  // Return the public URL path
  return `/uploads/employees/${employeeId}/${filename}`;
}

// Helper function to check if employee ID already exists
async function isEmployeeIdUnique(employeeId: string): Promise<boolean> {
  // Replace with actual database query
  // For now, we'll simulate checking against existing employees
  const existingEmployees = [
    { employeeId: 'EMP001' },
    { employeeId: 'EMP002' }
  ];
  
  return !existingEmployees.some(emp => emp.employeeId === employeeId);
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const department = searchParams.get('department');
    const status = searchParams.get('status');
    const searchTerm = searchParams.get('search');
    
    // Replace with actual database query
    const mockEmployees = [
      {
        id: '1',
        employeeId: 'EMP001',
        fullName: 'John Doe',
        department: 'IT',
        designation: 'Software Engineer',
        mobileNumber: '9876543210',
        status: 'active',
        dateOfJoining: '2023-01-15',
        email: 'john.doe@company.com'
      },
      {
        id: '2',
        employeeId: 'EMP002',
        fullName: 'Jane Smith',
        department: 'HR',
        designation: 'HR Manager',
        mobileNumber: '9876543211',
        status: 'active',
        dateOfJoining: '2022-06-10',
        email: 'jane.smith@company.com'
      }
    ];
    
    // Apply filters (replace with actual database filtering)
    let filteredEmployees = mockEmployees;
    
    if (department) {
      filteredEmployees = filteredEmployees.filter(emp => emp.department === department);
    }
    
    if (status) {
      filteredEmployees = filteredEmployees.filter(emp => emp.status === status);
    }
    
    if (searchTerm) {
      filteredEmployees = filteredEmployees.filter(emp => 
        emp.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.employeeId.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedEmployees = filteredEmployees.slice(startIndex, endIndex);
    
    return NextResponse.json({
      success: true,
      data: paginatedEmployees,
      pagination: {
        total: filteredEmployees.length,
        page,
        limit,
        totalPages: Math.ceil(filteredEmployees.length / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching employees:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch employees' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    
    // Extract employee data from form data
    const employeeData: any = {};
    const chequeFile = formData.get('cheque') as File | null;
    
    // Parse form data
    for (const [key, value] of formData.entries()) {
      if (key !== 'cheque') {
        // Convert string values to appropriate types
        if (key === 'baseSalary' || key === 'wageRate' || key === 'salaryAdvanceOrLoan' || 
            key === 'experienceDuration' || key === 'yearOfPassing') {
          employeeData[key] = value ? parseFloat(value as string) : 0;
        } else if (key === 'pfApplicability' || key === 'esicApplicability' || 
                   key === 'professionalTaxApplicability') {
          employeeData[key] = value === 'true';
        } else {
          employeeData[key] = value || undefined;
        }
      }
    }
    
    // Validate employee data
    const validationResult = employeeSchema.safeParse(employeeData);
    
    if (!validationResult.success) {
      return NextResponse.json({
        success: false,
        error: 'Validation failed',
        details: validationResult.error.issues
      }, { status: 400 });
    }
    
    const validatedData: EmployeeInput = validationResult.data;
    
    // Check if employee ID is unique
    const isUnique = await isEmployeeIdUnique(validatedData.employeeId);
    if (!isUnique) {
      return NextResponse.json({
        success: false,
        error: 'Employee ID already exists'
      }, { status: 400 });
    }
    
    // Generate unique ID for the employee
    const employeeId = uuidv4();
    
    // Handle file upload if present
    let chequeFileUrl = null;
    if (chequeFile && chequeFile.size > 0) {
      // Validate file size (max 5MB)
      if (chequeFile.size > 5 * 1024 * 1024) {
        return NextResponse.json({
          success: false,
          error: 'File size exceeds 5MB limit'
        }, { status: 400 });
      }
      
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
      if (!allowedTypes.includes(chequeFile.type)) {
        return NextResponse.json({
          success: false,
          error: 'Invalid file type. Only JPG, PNG, and PDF files are allowed'
        }, { status: 400 });
      }
      
      try {
        chequeFileUrl = await saveFile(chequeFile, employeeId);
      } catch (fileError) {
        console.error('Error saving file:', fileError);
        return NextResponse.json({
          success: false,
          error: 'Failed to save uploaded file'
        }, { status: 500 });
      }
    }
    
    // Create employee record
    const newEmployee = {
      id: employeeId,
      ...validatedData,
      chequeFileName: chequeFile?.name || null,
      chequeFileUrl,
      status: 'active' as const,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // Replace with actual database insert
    console.log('Creating employee:', newEmployee);
    
    // In a real application, you would save to database here
    // await database.employees.create(newEmployee);
    
    return NextResponse.json({
      success: true,
      message: 'Employee registered successfully',
      data: newEmployee
    }, { status: 201 });
    
  } catch (error) {
    console.error('Error creating employee:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to create employee'
    }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const employeeId = searchParams.get('id');
    
    if (!employeeId) {
      return NextResponse.json({
        success: false,
        error: 'Employee ID is required'
      }, { status: 400 });
    }
    
    const formData = await request.formData();
    const employeeData: any = {};
    
    // Parse form data similar to POST
    for (const [key, value] of formData.entries()) {
      if (key !== 'cheque') {
        if (key === 'baseSalary' || key === 'wageRate' || key === 'salaryAdvanceOrLoan' || 
            key === 'experienceDuration' || key === 'yearOfPassing') {
          employeeData[key] = value ? parseFloat(value as string) : 0;
        } else if (key === 'pfApplicability' || key === 'esicApplicability' || 
                   key === 'professionalTaxApplicability') {
          employeeData[key] = value === 'true';
        } else {
          employeeData[key] = value || undefined;
        }
      }
    }
    
    // Validate updated data
    const validationResult = employeeSchema.safeParse(employeeData);
    
    if (!validationResult.success) {
      return NextResponse.json({
        success: false,
        error: 'Validation failed',
        details: validationResult.error.issues
      }, { status: 400 });
    }
    
    // Replace with actual database update
    console.log('Updating employee:', employeeId, employeeData);
    
    const updatedEmployee = {
      id: employeeId,
      ...validationResult.data,
      updatedAt: new Date().toISOString()
    };
    
    return NextResponse.json({
      success: true,
      message: 'Employee updated successfully',
      data: updatedEmployee
    });
    
  } catch (error) {
    console.error('Error updating employee:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to update employee'
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const employeeId = searchParams.get('id');
    
    if (!employeeId) {
      return NextResponse.json({
        success: false,
        error: 'Employee ID is required'
      }, { status: 400 });
    }
    
    // Replace with actual database delete
    console.log('Deleting employee:', employeeId);
    
    return NextResponse.json({
      success: true,
      message: 'Employee deleted successfully'
    });
    
  } catch (error) {
    console.error('Error deleting employee:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to delete employee'
    }, { status: 500 });
  }
}