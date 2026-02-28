// pages/admin/BeneficiariesPage.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import {
  Search,
  Filter,
  MoreHorizontal,
  Download,
  Plus,
  UserCheck,
  Loader2,
  Trash2,
  GraduationCap,
  Users,
  MapPin,
  Calendar,
  Phone,
  Activity,
  RefreshCw,
  Eye,
  Edit,
  Briefcase,
  Award,
  AlertCircle,
  UserPlus,
  UserMinus,
  UserCheck2,
  Target,
  BarChart3,
  ArrowRightCircle,
  FileText,
  Heart,
  Star,
  PhoneCall,
  CheckCircle,
  XCircle,
  Shield,
  ShieldOff,
  Upload,
  CheckSquare,
  Square,
  ArrowLeft,
  BookOpen,
  Clock,
  HardDrive,
  Home,
  Mail,
  DollarSign,
  User,
  MoreVertical
} from 'lucide-react';
import { Beneficiary, BeneficiaryStatus, Program, BusinessGoal, GoalType, GoalStatus } from '@/lib/types';
import { toast } from 'sonner';
import { beneficiaryService } from '@/services/beneficiary.service';
import { programsService } from '@/services/programs.service';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { format, isValid, parseISO } from 'date-fns';

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

// Safe date formatting function
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

// Document Type Options
const documentTypeOptions = [
  { value: 'id_card', label: 'ID Card' },
  { value: 'birth_certificate', label: 'Birth Certificate' },
  { value: 'school_certificate', label: 'School Certificate' },
  { value: 'medical_report', label: 'Medical Report' },
  { value: 'business_license', label: 'Business License' },
  { value: 'other', label: 'Other' }
];

// Beneficiary Details Dialog Component
interface BeneficiaryDetailsDialogProps {
  beneficiaryId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate?: () => void;
}

