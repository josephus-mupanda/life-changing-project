import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
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
    ArrowRight,
    Info,
    Receipt,
    CheckCircle2,
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

export default function CompleteDonorProfilePage() {
    const navigate = useNavigate();
    const { user, refreshUser } = useAuth();
    
    const [loading, setLoading] = useState(false);
    const [checkingStatus, setCheckingStatus] = useState(true);
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

    // Check if profile already exists
    useEffect(() => {
        checkProfileStatus();
    }, []);

    const checkProfileStatus = async () => {
        try {
            const response = await donorService.getProfileStatus();
            const responseData = response as any;
            const statusData = responseData.data?.data || responseData.data || responseData;
            
            // If profile already exists, redirect to dashboard
            if (statusData.hasProfile) {
                toast.info("You already have a donor profile", {
                    description: "Redirecting to dashboard..."
                });
                navigate('/donor', { replace: true });
            }
        } catch (error) {
            console.error("Failed to check profile status", error);
        } finally {
            setCheckingStatus(false);
        }
    };

    const handleChange = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleCommunicationChange = (field: keyof typeof formData.communicationPreferences, value: boolean) => {
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

            await donorService.createProfile(payload);
            
            await refreshUser();
            
            toast.success("Welcome to LCEO Donor Community!", {
                description: "Your donor profile has been created successfully."
            });
            
            navigate('/donor', { replace: true });
            
        } catch (error: any) {
            console.error("Failed to create donor profile", error);
            
            if (error.response?.status === 409) {
                toast.error("Profile already exists", {
                    description: "Redirecting to dashboard..."
                });
                navigate('/donor', { replace: true });
            } else {
                toast.error("Failed to create profile", {
                    description: error.response?.data?.message || "Please try again later."
                });
            }
        } finally {
            setLoading(false);
        }
    };

    const handleSkip = () => {
        toast.info("You can complete your profile later from the Profile page", {
            description: "Redirecting to dashboard..."
        });
        navigate('/donor', { replace: true });
    };

    if (checkingStatus) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin text-rose-600 mx-auto mb-4" />
                    <p className="text-slate-500">Checking your profile status...</p>
                </div>
            </div>
        );
    }

    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="min-h-screen bg-slate-50 py-12"
        >
            <div className="container max-w-3xl mx-auto px-4">
                {/* Welcome Header */}
                <motion.div variants={fadeInUp} className="text-center mb-8">
                    <div className="inline-flex items-center justify-center p-3 bg-rose-100 rounded-full mb-4">
                        <Heart className="h-8 w-8 text-rose-600" />
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">
                        Welcome to LCEO, {user?.fullName?.split(' ')[0] || 'Donor'}!
                    </h1>
                    <p className="text-lg text-slate-500 max-w-xl mx-auto">
                        Let's set up your donor profile. This helps us personalize your experience and track your impact.
                    </p>
                </motion.div>

                {/* Progress Steps */}
                <motion.div variants={fadeInUp} className="mb-8">
                    <div className="flex items-center justify-between max-w-md mx-auto">
                        <div className="flex flex-col items-center">
                            <div className="w-8 h-8 rounded-full bg-rose-600 text-white flex items-center justify-center text-sm font-bold">
                                1
                            </div>
                            <span className="text-xs mt-1 text-rose-600 font-medium">Welcome</span>
                        </div>
                        <div className="flex-1 h-0.5 bg-rose-200 mx-2" />
                        <div className="flex flex-col items-center">
                            <div className="w-8 h-8 rounded-full bg-rose-600 text-white flex items-center justify-center text-sm font-bold">
                                2
                            </div>
                            <span className="text-xs mt-1 text-rose-600 font-medium">Profile</span>
                        </div>
                        <div className="flex-1 h-0.5 bg-slate-200 mx-2" />
                        <div className="flex flex-col items-center">
                            <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center text-sm font-bold">
                                3
                            </div>
                            <span className="text-xs mt-1 text-slate-400">Dashboard</span>
                        </div>
                    </div>
                </motion.div>

                {/* Profile Form Card */}
                <motion.div variants={fadeInUp}>
                    <Card className="border-none shadow-xl bg-white">
                        <CardHeader className="text-center border-b border-slate-200 pb-6">
                            <CardTitle className="text-2xl font-bold text-slate-900">
                                Complete Your Donor Profile
                            </CardTitle>
                            <CardDescription className="text-base">
                                Fields marked with * are required. Others are optional.
                            </CardDescription>
                        </CardHeader>

                        <CardContent className="pt-8 space-y-8">
                            {/* Donor Information */}
                            <div className="space-y-6">
                                <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2 pb-2 border-b border-slate-100">
                                    <User className="h-5 w-5 text-rose-600" />
                                    Donor Information
                                </h3>

                                {/* Country - Required */}
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium flex items-center gap-1">
                                        Country <span className="text-rose-500">*</span>
                                    </Label>
                                    <div className="relative">
                                        <Input
                                            value={formData.country}
                                            onChange={(e) => handleChange('country', e.target.value)}
                                            placeholder="Enter your country (e.g., Rwanda, USA, Canada)"
                                            className="pl-9 h-12"
                                        />
                                        <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                    </div>
                                    <p className="text-xs text-slate-400">Your country of residence</p>
                                </div>

                                {/* Preferred Currency - Required */}
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium flex items-center gap-1">
                                        Preferred Currency <span className="text-rose-500">*</span>
                                    </Label>
                                    <Select
                                        value={formData.preferredCurrency}
                                        onValueChange={(value: Currency) => handleChange('preferredCurrency', value)}
                                    >
                                        <SelectTrigger className="h-12">
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
                                    <p className="text-xs text-slate-400">Currency for displaying donation amounts</p>
                                </div>

                                {/* Receipt Preference - Required */}
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium flex items-center gap-1">
                                        Receipt Preference <span className="text-rose-500">*</span>
                                    </Label>
                                    <Select
                                        value={formData.receiptPreference}
                                        onValueChange={(value: ReceiptPreference) => handleChange('receiptPreference', value)}
                                    >
                                        <SelectTrigger className="h-12">
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
                                    <p className="text-xs text-slate-400">How you prefer to receive donation receipts</p>
                                </div>
                            </div>

                            {/* Communication Preferences */}
                            <div className="space-y-4 pt-4 border-t border-slate-200">
                                <h3 className="text-lg font-semibold flex items-center gap-2">
                                    <Bell className="h-5 w-5 text-rose-600" />
                                    Communication Preferences
                                    <span className="text-xs font-normal text-slate-500 ml-2">(Optional)</span>
                                </h3>
                                
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                                        <div className="space-y-0.5">
                                            <Label className="text-sm font-medium">Email Notifications</Label>
                                            <p className="text-xs text-slate-500">
                                                Receive updates about your donations
                                            </p>
                                        </div>
                                        <Switch
                                            checked={formData.communicationPreferences.email}
                                            onCheckedChange={(checked) => handleCommunicationChange('email', checked)}
                                        />
                                    </div>

                                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                                        <div className="space-y-0.5">
                                            <Label className="text-sm font-medium">SMS Notifications</Label>
                                            <p className="text-xs text-slate-500">
                                                Get text messages for important updates
                                            </p>
                                        </div>
                                        <Switch
                                            checked={formData.communicationPreferences.sms}
                                            onCheckedChange={(checked) => handleCommunicationChange('sms', checked)}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Additional Preferences */}
                            <div className="space-y-4 pt-4 border-t border-slate-200">
                                <h3 className="text-lg font-semibold flex items-center gap-2">
                                    <Heart className="h-5 w-5 text-rose-600" />
                                    Additional Preferences
                                    <span className="text-xs font-normal text-slate-500 ml-2">(Optional)</span>
                                </h3>

                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                                        <div className="space-y-0.5">
                                            <Label className="text-sm font-medium">Remain Anonymous</Label>
                                            <p className="text-xs text-slate-500">
                                                Hide your name from public recognition
                                            </p>
                                        </div>
                                        <Switch
                                            checked={formData.anonymityPreference}
                                            onCheckedChange={(checked) => handleChange('anonymityPreference', checked)}
                                        />
                                    </div>

                                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                                        <div className="space-y-0.5">
                                            <Label className="text-sm font-medium">Newsletter</Label>
                                            <p className="text-xs text-slate-500">
                                                Receive our monthly newsletter with impact stories
                                            </p>
                                        </div>
                                        <Switch
                                            checked={formData.receiveNewsletter}
                                            onCheckedChange={(checked) => handleChange('receiveNewsletter', checked)}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Info Box */}
                            <div className="bg-blue-50 p-5 rounded-lg border border-blue-200">
                                <div className="flex items-start gap-3">
                                    <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-sm font-medium text-blue-800 mb-2">
                                            Why complete your donor profile?
                                        </p>
                                        <ul className="text-xs text-blue-600 space-y-1 list-disc list-inside">
                                            <li>Make one-time or recurring donations</li>
                                            <li>Track your total impact over time</li>
                                            <li>Receive tax-deductible receipts automatically</li>
                                            <li>Get personalized updates on programs you support</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex flex-col sm:flex-row gap-3 pt-4">
                                <Button
                                    onClick={handleSubmit}
                                    className="flex-1 h-12 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-xl"
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
                                    className="flex-1 h-12 border-slate-200 hover:bg-slate-100 font-semibold rounded-xl"
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
                    <Card className="bg-white/50 border-slate-200">
                        <CardContent className="p-4 flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-rose-100">
                                <Heart className="h-4 w-4 text-rose-600" />
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-slate-900">Track Impact</p>
                                <p className="text-xs text-slate-500">See where your money goes</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-white/50 border-slate-200">
                        <CardContent className="p-4 flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-rose-100">
                                <Receipt className="h-4 w-4 text-rose-600" />
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-slate-900">Auto Receipts</p>
                                <p className="text-xs text-slate-500">Get receipts automatically</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-white/50 border-slate-200">
                        <CardContent className="p-4 flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-rose-100">
                                <Shield className="h-4 w-4 text-rose-600" />
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-slate-900">Privacy First</p>
                                <p className="text-xs text-slate-500">Control your anonymity</p>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </motion.div>
    );
}