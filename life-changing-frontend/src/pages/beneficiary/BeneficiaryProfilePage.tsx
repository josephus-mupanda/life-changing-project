import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/lib/auth-context";
import { UserType, Beneficiary, TrackingFrequency } from "@/lib/types";
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
    TrendingUp,
    CheckCircle2,
    AlertCircle,
    Loader2,
    Save,
    Pencil,
    X,
    Phone,
    Mail,
    Info,
    Clock,
    ChevronLeft
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format, isValid, parseISO } from "date-fns";

// Types
interface Program {
    id: string;
    name: {
        en: string;
        rw: string;
    };
    status: string;
}

// Safe date formatting
const formatSafeDate = (date: string | Date | null | undefined): string => {
    if (!date) return 'Not set';
    try {
        const dateObj = typeof date === 'string' ? parseISO(date) : date;
        if (!isValid(dateObj)) return 'Invalid date';
        return format(dateObj, 'MMM d, yyyy');
    } catch {
        return 'Invalid date';
    }
};

// Format date for input (YYYY-MM-DD)
const formatDateForInput = (date: string | Date | null | undefined): string => {
    if (!date) return '';
    try {
        const dateObj = typeof date === 'string' ? parseISO(date) : date;
        if (!isValid(dateObj)) return '';
        return format(dateObj, 'yyyy-MM-dd');
    } catch {
        return '';
    }
};

