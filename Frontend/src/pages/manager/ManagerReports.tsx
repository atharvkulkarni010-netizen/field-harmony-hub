import React, { useState, useEffect } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { reportsApi, getUploadUrl } from "@/services/api";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Calendar, User, FileText, Image as ImageIcon, Clock, Eye, ClipboardList } from "lucide-react";
import { format } from "date-fns";

export default function ManagerReports() {
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [filterByDate, setFilterByDate] = useState(false);
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchReports = async () => {
    try {
      setLoading(true);
      const dateParam = filterByDate ? selectedDate : undefined;
      const response = await reportsApi.getTeamReports(dateParam);
      setReports(response.data);
    } catch (error) {
      console.error("Error fetching reports:", error);
      // Don't show error on 404/empty, just empty list
      setReports([]);
      if (error.response && error.response.status !== 404) {
        toast({
          title: "Error",
          description: "Failed to load reports",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [selectedDate, filterByDate]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Daily Reports"
        description="View operational reports from your team"
      />

      <div className="bg-card/40 backdrop-blur-md p-5 rounded-2xl shadow-sm border border-primary/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all hover:shadow-md">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Calendar className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-sm">Filter Reports</h3>
            <p className="text-xs text-muted-foreground">View reports by submission date</p>
          </div>
        </div>
        <div className="flex items-center gap-4 bg-background/60 p-2 rounded-xl border border-border/50">
          <label className="flex items-center gap-2 cursor-pointer px-2 transition-opacity hover:opacity-80">
            <Checkbox
              checked={filterByDate}
              onCheckedChange={(checked) => setFilterByDate(checked as boolean)}
            />
            <span className="text-sm font-medium">Specific Date</span>
          </label>
          {filterByDate && (
            <div className="pl-2 border-l border-border/50 animate-fade-in">
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-auto max-w-[160px] h-8 text-sm border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 px-2 cursor-pointer"
              />
            </div>
          )}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">
          Loading {filterByDate ? "filtered" : "all"} reports...
        </div>
      ) : reports.length === 0 ? (
        <div className="text-center py-16 bg-muted/20 rounded-lg border border-dashed">
          <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
          <h3 className="text-lg font-medium">No reports found</h3>
          <p className="text-muted-foreground">
            {filterByDate
              ? `No reports submitted for ${format(new Date(selectedDate), "MMMM do, yyyy")}`
              : "No reports submitted by your team yet"}
          </p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
          {reports.map((report) => (
            <Card
              key={report.report_id}
              className="group relative overflow-hidden rounded-2xl border border-primary/10 bg-card/50 backdrop-blur-sm transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1"
            >
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary/40 via-primary/20 to-transparent opacity-50 group-hover:opacity-100 transition-opacity" />
              
              <CardHeader className="pb-4 pt-6">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-primary font-bold text-xl shadow-inner border border-primary/10">
                      {report.worker_name.charAt(0)}
                    </div>
                    <div>
                      <CardTitle className="text-lg tracking-tight">
                        {report.worker_name}
                      </CardTitle>
                      <p className="text-sm font-medium text-muted-foreground/80">
                        {report.worker_email}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1.5">
                    <Badge variant="secondary" className="bg-background/80 backdrop-blur font-mono text-xs shadow-sm flex items-center gap-1.5 px-2.5 py-1">
                      <Clock className="w-3 h-3 text-muted-foreground" />
                      {format(new Date(report.created_at), "h:mm a")}
                    </Badge>
                    <span className="text-[10px] text-muted-foreground font-medium px-1 uppercase tracking-wider">
                      {format(new Date(report.report_date || report.created_at), "MMM dd, yyyy")}
                    </span>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-6 pt-2">
                <div className="relative">
                  <div className="absolute left-0 top-1 bottom-1 w-1 bg-primary/20 rounded-full" />
                  <div className="pl-4 pr-2">
                    <h4 className="text-sm font-semibold mb-2 flex items-center gap-2 text-foreground/80 uppercase tracking-wider text-[11px]">
                      <FileText className="w-3.5 h-3.5 text-primary/70" /> Work Description
                    </h4>
                    <div className="text-sm whitespace-pre-wrap leading-relaxed text-muted-foreground line-clamp-3">
                      {report.description || <span className="italic opacity-50">No description provided.</span>}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <div className="flex gap-4">
                    <div className="text-xs text-muted-foreground flex items-center gap-1.5">
                      <ImageIcon className="w-3.5 h-3.5" />
                      {report.images && report.images.length > 0 
                        ? `${report.images.length} photo${report.images.length > 1 ? 's' : ''}`
                        : 'No photos'}
                    </div>
                    {report.tasks && report.tasks.length > 0 && (
                      <div className="text-xs text-muted-foreground flex items-center gap-1.5">
                        <ClipboardList className="w-3.5 h-3.5" />
                        {report.tasks.length} task{report.tasks.length > 1 ? 's' : ''}
                      </div>
                    )}
                  </div>
                  
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" className="text-primary hover:bg-primary/10 border-primary/20 bg-primary/5">
                        <Eye className="w-4 h-4 mr-2" /> View Details
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-primary font-bold text-xl shadow-inner border border-primary/10">
                            {report.worker_name.charAt(0)}
                          </div>
                          <div className="text-left">
                            <div className="text-xl tracking-tight">{report.worker_name}'s Report</div>
                            <div className="text-sm font-medium text-muted-foreground">
                              {format(new Date(report.report_date || report.created_at), "MMMM dd, yyyy")}
                            </div>
                          </div>
                        </DialogTitle>
                      </DialogHeader>
                      
                      <div className="space-y-6 pt-4">
                        {/* Description */}
                        <div>
                          <h4 className="text-sm font-semibold mb-3 flex items-center gap-2 text-foreground/80">
                            <FileText className="w-4 h-4 text-primary/70" /> Full Description
                          </h4>
                          <div className="bg-muted/30 p-5 rounded-xl text-sm whitespace-pre-wrap leading-relaxed border border-border/50">
                            {report.description || <span className="italic opacity-50">No description provided.</span>}
                          </div>
                        </div>

                        {/* Tasks Linked */}
                        {report.tasks && report.tasks.length > 0 && (
                          <div className="pt-4 border-t border-border/50">
                            <h4 className="text-sm font-semibold mb-3 flex items-center gap-2 text-foreground/80">
                              <ClipboardList className="w-4 h-4 text-primary/70" /> Associated Tasks
                            </h4>
                            <div className="flex flex-wrap gap-2">
                              {report.tasks.map((task: any, index: number) => (
                                <Badge key={index} variant="secondary" className="bg-primary/10 text-primary border-primary/20 px-3 py-1.5 font-medium">
                                  {task.title} <span className="text-xs opacity-70 ml-1 font-normal">({task.project_name})</span>
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Images */}
                        {report.images && report.images.length > 0 && (
                          <div className="pt-2 border-t border-border/50">
                            <h4 className="text-sm font-semibold mt-4 mb-3 flex items-center gap-2 text-foreground/80">
                              <ImageIcon className="w-4 h-4 text-primary/70" /> Attached Evidence ({report.images.length})
                            </h4>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                              {report.images.map((img: string, index: number) => (
                                <a
                                  key={index}
                                  href={getUploadUrl(img)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="block aspect-square rounded-xl overflow-hidden relative group shadow-sm border border-border/50 bg-muted"
                                >
                                  <img
                                    src={getUploadUrl(img)}
                                    alt={`Attachment ${index + 1}`}
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                  />
                                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                                    <span className="text-white text-xs font-medium bg-black/40 px-3 py-1.5 rounded-md backdrop-blur-sm">Click to expand</span>
                                  </div>
                                </a>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
