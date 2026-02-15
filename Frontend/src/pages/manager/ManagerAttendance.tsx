import React, { useState, useEffect } from 'react';
import { PageHeader } from '@/components/ui/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { attendanceApi } from '@/services/api';
import { getAddressFromCoordinates } from '@/services/geocoding';
import { Calendar, Clock, MapPin, User, Search, Filter } from 'lucide-react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

export default function ManagerAttendance() {
    const [attendanceData, setAttendanceData] = useState<any[]>([]);
    const [addresses, setAddresses] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(true);
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [searchTerm, setSearchTerm] = useState('');
    const { toast } = useToast();

    const fetchAttendance = async () => {
        try {
            setLoading(true);
            const res = await attendanceApi.getTeamAttendance(date);
            setAttendanceData(res.data);
        } catch (error) {
            console.error('Error fetching attendance:', error);
            toast({
                title: 'Error',
                description: 'Failed to load attendance data',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAttendance();
    }, [date]);

    // Fetch addresses for records with coordinates
    useEffect(() => {
        const fetchAddresses = async () => {
            const recordsWithCoords = attendanceData.filter(
                record => record.check_in_latitude && record.check_in_longitude && !addresses[record.attendance_id]
            );

            if (recordsWithCoords.length === 0) return;

            // Process one by one to respect rate limits
            for (const record of recordsWithCoords) {
                // Check if we already have it (double check inside loop)
                if (addresses[record.attendance_id]) continue;

                const address = await getAddressFromCoordinates(
                    Number(record.check_in_latitude),
                    Number(record.check_in_longitude)
                );

                setAddresses(prev => ({ ...prev, [record.attendance_id]: address }));

                // 1.2 second delay to be safe with Nominatim (1 request/sec policy)
                await new Promise(resolve => setTimeout(resolve, 1200));
            }
        };

        fetchAddresses();
    }, [attendanceData]);

    const filteredData = attendanceData.filter(record =>
        record.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getStatusBadge = (status: string | null) => {
        if (!status) return <Badge variant="outline" className="text-muted-foreground border-dashed">Absent / Not In</Badge>;

        const styles = {
            'PRESENT': 'status-active',
            'LATE': 'bg-yellow-100 text-yellow-700 border-yellow-200',
            'LEAVE': 'bg-purple/10 text-purple-600 border-purple/20',
            'ABSENT': 'status-destructive'
        };

        return (
            <Badge className={styles[status as keyof typeof styles] || 'status-pending'}>
                {status}
            </Badge>
        );
    };

    return (
        <div className="space-y-6">
            <PageHeader
                title="Team Attendance"
                description="Monitor daily attendance of your team"
            />

            <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
                {/* Search */}
                <div className="relative w-full md:max-w-xs">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        placeholder="Search worker..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9 rounded-xl"
                    />
                </div>

                {/* Date Filter */}
                <div className="flex items-center gap-2 w-full md:w-auto">
                    <div className="relative w-full md:w-auto">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="pl-9 rounded-xl w-full"
                        />
                    </div>
                    <Button variant="outline" className="rounded-xl" onClick={fetchAttendance}>
                        Refresh
                    </Button>
                </div>
            </div>

            <Card className="nature-card">
                <CardHeader className="pb-2">
                    <CardTitle className="text-lg font-display flex justify-between">
                        <span>Attendance List</span>
                        <span className="text-sm font-normal text-muted-foreground">
                            {new Date(date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                        </span>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="text-center py-12 text-muted-foreground">Loading attendance...</div>
                    ) : filteredData.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground">No workers found.</div>
                    ) : (
                        <div className="rounded-xl border border-border overflow-hidden">
                            <Table>
                                <TableHeader className="bg-muted/50">
                                    <TableRow>
                                        <TableHead>Worker</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Check In</TableHead>
                                        <TableHead>Check Out</TableHead>
                                        <TableHead>Location</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredData.map((record) => (
                                        <TableRow key={record.user_id} className="hover:bg-muted/5">
                                            <TableCell className="font-medium">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs relative">
                                                        <User className="w-4 h-4" />
                                                        {record.status === 'PRESENT' && (
                                                            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-background rounded-full"></span>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <div>{record.name}</div>
                                                        <div className="text-xs text-muted-foreground">{record.email}</div>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>{getStatusBadge(record.status)}</TableCell>
                                            <TableCell>
                                                {record.check_in_time ? (
                                                    <div className="flex items-center gap-1.5 text-sm">
                                                        <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                                                        {record.check_in_time}
                                                    </div>
                                                ) : <span className="text-muted-foreground">-</span>}
                                            </TableCell>
                                            <TableCell>
                                                {record.check_out_time ? (
                                                    <div className="flex items-center gap-1.5 text-sm">
                                                        <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                                                        {record.check_out_time}
                                                    </div>
                                                ) : <span className="text-muted-foreground">-</span>}
                                            </TableCell>
                                            <TableCell className="max-w-[200px]">
                                                {record.check_in_latitude ? (
                                                    <div className="flex flex-col gap-1">
                                                        <div className="flex items-center gap-1.5 text-sm truncate" title={`${record.check_in_latitude}, ${record.check_in_longitude}`}>
                                                            <MapPin className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                                                            <span className="truncate">{Number(record.check_in_latitude).toFixed(4)}, {Number(record.check_in_longitude).toFixed(4)}</span>
                                                        </div>
                                                        {addresses[record.attendance_id] && (
                                                            <div className="text-xs text-muted-foreground pl-5 break-words line-clamp-2" title={addresses[record.attendance_id]}>
                                                                {addresses[record.attendance_id]}
                                                            </div>
                                                        )}
                                                    </div>
                                                ) : <span className="text-muted-foreground">-</span>}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
