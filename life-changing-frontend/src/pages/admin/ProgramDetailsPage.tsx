import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { programsService } from '@/services/programs.service';
import { PageHeader } from '@/components/layout/PageHeader';
import { PageSkeleton } from '@/components/Skeletons';
import { Program, Project, CreateProjectDto, ProgramCategory, ProgramStatus, LocationDto, BeneficiaryStatus } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { DropZone } from '@/components/ui/drop-zone';
import { MultiFileDropZone } from '@/components/ui/multi-file-drop-zone';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import {
    ArrowLeft,
    Plus,
    Edit,
    Trash2,
    MoreVertical,
    Loader2,
    Calendar,
    DollarSign,
    Users,
    FolderKanban,
    Target,
    Globe,
    Clock,
    CheckCircle,
    Award,
    Archive,
    TrendingUp,
    Heart,
    BookOpen,
    Video,
    Image as ImageIcon,
    MapPin,
    Phone,
    Mail,
    User,
    FileText,
    Download,
    Share2,
    Sparkles,
    Briefcase,
    Eye
} from 'lucide-react';
import { toast } from 'sonner';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

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

// Status configuration
const getStatusConfig = (status: ProgramStatus) => {
    const configs = {
        [ProgramStatus.ACTIVE]: {
            bg: 'bg-emerald-50 dark:bg-emerald-950/30',
            text: 'text-emerald-700 dark:text-emerald-400',
            border: 'border-emerald-200 dark:border-emerald-800',
            icon: CheckCircle,
            label: 'Active'
        },
        [ProgramStatus.PLANNING]: {
            bg: 'bg-amber-50 dark:bg-amber-950/30',
            text: 'text-amber-700 dark:text-amber-400',
            border: 'border-amber-200 dark:border-amber-800',
            icon: Clock,
            label: 'Planning'
        },
        [ProgramStatus.COMPLETED]: {
            bg: 'bg-blue-50 dark:bg-blue-950/30',
            text: 'text-blue-700 dark:text-blue-400',
            border: 'border-blue-200 dark:border-blue-800',
            icon: Award,
            label: 'Completed'
        },
        [ProgramStatus.ARCHIVED]: {
            bg: 'bg-slate-50 dark:bg-slate-800',
            text: 'text-slate-600 dark:text-slate-400',
            border: 'border-slate-200 dark:border-slate-700',
            icon: Archive,
            label: 'Archived'
        },
    };
    return configs[status] || configs[ProgramStatus.PLANNING];
};

// Category configuration
const getCategoryConfig = (category: ProgramCategory) => {
    const configs = {
        [ProgramCategory.EDUCATION]: {
            bg: 'bg-blue-50 dark:bg-blue-950/30',
            text: 'text-blue-700 dark:text-blue-400',
            border: 'border-blue-200 dark:border-blue-800',
            icon: '📚',
            label: 'Education'
        },
        [ProgramCategory.ENTREPRENEURSHIP]: {
            bg: 'bg-green-50 dark:bg-green-950/30',
            text: 'text-green-700 dark:text-green-400',
            border: 'border-green-200 dark:border-green-800',
            icon: '💼',
            label: 'Entrepreneurship'
        },
        [ProgramCategory.HEALTH]: {
            bg: 'bg-pink-50 dark:bg-pink-950/30',
            text: 'text-pink-700 dark:text-pink-400',
            border: 'border-pink-200 dark:border-pink-800',
            icon: '🏥',
            label: 'Health'
        },
        [ProgramCategory.CROSS_CUTTING]: {
            bg: 'bg-purple-50 dark:bg-purple-950/30',
            text: 'text-purple-700 dark:text-purple-400',
            border: 'border-purple-200 dark:border-purple-800',
            icon: '🔄',
            label: 'Cross Cutting'
        },
    };
    return configs[category] || configs[ProgramCategory.CROSS_CUTTING];
};

