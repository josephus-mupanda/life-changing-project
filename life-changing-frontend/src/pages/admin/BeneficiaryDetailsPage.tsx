import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    User, MapPin, Calendar, BookOpen, Activity, FileText, CheckCircle, XCircle, ArrowLeft, Loader2,
    Plus, Trash2, Download, Eye, Upload, Shield, ShieldOff, MoreVertical, CheckSquare, Square,
    AlertCircle, HardDrive, Clock, Award, TrendingUp, Target, Phone, Mail, Heart, Users,
    Briefcase, DollarSign, Home, Star, StarOff, PhoneCall, MessageCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { beneficiaryService } from '@/services/beneficiary.service';
import { Beneficiary, BeneficiaryStatus, BusinessGoal, GoalType, GoalStatus } from '@/lib/types';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { format, isValid, parseISO } from 'date-fns';

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

interface TrackingRecord {
    id: string;
    weekEnding: string;
    attendance: string;
    incomeThisWeek: string;
    expensesThisWeek: string;
    currentCapital: string;
    challenges?: string;
    solutionsImplemented?: string;
    submittedAt: string;
    verifiedAt: string | null;
    isVerified?: boolean;
}

interface Goal extends BusinessGoal {
    milestones?: Array<{
        targetDate: string;
        description: string;
        targetAmount: number;
    }>;
    notes?: string;
    actionPlan?: {
        steps: string[];
        timeline: string;
        resourcesNeeded: string[];
    };
}

interface BeneficiaryDocument {
    id: string;
    documentType: string;
    fileUrl: string;
    fileName: string;
    fileSize: number;
    mimeType: string;
    verified: boolean;
    verifiedAt?: string | null;
    uploadedByType: string;
    uploadedBy?: {
        id: string;
        fullName: string;
    };
    createdAt: string;
}

// ✅ Safe date formatting function
const formatSafeDate = (date: string | Date | null | undefined, formatStr: string = 'MMM d, yyyy'): string => {
    if (!date) return 'N/A';

    try {
        const dateObj = typeof date === 'string' ? parseISO(date) : date;
        if (!isValid(dateObj)) return 'Invalid date';
        return format(dateObj, formatStr);
    } catch (error) {
        console.warn('Date formatting error:', error);
        return 'Invalid date';
    }
};

// Format file size
const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Get document icon based on mime type
const getDocumentIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return '🖼️';
    if (mimeType.startsWith('video/')) return '🎥';
    if (mimeType === 'application/pdf') return '📄';
    if (mimeType.includes('spreadsheet') || mimeType.includes('excel')) return '📊';
    if (mimeType.includes('word') || mimeType.includes('document')) return '📝';
    return '📁';
};

// Get relationship badge color
const getRelationshipColor = (relationship: string) => {
    const colors: Record<string, string> = {
        family: 'bg-amber-100 text-amber-700 border-amber-200',
        parent: 'bg-indigo-100 text-indigo-700 border-indigo-200',
        sibling: 'bg-cyan-100 text-cyan-700 border-cyan-200',
        spouse: 'bg-pink-100 text-pink-700 border-pink-200',
        friend: 'bg-blue-100 text-blue-700 border-blue-200',
        neighbor: 'bg-green-100 text-green-700 border-green-200',
        colleague: 'bg-purple-100 text-purple-700 border-purple-200',
        doctor: 'bg-rose-100 text-rose-700 border-rose-200',
        other: 'bg-slate-100 text-slate-700 border-slate-200'
    };
    return colors[relationship] || colors.other;
};

