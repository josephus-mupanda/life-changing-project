import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Loader2, Search, Filter, Download, Eye, DollarSign } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { adminService } from '@/services/admin.service';
import { Donation, DonationType, PaymentStatus, Currency } from '@/lib/types';
import { toast } from 'sonner';

export default function DonationsPage() {
    const [donations, setDonations] = useState<Donation[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);

    useEffect(() => {
        fetchDonations();
    }, [page, search, filterStatus]);

    const fetchDonations = async () => {
        setLoading(true);
        try {
            // Note: Assuming API supports status filter in search or separate param
            // For now, just passing search. If backend supports 'status', add it to params.
            const response = await adminService.getDonations(page, 10, search);
            // If client-side filtering needed for status because API doesn't support it yet:
            // This is a placeholder as proper filtering typically happens on server.

            let data = Array.isArray(response.data) ? response.data : [];
            if (filterStatus !== 'all') {
                data = data.filter((d: Donation) => d.paymentStatus === filterStatus);
            }

            setDonations(data);
            setTotal(response.total);
        } catch (error) {
            console.error("Failed to fetch donations", error);
            toast.error("Failed to load donations");
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status: PaymentStatus) => {
        switch (status) {
            case PaymentStatus.COMPLETED:
                return <Badge className="bg-green-100 text-green-700">Completed</Badge>;
            case PaymentStatus.PENDING:
                return <Badge className="bg-yellow-100 text-yellow-700">Pending</Badge>;
            case PaymentStatus.FAILED:
                return <Badge className="bg-red-100 text-red-700">Failed</Badge>;
            case PaymentStatus.REFUNDED:
                return <Badge className="bg-gray-100 text-gray-700">Refunded</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Donations</h1>
                    <p className="text-muted-foreground">Manage and track all donations</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline">
                        <Download className="mr-2 h-4 w-4" />
                        Export
                    </Button>
                </div>
            </div>

            {/* Filters */}
            <Card>
                <CardContent className="pt-6">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search by donor name, email or transaction ID..."
                                className="pl-9"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                        <div className="w-full md:w-[200px]">
                            <Select value={filterStatus} onValueChange={setFilterStatus}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Statuses</SelectItem>
                                    <SelectItem value={PaymentStatus.COMPLETED}>Completed</SelectItem>
                                    <SelectItem value={PaymentStatus.PENDING}>Pending</SelectItem>
                                    <SelectItem value={PaymentStatus.FAILED}>Failed</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Donations Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Recent Donations</CardTitle>
                    <CardDescription>
                        Showing {donations.length} of {total} transactions
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex justify-center p-8">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : donations.length === 0 ? (
                        <div className="text-center py-10 text-muted-foreground">
                            No donations found matching your criteria.
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Donor</TableHead>
                                        <TableHead>Amount</TableHead>
                                        <TableHead>Type</TableHead>
                                        <TableHead>Method</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {donations.map((donation) => (
                                        <TableRow key={donation.id}>
                                            <TableCell>
                                                {new Date(donation.createdAt).toLocaleDateString()}
                                                <div className="text-xs text-muted-foreground">
                                                    {new Date(donation.createdAt).toLocaleTimeString()}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {donation.isAnonymous ? (
                                                    <span className="italic text-muted-foreground">Anonymous</span>
                                                ) : (
                                                    <div className="font-medium">{donation.donor?.fullName || 'Unknown Donor'}</div>
                                                )}
                                                <div className="text-xs text-muted-foreground">{donation.donor?.user?.email}</div>
                                            </TableCell>
                                            <TableCell className="font-bold">
                                                {donation.amount.toLocaleString()} <span className="text-xs font-normal text-muted-foreground">{donation.currency}</span>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className="capitalize">{donation.donationType?.replace('_', ' ')}</Badge>
                                            </TableCell>
                                            <TableCell className="capitalize">
                                                {donation.paymentMethod?.replace('_', ' ')}
                                            </TableCell>
                                            <TableCell>
                                                {getStatusBadge(donation.paymentStatus)}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button variant="ghost" size="icon">
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}

                    {/* Pagination Controls could go here */}

                </CardContent>
            </Card>
        </div>
    );
}
