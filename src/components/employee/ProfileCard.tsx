'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { User, Mail, Phone, MapPin, Calendar, Building2, CreditCard, Loader2 } from 'lucide-react';

interface EmployeeProfile {
  user_info: {
    id: string;
    name: string;
    email: string;
    role: string;
    department: string;
  };
  employee_info: {
    employee_id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone_number: string;
    address: string;
    date_of_birth: string;
    hire_date: string;
    department_id: string;
    designation: string;
    employment_status: string;
    gender: string;
    marital_status: string;
    blood_group: string;
    pan_card_number: string;
    adhar_number: string;
    uan: string;
    esic_number: string;
  };
  salary_info: {
    salary_code: string;
    site_name: string;
    rank: string;
    state: string;
    base_wage: number;
    skill_level: string;
  } | null;
}

export default function ProfileCard() {
  const [profile, setProfile] = useState<EmployeeProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/employee/profile`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const result = await response.json();
      if (result.success) {
        setProfile(result.data);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Not specified';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-800';
      case 'Inactive': return 'bg-red-100 text-red-800';
      case 'On Leave': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin mr-2" />
          <span>Loading profile...</span>
        </CardContent>
      </Card>
    );
  }

  if (!profile) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <p className="text-gray-500">Unable to load profile information</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Personal Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Personal Information
          </CardTitle>
          <CardDescription>Your personal details and contact information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-600">Full Name</label>
              <p className="text-sm">{profile.employee_info.first_name} {profile.employee_info.last_name}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Employee ID</label>
              <p className="text-sm font-mono">{profile.employee_info.employee_id}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Email</label>
              <p className="text-sm flex items-center gap-1">
                <Mail className="w-3 h-3" />
                {profile.employee_info.email || 'Not specified'}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Phone</label>
              <p className="text-sm flex items-center gap-1">
                <Phone className="w-3 h-3" />
                {profile.employee_info.phone_number || 'Not specified'}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Date of Birth</label>
              <p className="text-sm flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {formatDate(profile.employee_info.date_of_birth)}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Gender</label>
              <p className="text-sm">{profile.employee_info.gender || 'Not specified'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Marital Status</label>
              <p className="text-sm">{profile.employee_info.marital_status || 'Not specified'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Blood Group</label>
              <p className="text-sm">{profile.employee_info.blood_group || 'Not specified'}</p>
            </div>
          </div>
          
          {profile.employee_info.address && (
            <div>
              <label className="text-sm font-medium text-gray-600">Address</label>
              <p className="text-sm flex items-start gap-1">
                <MapPin className="w-3 h-3 mt-0.5" />
                {profile.employee_info.address}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Employment Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            Employment Information
          </CardTitle>
          <CardDescription>Your job details and employment status</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-600">Designation</label>
              <p className="text-sm">{profile.employee_info.designation || 'Not specified'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Department</label>
              <p className="text-sm">{profile.employee_info.department_id || 'Not specified'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Hire Date</label>
              <p className="text-sm">{formatDate(profile.employee_info.hire_date)}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Employment Status</label>
              <Badge className={getStatusColor(profile.employee_info.employment_status)}>
                {profile.employee_info.employment_status}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Salary Information */}
      {profile.salary_info && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              Salary Information
            </CardTitle>
            <CardDescription>Your salary code and wage details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Salary Code</label>
                <p className="text-sm font-mono">{profile.salary_info.salary_code}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Base Wage</label>
                <p className="text-sm font-semibold">₹{profile.salary_info.base_wage}/day</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Site Name</label>
                <p className="text-sm">{profile.salary_info.site_name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Rank</label>
                <p className="text-sm">{profile.salary_info.rank}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">State</label>
                <p className="text-sm">{profile.salary_info.state}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Skill Level</label>
                <p className="text-sm">{profile.salary_info.skill_level}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Government IDs */}
      <Card>
        <CardHeader>
          <CardTitle>Government IDs & Numbers</CardTitle>
          <CardDescription>Your official identification numbers</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-600">PAN Card</label>
              <p className="text-sm font-mono">{profile.employee_info.pan_card_number || 'Not specified'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Aadhar Number</label>
              <p className="text-sm font-mono">{profile.employee_info.adhar_number || 'Not specified'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">UAN</label>
              <p className="text-sm font-mono">{profile.employee_info.uan || 'Not specified'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">ESIC Number</label>
              <p className="text-sm font-mono">{profile.employee_info.esic_number || 'Not specified'}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
