import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    ArrowLeft,
    Heart,
    User,
    Phone,
    Smartphone,
    MapPin,
    Users,
    Star,
    Loader2,
    Save,
    X,
    HelpCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { toast } from 'sonner';
import { beneficiaryService } from '@/services/beneficiary.service';
import { cn } from '@/lib/utils';

// Types based on Swagger
interface EmergencyContact {
    id: string;
    name: string;
    relationship: string;
    phone: string;
    alternatePhone?: string | null;
    address?: string | null;
    isPrimary: boolean;
    createdAt: string;
    updatedAt: string;
}

interface CreateEmergencyContactDto {
    name: string;
    relationship: string;
    phone: string;
    alternatePhone?: string;
    address?: string;
    isPrimary?: boolean;
}

// Animation variants
const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
};

// Relationship options
const relationshipOptions = [
    { value: 'spouse', label: 'Spouse', icon: '💑' },
    { value: 'parent', label: 'Parent', icon: '👪' },
    { value: 'sibling', label: 'Sibling', icon: '👥' },
    { value: 'child', label: 'Child', icon: '👶' },
    { value: 'friend', label: 'Friend', icon: '🤝' },
    { value: 'neighbor', label: 'Neighbor', icon: '🏠' },
    { value: 'colleague', label: 'Colleague', icon: '💼' },
    { value: 'doctor', label: 'Doctor', icon: '👨‍⚕️' },
    { value: 'other', label: 'Other', icon: '📌' }
];