export default function BeneficiaryDetailsPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    // State
    const [beneficiary, setBeneficiary] = useState<Beneficiary | null>(null);
    const [loading, setLoading] = useState(true);

    // Tab States
    const [trackingHistory, setTrackingHistory] = useState<TrackingRecord[]>([]);
    const [goals, setGoals] = useState<Goal[]>([]);
    const [documents, setDocuments] = useState<BeneficiaryDocument[]>([]);
    const [emergencyContacts, setEmergencyContacts] = useState<EmergencyContact[]>([]);

    // Document Selection for Bulk Actions
    const [selectedDocs, setSelectedDocs] = useState<string[]>([]);
    const [selectAll, setSelectAll] = useState(false);

    // Upload Dialog
    const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
    const [uploadFiles, setUploadFiles] = useState<File[]>([]);
    const [uploadDocumentType, setUploadDocumentType] = useState('');
    const [uploading, setUploading] = useState(false);

    // Delete Confirmation
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [documentToDelete, setDocumentToDelete] = useState<BeneficiaryDocument | null>(null);

    // Contact Dialog
    const [contactDialogOpen, setContactDialogOpen] = useState(false);
    const [selectedContact, setSelectedContact] = useState<EmergencyContact | null>(null);

    useEffect(() => {
        if (id) {
            fetchBeneficiary(id);
        }
    }, [id]);

    const fetchBeneficiary = async (beneficiaryId: string) => {
        setLoading(true);
        try {
            const response = await beneficiaryService.getBeneficiaryById(beneficiaryId);

            // ✅ ROBUST EXTRACTION PATTERN (same as goals and contacts)
            const responseData = response as any;
            const beneficiaryData = responseData.data?.data || responseData.data || responseData;

            setBeneficiary(beneficiaryData);

            // Extract the nested arrays - they're already in the beneficiaryData
            if (beneficiaryData.weeklyTrackings) {
                setTrackingHistory(beneficiaryData.weeklyTrackings);
            }

            if (beneficiaryData.goals) {
                setGoals(beneficiaryData.goals);
            }

            if (beneficiaryData.documents) {
                setDocuments(beneficiaryData.documents);
            }

            if (beneficiaryData.emergencyContacts) {
                setEmergencyContacts(beneficiaryData.emergencyContacts);
            }

        } catch (error) {
            console.error("Failed to load beneficiary", error);
            toast.error("Failed to load beneficiary details");
        } finally {
            setLoading(false);
        }
    };
    // Document Actions
    const handleVerifyDocument = async (docId: string) => {
        try {
            await beneficiaryService.verifyDocument(docId);
            toast.success("Document verified successfully");
            if (id) fetchBeneficiary(id);
        } catch (error : any) {
             // Check if it's the "Admin not found" error
        if (error.response?.data?.message?.includes('Admin not found') || 
            error.response?.data?.message?.includes('staff')) {
            
            toast.error(
                <div className="space-y-2">
                    <p className="font-semibold">⚠️ Admin Profile Incomplete</p>
                    <p className="text-sm">Please complete your staff profile first.</p>
                    <Button 
                        size="sm" 
                        variant="outline" 
                        className="mt-2 bg-white text-teal-600 border-teal-200 hover:bg-teal-50"
                        onClick={() => navigate('/profile')}
                    >
                        Go to Profile
                    </Button>
                </div>,
                {
                    duration: 6000,
                    style: { backgroundColor: '#fef3c7', color: '#92400e' }
                }
            );
        } else {
            toast.error("Failed to verify document. Please try again.");
        }
        }
    };

    const handleUnverifyDocument = async (docId: string) => {
        try {
            await beneficiaryService.unverifyDocument(docId);
            toast.success("Document unverified");
            if (id) fetchBeneficiary(id);
        } catch (error) {
            console.error('Unverify error:', error);
            toast.error("Failed to unverify document");
        }
    };

    const handleDeleteDocument = async (docId: string) => {
        if (!id) {
            toast.error("Beneficiary ID not found");
            return;
        }

        try {
            await beneficiaryService.deleteDocument(docId, id); 
            toast.success("Document deleted successfully");
            if (id) fetchBeneficiary(id);
            setSelectedDocs(prev => prev.filter(d => d !== docId));
        } catch (error) {
            console.error('Delete error:', error);
            toast.error("Failed to delete document");
        }
    };

    // Bulk Actions
    const handleSelectAll = () => {
        if (selectAll) {
            setSelectedDocs([]);
        } else {
            setSelectedDocs(documents.map(d => d.id));
        }
        setSelectAll(!selectAll);
    };

    const handleSelectDoc = (docId: string) => {
        setSelectedDocs(prev => {
            const newSelection = prev.includes(docId)
                ? prev.filter(id => id !== docId)
                : [...prev, docId];

            setSelectAll(newSelection.length === documents.length && documents.length > 0);
            return newSelection;
        });
    };

    // Bulk Operations
    const handleBulkVerify = async () => {
        if (selectedDocs.length === 0) {
            toast.error("No documents selected");
            return;
        }

        try {
            await beneficiaryService.bulkVerifyDocuments(selectedDocs);
            toast.success(`${selectedDocs.length} document(s) verified successfully`);
            setSelectedDocs([]);
            setSelectAll(false);
            if (id) fetchBeneficiary(id);
        } catch (error : any) {
            console.error('Bulk verify error:', error);
            // Check if it's the "Admin not found" error
        if (error.response?.data?.message?.includes('Admin not found') || 
            error.response?.data?.message?.includes('staff')) {
            
            toast.error(
                <div className="space-y-2">
                    <p className="font-semibold">⚠️ Admin Profile Incomplete</p>
                    <p className="text-sm">Please complete your staff profile first.</p>
                    <Button 
                        size="sm" 
                        variant="outline" 
                        className="mt-2 bg-white text-teal-600 border-teal-200 hover:bg-teal-50"
                        onClick={() => navigate('/profile')}
                    >
                        Go to Profile
                    </Button>
                </div>,
                {
                    duration: 6000,
                    style: { backgroundColor: '#fef3c7', color: '#92400e' }
                }
            );
        } else {
            toast.error("Failed to verify document. Please try again.");
        }
        }
    };

    const handleBulkDelete = async () => {
        if (selectedDocs.length === 0) {
            toast.error("No documents selected");
            return;
        }

        // if (!confirm(`Are you sure you want to delete ${selectedDocs.length} document(s)?`)) return;

        try {
            await beneficiaryService.bulkDeleteDocuments(selectedDocs);
            toast.success(`${selectedDocs.length} document(s) deleted successfully`);
            setSelectedDocs([]);
            setSelectAll(false);
            if (id) fetchBeneficiary(id);
        } catch (error) {
            console.error('Bulk delete error:', error);
            toast.error("Failed to delete documents");
        }
    };

    const handleDeleteAll = async () => {
        if (!id) {
            toast.error("Beneficiary ID not found");
            return;
        }

        if (!confirm("Are you sure you want to delete ALL documents for this beneficiary? This action cannot be undone.")) return;

        try {
            await beneficiaryService.deleteAllBeneficiaryDocuments(id); // Pass beneficiaryId
            toast.success("All documents deleted successfully");
            if (id) fetchBeneficiary(id);
            setSelectedDocs([]);
            setSelectAll(false);
        } catch (error) {
            console.error('Delete all error:', error);
            toast.error("Failed to delete all documents");
        }
    };

    // Upload Handlers
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setUploadFiles(Array.from(e.target.files));
        }
    };

    const handleUpload = async () => {
        if (uploadFiles.length === 0) {
            toast.error("Please select files to upload");
            return;
        }

        if (!uploadDocumentType) {
            toast.error("Please select a document type");
            return;
        }

        setUploading(true);

        try {
            if (uploadFiles.length === 1) {
                await beneficiaryService.uploadDocument(uploadFiles[0], uploadDocumentType);
                toast.success("Document uploaded successfully");
            } else {
                await beneficiaryService.uploadMultipleDocuments(uploadFiles, uploadDocumentType);
                toast.success(`${uploadFiles.length} documents uploaded successfully`);
            }

            setUploadDialogOpen(false);
            setUploadFiles([]);
            setUploadDocumentType('');
            if (id) fetchBeneficiary(id);
        } catch (error) {
            toast.error("Failed to upload documents");
        } finally {
            setUploading(false);
        }
    };

    // Document Type Options
    const documentTypeOptions = [
        { value: 'id_card', label: 'ID Card' },
        { value: 'birth_certificate', label: 'Birth Certificate' },
        { value: 'school_certificate', label: 'School Certificate' },
        { value: 'medical_report', label: 'Medical Report' },
        { value: 'business_license', label: 'Business License' },
        { value: 'other', label: 'Other' }
    ];

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="animate-spin h-8 w-8 text-teal-600" />
            </div>
        );
    }

    if (!beneficiary) {
        return (
            <div className="flex flex-col items-center justify-center h-[50vh] gap-4">
                <p className="text-slate-500">Beneficiary not found.</p>
                <Button onClick={() => navigate('/admin/beneficiaries')}>Back to List</Button>
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-20">
            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
                <Button variant="ghost" size="icon" onClick={() => navigate('/admin/beneficiaries')} className="rounded-full">
                    <ArrowLeft className="w-5 h-5" />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold">{beneficiary.fullName}</h1>
                    <p className="text-muted-foreground text-sm">Beneficiary Profile & Management</p>
                </div>
                <div className="ml-auto flex gap-2">
                    <Badge
                        variant="outline"
                        className={
                            beneficiary.status === BeneficiaryStatus.ACTIVE ? 'bg-green-50 text-green-700 border-green-200' :
                                beneficiary.status === BeneficiaryStatus.GRADUATED ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                    'bg-gray-50 text-gray-700 border-gray-200'
                        }
                    >
                        {beneficiary.status}
                    </Badge>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Sidebar / Profile Card */}
                <Card className="md:col-span-1 h-fit">
                    <CardHeader className="text-center">
                        <div className="mx-auto mb-4">
                            <Avatar className="h-24 w-24 border-2 border-white shadow-lg">
                                <AvatarImage src={beneficiary.user?.profileImageUrl} />
                                <AvatarFallback className="bg-teal-100 text-teal-800 text-2xl">
                                    {beneficiary.fullName?.substring(0, 2).toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                        </div>
                        <CardTitle>{beneficiary.fullName}</CardTitle>
                        <CardDescription>{beneficiary.user?.email}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center gap-3 text-sm">
                            <Phone className="w-4 h-4 text-slate-400" />
                            <span>{beneficiary.user?.phone || 'No phone'}</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm">
                            <BookOpen className="w-4 h-4 text-slate-400" />
                            <span className="font-medium">{beneficiary.program?.name?.en || 'Unassigned'}</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm">
                            <MapPin className="w-4 h-4 text-slate-400" />
                            <span>{beneficiary.location?.district}, {beneficiary.location?.sector}</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm">
                            <Calendar className="w-4 h-4 text-slate-400" />
                            <span>Enrolled: {formatSafeDate(beneficiary.enrollmentDate)}</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm">
                            <Briefcase className="w-4 h-4 text-slate-400" />
                            <span>{beneficiary.businessType || 'No business type'}</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm">
                            <Activity className="w-4 h-4 text-slate-400" />
                            <span>Completion: {beneficiary.profileCompletion}%</span>
                        </div>

                        <Separator />

                        {/* Capital Progress */}
                        <div>
                            <div className="flex justify-between text-sm mb-2">
                                <span className="text-slate-500">Capital Progress</span>
                                <span className="font-medium">
                                    {Math.round((Number(beneficiary.currentCapital) / Number(beneficiary.startCapital)) * 100)}%
                                </span>
                            </div>
                            <Progress
                                value={(Number(beneficiary.currentCapital) / Number(beneficiary.startCapital)) * 100}
                                className="h-2"
                            />
                            <div className="flex justify-between mt-2 text-xs text-slate-500">
                                <span>RWF{Number(beneficiary.currentCapital).toLocaleString()}</span>
                                <span>RWF{Number(beneficiary.startCapital).toLocaleString()}</span>
                            </div>
                        </div>

                        {/* Tracking Info */}
                        <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg">
                            <p className="text-xs text-slate-500 mb-1">Last Tracking</p>
                            <p className="text-sm font-medium">
                                {formatSafeDate(beneficiary.lastTrackingDate)}
                            </p>
                            <p className="text-xs text-slate-500 mt-2">Next Tracking</p>
                            <p className="text-sm font-medium">
                                {formatSafeDate(beneficiary.nextTrackingDate)}
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* Main Content Tabs */}
                <div className="md:col-span-2 space-y-6">
                    <Tabs defaultValue="tracking" className="w-full">
                        <TabsList className="w-full justify-start rounded-xl bg-slate-100 p-1">
                            <TabsTrigger value="tracking" className="rounded-lg px-4 py-2">Tracking</TabsTrigger>
                            <TabsTrigger value="goals" className="rounded-lg px-4 py-2">Goals</TabsTrigger>
                            <TabsTrigger value="contacts" className="rounded-lg px-4 py-2">Emergency Contacts</TabsTrigger>
                            <TabsTrigger value="documents" className="rounded-lg px-4 py-2">Documents</TabsTrigger>
                        </TabsList>

                        {/* Tracking Tab */}
                        <TabsContent value="tracking" className="mt-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Tracking History</CardTitle>
                                    <CardDescription>Weekly progress reports submitted by the beneficiary.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {trackingHistory.length === 0 ? (
                                        <div className="text-center py-8 text-slate-500">No tracking records found.</div>
                                    ) : (
                                        <div className="space-y-4">
                                            {trackingHistory.map((record) => (
                                                <Card key={record.id} className="border border-slate-200">
                                                    <CardHeader className="pb-2">
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center gap-2">
                                                                <Calendar className="w-4 h-4 text-slate-400" />
                                                                <span className="font-medium">
                                                                    Week Ending: {formatSafeDate(record.weekEnding)}
                                                                </span>
                                                            </div>
                                                            <Badge
                                                                className={
                                                                    record.verifiedAt
                                                                        ? 'bg-green-100 text-green-700 border-green-200'
                                                                        : 'bg-amber-100 text-amber-700 border-amber-200'
                                                                }
                                                            >
                                                                {record.verifiedAt ? 'Verified' : 'Pending'}
                                                            </Badge>
                                                        </div>
                                                    </CardHeader>
                                                    <CardContent>
                                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                            <div>
                                                                <p className="text-xs text-slate-500">Income</p>
                                                                <p className="text-sm font-medium">₣{Number(record.incomeThisWeek).toLocaleString()}</p>
                                                            </div>
                                                            <div>
                                                                <p className="text-xs text-slate-500">Expenses</p>
                                                                <p className="text-sm font-medium">₣{Number(record.expensesThisWeek).toLocaleString()}</p>
                                                            </div>
                                                            <div>
                                                                <p className="text-xs text-slate-500">Capital</p>
                                                                <p className="text-sm font-medium">₣{Number(record.currentCapital).toLocaleString()}</p>
                                                            </div>
                                                            <div>
                                                                <p className="text-xs text-slate-500">Attendance</p>
                                                                <Badge variant="outline" className="capitalize">
                                                                    {record.attendance}
                                                                </Badge>
                                                            </div>
                                                        </div>
                                                        {(record.challenges || record.solutionsImplemented) && (
                                                            <div className="mt-4 pt-4 border-t border-slate-100">
                                                                {record.challenges && (
                                                                    <div className="mb-2">
                                                                        <p className="text-xs text-slate-500">Challenges</p>
                                                                        <p className="text-sm">{record.challenges}</p>
                                                                    </div>
                                                                )}
                                                                {record.solutionsImplemented && (
                                                                    <div>
                                                                        <p className="text-xs text-slate-500">Solutions</p>
                                                                        <p className="text-sm">{record.solutionsImplemented}</p>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}
                                                        {!record.verifiedAt && (
                                                            <div className="mt-4 pt-4 border-t border-slate-100 flex justify-end">
                                                                <Button
                                                                    size="sm"
                                                                    className="bg-teal-600 hover:bg-teal-700"
                                                                    onClick={() => handleVerifyDocument(record.id)}
                                                                >
                                                                    <CheckCircle className="w-4 h-4 mr-2" />
                                                                    Verify Report
                                                                </Button>
                                                            </div>
                                                        )}
                                                    </CardContent>
                                                </Card>
                                            ))}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Goals Tab */}
                        <TabsContent value="goals" className="mt-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Business Goals</CardTitle>
                                    <CardDescription>Targets and milestones set by the beneficiary.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {goals.length === 0 ? (
                                        <div className="text-center py-8 text-slate-500">No goals set.</div>
                                    ) : (
                                        <div className="space-y-6">
                                            {goals.map((goal) => {
                                                const progress = (Number(goal.currentProgress) / Number(goal.targetAmount)) * 100;
                                                const statusConfig = {
                                                    achieved: 'bg-green-100 text-green-700 border-green-200',
                                                    in_progress: 'bg-blue-100 text-blue-700 border-blue-200',
                                                    not_started: 'bg-amber-100 text-amber-700 border-amber-200',
                                                    abandoned: 'bg-red-100 text-red-700 border-red-200'
                                                };

                                                return (
                                                    <Card key={goal.id} className="border border-slate-200">
                                                        <CardHeader className="pb-2">
                                                            <div className="flex items-start justify-between">
                                                                <div>
                                                                    <CardTitle className="text-base font-semibold">
                                                                        {goal.description}
                                                                    </CardTitle>
                                                                    <CardDescription className="mt-1">
                                                                        Type: {goal.type.replace('_', ' ')}
                                                                    </CardDescription>
                                                                </div>
                                                                <Badge
                                                                    className={statusConfig[goal.status] || statusConfig.not_started}
                                                                >
                                                                    {goal.status.replace('_', ' ')}
                                                                </Badge>
                                                            </div>
                                                        </CardHeader>
                                                        <CardContent className="space-y-4">
                                                            {/* Progress */}
                                                            <div>
                                                                <div className="flex justify-between text-sm mb-2">
                                                                    <span className="text-slate-500">Progress</span>
                                                                    <span className="font-medium">{Math.round(progress)}%</span>
                                                                </div>
                                                                <Progress value={progress} className="h-2" />
                                                                <div className="flex justify-between mt-2 text-xs text-slate-500">
                                                                    <span>₣{Number(goal.currentProgress).toLocaleString()}</span>
                                                                    <span>₣{Number(goal.targetAmount).toLocaleString()}</span>
                                                                </div>
                                                            </div>

                                                            {/* Target Date */}
                                                            <div className="flex items-center gap-2 text-sm">
                                                                <Calendar className="w-4 h-4 text-slate-400" />
                                                                <span>Target: {formatSafeDate(goal.targetDate)}</span>
                                                            </div>

                                                            {/* Milestones */}
                                                            {goal.milestones && goal.milestones.length > 0 && (
                                                                <div>
                                                                    <p className="text-sm font-medium mb-2">Milestones</p>
                                                                    <div className="space-y-2">
                                                                        {goal.milestones.map((milestone, idx) => (
                                                                            <div key={idx} className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg">
                                                                                <div className="flex justify-between mb-1">
                                                                                    <span className="text-sm">{milestone.description}</span>
                                                                                    <Badge variant="outline" className="text-[10px]">
                                                                                        {formatSafeDate(milestone.targetDate)}
                                                                                    </Badge>
                                                                                </div>
                                                                                <p className="text-xs text-slate-500">
                                                                                    Target: ₣{milestone.targetAmount.toLocaleString()}
                                                                                </p>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            )}

                                                            {/* Action Plan */}
                                                            {goal.actionPlan && (
                                                                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg">
                                                                    <p className="text-sm font-medium mb-2">Action Plan</p>
                                                                    {goal.actionPlan.steps && (
                                                                        <div className="mb-3">
                                                                            <p className="text-xs text-slate-500 mb-1">Steps:</p>
                                                                            <ul className="space-y-1">
                                                                                {goal.actionPlan.steps.map((step, idx) => (
                                                                                    <li key={idx} className="text-xs flex items-start gap-2">
                                                                                        <span className="text-teal-600">•</span>
                                                                                        {step}
                                                                                    </li>
                                                                                ))}
                                                                            </ul>
                                                                        </div>
                                                                    )}
                                                                    {goal.actionPlan.timeline && (
                                                                        <p className="text-xs text-slate-500 mb-1">
                                                                            Timeline: {goal.actionPlan.timeline}
                                                                        </p>
                                                                    )}
                                                                    {goal.actionPlan.resourcesNeeded && (
                                                                        <div>
                                                                            <p className="text-xs text-slate-500 mb-1">Resources:</p>
                                                                            <div className="flex flex-wrap gap-1">
                                                                                {goal.actionPlan.resourcesNeeded.map((resource, idx) => (
                                                                                    <Badge key={idx} variant="outline" className="text-[10px]">
                                                                                        {resource}
                                                                                    </Badge>
                                                                                ))}
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            )}

                                                            {/* Notes */}
                                                            {goal.notes && (
                                                                <div className="text-sm text-slate-600 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg">
                                                                    <p className="text-xs text-slate-500 mb-1">Notes:</p>
                                                                    <p>{goal.notes}</p>
                                                                </div>
                                                            )}
                                                        </CardContent>
                                                    </Card>
                                                );
                                            })}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Emergency Contacts Tab */}
                        <TabsContent value="contacts" className="mt-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Emergency Contacts</CardTitle>
                                    <CardDescription>People to contact in case of emergency.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {emergencyContacts.length === 0 ? (
                                        <div className="text-center py-8 text-slate-500">No emergency contacts found.</div>
                                    ) : (
                                        <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                                            {emergencyContacts.map((contact) => (
                                                <Card
                                                    key={contact.id}
                                                    className={cn(
                                                        "border transition-all hover:shadow-md cursor-pointer",
                                                        contact.isPrimary && "border-amber-200 bg-amber-50/50 dark:bg-amber-950/10"
                                                    )}
                                                    onClick={() => {
                                                        setSelectedContact(contact);
                                                        setContactDialogOpen(true);
                                                    }}
                                                >
                                                    <CardContent className="p-4">
                                                        <div className="flex items-start justify-between mb-3">
                                                            <div className="flex items-center gap-3">
                                                                <Avatar className="h-10 w-10">
                                                                    <AvatarFallback className={cn(
                                                                        "text-white",
                                                                        contact.isPrimary ? "bg-amber-500" : "bg-teal-600"
                                                                    )}>
                                                                        {contact.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                                                                    </AvatarFallback>
                                                                </Avatar>
                                                                <div>
                                                                    <p className="font-medium">{contact.name}</p>
                                                                    <Badge
                                                                        className={cn(
                                                                            "mt-1 text-[10px]",
                                                                            getRelationshipColor(contact.relationship)
                                                                        )}
                                                                    >
                                                                        {contact.relationship}
                                                                    </Badge>
                                                                </div>
                                                            </div>
                                                            {contact.isPrimary && (
                                                                <Badge className="bg-amber-500 text-white border-0">
                                                                    <Star className="w-3 h-3 mr-1 fill-white" />
                                                                    Primary
                                                                </Badge>
                                                            )}
                                                        </div>

                                                        <div className="space-y-2">
                                                            <div className="flex items-center gap-2 text-sm">
                                                                <Phone className="w-3.5 h-3.5 text-slate-400" />
                                                                <span>{contact.phone}</span>
                                                            </div>
                                                            {contact.alternatePhone && (
                                                                <div className="flex items-center gap-2 text-sm">
                                                                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                                                                    <span className="text-slate-600">{contact.alternatePhone}</span>
                                                                </div>
                                                            )}
                                                            {contact.address && (
                                                                <div className="flex items-center gap-2 text-sm">
                                                                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                                                                    <span className="text-slate-600">{contact.address}</span>
                                                                </div>
                                                            )}
                                                        </div>

                                                        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-100">
                                                            <Button
                                                                size="sm"
                                                                variant="ghost"
                                                                className="flex-1 h-8 text-xs"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    window.open(`tel:${contact.phone}`);
                                                                }}
                                                            >
                                                                <PhoneCall className="w-3.5 h-3.5 mr-1" />
                                                                Call
                                                            </Button>
                                                            {contact.alternatePhone && (
                                                                <Button
                                                                    size="sm"
                                                                    variant="ghost"
                                                                    className="flex-1 h-8 text-xs"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        window.open(`tel:${contact.alternatePhone}`);
                                                                    }}
                                                                >
                                                                    <PhoneCall className="w-3.5 h-3.5 mr-1" />
                                                                    Alt
                                                                </Button>
                                                            )}
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            ))}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Documents Tab */}
                        <TabsContent value="documents" className="mt-6">
                            <Card>
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <CardTitle>Documents</CardTitle>
                                            <CardDescription>Uploaded files and resources.</CardDescription>
                                        </div>
                                        <div className="flex gap-2">
                                            {selectedDocs.length > 0 && (
                                                <>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="text-green-600 border-green-200 hover:bg-green-50"
                                                        onClick={handleBulkVerify}
                                                    >
                                                        <CheckSquare className="w-4 h-4 mr-2" />
                                                        Verify ({selectedDocs.length})
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="text-red-600 border-red-200 hover:bg-red-50"
                                                        onClick={handleBulkDelete}
                                                    >
                                                        <Trash2 className="w-4 h-4 mr-2" />
                                                        Delete ({selectedDocs.length})
                                                    </Button>
                                                </>
                                            )}
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="outline" size="sm">
                                                        <MoreVertical className="w-4 h-4 mr-2" />
                                                        Actions
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuLabel>Document Actions</DropdownMenuLabel>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem onClick={() => setUploadDialogOpen(true)}>
                                                        <Upload className="w-4 h-4 mr-2" />
                                                        Upload Documents
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        className="text-red-600"
                                                        onClick={handleDeleteAll}
                                                    >
                                                        <Trash2 className="w-4 h-4 mr-2" />
                                                        Delete All Documents
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    {documents.length === 0 ? (
                                        <div className="text-center py-12">
                                            <FileText className="w-12 h-12 mx-auto text-slate-300 mb-3" />
                                            <p className="text-slate-500 dark:text-slate-400">No documents found.</p>
                                            <Button
                                                variant="outline"
                                                className="mt-4"
                                                onClick={() => setUploadDialogOpen(true)}
                                            >
                                                <Upload className="w-4 h-4 mr-2" />
                                                Upload First Document
                                            </Button>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="mb-4 flex items-center gap-2">
                                                <div className="flex items-center gap-2">
                                                    <Checkbox
                                                        id="selectAll"
                                                        checked={selectAll}
                                                        onCheckedChange={handleSelectAll}
                                                    />
                                                    <Label htmlFor="selectAll" className="text-sm font-medium">
                                                        Select All ({documents.length} documents)
                                                    </Label>
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                {documents.map((doc) => (
                                                    <div
                                                        key={doc.id}
                                                        className={cn(
                                                            "flex items-center justify-between p-3 rounded-lg border transition-colors",
                                                            selectedDocs.includes(doc.id)
                                                                ? "bg-teal-50 border-teal-200 dark:bg-teal-950/30 dark:border-teal-800"
                                                                : "bg-white border-slate-200 hover:bg-slate-50 dark:bg-slate-900 dark:border-slate-800 dark:hover:bg-slate-800/50"
                                                        )}
                                                    >
                                                        <div className="flex items-center gap-3 flex-1">
                                                            <Checkbox
                                                                checked={selectedDocs.includes(doc.id)}
                                                                onCheckedChange={() => handleSelectDoc(doc.id)}
                                                            />
                                                            <div className="text-2xl">{getDocumentIcon(doc.mimeType)}</div>
                                                            <div className="flex-1 min-w-0">
                                                                <div className="flex items-center gap-2">
                                                                    <p className="text-sm font-medium truncate">
                                                                        {doc.fileName}
                                                                    </p>
                                                                    {doc.verified && (
                                                                        <Badge className="bg-green-100 text-green-700 border-green-200 text-[10px]">
                                                                            <CheckCircle className="w-3 h-3 mr-1" />
                                                                            Verified
                                                                        </Badge>
                                                                    )}
                                                                </div>
                                                                <div className="flex items-center gap-3 text-xs text-slate-500">
                                                                    <span>{doc.documentType.replace('_', ' ')}</span>
                                                                    <span>•</span>
                                                                    <span>{formatFileSize(doc.fileSize)}</span>
                                                                    <span>•</span>
                                                                    <span>Uploaded {formatSafeDate(doc.createdAt)}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            <Button
                                                                size="icon"
                                                                variant="ghost"
                                                                className="h-8 w-8"
                                                                onClick={() => window.open(doc.fileUrl, '_blank')}
                                                            >
                                                                <Eye className="w-4 h-4" />
                                                            </Button>
                                                            <Button
                                                                size="icon"
                                                                variant="ghost"
                                                                className="h-8 w-8"
                                                                onClick={() => window.open(doc.fileUrl, '_blank')}
                                                            >
                                                                <Download className="w-4 h-4" />
                                                            </Button>
                                                            {!doc.verified ? (
                                                                <Button
                                                                    size="icon"
                                                                    variant="ghost"
                                                                    className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50"
                                                                    onClick={() => handleVerifyDocument(doc.id)}
                                                                >
                                                                    <Shield className="w-4 h-4" />
                                                                </Button>
                                                            ) : (
                                                                <Button
                                                                    size="icon"
                                                                    variant="ghost"
                                                                    className="h-8 w-8 text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                                                                    onClick={() => handleUnverifyDocument(doc.id)}
                                                                >
                                                                    <ShieldOff className="w-4 h-4" />
                                                                </Button>
                                                            )}
                                                            <Button
                                                                size="icon"
                                                                variant="ghost"
                                                                className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                                                                onClick={() => {
                                                                    setDocumentToDelete(doc);
                                                                    setDeleteDialogOpen(true);
                                                                }}
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>

            {/* Upload Dialog */}
            <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Upload Documents</DialogTitle>
                        <DialogDescription>
                            Upload documents for this beneficiary. Supported formats: PDF, Images, DOC, XLS (max 20MB each)
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="documentType">Document Type</Label>
                            <select
                                id="documentType"
                                className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950"
                                value={uploadDocumentType}
                                onChange={(e) => setUploadDocumentType(e.target.value)}
                            >
                                <option value="">Select document type</option>
                                {documentTypeOptions.map(option => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="files">Files</Label>
                            <Input
                                id="files"
                                type="file"
                                multiple
                                onChange={handleFileChange}
                                className="cursor-pointer"
                            />
                            {uploadFiles.length > 0 && (
                                <div className="mt-2 space-y-1">
                                    <p className="text-xs font-medium text-slate-500">Selected files:</p>
                                    {uploadFiles.map((file, index) => (
                                        <div key={index} className="text-xs text-slate-600 flex items-center gap-2">
                                            <FileText className="w-3 h-3" />
                                            {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setUploadDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handleUpload}
                            disabled={uploadFiles.length === 0 || !uploadDocumentType || uploading}
                            className="bg-teal-600 hover:bg-teal-700"
                        >
                            {uploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Upload {uploadFiles.length > 1 ? `${uploadFiles.length} Files` : 'File'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogContent className="sm:max-w-[400px]">
                    <DialogHeader>
                        <DialogTitle>Delete Document</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete "{documentToDelete?.fileName}"? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={() => {
                                if (documentToDelete) {
                                    handleDeleteDocument(documentToDelete.id);
                                    setDeleteDialogOpen(false);
                                    setDocumentToDelete(null);
                                }
                            }}
                        >
                            Delete Document
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Contact Details Dialog */}
            <Dialog open={contactDialogOpen} onOpenChange={setContactDialogOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    {selectedContact && (
                        <>
                            <DialogHeader>
                                <DialogTitle className="flex items-center gap-2">
                                    <div className="p-2 rounded-lg bg-teal-100">
                                        <Heart className="w-5 h-5 text-teal-600" />
                                    </div>
                                    Contact Details
                                </DialogTitle>
                                <DialogDescription>
                                    Emergency contact information
                                </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                <div className="flex items-center justify-center mb-4">
                                    <Avatar className="h-20 w-20 border-4 border-white shadow-lg">
                                        <AvatarFallback className={cn(
                                            "text-white text-2xl",
                                            selectedContact.isPrimary ? "bg-amber-500" : "bg-teal-600"
                                        )}>
                                            {selectedContact.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                                        </AvatarFallback>
                                    </Avatar>
                                </div>

                                <div className="text-center">
                                    <h3 className="text-xl font-bold">{selectedContact.name}</h3>
                                    <Badge className={cn("mt-2", getRelationshipColor(selectedContact.relationship))}>
                                        {selectedContact.relationship}
                                    </Badge>
                                    {selectedContact.isPrimary && (
                                        <Badge className="ml-2 bg-amber-500 text-white border-0">
                                            <Star className="w-3 h-3 mr-1 fill-white" />
                                            Primary Contact
                                        </Badge>
                                    )}
                                </div>

                                <Separator />

                                <div className="space-y-3">
                                    <div className="flex items-center gap-3">
                                        <Phone className="w-5 h-5 text-slate-400" />
                                        <div>
                                            <p className="text-xs text-slate-500">Primary Phone</p>
                                            <p className="font-medium">{selectedContact.phone}</p>
                                        </div>
                                    </div>

                                    {selectedContact.alternatePhone && (
                                        <div className="flex items-center gap-3">
                                            <Phone className="w-5 h-5 text-slate-400" />
                                            <div>
                                                <p className="text-xs text-slate-500">Alternate Phone</p>
                                                <p className="font-medium">{selectedContact.alternatePhone}</p>
                                            </div>
                                        </div>
                                    )}

                                    {selectedContact.address && (
                                        <div className="flex items-center gap-3">
                                            <MapPin className="w-5 h-5 text-slate-400" />
                                            <div>
                                                <p className="text-xs text-slate-500">Address</p>
                                                <p className="font-medium">{selectedContact.address}</p>
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex items-center gap-3">
                                        <Calendar className="w-5 h-5 text-slate-400" />
                                        <div>
                                            <p className="text-xs text-slate-500">Added On</p>
                                            <p className="font-medium">
                                                {formatSafeDate(selectedContact.createdAt)}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <Separator />

                                <div className="flex gap-3">
                                    <Button
                                        className="flex-1 bg-teal-600 hover:bg-teal-700"
                                        onClick={() => window.open(`tel:${selectedContact.phone}`)}
                                    >
                                        <PhoneCall className="w-4 h-4 mr-2" />
                                        Call Now
                                    </Button>
                                    {selectedContact.alternatePhone && (
                                        <Button
                                            className="flex-1 bg-teal-600 hover:bg-teal-700"
                                            onClick={() => window.open(`tel:${selectedContact.alternatePhone}`)}
                                        >
                                            <PhoneCall className="w-4 h-4 mr-2" />
                                            Call Alt
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}