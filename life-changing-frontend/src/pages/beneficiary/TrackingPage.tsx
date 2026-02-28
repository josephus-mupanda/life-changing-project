// pages/beneficiary/TrackingPage.tsx
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Calendar, Plus, Search, Filter, Download, Loader2, Eye, ChevronLeft, ChevronRight, X, Save, DollarSign, TrendingUp, Briefcase, Target, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { beneficiaryService } from '@/services/beneficiary.service';
import { AttendanceStatus, TaskStatus, WeeklyTrackingDto } from '@/lib/types';
import { toast } from 'sonner';
import { format } from 'date-fns';

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

// Interface for tracking data from API
interface TrackingData {
  id: string;
  weekEnding: string;
  attendance: AttendanceStatus;
  taskGiven: string;
  taskCompletionStatus: TaskStatus;
  incomeThisWeek: string;
  expensesThisWeek: string;
  currentCapital: string;
  salesData: {
    unitsSold: number;
    averagePrice: number;
    bestSellingProduct: string;
  };
  challenges: string;
  solutionsImplemented: string;
  notes: string;
  nextWeekPlan: {
    tasks: string[];
    goals: string[];
    supportNeeded: string[];
  };
  submittedBy: any;
  submittedByType: string;
  createdAt: string;
  verifiedAt: string | null;
}

// Format currency
const formatCurrency = (amount: string | number) => {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  return new Intl.NumberFormat('en-RW', {
    style: 'currency',
    currency: 'RWF',
    minimumFractionDigits: 0,
  }).format(num);
};

// Format date
const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

// Attendance badge styles
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

// Task status badge styles
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

// Add Tracking Dialog Component
interface AddTrackingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

