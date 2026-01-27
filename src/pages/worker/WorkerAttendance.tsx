import React, { useState, useEffect } from 'react';
import { PageHeader } from '@/components/ui/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Clock, CheckCircle2, XCircle, Navigation, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AttendanceRecord {
  id: string;
  date: string;
  checkIn: string;
  checkOut: string | null;
  location: string;
  hours: number | null;
}

const demoHistory: AttendanceRecord[] = [
  { id: '1', date: '2024-03-13', checkIn: '08:30 AM', checkOut: '05:15 PM', location: 'River Basin North', hours: 8.75 },
  { id: '2', date: '2024-03-12', checkIn: '08:15 AM', checkOut: '05:00 PM', location: 'Forest Trail A', hours: 8.75 },
  { id: '3', date: '2024-03-11', checkIn: '09:00 AM', checkOut: '04:30 PM', location: 'Wetland Zone B', hours: 7.5 },
  { id: '4', date: '2024-03-10', checkIn: '08:45 AM', checkOut: '05:30 PM', location: 'River Basin South', hours: 8.75 },
];

export default function WorkerAttendance() {
  const [isCheckedIn, setIsCheckedIn] = useState(true);
  const [checkInTime, setCheckInTime] = useState('08:30 AM');
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationName, setLocationName] = useState('River Basin North');
  const [isLoading, setIsLoading] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Request location on mount
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          setLocationError(null);
        },
        (error) => {
          setLocationError('Unable to get location. Please enable GPS.');
        }
      );
    }
  }, []);

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
    await new Promise((resolve) => setTimeout(resolve, 1000));

    if (isCheckedIn) {
      setIsCheckedIn(false);
      toast({
        title: 'Checked Out Successfully',
        description: `You have checked out at ${new Date().toLocaleTimeString()}.`,
      });
    } else {
      setIsCheckedIn(true);
      setCheckInTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      toast({
        title: 'Checked In Successfully',
        description: `You have checked in at ${locationName}.`,
      });
    }
    setIsLoading(false);
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
              className={`w-32 h-32 mx-auto rounded-full flex items-center justify-center transition-all duration-500 ${
                isCheckedIn
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
              <span className="text-sm">{locationName}</span>
            ) : (
              <span className="text-sm text-destructive">{locationError || 'Getting location...'}</span>
            )}
          </div>

          {/* Check In/Out Button */}
          <Button
            onClick={handleCheckInOut}
            disabled={isLoading || !currentLocation}
            size="lg"
            className={`w-full h-14 text-lg rounded-2xl font-semibold transition-all duration-300 ${
              isCheckedIn
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
            {demoHistory.map((record, index) => (
              <div
                key={record.id}
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
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="w-3 h-3" />
                    {record.location}
                  </div>
                </div>
                <div className="text-right space-y-1">
                  <p className="text-sm">
                    {record.checkIn} - {record.checkOut || '--:--'}
                  </p>
                  <Badge className="status-completed">
                    {record.hours}h
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