export function ProgramDetailsPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [program, setProgram] = useState<Program | null>(null);
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');

    // Project Form State
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingProject, setEditingProject] = useState<Project | null>(null);
    const [formData, setFormData] = useState<CreateProjectDto>({
        name: { en: '', rw: '' },
        description: { en: '', rw: '' },
        timeline: { start: new Date().toISOString(), end: '' },
        budgetRequired: 0,
        programId: id || '',
        location: { district: '', sector: '', cell: '', village: '' }
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    // File States
    const [coverFile, setCoverFile] = useState<File | null>(null);
    const [coverPreview, setCoverPreview] = useState<string | null>(null);
    const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
    const [existingGallery, setExistingGallery] = useState<{ url: string; type: string }[]>([]);

    useEffect(() => {
        if (id) {
            fetchData();
        }
    }, [id]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [programData, projectsData] = await Promise.all([
                programsService.getProgram(id!),
                programsService.getProjects(1, 100, id)
            ]);

            // Handle API response structure
            setProgram(programData);
            setProjects(Array.isArray(projectsData) ? projectsData : projectsData?.data || []);
        } catch (error) {
            console.error(error);
            toast.error("Failed to load program details");
            navigate('/admin/programs');
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({
            name: { en: '', rw: '' },
            description: { en: '', rw: '' },
            timeline: { start: new Date().toISOString(), end: '' },
            budgetRequired: 0,
            programId: id || '',
            location: { district: '', sector: '', cell: '', village: '' }
        });
        setCoverFile(null);
        setCoverPreview(null);
        setGalleryFiles([]);
        setExistingGallery([]);
        setEditingProject(null);
    };

    const openEditDialog = (project: Project) => {
        setEditingProject(project);
        const mappedLocation: LocationDto = {
            district: project.location?.districts?.[0] || '',
            sector: project.location?.sectors?.[0] || '',
            cell: '',
            village: ''
        };

        const timeline = project.timeline ? {
            start: project.timeline.start || new Date().toISOString(),
            end: project.timeline.end || ''
        } : { start: new Date().toISOString(), end: '' };

        setFormData({
            name: {
                en: project.name?.en || '',
                rw: project.name?.rw || ''
            },
            description: {
                en: project.description?.en || '',
                rw: project.description?.rw || ''
            },
            timeline,
            budgetRequired: Number(project.budgetRequired) || 0,
            programId: project.program?.id || id || '',
            location: mappedLocation
        });

        // Set existing gallery if any
        if (project.gallery && project.gallery.length > 0) {
            const galleryItems = project.gallery.map((item: any) => ({
                url: item.url,
                type: item.type || 'image'
            }));
            setExistingGallery(galleryItems);
        }

        setIsDialogOpen(true);
    };

    const handleRemoveExistingGallery = (index: number) => {
        setExistingGallery(prev => prev.filter((_, i) => i !== index));
    };

    const handleCreateProject = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!id) return;
        setIsSubmitting(true);
        try {
            await programsService.createProject(id, formData, coverFile || undefined, galleryFiles);
            toast.success("Project created successfully");
            setIsDialogOpen(false);
            resetForm();
            fetchData();
        } catch (error) {
            toast.error("Failed to create project");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleUpdateProject = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!id || !editingProject) return;
        setIsSubmitting(true);
        try {
            await programsService.updateProject(
                id, 
                editingProject.id, 
                formData, 
                coverFile || undefined, 
                galleryFiles
            );
            toast.success("Project updated successfully");
            setIsDialogOpen(false);
            resetForm();
            fetchData();
        } catch (error) {
            toast.error("Failed to update project");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteProject = async (projectId: string) => {
        if (!confirm("Are you sure you want to delete this project?")) return;
        try {
            await programsService.deleteProject(id!, projectId);
            toast.success("Project deleted");
            fetchData();
        } catch (error) {
            toast.error("Failed to delete project");
        }
    };

    const formatCurrency = (amount: number | string) => {
        const num = typeof amount === 'string' ? parseFloat(amount) : amount;
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
        }).format(num);
    };

    const formatDate = (date: string | Date) => {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-teal-950/20">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <PageSkeleton />
                </div>
            </div>
        );
    }

    if (!program) return null;

    const statusConfig = getStatusConfig(program.status);
    const StatusIcon = statusConfig.icon;
    const categoryConfig = getCategoryConfig(program.category);
    const budgetProgress = program.budget > 0
        ? Math.min(((program.fundsUtilized || 0) / program.budget) * 100, 100)
        : 0;

    return (
        <TooltipProvider>
            <motion.div
                initial="hidden"
                animate="visible"
                variants={staggerContainer}
                className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-teal-950/20"
            >
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 space-y-6 sm:space-y-8">

                    {/* Back Button */}
                    <motion.div variants={fadeInUp}>
                        <Button
                            variant="ghost"
                            className="group mb-2 pl-0 hover:bg-transparent text-slate-600 hover:text-teal-600"
                            onClick={() => navigate('/admin/programs')}
                        >
                            <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
                            Back to Programs
                        </Button>
                    </motion.div>

                    {/* Hero Section with Cover Image */}
                    <motion.div variants={fadeInUp} className="relative rounded-2xl overflow-hidden">
                        {program.coverImage ? (
                            <div className="relative h-48 sm:h-64 lg:h-80 w-full">
                                <img
                                    src={program.coverImage}
                                    alt={program.name.en}
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                            </div>
                        ) : (
                            <div className="h-48 sm:h-64 lg:h-80 w-full bg-gradient-to-br from-teal-500/20 to-blue-500/20 flex items-center justify-center">
                                <Target className="w-16 h-16 text-slate-400" />
                            </div>
                        )}

                        {/* Program Info Overlay */}
                        <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 lg:p-8 text-white">
                            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        {program.logo && (
                                            <Avatar className="h-12 w-12 ring-2 ring-white/50">
                                                <AvatarImage src={program.logo} />
                                                <AvatarFallback className="bg-teal-600 text-white">
                                                    {program.name.en.substring(0, 2).toUpperCase()}
                                                </AvatarFallback>
                                            </Avatar>
                                        )}
                                        <div>
                                            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold">
                                                {program.name.en}
                                            </h1>
                                            <p className="text-sm sm:text-base text-white/80 mt-1">
                                                {program.name.rw}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-2">
                                        <Badge className={cn(
                                            "px-3 py-1 text-xs font-medium border-0",
                                            categoryConfig.bg,
                                            categoryConfig.text
                                        )}>
                                            <span className="mr-1">{categoryConfig.icon}</span>
                                            {categoryConfig.label}
                                        </Badge>
                                        <Badge className={cn(
                                            "px-3 py-1 text-xs font-medium border-0",
                                            statusConfig.bg,
                                            statusConfig.text
                                        )}>
                                            <StatusIcon className="w-3 h-3 mr-1 inline-block" />
                                            {statusConfig.label}
                                        </Badge>
                                        <Badge variant="outline" className="bg-white/10 text-white border-white/20">
                                            <Globe className="w-3 h-3 mr-1" />
                                            SDG: {program.sdgAlignment?.join(', ') || 'N/A'}
                                        </Badge>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex gap-2">
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="bg-white/10 text-white border-white/20 hover:bg-white/20"
                                                onClick={() => { resetForm(); setIsDialogOpen(true); }}
                                            >
                                                <Plus className="w-4 h-4 mr-2" />
                                                New Project
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>Create a new project</TooltipContent>
                                    </Tooltip>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Stats Grid - Same as before */}
                    <motion.div variants={fadeInUp} className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                        {/* ... stats cards (keep as is) ... */}
                    </motion.div>

                    {/* Budget Progress - Same as before */}
                    <motion.div variants={fadeInUp}>
                        {/* ... budget progress card (keep as is) ... */}
                    </motion.div>

                    {/* Tabs - Same as before */}
                    <motion.div variants={fadeInUp}>
                        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                            <TabsList className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200 dark:border-slate-800 p-1">
                                <TabsTrigger value="overview" className="text-xs sm:text-sm">Overview</TabsTrigger>
                                <TabsTrigger value="projects" className="text-xs sm:text-sm">
                                    Projects ({projects.length})
                                </TabsTrigger>
                                <TabsTrigger value="beneficiaries" className="text-xs sm:text-sm">
                                    Beneficiaries ({program.beneficiaries?.length || 0})
                                </TabsTrigger>
                                <TabsTrigger value="stories" className="text-xs sm:text-sm">
                                    Stories ({program.stories?.length || 0})
                                </TabsTrigger>
                            </TabsList>

                            {/* Overview Tab - Same as before */}
                            <TabsContent value="overview" className="mt-6">
                                {/* ... overview content (keep as is) ... */}
                            </TabsContent>

                            {/* Projects Tab */}
                            <TabsContent value="projects" className="mt-6">
                                <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                                    {projects.length === 0 ? (
                                        <div className="col-span-full text-center py-16 bg-white/50 dark:bg-slate-900/50 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
                                            <div className="flex flex-col items-center justify-center gap-4">
                                                <div className="relative">
                                                    <div className="absolute inset-0 bg-gradient-to-r from-teal-500/20 to-blue-500/20 rounded-full blur-3xl" />
                                                    <FolderKanban className="w-16 h-16 text-slate-300 dark:text-slate-600 relative" />
                                                </div>
                                                <div className="space-y-2">
                                                    <p className="text-xl font-bold text-slate-400 dark:text-slate-600">
                                                        No projects found
                                                    </p>
                                                    <p className="text-sm text-slate-400">
                                                        Create your first project for this program
                                                    </p>
                                                </div>
                                                <Button
                                                    className="mt-4 bg-teal-600 hover:bg-teal-700 text-white rounded-lg px-6"
                                                    onClick={() => { resetForm(); setIsDialogOpen(true); }}
                                                >
                                                    <Plus className="w-4 h-4 mr-2" />
                                                    Create Project
                                                </Button>
                                            </div>
                                        </div>
                                    ) : (
                                        <AnimatePresence mode="popLayout">
                                            {projects.map((project) => {
                                                const projectProgress = project.budgetRequired > 0
                                                    ? Math.min(((project.budgetReceived || 0) / project.budgetRequired) * 100, 100)
                                                    : 0;

                                                return (
                                                    <motion.div
                                                        key={project.id}
                                                        variants={fadeInUp}
                                                        initial="hidden"
                                                        animate="visible"
                                                        exit="hidden"
                                                        layout
                                                    >
                                                        <Card className="group h-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:shadow-xl transition-all duration-300 overflow-hidden">
                                                            {/* Project Cover */}
                                                            {project.coverImage ? (
                                                                <div className="relative h-32 overflow-hidden">
                                                                    <img
                                                                        src={project.coverImage}
                                                                        alt={project.name.en}
                                                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                                                    />
                                                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                                                                    <Badge
                                                                        variant={project.isActive ? 'default' : 'secondary'}
                                                                        className="absolute top-2 right-2 text-[10px]"
                                                                    >
                                                                        {project.isActive ? 'Active' : 'Inactive'}
                                                                    </Badge>
                                                                </div>
                                                            ) : (
                                                                <div className="h-32 bg-gradient-to-br from-teal-500/10 to-blue-500/10 flex items-center justify-center">
                                                                    <FolderKanban className="w-8 h-8 text-slate-400" />
                                                                </div>
                                                            )}

                                                            <CardHeader className="p-4 pb-2">
                                                                <div className="flex items-start justify-between">
                                                                    <CardTitle className="text-base font-bold line-clamp-1">
                                                                        {project.name.en}
                                                                    </CardTitle>
                                                                    <DropdownMenu>
                                                                        <DropdownMenuTrigger asChild>
                                                                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                                                                <MoreVertical className="h-4 w-4" />
                                                                            </Button>
                                                                        </DropdownMenuTrigger>
                                                                        <DropdownMenuContent align="end" className="w-40">
                                                                            <DropdownMenuItem onClick={() => openEditDialog(project)}>
                                                                                <Edit className="mr-2 h-4 w-4" /> Edit
                                                                            </DropdownMenuItem>
                                                                            <DropdownMenuItem
                                                                                className="text-red-600"
                                                                                onClick={() => handleDeleteProject(project.id)}
                                                                            >
                                                                                <Trash2 className="mr-2 h-4 w-4" /> Delete
                                                                            </DropdownMenuItem>
                                                                        </DropdownMenuContent>
                                                                    </DropdownMenu>
                                                                </div>
                                                                <CardDescription className="text-xs line-clamp-2">
                                                                    {project.description.en}
                                                                </CardDescription>
                                                            </CardHeader>

                                                            <CardContent className="p-4 pt-2">
                                                                <div className="space-y-3">
                                                                    {/* Budget */}
                                                                    <div className="flex items-center justify-between text-sm">
                                                                        <span className="text-slate-500">Budget</span>
                                                                        <span className="font-medium">
                                                                            {formatCurrency(project.budgetRequired)}
                                                                        </span>
                                                                    </div>

                                                                    {/* Timeline */}
                                                                    {project.timeline && (
                                                                        <div className="flex items-center justify-between text-sm">
                                                                            <span className="text-slate-500">Timeline</span>
                                                                            <span className="text-xs text-slate-600">
                                                                                {project.timeline.start && formatDate(project.timeline.start)}
                                                                                {project.timeline.end && ` - ${formatDate(project.timeline.end)}`}
                                                                            </span>
                                                                        </div>
                                                                    )}

                                                                    {/* Progress */}
                                                                    <div className="space-y-1">
                                                                        <div className="flex items-center justify-between text-xs">
                                                                            <span className="text-slate-500">Progress</span>
                                                                            <span className="font-medium">{Math.round(projectProgress)}%</span>
                                                                        </div>
                                                                        <Progress value={projectProgress} className="h-1" />
                                                                    </div>

                                                                    {/* Gallery Preview */}
                                                                    {project.gallery && project.gallery.length > 0 && (
                                                                        <div className="flex items-center gap-1 mt-2">
                                                                            {project.gallery.slice(0, 3).map((item: any, idx: number) => (
                                                                                <div
                                                                                    key={idx}
                                                                                    className="w-6 h-6 rounded bg-slate-100 dark:bg-slate-800 flex items-center justify-center"
                                                                                >
                                                                                    {item.type?.includes('video') ? (
                                                                                        <Video className="w-3 h-3 text-slate-500" />
                                                                                    ) : (
                                                                                        <ImageIcon className="w-3 h-3 text-slate-500" />
                                                                                    )}
                                                                                </div>
                                                                            ))}
                                                                            {project.gallery.length > 3 && (
                                                                                <span className="text-[10px] text-slate-400">
                                                                                    +{project.gallery.length - 3}
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </CardContent>
                                                        </Card>
                                                    </motion.div>
                                                );
                                            })}
                                        </AnimatePresence>
                                    )}
                                </div>
                            </TabsContent>

                            {/* Beneficiaries Tab - Same as before */}
                            <TabsContent value="beneficiaries" className="mt-6">
                                {/* ... beneficiaries content (keep as is) ... */}
                            </TabsContent>

                            {/* Stories Tab - Same as before */}
                            <TabsContent value="stories" className="mt-6">
                                {/* ... stories content (keep as is) ... */}
                            </TabsContent>
                        </Tabs>
                    </motion.div>
                </div>

                {/* Create/Edit Project Dialog */}
                <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
                    <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle className="text-xl font-bold">
                                {editingProject ? 'Edit Project' : 'Create New Project'}
                            </DialogTitle>
                            <DialogDescription>
                                {editingProject ? 'Update project details' : 'Add a new project to this program'}
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={editingProject ? handleUpdateProject : handleCreateProject} className="space-y-6 py-4">
                            {/* Basic Info */}
                            <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <div className="w-1 h-5 bg-teal-500 rounded-full"></div>
                                    <Label className="text-xs font-bold uppercase text-slate-400 tracking-wider">
                                        Project Details
                                    </Label>
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="nameEn">Name (English) *</Label>
                                        <Input
                                            id="nameEn"
                                            value={formData.name.en}
                                            onChange={e => setFormData({ ...formData, name: { ...formData.name, en: e.target.value } })}
                                            className="border-slate-200 focus:border-teal-500 focus:ring-teal-500/20"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="nameRw">Name (Kinyarwanda) *</Label>
                                        <Input
                                            id="nameRw"
                                            value={formData.name.rw}
                                            onChange={e => setFormData({ ...formData, name: { ...formData.name, rw: e.target.value } })}
                                            className="border-slate-200 focus:border-teal-500 focus:ring-teal-500/20"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Descriptions with Rich Text Editor */}
                            <div className="space-y-4 pt-4 border-t border-slate-100">
                                <div className="flex items-center gap-2">
                                    <div className="w-1 h-5 bg-teal-500 rounded-full"></div>
                                    <Label className="text-xs font-bold uppercase text-slate-400 tracking-wider">
                                        Descriptions
                                    </Label>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <Label htmlFor="descEn" className="text-sm font-medium mb-2 block">
                                            Description (English)
                                        </Label>
                                        <RichTextEditor
                                            value={formData.description.en}
                                            onChange={(value) => setFormData({ 
                                                ...formData, 
                                                description: { ...formData.description, en: value } 
                                            })}
                                            placeholder="Write a detailed project description in English..."
                                            height={200}
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="descRw" className="text-sm font-medium mb-2 block">
                                            Description (Kinyarwanda) *
                                        </Label>
                                        <RichTextEditor
                                            value={formData.description.rw}
                                            onChange={(value) => setFormData({ 
                                                ...formData, 
                                                description: { ...formData.description, rw: value } 
                                            })}
                                            placeholder="Write a detailed project description in Kinyarwanda..."
                                            height={200}
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Timeline & Budget */}
                            <div className="space-y-3 pt-4 border-t border-slate-100">
                                <div className="flex items-center gap-2">
                                    <div className="w-1 h-5 bg-teal-500 rounded-full"></div>
                                    <Label className="text-xs font-bold uppercase text-slate-400 tracking-wider">
                                        Timeline & Budget
                                    </Label>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="startDate">Start Date</Label>
                                        <Input
                                            id="startDate"
                                            type="date"
                                            value={formData.timeline.start ? formData.timeline.start.split('T')[0] : ''}
                                            onChange={e => setFormData({ 
                                                ...formData, 
                                                timeline: { ...formData.timeline, start: e.target.value } 
                                            })}
                                            className="border-slate-200"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="endDate">End Date</Label>
                                        <Input
                                            id="endDate"
                                            type="date"
                                            value={formData.timeline.end ? formData.timeline.end.split('T')[0] : ''}
                                            onChange={e => setFormData({ 
                                                ...formData, 
                                                timeline: { ...formData.timeline, end: e.target.value } 
                                            })}
                                            className="border-slate-200"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="budget">Budget (USD)</Label>
                                        <Input
                                            id="budget"
                                            type="number"
                                            value={formData.budgetRequired}
                                            onChange={e => setFormData({ ...formData, budgetRequired: Number(e.target.value) })}
                                            className="border-slate-200"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Location (Optional) */}
                            <div className="space-y-3 pt-4 border-t border-slate-100">
                                <div className="flex items-center gap-2">
                                    <div className="w-1 h-5 bg-teal-500 rounded-full"></div>
                                    <Label className="text-xs font-bold uppercase text-slate-400 tracking-wider">
                                        Location
                                        <span className="text-xs font-normal text-slate-400 ml-2">(Optional)</span>
                                    </Label>
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                    <Input
                                        placeholder="District"
                                        value={formData.location?.district}
                                        onChange={e => setFormData({
                                            ...formData,
                                            location: { ...formData.location, district: e.target.value }
                                        })}
                                        className="border-slate-200"
                                    />
                                    <Input
                                        placeholder="Sector"
                                        value={formData.location?.sector}
                                        onChange={e => setFormData({
                                            ...formData,
                                            location: { ...formData.location, sector: e.target.value }
                                        })}
                                        className="border-slate-200"
                                    />
                                    <Input
                                        placeholder="Cell"
                                        value={formData.location?.cell}
                                        onChange={e => setFormData({
                                            ...formData,
                                            location: { ...formData.location, cell: e.target.value }
                                        })}
                                        className="border-slate-200"
                                    />
                                    <Input
                                        placeholder="Village"
                                        value={formData.location?.village}
                                        onChange={e => setFormData({
                                            ...formData,
                                            location: { ...formData.location, village: e.target.value }
                                        })}
                                        className="border-slate-200"
                                    />
                                </div>
                            </div>

                            {/* File Uploads */}
                            <div className="space-y-4 pt-4 border-t border-slate-100">
                                <div className="flex items-center gap-2">
                                    <div className="w-1 h-5 bg-teal-500 rounded-full"></div>
                                    <Label className="text-xs font-bold uppercase text-slate-400 tracking-wider">
                                        Media
                                    </Label>
                                </div>

                                <div className="space-y-6">
                                    {/* Cover Image - Single file */}
                                    <div>
                                        <Label className="text-sm font-medium mb-2 block">
                                            Cover Image
                                        </Label>
                                        <DropZone
                                            onFileSelect={setCoverFile}
                                            selectedFile={coverFile}
                                            preview={coverPreview}
                                            onPreviewChange={setCoverPreview}
                                            label="Upload cover image"
                                            description="Main project image - recommended size: 1200x630px"
                                            maxSize={5 * 1024 * 1024} // 5MB
                                        />
                                    </div>

                                    {/* Gallery - Multiple files */}
                                    <div>
                                        <Label className="text-sm font-medium mb-2 block">
                                            Gallery (Images & Videos)
                                        </Label>
                                        <MultiFileDropZone
                                            onFilesSelect={setGalleryFiles}
                                            selectedFiles={galleryFiles}
                                            existingPreviews={existingGallery}
                                            onRemoveExisting={handleRemoveExistingGallery}
                                            label="Upload gallery files"
                                            description="Add images or videos to showcase your project"
                                            maxSize={10 * 1024 * 1024} // 10MB
                                            maxFiles={10}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Form Actions */}
                            <div className="flex justify-end gap-3 pt-6 border-t">
                                <Button 
                                    type="button" 
                                    variant="outline" 
                                    onClick={() => setIsDialogOpen(false)}
                                    className="px-4"
                                >
                                    Cancel
                                </Button>
                                <Button 
                                    type="submit" 
                                    disabled={isSubmitting} 
                                    className="bg-teal-600 hover:bg-teal-700 px-6"
                                >
                                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    {editingProject ? 'Save Changes' : 'Create Project'}
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            </motion.div>
        </TooltipProvider>
    );
}