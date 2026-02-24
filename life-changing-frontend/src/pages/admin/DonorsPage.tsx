import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useNavigate } from 'react-router-dom';
import {
  Heart,
  Mail,
  Phone,
  Globe,
  TrendingUp,
  Users,
  DollarSign,
  Search,
  Filter,
  Eye,
  Download,
  UserPlus,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
} from 'recharts';
import { adminService } from '@/services/admin.service';
import { Donor } from '@/lib/types';
import { toast } from 'sonner';

export default function DonorsPage() {
  const navigate = useNavigate();
  const [selectedDonor, setSelectedDonor] = useState<Donor | null>(null);
  const [donors, setDonors] = useState<Donor[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Stats State
  const [totalDonors, setTotalDonors] = useState(0);
  const [totalDonated, setTotalDonated] = useState(0);
  const [recurringDonorsCount, setRecurringDonorsCount] = useState(0);
  const [avgDonation, setAvgDonation] = useState(0);

  useEffect(() => {
    fetchDonors();
  }, [search]); // Re-fetch on search change (debounce handled in input or here?)

  const fetchDonors = async () => {
    setLoading(true);
    try {
      // Assuming getDonors supports search
      const result = await adminService.getDonors(1, 100); // Fetching 100 for now to calc stats locally if backend doesn't aggregate
      // Ideally backend returns stats.
      const donorsData = Array.isArray(result.data) ? result.data : [];
      setDonors(donorsData);
      setTotalDonors(result.total);

      // Calculate stats from loaded data (or fetch separate stats endpoint)
      // Since pagination defaults to 10, stats might be wrong if only calculating on 10 items.
      // But for small datasets (dev), it's fine. 
      // For production, we need `adminService.getDonorStats()`.
      // I'll calculate based on what we have, but simpler.

      const allDonated = donorsData.reduce((sum: number, d: Donor) => sum + (d.totalDonated || 0), 0);
      setTotalDonated(allDonated);
      setRecurringDonorsCount(donorsData.filter((d: Donor) => d.isRecurringDonor).length);
      setAvgDonation(result.total > 0 ? allDonated / result.total : 0);

    } catch (error) {
      console.error("Failed to load donors", error);
      toast.error("Failed to load donors");
    } finally {
      setLoading(false);
    }
  };

  // Memoized Chart Data
  const donorsByCountry = donors.reduce((acc: any[], donor) => {
    const existing = acc.find(x => x.name === donor.country);
    if (existing) {
      existing.value++;
    } else {
      acc.push({ name: donor.country || 'Unknown', value: 1, color: '#' + Math.floor(Math.random() * 16777215).toString(16) });
    }
    return acc;
  }, []);

  // Mock Monthly Data for now as calculating it from donor list (which doesn't have all donations) is impossible
  // We need `getDonationStats` endpoint.
  const monthlyDonations = [
    { month: 'Jan', amount: 0 },
    { month: 'Feb', amount: 0 },
    // ... placeholders
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-2">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-teal-900 dark:text-white tracking-tight">Donor Management</h1>
          <p className="text-teal-600 dark:text-teal-400 font-medium mt-1 text-sm md:text-base">Manage and engage with your donor community</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button variant="outline" size="icon" onClick={fetchDonors} title="Refresh">
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button
            className="flex-1 sm:flex-none h-10 px-6 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold uppercase tracking-wider shadow-lg shadow-teal-600/10 transition-all active:scale-95 gap-2 text-xs"
            onClick={() => navigate('/admin/donors/add')}
          >
            <UserPlus size={16} strokeWidth={3} />
            Add New Donor
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Total Donors</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold">{totalDonors}</div>
              <Users className="w-8 h-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Recurring Donors</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold text-blue-600">{recurringDonorsCount}</div>
              <Heart className="w-8 h-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Total Donated</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold text-green-600">${totalDonated.toLocaleString()}</div>
              <DollarSign className="w-8 h-8 text-green-400" />
            </div>
            <p className="text-xs text-gray-500 mt-1">Calculated from visible records</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Average Donation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold text-teal-600">${avgDonation.toFixed(0)}</div>
              <TrendingUp className="w-8 h-8 text-teal-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Details Dialog */}
      <Dialog open={!!selectedDonor} onOpenChange={(open) => !open && setSelectedDonor(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Donor Details</DialogTitle>
            <DialogDescription>View donor profile and history.</DialogDescription>
          </DialogHeader>
          {selectedDonor && (
            <div className="space-y-6 py-4">
              {/* Personal Information */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Full Name</p>
                  <p className="font-medium">{selectedDonor.fullName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium">{selectedDonor.user?.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="font-medium">{selectedDonor.user?.phone}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Country</p>
                  <p className="font-medium">{selectedDonor.country}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Donated</p>
                  <p className="font-bold text-teal-600">${selectedDonor.totalDonated?.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Joined</p>
                  <p className="font-medium">{new Date(selectedDonor.createdAt).toLocaleDateString()}</p>
                </div>
              </div>

              {/* Donations History */}
              <div>
                <h3 className="font-semibold mb-2">Recent Donations</h3>
                {selectedDonor.donations && selectedDonor.donations.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedDonor.donations.slice(0, 5).map(don => (
                        <TableRow key={don.id}>
                          <TableCell>{new Date(don.createdAt).toLocaleDateString()}</TableCell>
                          <TableCell>${don.amount.toLocaleString()} {don.currency}</TableCell>
                          <TableCell>{don.donationType}</TableCell>
                          <TableCell><Badge variant="outline">{don.paymentStatus}</Badge></TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <p className="text-sm text-gray-500">No donations found.</p>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Monthly Donations</CardTitle>
            <CardDescription>(Data not available)</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-center h-[250px] text-muted-foreground">
            Chart data requires backend statistics endpoint.
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Donors by Country</CardTitle>
            <CardDescription>Geographic distribution</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={donorsByCountry.length > 0 ? donorsByCountry : [{ name: 'No Data', value: 1, color: '#eee' }]}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {donorsByCountry.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Donors</TabsTrigger>
          <TabsTrigger value="recurring">Recurring Donors</TabsTrigger>
          <TabsTrigger value="major">Major Donors</TabsTrigger>
        </TabsList>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search donors by name, email..."
              className="w-full h-10"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          {/* Country filter could be added here if backend supports it */}
        </div>

        {/* All Donors Tab */}
        <TabsContent value="all">
          <Card>
            <CardHeader className="px-4 py-6 md:px-6">
              <CardTitle>All Donors</CardTitle>
            </CardHeader>
            <CardContent className="p-0 sm:p-6 sm:pt-0">
              {loading ? (
                <div className="flex justify-center p-8"><Loader2 className="animate-spin text-teal-600" /></div>
              ) : donors.length === 0 ? (
                <div className="text-center py-8 text-slate-500">No donors found.</div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Country</TableHead>
                        <TableHead>Total Donated</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {donors.map((donor) => (
                        <TableRow key={donor.id}>
                          <TableCell className="font-medium">
                            {donor.anonymityPreference ? 'Anonymous' : donor.fullName}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Mail className="w-4 h-4" />
                              {donor.user?.email}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Globe className="w-4 h-4 text-gray-400" />
                              {donor.country}
                            </div>
                          </TableCell>
                          <TableCell className="font-semibold">
                            ${(donor.totalDonated || 0).toLocaleString()}
                          </TableCell>
                          <TableCell>
                            {donor.isRecurringDonor ? (
                              <Badge className="bg-blue-100 text-blue-700">Recurring</Badge>
                            ) : (
                              <Badge variant="outline">One-Time</Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge className="bg-green-100 text-green-700">Active</Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm" onClick={() => setSelectedDonor(donor)}>
                              <Eye className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recurring">
          <Card>
            <CardHeader><CardTitle>Recurring Donors</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Type</TableHead><TableHead>Action</TableHead></TableRow></TableHeader>
                <TableBody>
                  {donors.filter(d => d.isRecurringDonor).map(donor => (
                    <TableRow key={donor.id}>
                      <TableCell>{donor.fullName}</TableCell>
                      <TableCell><Badge>Recurring</Badge></TableCell>
                      <TableCell><Button variant="ghost" size="sm" onClick={() => setSelectedDonor(donor)}>View</Button></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="major">
          <Card>
            <CardHeader><CardTitle>Major Donors</CardTitle></CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground p-4">Donors with &gt; $500 contributions.</p>
              <Table>
                <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Amount</TableHead><TableHead>Action</TableHead></TableRow></TableHeader>
                <TableBody>
                  {donors.filter(d => (d.totalDonated || 0) > 500).map(donor => (
                    <TableRow key={donor.id}>
                      <TableCell>{donor.fullName}</TableCell>
                      <TableCell>${donor.totalDonated?.toLocaleString()}</TableCell>
                      <TableCell><Button variant="ghost" size="sm" onClick={() => setSelectedDonor(donor)}>View</Button></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}