import React, { useState, useEffect } from 'react';
import { PageHeader } from '@/components/ui/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Clock, CheckCircle2, XCircle, Navigation, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { attendanceApi } from '@/services/api';
import { getAddressFromCoordinates } from '@/services/geocoding';
import { useAuth } from '@/context/AuthContext';
import axios from 'axios';

interface AttendanceRecord {
  attendance_id: string;
  date: string;
  check_in_time: string;
  check_out_time: string | null;
  status: string;
  // Add other fields as needed
}

export default function WorkerAttendance() {
  const { user } = useAuth();
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [attendanceId, setAttendanceId] = useState<string | null>(null);
  const [checkInTime, setCheckInTime] = useState('--:--');
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationName, setLocationName] = useState('Fetching location...');
  const [isLoading, setIsLoading] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [history, setHistory] = useState<AttendanceRecord[]>([]);
  const [historyAddresses, setHistoryAddresses] = useState<Record<string, string>>({});
  const { toast } = useToast();

  // Fetch initial state
  useEffect(() => {
    const fetchAttendanceStatus = async () => {
      try {
        // Get today's attendance to see if checked in
        try {
          const todayRes = await attendanceApi.getToday();
          const todayRecord = todayRes.data;

          if (todayRecord) {
            setAttendanceId(todayRecord.attendance_id);
            if (!todayRecord.check_out_time) {
              setIsCheckedIn(true);
              setCheckInTime(new Date(`1970-01-01T${todayRecord.check_in_time}`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
            } else {
              setIsCheckedIn(false); // Already checked out for today
            }
          } else {
            setIsCheckedIn(false);
          }
        } catch (error) {
          console.error("Error fetching today's attendance", error);
        }

        // Get history
        if (user?.user_id) {
          const historyRes = await attendanceApi.getHistory(user.user_id);
          if (Array.isArray(historyRes.data)) {
            setHistory(historyRes.data);
          }
        }

      } catch (error) {
        console.error('Error initializing attendance:', error);
      }
    };

    fetchAttendanceStatus();
  }, [user]);

  useEffect(() => {
    // Request location on mount
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          // Fetch address
          getAddressFromCoordinates(position.coords.latitude, position.coords.longitude)
            .then(address => setLocationName(address))
            .catch(() => setLocationName(`${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)}`));

          setLocationError(null);
        },
        (error) => {
          setLocationError('Unable to get location. Please enable GPS.');
          setLocationName('Location unavailable');
        }
      );
    } else {
      setLocationError('Geolocation is not supported by this browser.');
    }
  }, []);

  // Fetch addresses for history
  useEffect(() => {
    const fetchHistoryAddresses = async () => {
      const recordsWithCoords = history.filter(
        // @ts-ignore - Backend might return these fields even if not in interface
        record => (record.check_in_latitude || record.check_in_longitude) && !historyAddresses[record.attendance_id]
      );

      if (recordsWithCoords.length === 0) return;

      for (const record of recordsWithCoords) {
        // @ts-ignore
        const lat = record.check_in_latitude;
        // @ts-ignore
        const lng = record.check_in_longitude;

        if (!lat || !lng || historyAddresses[record.attendance_id]) continue;

        const address = await getAddressFromCoordinates(Number(lat), Number(lng));
        setHistoryAddresses(prev => ({ ...prev, [record.attendance_id]: address }));

        await new Promise(resolve => setTimeout(resolve, 1200));
      }
    };

    if (history.length > 0) {
      fetchHistoryAddresses();
    }
  }, [history]);

  const handleCheckInOut = async () => {
    if (!currentLocation) {
      toast({
        title: 'Location Required',
        description: 'Please enable GPS to check in/out.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      if (isCheckedIn) {
        // Check Out
        if (!attendanceId) {
          throw new Error("Attendance ID missing for check-out");
        }
        await attendanceApi.checkOut(attendanceId, currentLocation);

        setIsCheckedIn(false);
        setAttendanceId(null);
        toast({
          title: 'Checked Out Successfully',
          description: `You have checked out at ${new Date().toLocaleTimeString()}.`,
        });
      } else {
        // Check In
        const response = await attendanceApi.checkIn(currentLocation);
        const newRecord = response.data.attendance;

        setIsCheckedIn(true);
        setAttendanceId(newRecord.attendance_id);
        setCheckInTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
        toast({
          title: 'Checked In Successfully',
          description: `You have checked in at ${locationName}.`,
        });
      }

      // Refresh history
      if (user?.user_id) {
        const historyRes = await attendanceApi.getHistory(user.user_id);
        setHistory(historyRes.data);
      }

    } catch (error: any) {
      console.error('Check-in/out error:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to update attendance status',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Attendance"
        description="Check in and out with your location"
      />

      {/* Check In/Out Card */}
      <Card className="nature-card max-w-md mx-auto">
        <CardContent className="p-6 text-center space-y-6">
          {/* Status Indicator */}
          <div className="relative">
            <div
              className={`w-32 h-32 mx-auto rounded-full flex items-center justify-center transition-all duration-500 ${isCheckedIn
                  ? 'bg-secondary/20 ring-4 ring-secondary/30'
                  : 'bg-muted ring-4 ring-muted'
                } ${isLoading ? 'pulse-ring' : ''}`}
            >
              {isCheckedIn ? (
                <CheckCircle2 className="w-16 h-16 text-secondary" />
              ) : (
                <XCircle className="w-16 h-16 text-muted-foreground" />
              )}
            </div>
          </div>

          {/* Status Text */}
          <div>
            <h3 className="text-xl font-bold font-display">
              {isCheckedIn ? 'Currently Working' : 'Not Checked In'}
            </h3>
            {isCheckedIn && (
              <p className="text-muted-foreground mt-1">
                Since {checkInTime}
              </p>
            )}
          </div>

          {/* Location */}
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <Navigation className="w-4 h-4" />
            {currentLocation ? (
              <span className="text-sm text-center px-4">{locationName}</span>
            ) : (
              <span className="text-sm text-destructive">{locationError || 'Getting location...'}</span>
            )}
          </div>

          {/* Check In/Out Button */}
          <Button
            onClick={handleCheckInOut}
            disabled={isLoading || !currentLocation}
            size="lg"
            className={`w-full h-14 text-lg rounded-2xl font-semibold transition-all duration-300 ${isCheckedIn
                ? 'gradient-earth text-primary-foreground'
                : 'gradient-forest text-primary-foreground'
              }`}
          >
            {isLoading ? (
              <div className="w-6 h-6 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
            ) : (
              <>
                <MapPin className="w-5 h-5 mr-2" />
                {isCheckedIn ? 'Check Out' : 'Check In'}
              </>
            )}
          </Button>

          {!currentLocation && !locationError && (
            <p className="text-xs text-muted-foreground">
              Waiting for location access...
            </p>
          )}
        </CardContent>
      </Card>

      {/* Location Info */}
      {locationError && (
        <Card className="nature-card border-destructive/30 bg-destructive/5 max-w-md mx-auto">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-destructive mt-0.5" />
              <div>
                <p className="font-medium text-foreground">Location Access Required</p>
                <p className="text-sm text-muted-foreground">
                  Please enable location services in your browser to check in/out.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Attendance History */}
      <Card className="nature-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg font-display">
            <Clock className="w-5 h-5 text-primary" />
            Recent Attendance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {history.length > 0 ? (
              history.map((record, index) => (
                <div
                  key={record.attendance_id || index}
                  className="flex items-center justify-between p-4 rounded-xl bg-muted/30 animate-fade-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="space-y-1">
                    <p className="font-medium">
                      {new Date(record.date).toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </p>
                    <div className="flex flex-col gap-1 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3 h-3 shrink-0" />
                        {/* @ts-ignore */}
                        {record.check_in_latitude ? (
                          <span className="truncate max-w-[200px]" title={historyAddresses[record.attendance_id] || "Loading location..."}>
                            {historyAddresses[record.attendance_id] || "Loading location..."}
                          </span>
                        ) : (
                          <span>{record.status}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right space-y-1">
                    <p className="text-sm">
                      {record.check_in_time ? new Date(`1970-01-01T${record.check_in_time}`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--'} -
                      {record.check_out_time ? new Date(`1970-01-01T${record.check_out_time}`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Working'}
                    </p>
                    <Badge variant="outline" className={record.check_out_time ? "status-completed" : "status-active"}>
                      {record.check_out_time ? 'Completed' : 'Active'}
                    </Badge>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                No attendance history found.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
