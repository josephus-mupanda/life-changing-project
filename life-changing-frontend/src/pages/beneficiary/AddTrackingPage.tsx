import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import {
  ArrowLeft,
  Save,
  Calendar,
  DollarSign,
  TrendingUp,
  Briefcase,
  Target,
  AlertCircle,
  CheckCircle2,
  Plus,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { beneficiaryService } from '@/services/beneficiary.service';
import { WeeklyTrackingDto, AttendanceStatus, TaskStatus } from '@/lib/types';

export default function AddTrackingPage() {
  const navigate = useNavigate();
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
      navigate('/beneficiary/tracking');
    } catch (error) {
      console.error("Submission failed", error);
      toast.error("Failed to submit weekly report. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500 pb-10">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/beneficiary/tracking')} className="rounded-full">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">New Weekly Report</h1>
          <p className="text-slate-500 dark:text-slate-400">Record your progress for the week</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Section 1: Basic Info & Attendance */}
        <Card className="border-none shadow-sm ring-1 ring-slate-200 dark:ring-slate-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Calendar className="w-5 h-5 text-teal-600" />
              Week & Attendance
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
          </CardContent>
        </Card>

        {/* Section 2: Financials & Sales */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="border-none shadow-sm ring-1 ring-slate-200 dark:ring-slate-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <DollarSign className="w-5 h-5 text-emerald-600" />
                Financial Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
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
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm ring-1 ring-slate-200 dark:ring-slate-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                Sales Data (Optional)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
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
              </div>
              <div className="space-y-2">
                <Label>Best Selling Product</Label>
                <Input
                  placeholder="e.g. Handmade Basket"
                  value={bestSellingProduct}
                  onChange={(e) => setBestSellingProduct(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Section 3: Tasks & Goals */}
        <Card className="border-none shadow-sm ring-1 ring-slate-200 dark:ring-slate-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Target className="w-5 h-5 text-indigo-600" />
              Tasks & Progress
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

            <Separator />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Challenges Faced</Label>
                <Textarea
                  value={challenges}
                  onChange={(e) => setChallenges(e.target.value)}
                  placeholder="What obstacles did you encounter?"
                  className="min-h-[100px]"
                />
              </div>
              <div className="space-y-2">
                <Label>Solutions Implemented</Label>
                <Textarea
                  value={solutions}
                  onChange={(e) => setSolutions(e.target.value)}
                  placeholder="How did you overcome them?"
                  className="min-h-[100px]"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Section 4: Next Week Plan */}
        <Card className="border-none shadow-sm ring-1 ring-slate-200 dark:ring-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Briefcase className="w-5 h-5 text-slate-700 dark:text-slate-300" />
              Plan for Next Week
            </CardTitle>
            <CardDescription>Set your targets and identify support needs</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <Label>Key Tasks</Label>
              {nextWeekTasks.map((task, idx) => (
                <div key={idx} className="flex gap-2">
                  <Input
                    value={task}
                    onChange={(e) => handleArrayChange(idx, e.target.value, setNextWeekTasks)}
                    placeholder={`Task ${idx + 1}`}
                  />
                  {nextWeekTasks.length > 1 && (
                    <Button type="button" variant="ghost" size="icon" onClick={() => removeItem(idx, setNextWeekTasks)}>
                      <X className="w-4 h-4 text-slate-400 hover:text-red-500" />
                    </Button>
                  )}
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" onClick={() => addItem(setNextWeekTasks)} className="mt-2">
                <Plus className="w-4 h-4 mr-2" /> Add Task
              </Button>
            </div>

            <Separator />

            <div className="space-y-3">
              <Label>Support Needed (Optional)</Label>
              {supportNeeded.map((support, idx) => (
                <div key={idx} className="flex gap-2">
                  <Input
                    value={support}
                    onChange={(e) => handleArrayChange(idx, e.target.value, setSupportNeeded)}
                    placeholder={`Support Item ${idx + 1}`}
                  />
                  {supportNeeded.length > 1 && (
                    <Button type="button" variant="ghost" size="icon" onClick={() => removeItem(idx, setSupportNeeded)}>
                      <X className="w-4 h-4 text-slate-400 hover:text-red-500" />
                    </Button>
                  )}
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" onClick={() => addItem(setSupportNeeded)} className="mt-2">
                <Plus className="w-4 h-4 mr-2" /> Add Support Need
              </Button>
            </div>

            <div className="space-y-2 pt-4">
              <Label>Additional Notes</Label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any other comments..."
              />
            </div>
          </CardContent>
        </Card>

        {/* Submit Actions */}
        <div className="flex justify-end gap-4 pt-4">
          <Button type="button" variant="ghost" onClick={() => navigate('/beneficiary/tracking')}>Cancel</Button>
          <Button type="submit" className="bg-teal-600 hover:bg-teal-700 text-white min-w-[150px] shadow-lg" disabled={loading}>
            {loading ? (
              <>Saving...</>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" /> Submit Report
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
