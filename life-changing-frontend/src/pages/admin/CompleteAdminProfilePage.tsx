import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
    Loader2,
    Info,
    ArrowRight,
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

export default function CompleteAdminProfilePage() {
    const navigate = useNavigate();
    const { user, refreshUser } = useAuth();

    const [loading, setLoading] = useState(false);
    const [checkingStatus, setCheckingStatus] = useState(true);
    const hasCheckedRef = useRef(false); // Add this ref to prevent double-checking

    const [formData, setFormData] = useState({
        position: "",
        department: "",
        emergencyContact: "",
        emergencyPhone: "",
        address: ""
    });

    // Check if profile already exists
    // Check if profile already exists - only once
    useEffect(() => {
        // Prevent double execution in strict mode
        if (hasCheckedRef.current) return;
        hasCheckedRef.current = true;
        const checkProfileStatus = async () => {
            try {
                const response = await staffService.getProfileStatus();
                const statusData = (response as any).data?.data || (response as any).data || response;

                // If profile already exists, redirect to dashboard
                if (statusData.hasProfile) {
                    toast.info("You already have a staff profile", {
                        description: "Redirecting to dashboard..."
                    });
                    navigate('/admin', { replace: true });
                }
            } catch (error) {
                console.error("Failed to check profile status", error);
                // If error, assume no profile and let user fill form
            } finally {
                setCheckingStatus(false);
            }
        };

        checkProfileStatus();
    }, [navigate]);

    const checkProfileStatus = async () => {
        try {
            const response = await staffService.getProfileStatus();
            const responseData = response as any;
            const statusData = responseData.data?.data || responseData.data || responseData;

            // If profile already exists, redirect to dashboard
            if (statusData.hasProfile) {
                toast.info("You already have a staff profile", {
                    description: "Redirecting to dashboard..."
                });
                navigate('/admin', { replace: true });
            }
        } catch (error) {
            console.error("Failed to check profile status", error);
        } finally {
            setCheckingStatus(false);
        }
    };

    const handleChange = (field: keyof typeof formData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            // Prepare payload - only send non-empty fields
            const payload: any = {};

            if (formData.position?.trim()) payload.position = formData.position.trim();
            if (formData.department?.trim()) payload.department = formData.department.trim();

            const contactInfo: any = {};
            if (formData.emergencyContact?.trim()) contactInfo.emergencyContact = formData.emergencyContact.trim();
            if (formData.emergencyPhone?.trim()) contactInfo.emergencyPhone = formData.emergencyPhone.trim();
            if (formData.address?.trim()) contactInfo.address = formData.address.trim();

            if (Object.keys(contactInfo).length > 0) {
                payload.contactInfo = contactInfo;
            }

            // Create profile
            await staffService.createProfile(payload);

            // Refresh user data
            await refreshUser();

            toast.success("Welcome to LCEO Admin!", {
                description: "Your staff profile has been created successfully."
            });

            // Redirect to admin dashboard
            navigate('/admin', { replace: true });

        } catch (error: any) {
            console.error("Failed to create staff profile", error);

            if (error.response?.status === 409) {
                toast.error("Profile already exists", {
                    description: "Redirecting to dashboard..."
                });
                navigate('/admin', { replace: true });
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
        navigate('/admin', { replace: true });
    };

    if (checkingStatus) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-teal-950/20 flex items-center justify-center">
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
            className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-teal-950/20 py-12"
        >
            <div className="container max-w-3xl mx-auto px-4">
                {/* Welcome Header */}
                <motion.div variants={fadeInUp} className="text-center mb-8">
                    <div className="inline-flex items-center justify-center p-3 bg-teal-100 dark:bg-teal-900/30 rounded-full mb-4">
                        <Shield className="h-8 w-8 text-teal-600 dark:text-teal-400" />
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-2">
                        Welcome to LCEO Admin, {user?.fullName?.split(' ')[0] || 'Admin'}!
                    </h1>
                    <p className="text-lg text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
                        Let's set up your staff profile. This helps us know more about you and enables admin features.
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
                                Complete Your Staff Profile
                            </CardTitle>
                            <CardDescription className="text-base">
                                All fields are optional. You can always update them later.
                            </CardDescription>
                        </CardHeader>

                        <CardContent className="pt-8 space-y-8">
                            {/* Staff Information */}
                            <div className="space-y-6">
                                <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
                                    <Briefcase className="h-5 w-5 text-teal-600" />
                                    Staff Information
                                </h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label className="text-xs uppercase font-bold tracking-wider text-slate-500 flex items-center gap-1">
                                            <Briefcase className="h-3 w-3" /> Position
                                            <span className="text-xs font-normal text-slate-400 ml-1">(Optional)</span>
                                        </Label>
                                        <Input
                                            value={formData.position}
                                            onChange={(e) => handleChange('position', e.target.value)}
                                            placeholder="e.g. Program Manager"
                                            className="h-12 bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800"
                                            disabled={loading}
                                        />
                                        <p className="text-xs text-slate-400">Your job title or role</p>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-xs uppercase font-bold tracking-wider text-slate-500 flex items-center gap-1">
                                            <Building className="h-3 w-3" /> Department
                                            <span className="text-xs font-normal text-slate-400 ml-1">(Optional)</span>
                                        </Label>
                                        <Input
                                            value={formData.department}
                                            onChange={(e) => handleChange('department', e.target.value)}
                                            placeholder="e.g. Operations"
                                            className="h-12 bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800"
                                            disabled={loading}
                                        />
                                        <p className="text-xs text-slate-400">The department you work in</p>
                                    </div>
                                </div>
                            </div>

                            {/* Emergency Contact */}
                            <div className="space-y-6">
                                <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
                                    <Phone className="h-5 w-5 text-teal-600" />
                                    Emergency Contact
                                    <span className="text-xs font-normal text-slate-500 ml-2">(Optional)</span>
                                </h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label className="text-xs uppercase font-bold tracking-wider text-slate-500">
                                            Contact Name
                                        </Label>
                                        <Input
                                            value={formData.emergencyContact}
                                            onChange={(e) => handleChange('emergencyContact', e.target.value)}
                                            placeholder="e.g. Jane Doe"
                                            className="h-12 bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800"
                                            disabled={loading}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-xs uppercase font-bold tracking-wider text-slate-500">
                                            Emergency Phone
                                        </Label>
                                        <Input
                                            value={formData.emergencyPhone}
                                            onChange={(e) => handleChange('emergencyPhone', e.target.value)}
                                            placeholder="+250 788 123 456"
                                            className="h-12 bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800"
                                            disabled={loading}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-xs uppercase font-bold tracking-wider text-slate-500 flex items-center gap-1">
                                        <MapPin className="h-3 w-3" /> Address
                                    </Label>
                                    <Textarea
                                        value={formData.address}
                                        onChange={(e) => handleChange('address', e.target.value)}
                                        placeholder="e.g. Kigali, Rwanda"
                                        className="min-h-[80px] bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800"
                                        disabled={loading}
                                    />
                                </div>
                            </div>

                            {/* Info Box */}
                            <div className="bg-teal-100 dark:bg-teal-900/30 p-5 rounded-lg border border-blue-200 dark:border-blue-800">
                                <div className="flex items-start gap-3">
                                    <Info className="h-5 w-5 text-teal-600 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-sm font-medium text-teal-600 mb-2">
                                            Why complete your profile?
                                        </p>
                                        <ul className="text-xs text-teal-600 dark:text-teal-400 space-y-1 list-disc list-inside">
                                            <li>Verify beneficiary documents</li>
                                            <li>Perform bulk verification operations</li>
                                            <li>Track your verification history</li>
                                            <li>Maintain audit trails for compliance</li>
                                        </ul>
                                        <p className="text-xs text-teal-600 dark:text-teal-400 mt-3">
                                            You can always update your profile later from the Profile page.
                                        </p>
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
                                You can always complete your profile later from the Profile page
                            </p>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Features Grid */}
                <motion.div variants={fadeInUp} className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
                    <Card className="bg-white/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800">
                        <CardContent className="p-4 flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-teal-100 dark:bg-teal-900/30">
                                <Shield className="h-4 w-4 text-teal-600" />
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-slate-900 dark:text-white">Secure</p>
                                <p className="text-xs text-slate-500">Your data is protected</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-white/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800">
                        <CardContent className="p-4 flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-teal-100 dark:bg-teal-900/30">
                                <CheckCircle2 className="h-4 w-4 text-teal-600" />
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-slate-900 dark:text-white">Optional Fields</p>
                                <p className="text-xs text-slate-500">Fill only what you need</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-white/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800">
                        <CardContent className="p-4 flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-teal-100 dark:bg-teal-900/30">
                                <User className="h-4 w-4 text-teal-600" />
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-slate-900 dark:text-white">Editable</p>
                                <p className="text-xs text-slate-500">Update anytime</p>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </motion.div>
    );
}