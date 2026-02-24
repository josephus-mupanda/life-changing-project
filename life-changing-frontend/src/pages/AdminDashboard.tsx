import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, Heart, FolderKanban, TrendingUp, Award, DollarSign } from 'lucide-react';
import { StatsCard } from '../components/StatsCard';
import { PageHeader } from '../components/layout/PageHeader';
import { PageSkeleton } from '../components/Skeletons';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { beneficiaryService } from '@/services/beneficiary.service';
import { donorService } from '@/services/donor.service';
import { donationService } from '@/services/donation.service';
import { programsService } from '@/services/programs.service';
import { Beneficiary, Donor, Program, ProgramCategory, ProgramStatus, BeneficiaryStatus } from '../lib/types';
import { format } from 'date-fns';

// Define types for API responses
interface BeneficiaryStats {
  totalBeneficiaries: number;
  byStatus: Array<{ status: string; count: string }>;
  byProgram: Array<{ name: { en: string }; count: string }>;
  totalCapital: number;
}

interface DonorStats {
  totalDonors: number;
  totalDonated: number;
  recurringDonors: number;
  byCountry: Array<{ country: string; count: string; total: string }>;
}

interface DonationStats {
  totalDonations: number;
  totalAmount: number;
  recurringDonations: number;
  byMonth: Array<{ month: string; count: number; amount: number }>;
  averageDonation: {
    oneTime: number;
    recurring: number;
    overall: number;
  };
}

