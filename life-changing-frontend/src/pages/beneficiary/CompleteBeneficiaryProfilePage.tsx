import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/lib/auth-context";
import { UserType, TrackingFrequency } from "@/lib/types";
import { beneficiaryService } from "@/services/beneficiary.service";
import { programsService } from "@/services/programs.service";
import { toast } from "sonner";
import {
    User,
    MapPin,
    Calendar,
    Briefcase,
    DollarSign,
    Target,
    Loader2,
    Save,
    ArrowRight,
    Info,
    CheckCircle2,
    Heart,
    Shield
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

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

// Types
interface Program {
    id: string;
    name: {
        en: string;
        rw: string;
    };
    status: string;
}

export default function CompleteBeneficiaryProfilePage() {
    const navigate = useNavigate();
    const { user, refreshUser } = useAuth();

    const [loading, setLoading] = useState(false);
    const [checkingStatus, setCheckingStatus] = useState(true);
    const [programs, setPrograms] = useState<Program[]>([]);

    // Form State
    const [formData, setFormData] = useState({
        dateOfBirth: "",
        location: {
            district: "",
            sector: "",
            cell: "",
            village: ""
        },
        businessType: "",
        startCapital: "",
        programId: "",
        enrollmentDate: new Date().toISOString().split('T')[0],
        trackingFrequency: TrackingFrequency.WEEKLY,
        requiresSpecialAttention: false
    });

    // Check if profile already exists
    useEffect(() => {
        checkProfileStatus();
        fetchPrograms();
    }, []);

    const checkProfileStatus = async () => {
        try {
            const response = await beneficiaryService.getProfileStatus();
            const responseData = response as any;
            const statusData = responseData.data?.data || responseData.data || responseData;

            // If profile already exists, redirect to dashboard
            if (statusData.hasProfile) {
                toast.info("You already have a beneficiary profile", {
                    description: "Redirecting to dashboard..."
                });
                navigate('/beneficiary', { replace: true });
            }
        } catch (error) {
            console.error("Failed to check profile status", error);
        } finally {
            setCheckingStatus(false);
        }
    };

    const fetchPrograms = async () => {
        try {
            const response = await programsService.getPrograms();
            const programsData = response as any;
            const programsList = programsData.data?.data || programsData.data || programsData;
            setPrograms(Array.isArray(programsList) ? programsList : []);
        } catch (error) {
            console.error("Failed to fetch programs", error);
        }
    };

    const handleChange = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleLocationChange = (field: keyof typeof formData.location, value: string) => {
        setFormData(prev => ({
            ...prev,
            location: {
                ...prev.location,
                [field]: value
            }
        }));
    };

    const handleSubmit = async () => {
        // Validate required fields from backend DTO
        const missingFields = [];
        if (!formData.dateOfBirth) missingFields.push('Date of Birth');
        if (!formData.location.district) missingFields.push('District');
        if (!formData.location.sector) missingFields.push('Sector');
        if (!formData.location.cell) missingFields.push('Cell');
        if (!formData.location.village) missingFields.push('Village');
        if (!formData.businessType) missingFields.push('Business Type');
        if (!formData.startCapital) missingFields.push('Start Capital');

        if (missingFields.length > 0) {
            toast.error("Please fill in all required fields", {
                description: `Missing: ${missingFields.join(', ')}`
            });
            return;
        }

        setLoading(true);
        try {
            const payload = {
                dateOfBirth: formData.dateOfBirth,
                location: formData.location,
                programId: formData.programId || undefined,
                enrollmentDate: formData.enrollmentDate,
                startCapital: Number(formData.startCapital),
                businessType: formData.businessType,
                trackingFrequency: formData.trackingFrequency,
                requiresSpecialAttention: formData.requiresSpecialAttention
            };

            await beneficiaryService.createProfile(payload as any);

            await refreshUser();

            toast.success("Welcome to LCEO!", {
                description: "Your beneficiary profile has been created successfully."
            });

            navigate('/beneficiary', { replace: true });

        } catch (error: any) {
            console.error("Failed to create beneficiary profile", error);
            toast.error("Failed to create profile", {
                description: error.response?.data?.message || "Please try again later."
            });
        } finally {
            setLoading(false);
        }
    };

    const handleSkip = () => {
        toast.info("You can complete your profile later from the Profile page", {
            description: "Redirecting to dashboard..."
        });
        navigate('/beneficiary', { replace: true });
    };

    if (checkingStatus) {
        return (
            <div className="min-h-screen bg-white dark:from-slate-950 dark:via-slate-900 dark:to-teal-950/20 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin text-teal-600 mx-auto mb-4" />
                    <p className="text-slate-500 dark:text-slate-400">Checking your profile status...</p>
                </div>
            </div>
        );
    }

    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="min-h-screen bg-white dark:from-slate-950 dark:via-slate-900 dark:to-teal-950/20 py-12"
        >
            <div className="container max-w-3xl mx-auto px-4">
                {/* Welcome Header */}
                <motion.div variants={fadeInUp} className="text-center mb-8">
                    <div className="inline-flex items-center justify-center p-3 bg-teal-100 dark:bg-teal-900/30 rounded-full mb-4">
                        <Heart className="h-8 w-8 text-teal-600 dark:text-teal-400" />
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-2">
                        Welcome to LCEO, {user?.fullName?.split(' ')[0] || 'Beneficiary'}!
                    </h1>
                    <p className="text-lg text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
                        Let's set up your profile to start your journey and track your progress.
                    </p>
                </motion.div>

                {/* Progress Steps */}
                <motion.div variants={fadeInUp} className="mb-8">
                    <div className="flex items-center justify-between max-w-md mx-auto">
                        <div className="flex flex-col items-center">
                            <div className="w-8 h-8 rounded-full bg-teal-600 text-white flex items-center justify-center text-sm font-bold">
                                1
                            </div>
                            <span className="text-xs mt-1 text-teal-600 font-medium">Welcome</span>
                        </div>
                        <div className="flex-1 h-0.5 bg-teal-200 dark:bg-teal-800 mx-2" />
                        <div className="flex flex-col items-center">
                            <div className="w-8 h-8 rounded-full bg-teal-600 text-white flex items-center justify-center text-sm font-bold">
                                2
                            </div>
                            <span className="text-xs mt-1 text-teal-600 font-medium">Profile</span>
                        </div>
                        <div className="flex-1 h-0.5 bg-slate-200 dark:bg-slate-700 mx-2" />
                        <div className="flex flex-col items-center">
                            <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400 flex items-center justify-center text-sm font-bold">
                                3
                            </div>
                            <span className="text-xs mt-1 text-slate-400">Dashboard</span>
                        </div>
                    </div>
                </motion.div>

                {/* Profile Form Card */}
                <motion.div variants={fadeInUp}>
                    <Card className="border-none shadow-xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl">
                        <CardHeader className="text-center border-b border-slate-200 dark:border-slate-800 pb-6">
                            <CardTitle className="text-2xl font-bold text-slate-900 dark:text-white">
                                Complete Your Beneficiary Profile
                            </CardTitle>
                            <CardDescription className="text-base">
                                Fields marked with * are required. Program enrollment is optional.
                            </CardDescription>
                        </CardHeader>

                        <CardContent className="pt-8 space-y-8">
                            {/* Personal Information */}
                            <div className="space-y-6">
                                <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
                                    <User className="h-5 w-5 text-teal-600" />
                                    Personal Information
                                </h3>

                                {/* Date of Birth */}
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium flex items-center gap-1">
                                        Date of Birth <span className="text-teal-500">*</span>
                                    </Label>
                                    <div className="relative">
                                        <Input
                                            type="date"
                                            value={formData.dateOfBirth}
                                            onChange={(e) => handleChange('dateOfBirth', e.target.value)}
                                            max={new Date().toISOString().split('T')[0]}
                                            className="pl-9 h-12"
                                        />
                                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                    </div>
                                    <p className="text-xs text-slate-400">Your date of birth</p>
                                </div>

                                {/* Location Section */}
                                <div className="space-y-4">
                                    <h4 className="text-sm font-medium flex items-center gap-2">
                                        <MapPin className="h-4 w-4 text-teal-600" />
                                        Location
                                    </h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {/* District */}
                                        <div className="space-y-2">
                                            <Label className="text-sm font-medium flex items-center gap-1">
                                                District <span className="text-teal-500">*</span>
                                            </Label>
                                            <Input
                                                value={formData.location.district}
                                                onChange={(e) => handleLocationChange('district', e.target.value)}
                                                placeholder="e.g. Kicukiro"
                                                className="h-11"
                                            />
                                        </div>

                                        {/* Sector */}
                                        <div className="space-y-2">
                                            <Label className="text-sm font-medium flex items-center gap-1">
                                                Sector <span className="text-teal-500">*</span>
                                            </Label>
                                            <Input
                                                value={formData.location.sector}
                                                onChange={(e) => handleLocationChange('sector', e.target.value)}
                                                placeholder="e.g. Gikondo"
                                                className="h-11"
                                            />
                                        </div>

                                        {/* Cell */}
                                        <div className="space-y-2">
                                            <Label className="text-sm font-medium flex items-center gap-1">
                                                Cell <span className="text-teal-500">*</span>
                                            </Label>
                                            <Input
                                                value={formData.location.cell}
                                                onChange={(e) => handleLocationChange('cell', e.target.value)}
                                                placeholder="e.g. Nyarugunga"
                                                className="h-11"
                                            />
                                        </div>

                                        {/* Village */}
                                        <div className="space-y-2">
                                            <Label className="text-sm font-medium flex items-center gap-1">
                                                Village <span className="text-teal-500">*</span>
                                            </Label>
                                            <Input
                                                value={formData.location.village}
                                                onChange={(e) => handleLocationChange('village', e.target.value)}
                                                placeholder="e.g. Rukiri I"
                                                className="h-11"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Business Information */}
                            <div className="space-y-6 pt-4 border-t border-slate-200 dark:border-slate-800">
                                <h3 className="text-lg font-semibold flex items-center gap-2">
                                    <Briefcase className="h-5 w-5 text-teal-600" />
                                    Business Information
                                </h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Business Type */}
                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium flex items-center gap-1">
                                            Business Type <span className="text-teal-500">*</span>
                                        </Label>
                                        <Input
                                            value={formData.businessType}
                                            onChange={(e) => handleChange('businessType', e.target.value)}
                                            placeholder="e.g. Tailoring, Agriculture"
                                            className="h-11"
                                        />
                                    </div>

                                    {/* Start Capital */}
                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium flex items-center gap-1">
                                            Start Capital (RWF) <span className="text-teal-500">*</span>
                                        </Label>
                                        <Input
                                            type="number"
                                            value={formData.startCapital}
                                            onChange={(e) => handleChange('startCapital', e.target.value)}
                                            placeholder="e.g. 100000"
                                            min="0"
                                            className="h-11"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Program Enrollment (Optional) */}
                            <div className="space-y-6 pt-4 border-t border-slate-200 dark:border-slate-800">
                                <h3 className="text-lg font-semibold flex items-center gap-2">
                                    <Target className="h-5 w-5 text-teal-600" />
                                    Program Enrollment
                                    <span className="text-xs font-normal text-slate-500 ml-2">(Optional)</span>
                                </h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Program Selection */}
                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium">Select Program</Label>
                                        <Select
                                            value={formData.programId || 'none'}
                                            onValueChange={(value) => handleChange('programId', value === 'none' ? '' : value)}
                                        >
                                            <SelectTrigger className="h-11">
                                                <SelectValue placeholder="Choose a program" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="none">No Program</SelectItem>
                                                {programs.map((program) => (
                                                    <SelectItem key={program.id} value={program.id}>
                                                        {program.name.en}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {/* Tracking Frequency */}
                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium">Tracking Frequency</Label>
                                        <Select
                                            value={formData.trackingFrequency}
                                            onValueChange={(value: TrackingFrequency) => handleChange('trackingFrequency', value)}
                                        >
                                            <SelectTrigger className="h-11">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value={TrackingFrequency.WEEKLY}>Weekly</SelectItem>
                                                <SelectItem value={TrackingFrequency.MONTHLY}>Monthly</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <p className="text-xs text-slate-400">
                                    You can enroll in a program now or do it later from your dashboard.
                                </p>
                            </div>

                            {/* Info Box */}
                            <div className="bg-blue-50 dark:bg-blue-950/20 p-5 rounded-lg border border-blue-200 dark:border-blue-800">
                                <div className="flex items-start gap-3">
                                    <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-2">
                                            Why complete your profile?
                                        </p>
                                        <ul className="text-xs text-blue-600 dark:text-blue-400 space-y-1 list-disc list-inside">
                                            <li>Start tracking your weekly business progress</li>
                                            <li>Set and achieve financial goals</li>
                                            <li>Access training resources and support</li>
                                            <li>Enroll in programs that match your business</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex flex-col sm:flex-row gap-3 pt-4">
                                <Button
                                    onClick={handleSubmit}
                                    className="flex-1 h-12 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-xl"
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                            Creating Profile...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="h-4 w-4 mr-2" />
                                            Complete Profile & Continue
                                            <ArrowRight className="h-4 w-4 ml-2" />
                                        </>
                                    )}
                                </Button>

                                <Button
                                    variant="outline"
                                    onClick={handleSkip}
                                    className="flex-1 h-12 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold rounded-xl"
                                    disabled={loading}
                                >
                                    Skip for Now
                                </Button>
                            </div>

                            {/* Skip Note */}
                            <p className="text-xs text-center text-slate-400">
                                You can always update your profile later from the Profile page
                            </p>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Features Grid */}
                <motion.div variants={fadeInUp} className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
                    <Card className="bg-white/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800">
                        <CardContent className="p-4 flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-teal-100 dark:bg-teal-900/30">
                                <Target className="h-4 w-4 text-teal-600" />
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-slate-900 dark:text-white">Track Progress</p>
                                <p className="text-xs text-slate-500">Monitor your business growth</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-white/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800">
                        <CardContent className="p-4 flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-teal-100 dark:bg-teal-900/30">
                                <DollarSign className="h-4 w-4 text-teal-600" />
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-slate-900 dark:text-white">Set Goals</p>
                                <p className="text-xs text-slate-500">Create and achieve milestones</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-white/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800">
                        <CardContent className="p-4 flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-teal-100 dark:bg-teal-900/30">
                                <Heart className="h-4 w-4 text-teal-600" />
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-slate-900 dark:text-white">Get Support</p>
                                <p className="text-xs text-slate-500">Access resources and programs</p>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </motion.div>
    );
}