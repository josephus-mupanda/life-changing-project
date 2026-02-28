// pages/beneficiary/GoalsPage.tsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  DollarSign,
  Briefcase,
  GraduationCap,
  User,
  Lightbulb,
  Target,
  TrendingUp,
  CheckCircle2,
  Clock,
  AlertCircle,
  Plus,
  Loader2,
  ChevronRight,
  MoreVertical,
  Pencil,
  Trash2,
  Calendar,
  Award,
  Sparkles,
  BookOpen,
  ListChecks,
  FileText,
  Rocket,
  Zap,
  X,
  HelpCircle,
  Save,
  ArrowLeft
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { beneficiaryService } from '@/services/beneficiary.service';
import { BusinessGoal, GoalType, GoalStatus, CreateGoalDto } from '@/lib/types';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
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

// Goal type configurations
const goalTypeConfig = {
  [GoalType.FINANCIAL]: {
    icon: DollarSign,
    color: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400',
    border: 'border-emerald-200 dark:border-emerald-800',
    label: 'Financial',
    description: 'Save money, invest, or reach financial targets',
    gradient: 'from-emerald-500/10 to-teal-500/10'
  },
  [GoalType.BUSINESS]: {
    icon: Briefcase,
    color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
    border: 'border-blue-200 dark:border-blue-800',
    label: 'Business',
    description: 'Grow your business, increase revenue, expand',
    gradient: 'from-blue-500/10 to-cyan-500/10'
  },
  [GoalType.EDUCATION]: {
    icon: GraduationCap,
    color: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
    border: 'border-purple-200 dark:border-purple-800',
    label: 'Education',
    description: 'Learn new skills, complete courses, get certified',
    gradient: 'from-purple-500/10 to-pink-500/10'
  },
  [GoalType.PERSONAL]: {
    icon: User,
    color: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400',
    border: 'border-amber-200 dark:border-amber-800',
    label: 'Personal',
    description: 'Health, wellness, family, or personal growth',
    gradient: 'from-amber-500/10 to-orange-500/10'
  },
  [GoalType.SKILLS]: {
    icon: Lightbulb,
    color: 'bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400',
    border: 'border-pink-200 dark:border-pink-800',
    label: 'Skills',
    description: 'Develop new abilities, master a craft',
    gradient: 'from-pink-500/10 to-rose-500/10'
  }
};

interface MilestoneInput {
  description: string;
  targetAmount: string;
  targetDate: string;
}

