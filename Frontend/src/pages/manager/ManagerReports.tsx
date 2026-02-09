import React, { useState, useEffect } from 'react';
import { PageHeader } from '@/components/ui/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { reportsApi } from '@/services/api';
import { Calendar, User, FileText, Image as ImageIcon } from 'lucide-react';
import { format } from 'date-fns';

export default function ManagerReports() {
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [reports, setReports] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    const fetchReports = async () => {
        try {
            setLoading(true);
            const response = await reportsApi.getTeamReports(selectedDate);
            setReports(response.data);
        } catch (error) {
            console.error('Error fetching reports:', error);
            // Don't show error on 404/empty, just empty list
            setReports([]);
             if (error.response && error.response.status !== 404) {
                 toast({
                    title: 'Error',
                    description: 'Failed to load reports',
                    variant: 'destructive',
                });
             }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReports();
    }, [selectedDate]);

    return (
        <div className="space-y-6">
            <PageHeader
                title="Daily Reports"
                description="View operational reports from your team"
            />

            <div className="bg-card p-4 rounded-lg shadow-sm border flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-muted-foreground" />
                    <span className="font-medium">Filter by Date:</span>
                </div>
                <Input 
                    type="date" 
                    value={selectedDate} 
                    onChange={(e) => setSelectedDate(e.target.value)} 
                    className="w-auto max-w-[200px]"
                />
            </div>

            {loading ? (
                <div className="text-center py-12 text-muted-foreground">Loading specific date reports...</div>
            ) : reports.length === 0 ? (
                <div className="text-center py-16 bg-muted/20 rounded-lg border border-dashed">
                    <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
                    <h3 className="text-lg font-medium">No reports found</h3>
                    <p className="text-muted-foreground">No reports submitted for {format(new Date(selectedDate), 'MMMM do, yyyy')}</p>
                </div>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
                    {reports.map((report) => (
                        <Card key={report.report_id} className="nature-card hover:shadow-md transition-all">
                            <CardHeader className="pb-3 bg-muted/10 border-b">
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                                            {report.worker_name.charAt(0)}
                                        </div>
                                        <div>
                                            <CardTitle className="text-lg">{report.worker_name}</CardTitle>
                                            <p className="text-sm text-muted-foreground">{report.worker_email}</p>
                                        </div>
                                    </div>
                                    <div className="bg-background/80 backdrop-blur px-2 py-1 rounded text-xs font-mono border">
                                        {format(new Date(report.created_at), 'h:mm a')}
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="pt-4 space-y-4">
                                <div>
                                    <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                                        <FileText className="w-4 h-4" /> Description
                                    </h4>
                                    <div className="bg-muted/30 p-3 rounded-md text-sm whitespace-pre-wrap leading-relaxed min-h-[80px]">
                                        {report.description}
                                    </div>
                                </div>

                                {report.images && report.images.length > 0 && (
                                    <div>
                                        <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                                            <ImageIcon className="w-4 h-4" /> Attached Images
                                        </h4>
                                        <div className="flex gap-2 overflow-x-auto pb-2">
                                            {report.images.map((img: string, index: number) => (
                                                <a 
                                                    key={index} 
                                                    href={`${import.meta.env.VITE_API_URL}${img}`} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer"
                                                    className="block w-20 h-20 shrink-0 border rounded-lg overflow-hidden relative group"
                                                >
                                                    <img 
                                                        src={`${import.meta.env.VITE_API_URL}${img}`} 
                                                        alt="Report attachment" 
                                                        className="w-full h-full object-cover transition-transform group-hover:scale-105" 
                                                    />
                                                </a>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