export default function AddEmergencyContactPage() {
    const navigate = useNavigate();
    const { id } = useParams(); // For editing
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        relationship: '',
        phone: '',
        alternatePhone: '',
        address: '',
        isPrimary: false
    });

    useEffect(() => {
        if (id) {
            fetchContact();
        }
    }, [id]);

    const fetchContact = async () => {
        setLoading(true);
        try {
            const response = await beneficiaryService.getEmergencyContactById(id!);

            // ✅ ROBUST EXTRACTION PATTERN
            const responseData = response as any;
            const contactData = responseData.data || responseData;

            if (contactData) {
                setFormData({
                    name: contactData.name || '',
                    relationship: contactData.relationship || '',
                    phone: contactData.phone || '',
                    alternatePhone: contactData.alternatePhone || '',
                    address: contactData.address || '',
                    isPrimary: contactData.isPrimary || false
                });
            }
        } catch (error) {
            console.error('Failed to fetch contact', error);
            toast.error('Failed to load contact details');
            navigate('/beneficiary/contacts');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        if (!formData.name.trim()) {
            toast.error('Please enter a name');
            return;
        }
        if (!formData.relationship) {
            toast.error('Please select a relationship');
            return;
        }
        if (!formData.phone.trim()) {
            toast.error('Please enter a phone number');
            return;
        }

        setSubmitting(true);

        try {
            // Build payload dynamically to match DTO
            const payload: any = {
                name: formData.name.trim(),
                relationship: formData.relationship,
                phone: formData.phone.trim(),
                address: formData.address || '', // Ensure address is always a string
                isPrimary: formData.isPrimary
            };

            // Only add alternatePhone if it has a value
            if (formData.alternatePhone?.trim()) {
                payload.alternatePhone = formData.alternatePhone.trim();
            }

            if (id) {
                await beneficiaryService.updateEmergencyContact(id, payload);
                toast.success('Contact updated successfully');
            } else {
                await beneficiaryService.addEmergencyContact(payload);
                toast.success('Emergency contact added successfully');
            }

            navigate('/beneficiary/contacts');
        } catch (error) {
            console.error('Failed to save contact', error);
            toast.error(id ? 'Failed to update contact' : 'Failed to add contact');
        } finally {
            setSubmitting(false);
        }
    };

    const handleChange = (field: string, value: string | boolean) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-rose-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-rose-950/20">
                <div className="container mx-auto px-4 py-8">
                    <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
                        <Loader2 className="w-12 h-12 animate-spin text-rose-600" />
                        <p className="text-slate-500 dark:text-slate-400">Loading contact details...</p>
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
                variants={fadeInUp}
                className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-rose-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-rose-950/20"
            >
                <div className="container max-w-2xl mx-auto px-4 py-8">

                    {/* Header with Back Button */}
                    <motion.div variants={fadeInUp} className="flex items-center gap-4 mb-6">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => navigate('/beneficiary/contacts')}
                            className="rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 h-10 w-10"
                        >
                            <ArrowLeft className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                        </Button>
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                                {id ? 'Edit Emergency Contact' : 'Add Emergency Contact'}
                            </h1>
                            <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-2 mt-1">
                                <Heart className="w-4 h-4" />
                                <span>{id ? 'Update contact details' : 'Add someone to contact in case of emergency'}</span>
                            </p>
                        </div>
                    </motion.div>

                    {/* Form Card */}
                    <motion.div variants={fadeInUp}>
                        <Card className="border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-lg">
                                    <div className="p-2 rounded-lg bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400">
                                        <User className="w-4 h-4" />
                                    </div>
                                    Contact Information
                                </CardTitle>
                                <CardDescription>
                                    Enter the details of your emergency contact
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleSubmit} className="space-y-6">

                                    {/* Name */}
                                    <div className="space-y-2">
                                        <Label htmlFor="name" className="text-sm font-medium">
                                            Full Name <span className="text-rose-500">*</span>
                                        </Label>
                                        <div className="relative">
                                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                            <Input
                                                id="name"
                                                placeholder="e.g., Marie Uwase"
                                                className="pl-9 border-slate-200 dark:border-slate-700 focus:border-rose-500 focus:ring-rose-500/20"
                                                value={formData.name}
                                                onChange={(e) => handleChange('name', e.target.value)}
                                                required
                                            />
                                        </div>
                                    </div>

                                    {/* Relationship */}
                                    <div className="space-y-2">
                                        <Label htmlFor="relationship" className="text-sm font-medium">
                                            Relationship <span className="text-rose-500">*</span>
                                        </Label>
                                        <Select
                                            value={formData.relationship}
                                            onValueChange={(value) => handleChange('relationship', value)}
                                            required
                                        >
                                            <SelectTrigger className="border-slate-200 dark:border-slate-700">
                                                <SelectValue placeholder="Select relationship" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {relationshipOptions.map(option => (
                                                    <SelectItem key={option.value} value={option.value}>
                                                        <span className="mr-2">{option.icon}</span>
                                                        {option.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {/* Primary Phone */}
                                    <div className="space-y-2">
                                        <Label htmlFor="phone" className="text-sm font-medium">
                                            Phone Number <span className="text-rose-500">*</span>
                                        </Label>
                                        <div className="relative">
                                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                            <Input
                                                id="phone"
                                                placeholder="+250 788 123 456"
                                                className="pl-9 border-slate-200 dark:border-slate-700 focus:border-rose-500 focus:ring-rose-500/20"
                                                value={formData.phone}
                                                onChange={(e) => handleChange('phone', e.target.value)}
                                                required
                                            />
                                        </div>
                                        <p className="text-xs text-slate-500">
                                            Include country code for international numbers
                                        </p>
                                    </div>

                                    {/* Alternate Phone (Optional) */}
                                    <div className="space-y-2">
                                        <Label htmlFor="alternatePhone" className="text-sm font-medium">
                                            Alternate Phone <span className="text-slate-400">(Optional)</span>
                                        </Label>
                                        <div className="relative">
                                            <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                            <Input
                                                id="alternatePhone"
                                                placeholder="+250 788 123 457"
                                                className="pl-9 border-slate-200 dark:border-slate-700 focus:border-rose-500 focus:ring-rose-500/20"
                                                value={formData.alternatePhone}
                                                onChange={(e) => handleChange('alternatePhone', e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    {/* Address (Optional) */}
                                    <div className="space-y-2">
                                        <Label htmlFor="address" className="text-sm font-medium">
                                            Address <span className="text-slate-400">(Optional)</span>
                                        </Label>
                                        <div className="relative">
                                            <MapPin className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                                            <Textarea
                                                id="address"
                                                placeholder="e.g., Kigali, Rwanda"
                                                className="pl-9 min-h-[80px] border-slate-200 dark:border-slate-700 focus:border-rose-500 focus:ring-rose-500/20"
                                                value={formData.address}
                                                onChange={(e) => handleChange('address', e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    {/* Primary Contact Toggle */}
                                    <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                                        <div className="flex items-start gap-3">
                                            <Star className={cn(
                                                "w-5 h-5 mt-0.5",
                                                formData.isPrimary ? "text-amber-500" : "text-slate-400"
                                            )} />
                                            <div>
                                                <Label htmlFor="isPrimary" className="text-sm font-medium">
                                                    Set as Primary Contact
                                                </Label>
                                                <p className="text-xs text-slate-500">
                                                    This person will be contacted first in case of emergency
                                                </p>
                                            </div>
                                        </div>
                                        <Switch
                                            id="isPrimary"
                                            checked={formData.isPrimary}
                                            onCheckedChange={(checked) => handleChange('isPrimary', checked)}
                                            className="data-[state=checked]:bg-amber-600"
                                        />
                                    </div>

                                    {/* Tips */}
                                    <div className="p-4 bg-rose-50/50 dark:bg-rose-950/20 rounded-lg border border-rose-100 dark:border-rose-900/30">
                                        <div className="flex items-start gap-3">
                                            <HelpCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
                                            <div>
                                                <p className="text-xs font-medium text-rose-800 dark:text-rose-300">Important</p>
                                                <ul className="text-xs text-rose-600 dark:text-rose-400 mt-1 space-y-1 list-disc list-inside">
                                                    <li>Ensure the phone number is correct and reachable</li>
                                                    <li>You can only have one primary contact</li>
                                                    <li>Update contact details if they change</li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Form Actions */}
                                    <div className="flex items-center gap-3 pt-4">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            className="flex-1 h-11 border-slate-200 dark:border-slate-700"
                                            onClick={() => navigate('/beneficiary/contacts')}
                                        >
                                            <X className="w-4 h-4 mr-2" />
                                            Cancel
                                        </Button>
                                        <Button
                                            type="submit"
                                            className="flex-1 h-11 bg-rose-600 hover:bg-rose-700 text-white"
                                            disabled={submitting}
                                        >
                                            {submitting ? (
                                                <>
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                    {id ? 'Updating...' : 'Saving...'}
                                                </>
                                            ) : (
                                                <>
                                                    <Save className="w-4 h-4 mr-2" />
                                                    {id ? 'Update Contact' : 'Save Contact'}
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>
            </motion.div>
        </TooltipProvider>
    );
} 