export default function GoalsPage() {
  const navigate = useNavigate();
  const [goals, setGoals] = useState<BusinessGoal[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGoal, setSelectedGoal] = useState<BusinessGoal | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isGoalDialogOpen, setIsGoalDialogOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<BusinessGoal | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('details');
  const [completion, setCompletion] = useState(0);

  // Milestones
  const [milestones, setMilestones] = useState<MilestoneInput[]>([
    { description: '', targetAmount: '', targetDate: '' }
  ]);

  // Action Plan
  const [actionPlanSteps, setActionPlanSteps] = useState<string[]>(['']);
  const [resourcesNeeded, setResourcesNeeded] = useState<string[]>(['']);

  // Form Data
  const [formData, setFormData] = useState({
    description: '',
    type: '',
    targetAmount: '',
    targetDate: '',
    notes: '',
    timeline: ''
  });

  useEffect(() => {
    fetchGoals();
  }, []);

  const fetchGoals = async () => {
    try {
      setLoading(true);
      const response = await beneficiaryService.getGoals();
      const responseData = response as any;
      const goalsData = responseData.data?.data || responseData.data || responseData;
      const goalsList: BusinessGoal[] = Array.isArray(goalsData) ? goalsData : [];
      setGoals(goalsList);
    } catch (error: any) {
      console.error("Failed to load goals", error);
      toast.error("Failed to load goals. Please try again.");
      setGoals([]);
    } finally {
      setLoading(false);
    }
  };

  // Reset form to initial state
  const resetForm = () => {
    setFormData({
      description: '',
      type: '',
      targetAmount: '',
      targetDate: '',
      notes: '',
      timeline: ''
    });
    setMilestones([{ description: '', targetAmount: '', targetDate: '' }]);
    setActionPlanSteps(['']);
    setResourcesNeeded(['']);
    setEditingGoal(null);
    setActiveTab('details');
    setCompletion(0);
  };

  // Load goal data for editing
  const openEditDialog = (goal: BusinessGoal) => {
    setEditingGoal(goal);
    
    // Set form data from goal
    setFormData({
      description: goal.description || '',
      type: goal.type || '',
      targetAmount: goal.targetAmount?.toString() || '',
      targetDate: goal.targetDate ? new Date(goal.targetDate).toISOString().split('T')[0] : '',
      notes: goal.notes || '',
      timeline: goal.actionPlan?.timeline || ''
    });

    // Set milestones
    if (goal.milestones && goal.milestones.length > 0) {
      setMilestones(goal.milestones.map(m => ({
        description: m.description || '',
        targetAmount: m.targetAmount?.toString() || '',
        targetDate: m.targetDate ? new Date(m.targetDate).toISOString().split('T')[0] : ''
      })));
    } else {
      setMilestones([{ description: '', targetAmount: '', targetDate: '' }]);
    }

    // Set action plan
    if (goal.actionPlan) {
      setActionPlanSteps(goal.actionPlan.steps || ['']);
      setResourcesNeeded(goal.actionPlan.resourcesNeeded || ['']);
    } else {
      setActionPlanSteps(['']);
      setResourcesNeeded(['']);
    }

    setIsGoalDialogOpen(true);
  };

  // Calculate completion percentage
  const calculateCompletion = () => {
    let completed = 0;
    let total = 5; // Base fields

    if (formData.description) completed++;
    if (formData.type) completed++;
    if (formData.targetAmount) completed++;
    if (formData.targetDate) completed++;

    // Milestones (at least one valid)
    const hasValidMilestone = milestones.some(m => m.description && m.targetAmount && m.targetDate);
    if (hasValidMilestone) completed++;

    // Optional fields bonus
    if (formData.notes) completed = Math.min(completed + 0.5, total);
    if (formData.timeline) completed = Math.min(completed + 0.5, total);
    if (actionPlanSteps.some(s => s)) completed = Math.min(completed + 0.5, total);
    if (resourcesNeeded.some(r => r)) completed = Math.min(completed + 0.5, total);

    setCompletion(Math.round((completed / total) * 100));
  };

  // Update completion on form changes
  useEffect(() => {
    calculateCompletion();
  }, [formData, milestones, actionPlanSteps, resourcesNeeded]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.description || !formData.type || !formData.targetAmount || !formData.targetDate) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);

    try {
      // Filter out empty milestones
      const validMilestones = milestones
        .filter(m => m.description.trim() !== '' && m.targetAmount && m.targetDate)
        .map(m => ({
          description: m.description,
          targetAmount: Number(m.targetAmount),
          targetDate: m.targetDate
        }));

      // Filter out empty steps and resources
      const validSteps = actionPlanSteps.filter(s => s.trim() !== '');
      const validResources = resourcesNeeded.filter(r => r.trim() !== '');

      // Construct DTO matching your API
      const payload: CreateGoalDto = {
        description: formData.description,
        type: formData.type as GoalType,
        targetAmount: Number(formData.targetAmount),
        targetDate: formData.targetDate,
        ...(formData.notes && { notes: formData.notes }),
        ...(validMilestones.length > 0 && { milestones: validMilestones }),
        ...((validSteps.length > 0 && validResources.length > 0 && formData.timeline) && {
          actionPlan: {
            steps: validSteps,
            resourcesNeeded: validResources,
            timeline: formData.timeline
          }
        })
      };

      if (editingGoal) {
        // Update existing goal
        await beneficiaryService.updateGoal(editingGoal.id, payload);
        toast.success('Goal updated successfully!', {
          description: 'Your goal has been updated.',
          icon: <Rocket className="w-5 h-5 text-teal-600" />
        });
      } else {
        // Create new goal
        await beneficiaryService.createGoal(payload);
        toast.success('Goal created successfully!', {
          description: 'Your new goal has been set. Start working towards it!',
          icon: <Rocket className="w-5 h-5 text-teal-600" />
        });
      }
      
      setIsGoalDialogOpen(false);
      resetForm();
      fetchGoals();
    } catch (error) {
      console.error("Failed to save goal", error);
      toast.error(editingGoal ? "Failed to update goal" : "Failed to create goal");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Milestone handlers
  const addMilestone = () => {
    setMilestones([...milestones, { description: '', targetAmount: '', targetDate: '' }]);
  };

  const updateMilestone = (index: number, field: keyof MilestoneInput, value: string) => {
    const newMilestones = [...milestones];
    newMilestones[index][field] = value;
    setMilestones(newMilestones);
  };

  const removeMilestone = (index: number) => {
    const newMilestones = milestones.filter((_, i) => i !== index);
    setMilestones(newMilestones.length === 0 ? [{ description: '', targetAmount: '', targetDate: '' }] : newMilestones);
  };

  // Array handlers
  const addArrayItem = (
    items: string[],
    setItems: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    setItems([...items, '']);
  };

  const updateArrayItem = (
    index: number,
    value: string,
    items: string[],
    setItems: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    const newItems = [...items];
    newItems[index] = value;
    setItems(newItems);
  };

  const removeArrayItem = (
    index: number,
    items: string[],
    setItems: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems.length === 0 ? [''] : newItems);
  };

  const getGoalIcon = (type: GoalType) => {
    switch (type) {
      case GoalType.FINANCIAL: return DollarSign;
      case GoalType.BUSINESS: return Briefcase;
      case GoalType.EDUCATION: return GraduationCap;
      case GoalType.PERSONAL: return User;
      case GoalType.SKILLS: return Lightbulb;
      default: return Target;
    }
  };

  const getGoalIconColor = (type: GoalType) => {
    switch (type) {
      case GoalType.FINANCIAL: return 'bg-emerald-100 text-emerald-600';
      case GoalType.BUSINESS: return 'bg-blue-100 text-blue-600';
      case GoalType.EDUCATION: return 'bg-purple-100 text-purple-600';
      case GoalType.PERSONAL: return 'bg-amber-100 text-amber-600';
      case GoalType.SKILLS: return 'bg-pink-100 text-pink-600';
      default: return 'bg-slate-100 text-slate-600';
    }
  };

  const getStatusConfig = (status: GoalStatus) => {
    const configs = {
      [GoalStatus.ACHIEVED]: {
        bg: 'bg-emerald-100',
        text: 'text-emerald-700',
        border: 'border-emerald-200',
        icon: CheckCircle2,
        label: 'Achieved'
      },
      [GoalStatus.IN_PROGRESS]: {
        bg: 'bg-blue-100',
        text: 'text-blue-700',
        border: 'border-blue-200',
        icon: TrendingUp,
        label: 'In Progress'
      },
      [GoalStatus.NOT_STARTED]: {
        bg: 'bg-slate-100',
        text: 'text-slate-600',
        border: 'border-slate-200',
        icon: Clock,
        label: 'Not Started'
      },
      [GoalStatus.ABANDONED]: {
        bg: 'bg-rose-100',
        text: 'text-rose-700',
        border: 'border-rose-200',
        icon: AlertCircle,
        label: 'Abandoned'
      }
    };
    return configs[status] || configs[GoalStatus.NOT_STARTED];
  };

  const formatDate = (date: string | Date) => {
    if (!date) return 'No deadline';
    return format(new Date(date), 'MMM d, yyyy');
  };

  const calculateProgress = (goal: BusinessGoal) => {
    const current = Number(goal.currentProgress) || 0;
    const target = Number(goal.targetAmount) || 1;
    return Math.min(Math.round((current / target) * 100), 100);
  };

  const groupGoalsByStatus = () => {
    const goalsArray = Array.isArray(goals) ? goals : [];

    return {
      [GoalStatus.IN_PROGRESS]: goalsArray.filter(g => g?.status === GoalStatus.IN_PROGRESS),
      [GoalStatus.NOT_STARTED]: goalsArray.filter(g => g?.status === GoalStatus.NOT_STARTED),
      [GoalStatus.ACHIEVED]: goalsArray.filter(g => g?.status === GoalStatus.ACHIEVED),
      [GoalStatus.ABANDONED]: goalsArray.filter(g => g?.status === GoalStatus.ABANDONED)
    };
  };

  const groupedGoals = groupGoalsByStatus();

  const stats = {
    total: Array.isArray(goals) ? goals.length : 0,
    inProgress: groupedGoals[GoalStatus.IN_PROGRESS]?.length || 0,
    achieved: groupedGoals[GoalStatus.ACHIEVED]?.length || 0,
    notStarted: groupedGoals[GoalStatus.NOT_STARTED]?.length || 0,
    successRate: Array.isArray(goals) && goals.length > 0
      ? Math.round(((groupedGoals[GoalStatus.ACHIEVED]?.length || 0) / goals.length) * 100)
      : 0
  };

  // Get selected goal type config for dialog
  const selectedType = formData.type as GoalType;
  const TypeIcon = selectedType ? goalTypeConfig[selectedType]?.icon : Target;

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
            <div className="relative">
              <div className="absolute inset-0 bg-teal-500/20 rounded-full blur-3xl animate-pulse" />
              <Target className="w-16 h-16 text-teal-600 relative animate-bounce" />
            </div>
            <p className="text-slate-500 animate-pulse">Loading your goals...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <motion.div
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
        className="min-h-screen bg-slate-50"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 space-y-6 sm:space-y-8">

          {/* Header */}
          <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-1 h-6 bg-teal-500 rounded-full"></div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 tracking-tight">
                  My Goals
                </h1>
                <Badge variant="outline" className="ml-2 text-xs font-medium bg-white/80">
                  {stats.total} Total
                </Badge>
              </div>
              <p className="text-sm sm:text-base text-slate-500 flex items-center gap-2 mt-1">
                <Target className="w-4 h-4" />
                <span>Track and achieve your personal and business milestones</span>
              </p>
            </div>

            <Button
              className="h-9 sm:h-10 px-4 sm:px-5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs sm:text-sm font-medium shadow-lg shadow-teal-600/20 transition-all active:scale-95"
              onClick={() => {
                resetForm();
                setIsGoalDialogOpen(true);
              }}
            >
              <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
              Create New Goal
            </Button>
          </motion.div>

          {/* Stats Cards */}
          <motion.div variants={fadeInUp} className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <Card className="border border-slate-200 bg-white">
              <CardContent className="p-4 sm:p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-slate-500 mb-1">Total Goals</p>
                    <p className="text-xl sm:text-2xl font-bold text-slate-900">
                      {stats.total}
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-teal-100">
                    <Target className="w-5 h-5 text-teal-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-slate-200 bg-white">
              <CardContent className="p-4 sm:p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-slate-500 mb-1">In Progress</p>
                    <p className="text-xl sm:text-2xl font-bold text-blue-600">
                      {stats.inProgress}
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-blue-100">
                    <TrendingUp className="w-5 h-5 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-slate-200 bg-white">
              <CardContent className="p-4 sm:p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-slate-500 mb-1">Achieved</p>
                    <p className="text-xl sm:text-2xl font-bold text-emerald-600">
                      {stats.achieved}
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-emerald-100">
                    <Award className="w-5 h-5 text-emerald-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-slate-200 bg-white">
              <CardContent className="p-4 sm:p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-slate-500 mb-1">Success Rate</p>
                    <p className="text-xl sm:text-2xl font-bold text-purple-600">
                      {stats.successRate}%
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-purple-100">
                    <Sparkles className="w-5 h-5 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Goals Tabs */}
          <motion.div variants={fadeInUp}>
            <Tabs defaultValue="all" className="space-y-6">
              <TabsList className="bg-white border border-slate-200 p-1">
                <TabsTrigger value="all" className="text-xs sm:text-sm">
                  All Goals ({stats.total})
                </TabsTrigger>
                <TabsTrigger value="in-progress" className="text-xs sm:text-sm">
                  In Progress ({stats.inProgress})
                </TabsTrigger>
                <TabsTrigger value="not-started" className="text-xs sm:text-sm">
                  Not Started ({stats.notStarted})
                </TabsTrigger>
                <TabsTrigger value="achieved" className="text-xs sm:text-sm">
                  Achieved ({stats.achieved})
                </TabsTrigger>
              </TabsList>

              {/* All Goals Tab */}
              <TabsContent value="all" className="mt-6">
                {!Array.isArray(goals) || goals.length === 0 ? (
                  <EmptyState onAdd={() => {
                    resetForm();
                    setIsGoalDialogOpen(true);
                  }} />
                ) : (
                  <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                    <AnimatePresence mode="popLayout">
                      {goals.map((goal) => (
                        <GoalCard
                          key={goal.id}
                          goal={goal}
                          onView={() => {
                            setSelectedGoal(goal);
                            setIsDetailsOpen(true);
                          }}
                          onEdit={() => openEditDialog(goal)}
                        />
                      ))}
                    </AnimatePresence>
                  </div>
                )}
              </TabsContent>

              {/* In Progress Tab */}
              <TabsContent value="in-progress" className="mt-6">
                {!Array.isArray(groupedGoals[GoalStatus.IN_PROGRESS]) || groupedGoals[GoalStatus.IN_PROGRESS].length === 0 ? (
                  <EmptyState onAdd={() => {
                    resetForm();
                    setIsGoalDialogOpen(true);
                  }} message="No goals in progress" />
                ) : (
                  <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                    {groupedGoals[GoalStatus.IN_PROGRESS].map((goal) => (
                      <GoalCard
                        key={goal.id}
                        goal={goal}
                        onView={() => {
                          setSelectedGoal(goal);
                          setIsDetailsOpen(true);
                        }}
                        onEdit={() => openEditDialog(goal)}
                      />
                    ))}
                  </div>
                )}
              </TabsContent>

              {/* Not Started Tab */}
              <TabsContent value="not-started" className="mt-6">
                {!Array.isArray(groupedGoals[GoalStatus.NOT_STARTED]) || groupedGoals[GoalStatus.NOT_STARTED].length === 0 ? (
                  <EmptyState onAdd={() => {
                    resetForm();
                    setIsGoalDialogOpen(true);
                  }} message="No pending goals" />
                ) : (
                  <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                    {groupedGoals[GoalStatus.NOT_STARTED].map((goal) => (
                      <GoalCard
                        key={goal.id}
                        goal={goal}
                        onView={() => {
                          setSelectedGoal(goal);
                          setIsDetailsOpen(true);
                        }}
                        onEdit={() => openEditDialog(goal)}
                      />
                    ))}
                  </div>
                )}
              </TabsContent>

              {/* Achieved Tab */}
              <TabsContent value="achieved" className="mt-6">
                {!Array.isArray(groupedGoals[GoalStatus.ACHIEVED]) || groupedGoals[GoalStatus.ACHIEVED].length === 0 ? (
                  <EmptyState onAdd={() => {
                    resetForm();
                    setIsGoalDialogOpen(true);
                  }} message="No achieved goals yet" />
                ) : (
                  <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                    {groupedGoals[GoalStatus.ACHIEVED].map((goal) => (
                      <GoalCard
                        key={goal.id}
                        goal={goal}
                        onView={() => {
                          setSelectedGoal(goal);
                          setIsDetailsOpen(true);
                        }}
                        onEdit={() => openEditDialog(goal)}
                      />
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>

        {/* Goal Details Dialog */}
        <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            {selectedGoal && (
              <>
                <DialogHeader>
                  <DialogTitle className="text-xl font-bold flex items-center gap-2">
                    <div className={cn("p-2 rounded-lg", getGoalIconColor(selectedGoal.type))}>
                      {(() => {
                        const Icon = getGoalIcon(selectedGoal.type);
                        return <Icon className="w-5 h-5" />;
                      })()}
                    </div>
                    Goal Details
                  </DialogTitle>
                  <DialogDescription>
                    {selectedGoal.description}
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                  {/* Progress Section */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-slate-500">Progress</span>
                      <span className="text-sm font-bold text-teal-600">
                        {calculateProgress(selectedGoal)}%
                      </span>
                    </div>
                    <Progress value={calculateProgress(selectedGoal)} className="h-2" />
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span>{Number(selectedGoal.currentProgress).toLocaleString()} RWF</span>
                      <span>{Number(selectedGoal.targetAmount).toLocaleString()} RWF</span>
                    </div>
                  </div>

                  {/* Milestones */}
                  {selectedGoal.milestones && selectedGoal.milestones.length > 0 && (
                    <div className="space-y-3">
                      <h3 className="text-sm font-semibold flex items-center gap-2">
                        <ListChecks className="w-4 h-4 text-teal-600" />
                        Milestones
                      </h3>
                      <div className="space-y-2">
                        {selectedGoal.milestones.map((milestone, index) => (
                          <div key={index} className="p-3 bg-slate-50 rounded-lg">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm font-medium">{milestone.description}</span>
                              <Badge variant="outline" className="text-[10px]">
                                {formatDate(milestone.targetDate)}
                              </Badge>
                            </div>
                            <p className="text-xs text-slate-500">
                              Target: {milestone.targetAmount.toLocaleString()} RWF
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Action Plan */}
                  {selectedGoal.actionPlan && (
                    <div className="space-y-3">
                      <h3 className="text-sm font-semibold flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-teal-600" />
                        Action Plan
                      </h3>
                      <div className="p-4 bg-slate-50 rounded-lg space-y-3">
                        {selectedGoal.actionPlan.steps && (
                          <div>
                            <p className="text-xs font-medium text-slate-500 mb-2">Steps:</p>
                            <ul className="space-y-1">
                              {selectedGoal.actionPlan.steps.map((step, idx) => (
                                <li key={idx} className="text-xs flex items-start gap-2">
                                  <span className="text-teal-600 mt-0.5">•</span>
                                  {step}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {selectedGoal.actionPlan.timeline && (
                          <div className="flex items-center gap-2 text-xs">
                            <Clock className="w-3 h-3 text-slate-400" />
                            <span>Timeline: {selectedGoal.actionPlan.timeline}</span>
                          </div>
                        )}
                        {selectedGoal.actionPlan.resourcesNeeded && (
                          <div>
                            <p className="text-xs font-medium text-slate-500 mb-1">Resources Needed:</p>
                            <div className="flex flex-wrap gap-1">
                              {selectedGoal.actionPlan.resourcesNeeded.map((resource, idx) => (
                                <Badge key={idx} variant="outline" className="text-[10px]">
                                  {resource}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Notes */}
                  {selectedGoal.notes && (
                    <div className="space-y-2">
                      <h3 className="text-sm font-semibold flex items-center gap-2">
                        <FileText className="w-4 h-4 text-teal-600" />
                        Notes
                      </h3>
                      <p className="text-sm text-slate-600 p-3 bg-slate-50 rounded-lg">
                        {selectedGoal.notes}
                      </p>
                    </div>
                  )}

                  {/* Dates */}
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-200">
                    <div>
                      <p className="text-xs text-slate-500">Target Date</p>
                      <p className="text-sm font-medium flex items-center gap-1 mt-1">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        {formatDate(selectedGoal.targetDate)}
                      </p>
                    </div>
                    {selectedGoal.completedAt && (
                      <div>
                        <p className="text-xs text-slate-500">Completed On</p>
                        <p className="text-sm font-medium flex items-center gap-1 mt-1 text-emerald-600">
                          <CheckCircle2 className="w-4 h-4" />
                          {formatDate(selectedGoal.completedAt)}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>

        {/* Create/Edit Goal Dialog */}
        <Dialog open={isGoalDialogOpen} onOpenChange={(open) => {
          if (!open) resetForm();
          setIsGoalDialogOpen(open);
        }}>
          <DialogContent className="sm:max-w-[800px] w-[95%] md:w-full p-0">
            <div className="flex flex-col" style={{ maxHeight: '90vh' }}>
              {/* Fixed Header */}
              <div className="px-6 py-4 border-b">
                <DialogHeader>
                  <DialogTitle className="text-xl font-bold flex items-center gap-2">
                    <div className={cn(
                      "p-2 rounded-lg",
                      selectedType ? goalTypeConfig[selectedType]?.color : 'bg-teal-100 text-teal-600'
                    )}>
                      <TypeIcon className="w-4 h-4" />
                    </div>
                    {editingGoal ? 'Edit Goal' : 'Create New Goal'}
                  </DialogTitle>
                  <DialogDescription>
                    {editingGoal ? 'Update your goal details' : 'Set a new target and track your progress'}
                  </DialogDescription>
                </DialogHeader>
              </div>

              {/* Scrollable Content */}
              <div className="overflow-y-auto flex-1 p-6">
                <form id="goal-form" onSubmit={handleSubmit} className="space-y-6">
                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-slate-500">Form Completion</span>
                      <span className="text-xs font-bold text-teal-600">{completion}%</span>
                    </div>
                    <Progress value={completion} className="h-1.5" />
                  </div>

                  {/* Goal Details */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <div className="w-1 h-5 bg-teal-500 rounded-full"></div>
                      <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider">
                        Goal Details
                      </h3>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="description" className="text-sm font-medium">
                          Goal Description <span className="text-red-500">*</span>
                        </Label>
                        <Textarea
                          id="description"
                          placeholder="Describe your goal in detail... e.g., Save 100,000 RWF to buy a sewing machine"
                          rows={3}
                          value={formData.description}
                          onChange={(e) => handleChange('description', e.target.value)}
                          className="resize-none border-slate-200 focus:border-teal-500 focus:ring-teal-500/20"
                          required
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="type" className="text-sm font-medium">
                            Category <span className="text-red-500">*</span>
                          </Label>
                          <Select
                            value={formData.type}
                            onValueChange={(value) => handleChange('type', value)}
                            required
                          >
                            <SelectTrigger className="border-slate-200">
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.entries(goalTypeConfig).map(([value, config]) => {
                                const Icon = config.icon;
                                return (
                                  <SelectItem key={value} value={value}>
                                    <div className="flex items-center gap-2">
                                      <div className={cn("p-1 rounded", config.color)}>
                                        <Icon className="w-3 h-3" />
                                      </div>
                                      <span>{config.label}</span>
                                    </div>
                                  </SelectItem>
                                );
                              })}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="targetAmount" className="text-sm font-medium">
                            Target Amount (RWF) <span className="text-red-500">*</span>
                          </Label>
                          <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <Input
                              id="targetAmount"
                              type="number"
                              placeholder="100000"
                              min="0"
                              step="1000"
                              className="pl-9 border-slate-200 focus:border-teal-500 focus:ring-teal-500/20"
                              value={formData.targetAmount}
                              onChange={(e) => handleChange('targetAmount', e.target.value)}
                              required
                            />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="targetDate" className="text-sm font-medium">
                          Target Date <span className="text-red-500">*</span>
                        </Label>
                        <div className="relative">
                          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                          <Input
                            id="targetDate"
                            type="date"
                            className="pl-9 border-slate-200 focus:border-teal-500 focus:ring-teal-500/20"
                            value={formData.targetDate}
                            onChange={(e) => handleChange('targetDate', e.target.value)}
                            min={new Date().toISOString().split('T')[0]}
                            required
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Milestones */}
                  <div className="space-y-4 pt-4 border-t border-slate-100">
                    <div className="flex items-center gap-2">
                      <div className="w-1 h-5 bg-amber-500 rounded-full"></div>
                      <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider">
                        Milestones
                      </h3>
                    </div>

                    <div className="space-y-4">
                      <AnimatePresence>
                        {milestones.map((milestone, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="p-4 bg-slate-50 rounded-xl border border-slate-200"
                          >
                            <div className="flex justify-between items-start mb-3">
                              <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 text-[10px]">
                                Milestone {index + 1}
                              </Badge>
                              {milestones.length > 1 && (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6 text-slate-400 hover:text-red-500"
                                  onClick={() => removeMilestone(index)}
                                >
                                  <X className="w-3.5 h-3.5" />
                                </Button>
                              )}
                            </div>

                            <div className="space-y-3">
                              <Input
                                placeholder="Description"
                                className="h-9 text-sm border-slate-200"
                                value={milestone.description}
                                onChange={(e) => updateMilestone(index, 'description', e.target.value)}
                              />
                              <div className="grid grid-cols-2 gap-2">
                                <div className="relative">
                                  <DollarSign className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-slate-400" />
                                  <Input
                                    type="number"
                                    placeholder="Amount"
                                    className="pl-7 h-9 text-sm border-slate-200"
                                    value={milestone.targetAmount}
                                    onChange={(e) => updateMilestone(index, 'targetAmount', e.target.value)}
                                  />
                                </div>
                                <Input
                                  type="date"
                                  className="h-9 text-sm border-slate-200"
                                  value={milestone.targetDate}
                                  onChange={(e) => updateMilestone(index, 'targetDate', e.target.value)}
                                />
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </AnimatePresence>

                      <Button
                        type="button"
                        variant="outline"
                        className="w-full border-dashed border-slate-300 hover:border-teal-500 hover:bg-teal-50 transition-all"
                        onClick={addMilestone}
                      >
                        <Plus className="w-4 h-4 mr-2" /> Add Milestone
                      </Button>
                    </div>
                  </div>

                  {/* Action Plan */}
                  <div className="space-y-4 pt-4 border-t border-slate-100">
                    <div className="flex items-center gap-2">
                      <div className="w-1 h-5 bg-indigo-500 rounded-full"></div>
                      <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider">
                        Action Plan
                      </h3>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-3">
                        <Label className="text-sm font-medium">Action Steps</Label>
                        <AnimatePresence>
                          {actionPlanSteps.map((step, index) => (
                            <motion.div
                              key={index}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: 20 }}
                              className="flex gap-2"
                            >
                              <div className="flex-1 relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-400">
                                  {index + 1}.
                                </span>
                                <Input
                                  placeholder={`Step ${index + 1}`}
                                  value={step}
                                  onChange={(e) => updateArrayItem(index, e.target.value, actionPlanSteps, setActionPlanSteps)}
                                  className="pl-8 border-slate-200"
                                />
                              </div>
                              {actionPlanSteps.length > 1 && (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="h-10 w-10 text-slate-400 hover:text-red-500 hover:bg-red-50"
                                  onClick={() => removeArrayItem(index, actionPlanSteps, setActionPlanSteps)}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              )}
                            </motion.div>
                          ))}
                        </AnimatePresence>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => addArrayItem(actionPlanSteps, setActionPlanSteps)}
                          className="border-dashed border-slate-300 w-full"
                        >
                          <Plus className="w-3.5 h-3.5 mr-2" /> Add Step
                        </Button>
                      </div>

                      <div className="space-y-3">
                        <Label className="text-sm font-medium">Resources Needed</Label>
                        <AnimatePresence>
                          {resourcesNeeded.map((resource, index) => (
                            <motion.div
                              key={index}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: 20 }}
                              className="flex gap-2"
                            >
                              <Input
                                placeholder={`Resource ${index + 1}`}
                                value={resource}
                                onChange={(e) => updateArrayItem(index, e.target.value, resourcesNeeded, setResourcesNeeded)}
                                className="border-slate-200"
                              />
                              {resourcesNeeded.length > 1 && (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="h-10 w-10 text-slate-400 hover:text-red-500 hover:bg-red-50"
                                  onClick={() => removeArrayItem(index, resourcesNeeded, setResourcesNeeded)}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              )}
                            </motion.div>
                          ))}
                        </AnimatePresence>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => addArrayItem(resourcesNeeded, setResourcesNeeded)}
                          className="border-dashed border-slate-300 w-full"
                        >
                          <Plus className="w-3.5 h-3.5 mr-2" /> Add Resource
                        </Button>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="timeline" className="text-sm font-medium">
                          Timeline Overview
                        </Label>
                        <Input
                          id="timeline"
                          value={formData.timeline}
                          onChange={(e) => handleChange('timeline', e.target.value)}
                          placeholder="e.g., 5 months, 12 weeks, etc."
                          className="border-slate-200"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Additional Notes */}
                  <div className="space-y-4 pt-4 border-t border-slate-100">
                    <div className="flex items-center gap-2">
                      <div className="w-1 h-5 bg-purple-500 rounded-full"></div>
                      <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider">
                        Additional Notes
                      </h3>
                    </div>

                    <Textarea
                      placeholder="e.g., Will save 5,000 RWF per week from business profits..."
                      className="min-h-[80px] border-slate-200 resize-none"
                      value={formData.notes}
                      onChange={(e) => handleChange('notes', e.target.value)}
                    />
                  </div>

                  {/* Tips */}
                  <div className="p-4 bg-teal-50/50 rounded-xl border border-teal-100">
                    <div className="flex items-start gap-3">
                      <HelpCircle className="w-5 h-5 text-teal-600 flex-shrink-0 mt-0.5" />
                      <div className="space-y-1">
                        <p className="text-xs font-medium text-teal-800">Pro Tips</p>
                        <ul className="text-xs text-teal-600 space-y-1 list-disc list-inside">
                          <li>Set realistic milestones to stay motivated</li>
                          <li>Break down your action plan into weekly tasks</li>
                          <li>Review your progress regularly</li>
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
                    setIsGoalDialogOpen(false);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  form="goal-form"
                  disabled={isSubmitting}
                  className="bg-teal-600 hover:bg-teal-700 text-white"
                >
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {editingGoal ? 'Update Goal' : 'Create Goal'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </motion.div>
    </TooltipProvider>
  );
}

// Goal Card Component
function GoalCard({ goal, onView, onEdit }: { goal: BusinessGoal; onView: () => void; onEdit: () => void }) {
  const Icon = getGoalIcon(goal.type);
  const iconColor = getGoalIconColor(goal.type);
  const statusConfig = getStatusConfig(goal.status);
  const StatusIcon = statusConfig.icon;
  const progress = calculateProgress(goal);
  const daysUntil = goal.targetDate
    ? Math.ceil((new Date(goal.targetDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : null;
  const isOverdue = daysUntil !== null && daysUntil < 0;

  return (
    <motion.div
      variants={fadeInUp}
      layout
      className="group"
    >
      <Card className="h-full border border-slate-200 bg-white hover:shadow-xl transition-all duration-300 hover:scale-[1.02] overflow-hidden">
        <CardHeader className="p-5 pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className={cn("p-2.5 rounded-xl", iconColor)}>
                <Icon className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <CardTitle className="text-base font-bold line-clamp-1">
                  {goal.description}
                </CardTitle>
                <CardDescription className="text-xs">
                  Target: {Number(goal.targetAmount).toLocaleString()} RWF
                </CardDescription>
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 -mt-1 -mr-2">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuLabel className="text-xs">Actions</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onView}>
                  <Target className="w-4 h-4 mr-2" />
                  View Details
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onEdit}>
                  <Pencil className="w-4 h-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-red-600">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>

        <CardContent className="p-5 pt-0 space-y-4">
          {/* Progress Bar */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">Progress</span>
              <span className="font-medium">{progress}%</span>
            </div>
            <Progress value={progress} className="h-1.5" />
          </div>

          {/* Status and Deadline */}
          <div className="flex items-center justify-between">
            <Badge className={cn(
              "rounded-full px-2 py-0.5 text-[10px] font-medium border",
              statusConfig.bg,
              statusConfig.text,
              statusConfig.border
            )}>
              <StatusIcon className="w-3 h-3 mr-1 inline-block" />
              {statusConfig.label}
            </Badge>

            {daysUntil !== null && (
              <div className={`flex items-center gap-1 text-xs ${isOverdue ? 'text-rose-600' : 'text-slate-500'}`}>
                <Clock className="w-3 h-3" />
                {isOverdue ? 'Overdue' : `${daysUntil} days left`}
              </div>
            )}
          </div>

          {/* Milestones Preview */}
          {goal.milestones && goal.milestones.length > 0 && (
            <div className="pt-3 border-t border-slate-100">
              <div className="flex items-center gap-1 text-[10px] text-slate-500 mb-1">
                <ListChecks className="w-3 h-3" />
                <span>{goal.milestones.length} Milestones</span>
              </div>
              <div className="flex items-center gap-1">
                {goal.milestones.slice(0, 3).map((_, idx) => (
                  <div key={idx} className="w-1.5 h-1.5 rounded-full bg-teal-400" />
                ))}
                {goal.milestones.length > 3 && (
                  <span className="text-[8px] text-slate-400">+{goal.milestones.length - 3}</span>
                )}
              </div>
            </div>
          )}

          {/* View Button */}
          <Button
            variant="outline"
            size="sm"
            className="w-full mt-2 text-xs border-slate-200 hover:bg-teal-50 hover:text-teal-600 hover:border-teal-200 transition-all"
            onClick={onView}
          >
            View Details
            <ChevronRight className="w-3 h-3 ml-1" />
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Empty State Component
function EmptyState({ onAdd, message = "No goals yet" }: { onAdd: () => void; message?: string }) {
  return (
    <Card className="border-dashed border-2 border-slate-200 bg-slate-50/50">
      <CardContent className="py-12 flex flex-col items-center text-center">
        <div className="relative mb-4">
          <div className="absolute inset-0 bg-white rounded-full blur-3xl" />
          <Target className="w-16 h-16 text-slate-300 relative" />
        </div>
        <h3 className="text-lg font-semibold text-slate-900 mb-2">{message}</h3>
        <p className="text-sm text-slate-500 max-w-sm mb-6">
          Set your first goal to start tracking your progress and achievements.
        </p>
        <Button onClick={onAdd} className="bg-teal-600 hover:bg-teal-700 text-white">
          <Plus className="w-4 h-4 mr-2" />
          Create Your First Goal
        </Button>
      </CardContent>
    </Card>
  );
}

// Helper functions (these need to be accessible to GoalCard)
function getGoalIcon(type: GoalType) {
  switch (type) {
    case GoalType.FINANCIAL: return DollarSign;
    case GoalType.BUSINESS: return Briefcase;
    case GoalType.EDUCATION: return GraduationCap;
    case GoalType.PERSONAL: return User;
    case GoalType.SKILLS: return Lightbulb;
    default: return Target;
  }
}

function getGoalIconColor(type: GoalType) {
  switch (type) {
    case GoalType.FINANCIAL: return 'bg-emerald-100 text-emerald-600';
    case GoalType.BUSINESS: return 'bg-blue-100 text-blue-600';
    case GoalType.EDUCATION: return 'bg-purple-100 text-purple-600';
    case GoalType.PERSONAL: return 'bg-amber-100 text-amber-600';
    case GoalType.SKILLS: return 'bg-pink-100 text-pink-600';
    default: return 'bg-slate-100 text-slate-600';
  }
}

function getStatusConfig(status: GoalStatus) {
  const configs = {
    [GoalStatus.ACHIEVED]: {
      bg: 'bg-emerald-100',
      text: 'text-emerald-700',
      border: 'border-emerald-200',
      icon: CheckCircle2,
      label: 'Achieved'
    },
    [GoalStatus.IN_PROGRESS]: {
      bg: 'bg-blue-100',
      text: 'text-blue-700',
      border: 'border-blue-200',
      icon: TrendingUp,
      label: 'In Progress'
    },
    [GoalStatus.NOT_STARTED]: {
      bg: 'bg-slate-100',
      text: 'text-slate-600',
      border: 'border-slate-200',
      icon: Clock,
      label: 'Not Started'
    },
    [GoalStatus.ABANDONED]: {
      bg: 'bg-rose-100',
      text: 'text-rose-700',
      border: 'border-rose-200',
      icon: AlertCircle,
      label: 'Abandoned'
    }
  };
  return configs[status] || configs[GoalStatus.NOT_STARTED];
}

function calculateProgress(goal: BusinessGoal) {
  const current = Number(goal.currentProgress) || 0;
  const target = Number(goal.targetAmount) || 1;
  return Math.min(Math.round((current / target) * 100), 100);
}