export function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalBeneficiaries: 0,
    activeBeneficiaries: 0,
    graduatedBeneficiaries: 0,
    totalDonors: 0,
    totalDonations: 0,
    recurringDonors: 0,
    activePrograms: 0,
    totalPrograms: 0,
    monthlyTrends: [] as Array<{ month: string; beneficiaries: number; donations: number }>,
    programDistribution: [] as Array<{ name: string; value: number; color: string }>,
    averageDonation: 0,
  });

  const [recentBeneficiaries, setRecentBeneficiaries] = useState<Beneficiary[]>([]);
  const [recentDonors, setRecentDonors] = useState<Donor[]>([]);
  const [activeProgramsList, setActiveProgramsList] = useState<Program[]>([]);

  // Chart colors
  const CHART_COLORS = ['#4c9789', '#eacfa2', '#6fb3a6', '#3a7369', '#d4a5a5', '#9b8c7c'];

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch all data in parallel using existing services
        const [
          beneficiaryStatsRes,
          donorStatsRes,
          donationStatsRes,
          programsRes,
          beneficiariesListRes,
          donorsListRes
        ] = await Promise.all([
          beneficiaryService.getStats(),      // /beneficiaries/stats
          donorService.getStats(),            // /donors/stats
          donationService.getStats(),          // /donations/stats
          programsService.getAdminList(1, 100),
          beneficiaryService.getAllBeneficiaries(1, 5),
          donorService.searchDonors('')        // Get recent donors (empty search returns all)
        ]);

        // Helper to extract data (handle different response structures)
        const extractData = (res: any) => {
          if (res?.data?.data) return res.data.data;
          if (res?.data) return res.data;
          return res;
        };

        // Process beneficiary stats
        const beneficiaryStats = extractData(beneficiaryStatsRes) as BeneficiaryStats;
        const activeCount = beneficiaryStats.byStatus?.find(s => s.status === 'active')?.count || '0';
        const graduatedCount = beneficiaryStats.byStatus?.find(s => s.status === 'graduated')?.count || '0';

        // Process donor stats
        const donorStats = extractData(donorStatsRes) as DonorStats;

        // Process donation stats
        const donationStats = extractData(donationStatsRes) as DonationStats;

        // Process programs
        const programsData = extractData(programsRes) as Program[];
        const activePrograms = programsData.filter((p: Program) => p.status === ProgramStatus.ACTIVE);

        // Build program distribution from real data
        const programDistribution = buildProgramDistribution(programsData);

        // Build monthly trends from donation stats
        const monthlyTrends = buildMonthlyTrends(donationStats.byMonth || []);

        setStats({
          totalBeneficiaries: beneficiaryStats.totalBeneficiaries || 0,
          activeBeneficiaries: Number(activeCount),
          graduatedBeneficiaries: Number(graduatedCount),
          totalDonors: donorStats.totalDonors || 0,
          totalDonations: donationStats.totalAmount || 0,
          recurringDonors: donorStats.recurringDonors || 0,
          activePrograms: activePrograms.length,
          totalPrograms: programsData.length,
          monthlyTrends,
          programDistribution,
          averageDonation: donationStats.averageDonation?.overall || 0,
        });

        // Process recent data
        const beneficiariesData = extractData(beneficiariesListRes);
        const donorsData = extractData(donorsListRes);

        setRecentBeneficiaries(Array.isArray(beneficiariesData) ? beneficiariesData.slice(0, 5) : []);
        setRecentDonors(Array.isArray(donorsData) ? donorsData.slice(0, 5) : []);
        setActiveProgramsList(activePrograms.slice(0, 5));

      } catch (error) {
        console.error("Failed to fetch dashboard data", error);
        // Fallback to empty data
        setStats({
          totalBeneficiaries: 0,
          activeBeneficiaries: 0,
          graduatedBeneficiaries: 0,
          totalDonors: 0,
          totalDonations: 0,
          recurringDonors: 0,
          activePrograms: 0,
          totalPrograms: 0,
          monthlyTrends: [],
          programDistribution: [],
          averageDonation: 0,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Helper function to build program distribution
  const buildProgramDistribution = (programs: Program[]) => {
    const categoryCount: Record<string, number> = {};

    programs.forEach(program => {
      const category = program.category || 'Other';
      categoryCount[category] = (categoryCount[category] || 0) +
        (program.beneficiaries?.length || 0);
    });

    return Object.entries(categoryCount).map(([name, value], index) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1).replace(/_/g, ' '),
      value,
      color: CHART_COLORS[index % CHART_COLORS.length]
    }));
  };

  // Helper function to build monthly trends
  const buildMonthlyTrends = (donationByMonth: Array<{ month: string; amount: number }>) => {
    // Get last 6 months
    const months = [];
    const now = new Date();

    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthStr = format(date, 'MMM');

      // Find donation data for this month
      const donationData = donationByMonth.find(d => {
        const dDate = new Date(d.month);
        return dDate.getMonth() === date.getMonth() &&
          dDate.getFullYear() === date.getFullYear();
      });

      months.push({
        month: monthStr,
        beneficiaries: Math.floor(Math.random() * 30) + 10, // TODO: Replace with real tracking data when available
        donations: donationData?.amount || 0
      });
    }

    return months;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (date: Date | string) => {
    if (!date) return 'N/A';
    try {
      return format(new Date(date), 'MMM d, yyyy');
    } catch (e) {
      return 'Invalid Date';
    }
  };

  const getCategoryBadge = (category: ProgramCategory) => {
    const variants: Record<string, string> = {
      [ProgramCategory.EDUCATION]: 'bg-blue-100 text-blue-700',
      [ProgramCategory.ENTREPRENEURSHIP]: 'bg-green-100 text-green-700',
      [ProgramCategory.HEALTH]: 'bg-pink-100 text-pink-700',
      [ProgramCategory.CROSS_CUTTING]: 'bg-purple-100 text-purple-700',
    };
    return variants[category] || 'bg-gray-100 text-gray-700';
  };

  if (loading) return <PageSkeleton />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard Overview"
        description="Welcome back! Here's what's happening with LCEO today."
        className="pt-4 md:pt-8"
      />

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <StatsCard
          title="Total Beneficiaries"
          value={stats.totalBeneficiaries}
          icon={Users}
          description={`${stats.activeBeneficiaries} active, ${stats.graduatedBeneficiaries} graduated`}
        />

        <StatsCard
          title="Active Programs"
          value={stats.activePrograms}
          icon={FolderKanban}
          description={`${stats.totalPrograms} total programs`}
        />

        <StatsCard
          title="Total Donations"
          value={formatCurrency(stats.totalDonations)}
          icon={DollarSign}
          description={`From ${stats.totalDonors} donors (${stats.recurringDonors} recurring)`}
        />

        <StatsCard
          title="Graduated"
          value={stats.graduatedBeneficiaries}
          icon={Award}
          description="Successfully completed programs"
        />

        <StatsCard
          title="Active Donors"
          value={stats.totalDonors}
          icon={Heart}
          description={`${stats.recurringDonors} give monthly`}
        />

        <StatsCard
          title="Average Donation"
          value={formatCurrency(stats.averageDonation)}
          icon={TrendingUp}
          description="Per donation"
        />
      </div>

      {/* Charts Section */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Monthly Trends */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Trends</CardTitle>
            <CardDescription>Donations over time (beneficiary data coming soon)</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={stats.monthlyTrends}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis dataKey="month" stroke="#666" />
                <YAxis yAxisId="right" orientation="right" stroke="#eacfa2" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e0e0e0',
                    borderRadius: '8px',
                  }}
                />
                <Legend />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="donations"
                  stroke="#eacfa2"
                  strokeWidth={2}
                  name="Donations ($)"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Program Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Program Distribution</CardTitle>
            <CardDescription>Beneficiaries by program category</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={stats.programDistribution.length ? stats.programDistribution : [{ name: 'No Data', value: 1, color: '#ccc' }]}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }: { name: string; value: number }) =>
                    value > 0 ? `${name}: ${value}` : ''
                  }
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {stats.programDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity Section */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Donors */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Donors</CardTitle>
              <CardDescription>Latest registered donors</CardDescription>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link to="/admin/donors">View All</Link>
            </Button>
          </CardHeader>
          <CardContent className="p-0 sm:p-6 sm:pt-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Country</TableHead>
                    <TableHead className="text-right">Total Donated</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentDonors.length > 0 ? (
                    recentDonors.slice(0, 5).map((donor) => (
                      <TableRow key={donor.id}>
                        <TableCell className="text-sm">
                          {donor.anonymityPreference
                            ? 'Anonymous'
                            : donor.user?.fullName || 'Unknown'}
                        </TableCell>
                        <TableCell className="text-sm">
                          {donor.country || 'N/A'}
                        </TableCell>
                        <TableCell className="text-sm text-right font-medium">
                          {formatCurrency(Number(donor.totalDonated) || 0)}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center text-muted-foreground">
                        No recent donors.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Active Programs */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Active Programs</CardTitle>
              <CardDescription>Current program status</CardDescription>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link to="/admin/programs">Manage</Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activeProgramsList.length > 0 ? (
                activeProgramsList.map((program) => (
                  <div
                    key={program.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-sm">{program.name?.en || 'Unnamed'}</h4>
                        <Badge className={getCategoryBadge(program.category)} variant="secondary">
                          {program.category?.replace(/_/g, ' ') || 'Other'}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Budget: {formatCurrency(Number(program.budget) || 0)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Beneficiaries: {program.beneficiaries?.length || 0}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-muted-foreground py-4">
                  No active programs found.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Beneficiaries */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Recent Beneficiaries</CardTitle>
            <CardDescription>Newly enrolled beneficiaries</CardDescription>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link to="/admin/beneficiaries">View All</Link>
          </Button>
        </CardHeader>
        <CardContent className="p-0 sm:p-6 sm:pt-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Program</TableHead>
                  <TableHead>Enrollment Date</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentBeneficiaries.length > 0 ? (
                  recentBeneficiaries.slice(0, 5).map((beneficiary) => (
                    <TableRow key={beneficiary.id}>
                      <TableCell className="font-medium whitespace-nowrap">
                        {beneficiary.user?.fullName || 'Unknown'}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {beneficiary.location?.sector || 'N/A'}, {beneficiary.location?.district || 'N/A'}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {beneficiary.program?.name?.en || 'Unassigned'}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {formatDate(beneficiary.enrollmentDate)}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={beneficiary.status === BeneficiaryStatus.ACTIVE ? 'default' : 'secondary'}
                          className={beneficiary.status === BeneficiaryStatus.ACTIVE ? 'bg-primary' : ''}
                        >
                          {beneficiary.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground">
                      No recent beneficiaries.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}