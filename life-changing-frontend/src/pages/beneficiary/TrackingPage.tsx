import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Plus, Search, Filter, Download, Loader2, ArrowLeft, ChevronLeft, ChevronRight, Eye } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useNavigate } from 'react-router-dom';
import { beneficiaryService } from '@/services/beneficiary.service';
import { AttendanceStatus, TaskStatus } from '@/lib/types';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

export default function TrackingPage() {
  const navigate = useNavigate();
  const [trackings, setTrackings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  useEffect(() => {
    fetchTrackings();
  }, [page]);

  const fetchTrackings = async () => {
    try {
      setLoading(true);
      // Assuming getAllBeneficiaries structure, checking if getWeeklyTracking supports pagination
      // If not, we fetch all and paginate client side or use limited recent endpoint
      // Based on service analysis, getWeeklyTracking returns any[], likely all or default limit
      const data = await beneficiaryService.getWeeklyTracking();
      // Mock pagination since API might return all for now. Ideally backend should support ?page=1
      const safeData = Array.isArray(data) ? data : [];
      setTrackings(safeData);
      setTotalPages(1); // Placeholder
      setTotalRecords(safeData.length);
    } catch (error) {
      console.error("Failed to load tracking history", error);
      toast.error("Failed to load tracking history");
    } finally {
      setLoading(false);
    }
  };

  const getAttendanceBadge = (status: AttendanceStatus) => {
    const styles = {
      [AttendanceStatus.PRESENT]: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800",
      [AttendanceStatus.ABSENT]: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800",
      [AttendanceStatus.LATE]: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800",
    };
    return (
      <Badge variant="outline" className={`${styles[status] || styles[AttendanceStatus.ABSENT]} capitalize`}>
        {status?.toLowerCase()}
      </Badge>
    );
  };

  const getTaskStatusBadge = (status: TaskStatus | null) => {
    if (!status) return <Badge variant="outline" className="text-slate-500 border-slate-200">N/A</Badge>;

    const styles = {
      [TaskStatus.COMPLETED]: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800",
      [TaskStatus.IN_PROGRESS]: "bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400 border-sky-200 dark:border-sky-800",
      [TaskStatus.NOT_DONE]: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700",
    };

    return (
      <Badge variant="outline" className={`${styles[status] || styles[TaskStatus.NOT_DONE]} capitalize`}>
        {status?.toLowerCase().replace('_', ' ')}
      </Badge>
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Tracking History</h1>
          <p className="text-slate-500 dark:text-slate-400">View and manage your weekly progress reports</p>
        </div>
        <Button onClick={() => navigate('/beneficiary/tracking/add')} className="bg-teal-600 hover:bg-teal-700 text-white shadow-md">
          <Plus className="w-4 h-4 mr-2" />
          New Entry
        </Button>
      </div>

      <Card className="border-none shadow-sm ring-1 ring-slate-200 dark:ring-slate-800 bg-white dark:bg-slate-900">
        <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <CardTitle className="text-lg font-semibold">Past Submissions</CardTitle>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
                <Input placeholder="Search records..." className="pl-9 h-9" />
              </div>
              <Button variant="outline" size="icon" className="h-9 w-9">
                <Filter className="h-4 w-4 text-slate-500" />
              </Button>
              <Button variant="outline" size="icon" className="h-9 w-9">
                <Download className="h-4 w-4 text-slate-500" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
            </div>
          ) : trackings.length === 0 ? (
            <div className="text-center py-20 text-slate-500">
              No tracking records found. Start by adding a new entry!
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="w-[150px]">Week Ending</TableHead>
                    <TableHead>Attendance</TableHead>
                    <TableHead>Income</TableHead>
                    <TableHead>Expenses</TableHead>
                    <TableHead>Capital</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {trackings.map((tracking) => (
                    <TableRow key={tracking.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <TableCell className="font-medium text-slate-900 dark:text-white">
                        {new Date(tracking.weekEnding).toLocaleDateString()}
                      </TableCell>
                      <TableCell>{getAttendanceBadge(tracking.attendance)}</TableCell>
                      <TableCell className="text-emerald-600 dark:text-emerald-400 font-medium">
                        +{tracking.incomeThisWeek?.toLocaleString() || 0}
                      </TableCell>
                      <TableCell className="text-rose-600 dark:text-rose-400 font-medium">
                        -{tracking.expensesThisWeek?.toLocaleString() || 0}
                      </TableCell>
                      <TableCell className="text-slate-600 dark:text-slate-300">
                        {tracking.currentCapital?.toLocaleString() || 0}
                      </TableCell>
                      <TableCell>{getTaskStatusBadge(tracking.taskCompletionStatus)}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <span className="sr-only">View</span>
                          <Eye className="h-4 w-4 text-slate-500" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
        {/* Pagination placeholder - Assuming simple list for now, extend when API supports pagination metadata */}
        <div className="px-6 py-4 flex items-center justify-between border-t border-slate-100 dark:border-slate-800">
          <p className="text-xs text-slate-500">
            Showing {trackings.length} records
          </p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)} className="h-8 w-8 p-0">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)} className="h-8 w-8 p-0">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
