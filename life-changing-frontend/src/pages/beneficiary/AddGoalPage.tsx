import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  ArrowLeft,
  Target,
  Loader2,
  Plus,
  Trash2,
  Calendar,
  DollarSign,
  ListChecks,
  BookOpen,
  FileText,
  Sparkles,
  TrendingUp,
  Award,
  Clock,
  AlertCircle,
  CheckCircle2,
  Lightbulb,
  Briefcase,
  GraduationCap,
  User,
  Save,
  X,
  HelpCircle,
  Rocket,
  Zap
} from 'lucide-react';
import { toast } from 'sonner';
import { GoalType, CreateGoalDto } from '@/lib/types';
import { beneficiaryService } from '@/services/beneficiary.service';
import { cn } from '@/lib/utils';

interface MilestoneInput {
  description: string;
  targetAmount: string;
  targetDate: string;
}

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

export default function AddGoalPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
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

    setIsLoading(true);

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

      await beneficiaryService.createGoal(payload);
      toast.success('Goal created successfully!', {
        description: 'Your new goal has been set. Start working towards it!',
        icon: <Rocket className="w-5 h-5 text-teal-600" />
      });
      navigate('/beneficiary/goals');
    } catch (error) {
      console.error("Failed to create goal", error);
      toast.error("Failed to create goal. Please try again.");
    } finally {
      setIsLoading(false);
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

  // Get selected goal type config
  const selectedType = formData.type as GoalType;
  const TypeIcon = selectedType ? goalTypeConfig[selectedType]?.icon : Target;

  return (
    <TooltipProvider>
      <motion.div
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
        className="min-h-screen bg-white dark:from-slate-950 dark:via-slate-900 dark:to-teal-950/20"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">

          {/* Header with Back Button */}
          <motion.div variants={fadeInUp} className="flex items-center gap-4 mb-6">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/beneficiary/goals')}
              className="rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 h-10 w-10"
            >
              <ArrowLeft className="w-5 h-5 text-slate-600 dark:text-slate-400" />
            </Button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                  Create New Goal
                </h1>
                {selectedType && (
                  <Badge className={cn(
                    "ml-2 px-3 py-1 text-xs font-medium",
                    goalTypeConfig[selectedType]?.color
                  )}>
                    <TypeIcon className="w-3 h-3 mr-1" />
                    {goalTypeConfig[selectedType]?.label}
                  </Badge>
                )}
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-2 mt-1">
                <Target className="w-4 h-4" />
                <span>Set a new target and track your progress</span>
              </p>
            </div>
          </motion.div>

          {/* Progress Bar */}
          <motion.div variants={fadeInUp} className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-slate-500">Profile Completion</span>
              <span className="text-xs font-bold text-teal-600">{completion}%</span>
            </div>
            <Progress value={completion} className="h-1.5" />
          </motion.div>

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Column - 2/3 width */}
              <div className="lg:col-span-2 space-y-6">

                {/* Goal Details Card */}
                <motion.div variants={fadeInUp}>
                  <Card className="border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl overflow-hidden">
                    <div className={cn(
                      "h-1 w-full bg-gradient-to-r",
                      selectedType ? goalTypeConfig[selectedType]?.gradient : 'from-teal-500/50 to-blue-500/50'
                    )} />
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <div className={cn(
                          "p-2 rounded-lg",
                          selectedType ? goalTypeConfig[selectedType]?.color : 'bg-teal-100 text-teal-600'
                        )}>
                          <Target className="w-4 h-4" />
                        </div>
                        Goal Details
                      </CardTitle>
                      <CardDescription>Define what you want to achieve</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">

                      {/* Description */}
                      <div className="space-y-2">
                        <Label htmlFor="description" className="text-sm font-medium">
                          Goal Description <span className="text-red-500">*</span>
                        </Label>
                        <Textarea
                          id="description"
                          placeholder="Describe your goal in detail... e.g., Save 100,000 RWF to buy a sewing machine"
                          rows={4}
                          value={formData.description}
                          onChange={(e) => handleChange('description', e.target.value)}
                          className="resize-none border-slate-200 dark:border-slate-700 focus:border-teal-500 focus:ring-teal-500/20"
                          required
                        />
                        <p className="text-xs text-slate-500">
                          Be specific and include what success looks like
                        </p>
                      </div>

                      {/* Type and Amount */}
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
                            <SelectTrigger className="border-slate-200 dark:border-slate-700">
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.entries(goalTypeConfig).map(([value, config]) => {
                                const Icon = config.icon;
                                return (
                                  <SelectItem key={value} value={value} className="cursor-pointer">
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
                          {selectedType && (
                            <p className="text-xs text-slate-500 mt-1">
                              {goalTypeConfig[selectedType]?.description}
                            </p>
                          )}
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
                              className="pl-9 border-slate-200 dark:border-slate-700 focus:border-teal-500 focus:ring-teal-500/20"
                              value={formData.targetAmount}
                              onChange={(e) => handleChange('targetAmount', e.target.value)}
                              required
                            />
                          </div>
                        </div>
                      </div>

                      {/* Target Date */}
                      <div className="space-y-2">
                        <Label htmlFor="targetDate" className="text-sm font-medium">
                          Target Date <span className="text-red-500">*</span>
                        </Label>
                        <div className="relative">
                          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                          <Input
                            id="targetDate"
                            type="date"
                            className="pl-9 border-slate-200 dark:border-slate-700 focus:border-teal-500 focus:ring-teal-500/20"
                            value={formData.targetDate}
                            onChange={(e) => handleChange('targetDate', e.target.value)}
                            min={new Date().toISOString().split('T')[0]}
                            required
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Action Plan Card */}
                <motion.div variants={fadeInUp}>
                  <Card className="border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <div className="p-2 rounded-lg bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400">
                          <BookOpen className="w-4 h-4" />
                        </div>
                        Action Plan
                      </CardTitle>
                      <CardDescription>Break down your goal into actionable steps</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">

                      {/* Steps */}
                      <div className="space-y-3">
                        <Label className="text-sm font-medium flex items-center gap-2">
                          <ListChecks className="w-4 h-4 text-indigo-600" />
                          Action Steps
                        </Label>
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
                                  className="pl-8 border-slate-200 dark:border-slate-700"
                                />
                              </div>
                              {actionPlanSteps.length > 1 && (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="icon"
                                      className="h-10 w-10 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20"
                                      onClick={() => removeArrayItem(index, actionPlanSteps, setActionPlanSteps)}
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>Remove step</TooltipContent>
                                </Tooltip>
                              )}
                            </motion.div>
                          ))}
                        </AnimatePresence>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => addArrayItem(actionPlanSteps, setActionPlanSteps)}
                          className="border-dashed border-slate-300 dark:border-slate-700 w-full"
                        >
                          <Plus className="w-3.5 h-3.5 mr-2" /> Add Step
                        </Button>
                      </div>

                      {/* Resources */}
                      <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                        <Label className="text-sm font-medium flex items-center gap-2">
                          <Zap className="w-4 h-4 text-amber-600" />
                          Resources Needed
                        </Label>
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
                                className="border-slate-200 dark:border-slate-700"
                              />
                              {resourcesNeeded.length > 1 && (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="icon"
                                      className="h-10 w-10 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20"
                                      onClick={() => removeArrayItem(index, resourcesNeeded, setResourcesNeeded)}
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>Remove resource</TooltipContent>
                                </Tooltip>
                              )}
                            </motion.div>
                          ))}
                        </AnimatePresence>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => addArrayItem(resourcesNeeded, setResourcesNeeded)}
                          className="border-dashed border-slate-300 dark:border-slate-700 w-full"
                        >
                          <Plus className="w-3.5 h-3.5 mr-2" /> Add Resource
                        </Button>
                      </div>

                      {/* Timeline */}
                      <div className="space-y-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                        <Label htmlFor="timeline" className="text-sm font-medium flex items-center gap-2">
                          <Clock className="w-4 h-4 text-blue-600" />
                          Timeline Overview
                        </Label>
                        <Input
                          id="timeline"
                          value={formData.timeline}
                          onChange={(e) => handleChange('timeline', e.target.value)}
                          placeholder="e.g., 5 months, 12 weeks, etc."
                          className="border-slate-200 dark:border-slate-700"
                        />
                        <p className="text-xs text-slate-500">
                          Optional: Provide an estimated timeline for your goal
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>

              {/* Sidebar Column - 1/3 width */}
              <div className="space-y-6">

                {/* Milestones Card */}
                <motion.div variants={fadeInUp}>
                  <Card className="border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <div className="p-2 rounded-lg bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400">
                          <ListChecks className="w-4 h-4" />
                        </div>
                        Milestones
                      </CardTitle>
                      <CardDescription>Break your goal into smaller steps</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                      <AnimatePresence>
                        {milestones.map((milestone, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all"
                          >
                            <div className="flex justify-between items-start mb-3">
                              <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 text-[10px]">
                                Milestone {index + 1}
                              </Badge>
                              {milestones.length > 1 && (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="icon"
                                      className="h-6 w-6 -mt-1 -mr-2 text-slate-400 hover:text-red-500"
                                      onClick={() => removeMilestone(index)}
                                    >
                                      <X className="w-3.5 h-3.5" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>Remove milestone</TooltipContent>
                                </Tooltip>
                              )}
                            </div>

                            <div className="space-y-3">
                              <Input
                                placeholder="Description"
                                className="h-9 text-sm border-slate-200 dark:border-slate-700"
                                value={milestone.description}
                                onChange={(e) => updateMilestone(index, 'description', e.target.value)}
                              />

                              <div className="grid grid-cols-2 gap-2">
                                <div className="relative">
                                  <DollarSign className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-slate-400" />
                                  <Input
                                    type="number"
                                    placeholder="Amount"
                                    className="pl-7 h-9 text-sm border-slate-200 dark:border-slate-700"
                                    value={milestone.targetAmount}
                                    onChange={(e) => updateMilestone(index, 'targetAmount', e.target.value)}
                                  />
                                </div>
                                <Input
                                  type="date"
                                  className="h-9 text-sm border-slate-200 dark:border-slate-700"
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
                        className="w-full border-dashed border-slate-300 dark:border-slate-700 hover:border-teal-500 hover:bg-teal-50 dark:hover:bg-teal-950/20 transition-all"
                        onClick={addMilestone}
                      >
                        <Plus className="w-4 h-4 mr-2" /> Add Milestone
                      </Button>

                      <p className="text-xs text-slate-500 text-center mt-2">
                        Milestones help you track progress along the way
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Notes Card */}
                <motion.div variants={fadeInUp}>
                  <Card className="border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <div className="p-2 rounded-lg bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400">
                          <FileText className="w-4 h-4" />
                        </div>
                        Additional Notes
                      </CardTitle>
                      <CardDescription>Any extra details to remember</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Textarea
                        placeholder="e.g., Will save 5,000 RWF per week from business profits..."
                        className="min-h-[120px] border-slate-200 dark:border-slate-700 resize-none"
                        value={formData.notes}
                        onChange={(e) => handleChange('notes', e.target.value)}
                      />
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Submit Actions */}
                <motion.div variants={fadeInUp} className="space-y-3 pt-4">
                  <Button
                    type="submit"
                    className="w-full h-11 bg-white hover:from-teal-700 hover:to-teal-600 text-white font-medium shadow-lg shadow-teal-600/20 transition-all active:scale-[0.98]"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating Goal...
                      </>
                    ) : (
                      <>
                        <Rocket className="mr-2 h-4 w-4" />
                        Create Goal
                      </>
                    )}
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    className="w-full h-11 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                    onClick={() => navigate('/beneficiary/goals')}
                  >
                    <X className="mr-2 h-4 w-4" />
                    Cancel
                  </Button>

                  {/* Tips */}
                  <div className="mt-6 p-4 bg-teal-50/50 dark:bg-teal-950/20 rounded-xl border border-teal-100 dark:border-teal-900/30">
                    <div className="flex items-start gap-3">
                      <HelpCircle className="w-5 h-5 text-teal-600 flex-shrink-0 mt-0.5" />
                      <div className="space-y-1">
                        <p className="text-xs font-medium text-teal-800 dark:text-teal-300">Pro Tips</p>
                        <ul className="text-xs text-teal-600 dark:text-teal-400 space-y-1 list-disc list-inside">
                          <li>Set realistic milestones to stay motivated</li>
                          <li>Break down your action plan into weekly tasks</li>
                          <li>Review your progress regularly</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </form>
        </div>
      </motion.div>
    </TooltipProvider>
  );
}