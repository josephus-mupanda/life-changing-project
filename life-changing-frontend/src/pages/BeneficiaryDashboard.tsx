import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Calendar, CheckCircle2, DollarSign, TrendingUp, AlertCircle, Loader2, ArrowRight } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useAuth } from '@/lib/auth-context';
import { useNavigate } from 'react-router-dom';
import { beneficiaryService } from '@/services/beneficiary.service';
import { Beneficiary } from '@/lib/types';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { toast } from 'sonner';
import { PageHeader } from '@/components/layout/PageHeader';
import { PageSkeleton } from '@/components/Skeletons';

export default function BeneficiaryDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [beneficiary, setBeneficiary] = useState<Beneficiary | null>(null);
  const [profileStatus, setProfileStatus] = useState<any>(null);
  const [attendanceStats, setAttendanceStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profile, status, stats] = await Promise.all([
          beneficiaryService.getProfile(),
          beneficiaryService.getProfileStatus(),
          beneficiaryService.getAttendanceStats()
        ]);
        setBeneficiary(profile);
        setProfileStatus(status);
        setAttendanceStats(stats);
      } catch (error) {
        console.error("Failed to load dashboard data", error);
        toast.error("Failed to load dashboard data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchData();
    }
  }, [user]);

  if (loading) {
    return (
      <div className="p-4">
        <PageSkeleton />
      </div>
    );
  }

  if (!beneficiary) {
    return (
      <div className="flex flex-col items-center justify-center p-10 text-center space-y-4">
        <h2 className="text-2xl font-bold">Welcome to LCEO</h2>
        <p className="text-muted-foreground">Please complete your profile to access the dashboard.</p>
        <Button onClick={() => navigate('/profile')}>Create Profile</Button>
      </div>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  // Mock chart data if real stats are empty (adapt based on real API response structure)
  const chartData = attendanceStats?.monthlyAttendance || [
    { name: 'Week 1', attendance: 100 },
    { name: 'Week 2', attendance: 80 },
    { name: 'Week 3', attendance: 100 },
    { name: 'Week 4', attendance: 90 },
  ];

  return (
    <motion.div
      className="space-y-8 p-1"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <PageHeader
        title="Dashboard"
        description={`Welcome back, ${beneficiary.fullName?.split(' ')[0] || 'Beneficiary'}!`}
        actions={
          <Button
            className="bg-teal-600 hover:bg-teal-700 text-white shadow-md hover:shadow-lg transition-all"
            onClick={() => navigate('/beneficiary/tracking/add')}
          >
            <TrendingUp className="mr-2 h-4 w-4" />
            Log Weekly Progress
          </Button>
        }
      />

      {/* Profile Completion Alert */}
      {!profileStatus?.isComplete && (
        <motion.div variants={itemVariants}>
          <Alert className="bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800">
            <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-500" />
            <AlertTitle className="text-amber-800 dark:text-amber-400 font-semibold">Profile Incomplete</AlertTitle>
            <AlertDescription className="text-amber-700 dark:text-amber-300 flex justify-between items-center">
              <span>Your profile is {profileStatus?.completionPercentage}% complete. Complete it to unlock all features.</span>
              <Button variant="link" size="sm" className="text-amber-800 dark:text-amber-400 underline" onClick={() => navigate('/profile')}>
                Complete Now
              </Button>
            </AlertDescription>
          </Alert>
        </motion.div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div variants={itemVariants}>
          <Card className="hover:shadow-md transition-shadow border-slate-200 dark:border-slate-800">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">Current Capital</CardTitle>
              <DollarSign className="h-4 w-4 text-teal-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900 dark:text-white">
                {beneficiary.currentCapital?.toLocaleString()} <span className="text-xs font-normal text-slate-500">RWF</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Started: {beneficiary.startCapital?.toLocaleString()} RWF
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="hover:shadow-md transition-shadow border-slate-200 dark:border-slate-800">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">Profile Status</CardTitle>
              <CheckCircle2 className={`h-4 w-4 ${profileStatus?.isComplete ? 'text-teal-600' : 'text-amber-500'}`} />
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-end mb-2">
                <div className="text-2xl font-bold text-slate-900 dark:text-white">{profileStatus?.completionPercentage}%</div>
                <span className="text-xs text-slate-500">{profileStatus?.isComplete ? 'Complete' : 'In Progress'}</span>
              </div>
              <Progress value={profileStatus?.completionPercentage} className="h-2" />
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="hover:shadow-md transition-shadow border-slate-200 dark:border-slate-800">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">Attendance Rate</CardTitle>
              <Calendar className="h-4 w-4 text-teal-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900 dark:text-white">
                {attendanceStats?.averageAttendance || 0}%
              </div>
              <p className="text-xs text-slate-500 mt-1">Last 4 weeks</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="hover:shadow-md transition-shadow border-slate-200 dark:border-slate-800">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">Next Tracking</CardTitle>
              <TrendingUp className="h-4 w-4 text-teal-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900 dark:text-white">
                {beneficiary.nextTrackingDate ? new Date(beneficiary.nextTrackingDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'N/A'}
              </div>
              <p className="text-xs text-slate-500 mt-1 capitalize">{beneficiary.trackingFrequency} check-in</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Attendance Chart */}
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <Card className="h-full border-slate-200 dark:border-slate-800">
            <CardHeader>
              <CardTitle>Attendance History</CardTitle>
              <CardDescription>Your participation in program activities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorAttendance" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0d9488" stopOpacity={0.1} />
                        <stop offset="95%" stopColor="#0d9488" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8' }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8' }} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      cursor={{ stroke: '#0d9488', strokeWidth: 1 }}
                    />
                    <Area type="monotone" dataKey="attendance" stroke="#0d9488" strokeWidth={3} fillOpacity={1} fill="url(#colorAttendance)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Business Details */}
        <motion.div variants={itemVariants} className="lg:col-span-1">
          <Card className="h-full border-slate-200 dark:border-slate-800">
            <CardHeader>
              <CardTitle>My Business</CardTitle>
              <CardDescription>Program details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-1">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Business Type</span>
                <p className="font-medium text-slate-900 dark:text-white text-lg">{beneficiary.businessType}</p>
              </div>
              <div className="space-y-1">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Program</span>
                <p className="font-medium text-slate-900 dark:text-white">{beneficiary.program?.name?.en || 'Not Assigned'}</p>
              </div>
              <div className="space-y-1">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Location</span>
                <p className="font-medium text-slate-900 dark:text-white">{beneficiary.location?.sector}, {beneficiary.location?.district}</p>
              </div>
              <div className="pt-4">
                <Button variant="outline" className="w-full" onClick={() => navigate('/beneficiary/goals')}>
                  View Goals <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}