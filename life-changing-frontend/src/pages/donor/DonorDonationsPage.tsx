import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
  Search
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { mockDonors } from '@/lib/mock-data';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PaymentStatus, DonationType } from '@/lib/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useNavigate } from 'react-router-dom';
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
} from 'recharts';

export default function DonationsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const currentDonor = mockDonors.find(d => d.user.id === user?.id) || mockDonors[0];

  // Create monthly giving data for charts
  const monthlyData = [
    { month: 'Jan', amount: 50 },
    { month: 'Feb', amount: 50 },
    { month: 'Mar', amount: 75 },
    { month: 'Apr', amount: 50 },
    { month: 'May', amount: 100 },
    { month: 'Jun', amount: 100 },
  ];

  const getPaymentStatusBadge = (status: PaymentStatus) => {
    switch (status) {
      case PaymentStatus.COMPLETED:
        return <Badge className="bg-green-100 text-green-700">Completed</Badge>;
      case PaymentStatus.PENDING:
        return <Badge className="bg-yellow-100 text-yellow-700">Pending</Badge>;
      case PaymentStatus.FAILED:
        return <Badge className="bg-red-100 text-red-700">Failed</Badge>;
      case PaymentStatus.REFUNDED:
        return <Badge className="bg-gray-100 text-gray-700">Refunded</Badge>;
    }
  };

  const getDonationTypeBadge = (type: DonationType) => {
    switch (type) {
      case DonationType.MONTHLY:
        return <Badge variant="outline" className="border-blue-300 text-blue-700">Monthly</Badge>;
      case DonationType.QUARTERLY:
        return <Badge variant="outline" className="border-purple-300 text-purple-700">Quarterly</Badge>;
      case DonationType.YEARLY:
        return <Badge variant="outline" className="border-green-300 text-green-700">Yearly</Badge>;
      default:
        return <Badge variant="outline">One-Time</Badge>;
    }
  };

  const oneTimeDonations = currentDonor.donations.filter(d => d.donationType === DonationType.ONE_TIME);
  const recurringDonations = currentDonor.donations.filter(d => d.donationType !== DonationType.ONE_TIME);

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="My Donations"
        description="View and manage all your contributions"
        actions={
          <Button
            className="bg-[#eacfa2] text-teal-900 hover:bg-[#d4b886]"
            onClick={() => navigate('/donate')}
          >
            <Heart className="w-4 h-4 mr-2" />
            Make a Donation
          </Button>
        }
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-teal-900 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-teal-100">Total Donated</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">${currentDonor.totalDonated.toLocaleString()}</div>
            <p className="text-xs text-teal-300 mt-1">All time</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Total Donations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{currentDonor.donations.length}</div>
            <p className="text-xs text-gray-500 mt-1">Individual contributions</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Recurring Donations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{currentDonor.recurringDonations.length}</div>
            <p className="text-xs text-gray-500 mt-1">Active subscriptions</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">This Year</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">$600</div>
            <p className="text-xs text-gray-500 mt-1">2024 total</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Donation History</CardTitle>
            <CardDescription>Your giving over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis dataKey="month" stroke="#666" />
                <YAxis stroke="#666" />
                <Tooltip
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
                  name="Amount ($)"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Monthly Breakdown</CardTitle>
            <CardDescription>Donations by month</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis dataKey="month" stroke="#666" />
                <YAxis stroke="#666" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e0e0e0',
                    borderRadius: '8px',
                  }}
                />
                <Bar dataKey="amount" fill="#4c9789" name="Amount ($)" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Donations</TabsTrigger>
          <TabsTrigger value="one-time">One-Time</TabsTrigger>
          <TabsTrigger value="recurring">Recurring</TabsTrigger>
        </TabsList>

        {/* Filters */}
        <div className="flex gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search by program, project, or transaction ID..."
              className="w-full"
            />
          </div>
          <Select>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
            </SelectContent>
          </Select>
          <Select>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Year" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2024">2024</SelectItem>
              <SelectItem value="2023">2023</SelectItem>
              <SelectItem value="2022">2022</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* All Donations Tab */}
        <TabsContent value="all">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>All Donations</CardTitle>
                  <CardDescription>Complete history of your contributions</CardDescription>
                </div>
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </div>
            </CardHeader>
            <CardContent>
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
                  {currentDonor.donations.map((donation) => (
                    <TableRow key={donation.id}>
                      <TableCell className="font-medium">
                        {new Date(donation.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>{getDonationTypeBadge(donation.donationType)}</TableCell>
                      <TableCell>
                        {donation.program?.name.en || donation.project?.name.en || 'General Fund'}
                      </TableCell>
                      <TableCell className="font-semibold">
                        ${donation.amount.toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <CreditCard className="w-4 h-4 text-gray-400" />
                          <span className="text-sm">{donation.paymentMethod}</span>
                        </div>
                      </TableCell>
                      <TableCell>{getPaymentStatusBadge(donation.paymentStatus)}</TableCell>
                      <TableCell>
                        {donation.receiptSent ? (
                          <Button variant="ghost" size="sm">
                            <FileText className="w-4 h-4" />
                          </Button>
                        ) : (
                          <span className="text-xs text-gray-400">N/A</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <Eye className="w-4 h-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-md">
                            <DialogHeader>
                              <DialogTitle>Donation Details</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                              <div className="flex justify-between">
                                <span className="text-gray-600">Transaction ID:</span>
                                <span className="font-mono text-sm">{donation.transactionId}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Date:</span>
                                <span>{new Date(donation.createdAt).toLocaleString()}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Amount:</span>
                                <span className="font-semibold">${donation.amount.toFixed(2)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Program:</span>
                                <span>{donation.program?.name.en || 'General Fund'}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Payment Method:</span>
                                <span>{donation.paymentMethod}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Status:</span>
                                {getPaymentStatusBadge(donation.paymentStatus)}
                              </div>
                              {donation.receiptNumber && (
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Receipt #:</span>
                                  <span className="font-mono text-sm">{donation.receiptNumber}</span>
                                </div>
                              )}
                              <div className="pt-4 border-t">
                                <Button className="w-full" variant="outline">
                                  <Download className="w-4 h-4 mr-2" />
                                  Download Receipt
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
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
                  {oneTimeDonations.map((donation) => (
                    <TableRow key={donation.id}>
                      <TableCell>{new Date(donation.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell>{donation.program?.name.en || 'General Fund'}</TableCell>
                      <TableCell className="font-semibold">${donation.amount.toFixed(2)}</TableCell>
                      <TableCell>{getPaymentStatusBadge(donation.paymentStatus)}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm">View</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
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
                {currentDonor.recurringDonations.map((recurring) => (
                  <div
                    key={recurring.id}
                    className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-lg">
                            ${recurring.amount.toFixed(2)} / {recurring.frequency}
                          </h3>
                          <Badge className={
                            recurring.status === 'active'
                              ? 'bg-green-100 text-green-700'
                              : recurring.status === 'paused'
                                ? 'bg-yellow-100 text-yellow-700'
                                : 'bg-gray-100 text-gray-700'
                          }>
                            {recurring.status}
                          </Badge>
                        </div>
                        <p className="text-gray-600 mb-3">
                          {recurring.program?.name.en || 'General Fund'}
                        </p>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-gray-500">Next Charge Date</p>
                            <p className="font-medium">
                              {new Date(recurring.nextChargeDate).toLocaleDateString()}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-500">Total Contributed</p>
                            <p className="font-medium">${recurring.totalAmount.toFixed(2)}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Payment Method</p>
                            <p className="font-medium">
                              {recurring.paymentMethodDetails.type} •••• {recurring.paymentMethodDetails.last4}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-500">Total Charges</p>
                            <p className="font-medium">{recurring.totalCharges} times</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        {recurring.status === 'active' && (
                          <>
                            <Button variant="outline" size="sm">Pause</Button>
                            <Button variant="outline" size="sm">Modify</Button>
                            <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                              Cancel
                            </Button>
                          </>
                        )}
                        {recurring.status === 'paused' && (
                          <Button size="sm" className="bg-teal-600 hover:bg-teal-700">Resume</Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Tax Information */}
      <Card>
        <CardHeader>
          <CardTitle>Tax Information</CardTitle>
          <CardDescription>Download your annual tax receipts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <p className="font-medium">2024 Tax Receipt</p>
                <p className="text-sm text-gray-500">Total: $600.00</p>
              </div>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <p className="font-medium">2023 Tax Receipt</p>
                <p className="text-sm text-gray-500">Total: ${currentDonor.totalDonated.toFixed(2)}</p>
              </div>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
