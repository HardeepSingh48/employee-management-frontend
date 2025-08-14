'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { Loader2, UserCheck, Clock } from 'lucide-react';
import { attendanceService } from '@/lib/attendance-service';
import { employeeService } from '@/lib/employee-service';
import type { Employee } from '@/types/employee';

const attendanceSchema = z.object({
  employee_id: z.string().min(1, 'Please select an employee'),
  attendance_date: z.string().min(1, 'Date is required'),
  attendance_status: z.enum(['Present', 'Absent', 'Late', 'Half Day'], {
    required_error: 'Please select attendance status',
  }),
  check_in_time: z.string().optional(),
  check_out_time: z.string().optional(),
  overtime_hours: z.string().optional(),
  remarks: z.string().optional(),
});

type AttendanceFormValues = z.infer<typeof attendanceSchema>;

export default function MarkAttendance() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<AttendanceFormValues>({
    resolver: zodResolver(attendanceSchema),
    defaultValues: {
      attendance_date: attendanceService.getCurrentDate(),
      attendance_status: 'Present',
      overtime_hours: '0',
    },
  });

  // Load employees on component mount
  useEffect(() => {
    const loadEmployees = async () => {
      setIsLoading(true);
      try {
        const employeeData = await employeeService.getEmployees();
        setEmployees(employeeData);
      } catch (error) {
        console.error('Error loading employees:', error);
        toast({
          title: 'Error',
          description: 'Failed to load employees',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadEmployees();
  }, []);

  const onSubmit = async (data: AttendanceFormValues) => {
    setIsSubmitting(true);
    try {
      const attendanceData = {
        employee_id: data.employee_id,
        attendance_date: data.attendance_date,
        attendance_status: data.attendance_status,
        check_in_time: data.check_in_time ? `${data.attendance_date}T${data.check_in_time}:00` : undefined,
        check_out_time: data.check_out_time ? `${data.attendance_date}T${data.check_out_time}:00` : undefined,
        overtime_hours: data.overtime_hours ? parseFloat(data.overtime_hours) : 0,
        remarks: data.remarks,
        marked_by: 'admin',
      };

      const result = await attendanceService.markAttendance(attendanceData);
      
      toast({
        title: 'Success',
        description: 'Attendance marked successfully',
      });

      // Reset form but keep the date
      form.reset({
        attendance_date: data.attendance_date,
        attendance_status: 'Present',
        overtime_hours: '0',
      });

    } catch (error: any) {
      console.error('Error marking attendance:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to mark attendance',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedEmployee = employees.find(emp => emp.employee_id === form.watch('employee_id'));

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Employee Selection */}
            <FormField
              control={form.control}
              name="employee_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Employee</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select employee" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {isLoading ? (
                        <SelectItem value="loading" disabled>
                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                          Loading employees...
                        </SelectItem>
                      ) : (
                        employees.map((employee) => (
                          <SelectItem key={employee.employee_id} value={employee.employee_id}>
                            {employee.employee_id} - {employee.first_name} {employee.last_name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Date */}
            <FormField
              control={form.control}
              name="attendance_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Attendance Status */}
            <FormField
              control={form.control}
              name="attendance_status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Attendance Status</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Present">Present</SelectItem>
                      <SelectItem value="Absent">Absent</SelectItem>
                      <SelectItem value="Late">Late</SelectItem>
                      <SelectItem value="Half Day">Half Day</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Overtime Hours */}
            <FormField
              control={form.control}
              name="overtime_hours"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Overtime Hours</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.5" min="0" max="12" {...field} />
                  </FormControl>
                  <FormDescription>
                    Enter overtime hours (0-12)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Check-in Time */}
            <FormField
              control={form.control}
              name="check_in_time"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Check-in Time (Optional)</FormLabel>
                  <FormControl>
                    <Input type="time" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Check-out Time */}
            <FormField
              control={form.control}
              name="check_out_time"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Check-out Time (Optional)</FormLabel>
                  <FormControl>
                    <Input type="time" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Remarks */}
          <FormField
            control={form.control}
            name="remarks"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Remarks (Optional)</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Add any additional notes about attendance..."
                    className="resize-none"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Employee Info Card */}
          {selectedEmployee && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <UserCheck className="w-5 h-5" />
                  Employee Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="font-medium text-muted-foreground">Name</p>
                    <p>{selectedEmployee.first_name} {selectedEmployee.last_name}</p>
                  </div>
                  <div>
                    <p className="font-medium text-muted-foreground">Department</p>
                    <p>{selectedEmployee.department_id || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="font-medium text-muted-foreground">Designation</p>
                    <p>{selectedEmployee.designation || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="font-medium text-muted-foreground">Employee ID</p>
                    <p>{selectedEmployee.employee_id}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Submit Button */}
          <div className="flex justify-end">
            <Button type="submit" disabled={isSubmitting} className="min-w-[120px]">
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Marking...
                </>
              ) : (
                <>
                  <Clock className="w-4 h-4 mr-2" />
                  Mark Attendance
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
