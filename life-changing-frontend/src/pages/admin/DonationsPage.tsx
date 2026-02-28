import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Loader2, 
  Search, 
  Filter, 
  Download, 
  Eye, 
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight 
} from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { adminService } from '@/services/admin.service';
import { Donation, PaymentStatus } from '@/lib/types';
import { toast } from 'sonner';
import { donationService } from '@/services/donation.service';

export default function DonationsPage() {
    const [donations, setDonations] = useState<Donation[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [page, setPage] = useState(1);
    const itemsPerPage = 10;

    useEffect(() => {
        fetchDonations();
    }, [filterStatus]); // Refetch when filter changes

    const fetchDonations = async () => {
        setLoading(true);
        try {
            let data: Donation[] = [];
            
            // Use the appropriate endpoint based on filter
            if (filterStatus !== 'all') {
                // Use getByStatus from donationService
                const response = await donationService.getByStatus(filterStatus);
                data = Array.isArray(response) ? response : [];
            } else {
                // Use getAllDonations from adminService
                const response = await adminService.getDonations();
                data = response.data || [];
            }

            // Apply client-side search filter
            if (search) {
                const searchLower = search.toLowerCase();
                data = data.filter(donation => {
                    const donorName = donation.isAnonymous 
                        ? '' 
                        : donation.donor?.fullName?.toLowerCase() || 
                          donation.donor?.user?.fullName?.toLowerCase() || 
                          '';
                    
                    const donorEmail = donation.donor?.user?.email?.toLowerCase() || '';
                    const transactionId = donation.transactionId?.toLowerCase() || '';
                    
                    return donorName.includes(searchLower) || 
                           donorEmail.includes(searchLower) || 
                           transactionId.includes(searchLower);
                });
            }

            // Sort by date (newest first)
            data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

            setDonations(data);
        } catch (error) {
            console.error("Failed to fetch donations", error);
            toast.error("Failed to load donations");
            setDonations([]);
        } finally {
            setLoading(false);
        }
    };

    // Handle search with debounce
    useEffect(() => {
        const timer = setTimeout(() => {
            if (search !== undefined) {
                fetchDonations();
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [search]);

    const getStatusBadge = (status: PaymentStatus) => {
        switch (status) {
            case PaymentStatus.COMPLETED:
                return <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">Completed</Badge>;
            case PaymentStatus.PENDING:
                return <Badge className="bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">Pending</Badge>;
            case PaymentStatus.FAILED:
                return <Badge className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">Failed</Badge>;
            case PaymentStatus.REFUNDED:
                return <Badge className="bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400">Refunded</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    // Pagination
    const totalPages = Math.ceil(donations.length / itemsPerPage);
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentDonations = donations.slice(startIndex, endIndex);

    const handlePageChange = (newPage: number) => {
        setPage(newPage);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleStatusChange = (value: string) => {
        setFilterStatus(value);
        setPage(1); // Reset to first page
    };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(e.target.value);
        setPage(1); // Reset to first page on search
    };

    const getDonorName = (donation: Donation) => {
        if (donation.isAnonymous) return 'Anonymous';
        if (donation.donor?.fullName) return donation.donor.fullName;
        if (donation.donor?.user?.fullName) return donation.donor.user.fullName;
        return 'Unknown Donor';
    };

    const getDonorEmail = (donation: Donation) => {
        if (donation.isAnonymous) return null;
        if (donation.donor?.user?.email) return donation.donor.user.email;
        return null;
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
                    <Button variant="outline" onClick={fetchDonations}>
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
                                onChange={handleSearchChange}
                            />
                        </div>
                        <div className="w-full md:w-[200px]">
                            <Select value={filterStatus} onValueChange={handleStatusChange}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Statuses</SelectItem>
                                    <SelectItem value={PaymentStatus.COMPLETED}>Completed</SelectItem>
                                    <SelectItem value={PaymentStatus.PENDING}>Pending</SelectItem>
                                    <SelectItem value={PaymentStatus.FAILED}>Failed</SelectItem>
                                    <SelectItem value={PaymentStatus.REFUNDED}>Refunded</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Donations Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Donations</CardTitle>
                    <CardDescription>
                        Showing {currentDonations.length} of {donations.length} transactions
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
                        <>
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
                                        {currentDonations.map((donation) => (
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
                                                        <>
                                                            <div className="font-medium">{getDonorName(donation)}</div>
                                                            {getDonorEmail(donation) && (
                                                                <div className="text-xs text-muted-foreground">{getDonorEmail(donation)}</div>
                                                            )}
                                                        </>
                                                    )}
                                                </TableCell>
                                                <TableCell className="font-bold">
                                                    {Number(donation.amount).toLocaleString()} <span className="text-xs font-normal text-muted-foreground">{donation.currency}</span>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="outline" className="capitalize">
                                                        {donation.donationType?.replace('_', ' ')}
                                                    </Badge>
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

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="flex items-center justify-between space-x-2 py-4">
                                    <div className="text-sm text-muted-foreground">
                                        Page {page} of {totalPages}
                                    </div>
                                    <div className="flex space-x-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handlePageChange(1)}
                                            disabled={page === 1}
                                        >
                                            <ChevronsLeft className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handlePageChange(page - 1)}
                                            disabled={page === 1}
                                        >
                                            <ChevronLeft className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handlePageChange(page + 1)}
                                            disabled={page === totalPages}
                                        >
                                            <ChevronRight className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handlePageChange(totalPages)}
                                            disabled={page === totalPages}
                                        >
                                            <ChevronsRight className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}