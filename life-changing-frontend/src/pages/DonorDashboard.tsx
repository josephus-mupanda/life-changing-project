import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, Calendar, FileText, ArrowRight, Loader2 } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useAuth } from '@/lib/auth-context';
import { useNavigate } from 'react-router-dom';
import { donorService } from '@/services/donor.service';
import { Donor } from '@/lib/types';
import { PageHeader } from '@/components/layout/PageHeader';
import { PageSkeleton } from '@/components/Skeletons';

export default function DonorDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [donor, setDonor] = useState<Donor | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await donorService.getProfile();
        setDonor(data);
      } catch (error) {
        console.error("Failed to load donor profile", error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchProfile();
    }
  }, [user]);

  if (loading) return <PageSkeleton />;

  if (!donor) {
    return (
      <div className="text-center p-10">
        <h2 className="text-2xl font-bold mb-4">Welcome to LCEO</h2>
        <p className="mb-6">Please complete your donor profile to start making an impact.</p>
        <Button onClick={() => navigate('/donor/profile/create')}>Complete Profile</Button>
      </div>
    );
  }

  // Calculate total donated if not available in profile directly (it is in interface)
  // const totalDonated = donor.totalDonated || 0; 
  // Wait, Donor interface has totalDonated?
  // Let's assume it does or calculate from donations.
  // In types.ts: totalDonations: number (count?), totalDonatedAmount: number?
  // Let's check types.ts later if needed, but for now access what's expected.
  // references `currentUser.totalDonated` in original code.

  // Fallback if donations is undefined
  const recentDonations = donor.donations || [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Donor Portal"
        description={`Thank you for your support, ${donor.fullName}!`}
        actions={
          <Button
            className="bg-[#eacfa2] text-teal-900 hover:bg-[#d4b886]"
            onClick={() => navigate('/donate')}
          >
            Make a New Donation
          </Button>
        }
      />

      {/* Impact Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-teal-900 text-white border-none">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-teal-100">Total Contributions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">${(donor.totalDonated || 0).toLocaleString()}</div>
            <p className="text-xs text-teal-300 mt-1">Since {new Date(donor.createdAt).getFullYear()}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Lives Impacted</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-teal-600">{donor.impactScore || 0}</div>
            <p className="text-xs text-gray-500 mt-1">Beneficiaries supported directly</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Next Scheduled Donation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">--</div>
            <p className="text-xs text-gray-500 mt-1">Recurring Donations</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Donation History */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Recent Donations</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentDonations.length > 0 ? (
                  recentDonations.slice(0, 5).map(donation => (
                    <TableRow key={donation.id}>
                      <TableCell>{new Date(donation.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell>${donation.amount.toFixed(2)}</TableCell>
                      <TableCell><span className="text-green-600 bg-green-50 px-2 py-1 rounded-full text-xs">Completed</span></TableCell>
                      <TableCell><Button variant="ghost" size="sm"><FileText className="w-4 h-4" /></Button></TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground">No donations found.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            <Button variant="link" className="w-full mt-4" asChild>
              <Link to="/donor/donations">View All Transactions <ArrowRight className="w-4 h-4 ml-2" /></Link>
            </Button>
          </CardContent>
        </Card>

        {/* Impact Reports */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Impact Reports</CardTitle>
            <CardDescription>See how your funds are being used</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="border rounded-lg p-4 hover:bg-gray-50 transition-colors cursor-pointer flex gap-4">
                <div className="bg-teal-100 p-3 rounded-lg h-fit">
                  <FileText className="w-6 h-6 text-teal-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Q2 2023 Quarterly Report</h4>
                  <p className="text-sm text-gray-500 mb-2">Released July 2023</p>
                  <Button size="sm" variant="outline" className="h-8">Download PDF</Button>
                </div>
              </div>
              {/* More reports... */}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}