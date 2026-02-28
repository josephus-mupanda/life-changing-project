// pages/donor/DonorDashboard.tsx
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Heart,
  Calendar,
  FileText,
  ArrowRight,
  Loader2,
  TrendingUp,
  Users,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Download
} from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useAuth } from '@/lib/auth-context';
import { donorService } from '@/services/donor.service';
import { donationService } from '@/services/donation.service';
import { Donor, Donation, RecurringDonation, PaymentStatus } from '@/lib/types';
import { PageHeader } from '@/components/layout/PageHeader';
import { PageSkeleton } from '@/components/Skeletons';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
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

const formatCurrency = (amount: number | string, currency: string = 'USD') => {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
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

export default function DonorDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [donor, setDonor] = useState<Donor | null>(null);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [recurringDonations, setRecurringDonations] = useState<RecurringDonation[]>([]);
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState<any[]>([]);

  const CHART_COLORS = ['#4c9789', '#eacfa2', '#6fb3a6', '#3a7369', '#d4a5a5', '#9b8c7c'];

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch donor profile, donations, and recurring donations in parallel
      const [profileData, donationsData, recurringData] = await Promise.all([
        donorService.getProfile(),
        donationService.getMyDonations(),
        donationService.getMyRecurring()
      ]);

      setDonor(profileData);

      // Handle API response structure
      const donationsList = (donationsData as any).data?.data || donationsData;
      const recurringList = (recurringData as any).data?.data || recurringData;

      setDonations(Array.isArray(donationsList) ? donationsList : []);
      setRecurringDonations(Array.isArray(recurringList) ? recurringList : []);

      // Prepare chart data for monthly giving
      prepareChartData(Array.isArray(donationsList) ? donationsList : []);
    } catch (error) {
      console.error("Failed to load donor dashboard data", error);
    } finally {
      setLoading(false);
    }
  };

  const prepareChartData = (donationsList: Donation[]) => {
    // Get last 6 months of completed donations
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

    setChartData(Object.entries(months).map(([month, amount]) => ({ month, amount })));
  };

  // Calculate statistics
  const completedDonations = donations.filter(d => d.paymentStatus === PaymentStatus.COMPLETED);
  const totalDonated = completedDonations.reduce((sum, d) => sum + Number(d.amount), 0);
  const totalDonations = donations.length;
  const activeRecurring = recurringDonations.filter(r => r.status === 'active').length;
  
  // Get most recent donations
  const recentDonations = [...donations]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  // Get next scheduled donation
  const nextDonation = recurringDonations
    .filter(r => r.status === 'active')
    .sort((a, b) => new Date(a.nextChargeDate).getTime() - new Date(b.nextChargeDate).getTime())[0];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50/30 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-teal-600 mx-auto mb-4" />
          <p className="text-slate-500">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!donor) {
    return (
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeInUp}
        className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50/30 flex items-center justify-center"
      >
        <Card className="max-w-md text-center p-8">
          <Heart className="w-16 h-16 text-teal-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Welcome to LCEO</h2>
          <p className="text-slate-600 mb-6">Please complete your donor profile to start making an impact.</p>
          <Button 
            onClick={() => navigate('/donor/complete-profile')}
            className="bg-teal-600 hover:bg-teal-700 text-white"
          >
            Complete Profile
          </Button>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={staggerContainer}
      className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50/30"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 space-y-6 sm:space-y-8">

        {/* Header */}
        <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 tracking-tight">
              Welcome back, {donor.fullName?.split(' ')[0] || 'Donor'}!
            </h1>
            <p className="text-sm sm:text-base text-slate-500 flex items-center gap-2 mt-1">
              <Heart className="w-4 h-4" />
              <span>Thank you for your continued support</span>
            </p>
          </div>

          <Button
            className="bg-teal-600 hover:bg-teal-700 text-white"
            onClick={() => navigate('/donor/donations')}
          >
            <Heart className="w-4 h-4 mr-2" />
            Make a New Donation
          </Button>
        </motion.div>

        {/* Impact Overview Stats */}
        <motion.div variants={fadeInUp} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-teal-600 to-teal-700 text-white border-none">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-teal-100">Total Contributions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl sm:text-3xl font-bold">
                {formatCurrency(totalDonated)}
              </div>
              <p className="text-xs text-teal-200 mt-1">
                Since {donor.createdAt ? formatDate(donor.createdAt) : 'joining'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">Lives Impacted</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl sm:text-3xl font-bold text-teal-600">
                {donor.impactScore || Math.floor(totalDonated / 100) || 0}
              </div>
              <p className="text-xs text-slate-400 mt-1">Beneficiaries supported</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">Total Donations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl sm:text-3xl font-bold text-blue-600">
                {totalDonations}
              </div>
              <p className="text-xs text-slate-400 mt-1">Individual contributions</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">Next Scheduled</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl sm:text-3xl font-bold text-purple-600">
                {nextDonation ? formatCurrency(nextDonation.amount, nextDonation.currency) : '--'}
              </div>
              <p className="text-xs text-slate-400 mt-1">
                {nextDonation ? `Next: ${formatDate(nextDonation.nextChargeDate)}` : 'No recurring donations'}
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Charts Section */}
        <motion.div variants={fadeInUp} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Giving History Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Giving History</CardTitle>
              <CardDescription>Your contributions over the last 6 months</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={chartData}>
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
                  <Bar dataKey="amount" fill="#4c9789" name="Amount" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Recurring vs One-Time */}
          <Card>
            <CardHeader>
              <CardTitle>Donation Breakdown</CardTitle>
              <CardDescription>One-time vs recurring contributions</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={[
                      { name: 'One-Time', value: completedDonations.filter(d => d.donationType === 'one_time').length, color: '#4c9789' },
                      { name: 'Recurring', value: activeRecurring, color: '#eacfa2' }
                    ]}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={80}
                    dataKey="value"
                  >
                    <Cell fill="#4c9789" />
                    <Cell fill="#eacfa2" />
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Donations */}
          <motion.div variants={fadeInUp}>
            <Card className="h-full">
              <CardHeader>
                <CardTitle>Recent Donations</CardTitle>
                <CardDescription>Your latest contributions</CardDescription>
              </CardHeader>
              <CardContent>
                {recentDonations.length > 0 ? (
                  <>
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
                        {recentDonations.map(donation => {
                          const statusConfig = getPaymentStatusConfig(donation.paymentStatus);
                          const StatusIcon = statusConfig.icon;

                          return (
                            <TableRow key={donation.id} className="hover:bg-slate-50">
                              <TableCell className="font-medium">
                                {formatDate(donation.createdAt)}
                              </TableCell>
                              <TableCell>
                                {donation.program?.name.en || 'General Fund'}
                              </TableCell>
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
                                  onClick={() => navigate(`/donor/donations`)}
                                >
                                  <FileText className="w-4 h-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                    <Button 
                      variant="link" 
                      className="w-full mt-4 text-teal-600 hover:text-teal-700"
                      onClick={() => navigate('/donor/donations')}
                    >
                      View All Transactions <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </>
                ) : (
                  <div className="text-center py-8">
                    <Heart className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-500 mb-4">No donations yet</p>
                    <Button 
                      variant="outline"
                      onClick={() => navigate('/donor/donations')}
                    >
                      Make Your First Donation
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Active Recurring Donations */}
          <motion.div variants={fadeInUp}>
            <Card className="h-full">
              <CardHeader>
                <CardTitle>Active Recurring Donations</CardTitle>
                <CardDescription>Your ongoing monthly support</CardDescription>
              </CardHeader>
              <CardContent>
                {recurringDonations.filter(r => r.status === 'active').length > 0 ? (
                  <div className="space-y-4">
                    {recurringDonations
                      .filter(r => r.status === 'active')
                      .slice(0, 3)
                      .map(recurring => (
                        <div key={recurring.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h4 className="font-semibold">
                                {formatCurrency(recurring.amount, recurring.currency)} / {recurring.frequency}
                              </h4>
                              <p className="text-sm text-slate-500">
                                {recurring.program?.name.en || 'General Fund'}
                              </p>
                            </div>
                            <Badge className="bg-green-100 text-green-700">Active</Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-slate-500">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              <span>Next: {formatDate(recurring.nextChargeDate)}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <TrendingUp className="w-4 h-4" />
                              <span>{recurring.totalCharges} charges</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    
                    {recurringDonations.filter(r => r.status === 'active').length > 3 && (
                      <Button 
                        variant="link" 
                        className="w-full mt-2 text-teal-600 hover:text-teal-700"
                        onClick={() => navigate('/donor/donations')}
                      >
                        View All Recurring <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Clock className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-500 mb-4">No recurring donations yet</p>
                    <Button 
                      variant="outline"
                      onClick={() => navigate('/donor/donations')}
                    >
                      Set Up Monthly Giving
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Donor Recognition */}
        <motion.div variants={fadeInUp}>
          <Card className="bg-gradient-to-r from-amber-50 to-teal-50 border-none">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="bg-teal-600 p-3 rounded-full">
                    <Heart className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Thank You for Your Support!</h3>
                    <p className="text-sm text-gray-600">
                      Your generosity has helped transform {donor.impactScore || Math.floor(totalDonated / 100) || 0} lives.
                      {totalDonations >= 5 && " You're a Champion Donor! 🏆"}
                    </p>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  className="border-teal-600 text-teal-600 hover:bg-teal-50"
                  onClick={() => navigate('/impact-stories')}
                >
                  Read Impact Stories
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}