function BeneficiaryDetailsDialog({ beneficiaryId, open, onOpenChange, onUpdate }: BeneficiaryDetailsDialogProps) {
  const navigate = useNavigate();
  const [beneficiary, setBeneficiary] = useState<Beneficiary | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  // Data States
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
    if (open && beneficiaryId) {
      fetchBeneficiary(beneficiaryId);
    } else {
      // Reset state when dialog closes
      resetState();
    }
  }, [open, beneficiaryId]);

  const resetState = () => {
    setBeneficiary(null);
    setTrackingHistory([]);
    setGoals([]);
    setDocuments([]);
    setEmergencyContacts([]);
    setSelectedDocs([]);
    setSelectAll(false);
  };

  const fetchBeneficiary = async (id: string) => {
    setLoading(true);
    try {
      const response = await beneficiaryService.getBeneficiaryById(id);

      // ✅ ROBUST EXTRACTION PATTERN
      const responseData = response as any;
      const beneficiaryData = responseData.data?.data || responseData.data || responseData;

      setBeneficiary(beneficiaryData);

      // Extract the nested arrays
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
      if (beneficiaryId) fetchBeneficiary(beneficiaryId);
    } catch (error: any) {
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
      if (beneficiaryId) fetchBeneficiary(beneficiaryId);
    } catch (error) {
      console.error('Unverify error:', error);
      toast.error("Failed to unverify document");
    }
  };

  const handleDeleteDocument = async (docId: string) => {
    if (!beneficiaryId) {
      toast.error("Beneficiary ID not found");
      return;
    }

    try {
      await beneficiaryService.deleteDocument(docId, beneficiaryId);
      toast.success("Document deleted successfully");
      if (beneficiaryId) fetchBeneficiary(beneficiaryId);
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
      if (beneficiaryId) fetchBeneficiary(beneficiaryId);
    } catch (error: any) {
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

    try {
      await beneficiaryService.bulkDeleteDocuments(selectedDocs);
      toast.success(`${selectedDocs.length} document(s) deleted successfully`);
      setSelectedDocs([]);
      setSelectAll(false);
      if (beneficiaryId) fetchBeneficiary(beneficiaryId);
    } catch (error) {
      console.error('Bulk delete error:', error);
      toast.error("Failed to delete documents");
    }
  };

  const handleDeleteAll = async () => {
    if (!beneficiaryId) {
      toast.error("Beneficiary ID not found");
      return;
    }

    if (!confirm("Are you sure you want to delete ALL documents for this beneficiary? This action cannot be undone.")) return;

    try {
      await beneficiaryService.deleteAllBeneficiaryDocuments(beneficiaryId);
      toast.success("All documents deleted successfully");
      if (beneficiaryId) fetchBeneficiary(beneficiaryId);
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

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
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
      if (beneficiaryId) fetchBeneficiary(beneficiaryId);
    } catch (error) {
      toast.error("Failed to upload documents");
    } finally {
      setUploading(false);
    }
  };

  if (!beneficiaryId) return null;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[900px] w-[95%] md:w-full p-0">
          <div className="flex flex-col" style={{ maxHeight: '90vh' }}>
            {/* Fixed Header */}
            <div className="px-6 py-4 border-b">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-teal-100 text-teal-600">
                    <User className="w-4 h-4" />
                  </div>
                  {loading ? 'Loading...' : beneficiary?.fullName || 'Beneficiary Details'}
                </DialogTitle>
                <DialogDescription>
                  {beneficiary?.user?.email || 'View and manage beneficiary information'}
                </DialogDescription>
              </DialogHeader>
            </div>

            {/* Scrollable Content */}
            <div className="overflow-y-auto flex-1 p-6">
              {loading ? (
                <div className="flex justify-center items-center py-20">
                  <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
                </div>
              ) : !beneficiary ? (
                <div className="text-center py-20 text-slate-500">
                  Beneficiary not found.
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Quick Info Bar */}
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={beneficiary.user?.profileImageUrl} />
                        <AvatarFallback className="bg-teal-100 text-teal-800">
                          {beneficiary.user?.fullName ? getInitials(beneficiary.user.fullName) : 'NA'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2">
                          <h2 className="text-xl font-bold">{beneficiary.fullName}</h2>
                          <Badge
                            className={
                              beneficiary.status === BeneficiaryStatus.ACTIVE
                                ? 'bg-green-100 text-green-700 border-green-200'
                                : beneficiary.status === BeneficiaryStatus.GRADUATED
                                  ? 'bg-blue-100 text-blue-700 border-blue-200'
                                  : 'bg-gray-100 text-gray-700 border-gray-200'
                            }
                          >
                            {beneficiary.status}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 mt-1 text-sm text-slate-500">
                          <div className="flex items-center gap-1">
                            <Briefcase className="w-4 h-4" />
                            <span>{beneficiary.businessType || 'No business'}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            <span>{beneficiary.location?.district || 'No location'}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Phone className="w-4 h-4" />
                            <span>{beneficiary.user?.phone || 'No phone'}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-slate-500">Capital Progress</p>
                      <p className="text-2xl font-bold text-teal-600">
                        {Math.round((Number(beneficiary.currentCapital) / Number(beneficiary.startCapital)) * 100)}%
                      </p>
                      <p className="text-xs text-slate-400">
                        RWF{Number(beneficiary.currentCapital).toLocaleString()} / ₣{Number(beneficiary.startCapital).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {/* Tabs */}
                  <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="w-full justify-start rounded-xl bg-slate-100 p-1">
                      <TabsTrigger value="overview" className="rounded-lg px-4 py-2">Overview</TabsTrigger>
                      <TabsTrigger value="tracking" className="rounded-lg px-4 py-2">Tracking</TabsTrigger>
                      <TabsTrigger value="goals" className="rounded-lg px-4 py-2">Goals</TabsTrigger>
                      <TabsTrigger value="contacts" className="rounded-lg px-4 py-2">Emergency Contacts</TabsTrigger>
                      <TabsTrigger value="documents" className="rounded-lg px-4 py-2">Documents</TabsTrigger>
                    </TabsList>

                    {/* Overview Tab */}
                    <TabsContent value="overview" className="mt-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-base">Personal Information</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            <div className="flex justify-between">
                              <span className="text-sm text-slate-500">Full Name</span>
                              <span className="text-sm font-medium">{beneficiary.fullName}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-slate-500">Email</span>
                              <span className="text-sm font-medium">{beneficiary.user?.email || 'N/A'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-slate-500">Phone</span>
                              <span className="text-sm font-medium">{beneficiary.user?.phone || 'N/A'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-slate-500">Date of Birth</span>
                              <span className="text-sm font-medium">{formatSafeDate(beneficiary.dateOfBirth)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-slate-500">Enrollment Date</span>
                              <span className="text-sm font-medium">{formatSafeDate(beneficiary.enrollmentDate)}</span>
                            </div>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardHeader>
                            <CardTitle className="text-base">Program & Location</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            <div className="flex justify-between">
                              <span className="text-sm text-slate-500">Program</span>
                              <span className="text-sm font-medium">{beneficiary.program?.name?.en || 'Unassigned'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-slate-500">District</span>
                              <span className="text-sm font-medium">{beneficiary.location?.district || 'N/A'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-slate-500">Sector</span>
                              <span className="text-sm font-medium">{beneficiary.location?.sector || 'N/A'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-slate-500">Cell</span>
                              <span className="text-sm font-medium">{beneficiary.location?.cell || 'N/A'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-slate-500">Village</span>
                              <span className="text-sm font-medium">{beneficiary.location?.village || 'N/A'}</span>
                            </div>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardHeader>
                            <CardTitle className="text-base">Business Information</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            <div className="flex justify-between">
                              <span className="text-sm text-slate-500">Business Type</span>
                              <span className="text-sm font-medium">{beneficiary.businessType || 'N/A'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-slate-500">Start Capital</span>
                              <span className="text-sm font-medium">RWF{Number(beneficiary.startCapital).toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-slate-500">Current Capital</span>
                              <span className="text-sm font-medium">RWF{Number(beneficiary.currentCapital).toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-slate-500">Tracking Frequency</span>
                              <span className="text-sm font-medium capitalize">{beneficiary.trackingFrequency}</span>
                            </div>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardHeader>
                            <CardTitle className="text-base">Tracking Status</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            <div className="flex justify-between">
                              <span className="text-sm text-slate-500">Last Tracking</span>
                              <span className="text-sm font-medium">{formatSafeDate(beneficiary.lastTrackingDate)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-slate-500">Next Tracking</span>
                              <span className="text-sm font-medium">{formatSafeDate(beneficiary.nextTrackingDate)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-slate-500">Profile Completion</span>
                              <span className="text-sm font-medium">{beneficiary.profileCompletion}%</span>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </TabsContent>

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
                                  [GoalStatus.ACHIEVED]: 'bg-green-100 text-green-700 border-green-200',
                                  [GoalStatus.IN_PROGRESS]: 'bg-blue-100 text-blue-700 border-blue-200',
                                  [GoalStatus.NOT_STARTED]: 'bg-amber-100 text-amber-700 border-amber-200',
                                  [GoalStatus.ABANDONED]: 'bg-red-100 text-red-700 border-red-200'
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
                                          className={statusConfig[goal.status] || statusConfig[GoalStatus.NOT_STARTED]}
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
                                            contact.isPrimary ? "#eacfa2" : "bg-teal-600"
                                          )}>
                                            {contact.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                                          </AvatarFallback>
                                        </Avatar>
                                        <div>
                                          <p className="text-xl">{contact.name}</p>
                                          <Badge
                                            className={cn(
                                              getRelationshipColor(contact.relationship)
                                            )}
                                          >
                                            {contact.relationship}
                                          </Badge>
                                        </div>
                                      </div>
                                      {contact.isPrimary && (
                                        <Badge className="#eacfa2 text-white border-0">
                                          <Star className="w-3 h-3 mr-1 fill-white" />
                                          Primary
                                        </Badge>
                                      )}
                                    </div>

                                    <div className="space-y-2">
                                      <div className="flex items-center gap-2 text-sm">
                                        <Phone className="w-4 h-4 text-slate-400" />
                                        <span className='text-slate-600'>{contact.phone}</span>
                                      </div>
                                      {contact.alternatePhone && (
                                        <div className="flex items-center gap-2 text-sm">
                                          <Phone className="w-4 h-4  text-slate-400" />
                                          <span className="text-slate-600">{contact.alternatePhone}</span>
                                        </div>
                                      )}
                                      {contact.address && (
                                        <div className="flex items-center gap-2 text-sm">
                                          <MapPin className="w-4 h-4  text-slate-400" />
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
              )}
            </div>

            {/* Fixed Footer */}
            <div className="px-6 py-4 border-t flex justify-end">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

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
    </>
  );
}

// Main BeneficiariesPage Component
export function BeneficiariesPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialSearch = searchParams.get('search') || '';

  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([]);
  const [filteredBeneficiaries, setFilteredBeneficiaries] = useState<Beneficiary[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [programFilter, setProgramFilter] = useState<string>('all');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalBeneficiaries, setTotalBeneficiaries] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10;

  // Dialog state
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [selectedBeneficiaryId, setSelectedBeneficiaryId] = useState<string | null>(null);

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    graduated: 0,
    inactive: 0,
    completionRate: 0
  });

  // Sync state with URL params
  useEffect(() => {
    const query = searchParams.get('search');
    if (query !== null) {
      setSearchTerm(query);
    }
  }, [searchParams]);

  // Fetch Programs for Filter
  useEffect(() => {
    const loadPrograms = async () => {
      try {
        const response = await programsService.getPrograms();
        const data = (response as any).data?.data || (response as any).data || response;
        setPrograms(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Failed to load programs for filter", error);
      }
    };
    loadPrograms();
  }, []);

  // Fetch All Beneficiaries
  const fetchAllBeneficiaries = async (showRefresh = false) => {
    if (showRefresh) setIsRefreshing(true);
    else setIsLoading(true);

    try {
      const response = await beneficiaryService.getAllBeneficiaries(1, 1000);

      const responseData = response as any;
      const beneficiariesData = responseData.data?.data || responseData.data || responseData;

      const beneficiariesList: Beneficiary[] = Array.isArray(beneficiariesData) ? beneficiariesData : [];

      setBeneficiaries(beneficiariesList);
      setFilteredBeneficiaries(beneficiariesList);
      setTotalBeneficiaries(beneficiariesList.length);
      setTotalPages(Math.ceil(beneficiariesList.length / itemsPerPage) || 1);

      // Calculate stats
      const active = beneficiariesList.filter(b => b.status === BeneficiaryStatus.ACTIVE).length;
      const graduated = beneficiariesList.filter(b => b.status === BeneficiaryStatus.GRADUATED).length;
      const inactive = beneficiariesList.filter(b => b.status === BeneficiaryStatus.INACTIVE).length;
      const completed = beneficiariesList.filter(b => b.profileCompletion === 100).length;

      setStats({
        total: beneficiariesList.length,
        active,
        graduated,
        inactive,
        completionRate: beneficiariesList.length ? Math.round((completed / beneficiariesList.length) * 100) : 0
      });

      if (showRefresh) {
        toast.success("Data refreshed successfully!");
      }
    } catch (error) {
      console.error("Failed to fetch beneficiaries", error);
      toast.error("Failed to load beneficiaries");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAllBeneficiaries();
  }, []);

  // Client-side filtering
  useEffect(() => {
    let filtered = [...beneficiaries];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(b =>
        b.user?.fullName?.toLowerCase().includes(term) ||
        b.user?.phone?.includes(term) ||
        b.location?.district?.toLowerCase().includes(term) ||
        b.location?.sector?.toLowerCase().includes(term) ||
        b.businessType?.toLowerCase().includes(term) ||
        b.user?.email?.toLowerCase().includes(term)
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(b => b.status === statusFilter);
    }

    if (programFilter !== 'all') {
      filtered = filtered.filter(b => b.program?.id === programFilter);
    }

    setFilteredBeneficiaries(filtered);
    setTotalBeneficiaries(filtered.length);
    setTotalPages(Math.ceil(filtered.length / itemsPerPage) || 1);
    setCurrentPage(1);
  }, [searchTerm, statusFilter, programFilter, beneficiaries]);

  // Get current page data
  const getCurrentPageData = (): Beneficiary[] => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredBeneficiaries.slice(startIndex, endIndex);
  };

  const handleExport = () => {
    toast.success("Exporting beneficiary data to CSV...");
  };

  const handleStatusChange = async (id: string, action: 'graduate' | 'delete') => {
    try {
      if (action === 'graduate') {
        await beneficiaryService.graduate(id);
        toast.success("Beneficiary graduated successfully! 🎓");
      } else if (action === 'delete') {
        if (!confirm("Are you sure you want to delete this beneficiary?")) return;
        await beneficiaryService.delete(id);
        toast.success("Beneficiary deleted.");
      }
      fetchAllBeneficiaries(true);
    } catch (error) {
      toast.error("Action failed");
    }
  };

  const formatDate = (date: Date | string) => {
    if (!date) return 'N/A';
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(new Date(date));
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const getStatusConfig = (status: BeneficiaryStatus) => {
    switch (status) {
      case BeneficiaryStatus.ACTIVE:
        return {
          bg: 'bg-emerald-100 dark:bg-emerald-900/30',
          text: 'text-emerald-700 dark:text-emerald-300',
          border: 'border-emerald-200 dark:border-emerald-800',
          icon: UserCheck2,
          label: 'Active'
        };
      case BeneficiaryStatus.GRADUATED:
        return {
          bg: 'bg-blue-100 dark:bg-blue-900/30',
          text: 'text-blue-700 dark:text-blue-300',
          border: 'border-blue-200 dark:border-blue-800',
          icon: Award,
          label: 'Graduated'
        };
      case BeneficiaryStatus.INACTIVE:
        return {
          bg: 'bg-slate-100 dark:bg-slate-800',
          text: 'text-slate-600 dark:text-slate-400',
          border: 'border-slate-200 dark:border-slate-700',
          icon: UserMinus,
          label: 'Inactive'
        };
      default:
        return {
          bg: 'bg-gray-100',
          text: 'text-gray-700',
          border: 'border-gray-200',
          icon: AlertCircle,
          label: status
        };
    }
  };

  const getProgressColor = (progress: number): string => {
    if (progress >= 100) return '#10b981';
    if (progress >= 75) return '#3b82f6';
    if (progress >= 50) return '#f59e0b';
    if (progress >= 25) return '#f97316';
    return '#f43f5e';
  };

  const currentBeneficiaries = getCurrentPageData();

  const handleViewDetails = (beneficiaryId: string) => {
    setSelectedBeneficiaryId(beneficiaryId);
    setDetailsDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 ">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 space-y-4 sm:space-y-6 lg:space-y-8">
          {/* Skeleton Header */}
          <div className="space-y-2 sm:space-y-3">
            <div className="h-8 sm:h-10 lg:h-12 w-48 sm:w-56 lg:w-64 bg-slate-200 dark:bg-slate-800 rounded-lg animate-pulse" />
            <div className="h-4 sm:h-5 lg:h-6 w-64 sm:w-80 lg:w-96 bg-slate-200 dark:bg-slate-800 rounded-md animate-pulse" />
          </div>

          {/* Skeleton Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                <CardContent className="p-4 sm:p-5 lg:p-6">
                  <div className="h-4 w-20 bg-slate-200 dark:bg-slate-800 rounded animate-pulse mb-3" />
                  <div className="h-6 sm:h-7 lg:h-8 w-12 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Skeleton Table */}
          <Card className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
            <div className="p-4 sm:p-5 lg:p-6 space-y-3 sm:space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center space-x-3 sm:space-x-4">
                  <div className="h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 rounded-full bg-slate-200 dark:bg-slate-800 animate-pulse flex-shrink-0" />
                  <div className="space-y-2 flex-1">
                    <div className="h-3 sm:h-4 w-full max-w-[200px] sm:max-w-[250px] bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
                    <div className="h-3 sm:h-4 w-full max-w-[150px] sm:max-w-[200px] bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <motion.div
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
        className="min-h-screen bg-slate-50 dark:bg-slate-950 overflow-x-auto"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 space-y-4 sm:space-y-6 lg:space-y-8 min-w-[800px]">
          {/* Header */}
          <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white tracking-tight">
                Beneficiaries
              </h1>
              <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 flex items-center gap-2 mt-1">
                <Users className="w-4 h-4" />
                <span>Management Portal · {stats.total} total beneficiaries</span>
              </p>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-2 w-full sm:w-auto">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-9 sm:h-10 px-3 sm:px-4 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs sm:text-sm font-medium"
                    onClick={handleExport}
                  >
                    <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
                    <span className="hidden xs:inline">Export</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Export as CSV</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-9 sm:h-10 px-3 sm:px-4 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs sm:text-sm font-medium"
                    onClick={() => fetchAllBeneficiaries(true)}
                    disabled={isRefreshing}
                  >
                    <RefreshCw className={cn("w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2", isRefreshing && "animate-spin")} />
                    <span className="hidden xs:inline">Refresh</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Refresh data</p>
                </TooltipContent>
              </Tooltip>

              <Button
                className="h-9 sm:h-10 px-4 sm:px-5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs sm:text-sm font-medium shadow-lg shadow-teal-600/20 transition-all active:scale-95"
                onClick={() => navigate('/admin/beneficiaries/add')}
              >
                <UserPlus className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
                <span>Add New</span>
              </Button>
            </div>
          </motion.div>

          {/* Stats Cards */}
          <motion.div
            variants={staggerContainer}
            className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4"
          >
            {[
              { label: 'Total', value: stats.total, icon: Users, color: 'text-blue-600', bg: 'bg-blue-100 dark:bg-blue-900/30' },
              { label: 'Active', value: stats.active, icon: Activity, color: 'text-emerald-600', bg: 'bg-emerald-100 dark:bg-emerald-900/30' },
              { label: 'Graduated', value: stats.graduated, icon: Award, color: 'text-amber-600', bg: 'bg-amber-100 dark:bg-amber-900/30' },
              { label: 'Completion', value: `${stats.completionRate}%`, icon: Target, color: 'text-purple-600', bg: 'bg-purple-100 dark:bg-purple-900/30' }
            ].map((stat, index) => (
              <motion.div key={index} variants={fadeInUp}>
                <Card className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:shadow-lg transition-all duration-300">
                  <CardContent className="p-4 sm:p-5">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">
                          {stat.label}
                        </p>
                        <p className={`text-xl sm:text-2xl lg:text-3xl font-bold ${stat.color}`}>
                          {stat.value}
                        </p>
                      </div>
                      <div className={cn("p-2 sm:p-3 rounded-xl", stat.bg)}>
                        <stat.icon className="w-4 h-4 sm:w-5 sm:h-5 text-slate-600 dark:text-slate-400" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>

          {/* Filters and Search */}
          <motion.div variants={fadeInUp}>
            <div className="flex flex-col lg:flex-row gap-3 sm:gap-4 p-4 sm:p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Search by name, phone, district..."
                  className="w-full h-10 pl-10 bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 rounded-lg text-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-[140px] lg:w-[160px] h-10 bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Filter className="w-4 h-4 text-slate-500" />
                      <SelectValue placeholder="Status" />
                    </div>
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800">
                    <SelectItem value="all" className="text-sm">All Statuses</SelectItem>
                    <SelectItem value={BeneficiaryStatus.ACTIVE} className="text-sm text-emerald-600">Active</SelectItem>
                    <SelectItem value={BeneficiaryStatus.GRADUATED} className="text-sm text-blue-600">Graduated</SelectItem>
                    <SelectItem value={BeneficiaryStatus.INACTIVE} className="text-sm text-slate-600">Inactive</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={programFilter} onValueChange={setProgramFilter}>
                  <SelectTrigger className="w-full sm:w-[180px] lg:w-[200px] h-10 bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Briefcase className="w-4 h-4 text-slate-500" />
                      <SelectValue placeholder="Program" />
                    </div>
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 max-h-[300px]">
                    <SelectItem value="all" className="text-sm">All Programs</SelectItem>
                    {programs.map(p => (
                      <SelectItem key={p.id} value={p.id} className="text-sm">
                        {p.name?.en || 'Unnamed Program'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </motion.div>

          {/* Beneficiaries Table */}
          <motion.div variants={fadeInUp}>
            <Card className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50 dark:bg-slate-800/50">
                      <TableHead className="w-16">Avatar</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Program</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Capital Progress</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentBeneficiaries.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-slate-500">
                          No beneficiaries found
                        </TableCell>
                      </TableRow>
                    ) : (
                      currentBeneficiaries.map((beneficiary) => {
                        const statusConfig = getStatusConfig(beneficiary.status);
                        const StatusIcon = statusConfig.icon;
                        const progress = beneficiary.startCapital
                          ? Math.min(Math.round((Number(beneficiary.currentCapital) / Number(beneficiary.startCapital)) * 100), 100)
                          : 0;

                        return (
                          <TableRow key={beneficiary.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                            <TableCell>
                              <Avatar className="h-10 w-10">
                                <AvatarImage src={beneficiary.user?.profileImageUrl} />
                                <AvatarFallback className="bg-teal-100 text-teal-800">
                                  {beneficiary.user?.fullName ? getInitials(beneficiary.user.fullName) : 'NA'}
                                </AvatarFallback>
                              </Avatar>
                            </TableCell>
                            <TableCell>
                              <div>
                                <p className="font-medium">{beneficiary.user?.fullName || 'Unknown'}</p>
                                <p className="text-xs text-slate-500">{beneficiary.user?.phone || 'No phone'}</p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge className={cn(
                                "px-2 py-1 text-xs font-medium",
                                statusConfig.bg,
                                statusConfig.text
                              )}>
                                <StatusIcon className="w-3 h-3 mr-1" />
                                {statusConfig.label}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <span className="text-sm">{beneficiary.program?.name?.en || 'Unassigned'}</span>
                            </TableCell>
                            <TableCell>
                              <span className="text-sm">
                                {beneficiary.location?.district || 'N/A'}
                              </span>
                            </TableCell>
                            <TableCell>
                              <div className="w-24">
                                <div className="flex items-center justify-between text-xs mb-1">
                                  <span className="text-slate-500">{progress}%</span>
                                </div>
                                <div className="w-full bg-slate-200 rounded-full h-1.5">
                                  <div
                                    className="h-1.5 rounded-full"
                                    style={{ width: `${progress}%`, backgroundColor: getProgressColor(progress) }}
                                  />
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-2">
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      className="h-8 w-8"
                                      onClick={() => handleViewDetails(beneficiary.id)}
                                    >
                                      <Eye className="w-4 h-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>View Details</TooltipContent>
                                </Tooltip>

                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      className="h-8 w-8"
                                      onClick={() => navigate(`/admin/beneficiaries/${beneficiary.id}/edit`)}
                                    >
                                      <Edit className="w-4 h-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>Edit</TooltipContent>
                                </Tooltip>

                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      className="h-8 w-8"
                                    >
                                      <MoreHorizontal className="w-4 h-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end" className="w-48">
                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={() => handleViewDetails(beneficiary.id)}>
                                      <Eye className="w-4 h-4 mr-2" />
                                      View Details
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleStatusChange(beneficiary.id, 'graduate')}>
                                      <GraduationCap className="w-4 h-4 mr-2" />
                                      Graduate
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      className="text-red-600"
                                      onClick={() => handleStatusChange(beneficiary.id, 'delete')}
                                    >
                                      <Trash2 className="w-4 h-4 mr-2" />
                                      Delete
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              <div className="border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 px-4 sm:px-6 py-3 sm:py-4">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                    Showing <span className="font-medium text-slate-700 dark:text-slate-300">{currentBeneficiaries.length}</span> of{' '}
                    <span className="font-medium text-slate-700 dark:text-slate-300">{totalBeneficiaries}</span> records
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      className="h-8 px-3 text-xs"
                    >
                      Previous
                    </Button>
                    <span className="text-sm text-slate-600 dark:text-slate-400 px-2">
                      {currentPage} / {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={currentPage >= totalPages}
                      onClick={() => setCurrentPage(p => p + 1)}
                      className="h-8 px-3 text-xs"
                    >
                      Next
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Beneficiary Details Dialog */}
        <BeneficiaryDetailsDialog
          beneficiaryId={selectedBeneficiaryId}
          open={detailsDialogOpen}
          onOpenChange={setDetailsDialogOpen}
          onUpdate={() => fetchAllBeneficiaries(true)}
        />
      </motion.div>
    </TooltipProvider>
  );
}