function AddTrackingDialog({ open, onOpenChange, onSuccess }: AddTrackingDialogProps) {
  const [loading, setLoading] = useState(false);

  // Form State
  const [weekEnding, setWeekEnding] = useState(new Date().toISOString().split('T')[0]);
  const [attendance, setAttendance] = useState<AttendanceStatus | "">("");

  // Financials
  const [income, setIncome] = useState("");
  const [expenses, setExpenses] = useState("");
  const [currentCapital, setCurrentCapital] = useState("");

  // Sales
  const [unitsSold, setUnitsSold] = useState("");
  const [avgPrice, setAvgPrice] = useState("");
  const [bestSellingProduct, setBestSellingProduct] = useState("");

  // Tasks & Goals
  const [taskGiven, setTaskGiven] = useState("");
  const [taskStatus, setTaskStatus] = useState<TaskStatus | "">("");

  const [challenges, setChallenges] = useState("");
  const [solutions, setSolutions] = useState("");
  const [notes, setNotes] = useState("");

  // Dynamic Arrays
  const [nextWeekTasks, setNextWeekTasks] = useState<string[]>(['']);
  const [nextWeekGoals, setNextWeekGoals] = useState<string[]>(['']);
  const [supportNeeded, setSupportNeeded] = useState<string[]>(['']);

  const resetForm = () => {
    setWeekEnding(new Date().toISOString().split('T')[0]);
    setAttendance("");
    setIncome("");
    setExpenses("");
    setCurrentCapital("");
    setUnitsSold("");
    setAvgPrice("");
    setBestSellingProduct("");
    setTaskGiven("");
    setTaskStatus("");
    setChallenges("");
    setSolutions("");
    setNotes("");
    setNextWeekTasks(['']);
    setNextWeekGoals(['']);
    setSupportNeeded(['']);
  };

  const handleArrayChange = (
    index: number,
    value: string,
    setter: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    setter(prev => {
      const newArr = [...prev];
      newArr[index] = value;
      return newArr;
    });
  };

  const addItem = (setter: React.Dispatch<React.SetStateAction<string[]>>) => {
    setter(prev => [...prev, '']);
  };

  const removeItem = (index: number, setter: React.Dispatch<React.SetStateAction<string[]>>) => {
    setter(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!attendance) {
      toast.error("Please select attendance status");
      return;
    }

    setLoading(true);
    try {
      const payload: WeeklyTrackingDto = {
        weekEnding,
        attendance: attendance as AttendanceStatus,
        taskGiven,
        taskCompletionStatus: taskStatus as TaskStatus || undefined,
        incomeThisWeek: Number(income) || 0,
        expensesThisWeek: Number(expenses) || 0,
        currentCapital: Number(currentCapital) || 0,
        salesData: {
          unitsSold: Number(unitsSold) || 0,
          averagePrice: Number(avgPrice) || 0,
          bestSellingProduct
        },
        challenges,
        solutionsImplemented: solutions,
        notes,
        nextWeekPlan: {
          tasks: nextWeekTasks.filter(t => t.trim() !== ''),
          goals: nextWeekGoals.filter(g => g.trim() !== ''),
          supportNeeded: supportNeeded.filter(s => s.trim() !== '')
        }
      };

      await beneficiaryService.submitWeeklyTracking(payload);
      toast.success("Weekly report submitted successfully!");
      onSuccess();
      onOpenChange(false);
      resetForm();
    } catch (error) {
      console.error("Submission failed", error);
      toast.error("Failed to submit weekly report. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(open) => {
      if (!open) resetForm();
      onOpenChange(open);
    }}>
      <DialogContent className="sm:max-w-[800px] w-[95%] md:w-full p-0">
        <div className="flex flex-col" style={{ maxHeight: '90vh' }}>
          {/* Fixed Header */}
          <div className="px-6 py-4 border-b">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold flex items-center gap-2">
                <div className="p-2 rounded-lg bg-teal-100 text-teal-600">
                  <Calendar className="w-4 h-4" />
                </div>
                New Weekly Report
              </DialogTitle>
              <DialogDescription>
                Record your progress for the week
              </DialogDescription>
            </DialogHeader>
          </div>

          {/* Scrollable Content */}
          <div className="overflow-y-auto flex-1 p-6">
            <form id="tracking-form" onSubmit={handleSubmit} className="space-y-6">
              {/* Week & Attendance */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-1 h-5 bg-teal-500 rounded-full"></div>
                  <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider">
                    Week & Attendance
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Week Ending</Label>
                    <Input
                      type="date"
                      value={weekEnding}
                      onChange={(e) => setWeekEnding(e.target.value)}
                      required
                      className="font-medium"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Attendance Status</Label>
                    <Select value={attendance} onValueChange={(v) => setAttendance(v as AttendanceStatus)} required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={AttendanceStatus.PRESENT}>Present</SelectItem>
                        <SelectItem value={AttendanceStatus.ABSENT}>Absent</SelectItem>
                        <SelectItem value={AttendanceStatus.LATE}>Late</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Financial Overview */}
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-1 h-5 bg-emerald-500 rounded-full"></div>
                  <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider">
                    Financial Overview
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Income This Week (RWF)</Label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={income}
                      onChange={(e) => setIncome(e.target.value)}
                      className="font-medium text-emerald-600"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Expenses This Week (RWF)</Label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={expenses}
                      onChange={(e) => setExpenses(e.target.value)}
                      className="font-medium text-rose-600"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Current Capital (RWF)</Label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={currentCapital}
                      onChange={(e) => setCurrentCapital(e.target.value)}
                      className="font-medium"
                    />
                  </div>
                </div>
              </div>

              {/* Sales Data */}
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-1 h-5 bg-blue-500 rounded-full"></div>
                  <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider">
                    Sales Data <span className="text-xs font-normal text-slate-400 ml-2">(Optional)</span>
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Units Sold</Label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={unitsSold}
                      onChange={(e) => setUnitsSold(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Avg Price (RWF)</Label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={avgPrice}
                      onChange={(e) => setAvgPrice(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Best Selling Product</Label>
                    <Input
                      placeholder="e.g. Handmade Basket"
                      value={bestSellingProduct}
                      onChange={(e) => setBestSellingProduct(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Tasks & Progress */}
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-1 h-5 bg-indigo-500 rounded-full"></div>
                  <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider">
                    Tasks & Progress
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Primary Task from Last Week</Label>
                    <Input
                      value={taskGiven}
                      onChange={(e) => setTaskGiven(e.target.value)}
                      placeholder="Review your last week's plan..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Completion Status</Label>
                    <Select value={taskStatus} onValueChange={(v) => setTaskStatus(v as TaskStatus)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={TaskStatus.COMPLETED}>Completed</SelectItem>
                        <SelectItem value={TaskStatus.IN_PROGRESS}>In Progress</SelectItem>
                        <SelectItem value={TaskStatus.NOT_DONE}>Not Done</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Challenges & Solutions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-100">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-1 h-5 bg-rose-500 rounded-full"></div>
                    <Label className="text-xs font-bold uppercase text-slate-400 tracking-wider">
                      Challenges Faced
                    </Label>
                  </div>
                  <Textarea
                    value={challenges}
                    onChange={(e) => setChallenges(e.target.value)}
                    placeholder="What obstacles did you encounter?"
                    className="min-h-[100px]"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-1 h-5 bg-green-500 rounded-full"></div>
                    <Label className="text-xs font-bold uppercase text-slate-400 tracking-wider">
                      Solutions Implemented
                    </Label>
                  </div>
                  <Textarea
                    value={solutions}
                    onChange={(e) => setSolutions(e.target.value)}
                    placeholder="How did you overcome them?"
                    className="min-h-[100px]"
                  />
                </div>
              </div>

              {/* Next Week Plan */}
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-1 h-5 bg-purple-500 rounded-full"></div>
                  <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider">
                    Plan for Next Week
                  </h3>
                </div>

                {/* Tasks */}
                <div className="space-y-3">
                  <Label>Key Tasks</Label>
                  <AnimatePresence>
                    {nextWeekTasks.map((task, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="flex gap-2"
                      >
                        <Input
                          value={task}
                          onChange={(e) => handleArrayChange(idx, e.target.value, setNextWeekTasks)}
                          placeholder={`Task ${idx + 1}`}
                        />
                        {nextWeekTasks.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeItem(idx, setNextWeekTasks)}
                            className="shrink-0 text-slate-400 hover:text-red-500"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        )}
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addItem(setNextWeekTasks)}
                    className="w-full border-dashed border-slate-300 hover:border-teal-500 hover:bg-teal-50 transition-all"
                  >
                    <Plus className="w-4 h-4 mr-2" /> Add Task
                  </Button>
                </div>

                {/* Goals */}
                <div className="space-y-3 pt-2">
                  <Label>Goals</Label>
                  <AnimatePresence>
                    {nextWeekGoals.map((goal, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="flex gap-2"
                      >
                        <Input
                          value={goal}
                          onChange={(e) => handleArrayChange(idx, e.target.value, setNextWeekGoals)}
                          placeholder={`Goal ${idx + 1}`}
                        />
                        {nextWeekGoals.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeItem(idx, setNextWeekGoals)}
                            className="shrink-0 text-slate-400 hover:text-red-500"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        )}
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addItem(setNextWeekGoals)}
                    className="w-full border-dashed border-slate-300 hover:border-teal-500 hover:bg-teal-50 transition-all"
                  >
                    <Plus className="w-4 h-4 mr-2" /> Add Goal
                  </Button>
                </div>

                {/* Support Needed */}
                <div className="space-y-3 pt-2">
                  <Label>Support Needed</Label>
                  <AnimatePresence>
                    {supportNeeded.map((support, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="flex gap-2"
                      >
                        <Input
                          value={support}
                          onChange={(e) => handleArrayChange(idx, e.target.value, setSupportNeeded)}
                          placeholder={`Support Item ${idx + 1}`}
                        />
                        {supportNeeded.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeItem(idx, setSupportNeeded)}
                            className="shrink-0 text-slate-400 hover:text-red-500"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        )}
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addItem(setSupportNeeded)}
                    className="w-full border-dashed border-slate-300 hover:border-teal-500 hover:bg-teal-50 transition-all"
                  >
                    <Plus className="w-4 h-4 mr-2" /> Add Support Need
                  </Button>
                </div>
              </div>

              {/* Additional Notes */}
              <div className="space-y-2 pt-4 border-t border-slate-100">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-1 h-5 bg-slate-500 rounded-full"></div>
                  <Label className="text-xs font-bold uppercase text-slate-400 tracking-wider">
                    Additional Notes
                  </Label>
                </div>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any other comments..."
                  className="min-h-[80px]"
                />
              </div>

              {/* Tips */}
              <div className="p-4 bg-teal-50/50 rounded-lg border border-teal-100">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-teal-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-medium text-teal-800">Report Tips</p>
                    <ul className="text-xs text-teal-600 mt-1 space-y-1 list-disc list-inside">
                      <li>Be specific about challenges and solutions</li>
                      <li>Include realistic goals for next week</li>
                      <li>Mention any support you need from mentors</li>
                    </ul>
                  </div>
                </div>
              </div>
            </form>
          </div>

          {/* Fixed Footer */}
          <div className="px-6 py-4 border-t flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                resetForm();
                onOpenChange(false);
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              form="tracking-form"
              disabled={loading}
              className="bg-teal-600 hover:bg-teal-700 text-white"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Submit Report
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Tracking Details Dialog Component
interface TrackingDetailsDialogProps {
  tracking: TrackingData | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function TrackingDetailsDialog({ tracking, open, onOpenChange }: TrackingDetailsDialogProps) {
  if (!tracking) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] w-[95%] md:w-full max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <div className="p-2 rounded-lg bg-teal-100 text-teal-600">
              <Calendar className="w-4 h-4" />
            </div>
            Weekly Report Details
          </DialogTitle>
          <DialogDescription>
            Week ending {formatDate(tracking.weekEnding)}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Status Badges */}
          <div className="flex items-center gap-2">
            {getAttendanceBadge(tracking.attendance)}
            {getTaskStatusBadge(tracking.taskCompletionStatus)}
            {tracking.verifiedAt && (
              <Badge className="bg-green-100 text-green-700 border-green-200">
                <CheckCircle2 className="w-3 h-3 mr-1" />
                Verified
              </Badge>
            )}
          </div>

          {/* Financial Summary */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 bg-emerald-50 rounded-lg text-center">
              <p className="text-xs text-emerald-600 mb-1">Income</p>
              <p className="text-lg font-bold text-emerald-700">
                {formatCurrency(tracking.incomeThisWeek)}
              </p>
            </div>
            <div className="p-3 bg-rose-50 rounded-lg text-center">
              <p className="text-xs text-rose-600 mb-1">Expenses</p>
              <p className="text-lg font-bold text-rose-700">
                {formatCurrency(tracking.expensesThisWeek)}
              </p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg text-center">
              <p className="text-xs text-blue-600 mb-1">Capital</p>
              <p className="text-lg font-bold text-blue-700">
                {formatCurrency(tracking.currentCapital)}
              </p>
            </div>
          </div>

          {/* Sales Data */}
          {tracking.salesData && (tracking.salesData.unitsSold > 0 || tracking.salesData.bestSellingProduct) && (
            <div className="space-y-2">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-blue-600" />
                Sales Performance
              </h3>
              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-lg">
                <div>
                  <p className="text-xs text-slate-500">Units Sold</p>
                  <p className="text-sm font-medium">{tracking.salesData.unitsSold}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Avg Price</p>
                  <p className="text-sm font-medium">{formatCurrency(tracking.salesData.averagePrice)}</p>
                </div>
                {tracking.salesData.bestSellingProduct && (
                  <div className="col-span-2">
                    <p className="text-xs text-slate-500">Best Seller</p>
                    <p className="text-sm font-medium">{tracking.salesData.bestSellingProduct}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Task */}
          {tracking.taskGiven && (
            <div className="space-y-2">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <Target className="w-4 h-4 text-indigo-600" />
                Primary Task
              </h3>
              <p className="text-sm text-slate-700 p-3 bg-slate-50 rounded-lg">
                {tracking.taskGiven}
              </p>
            </div>
          )}

          {/* Challenges & Solutions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tracking.challenges && (
              <div className="space-y-2">
                <h3 className="text-sm font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600" />
                  Challenges
                </h3>
                <p className="text-sm text-slate-700 p-3 bg-rose-50 rounded-lg">
                  {tracking.challenges}
                </p>
              </div>
            )}
            {tracking.solutionsImplemented && (
              <div className="space-y-2">
                <h3 className="text-sm font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  Solutions
                </h3>
                <p className="text-sm text-slate-700 p-3 bg-green-50 rounded-lg">
                  {tracking.solutionsImplemented}
                </p>
              </div>
            )}
          </div>

          {/* Next Week Plan */}
          {tracking.nextWeekPlan && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-purple-600" />
                Next Week Plan
              </h3>
              <div className="space-y-3">
                {tracking.nextWeekPlan.tasks && tracking.nextWeekPlan.tasks.length > 0 && (
                  <div className="p-3 bg-purple-50 rounded-lg">
                    <p className="text-xs font-medium text-purple-700 mb-2">Tasks</p>
                    <ul className="space-y-1">
                      {tracking.nextWeekPlan.tasks.map((task, idx) => (
                        <li key={idx} className="text-xs flex items-start gap-2">
                          <span className="text-purple-600 mt-0.5">•</span>
                          {task}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {tracking.nextWeekPlan.supportNeeded && tracking.nextWeekPlan.supportNeeded.length > 0 && (
                  <div className="p-3 bg-amber-50 rounded-lg">
                    <p className="text-xs font-medium text-amber-700 mb-2">Support Needed</p>
                    <ul className="space-y-1">
                      {tracking.nextWeekPlan.supportNeeded.map((support, idx) => (
                        <li key={idx} className="text-xs flex items-start gap-2">
                          <span className="text-amber-600 mt-0.5">•</span>
                          {support}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Notes */}
          {tracking.notes && (
            <div className="space-y-2">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <span className="w-1 h-4 bg-slate-500 rounded-full" />
                Additional Notes
              </h3>
              <p className="text-sm text-slate-600 p-3 bg-slate-50 rounded-lg">
                {tracking.notes}
              </p>
            </div>
          )}

          {/* Metadata */}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t text-xs text-slate-500">
            <div>
              <p>Submitted</p>
              <p className="font-medium text-slate-700">
                {formatDate(tracking.createdAt)}
              </p>
            </div>
            <div>
              <p>Submitted By</p>
              <p className="font-medium text-slate-700">
                {tracking.submittedBy?.fullName || 'Unknown'}
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Main Tracking Page Component
export default function TrackingPage() {
  const [trackings, setTrackings] = useState<TrackingData[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [selectedTracking, setSelectedTracking] = useState<TrackingData | null>(null);

  useEffect(() => {
    fetchTrackings();
  }, [page]);

  const fetchTrackings = async () => {
    try {
      setLoading(true);
      const response = await beneficiaryService.getWeeklyTracking();
      
      // Handle API response structure
      const responseData = response as any;
      const trackingData = responseData.data?.data || responseData.data || responseData;
      
      setTrackings(Array.isArray(trackingData) ? trackingData : []);
      setTotalRecords(Array.isArray(trackingData) ? trackingData.length : 0);
      setTotalPages(responseData.data?.meta?.totalPages || 1);
    } catch (error) {
      console.error("Failed to load tracking history", error);
      toast.error("Failed to load tracking history");
    } finally {
      setLoading(false);
    }
  };

  const filteredTrackings = trackings.filter(tracking => {
    const searchLower = searchTerm.toLowerCase();
    return (
      tracking.weekEnding.toLowerCase().includes(searchLower) ||
      tracking.attendance.toLowerCase().includes(searchLower) ||
      (tracking.taskGiven && tracking.taskGiven.toLowerCase().includes(searchLower)) ||
      (tracking.challenges && tracking.challenges.toLowerCase().includes(searchLower))
    );
  });

  const handleViewDetails = (tracking: TrackingData) => {
    setSelectedTracking(tracking);
    setDetailsDialogOpen(true);
  };

  return (
    <TooltipProvider>
      <motion.div
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
        className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50/30"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 space-y-6">
          
          {/* Header */}
          <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 tracking-tight">
                Tracking History
              </h1>
              <p className="text-sm sm:text-base text-slate-500 flex items-center gap-2 mt-1">
                <Calendar className="w-4 h-4" />
                <span>View and manage your weekly progress reports</span>
              </p>
            </div>

            <Button
              className="h-9 sm:h-10 px-4 sm:px-5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs sm:text-sm font-medium shadow-lg shadow-teal-600/20 transition-all active:scale-95"
              onClick={() => setAddDialogOpen(true)}
            >
              <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
              New Entry
            </Button>
          </motion.div>

          {/* Main Card */}
          <motion.div variants={fadeInUp}>
            <Card className="border border-slate-200 bg-white/80 backdrop-blur-xl">
              <CardHeader className="pb-3 border-b border-slate-100">
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                  <CardTitle className="text-lg font-semibold">Past Submissions</CardTitle>
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <div className="relative flex-1 sm:w-64">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
                      <Input
                        placeholder="Search records..."
                        className="pl-9 h-9 bg-white"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="outline" size="icon" className="h-9 w-9">
                          <Filter className="h-4 w-4 text-slate-500" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Filter</TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="outline" size="icon" className="h-9 w-9">
                          <Download className="h-4 w-4 text-slate-500" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Export</TooltipContent>
                    </Tooltip>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {loading ? (
                  <div className="flex justify-center items-center py-20">
                    <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
                  </div>
                ) : filteredTrackings.length === 0 ? (
                  <div className="text-center py-20 text-slate-500">
                    <Calendar className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                    <p className="text-lg font-medium mb-2">No tracking records found</p>
                    <p className="text-sm text-slate-400 mb-6">
                      {searchTerm ? 'Try adjusting your search' : 'Start by adding a new entry!'}
                    </p>
                    <Button
                      variant="outline"
                      onClick={() => setAddDialogOpen(true)}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Your First Report
                    </Button>
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
                        <AnimatePresence>
                          {filteredTrackings.map((tracking) => (
                            <motion.tr
                              key={tracking.id}
                              variants={fadeInUp}
                              initial="hidden"
                              animate="visible"
                              exit={{ opacity: 0, y: -20 }}
                              className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                            >
                              <TableCell className="font-medium text-slate-900">
                                {formatDate(tracking.weekEnding)}
                              </TableCell>
                              <TableCell>{getAttendanceBadge(tracking.attendance)}</TableCell>
                              <TableCell className="text-emerald-600 font-medium">
                                +{formatCurrency(tracking.incomeThisWeek)}
                              </TableCell>
                              <TableCell className="text-rose-600 font-medium">
                                -{formatCurrency(tracking.expensesThisWeek)}
                              </TableCell>
                              <TableCell className="text-slate-600">
                                {formatCurrency(tracking.currentCapital)}
                              </TableCell>
                              <TableCell>{getTaskStatusBadge(tracking.taskCompletionStatus)}</TableCell>
                              <TableCell className="text-right">
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-8 w-8 p-0"
                                      onClick={() => handleViewDetails(tracking)}
                                    >
                                      <Eye className="h-4 w-4 text-slate-500" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>View Details</TooltipContent>
                                </Tooltip>
                              </TableCell>
                            </motion.tr>
                          ))}
                        </AnimatePresence>
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
              <div className="px-6 py-4 flex items-center justify-between border-t border-slate-100">
                <p className="text-xs text-slate-500">
                  Showing {filteredTrackings.length} of {totalRecords} records
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page === 1}
                    onClick={() => setPage(p => p - 1)}
                    className="h-8 w-8 p-0"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm text-slate-600">
                    Page {page} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page >= totalPages}
                    onClick={() => setPage(p => p + 1)}
                    className="h-8 w-8 p-0"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Add Tracking Dialog */}
        <AddTrackingDialog
          open={addDialogOpen}
          onOpenChange={setAddDialogOpen}
          onSuccess={fetchTrackings}
        />

        {/* Tracking Details Dialog */}
        <TrackingDetailsDialog
          tracking={selectedTracking}
          open={detailsDialogOpen}
          onOpenChange={setDetailsDialogOpen}
        />
      </motion.div>
    </TooltipProvider>
  );
}