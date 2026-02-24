import React, { useState, useEffect } from 'react';
import {
    Users, Plus, Search, MoreHorizontal, Mail, Phone, Briefcase, Filter, RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table';
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
    Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { adminService } from '@/services/admin.service';
import { Staff, User, StaffRole } from '@/lib/types';
import { useDebounce } from '@/hooks/UseDebounce';


export function StaffPage() {
    const [staff, setStaff] = useState<Staff[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [createOpen, setCreateOpen] = useState(false);

    // Create Staff Form State
    const [userSearch, setUserSearch] = useState("");
    const [searchResults, setSearchResults] = useState<User[]>([]);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [position, setPosition] = useState("");
    const [department, setDepartment] = useState("");
    const [role, setRole] = useState<StaffRole>(StaffRole.ADMIN);
    const [creating, setCreating] = useState(false);

    useEffect(() => {
        fetchStaff();
    }, []);

    const fetchStaff = async () => {
        setLoading(true);
        try {
            const result = await adminService.getStaff();
            setStaff(Array.isArray(result.data) ? result.data : []);
        } catch (error) {
            console.error("Failed to load staff", error);
            toast.error("Failed to load staff list");
        } finally {
            setLoading(false);
        }
    };

    const debouncedSearch = useDebounce(userSearch, 500);

    // Search Users for Staff Creation
    useEffect(() => {
        const searchUsers = async () => {
            if (debouncedSearch.length > 2) {
                try {
                    const res = await adminService.getUsers(1, 5, debouncedSearch);
                    setSearchResults(res.data);
                } catch (e) {
                    console.error(e);
                }
            } else {
                setSearchResults([]);
            }
        };

        searchUsers();
    }, [debouncedSearch]);

    const handleCreateStaff = async () => {
        if (!selectedUser || !position || !department) {
            toast.warning("Please fill all fields");
            return;
        }

        setCreating(true);
        try {
            // Note: API might expect userId, position, department. 
            // Role upgrade might be separate or implicit?
            // checking types.ts: CreateStaffDto { userId, position, department }
            // Assuming creating staff automatically upgrades UserType or adds permissions
            await adminService.createStaff({
                userId: selectedUser.id,
                position,
                department
            });
            toast.success("Staff member added successfully");
            setCreateOpen(false);
            fetchStaff();

            // Reset form
            setSelectedUser(null);
            setUserSearch("");
            setPosition("");
            setDepartment("");
        } catch (error) {
            console.error("Failed to add staff", error);
            toast.error("Failed to add staff member");
        } finally {
            setCreating(false);
        }
    };

    return (
        <div className="space-y-6 pb-20">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Staff Management</h1>
                    <p className="text-muted-foreground">Manage organization staff and permissions.</p>
                </div>
                <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-teal-600 hover:bg-teal-700">
                            <Plus className="mr-2 h-4 w-4" /> Add Staff
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Add New Staff Member</DialogTitle>
                            <DialogDescription>
                                Promote an existing user to staff role.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label>Search User (Email or Name)</Label>
                                <Input
                                    placeholder="Type to search..."
                                    value={userSearch}
                                    onChange={(e) => {
                                        setUserSearch(e.target.value);
                                        if (!e.target.value) setSelectedUser(null);
                                    }}
                                />
                                {searchResults.length > 0 && !selectedUser && (
                                    <div className="border rounded-md max-h-40 overflow-y-auto bg-white shadow-sm mt-1">
                                        {searchResults.map(user => (
                                            <div
                                                key={user.id}
                                                className="p-2 hover:bg-slate-100 cursor-pointer flex items-center gap-2 text-sm"
                                                onClick={() => {
                                                    setSelectedUser(user);
                                                    setUserSearch(user.email || user.fullName);
                                                    setSearchResults([]);
                                                }}
                                            >
                                                <Avatar className="h-6 w-6">
                                                    <AvatarImage src={user.profileImageUrl} />
                                                    <AvatarFallback>{user.fullName[0]}</AvatarFallback>
                                                </Avatar>
                                                <div className="flex flex-col">
                                                    <span className="font-medium">{user.fullName}</span>
                                                    <span className="text-xs text-muted-foreground">{user.email}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                {selectedUser && (
                                    <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 p-2 rounded border border-green-200">
                                        <div className="h-2 w-2 rounded-full bg-green-500" />
                                        Selected: {selectedUser.fullName}
                                    </div>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label>Position / Title</Label>
                                <Input
                                    placeholder="e.g. Program Manager"
                                    value={position}
                                    onChange={(e) => setPosition(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Department</Label>
                                <Input
                                    placeholder="e.g. Operations"
                                    value={department}
                                    onChange={(e) => setDepartment(e.target.value)}
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
                            <Button onClick={handleCreateStaff} disabled={creating || !selectedUser}>
                                {creating ? "Adding..." : "Add Staff"}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-2">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search staff..."
                        className="pl-8"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <Button variant="outline" size="icon" onClick={fetchStaff} title="Refresh">
                    <RefreshCw className="h-4 w-4" />
                </Button>
            </div>

            {/* Staff List */}
            <Card>
                <CardHeader>
                    <CardTitle>Staff Directory</CardTitle>
                    <CardDescription>
                        {staff.length} active staff members.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Staff Member</TableHead>
                                <TableHead>Position</TableHead>
                                <TableHead>Department</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">Loading staff...</TableCell>
                                </TableRow>
                            ) : staff.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">No staff members found.</TableCell>
                                </TableRow>
                            ) : (
                                staff.map((member) => (
                                    <TableRow key={member.id}>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <Avatar>
                                                    <AvatarImage src={member.user?.profileImageUrl} />
                                                    <AvatarFallback className="bg-teal-100 text-teal-700">
                                                        {member.fullName?.substring(0, 2).toUpperCase()}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="flex flex-col">
                                                    <span className="font-medium">{member.fullName}</span>
                                                    <span className="text-xs text-muted-foreground">{member.user?.email}</span>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>{member.role}</TableCell>
                                        {/* Note: 'role' is StaffRole, position & department are fields on Staff entity but types.ts has 'department' and 'role'. 
                                            Wait, types.ts Staff entity has: 
                                            role: StaffRole, department: string | null. 
                                            Where is 'position'? 
                                            CreateStaffDto has 'position'. 
                                            Staff entity might NOT have 'position' in types.ts? 
                                            Checking types.ts again:
                                            Staff { id, user, fullName, role, department, permissions, employeeId, ... }
                                            It does NOT have 'position'.
                                            Maybe 'position' maps to 'department' or it's missing in type definition?
                                            Or maybe 'role' IS the position? But role is enum.
                                            I'll assume 'department' is correct. 
                                            For 'position', I will ignore it in display if it's missing in type, or check if I missed it.
                                            Actually, I'll allow creating with it (as per DTO) but maybe it's not in the view model.
                                            I'll just show 'department' and 'role'.
                                        */}
                                        <TableCell>{member.department || '-'}</TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className="bg-slate-100">{member.role}</Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Badge className={member.isActive ? "bg-green-100 text-green-700 hover:bg-green-100" : "bg-red-100 text-red-700"}>
                                                {member.isActive ? "Active" : "Inactive"}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" className="h-8 w-8 p-0">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                    <DropdownMenuItem>View Profile</DropdownMenuItem>
                                                    <DropdownMenuItem>Edit Details</DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem className="text-red-600">Deactivate</DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}

export default StaffPage;
