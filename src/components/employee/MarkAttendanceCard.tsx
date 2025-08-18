'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { Clock, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

interface MarkAttendanceCardProps {
  onAttendanceMarked?: () => void;
}

export default function MarkAttendanceCard({ onAttendanceMarked }: MarkAttendanceCardProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [todayAttendance, setTodayAttendance] = useState<any>(null);
  const [formData, setFormData] = useState({
    attendance_status: 'Present',
    check_in_time: '',
    check_out_time: '',
    overtime_hours: '0',
    remarks: ''
  });

  useEffect(() => {
    checkTodayAttendance();
    setCurrentTime();
  }, []);

  const checkTodayAttendance = async () => {
    try {
      const token = localStorage.getItem('token');
      const today = new Date().toISOString().split('T')[0];
      
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/employee/attendance/history?page=1&per_page=1`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const result = await response.json();
      if (result.success && result.data.records.length > 0) {
        const latestRecord = result.data.records[0];
        if (latestRecord.attendance_date === today) {
          setTodayAttendance(latestRecord);
        }
      }
    } catch (error) {
      console.error('Error checking today attendance:', error);
    }
  };

  const setCurrentTime = () => {
    const now = new Date();
    const timeString = now.toTimeString().slice(0, 5); // HH:MM format
    
    if (!formData.check_in_time) {
      setFormData(prev => ({ ...prev, check_in_time: timeString }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const token = localStorage.getItem('token');
      const attendanceData = {
        attendance_status: formData.attendance_status,
        check_in_time: formData.check_in_time,
        check_out_time: formData.check_out_time || undefined,
        overtime_hours: parseFloat(formData.overtime_hours) || 0,
        remarks: formData.remarks
      };

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/employee/attendance/mark`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(attendanceData)
        }
      );

      const result = await response.json();

      if (result.success) {
        toast({
          title: 'Success',
          description: 'Attendance marked successfully',
        });
        
        // Reset form and refresh data
        setFormData({
          attendance_status: 'Present',
          check_in_time: '',
          check_out_time: '',
          overtime_hours: '0',
          remarks: ''
        });
        
        checkTodayAttendance();
        onAttendanceMarked?.();
      } else {
        toast({
          title: 'Error',
          description: result.message || 'Failed to mark attendance',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error marking attendance:', error);
      toast({
        title: 'Error',
        description: 'Failed to mark attendance',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Present': return 'bg-green-100 text-green-800';
      case 'Absent': return 'bg-red-100 text-red-800';
      case 'Late': return 'bg-yellow-100 text-yellow-800';
      case 'Half Day': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (todayAttendance) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            Today's Attendance
          </CardTitle>
          <CardDescription>
            Your attendance for today has been marked
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Status:</span>
            <Badge className={getStatusColor(todayAttendance.attendance_status)}>
              {todayAttendance.attendance_status}
            </Badge>
          </div>
          
          {todayAttendance.check_in_time && (
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Check In:</span>
              <span className="text-sm">
                {new Date(todayAttendance.check_in_time).toLocaleTimeString('en-US', {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
            </div>
          )}
          
          {todayAttendance.check_out_time && (
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Check Out:</span>
              <span className="text-sm">
                {new Date(todayAttendance.check_out_time).toLocaleTimeString('en-US', {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
            </div>
          )}
          
          {todayAttendance.total_hours_worked && (
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Hours Worked:</span>
              <span className="text-sm">{todayAttendance.total_hours_worked} hours</span>
            </div>
          )}
          
          {todayAttendance.remarks && (
            <div>
              <span className="text-sm font-medium">Remarks:</span>
              <p className="text-sm text-gray-600 mt-1">{todayAttendance.remarks}</p>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Mark Attendance
        </CardTitle>
        <CardDescription>
          Mark your attendance for today
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.attendance_status}
                onValueChange={(value) => setFormData(prev => ({ ...prev, attendance_status: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Present">Present</SelectItem>
                  <SelectItem value="Late">Late</SelectItem>
                  <SelectItem value="Half Day">Half Day</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="check_in">Check In Time</Label>
              <Input
                id="check_in"
                type="time"
                value={formData.check_in_time}
                onChange={(e) => setFormData(prev => ({ ...prev, check_in_time: e.target.value }))}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="check_out">Check Out Time</Label>
              <Input
                id="check_out"
                type="time"
                value={formData.check_out_time}
                onChange={(e) => setFormData(prev => ({ ...prev, check_out_time: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="overtime">Overtime Hours</Label>
              <Input
                id="overtime"
                type="number"
                step="0.5"
                min="0"
                value={formData.overtime_hours}
                onChange={(e) => setFormData(prev => ({ ...prev, overtime_hours: e.target.value }))}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="remarks">Remarks (Optional)</Label>
            <Textarea
              id="remarks"
              placeholder="Any additional notes..."
              value={formData.remarks}
              onChange={(e) => setFormData(prev => ({ ...prev, remarks: e.target.value }))}
              rows={2}
            />
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Marking Attendance...
              </>
            ) : (
              <>
                <Clock className="w-4 h-4 mr-2" />
                Mark Attendance
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
