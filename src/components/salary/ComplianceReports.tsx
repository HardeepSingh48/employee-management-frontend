'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Calendar, Users, FileSpreadsheet, Shield, AlertCircle } from 'lucide-react';
import FormA from '@/components/salary/compliance/FormA';
import FormB from '@/components/salary/compliance/FormB';
import FormC from '@/components/salary/compliance/FormC';
import FormD from '@/components/salary/compliance/FormD';












// Main Compliance Reports Component
export default function ComplianceReports() {
  const [activeForm, setActiveForm] = useState('formB');

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveForm('formA')}>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-600" />
                Form A
              </span>
              <Users className="w-4 h-4 text-gray-400" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-gray-600">Employee Registration</div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow border-2 border-green-200" onClick={() => setActiveForm('formB')}>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-green-600" />
                Form B
              </span>
              <AlertCircle className="w-4 h-4 text-green-600" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-gray-600">Wages Register</div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveForm('formC')}>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-purple-600" />
                Form C
              </span>
              <Calendar className="w-4 h-4 text-gray-400" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-gray-600">Attendance Records</div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveForm('formD')}>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-orange-600" />
                Form D
              </span>
              <Shield className="w-4 h-4 text-gray-400" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-gray-600">Leave & Holidays</div>
          </CardContent>
        </Card>
      </div>

      {/* Form Tabs */}
      <Tabs value={activeForm} onValueChange={setActiveForm} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="formA" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Form A
          </TabsTrigger>
          <TabsTrigger value="formB" className="flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4" />
            Form B
          </TabsTrigger>
          <TabsTrigger value="formC" className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Form C
          </TabsTrigger>
          <TabsTrigger value="formD" className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Form D
          </TabsTrigger>
        </TabsList>

        <TabsContent value="formA">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                Form A - Employee Registration
              </CardTitle>
              <CardDescription>
                Employee basic information and registration details
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FormA />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="formB">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-green-600" />
                Form B - Central Register of Wages
              </CardTitle>
              <CardDescription>
                Monthly wages register with earnings and deductions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FormB />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="formC">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-purple-600" />
                Form C - Attendance & Overtime Records
              </CardTitle>
              <CardDescription>
                Daily attendance and overtime calculation records
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FormC />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="formD">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-orange-600" />
                Form D - Leave & Holiday Records
              </CardTitle>
              <CardDescription>
                Employee leave applications and holiday calendar
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FormD />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}