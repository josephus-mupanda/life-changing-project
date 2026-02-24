import React, { useState, useEffect } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
    Plus,
    UserCheck,
    Mail,
    Phone,
    Shield,
    UserCog,
    Trash2,
    Edit,
    Power,
    CheckCircle2,
    Users,
    SearchIcon,
    ChevronRight,
    Eye,
    Calendar,
    Globe,
    AlertCircle,
    Heart,
    MoreHorizontal,
    Loader2
} from 'lucide-react';
import { User, UserType, Language } from '@/lib/types';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { StatsCard } from '@/components/StatsCard';
import { cn } from '@/components/ui/utils';
import { adminService } from '@/services/admin.service';
import { authService } from '@/services/auth.service';
import { useDebounce } from '@/hooks/UseDebounce';

export function ManageUsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState<string>('all');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [activeTab, setActiveTab] = useState('all');

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalUsers, setTotalUsers] = useState(0);
    const itemsPerPage = 10;

    // Modal Visibility States
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    // Context User States
    const [selectedUser, setSelectedUser] = useState<User | null>(null);

    // Form states
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        password: '', // For creation
        userType: UserType.BENEFICIARY,
        isActive: true,
    });

    const resetForm = () => {
        setFormData({
            fullName: '',
            email: '',
            phone: '',
            password: '',
            userType: UserType.BENEFICIARY,
            isActive: true,
        });
        setSelectedUser(null);
    };

    const fetchUsers = async () => {
        setIsLoading(true);
        try {
            let response: any;
            if (activeTab === 'pending') {
                response = await adminService.getPendingActivationUsers(currentPage, itemsPerPage);
            } else if (activeTab === 'incomplete') {
                response = await adminService.getIncompleteProfiles();
            } else {
                response = await adminService.getUsers(currentPage, itemsPerPage, searchTerm);
            }

            let usersList: User[] = [];
            let total = 0;

            if (activeTab === 'incomplete') {
                // Map IncompleteProfileUser to User structure
                const rawUsers = Array.isArray(response?.users) ? response.users : (Array.isArray(response) ? response : []);
                usersList = rawUsers.map((u: any) => ({
                    id: u.userId,
                    fullName: u.fullName,
                    email: u.email,
                    phone: u.phone,
                    userType: u.userType,
                    isActive: false,
                    profileImageUrl: undefined,
                    createdAt: u.registeredAt ? new Date(u.registeredAt) : new Date(),
                    updatedAt: new Date(),
                    language: Language.EN,
                    isVerified: false,
                    verificationToken: null,
                    verifiedAt: null,
                    resetPasswordToken: null,
                    resetPasswordExpires: null,
                    offlineSyncToken: null,
                    lastLoginAt: null
                }));
                total = response?.totalIncomplete || usersList.length;
            } else {
                // Standard structure
                usersList = Array.isArray(response) ? response : (Array.isArray(response?.data) ? response.data : []);
                total = response?.total || usersList.length;
            }

            setUsers(usersList);
            setTotalUsers(total);
            setTotalPages(Math.ceil(total / itemsPerPage));
        } catch (error) {
            console.error("Failed to fetch users", error);
            toast.error("Failed to load users");
        } finally {
            setIsLoading(false);
        }
    };

    const debouncedSearch = useDebounce(searchTerm, 500);

    useEffect(() => {
        setCurrentPage(1); // Reset page on tab change
        fetchUsers();
    }, [activeTab]);

    useEffect(() => {
        fetchUsers();
    }, [currentPage, debouncedSearch]);

    useEffect(() => {
        if (selectedUser && (isEditModalOpen || isRoleModalOpen)) {
            setFormData(prev => ({
                ...prev,
                fullName: selectedUser.fullName,
                email: selectedUser.email || '',
                phone: selectedUser.phone,
                userType: selectedUser.userType,
                isActive: selectedUser.isActive,
            }));
        }
    }, [selectedUser, isEditModalOpen, isRoleModalOpen]);

    const handleInputChange = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    // Client-side filtering for Role and Status (if API doesn't support it yet)
    // Or if we want mixed approach. 
    // Ideally API should handle it. adminService.getUsers takes search, page, limit.
    // If backend doesn't support role/status filter params, we have to filter mostly client side 
    // BUT client side filtering only works on the fetched page, which is bad.
    // Assuming for this reconstruction we display what we get, and maybe filtering happens on backend via search string 
    // or we accept we filter only current page if endpoints are limited.
    // Let's implement client-side filtering on the *fetched* data for now as a fallback.
    const safeUsers = Array.isArray(users) ? users : [];
    const filteredUsers = safeUsers.filter(user => {
        const matchesRole = roleFilter === 'all' || user.userType === roleFilter;
        // Status filter
        const matchesStatus =
            statusFilter === 'all' ||
            (statusFilter === 'active' && user.isActive) ||
            (statusFilter === 'inactive' && !user.isActive);

        return matchesRole && matchesStatus;
    });

    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            // Using authService.register as Admin "Add User" (Generic)
            // Need password for new user
            const tempPassword = 'Password123!'; // Default or from form? 
            // In a real app, admin might set a temp password or trigger an invite.
            // Let's assume we need a password field or use a default.

            await authService.register({
                fullName: formData.fullName,
                email: formData.email,
                phone: formData.phone,
                password: formData.password || tempPassword,
                userType: formData.userType,
                language: Language.EN
            });

            toast.success(`User created successfully`);
            setIsAddModalOpen(false);
            resetForm();
            fetchUsers(); // Refresh list
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to create user");
        }
    };

    const handleUpdateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedUser) return;

        try {
            await adminService.updateUser(selectedUser.id, {
                fullName: formData.fullName,
                email: formData.email,
                phone: formData.phone,
                userType: formData.userType,
                // isActive is handled by separate toggle usually, but can be here
            });

            toast.success(`User updated successfully`);
            setIsEditModalOpen(false);
            setIsRoleModalOpen(false);
            setSelectedUser(null);
            fetchUsers();
        } catch (error: any) {
            toast.error("Failed to update user");
        }
    };

    const toggleUserStatus = async (user: User) => {
        try {
            if (user.isActive) {
                await adminService.deactivateUser(user.id);
                toast.success(`${user.fullName} deactivated`);
            } else {
                await adminService.activateUser(user.id);
                toast.success(`${user.fullName} activated`);
            }
            fetchUsers();
        } catch (error) {
            toast.error("Failed to update status");
        }
    };

    const handleDeleteUser = async () => {
        if (!selectedUser) return;
        try {
            await adminService.deleteUser(selectedUser.id);
            toast.success('User deleted');
            setIsDeleteModalOpen(false);
            setSelectedUser(null);
            fetchUsers();
        } catch (error) {
            toast.error("Failed to delete user");
        }
    };

    const formatDate = (date: Date | string) => {
        if (!date) return 'N/A';
        return new Intl.DateTimeFormat('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        }).format(new Date(date));
    };

    const getRoleBadgeStyle = (role: UserType) => {
        switch (role) {
            case UserType.ADMIN: return 'bg-indigo-50/80 text-indigo-700 border-indigo-100 dark:bg-indigo-900/30 dark:text-indigo-400';
            case UserType.DONOR: return 'bg-blue-50/80 text-blue-700 border-blue-100 dark:bg-blue-900/30 dark:text-blue-400';
            case UserType.BENEFICIARY: return 'bg-teal-50/80 text-teal-700 border-teal-100 dark:bg-teal-900/30 dark:text-teal-400';
            default: return 'bg-slate-50 text-slate-700 dark:bg-slate-800 dark:text-slate-400';
        }
    };

    return (
        <div className="space-y-6 pb-20">
            {/* Minimal Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Manage Users</h1>
                    <p className="text-slate-500 text-sm font-medium">Control system access and user classifications</p>
                </div>
                <Dialog open={isAddModalOpen} onOpenChange={(open) => { setIsAddModalOpen(open); if (!open) resetForm(); }}>
                    <DialogTrigger asChild>
                        <Button
                            className="rounded-xl font-semibold bg-teal-600 hover:bg-teal-700 text-white shadow-md">
                            <Plus className="h-4 w-4 mr-2" />
                            Add User
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="!max-w-[280px] p-0 border-none shadow-[0_32px_64px_-16px_rgba(0,0,0,0.15)] rounded-2xl overflow-hidden bg-white dark:bg-slate-950">
                        <div className="px-4 py-3 border-b border-slate-50 dark:border-slate-900 bg-slate-50/30">
                            <div>
                                <DialogTitle className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">New Entry</DialogTitle>
                                <DialogDescription className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Registry Initialization</DialogDescription>
                            </div>
                        </div>
                        <form onSubmit={handleCreateUser} className="p-4 pt-3 space-y-3">
                            <div className="space-y-1">
                                <Label className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Identity Name</Label>
                                <Input
                                    value={formData.fullName}
                                    onChange={(e) => handleInputChange('fullName', e.target.value)}
                                    placeholder="Enter legal name"
                                    className="h-8 rounded-lg border-slate-100 bg-slate-50/50 focus:ring-slate-900 transition-all font-bold text-xs"
                                    required
                                />
                            </div>
                            <div className="space-y-1">
                                <Label className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Password</Label>
                                <Input
                                    type="password"
                                    value={formData.password}
                                    onChange={(e) => handleInputChange('password', e.target.value)}
                                    placeholder="Temp Password"
                                    className="h-8 rounded-lg border-slate-100 bg-slate-50/50 focus:ring-slate-900 transition-all font-bold text-xs"
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <Label className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Phone Link</Label>
                                    <Input
                                        value={formData.phone}
                                        onChange={(e) => handleInputChange('phone', e.target.value)}
                                        placeholder="+000 000 000"
                                        className="h-8 rounded-lg border-slate-100 bg-slate-50/50 font-bold text-xs"
                                        required
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Class</Label>
                                    <Select value={formData.userType} onValueChange={(val) => handleInputChange('userType', val)}>
                                        <SelectTrigger className="h-8 rounded-lg border-slate-100 bg-slate-50/50 font-black text-[10px] uppercase tracking-wider">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-lg border-slate-100">
                                            <SelectItem value={UserType.ADMIN} className="text-[10px] font-black uppercase tracking-wider">Admin</SelectItem>
                                            <SelectItem value={UserType.DONOR} className="text-[10px] font-black uppercase tracking-wider">Donor</SelectItem>
                                            <SelectItem value={UserType.BENEFICIARY} className="text-[10px] font-black uppercase tracking-wider">Beneficiary</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="space-y-1">
                                <Label className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Email Endpoint</Label>
                                <Input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => handleInputChange('email', e.target.value)}
                                    placeholder="identity@lceo.org"
                                    className="h-8 rounded-lg border-slate-100 bg-slate-50/50 font-bold text-xs"
                                />
                            </div>
                            <div className="pt-2 flex flex-col items-center gap-1.5">
                                <Button type="submit" className="w-3/4 h-8 rounded-lg font-semibold text-[10px] uppercase tracking-wider shadow-md transition-all duration-200 active:scale-[0.97]" style={{ backgroundColor: '#4c9789', color: '#ffffff' }}>
                                    Create User
                                </Button>
                                <Button type="button" variant="ghost" className="w-3/4 h-7 text-[9px] font-semibold uppercase tracking-wider text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-all duration-200" onClick={() => setIsAddModalOpen(false)}>
                                    Cancel
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Tabs & Search */}
            <div className="flex flex-col gap-4">
                <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-3 max-w-md">
                        <TabsTrigger value="all">All Users</TabsTrigger>
                        <TabsTrigger value="pending">Pending Activation</TabsTrigger>
                        <TabsTrigger value="incomplete">Incomplete Profiles</TabsTrigger>
                    </TabsList>
                </Tabs>
                {/* Filter/Search Bar */}
                <div className="flex flex-col md:flex-row items-center gap-3 bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
                    <div className="relative flex-1 w-full group">
                        <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input
                            placeholder="Search by name, email or phone..."
                            className="h-10 pl-11 pr-4 bg-slate-50/50 dark:bg-slate-950 border-slate-100 dark:border-slate-800 rounded-xl font-medium focus:ring-slate-900"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <Select value={roleFilter} onValueChange={setRoleFilter}>
                            <SelectTrigger className="w-full md:w-40 h-10 border-slate-100 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-950 font-medium">
                                <SelectValue placeholder="All Roles" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl border-slate-100">
                                <SelectItem value="all">All Roles</SelectItem>
                                <SelectItem value={UserType.ADMIN}>Admin</SelectItem>
                                <SelectItem value={UserType.DONOR}>Donor</SelectItem>
                                <SelectItem value={UserType.BENEFICIARY}>Beneficiary</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-full md:w-40 h-10 border-slate-100 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-950 font-medium">
                                <SelectValue placeholder="All Status" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl border-slate-100">
                                <SelectItem value="all">All Status</SelectItem>
                                <SelectItem value="active">Active</SelectItem>
                                <SelectItem value="inactive">Inactive</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>

            {/* Clean Professional Table */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/20 dark:shadow-none overflow-hidden">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-slate-50/50 dark:bg-slate-950/50 border-b border-slate-100 dark:border-slate-800">
                                <TableHead className="w-16 px-6 py-4"></TableHead>
                                <TableHead className="py-4 font-bold text-xs uppercase text-slate-400 tracking-wider">User Profile</TableHead>
                                <TableHead className="py-4 font-bold text-xs uppercase text-slate-400 tracking-wider">Role</TableHead>
                                <TableHead className="py-4 font-bold text-xs uppercase text-slate-400 tracking-wider">Contact</TableHead>
                                {activeTab === 'incomplete' ? (
                                    <TableHead className="py-4 font-bold text-xs uppercase text-slate-400 tracking-wider">Missing Fields</TableHead>
                                ) : (
                                    <TableHead className="py-4 font-bold text-xs uppercase text-slate-400 tracking-wider">Status</TableHead>
                                )}
                                <TableHead className="text-right px-8 py-4 font-bold text-xs uppercase text-slate-400 tracking-wider">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            <AnimatePresence mode='popLayout'>
                                {isLoading ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="h-64 text-center">
                                            <div className="flex flex-col items-center justify-center gap-2">
                                                <Loader2 className="animate-spin text-teal-600" size={32} />
                                                <p className="text-slate-400 text-xs">Loading manifest...</p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : filteredUsers.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="h-64 text-center">
                                            <p className="text-slate-400 font-medium italic">No users found matching your search</p>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredUsers.map((user, idx) => (
                                        <motion.tr
                                            layout
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            key={user.id}
                                            className="group hover:bg-slate-50/30 dark:hover:bg-slate-800/20 transition-colors border-slate-50 dark:border-slate-800/50"
                                        >
                                            <TableCell className="px-6 py-3">
                                                <Avatar className="h-10 w-10 border-2 border-white dark:border-slate-800">
                                                    <AvatarImage src={user.profileImageUrl} />
                                                    <AvatarFallback className="text-xs font-bold bg-slate-100">{user.fullName[0]}</AvatarFallback>
                                                </Avatar>
                                            </TableCell>
                                            <TableCell className="py-3">
                                                <div className="flex flex-col">
                                                    <p className="font-bold text-slate-900 dark:text-white text-sm">{user.fullName}</p>
                                                    <p className="text-[10px] text-slate-400 font-semibold tracking-wide mt-0.5">#{user.id.substring(0, 6)}...</p>
                                                </div>
                                            </TableCell>
                                            <TableCell className="py-3">
                                                <Badge variant="outline" className={cn("rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider border transition-colors", getRoleBadgeStyle(user.userType))}>
                                                    {user.userType}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="py-3">
                                                <div className="flex flex-col gap-0.5">
                                                    <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5"><Mail size={12} className="text-slate-400" /> {user.email || '—'}</p>
                                                    <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5"><Phone size={12} className="text-slate-400" /> {user.phone}</p>
                                                </div>
                                            </TableCell>
                                            <TableCell className="py-3">
                                                {activeTab === 'incomplete' ? (
                                                    <div className="flex flex-wrap gap-1">
                                                        {(user as any).missingFields?.map((field: string) => (
                                                            <Badge key={field} variant="outline" className="text-[9px] px-1 py-0 border-orange-200 text-orange-600 bg-orange-50">
                                                                {field}
                                                            </Badge>
                                                        )) || <span className="text-xs text-slate-400">-</span>}
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-2">
                                                        <div className={cn("h-1.5 w-1.5 rounded-full", user.isActive ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-slate-300")} />
                                                        <span className={cn("text-[11px] font-bold uppercase tracking-tight", user.isActive ? "text-emerald-600" : "text-slate-400")}>{user.isActive ? 'Active' : 'Suspended'}</span>
                                                    </div>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right px-6 py-3">
                                                <div className="flex items-center justify-end gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                                    <Button
                                                        size="icon"
                                                        variant="ghost"
                                                        className="h-6 w-6 rounded-md bg-blue-50/80 dark:bg-blue-900/20 hover:bg-blue-100 text-blue-500 hover:text-blue-700 transition-all duration-150 hover:scale-110 border border-transparent hover:border-blue-200/60"
                                                        title="View Details"
                                                        onClick={() => { setSelectedUser(user); setIsViewModalOpen(true); }}
                                                    >
                                                        <Eye size={12} />
                                                    </Button>
                                                    <Button
                                                        size="icon"
                                                        variant="ghost"
                                                        className="h-6 w-6 rounded-md bg-indigo-50/80 dark:bg-indigo-900/20 hover:bg-indigo-100 text-indigo-500 hover:text-indigo-700 transition-all duration-150 hover:scale-110 border border-transparent hover:border-indigo-200/60"
                                                        title="Edit Profile"
                                                        onClick={() => { setSelectedUser(user); setIsEditModalOpen(true); }}
                                                    >
                                                        <Edit size={12} />
                                                    </Button>
                                                    <Button
                                                        size="icon"
                                                        variant="ghost"
                                                        className={cn(
                                                            "h-6 w-6 rounded-md transition-all duration-150 border border-transparent hover:scale-110",
                                                            user.isActive
                                                                ? "bg-amber-50/80 dark:bg-amber-900/20 hover:bg-amber-100 text-amber-500 hover:text-amber-700 hover:border-amber-200/60"
                                                                : "bg-emerald-50/80 dark:bg-emerald-900/20 hover:bg-emerald-100 text-emerald-500 hover:text-emerald-700 hover:border-emerald-200/60"
                                                        )}
                                                        title={user.isActive ? "Suspend" : "Activate"}
                                                        onClick={() => toggleUserStatus(user)}
                                                    >
                                                        <Power size={12} />
                                                    </Button>
                                                    <Button
                                                        size="icon"
                                                        variant="ghost"
                                                        className="h-6 w-6 rounded-md bg-rose-50/80 dark:bg-rose-900/15 hover:bg-rose-100 text-rose-400 hover:text-rose-600 transition-all duration-150 hover:scale-110 border border-transparent hover:border-rose-200/60"
                                                        title="Delete User"
                                                        onClick={() => { setSelectedUser(user); setIsDeleteModalOpen(true); }}
                                                    >
                                                        <Trash2 size={12} />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </motion.tr>
                                    ))
                                )}
                            </AnimatePresence>
                        </TableBody>
                    </Table>
                </div>
                <div className="bg-slate-50/30 p-4 px-8 text-xs font-semibold text-slate-400 flex items-center justify-between border-t border-slate-100 dark:border-slate-800">
                    <p>Showing {filteredUsers.length} of {totalUsers} total users</p>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            className="h-7 px-3 text-[9px] font-semibold uppercase tracking-wider rounded-lg border-slate-200 transition-all"
                        >
                            Prev
                        </Button>
                        <Button
                            variant="outline"
                            disabled={currentPage >= totalPages}
                            onClick={() => setCurrentPage(p => p + 1)}
                            className="h-7 px-3 text-[9px] font-semibold uppercase tracking-wider rounded-lg border-slate-200 transition-all"
                        >
                            Next
                        </Button>
                    </div>
                </div>
            </div>

            {/* Modals - Keeping structure but ensuring they use state correctly */}
            {/* View Profile Modal - No Change needed other than ensuring data presence */}
            <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
                <DialogContent className="!max-w-[280px] p-0 border-none shadow-[0_32px_64px_-16px_rgba(0,0,0,0.15)] rounded-2xl overflow-hidden bg-white dark:bg-slate-950">
                    <div className="px-4 py-3 border-b border-slate-50 dark:border-slate-900 bg-slate-50/30">
                        <div>
                            <DialogTitle className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">User Profile</DialogTitle>
                            <DialogDescription className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">View Details</DialogDescription>
                        </div>
                    </div>
                    <div className="p-4 pt-3 space-y-3 overflow-y-auto max-h-[320px]">
                        <div className="flex flex-col items-center gap-2 pb-1">
                            <div className="relative">
                                <Avatar className="w-14 h-14 ring-2 ring-slate-100 dark:ring-slate-800 shadow-md">
                                    <AvatarImage src={selectedUser?.profileImageUrl} className="object-cover" />
                                    <AvatarFallback className="text-base font-black bg-slate-100 text-slate-900">{selectedUser?.fullName[0]}</AvatarFallback>
                                </Avatar>
                                <div className={cn("absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white dark:border-slate-950", selectedUser?.isActive ? "bg-emerald-500" : "bg-slate-300")} />
                            </div>
                            <div className="text-center">
                                <h2 className="text-sm font-black text-slate-900 dark:text-white tracking-tight">{selectedUser?.fullName}</h2>
                                <p className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-400 mt-0.5">{selectedUser?.userType}</p>
                            </div>
                        </div>

                        <div className="space-y-2 text-left">
                            {[
                                { label: 'Email', value: selectedUser?.email || 'N/A', icon: Mail },
                                { label: 'Phone', value: selectedUser?.phone, icon: Phone },
                                { label: 'Joined', value: selectedUser ? formatDate(selectedUser.createdAt) : '--', icon: Calendar }
                            ].map((item, i) => (
                                <div key={i} className="p-2.5 bg-slate-50/50 dark:bg-slate-900/50 border border-slate-100/50 dark:border-slate-800/50 rounded-lg">
                                    <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest mb-0.5 flex items-center gap-1 leading-none">
                                        <item.icon size={9} className="opacity-50" /> {item.label}
                                    </p>
                                    <p className="text-[10px] font-bold text-slate-700 dark:text-slate-300 truncate leading-none">{item.value}</p>
                                </div>
                            ))}
                        </div>
                        <div className="pt-1 flex flex-col items-center">
                            <Button className="w-3/4 h-8 rounded-lg font-semibold text-[10px] uppercase tracking-wider shadow-md transition-all duration-200 active:scale-[0.97]" style={{ backgroundColor: '#4c9789', color: '#ffffff' }} onClick={() => setIsViewModalOpen(false)}>
                                Close
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Edit User Modal */}
            <Dialog open={isEditModalOpen} onOpenChange={(open) => { setIsEditModalOpen(open); if (!open) resetForm(); }}>
                <DialogContent className="!max-w-[280px] p-0 border-none shadow-[0_32px_64px_-16px_rgba(0,0,0,0.15)] rounded-2xl overflow-hidden bg-white dark:bg-slate-950">
                    <div className="px-4 py-3 border-b border-slate-50 dark:border-slate-900 bg-slate-50/30">
                        <div>
                            <DialogTitle className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">Edit User</DialogTitle>
                            <DialogDescription className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Update Profile</DialogDescription>
                        </div>
                    </div>
                    <form onSubmit={handleUpdateUser} className="p-4 pt-3 space-y-3">
                        <div className="space-y-1">
                            <Label className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Full Name</Label>
                            <Input
                                value={formData.fullName}
                                onChange={(e) => handleInputChange('fullName', e.target.value)}
                                className="h-8 rounded-lg bg-slate-50/50 border-slate-100 dark:border-slate-900 font-bold text-xs"
                                required
                            />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Phone</Label>
                            <Input
                                value={formData.phone}
                                onChange={(e) => handleInputChange('phone', e.target.value)}
                                className="h-8 rounded-lg bg-slate-50/50 border-slate-100 dark:border-slate-900 font-bold text-xs"
                                required
                            />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Email</Label>
                            <Input
                                type="email"
                                value={formData.email}
                                onChange={(e) => handleInputChange('email', e.target.value)}
                                className="h-8 rounded-lg bg-slate-50/50 border-slate-100 dark:border-slate-900 font-bold text-xs"
                            />
                        </div>
                        <div className="pt-2 flex flex-col items-center gap-1.5">
                            <Button type="submit" className="w-3/4 h-8 rounded-lg font-semibold text-[10px] uppercase tracking-wider shadow-md transition-all duration-200 active:scale-[0.97]" style={{ backgroundColor: '#4c9789', color: '#ffffff' }}>
                                Save Changes
                            </Button>
                            <Button type="button" variant="ghost" className="w-3/4 h-7 text-[9px] font-semibold uppercase tracking-wider text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-all duration-200" onClick={() => setIsEditModalOpen(false)}>
                                Cancel
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Delete User Modal */}
            <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
                <DialogContent className="!max-w-[280px] p-0 border-none shadow-[0_32px_64px_-16px_rgba(0,0,0,0.15)] rounded-2xl overflow-hidden bg-white dark:bg-slate-950">
                    <div className="px-4 py-3 border-b border-slate-50 dark:border-slate-900 bg-slate-50/30">
                        <div>
                            <DialogTitle className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">Delete User</DialogTitle>
                            <DialogDescription className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Permanent Action</DialogDescription>
                        </div>
                    </div>
                    <div className="p-4 pt-3 space-y-3 text-center">
                        <div className="mx-auto w-10 h-10 bg-red-50 dark:bg-red-950/20 text-red-500 rounded-xl flex items-center justify-center">
                            <AlertCircle size={20} strokeWidth={2.5} />
                        </div>
                        <div className="space-y-1">
                            <p className="text-[10px] font-bold text-slate-500 leading-relaxed px-2">Are you sure you want to delete<br /><span className="text-slate-900 dark:text-white font-black">{selectedUser?.fullName}</span>?<br />This cannot be undone.</p>
                        </div>
                        <div className="pt-1 flex flex-col items-center gap-1.5">
                            <Button className="w-3/4 h-8 rounded-lg font-semibold text-[10px] uppercase tracking-wider shadow-md transition-all duration-200 active:scale-[0.97]" style={{ backgroundColor: '#d4183d', color: '#ffffff' }} onClick={handleDeleteUser}>
                                Delete User
                            </Button>
                            <Button variant="ghost" className="w-3/4 h-7 text-[9px] font-semibold uppercase tracking-wider text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-all duration-200" onClick={() => setIsDeleteModalOpen(false)}>
                                Cancel
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}