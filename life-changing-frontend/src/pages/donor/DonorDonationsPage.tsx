// pages/donor/DonorDonationsPage.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import {
  Calendar,
  Download,
  Eye,
  Heart,
  CreditCard,
  DollarSign,
  TrendingUp,
  FileText,
  Filter,
  Search,
  Smartphone,
  Mail,
  Phone,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  MoreVertical,
  Pause,
  Play,
  Trash2,
  Edit,
  Loader2
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { donationService } from '@/services/donation.service';
import { programsService } from '@/services/programs.service';
import {
  PaymentStatus,
  DonationType,
  PaymentMethod,
  RecurringFrequency,
  RecurringStatus,
  Currency,
  Program,
  Project,
  Donation,
  RecurringDonation
} from '@/lib/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';

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

// Payment method icons and labels
const paymentMethodConfig = {
  [PaymentMethod.CARD]: {
    icon: CreditCard,
    label: 'Card',
    bg: 'bg-blue-100',
    text: 'text-blue-700'
  },
  [PaymentMethod.MTN_MOBILE_MONEY]: {
    icon: Smartphone,
    label: 'MTN Mobile Money',
    bg: 'bg-yellow-100',
    text: 'text-yellow-700'
  },
  [PaymentMethod.AIRTEL_MONEY]: {
    icon: Smartphone,
    label: 'Airtel Money',
    bg: 'bg-red-100',
    text: 'text-red-700'
  },
  [PaymentMethod.BANK_TRANSFER]: {
    icon: CreditCard,
    label: 'Bank Transfer',
    bg: 'bg-purple-100',
    text: 'text-purple-700'
  }
};

// Status configuration
const getPaymentStatusConfig = (status: PaymentStatus) => {
  const configs = {
    [PaymentStatus.COMPLETED]: {
      bg: 'bg-green-100',
      text: 'text-green-700',
      border: 'border-green-200',
      icon: CheckCircle,
      label: 'Completed'
    },
    [PaymentStatus.PENDING]: {
      bg: 'bg-yellow-100',
      text: 'text-yellow-700',
      border: 'border-yellow-200',
      icon: Clock,
      label: 'Pending'
    },
    [PaymentStatus.FAILED]: {
      bg: 'bg-red-100',
      text: 'text-red-700',
      border: 'border-red-200',
      icon: XCircle,
      label: 'Failed'
    },
    [PaymentStatus.REFUNDED]: {
      bg: 'bg-gray-100',
      text: 'text-gray-700',
      border: 'border-gray-200',
      icon: AlertCircle,
      label: 'Refunded'
    }
  };
  return configs[status] || configs[PaymentStatus.PENDING];
};

const getRecurringStatusConfig = (status: RecurringStatus) => {
  const configs = {
    [RecurringStatus.ACTIVE]: {
      bg: 'bg-green-100',
      text: 'text-green-700',
      border: 'border-green-200',
      icon: CheckCircle,
      label: 'Active'
    },
    [RecurringStatus.PAUSED]: {
      bg: 'bg-yellow-100',
      text: 'text-yellow-700',
      border: 'border-yellow-200',
      icon: Pause,
      label: 'Paused'
    },
    [RecurringStatus.CANCELLED]: {
      bg: 'bg-gray-100',
      text: 'text-gray-700',
      border: 'border-gray-200',
      icon: XCircle,
      label: 'Cancelled'
    }
  };
  return configs[status] || configs[RecurringStatus.ACTIVE];
};

const getPaymentMethodFromDetails = (donation: RecurringDonation): PaymentMethod => {
  if (donation.paymentMethodDetails?.type === 'card') return PaymentMethod.CARD;
  if (donation.paymentMethodDetails?.provider === 'mtn') return PaymentMethod.MTN_MOBILE_MONEY;
  if (donation.paymentMethodDetails?.provider === 'airtel') return PaymentMethod.AIRTEL_MONEY;
  return PaymentMethod.CARD; // default
};

const getFrequencyLabel = (frequency: RecurringFrequency) => {
  const labels = {
    [RecurringFrequency.MONTHLY]: 'Monthly',
    [RecurringFrequency.QUARTERLY]: 'Quarterly',
    [RecurringFrequency.YEARLY]: 'Yearly'
  };
  return labels[frequency] || frequency;
};

