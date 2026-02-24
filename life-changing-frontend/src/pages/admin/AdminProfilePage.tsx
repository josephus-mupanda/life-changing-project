import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth-context";
import { UserType } from "@/lib/types";
import { staffService } from "@/services/staff.service";
import { toast } from "sonner";
import {
    Briefcase,
    Building,
    Phone,
    MapPin,
    User,
    Save,
    Pencil,
    X,
    AlertCircle,
    CheckCircle2,
    Loader2,
    FileText,
    Info,
    Calendar
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format, isValid, parseISO } from "date-fns";

// Interface for Staff Profile from API
interface StaffProfile {
    id?: string;
    position?: string;  // All fields are optional!
    department?: string;
    contactInfo?: {
        emergencyContact?: string;
        emergencyPhone?: string;
        address?: string;
    };
    createdAt?: string;
    updatedAt?: string;
}

// Interface for Profile Status from API
interface ProfileStatus {
    hasProfile: boolean;
    isComplete: boolean;  // Always true since all fields optional
    missingFields: string[];  // Empty array since all fields optional
    profile?: StaffProfile;
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

export default function AdminProfilePage() {
    const { user, refreshUser } = useAuth();
    const navigate = useNavigate();
    
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [profileStatus, setProfileStatus] = useState<ProfileStatus | null>(null);
    
    // Form State - All fields optional
    const [formData, setFormData] = useState<StaffProfile>({
        position: "",
        department: "",
        contactInfo: {
            emergencyContact: "",
            emergencyPhone: "",
            address: ""
        }
    });

    // Fetch profile status on mount
    useEffect(() => {
        fetchProfileStatus();
    }, []);

    const fetchProfileStatus = async () => {
        setFetching(true);
        try {
            const response = await staffService.getProfileStatus();
            
            // Extract data using the same robust pattern
            const responseData = response as any;
            const statusData = responseData.data?.data || responseData.data || responseData;
            
            setProfileStatus(statusData);
            
            // If profile exists, populate form with existing data (or empty strings)
            if (statusData.hasProfile && statusData.profile) {
                setFormData({
                    position: statusData.profile.position || "",
                    department: statusData.profile.department || "",
                    contactInfo: {
                        emergencyContact: statusData.profile.contactInfo?.emergencyContact || "",
                        emergencyPhone: statusData.profile.contactInfo?.emergencyPhone || "",
                        address: statusData.profile.contactInfo?.address || ""
                    }
                });
            } else {
                // Redirect to profile creation if no profile (should not happen with ProfileGuard)
                toast.error("Profile not found", {
                    description: "Redirecting to profile creation..."
                });
                navigate('/admin/complete-profile', { replace: true });
            }
            
        } catch (error: any) {
            console.error("Failed to fetch profile status", error);
            toast.error("Failed to load profile data");
        } finally {
            setFetching(false);
        }
    };

    const handleChange = (field: keyof StaffProfile, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleContactInfoChange = (field: keyof NonNullable<StaffProfile['contactInfo']>, value: string) => {
        setFormData(prev => ({
            ...prev,
            contactInfo: {
                ...prev.contactInfo,
                [field]: value
            }
        }));
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            // Prepare payload - only send fields that have values
            const payload: any = {};
            
            if (formData.position?.trim()) payload.position = formData.position.trim();
            if (formData.department?.trim()) payload.department = formData.department.trim();
            
            if (formData.contactInfo) {
                const contactInfo: any = {};
                if (formData.contactInfo.emergencyContact?.trim()) {
                    contactInfo.emergencyContact = formData.contactInfo.emergencyContact.trim();
                }
                if (formData.contactInfo.emergencyPhone?.trim()) {
                    contactInfo.emergencyPhone = formData.contactInfo.emergencyPhone.trim();
                }
                if (formData.contactInfo.address?.trim()) {
                    contactInfo.address = formData.contactInfo.address.trim();
                }
                if (Object.keys(contactInfo).length > 0) {
                    payload.contactInfo = contactInfo;
                }
            }

            // Update existing profile
            await staffService.updateProfile(payload);
            toast.success("Staff profile updated successfully!");
            
            // Refresh status
            await fetchProfileStatus();
            await refreshUser();
            
            setIsEditing(false);
            
        } catch (error: any) {
            console.error("Failed to update staff profile", error);
            toast.error("Failed to update staff profile", {
                description: error.response?.data?.message || "Please try again later."
            });
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = () => {
        setIsEditing(true);
    };

    const handleCancel = () => {
        // Reset form to original values
        if (profileStatus?.hasProfile && profileStatus.profile) {
            setFormData({
                position: profileStatus.profile.position || "",
                department: profileStatus.profile.department || "",
                contactInfo: {
                    emergencyContact: profileStatus.profile.contactInfo?.emergencyContact || "",
                    emergencyPhone: profileStatus.profile.contactInfo?.emergencyPhone || "",
                    address: profileStatus.profile.contactInfo?.address || ""
                }
            });
        }
        setIsEditing(false);
    };

    const getMissingFieldLabel = (field: string): string => {
        const labels: Record<string, string> = {
            'profile_not_created': 'Profile not created',
            'position': 'Position',
            'department': 'Department',
            'emergencyContact': 'Emergency Contact Name',
            'emergencyPhone': 'Emergency Phone',
            'address': 'Address'
        };
        return labels[field] || field;
    };

    const initials = user?.fullName
        ? user.fullName
            .split(" ")
            .map((n) => n[0])
            .join("")
            .substring(0, 2)
            .toUpperCase()
        : "A";

    if (!user || user.userType !== UserType.ADMIN) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <p className="text-muted-foreground">Access denied. Admin only.</p>
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

    const hasProfile = profileStatus?.hasProfile || false;
    const missingFields = profileStatus?.missingFields || [];

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500 pt-0 pb-10">
            {/* Profile Header */}
            <div className="relative pt-0 mt-0">
                <div className="px-6 flex flex-col sm:flex-row items-center sm:items-end gap-6 pt-0">
                    <div className="relative group mt-0">
                        <Avatar className="h-24 w-24 border-4 border-white dark:border-slate-900 shadow-xl rounded-2xl">
                            <AvatarImage src={user.profileImageUrl} alt={user.fullName} className="object-cover" />
                            <AvatarFallback className="text-3xl font-bold bg-gradient-to-br from-teal-400 to-teal-600 text-white rounded-2xl">
                                {initials}
                            </AvatarFallback>
                        </Avatar>
                    </div>

                    <div className="flex-1 pb-1 text-center sm:text-left space-y-2">
                        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">{user.fullName}</h1>
                        <div className="flex items-center justify-center sm:justify-start gap-3 text-slate-500 dark:text-slate-400">
                            <span className="px-2.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold rounded-full uppercase tracking-wide">
                                {user.userType}
                            </span>
                            <span className="text-sm font-medium">{user.email || "No email provided"}</span>
                        </div>
                        
                        {/* Status Badge */}
                        <div className="mt-2 flex items-center gap-2 text-green-600 bg-green-50 dark:bg-green-950/20 p-2 rounded-lg">
                            <CheckCircle2 className="h-4 w-4" />
                            <p className="text-sm font-medium">Staff profile created</p>
                        </div>
                    </div>

                    <div className="flex gap-3 pb-1">
                        {isEditing ? (
                            <div className="flex gap-2">
                                <Button variant="ghost" className="rounded-xl font-semibold text-slate-600" onClick={handleCancel}>
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
                                            Update Profile
                                        </>
                                    )}
                                </Button>
                            </div>
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

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 px-4 sm:px-0">
                {/* Left Column */}
                <div className="space-y-6">
                    <Card className="border-none shadow-sm bg-white dark:bg-slate-900 ring-1 ring-slate-200 dark:ring-slate-800">
                        <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
                            <CardTitle className="text-sm font-bold uppercase tracking-widest text-slate-400">Account Details</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-4 space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-slate-500">Joined</span>
                                <span className="text-sm font-semibold text-slate-900 dark:text-white">
                                    {formatSafeDate(user?.createdAt)}
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-slate-500">Language</span>
                                <span className="text-sm font-semibold text-slate-900 dark:text-white uppercase">{user?.language || 'en'}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-slate-500">Status</span>
                                <div className="flex items-center gap-2 px-2 py-1 rounded-full bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
                                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                    Active
                                </div>
                            </div>
                            
                            {profileStatus?.profile && (
                                <>
                                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                                        <p className="text-xs text-slate-500 mb-1">Profile Created</p>
                                        <p className="text-sm font-medium">
                                            {formatSafeDate(profileStatus.profile.createdAt)}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500 mb-1">Last Updated</p>
                                        <p className="text-sm font-medium">
                                            {formatSafeDate(profileStatus.profile.updatedAt)}
                                        </p>
                                    </div>
                                </>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column - Staff Profile Form */}
                <div className="lg:col-span-2 space-y-6">
                    <Card className="border-none shadow-sm ring-1 ring-slate-200 dark:ring-slate-800">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Briefcase className="h-5 w-5 text-teal-600" />
                                Staff Information
                            </CardTitle>
                            <CardDescription>
                                Your staff profile details (all fields are optional)
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Position & Department - Both Optional */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label className="text-xs uppercase font-bold tracking-wider text-slate-500 flex items-center gap-1">
                                        <Briefcase className="h-3 w-3" /> Position
                                        <span className="text-xs font-normal text-slate-400 ml-1">(Optional)</span>
                                    </Label>
                                    {isEditing ? (
                                        <Input
                                            value={formData.position || ""}
                                            onChange={(e) => handleChange('position', e.target.value)}
                                            className="font-medium"
                                            placeholder="e.g. Project Manager"
                                            disabled={loading}
                                        />
                                    ) : (
                                        <p className="text-lg font-medium text-slate-900 dark:text-slate-100 p-2 bg-slate-50 dark:bg-slate-800 rounded-md">
                                            {formData.position || "—"}
                                        </p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs uppercase font-bold tracking-wider text-slate-500 flex items-center gap-1">
                                        <Building className="h-3 w-3" /> Department
                                        <span className="text-xs font-normal text-slate-400 ml-1">(Optional)</span>
                                    </Label>
                                    {isEditing ? (
                                        <Input
                                            value={formData.department || ""}
                                            onChange={(e) => handleChange('department', e.target.value)}
                                            className="font-medium"
                                            placeholder="e.g. Operations"
                                            disabled={loading}
                                        />
                                    ) : (
                                        <p className="text-lg font-medium text-slate-900 dark:text-slate-100 p-2 bg-slate-50 dark:bg-slate-800 rounded-md">
                                            {formData.department || "—"}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Emergency Contact - All Optional */}
                            <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                                <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                                    <Phone className="h-4 w-4 text-teal-600" />
                                    Emergency Contact Information
                                    <span className="text-xs font-normal text-slate-500 ml-2">(Optional)</span>
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label className="text-xs uppercase font-bold tracking-wider text-slate-500">
                                            Contact Name
                                        </Label>
                                        {isEditing ? (
                                            <Input
                                                value={formData.contactInfo?.emergencyContact || ""}
                                                onChange={(e) => handleContactInfoChange('emergencyContact', e.target.value)}
                                                className="font-medium"
                                                placeholder="e.g. Jane Doe"
                                                disabled={loading}
                                            />
                                        ) : (
                                            <p className="text-lg font-medium text-slate-900 dark:text-slate-100 p-2 bg-slate-50 dark:bg-slate-800 rounded-md">
                                                {formData.contactInfo?.emergencyContact || "—"}
                                            </p>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs uppercase font-bold tracking-wider text-slate-500">
                                            Emergency Phone
                                        </Label>
                                        {isEditing ? (
                                            <Input
                                                value={formData.contactInfo?.emergencyPhone || ""}
                                                onChange={(e) => handleContactInfoChange('emergencyPhone', e.target.value)}
                                                className="font-medium"
                                                placeholder="+250 788 123 456"
                                                disabled={loading}
                                            />
                                        ) : (
                                            <p className="text-lg font-medium text-slate-900 dark:text-slate-100 p-2 bg-slate-50 dark:bg-slate-800 rounded-md">
                                                {formData.contactInfo?.emergencyPhone || "—"}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Address - Optional */}
                            <div className="space-y-2">
                                <Label className="text-xs uppercase font-bold tracking-wider text-slate-500 flex items-center gap-1">
                                    <MapPin className="h-3 w-3" /> Address
                                    <span className="text-xs font-normal text-slate-400 ml-1">(Optional)</span>
                                </Label>
                                {isEditing ? (
                                    <Textarea
                                        value={formData.contactInfo?.address || ""}
                                        onChange={(e) => handleContactInfoChange('address', e.target.value)}
                                        className="font-medium min-h-[80px]"
                                        placeholder="e.g. Kigali, Rwanda"
                                        disabled={loading}
                                    />
                                ) : (
                                    <p className="text-lg font-medium text-slate-900 dark:text-slate-100 p-2 bg-slate-50 dark:bg-slate-800 rounded-md">
                                        {formData.contactInfo?.address || "—"}
                                    </p>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Personal Information Card */}
                    <Card className="border-none shadow-sm ring-1 ring-slate-200 dark:ring-slate-800">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <User className="h-5 w-5 text-teal-600" />
                                Personal Information
                            </CardTitle>
                            <CardDescription>Your basic account details (cannot be edited)</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label className="text-slate-500 text-xs uppercase font-bold tracking-wider">Full Name</Label>
                                    <p className="text-lg font-medium text-slate-900 dark:text-slate-100 p-2 bg-slate-50 dark:bg-slate-800 rounded-md">
                                        {user?.fullName}
                                    </p>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-slate-500 text-xs uppercase font-bold tracking-wider">Email</Label>
                                    <p className="text-lg font-medium text-slate-900 dark:text-slate-100 p-2 bg-slate-50 dark:bg-slate-800 rounded-md">
                                        {user?.email || "—"}
                                    </p>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-slate-500 text-xs uppercase font-bold tracking-wider">Phone</Label>
                                    <p className="text-lg font-medium text-slate-900 dark:text-slate-100 p-2 bg-slate-50 dark:bg-slate-800 rounded-md">
                                        {user?.phone}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}