import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/lib/auth-context";
import { UserType, Currency, ReceiptPreference } from "@/lib/types";
import { donorService } from "@/services/donor.service";
import { toast } from "sonner";
import {
    User,
    Globe,
    DollarSign,
    Mail,
    Heart,
    Bell,
    Eye,
    EyeOff,
    Loader2,
    Save,
    Pencil,
    X,
    AlertCircle,
    CheckCircle2,
    Info,
    Receipt,
    MapPin,
    ChevronLeft
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format, isValid, parseISO } from "date-fns";

// Types
interface CommunicationPreferences {
    email: boolean;
    sms: boolean;
}

interface DonorProfile {
    id?: string;
    country: string;
    preferredCurrency: Currency;
    communicationPreferences: CommunicationPreferences;
    receiptPreference: ReceiptPreference;
    anonymityPreference: boolean;
    receiveNewsletter: boolean;
    totalDonated?: number;
    lastDonationDate?: string | null;
    isRecurringDonor?: boolean;
    createdAt?: string;
    updatedAt?: string;
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

export default function DonorProfilePage() {
    const { user, refreshUser } = useAuth();
    const navigate = useNavigate();
    
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    
    // Profile Data
    const [profile, setProfile] = useState<DonorProfile | null>(null);
    
    // Form State
    const [formData, setFormData] = useState({
        country: "",
        preferredCurrency: Currency.RWF,
        communicationPreferences: {
            email: true,
            sms: true
        },
        receiptPreference: ReceiptPreference.EMAIL,
        anonymityPreference: false,
        receiveNewsletter: true
    });

    // Fetch profile on mount
    useEffect(() => {
        if (user?.userType === UserType.DONOR) {
            fetchProfile();
        }
    }, [user]);

    const fetchProfile = async () => {
        setFetching(true);
        try {
            const profileResponse = await donorService.getProfile();
            
            const profileData = profileResponse as any;
            const donorData = profileData.data?.data || profileData.data || profileData;
            
            if (!donorData) {
                // This should not happen with ProfileGuard, but just in case
                toast.error("Profile not found", {
                    description: "Redirecting to profile creation..."
                });
                navigate('/donor/complete-profile', { replace: true });
                return;
            }
            
            setProfile(donorData);
            
            setFormData({
                country: donorData.country || "",
                preferredCurrency: donorData.preferredCurrency || Currency.RWF,
                communicationPreferences: {
                    email: donorData.communicationPreferences?.email ?? true,
                    sms: donorData.communicationPreferences?.sms ?? true
                },
                receiptPreference: donorData.receiptPreference || ReceiptPreference.EMAIL,
                anonymityPreference: donorData.anonymityPreference || false,
                receiveNewsletter: donorData.receiveNewsletter ?? true
            });
            
        } catch (error: any) {
            console.error("Failed to fetch profile", error);
            toast.error("Failed to load profile");
        } finally {
            setFetching(false);
        }
    };

    const handleChange = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleCommunicationChange = (field: keyof CommunicationPreferences, value: boolean) => {
        setFormData(prev => ({
            ...prev,
            communicationPreferences: {
                ...prev.communicationPreferences,
                [field]: value
            }
        }));
    };

    const handleSubmit = async () => {
        // Validate required fields
        const requiredFields = [
            { field: 'country', label: 'Country' },
            { field: 'preferredCurrency', label: 'Preferred Currency' },
            { field: 'receiptPreference', label: 'Receipt Preference' }
        ];

        const missingFields = requiredFields.filter(f => !formData[f.field as keyof typeof formData]);

        if (missingFields.length > 0) {
            toast.error("Please fill in all required fields", {
                description: `Missing: ${missingFields.map(f => f.label).join(', ')}`
            });
            return;
        }

        setLoading(true);
        try {
            const payload = {
                country: formData.country,
                preferredCurrency: formData.preferredCurrency,
                communicationPreferences: formData.communicationPreferences,
                receiptPreference: formData.receiptPreference,
                anonymityPreference: formData.anonymityPreference,
                receiveNewsletter: formData.receiveNewsletter
            };

            await donorService.updateProfile(payload);
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
                country: profile.country || "",
                preferredCurrency: profile.preferredCurrency || Currency.RWF,
                communicationPreferences: {
                    email: profile.communicationPreferences?.email ?? true,
                    sms: profile.communicationPreferences?.sms ?? true
                },
                receiptPreference: profile.receiptPreference || ReceiptPreference.EMAIL,
                anonymityPreference: profile.anonymityPreference || false,
                receiveNewsletter: profile.receiveNewsletter ?? true
            });
        }
        setIsEditing(false);
    };

    const initials = user?.fullName
        ? user.fullName.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase()
        : "D";

    if (!user || user.userType !== UserType.DONOR) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <p className="text-muted-foreground">Access denied. Donor only.</p>
            </div>
        );
    }

    if (fetching) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-rose-600" />
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-500 pt-0 pb-10">
            {/* Back Button */}
            <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/donor')}
                className="mb-2 text-slate-600 hover:text-slate-900"
            >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Back to Dashboard
            </Button>

            {/* Profile Header */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="px-6 py-8 flex flex-col sm:flex-row items-center sm:items-end gap-6">
                    <div className="relative group">
                        <Avatar className="h-28 w-28 border-4 border-white shadow-xl rounded-2xl">
                            <AvatarImage src={user.profileImageUrl} alt={user.fullName} />
                            <AvatarFallback className="text-4xl font-bold bg-white text-white rounded-2xl">
                                {initials}
                            </AvatarFallback>
                        </Avatar>
                    </div>

                    <div className="flex-1 text-center sm:text-left">
                        <h1 className="text-3xl font-bold text-slate-900 mb-1">
                            {user.fullName}
                        </h1>
                        <div className="flex items-center justify-center sm:justify-start gap-3 text-slate-500 mb-3">
                            <Badge variant="outline" className="bg-rose-50 text-rose-700 border-rose-200">
                                Donor
                            </Badge>
                            <span className="text-sm">{user.email}</span>
                        </div>

                        {/* Donor Badge */}
                        {profile?.isRecurringDonor && (
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-rose-50 rounded-full">
                                <Heart className="h-3.5 w-3.5 text-rose-600" />
                                <span className="text-sm font-medium text-rose-700">
                                    Recurring Donor
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
                                    className="rounded-xl border-slate-200"
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
                    <Card className="border-none shadow-sm bg-white">
                        <CardHeader className="pb-3 border-b border-slate-100">
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
                                    <div className="pt-2 border-t border-slate-100">
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

                    {/* Donation Stats */}
                    {profile && (
                        <Card className="bg-rose-50 border-none shadow-sm">
                            <CardContent className="p-6 space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-white rounded-lg shadow-sm">
                                        <Heart className="h-5 w-5 text-rose-600" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-rose-600 font-bold uppercase">
                                            Total Donated
                                        </p>
                                        <p className="text-2xl font-bold text-rose-900">
                                            {profile.preferredCurrency} {profile.totalDonated?.toLocaleString() || '0'}
                                        </p>
                                    </div>
                                </div>

                                {profile.lastDonationDate && (
                                    <div className="text-sm text-slate-600 pt-2 border-t border-rose-200">
                                        Last donation: {formatSafeDate(profile.lastDonationDate)}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Right Column - Profile Form */}
                <div className="lg:col-span-2 space-y-6">
                    <Card className="border-none shadow-sm bg-white">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <User className="h-5 w-5 text-rose-600" />
                                Donor Information
                            </CardTitle>
                            <CardDescription>
                                {isEditing ? "Edit your donor preferences" : "Your donor profile information"}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Country */}
                            <div className="space-y-2">
                                <Label className="text-sm font-medium">
                                    Country <span className="text-rose-500">*</span>
                                </Label>
                                {isEditing ? (
                                    <div className="relative">
                                        <Input
                                            value={formData.country}
                                            onChange={(e) => handleChange('country', e.target.value)}
                                            placeholder="Enter your country"
                                            className="pl-9"
                                        />
                                        <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                    </div>
                                ) : (
                                    <p className="text-lg font-medium p-2 bg-slate-50 rounded-md flex items-center gap-2">
                                        <Globe className="h-4 w-4 text-slate-400" />
                                        {profile?.country}
                                    </p>
                                )}
                            </div>

                            {/* Preferred Currency */}
                            <div className="space-y-2">
                                <Label className="text-sm font-medium">
                                    Preferred Currency <span className="text-rose-500">*</span>
                                </Label>
                                {isEditing ? (
                                    <Select
                                        value={formData.preferredCurrency}
                                        onValueChange={(value: Currency) => handleChange('preferredCurrency', value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select currency" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {Object.values(Currency).map((currency) => (
                                                <SelectItem key={currency} value={currency}>
                                                    {currency}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                ) : (
                                    <p className="text-lg font-medium p-2 bg-slate-50 rounded-md flex items-center gap-2">
                                        <DollarSign className="h-4 w-4 text-slate-400" />
                                        {profile?.preferredCurrency}
                                    </p>
                                )}
                            </div>

                            {/* Receipt Preference */}
                            <div className="space-y-2">
                                <Label className="text-sm font-medium">
                                    Receipt Preference <span className="text-rose-500">*</span>
                                </Label>
                                {isEditing ? (
                                    <Select
                                        value={formData.receiptPreference}
                                        onValueChange={(value: ReceiptPreference) => handleChange('receiptPreference', value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select receipt preference" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value={ReceiptPreference.EMAIL}>
                                                <div className="flex items-center gap-2">
                                                    <Mail className="h-4 w-4" />
                                                    Email
                                                </div>
                                            </SelectItem>
                                            <SelectItem value={ReceiptPreference.POSTAL}>
                                                <div className="flex items-center gap-2">
                                                    <Receipt className="h-4 w-4" />
                                                    Postal Mail
                                                </div>
                                            </SelectItem>
                                            <SelectItem value={ReceiptPreference.NONE}>
                                                <div className="flex items-center gap-2">
                                                    <EyeOff className="h-4 w-4" />
                                                    No Receipt
                                                </div>
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                ) : (
                                    <p className="text-lg font-medium p-2 bg-slate-50 rounded-md capitalize">
                                        {profile?.receiptPreference}
                                    </p>
                                )}
                            </div>

                            {/* Communication Preferences */}
                            <div className="pt-4 border-t border-slate-100">
                                <h3 className="text-sm font-semibold flex items-center gap-2 mb-4">
                                    <Bell className="h-4 w-4 text-rose-600" />
                                    Communication Preferences
                                </h3>
                                
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <Label className="text-sm font-medium">Email Notifications</Label>
                                        {isEditing ? (
                                            <Switch
                                                checked={formData.communicationPreferences.email}
                                                onCheckedChange={(checked) => handleCommunicationChange('email', checked)}
                                            />
                                        ) : (
                                            <Badge variant={profile?.communicationPreferences?.email ? "default" : "secondary"}>
                                                {profile?.communicationPreferences?.email ? 'Enabled' : 'Disabled'}
                                            </Badge>
                                        )}
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <Label className="text-sm font-medium">SMS Notifications</Label>
                                        {isEditing ? (
                                            <Switch
                                                checked={formData.communicationPreferences.sms}
                                                onCheckedChange={(checked) => handleCommunicationChange('sms', checked)}
                                            />
                                        ) : (
                                            <Badge variant={profile?.communicationPreferences?.sms ? "default" : "secondary"}>
                                                {profile?.communicationPreferences?.sms ? 'Enabled' : 'Disabled'}
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Additional Preferences */}
                            <div className="pt-4 border-t border-slate-100">
                                <h3 className="text-sm font-semibold flex items-center gap-2 mb-4">
                                    <Heart className="h-4 w-4 text-rose-600" />
                                    Additional Preferences
                                </h3>

                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <Label className="text-sm font-medium">Remain Anonymous</Label>
                                        {isEditing ? (
                                            <Switch
                                                checked={formData.anonymityPreference}
                                                onCheckedChange={(checked) => handleChange('anonymityPreference', checked)}
                                            />
                                        ) : (
                                            <Badge variant={profile?.anonymityPreference ? "default" : "secondary"}>
                                                {profile?.anonymityPreference ? 'Anonymous' : 'Public'}
                                            </Badge>
                                        )}
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <Label className="text-sm font-medium">Newsletter</Label>
                                        {isEditing ? (
                                            <Switch
                                                checked={formData.receiveNewsletter}
                                                onCheckedChange={(checked) => handleChange('receiveNewsletter', checked)}
                                            />
                                        ) : (
                                            <Badge variant={profile?.receiveNewsletter ? "default" : "secondary"}>
                                                {profile?.receiveNewsletter ? 'Subscribed' : 'Unsubscribed'}
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}