const formatCurrency = (amount: number | string, currency?: string) => {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  let currencyEnum: Currency = Currency.USD;

  if (currency) {
    if (currency === Currency.RWF) currencyEnum = Currency.RWF;
    else if (currency === Currency.EUR) currencyEnum = Currency.EUR;
    else currencyEnum = Currency.USD;
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currencyEnum,
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

const formatSafeDate = (date: Date | string | null, fallback: string = 'N/A') => {
  if (!date) return fallback;
  return formatDate(date);
};


const formatDateTime = (date: string | Date) => {
  return new Date(date).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Create Donation Dialog Component with Polling and Dev Mode
interface CreateDonationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

function CreateDonationDialog({ open, onOpenChange, onSuccess }: CreateDonationDialogProps) {
  // DEVELOPMENT MODE FLAG - Set to true to bypass actual payments
  const DEV_MODE = true; // Change to false for production

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [polling, setPolling] = useState(false);
  const [transactionId, setTransactionId] = useState<string | null>(null);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProgram, setSelectedProgram] = useState<string>('');
  const [selectedProject, setSelectedProject] = useState<string>('');

  const [formData, setFormData] = useState({
    amount: 0,
    currency: Currency.USD,
    donationType: DonationType.ONE_TIME,
    paymentMethod: PaymentMethod.CARD,
    programId: '',
    projectId: '',
    donorMessage: '',
    isAnonymous: false,
    // For recurring
    frequency: RecurringFrequency.MONTHLY,
    startDate: new Date().toISOString().split('T')[0],
    sendReminders: true,
    // For card
    paymentMethodId: '',
    // For mobile
    phoneNumber: ''
  });

  // Poll for donation status - COMMENTED OUT FOR DEV MODE
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (!DEV_MODE && polling && transactionId) {
      interval = setInterval(async () => {
        try {
          const status = await donationService.getDonationStatus(transactionId);
          
          if (status.paymentStatus === 'completed') {
            setPolling(false);
            setLoading(false);
            toast.success('Donation completed successfully! Thank you for your support.');
            onSuccess();
            onOpenChange(false);
            resetForm();
          } else if (status.paymentStatus === 'failed') {
            setPolling(false);
            setLoading(false);
            toast.error('Payment failed. Please try again.');
          }
        } catch (error) {
          console.error('Error checking donation status:', error);
        }
      }, 3000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [polling, transactionId, onSuccess, onOpenChange, DEV_MODE]);

  useEffect(() => {
    if (open) {
      loadPrograms();
    }
  }, [open]);

  useEffect(() => {
    if (selectedProgram) {
      loadProjects(selectedProgram);
    }
  }, [selectedProgram]);

  const loadPrograms = async () => {
    try {
      const response = await programsService.getPrograms(1, 100);
      const programsData = (response as any).data?.data || response.data || response;
      setPrograms(Array.isArray(programsData) ? programsData : []);
    } catch (error) {
      console.error('Failed to load programs', error);
    }
  };

  const loadProjects = async (programId: string) => {
    try {
      const response = await programsService.getProjects(1, 100, programId);
      const projectsData = (response as any).data?.data || response.data || response;
      setProjects(Array.isArray(projectsData) ? projectsData : []);
    } catch (error) {
      console.error('Failed to load projects', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        ...formData,
        programId: selectedProgram,
        projectId: selectedProject === 'general' ? undefined : selectedProject,
        amount: Number(formData.amount)
      };

      // DEVELOPMENT MODE - Skip actual API call and simulate success
      if (DEV_MODE) {
        console.log('⚡ DEV MODE: Simulating successful donation');
        
        // Simulate a short delay to show loading state
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Create a mock transaction ID
        const mockTransactionId = `dev_${Date.now()}_${Math.random().toString(36).substring(7)}`;
        setTransactionId(mockTransactionId);
        
        // Show success message immediately
        toast.success('Donation completed successfully! (DEV MODE)');
        onSuccess();
        onOpenChange(false);
        resetForm();
        return;
      }

      // PRODUCTION MODE - Normal flow
      let response;
      
      if (formData.donationType === DonationType.ONE_TIME) {
        response = await donationService.createDonation(payload);
      } else {
        response = await donationService.createRecurring(payload);
      }

      // Extract transaction ID from response
      const newTransactionId = response.transactionId || response.id;
      setTransactionId(newTransactionId);
      
      toast.info(`Payment initiated! Transaction ID: ${newTransactionId}`);
      
      // Start polling for status
      setPolling(true);
      
    } catch (error: any) {
      console.error('Donation failed:', error);
      
      // DEVELOPMENT MODE - Even if API fails, show success
      if (DEV_MODE) {
        console.log('⚡ DEV MODE: API failed but simulating success anyway');
        toast.success('Donation completed successfully! (DEV MODE)');
        onSuccess();
        onOpenChange(false);
        resetForm();
        return;
      }
      
      toast.error(error.response?.data?.message || 'Failed to create donation');
      setLoading(false);
    }
  };

  const resetForm = () => {
    setStep(1);
    setSelectedProgram('');
    setSelectedProject('');
    setTransactionId(null);
    setPolling(false);
    setFormData({
      amount: 0,
      currency: Currency.USD,
      donationType: DonationType.ONE_TIME,
      paymentMethod: PaymentMethod.CARD,
      programId: '',
      projectId: '',
      donorMessage: '',
      isAnonymous: false,
      frequency: RecurringFrequency.MONTHLY,
      startDate: new Date().toISOString().split('T')[0],
      sendReminders: true,
      paymentMethodId: '',
      phoneNumber: ''
    });
  };

   return (
    <Dialog open={open} onOpenChange={(newOpen) => {
      if (!newOpen && !polling) {
        resetForm();
        onOpenChange(false);
      } else if (!newOpen && polling) {
        // Don't close while polling
        toast.info('Please wait while we process your donation...');
      }
    }}>
      <DialogContent className="sm:max-w-[600px] p-0">
        <div className="flex flex-col" style={{ maxHeight: '90vh' }}>
          {/* Header */}
          <div className="px-6 py-4 border-b">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">
                {polling ? 'Processing Donation' : 'Make a Donation'}
              </DialogTitle>
              <DialogDescription>
                {polling 
                  ? 'Please wait while we confirm your payment...' 
                  : 'Support our programs and make a difference'}
              </DialogDescription>
            </DialogHeader>
          </div>

          {/* Steps Indicator - Hide during polling */}
          {!polling && (
            <div className="px-6 py-4 bg-slate-50 border-b">
              <div className="flex items-center justify-between max-w-md mx-auto">
                {[1, 2, 3].map((s) => (
                  <div key={s} className="flex items-center">
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold",
                      s === step ? "bg-teal-600 text-white" :
                        s < step ? "bg-teal-100 text-teal-600" : "bg-slate-200 text-slate-400"
                    )}>
                      {s < step ? '✓' : s}
                    </div>
                    {s < 3 && (
                      <div className={cn(
                        "w-12 h-1 mx-2",
                        s < step ? "bg-teal-600" : "bg-slate-200"
                      )} />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Scrollable Content */}
          <div className="overflow-y-auto flex-1 px-6 py-4">
            {polling ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="w-16 h-16 animate-spin text-teal-600 mb-4" />
                <h3 className="text-lg font-semibold mb-2">Processing Your Donation</h3>
                <p className="text-sm text-slate-500 text-center mb-4">
                  Please wait while we confirm your payment with the provider.
                  This may take a few moments.
                </p>
                {transactionId && (
                  <div className="bg-slate-50 p-4 rounded-lg w-full">
                    <p className="text-xs text-slate-500 mb-1">Transaction ID</p>
                    <p className="text-sm font-mono break-all">{transactionId}</p>
                  </div>
                )}
              </div>
            ) : (
              <form id="donation-form" onSubmit={handleSubmit} className="space-y-6">
                {/* Step 1: Program Selection */}
                {step === 1 && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-6"
                  >
                    {/* Program Selection */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <div className="w-1 h-5 bg-teal-500 rounded-full"></div>
                        <Label className="text-xs font-bold uppercase text-slate-400 tracking-wider">
                          Select Program
                        </Label>
                      </div>
                      <Select value={selectedProgram} onValueChange={setSelectedProgram}>
                        <SelectTrigger>
                          <SelectValue placeholder="Choose a program to support" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="general">General Fund</SelectItem>
                          {programs.map((program) => (
                            <SelectItem key={program.id} value={program.id}>
                              {program.name.en}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Project Selection (Optional) */}
                    {selectedProgram && selectedProgram !== 'general' && projects.length > 0 && (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <div className="w-1 h-5 bg-teal-500 rounded-full"></div>
                          <Label className="text-xs font-bold uppercase text-slate-400 tracking-wider">
                            Select Project (Optional)
                          </Label>
                        </div>
                        <Select value={selectedProject} onValueChange={setSelectedProject}>
                          <SelectTrigger>
                            <SelectValue placeholder="Choose a specific project" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="general">General Program Fund</SelectItem>
                            {projects.map((project) => (
                              <SelectItem key={project.id} value={project.id}>
                                {project.name.en}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    {/* Donation Type */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <div className="w-1 h-5 bg-teal-500 rounded-full"></div>
                        <Label className="text-xs font-bold uppercase text-slate-400 tracking-wider">
                          Donation Type
                        </Label>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <Button
                          type="button"
                          variant={formData.donationType === DonationType.ONE_TIME ? 'default' : 'outline'}
                          className={cn(
                            "h-12",
                            formData.donationType === DonationType.ONE_TIME && "bg-teal-600 hover:bg-teal-700"
                          )}
                          onClick={() => setFormData({ ...formData, donationType: DonationType.ONE_TIME })}
                        >
                          One-Time
                        </Button>
                        <Button
                          type="button"
                          variant={formData.donationType !== DonationType.ONE_TIME ? 'default' : 'outline'}
                          className={cn(
                            "h-12",
                            formData.donationType !== DonationType.ONE_TIME && "bg-teal-600 hover:bg-teal-700"
                          )}
                          onClick={() => setFormData({ ...formData, donationType: DonationType.MONTHLY })}
                        >
                          Recurring
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Step 2: Amount & Payment */}
                {step === 2 && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-6"
                  >
                    {/* Amount & Currency */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <div className="w-1 h-5 bg-teal-500 rounded-full"></div>
                        <Label className="text-xs font-bold uppercase text-slate-400 tracking-wider">
                          Amount
                        </Label>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Input
                            type="number"
                            placeholder="Enter amount"
                            value={formData.amount || ''}
                            onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                            min="1"
                            required
                          />
                        </div>
                        <Select
                          value={formData.currency}
                          onValueChange={(val: Currency) => setFormData({ ...formData, currency: val })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value={Currency.USD}>USD</SelectItem>
                            <SelectItem value={Currency.RWF}>RWF</SelectItem>
                            <SelectItem value={Currency.EUR}>EUR</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Payment Method */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <div className="w-1 h-5 bg-teal-500 rounded-full"></div>
                        <Label className="text-xs font-bold uppercase text-slate-400 tracking-wider">
                          Payment Method
                        </Label>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        {/* Card Payment */}
                        <Button
                          type="button"
                          variant="outline"
                          className={cn(
                            "h-12 justify-start gap-2",
                            formData.paymentMethod === PaymentMethod.CARD && "border-teal-500 bg-teal-50"
                          )}
                          onClick={() => setFormData({ ...formData, paymentMethod: PaymentMethod.CARD })}
                        >
                          <CreditCard className="w-4 h-4" />
                          <span className="text-sm">Credit Card</span>
                        </Button>
                        
                        {/* MTN Mobile Money */}
                        <Button
                          type="button"
                          variant="outline"
                          className={cn(
                            "h-12 justify-start gap-2",
                            formData.paymentMethod === PaymentMethod.MTN_MOBILE_MONEY && "border-teal-500 bg-teal-50"
                          )}
                          onClick={() => setFormData({ ...formData, paymentMethod: PaymentMethod.MTN_MOBILE_MONEY })}
                        >
                          <Smartphone className="w-4 h-4" />
                          <span className="text-sm">MTN Money</span>
                        </Button>
                        
                        {/* Airtel Money */}
                        <Button
                          type="button"
                          variant="outline"
                          className={cn(
                            "h-12 justify-start gap-2",
                            formData.paymentMethod === PaymentMethod.AIRTEL_MONEY && "border-teal-500 bg-teal-50"
                          )}
                          onClick={() => setFormData({ ...formData, paymentMethod: PaymentMethod.AIRTEL_MONEY })}
                        >
                          <Smartphone className="w-4 h-4" />
                          <span className="text-sm">Airtel Money</span>
                        </Button>
                      </div>
                    </div>

                    {/* Payment Details based on method */}
                    {formData.paymentMethod === PaymentMethod.CARD && (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <div className="w-1 h-5 bg-teal-500 rounded-full"></div>
                          <Label className="text-xs font-bold uppercase text-slate-400 tracking-wider">
                            Card Details
                          </Label>
                        </div>
                        <Input
                          placeholder="Payment Method ID (e.g., pm_card_visa)"
                          value={formData.paymentMethodId || ''}
                          onChange={(e) => setFormData({ ...formData, paymentMethodId: e.target.value })}
                        />
                        <p className="text-xs text-slate-400">
                          For testing: pm_card_visa, pm_card_mastercard, etc.
                        </p>
                      </div>
                    )}

                    {(formData.paymentMethod === PaymentMethod.MTN_MOBILE_MONEY ||
                      formData.paymentMethod === PaymentMethod.AIRTEL_MONEY) && (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <div className="w-1 h-5 bg-teal-500 rounded-full"></div>
                          <Label className="text-xs font-bold uppercase text-slate-400 tracking-wider">
                            Phone Number
                          </Label>
                        </div>
                        <Input
                          placeholder="Phone number (e.g., 0788123456)"
                          value={formData.phoneNumber || ''}
                          onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                        />
                      </div>
                    )}

                    {/* Recurring Details */}
                    {formData.donationType !== DonationType.ONE_TIME && (
                      <div className="space-y-4">
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <div className="w-1 h-5 bg-teal-500 rounded-full"></div>
                            <Label className="text-xs font-bold uppercase text-slate-400 tracking-wider">
                              Frequency
                            </Label>
                          </div>
                          <div className="grid grid-cols-3 gap-2">
                            <Button
                              type="button"
                              variant={formData.frequency === RecurringFrequency.MONTHLY ? 'default' : 'outline'}
                              className={cn(
                                "h-10",
                                formData.frequency === RecurringFrequency.MONTHLY && "bg-teal-600 hover:bg-teal-700"
                              )}
                              onClick={() => setFormData({ ...formData, frequency: RecurringFrequency.MONTHLY })}
                            >
                              Monthly
                            </Button>
                            <Button
                              type="button"
                              variant={formData.frequency === RecurringFrequency.QUARTERLY ? 'default' : 'outline'}
                              className={cn(
                                "h-10",
                                formData.frequency === RecurringFrequency.QUARTERLY && "bg-teal-600 hover:bg-teal-700"
                              )}
                              onClick={() => setFormData({ ...formData, frequency: RecurringFrequency.QUARTERLY })}
                            >
                              Quarterly
                            </Button>
                            <Button
                              type="button"
                              variant={formData.frequency === RecurringFrequency.YEARLY ? 'default' : 'outline'}
                              className={cn(
                                "h-10",
                                formData.frequency === RecurringFrequency.YEARLY && "bg-teal-600 hover:bg-teal-700"
                              )}
                              onClick={() => setFormData({ ...formData, frequency: RecurringFrequency.YEARLY })}
                            >
                              Yearly
                            </Button>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <Label>Start Date</Label>
                          <Input
                            type="date"
                            value={formData.startDate}
                            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                            min={new Date().toISOString().split('T')[0]}
                          />
                        </div>

                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            id="sendReminders"
                            checked={formData.sendReminders}
                            onChange={(e) => setFormData({ ...formData, sendReminders: e.target.checked })}
                            className="rounded border-slate-300"
                          />
                          <Label htmlFor="sendReminders" className="text-sm">
                            Send me reminders before each charge
                          </Label>
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}

                {/* Step 3: Message & Review */}
                {step === 3 && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-6"
                  >
                    {/* Donor Message */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <div className="w-1 h-5 bg-teal-500 rounded-full"></div>
                        <Label className="text-xs font-bold uppercase text-slate-400 tracking-wider">
                          Personal Message (Optional)
                        </Label>
                      </div>
                      <textarea
                        className="w-full min-h-[100px] p-3 border rounded-lg focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                        placeholder="Leave a message of support..."
                        value={formData.donorMessage}
                        onChange={(e) => setFormData({ ...formData, donorMessage: e.target.value })}
                      />
                    </div>

                    {/* Anonymous Option */}
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="isAnonymous"
                        checked={formData.isAnonymous}
                        onChange={(e) => setFormData({ ...formData, isAnonymous: e.target.checked })}
                        className="rounded border-slate-300"
                      />
                      <Label htmlFor="isAnonymous" className="text-sm">
                        Make this donation anonymous
                      </Label>
                    </div>

                    {/* Summary */}
                    <div className="bg-slate-50 p-4 rounded-lg space-y-2">
                      <h4 className="font-semibold mb-2">Donation Summary</h4>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500">Amount:</span>
                        <span className="font-medium">{formatCurrency(formData.amount, formData.currency)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500">Type:</span>
                        <span className="font-medium">
                          {formData.donationType === DonationType.ONE_TIME ? 'One-Time' : `Recurring (${getFrequencyLabel(formData.frequency)})`}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500">Payment Method:</span>
                        <span className="font-medium">
                          {formData.paymentMethod === PaymentMethod.CARD ? 'Credit Card' :
                           formData.paymentMethod === PaymentMethod.MTN_MOBILE_MONEY ? 'MTN Mobile Money' :
                           formData.paymentMethod === PaymentMethod.AIRTEL_MONEY ? 'Airtel Money' : 'Card'}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </form>
            )}
          </div>

          {/* Footer */}
          {!polling && (
            <div className="px-6 py-4 border-t flex justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={() => step > 1 ? setStep(s => s - 1) : onOpenChange(false)}
                disabled={loading}
              >
                {step > 1 ? 'Previous' : 'Cancel'}
              </Button>
              <Button
                type={step === 3 ? 'submit' : 'button'}
                form="donation-form"
                onClick={() => step < 3 && setStep(s => s + 1)}
                disabled={loading}
                className="bg-teal-600 hover:bg-teal-700 text-white"
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {step === 3 ? 'Complete Donation' : 'Next'}
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Donation Details Dialog
interface DonationDetailsDialogProps {
  donation: Donation | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function DonationDetailsDialog({ donation, open, onOpenChange }: DonationDetailsDialogProps) {
  if (!donation) return null;

  const statusConfig = getPaymentStatusConfig(donation.paymentStatus);
  const StatusIcon = statusConfig.icon;
  const paymentConfig = paymentMethodConfig[donation.paymentMethod as PaymentMethod] || paymentMethodConfig[PaymentMethod.CARD];
  const PaymentIcon = paymentConfig.icon;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <Heart className="w-5 h-5 text-teal-600" />
            Donation Details
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Status Badge */}
          <div className="flex justify-center">
            <Badge className={cn("px-4 py-2 text-sm", statusConfig.bg, statusConfig.text)}>
              <StatusIcon className="w-4 h-4 mr-2 inline-block" />
              {statusConfig.label}
            </Badge>
          </div>

          {/* Amount */}
          <div className="text-center">
            <p className="text-4xl font-bold text-teal-600">
              {formatCurrency(donation.amount, donation.currency)}
            </p>
            <p className="text-sm text-slate-500 mt-1">
              {donation.donationType === DonationType.ONE_TIME ? 'One-Time Donation' : 'Recurring Donation'}
            </p>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-slate-50 rounded-lg">
              <p className="text-xs text-slate-500 mb-1">Date</p>
              <p className="text-sm font-medium">{formatDateTime(donation.createdAt)}</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg">
              <p className="text-xs text-slate-500 mb-1">Transaction ID</p>
              <p className="text-sm font-mono">{donation.transactionId || 'N/A'}</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg">
              <p className="text-xs text-slate-500 mb-1">Program</p>
              <p className="text-sm font-medium">{donation.program?.name.en || 'General Fund'}</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg">
              <p className="text-xs text-slate-500 mb-1">Project</p>
              <p className="text-sm font-medium">{donation.project?.name.en || 'General Fund'}</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg">
              <p className="text-xs text-slate-500 mb-1">Payment Method</p>
              <div className="flex items-center gap-2">
                <PaymentIcon className="w-4 h-4" />
                <p className="text-sm font-medium">{paymentConfig.label}</p>
              </div>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg">
              <p className="text-xs text-slate-500 mb-1">Receipt</p>
              <p className="text-sm font-medium">
                {donation.receiptNumber ? donation.receiptNumber : 'Not issued'}
              </p>
            </div>
          </div>

          {/* Donor Message */}
          {donation.donorMessage && (
            <div className="p-4 bg-teal-50 rounded-lg">
              <p className="text-sm italic text-teal-700">"{donation.donorMessage}"</p>
              <p className="text-xs text-teal-500 mt-2">
                {donation.isAnonymous ? 'Anonymous Donor' : 'Thank you for your support!'}
              </p>
            </div>
          )}

          {/* Payment Details */}
          {donation.paymentDetails && (
            <div className="space-y-2">
              <p className="text-sm font-semibold">Payment Details</p>
              <div className="bg-slate-50 p-3 rounded-lg text-xs space-y-1">
                {Object.entries(donation.paymentDetails).map(([key, value]) => (
                  <div key={key} className="flex justify-between">
                    <span className="text-slate-500 capitalize">{key}:</span>
                    <span className="font-mono">{String(value)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Receipt Button */}
          {donation.paymentStatus === PaymentStatus.COMPLETED && (
            <Button className="w-full bg-teal-600 hover:bg-teal-700 text-white">
              <Download className="w-4 h-4 mr-2" />
              Download Receipt
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Recurring Donation Details Dialog
interface RecurringDetailsDialogProps {
  donation: RecurringDonation | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: () => void;
}

function RecurringDetailsDialog({ donation, open, onOpenChange, onUpdate }: RecurringDetailsDialogProps) {
  const [loading, setLoading] = useState(false);

  if (!donation) return null;

  const statusConfig = getRecurringStatusConfig(donation.status);
  const StatusIcon = statusConfig.icon;
  const paymentMethod = getPaymentMethodFromDetails(donation);
  const paymentConfig = paymentMethodConfig[paymentMethod] || paymentMethodConfig[PaymentMethod.CARD];
  const PaymentIcon = paymentConfig.icon;

  const handleCancel = async () => {
    if (!confirm('Are you sure you want to cancel this recurring donation?')) return;
    setLoading(true);
    try {
      await donationService.cancelRecurring(donation.id);
      toast.success('Recurring donation cancelled');
      onUpdate();
      onOpenChange(false);
    } catch (error) {
      toast.error('Failed to cancel donation');
    } finally {
      setLoading(false);
    }
  };

  const handlePause = async () => {
    // This would need an API endpoint to pause/resume
    toast.info('Pause functionality coming soon');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <Heart className="w-5 h-5 text-teal-600" />
            Recurring Donation Details
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Status Badge */}
          <div className="flex justify-center">
            <Badge className={cn("px-4 py-2 text-sm", statusConfig.bg, statusConfig.text)}>
              <StatusIcon className="w-4 h-4 mr-2 inline-block" />
              {statusConfig.label}
            </Badge>
          </div>

          {/* Amount and Frequency */}
          <div className="text-center">
            <p className="text-4xl font-bold text-teal-600">
              {formatCurrency(donation.amount, donation.currency)}
            </p>
            <p className="text-sm text-slate-500 mt-1">
              {getFrequencyLabel(donation.frequency)} • Started {formatSafeDate(donation.startDate)}
            </p>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-slate-50 rounded-lg">
              <p className="text-xs text-slate-500 mb-1">Next Charge</p>
              <p className="text-sm font-medium">{formatDate(donation.nextChargeDate)}</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg">
              <p className="text-xs text-slate-500 mb-1">Total Charges</p>
              <p className="text-sm font-medium">{donation.totalCharges} times</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg">
              <p className="text-xs text-slate-500 mb-1">Total Amount</p>
              <p className="text-sm font-medium">{formatCurrency(donation.totalAmount, donation.currency)}</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg">
              <p className="text-xs text-slate-500 mb-1">Program</p>
              <p className="text-sm font-medium">{donation.program?.name.en || 'General Fund'}</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg col-span-2">
              <p className="text-xs text-slate-500 mb-1">Payment Method</p>
              <div className="flex items-center gap-2">
                <PaymentIcon className="w-4 h-4" />
                <p className="text-sm font-medium">{paymentConfig.label}</p>
                {donation.paymentMethodDetails && (
                  <span className="text-xs text-slate-500">
                    {donation.paymentMethodDetails.type === 'card' && (
                      <>• {donation.paymentMethodDetails.brand} •••• {donation.paymentMethodDetails.last4}</>
                    )}
                    {donation.paymentMethodDetails.type === 'mobile_money' && (
                      <>• {donation.paymentMethodDetails.phoneNumber}</>
                    )}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          {donation.status === RecurringStatus.ACTIVE && (
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={handlePause}
                disabled={loading}
              >
                <Pause className="w-4 h-4 mr-2" />
                Pause
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => toast.info('Edit functionality coming soon')}
              >
                <Edit className="w-4 h-4 mr-2" />
                Modify
              </Button>
              <Button
                variant="outline"
                className="flex-1 text-red-600 hover:text-red-700"
                onClick={handleCancel}
                disabled={loading}
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4 mr-2" />}
                Cancel
              </Button>
            </div>
          )}
          {donation.status === RecurringStatus.PAUSED && (
            <Button className="w-full bg-teal-600 hover:bg-teal-700 text-white">
              <Play className="w-4 h-4 mr-2" />
              Resume Donation
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Main Donations Page Component
export default function DonorDonationsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [donations, setDonations] = useState<Donation[]>([]);
  const [recurringDonations, setRecurringDonations] = useState<RecurringDonation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [yearFilter, setYearFilter] = useState<string>('all');
  const [selectedDonation, setSelectedDonation] = useState<Donation | null>(null);
  const [selectedRecurring, setSelectedRecurring] = useState<RecurringDonation | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [recurringDetailsOpen, setRecurringDetailsOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  // Chart data
  const [monthlyData, setMonthlyData] = useState<any[]>([]);
  const [programDistribution, setProgramDistribution] = useState<any[]>([]);

  const CHART_COLORS = ['#4c9789', '#eacfa2', '#6fb3a6', '#3a7369', '#d4a5a5', '#9b8c7c'];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [donationsData, recurringData] = await Promise.all([
        donationService.getMyDonations(),
        donationService.getMyRecurring()
      ]);

      // Handle API response structure
      const donationsList = (donationsData as any).data?.data || donationsData;
      const recurringList = (recurringData as any).data?.data || recurringData;

      setDonations(Array.isArray(donationsList) ? donationsList : []);
      setRecurringDonations(Array.isArray(recurringList) ? recurringList : []);

      // Prepare chart data
      prepareChartData(Array.isArray(donationsList) ? donationsList : []);
    } catch (error) {
      console.error('Failed to fetch donations', error);
      toast.error('Failed to load donations');
    } finally {
      setLoading(false);
    }
  };

  const prepareChartData = (donationsList: Donation[]) => {
    // Monthly data
    const months: { [key: string]: number } = {};
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = date.toLocaleString('en-US', { month: 'short' });
      months[monthKey] = 0;
    }

    donationsList.forEach(donation => {
      if (donation.paymentStatus === PaymentStatus.COMPLETED) {
        const date = new Date(donation.createdAt);
        const monthKey = date.toLocaleString('en-US', { month: 'short' });
        if (months.hasOwnProperty(monthKey)) {
          months[monthKey] += Number(donation.amount);
        }
      }
    });

    setMonthlyData(Object.entries(months).map(([month, amount]) => ({ month, amount })));

    // Program distribution
    const programs: { [key: string]: number } = {};
    donationsList.forEach(donation => {
      if (donation.paymentStatus === PaymentStatus.COMPLETED) {
        const programName = donation.program?.name.en || 'General Fund';
        programs[programName] = (programs[programName] || 0) + Number(donation.amount);
      }
    });

    setProgramDistribution(
      Object.entries(programs).map(([name, value], index) => ({
        name,
        value,
        color: CHART_COLORS[index % CHART_COLORS.length]
      }))
    );
  };

  // Filter donations
  const filteredDonations = donations.filter(donation => {
    const matchesSearch = searchTerm === '' ||
      donation.program?.name.en?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      donation.project?.name.en?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      donation.transactionId?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || donation.paymentStatus === statusFilter;

    const matchesYear = yearFilter === 'all' ||
      new Date(donation.createdAt).getFullYear().toString() === yearFilter;

    return matchesSearch && matchesStatus && matchesYear;
  });

  const oneTimeDonations = filteredDonations.filter(d => d.donationType === DonationType.ONE_TIME);
  const completedDonations = filteredDonations.filter(d => d.paymentStatus === PaymentStatus.COMPLETED);

  // Calculate totals
  const totalDonated = completedDonations.reduce((sum, d) => sum + Number(d.amount), 0);
  const currentYear = new Date().getFullYear();
  const yearTotal = completedDonations
    .filter(d => new Date(d.createdAt).getFullYear() === currentYear)
    .reduce((sum, d) => sum + Number(d.amount), 0);

  // Get unique years for filter
  const years = [...new Set(donations.map(d => new Date(d.createdAt).getFullYear().toString()))].sort().reverse();

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={staggerContainer}
      className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-teal-950/20"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 space-y-6 sm:space-y-8">

        {/* Header */}
        <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white tracking-tight">
              My Donations
            </h1>
            <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 flex items-center gap-2 mt-1">
              <Heart className="w-4 h-4" />
              <span>View and manage all your contributions</span>
            </p>
          </div>

          <Button
            className="bg-teal-600 hover:bg-teal-700 text-white"
            onClick={() => setCreateDialogOpen(true)}
          >
            <Heart className="w-4 h-4 mr-2" />
            Make a Donation
          </Button>
        </motion.div>

        {/* Summary Cards */}
        <motion.div variants={fadeInUp} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-teal-600 to-teal-700 text-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-teal-100">Total Donated</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl sm:text-3xl font-bold">
                {formatCurrency(totalDonated)}
              </div>
              <p className="text-xs text-teal-200 mt-1">Lifetime contributions</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">Total Donations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl sm:text-3xl font-bold text-slate-900">
                {donations.length}
              </div>
              <p className="text-xs text-slate-400 mt-1">Individual contributions</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">Recurring Donations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl sm:text-3xl font-bold text-blue-600">
                {recurringDonations.length}
              </div>
              <p className="text-xs text-slate-400 mt-1">Active subscriptions</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">This Year</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl sm:text-3xl font-bold text-green-600">
                {formatCurrency(yearTotal)}
              </div>
              <p className="text-xs text-slate-400 mt-1">{currentYear} total</p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Charts */}
        <motion.div variants={fadeInUp} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Donation History</CardTitle>
              <CardDescription>Your giving over the last 6 months</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                  <XAxis dataKey="month" stroke="#666" />
                  <YAxis stroke="#666" />
                  <Tooltip
                    formatter={(value: number) => formatCurrency(value)}
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #e0e0e0',
                      borderRadius: '8px',
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="amount"
                    stroke="#4c9789"
                    strokeWidth={2}
                    name="Amount"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Program Distribution</CardTitle>
              <CardDescription>Where your donations go</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={programDistribution.length ? programDistribution : [{ name: 'No Data', value: 1, color: '#ccc' }]}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) =>
                      value > 0 ? `${name}: ${formatCurrency(value)}` : ''
                    }
                    outerRadius={80}
                    dataKey="value"
                  >
                    {programDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Tabs and Filters */}
        <motion.div variants={fadeInUp}>
          <Tabs defaultValue="all" className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <TabsList>
                <TabsTrigger value="all">All Donations ({filteredDonations.length})</TabsTrigger>
                <TabsTrigger value="one-time">One-Time ({oneTimeDonations.length})</TabsTrigger>
                <TabsTrigger value="recurring">Recurring ({recurringDonations.length})</TabsTrigger>
              </TabsList>

              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    placeholder="Search donations..."
                    className="pl-9 w-full sm:w-[200px]"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-[140px]">
                    <div className="flex items-center gap-2">
                      <Filter className="w-4 h-4" />
                      <SelectValue placeholder="Status" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value={PaymentStatus.COMPLETED}>Completed</SelectItem>
                    <SelectItem value={PaymentStatus.PENDING}>Pending</SelectItem>
                    <SelectItem value={PaymentStatus.FAILED}>Failed</SelectItem>
                    <SelectItem value={PaymentStatus.REFUNDED}>Refunded</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={yearFilter} onValueChange={setYearFilter}>
                  <SelectTrigger className="w-full sm:w-[120px]">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <SelectValue placeholder="Year" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Years</SelectItem>
                    {years.map(year => (
                      <SelectItem key={year} value={year}>{year}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* All Donations Tab */}
            <TabsContent value="all">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>All Donations</CardTitle>
                    <CardDescription>Complete history of your contributions</CardDescription>
                  </div>
                  <Button variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
                    </div>
                  ) : filteredDonations.length === 0 ? (
                    <div className="text-center py-12">
                      <Heart className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                      <p className="text-slate-500">No donations found</p>
                      <Button
                        variant="link"
                        className="text-teal-600 mt-2"
                        onClick={() => setCreateDialogOpen(true)}
                      >
                        Make your first donation
                      </Button>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Program/Project</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Payment Method</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Receipt</TableHead>
                            <TableHead></TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredDonations.map((donation) => {
                            const statusConfig = getPaymentStatusConfig(donation.paymentStatus);
                            const StatusIcon = statusConfig.icon;
                            const paymentConfig = paymentMethodConfig[donation.paymentMethod as PaymentMethod] || paymentMethodConfig[PaymentMethod.CARD];
                            const PaymentIcon = paymentConfig.icon;

                            return (
                              <TableRow key={donation.id} className="hover:bg-slate-50">
                                <TableCell className="font-medium">
                                  {formatDate(donation.createdAt)}
                                </TableCell>
                                <TableCell>
                                  <Badge variant="outline" className={
                                    donation.donationType === DonationType.ONE_TIME
                                      ? 'border-slate-300 text-slate-700'
                                      : 'border-blue-300 text-blue-700'
                                  }>
                                    {donation.donationType === DonationType.ONE_TIME ? 'One-Time' : 'Recurring'}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  <div>
                                    <p className="text-sm font-medium">
                                      {donation.program?.name.en || 'General Fund'}
                                    </p>
                                    {donation.project && (
                                      <p className="text-xs text-slate-500">
                                        {donation.project.name.en}
                                      </p>
                                    )}
                                  </div>
                                </TableCell>
                                <TableCell className="font-semibold">
                                  {formatCurrency(donation.amount, donation.currency)}
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    <PaymentIcon className="w-4 h-4 text-slate-400" />
                                    <span className="text-sm">{paymentConfig.label}</span>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <Badge className={cn("gap-1", statusConfig.bg, statusConfig.text)}>
                                    <StatusIcon className="w-3 h-3" />
                                    {statusConfig.label}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  {donation.receiptNumber ? (
                                    <Button variant="ghost" size="sm">
                                      <FileText className="w-4 h-4" />
                                    </Button>
                                  ) : (
                                    <span className="text-xs text-slate-400">N/A</span>
                                  )}
                                </TableCell>
                                <TableCell>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                      setSelectedDonation(donation);
                                      setDetailsOpen(true);
                                    }}
                                  >
                                    <Eye className="w-4 h-4" />
                                  </Button>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* One-Time Donations Tab */}
            <TabsContent value="one-time">
              <Card>
                <CardHeader>
                  <CardTitle>One-Time Donations</CardTitle>
                  <CardDescription>Individual contributions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Program</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {oneTimeDonations.map((donation) => {
                          const statusConfig = getPaymentStatusConfig(donation.paymentStatus);
                          const StatusIcon = statusConfig.icon;

                          return (
                            <TableRow key={donation.id}>
                              <TableCell>{formatDate(donation.createdAt)}</TableCell>
                              <TableCell>{donation.program?.name.en || 'General Fund'}</TableCell>
                              <TableCell className="font-semibold">
                                {formatCurrency(donation.amount, donation.currency)}
                              </TableCell>
                              <TableCell>
                                <Badge className={cn("gap-1", statusConfig.bg, statusConfig.text)}>
                                  <StatusIcon className="w-3 h-3" />
                                  {statusConfig.label}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedDonation(donation);
                                    setDetailsOpen(true);
                                  }}
                                >
                                  <Eye className="w-4 h-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Recurring Donations Tab */}
            <TabsContent value="recurring">
              <Card>
                <CardHeader>
                  <CardTitle>Recurring Donations</CardTitle>
                  <CardDescription>Manage your active subscriptions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recurringDonations.length === 0 ? (
                      <div className="text-center py-8">
                        <p className="text-slate-500">No recurring donations found</p>
                      </div>
                    ) : (
                      recurringDonations.map((donation) => {
                        const statusConfig = getRecurringStatusConfig(donation.status);
                        const StatusIcon = statusConfig.icon;
                        const paymentMethod = getPaymentMethodFromDetails(donation);
                        const paymentConfig = paymentMethodConfig[paymentMethod] || paymentMethodConfig[PaymentMethod.CARD];

                        return (
                          <div
                            key={donation.id}
                            className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                          >
                            <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <h3 className="font-semibold text-lg">
                                    {formatCurrency(donation.amount, donation.currency)} / {getFrequencyLabel(donation.frequency)}
                                  </h3>
                                  <Badge className={cn("gap-1", statusConfig.bg, statusConfig.text)}>
                                    <StatusIcon className="w-3 h-3" />
                                    {statusConfig.label}
                                  </Badge>
                                </div>
                                <p className="text-slate-600 mb-3">
                                  {donation.program?.name.en || 'General Fund'}
                                </p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                                  <div>
                                    <p className="text-slate-500">Next Charge</p>
                                    <p className="font-medium">{formatDate(donation.nextChargeDate)}</p>
                                  </div>
                                  <div>
                                    <p className="text-slate-500">Total Contributed</p>
                                    <p className="font-medium">{formatCurrency(donation.totalAmount, donation.currency)}</p>
                                  </div>
                                  <div>
                                    <p className="text-slate-500">Payment Method</p>
                                    <div className="flex items-center gap-2">
                                      <paymentConfig.icon className="w-4 h-4" />
                                      <p className="font-medium">{paymentConfig.label}</p>
                                    </div>
                                  </div>
                                  <div>
                                    <p className="text-slate-500">Total Charges</p>
                                    <p className="font-medium">{donation.totalCharges} times</p>
                                  </div>
                                </div>
                              </div>
                              <div className="flex lg:flex-col gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedRecurring(donation);
                                    setRecurringDetailsOpen(true);
                                  }}
                                >
                                  <Eye className="w-4 h-4 mr-2" />
                                  Details
                                </Button>
                                {donation.status === RecurringStatus.ACTIVE && (
                                  <>
                                    <Button variant="outline" size="sm">
                                      <Pause className="w-4 h-4 mr-2" />
                                      Pause
                                    </Button>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="text-red-600 hover:text-red-700"
                                      onClick={async () => {
                                        if (confirm('Cancel this recurring donation?')) {
                                          try {
                                            await donationService.cancelRecurring(donation.id);
                                            toast.success('Donation cancelled');
                                            fetchData();
                                          } catch (error) {
                                            toast.error('Failed to cancel');
                                          }
                                        }
                                      }}
                                    >
                                      <Trash2 className="w-4 h-4 mr-2" />
                                      Cancel
                                    </Button>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>

        {/* Tax Information */}
        <motion.div variants={fadeInUp}>
          <Card>
            <CardHeader>
              <CardTitle>Tax Information</CardTitle>
              <CardDescription>Download your annual tax receipts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {years.map(year => {
                  const yearTotal = completedDonations
                    .filter(d => new Date(d.createdAt).getFullYear().toString() === year)
                    .reduce((sum, d) => sum + Number(d.amount), 0);

                  if (yearTotal === 0) return null;

                  return (
                    <div key={year} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{year} Tax Receipt</p>
                        <p className="text-sm text-slate-500">Total: {formatCurrency(yearTotal)}</p>
                      </div>
                      <Button variant="outline" size="sm">
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Dialogs */}
      <CreateDonationDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSuccess={fetchData}
      />

      <DonationDetailsDialog
        donation={selectedDonation}
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
      />

      <RecurringDetailsDialog
        donation={selectedRecurring}
        open={recurringDetailsOpen}
        onOpenChange={setRecurringDetailsOpen}
        onUpdate={fetchData}
      />
    </motion.div>
  );
}