export default function BeneficiaryProfilePage() {
    const { user, refreshUser } = useAuth();
    const navigate = useNavigate();

    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [programs, setPrograms] = useState<Program[]>([]);

    // Profile Data
    const [profile, setProfile] = useState<Beneficiary | null>(null);

    // Form State
    const [formData, setFormData] = useState({
        dateOfBirth: "",
        location: {
            district: "",
            sector: "",
            cell: "",
            village: ""
        },
        programId: "",
        enrollmentDate: "",
        startCapital: "",
        businessType: "",
        trackingFrequency: TrackingFrequency.WEEKLY,
        requiresSpecialAttention: false
    });

    // Fetch profile and programs on mount
    useEffect(() => {
        if (user?.userType === UserType.BENEFICIARY) {
            fetchProfile();
            fetchPrograms();
        }
    }, [user]);

    const fetchProfile = async () => {
        setFetching(true);
        try {
            const profileResponse = await beneficiaryService.getProfile();

            const profileData = profileResponse as any;
            const beneficiaryData = profileData.data?.data || profileData.data || profileData;

            if (!beneficiaryData) {
                toast.error("Profile not found", {
                    description: "Redirecting to profile creation..."
                });
                navigate('/beneficiary/complete-profile', { replace: true });
                return;
            }

            setProfile(beneficiaryData);

            setFormData({
                dateOfBirth: formatDateForInput(beneficiaryData.dateOfBirth),
                location: {
                    district: beneficiaryData.location?.district || "",
                    sector: beneficiaryData.location?.sector || "",
                    cell: beneficiaryData.location?.cell || "",
                    village: beneficiaryData.location?.village || ""
                },
                programId: beneficiaryData.program?.id || "",
                enrollmentDate: formatDateForInput(beneficiaryData.enrollmentDate),
                startCapital: beneficiaryData.startCapital?.toString() || "",
                businessType: beneficiaryData.businessType || "",
                trackingFrequency: beneficiaryData.trackingFrequency || TrackingFrequency.WEEKLY,
                requiresSpecialAttention: beneficiaryData.requiresSpecialAttention || false
            });

        } catch (error: any) {
            console.error("Failed to fetch profile", error);
            toast.error("Failed to load profile");
        } finally {
            setFetching(false);
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
        // Validate required fields
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
                enrollmentDate: formData.enrollmentDate || new Date().toISOString().split('T')[0],
                startCapital: Number(formData.startCapital),
                businessType: formData.businessType,
                trackingFrequency: formData.trackingFrequency,
                requiresSpecialAttention: formData.requiresSpecialAttention
            };

            await beneficiaryService.updateProfile(payload as any);
            toast.success("Profile updated successfully!");

            await fetchProfile();
            await refreshUser();
            setIsEditing(false);

        } catch (error: any) {
            console.error("Failed to update profile", error);
            toast.error("Failed to update profile", {
                description: error.response?.data?.message || "Please try again"
            });
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = () => setIsEditing(true);

    const handleCancel = () => {
        if (profile) {
            setFormData({
                dateOfBirth: formatDateForInput(profile.dateOfBirth),
                location: {
                    district: profile.location?.district || "",
                    sector: profile.location?.sector || "",
                    cell: profile.location?.cell || "",
                    village: profile.location?.village || ""
                },
                programId: profile.program?.id || "",
                enrollmentDate: formatDateForInput(profile.enrollmentDate),
                startCapital: profile.startCapital?.toString() || "",
                businessType: profile.businessType || "",
                trackingFrequency: profile.trackingFrequency || TrackingFrequency.WEEKLY,
                requiresSpecialAttention: profile.requiresSpecialAttention || false
            });
        }
        setIsEditing(false);
    };

    const initials = user?.fullName
        ? user.fullName.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase()
        : "U";

    if (!user || user.userType !== UserType.BENEFICIARY) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <p className="text-muted-foreground">Access denied. Beneficiary only.</p>
            </div>
        );
    }

    if (fetching) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-500 pt-0 pb-10">
            {/* Back Button */}
            <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/beneficiary')}
                className="mb-2 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
            >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Back to Dashboard
            </Button>

            {/* Profile Header */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
                <div className="px-6 py-8 flex flex-col sm:flex-row items-center sm:items-end gap-6">
                    <div className="relative group">
                        <Avatar className="h-28 w-28 border-4 border-white dark:border-slate-900 shadow-xl rounded-2xl">
                            <AvatarImage src={user.profileImageUrl} alt={user.fullName} />
                            <AvatarFallback className="text-4xl font-bold bg-white text-white rounded-2xl">
                                {initials}
                            </AvatarFallback>
                        </Avatar>
                    </div>

                    <div className="flex-1 text-center sm:text-left">
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-1">
                            {user.fullName}
                        </h1>
                        <div className="flex items-center justify-center sm:justify-start gap-3 text-slate-500 dark:text-slate-400 mb-3">
                            <Badge variant="outline" className="bg-teal-50 text-teal-700 border-teal-200">
                                Beneficiary
                            </Badge>
                            <span className="text-sm">{user.email}</span>
                        </div>

                        {/* Program Badge */}
                        {profile?.program && (
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-teal-50 dark:bg-teal-900/30 rounded-full">
                                <Target className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" />
                                <span className="text-sm font-medium text-teal-700 dark:text-teal-300">
                                    {profile.program.name.en}
                                </span>
                            </div>
                        )}
                    </div>

                    <div className="flex gap-2">
                        {isEditing ? (
                            <>
                                <Button
                                    variant="outline"
                                    onClick={handleCancel}
                                    className="rounded-xl border-slate-200 dark:border-slate-700"
                                    disabled={loading}
                                >
                                    <X className="h-4 w-4 mr-2" />
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleSubmit}
                                    className="rounded-xl font-semibold bg-teal-600 hover:bg-teal-700 text-white shadow-md"
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="h-4 w-4 mr-2" />
                                            Save Changes
                                        </>
                                    )}
                                </Button>
                            </>
                        ) : (
                            <Button
                                onClick={handleEdit}
                                className="rounded-xl font-semibold bg-teal-600 hover:bg-teal-700 text-white shadow-md"
                            >
                                <Pencil className="h-4 w-4 mr-2" />
                                Edit Profile
                            </Button>
                        )}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Stats & Overview */}
                <div className="space-y-6">
                    {/* Account Details */}
                    <Card className="border-none shadow-sm bg-white dark:bg-slate-900">
                        <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
                            <CardTitle className="text-sm font-bold uppercase tracking-widest text-slate-400">
                                Account Details
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-4 space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-slate-500">Member Since</span>
                                <span className="text-sm font-semibold">
                                    {formatSafeDate(user.createdAt)}
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-slate-500">Phone</span>
                                <span className="text-sm font-semibold">{user.phone}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-slate-500">Language</span>
                                <span className="text-sm font-semibold uppercase">{user.language}</span>
                            </div>
                            
                            {profile && (
                                <>
                                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                                        <p className="text-xs text-slate-500 mb-1">Profile Created</p>
                                        <p className="text-sm font-medium">
                                            {formatSafeDate(profile.createdAt)}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500 mb-1">Last Updated</p>
                                        <p className="text-sm font-medium">
                                            {formatSafeDate(profile.updatedAt)}
                                        </p>
                                    </div>
                                </>
                            )}
                        </CardContent>
                    </Card>

                    {/* Quick Stats */}
                    {profile && (
                        <Card className="bg-white dark:from-teal-950/30 dark:to-teal-900/20 border-none shadow-sm">
                            <CardContent className="p-6 space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-white dark:bg-slate-900 rounded-lg shadow-sm">
                                        <DollarSign className="h-5 w-5 text-teal-600" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-teal-600 dark:text-teal-400 font-bold uppercase">
                                            Start Capital
                                        </p>
                                        <p className="text-2xl font-bold text-teal-900 dark:text-teal-100">
                                            RWF {Number(profile.startCapital).toLocaleString()}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-white dark:bg-slate-900 rounded-lg shadow-sm">
                                        <TrendingUp className="h-5 w-5 text-teal-600" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-teal-600 dark:text-teal-400 font-bold uppercase">
                                            Current Capital
                                        </p>
                                        <p className="text-2xl font-bold text-teal-900 dark:text-teal-100">
                                            RWF {Number(profile.currentCapital).toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Right Column - Profile Form */}
                <div className="lg:col-span-2 space-y-6">
                    <Card className="border-none shadow-sm bg-white dark:bg-slate-900">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <User className="h-5 w-5 text-teal-600" />
                                Personal Information
                            </CardTitle>
                            <CardDescription>
                                {isEditing ? "Edit your profile details" : "Your profile information"}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Date of Birth */}
                            <div className="space-y-2">
                                <Label className="text-sm font-medium">
                                    Date of Birth <span className="text-teal-500">*</span>
                                </Label>
                                {isEditing ? (
                                    <div className="relative">
                                        <Input
                                            type="date"
                                            value={formData.dateOfBirth}
                                            onChange={(e) => handleChange('dateOfBirth', e.target.value)}
                                            max={new Date().toISOString().split('T')[0]}
                                            className="pl-9"
                                        />
                                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                    </div>
                                ) : (
                                    <p className="text-lg font-medium p-2 bg-slate-50 dark:bg-slate-800 rounded-md">
                                        {formatSafeDate(profile?.dateOfBirth)}
                                    </p>
                                )}
                            </div>

                            {/* Location Section */}
                            <div className="space-y-4">
                                <h3 className="text-sm font-semibold flex items-center gap-2">
                                    <MapPin className="h-4 w-4 text-teal-600" />
                                    Location
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* District */}
                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium">
                                            District <span className="text-teal-500">*</span>
                                        </Label>
                                        {isEditing ? (
                                            <Input
                                                value={formData.location.district}
                                                onChange={(e) => handleLocationChange('district', e.target.value)}
                                                placeholder="e.g. Kicukiro"
                                            />
                                        ) : (
                                            <p className="p-2 bg-slate-50 dark:bg-slate-800 rounded-md">
                                                {profile?.location?.district}
                                            </p>
                                        )}
                                    </div>

                                    {/* Sector */}
                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium">
                                            Sector <span className="text-teal-500">*</span>
                                        </Label>
                                        {isEditing ? (
                                            <Input
                                                value={formData.location.sector}
                                                onChange={(e) => handleLocationChange('sector', e.target.value)}
                                                placeholder="e.g. Gikondo"
                                            />
                                        ) : (
                                            <p className="p-2 bg-slate-50 dark:bg-slate-800 rounded-md">
                                                {profile?.location?.sector}
                                            </p>
                                        )}
                                    </div>

                                    {/* Cell */}
                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium">
                                            Cell <span className="text-teal-500">*</span>
                                        </Label>
                                        {isEditing ? (
                                            <Input
                                                value={formData.location.cell}
                                                onChange={(e) => handleLocationChange('cell', e.target.value)}
                                                placeholder="e.g. Nyarugunga"
                                            />
                                        ) : (
                                            <p className="p-2 bg-slate-50 dark:bg-slate-800 rounded-md">
                                                {profile?.location?.cell || '—'}
                                            </p>
                                        )}
                                    </div>

                                    {/* Village */}
                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium">
                                            Village <span className="text-teal-500">*</span>
                                        </Label>
                                        {isEditing ? (
                                            <Input
                                                value={formData.location.village}
                                                onChange={(e) => handleLocationChange('village', e.target.value)}
                                                placeholder="e.g. Rukiri I"
                                            />
                                        ) : (
                                            <p className="p-2 bg-slate-50 dark:bg-slate-800 rounded-md">
                                                {profile?.location?.village || '—'}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Business & Program Section */}
                            <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                                <h3 className="text-sm font-semibold flex items-center gap-2">
                                    <Briefcase className="h-4 w-4 text-teal-600" />
                                    Business & Program
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Business Type */}
                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium">
                                            Business Type <span className="text-teal-500">*</span>
                                        </Label>
                                        {isEditing ? (
                                            <Input
                                                value={formData.businessType}
                                                onChange={(e) => handleChange('businessType', e.target.value)}
                                                placeholder="e.g. Tailoring"
                                            />
                                        ) : (
                                            <p className="p-2 bg-slate-50 dark:bg-slate-800 rounded-md">
                                                {profile?.businessType}
                                            </p>
                                        )}
                                    </div>

                                    {/* Program */}
                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium">Program</Label>
                                        {isEditing ? (
                                            <Select
                                                value={formData.programId || 'none'}
                                                onValueChange={(value) => handleChange('programId', value === 'none' ? '' : value)}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select a program" />
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
                                        ) : (
                                            <p className="p-2 bg-slate-50 dark:bg-slate-800 rounded-md">
                                                {profile?.program?.name?.en || 'No program'}
                                            </p>
                                        )}
                                    </div>

                                    {/* Start Capital */}
                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium">
                                            Start Capital (RWF) <span className="text-teal-500">*</span>
                                        </Label>
                                        {isEditing ? (
                                            <Input
                                                type="number"
                                                value={formData.startCapital}
                                                onChange={(e) => handleChange('startCapital', e.target.value)}
                                                placeholder="e.g. 100000"
                                                min="0"
                                            />
                                        ) : (
                                            <p className="p-2 bg-slate-50 dark:bg-slate-800 rounded-md">
                                                RWF {Number(profile?.startCapital).toLocaleString()}
                                            </p>
                                        )}
                                    </div>

                                    {/* Tracking Frequency */}
                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium">Tracking Frequency</Label>
                                        {isEditing ? (
                                            <Select
                                                value={formData.trackingFrequency}
                                                onValueChange={(value: TrackingFrequency) => handleChange('trackingFrequency', value)}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value={TrackingFrequency.WEEKLY}>Weekly</SelectItem>
                                                    <SelectItem value={TrackingFrequency.MONTHLY}>Monthly</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        ) : (
                                            <p className="p-2 bg-slate-50 dark:bg-slate-800 rounded-md capitalize">
                                                {profile?.trackingFrequency}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Special Attention Toggle (only in edit mode) */}
                            {isEditing && (
                                <div className="flex items-center gap-2 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                                    <input
                                        type="checkbox"
                                        id="specialAttention"
                                        checked={formData.requiresSpecialAttention}
                                        onChange={(e) => handleChange('requiresSpecialAttention', e.target.checked)}
                                        className="rounded border-slate-300"
                                    />
                                    <Label htmlFor="specialAttention" className="text-sm cursor-pointer">
                                        Requires Special Attention
                                    </Label>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}