// pages/donor/ImpactReportsPage.tsx
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Heart,
  Calendar,
  MapPin,
  BookOpen,
  Briefcase,
  Award,
  Loader2
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { donationService } from '@/services/donation.service';
import { programsService } from '@/services/programs.service';
import { storiesService } from '@/services/stories.service';
import { Donation, Program, Story, PaymentStatus } from '@/lib/types';
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
  Cell,
  LineChart,
  Line,
} from 'recharts';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { PageSkeleton } from '@/components/Skeletons';

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

const CHART_COLORS = ['#4c9789', '#eacfa2', '#6fb3a6', '#3a7369', '#d4a5a5', '#9b8c7c'];

const formatCurrency = (amount: number | string) => {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
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

export default function ImpactReportsPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [stories, setStories] = useState<Story[]>([]);
  const [programDistribution, setProgramDistribution] = useState<any[]>([]);
  const [monthlyImpact, setMonthlyImpact] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalDonated: 0,
    totalDonations: 0,
    programsSupported: 0,
    beneficiariesReached: 0,
    storiesPublished: 0
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch real data from your APIs
      const [donationsData, programsData, storiesData] = await Promise.all([
        donationService.getMyDonations(),
        programsService.getPrograms(1, 100),
        storiesService.getStories(1, 100)
      ]);

      // Handle API response structures
      const donationsList = (donationsData as any).data?.data || donationsData;
      const programsList = (programsData as any).data?.data || programsData;
      const storiesList = (storiesData as any).data?.data || storiesData;

      setDonations(Array.isArray(donationsList) ? donationsList : []);
      setPrograms(Array.isArray(programsList) ? programsList : []);
      setStories(Array.isArray(storiesList) ? storiesList : []);

      // Process data for charts
      processImpactData(
        Array.isArray(donationsList) ? donationsList : [],
        Array.isArray(programsList) ? programsList : []
      );
    } catch (error) {
      console.error('Failed to fetch impact data', error);
    } finally {
      setLoading(false);
    }
  };

  const processImpactData = (donationsList: Donation[], programsList: Program[]) => {
    // Calculate statistics
    const completedDonations = donationsList.filter(d => d.paymentStatus === PaymentStatus.COMPLETED);
    const totalDonated = completedDonations.reduce((sum, d) => sum + Number(d.amount), 0);
    
    // Get unique programs supported
    const programIds = new Set(completedDonations.map(d => d.program?.id).filter(Boolean));
    const programsSupported = programIds.size;

    // Estimate beneficiaries (based on program beneficiaries)
    let totalBeneficiaries = 0;
    programsList.forEach(program => {
      if (programIds.has(program.id)) {
        totalBeneficiaries += program.beneficiaries?.length || 0;
      }
    });

    setStats({
      totalDonated,
      totalDonations: completedDonations.length,
      programsSupported,
      beneficiariesReached: totalBeneficiaries,
      storiesPublished: stories.length
    });

    // Program distribution chart
    const programMap: { [key: string]: number } = {};
    completedDonations.forEach(donation => {
      const programName = donation.program?.name.en || 'General Fund';
      programMap[programName] = (programMap[programName] || 0) + Number(donation.amount);
    });

    setProgramDistribution(
      Object.entries(programMap).map(([name, value], index) => ({
        name,
        value,
        color: CHART_COLORS[index % CHART_COLORS.length]
      }))
    );

    // Monthly impact (last 6 months)
    const months: { [key: string]: { donations: number, amount: number } } = {};
    const now = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = format(date, 'MMM yyyy');
      months[monthKey] = { donations: 0, amount: 0 };
    }

    completedDonations.forEach(donation => {
      const date = new Date(donation.createdAt);
      const monthKey = format(date, 'MMM yyyy');
      if (months[monthKey]) {
        months[monthKey].donations += 1;
        months[monthKey].amount += Number(donation.amount);
      }
    });

    setMonthlyImpact(
      Object.entries(months).map(([month, data]) => ({
        month,
        donations: data.donations,
        amount: data.amount
      }))
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50/30 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
      </div>
    );
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={staggerContainer}
      className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50/30"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 space-y-6">

        {/* Header */}
        <motion.div variants={fadeInUp}>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 tracking-tight">
            Your Impact
          </h1>
          <p className="text-sm sm:text-base text-slate-500 flex items-center gap-2 mt-1">
            <Heart className="w-4 h-4" />
            <span>See the real-world difference your contributions are making</span>
          </p>
        </motion.div>

        {/* Impact Summary Cards - Using Real Data */}
        <motion.div variants={fadeInUp} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-teal-600 to-teal-700 text-white border-none">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-teal-100">Total Donated</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl sm:text-3xl font-bold">
                {formatCurrency(stats.totalDonated)}
              </div>
              <p className="text-xs text-teal-200 mt-1">Lifetime contributions</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">Donations Made</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl sm:text-3xl font-bold text-teal-600">
                {stats.totalDonations}
              </div>
              <p className="text-xs text-slate-400 mt-1">Individual contributions</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">Programs Supported</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl sm:text-3xl font-bold text-purple-600">
                {stats.programsSupported}
              </div>
              <p className="text-xs text-slate-400 mt-1">Active programs</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">Beneficiaries Reached</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl sm:text-3xl font-bold text-amber-600">
                {stats.beneficiariesReached}
              </div>
              <p className="text-xs text-slate-400 mt-1">Lives impacted</p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Charts with Real Data */}
        <motion.div variants={fadeInUp} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Donation Distribution</CardTitle>
              <CardDescription>Where your contributions go</CardDescription>
            </CardHeader>
            <CardContent>
              {programDistribution.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={programDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${formatCurrency(value)}`}
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
              ) : (
                <div className="h-[250px] flex items-center justify-center text-slate-400">
                  No donation data available
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Monthly Impact</CardTitle>
              <CardDescription>Your giving over time</CardDescription>
            </CardHeader>
            <CardContent>
              {monthlyImpact.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={monthlyImpact}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                    <XAxis dataKey="month" stroke="#666" />
                    <YAxis yAxisId="left" stroke="#666" />
                    <YAxis yAxisId="right" orientation="right" stroke="#4c9789" />
                    <Tooltip
                      formatter={(value: number, name: string) => 
                        name === 'amount' ? formatCurrency(value) : value
                      }
                      contentStyle={{
                        backgroundColor: '#fff',
                        border: '1px solid #e0e0e0',
                        borderRadius: '8px',
                      }}
                    />
                    <Line 
                      yAxisId="left"
                      type="monotone" 
                      dataKey="donations" 
                      stroke="#eacfa2" 
                      strokeWidth={2}
                      name="Donations"
                    />
                    <Line 
                      yAxisId="right"
                      type="monotone" 
                      dataKey="amount" 
                      stroke="#4c9789" 
                      strokeWidth={2}
                      name="Amount"
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[250px] flex items-center justify-center text-slate-400">
                  No donation history available
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <Tabs defaultValue="stories" className="space-y-4">
          <TabsList>
            <TabsTrigger value="stories">Success Stories</TabsTrigger>
            <TabsTrigger value="programs">Programs You Support</TabsTrigger>
          </TabsList>

          {/* Success Stories Tab - From Your API */}
          <TabsContent value="stories" className="space-y-4">
            {stories.length > 0 ? (
              stories.map((story) => (
                <Card key={story.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        {story.media && story.media.length > 0 && (
                          <img 
                            src={story.media[0].url} 
                            alt={story.title.en}
                            className="w-16 h-16 rounded-lg object-cover"
                          />
                        )}
                        <div>
                          <CardTitle className="text-lg">{story.title.en}</CardTitle>
                          <CardDescription className="mt-1">
                            <div className="flex items-center gap-4 text-sm">
                              <span className="flex items-center gap-1">
                                <Award className="w-4 h-4" />
                                By {story.authorName}
                              </span>
                              <span className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                {story.publishedDate ? formatDate(story.publishedDate) : 'Not published'}
                              </span>
                            </div>
                          </CardDescription>
                        </div>
                      </div>
                      <Badge>{story.isPublished ? 'Published' : 'Draft'}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div 
                        className="text-sm text-slate-600 line-clamp-3"
                        dangerouslySetInnerHTML={{ __html: story.content.en }}
                      />
                      <Button variant="link" className="p-0 h-auto text-teal-600">
                        Read Full Story →
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-500">No success stories available yet</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Programs You Support Tab */}
          <TabsContent value="programs" className="space-y-4">
            {programs.filter(p => 
              donations.some(d => d.program?.id === p.id && d.paymentStatus === PaymentStatus.COMPLETED)
            ).length > 0 ? (
              programs
                .filter(p => donations.some(d => d.program?.id === p.id && d.paymentStatus === PaymentStatus.COMPLETED))
                .map((program) => (
                  <Card key={program.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex items-start gap-4">
                        {program.logo && (
                          <img 
                            src={program.logo} 
                            alt={program.name.en}
                            className="w-16 h-16 rounded-lg object-cover"
                          />
                        )}
                        <div className="flex-1">
                          <CardTitle className="text-lg">{program.name.en}</CardTitle>
                          <CardDescription className="mt-1">
                            {program.category}
                          </CardDescription>
                        </div>
                        <Badge className={program.status === 'active' ? 'bg-green-100 text-green-700' : ''}>
                          {program.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                          <p className="text-xs text-slate-500">Beneficiaries</p>
                          <p className="text-lg font-semibold">{program.beneficiaries?.length || 0}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500">Budget</p>
                          <p className="text-lg font-semibold">{formatCurrency(program.budget)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500">SDG Goals</p>
                          <p className="text-lg font-semibold">{program.sdgAlignment?.length || 0}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <Briefcase className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-500">You haven't supported any programs yet</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        {/* Geographic Impact - From Program Locations */}
        <motion.div variants={fadeInUp}>
          <Card>
            <CardHeader>
              <CardTitle>Geographic Impact</CardTitle>
              <CardDescription>Communities where your support is making a difference</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {programs
                  .filter(p => donations.some(d => d.program?.id === p.id))
                  .flatMap(p => p.beneficiaries || [])
                  .filter((beneficiary, index, self) => 
                    index === self.findIndex(b => b.location?.district === beneficiary.location?.district)
                  )
                  .map((beneficiary, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-5 h-5 text-teal-600" />
                        <div>
                          <p className="font-medium">{beneficiary.location?.district || 'Unknown District'}</p>
                          <p className="text-sm text-slate-500">
                            {beneficiary.location?.sector || 'Various sectors'}
                          </p>
                        </div>
                      </div>
                      <Badge variant="outline">Active</Badge>
                    </div>
                  ))}
                
                {!programs.some(p => p.beneficiaries?.length) && (
                  <div className="text-center py-8 text-slate-400">
                    No geographic data available yet
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}