"use client";

import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { selectUser } from '@/store/auth-slice';
import { getUsers, createUser, updateUser, deleteUser } from '@/lib/superadmin-service';
import { sitesService, Site } from '@/lib/sites-service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { Edit, Trash2 } from 'lucide-react';

interface UserData {
    id: string;
    name: string;
    email: string;
    role: string;
    site_id?: string;
    site?: {
        site_name: string;
        state: string;
    };
}

export default function UsersPage() {
    const user = useSelector(selectUser);
    const router = useRouter();
    const [users, setUsers] = useState<UserData[]>([]);
    const [sites, setSites] = useState<Site[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedRole, setSelectedRole] = useState<string>('');
    const [editingUser, setEditingUser] = useState<UserData | null>(null);
    const [editSelectedRole, setEditSelectedRole] = useState<string>('');
    const { toast } = useToast();

    // Check if user is superadmin
    useEffect(() => {
        if (user && user.role !== 'superadmin') {
            router.push('/dashboard');
            return;
        }
    }, [user, router]);

    // Don't render if not superadmin
    if (!user || user.role !== 'superadmin') {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    const fetchUsers = async () => {
        try {
            const response = await getUsers();
            // Handle the new response format: {success: true, data: [...]}
            const usersData = response.data?.data || response.data || [];
            setUsers(Array.isArray(usersData) ? usersData : []);
        } catch (error) {
            console.error('Error fetching users:', error);
            setUsers([]); // Ensure users is always an array
            toast({
                title: 'Error',
                description: 'Failed to fetch users.',
                variant: 'destructive',
            });
        }
    };

    const fetchSites = async () => {
        try {
            const response = await sitesService.getSites(1, 100); // Get all sites
            setSites(response.data || []);
        } catch (error) {
            console.error('Error fetching sites:', error);
            setSites([]);
            toast({
                title: 'Error',
                description: 'Failed to fetch sites.',
                variant: 'destructive',
            });
        }
    };

    useEffect(() => {
        fetchUsers();
        fetchSites();
    }, []);

    const handleCreateUser = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const newUser = Object.fromEntries(formData.entries());

        // Validate supervisor role has site_id
        if (newUser.role === 'supervisor' && !newUser.site_id) {
            toast({
                title: 'Error',
                description: 'Please select a site for supervisor role.',
                variant: 'destructive',
            });
            return;
        }

        try {
            await createUser(newUser);
            toast({
                title: 'Success',
                description: 'User created successfully.',
            });
            fetchUsers();
            setIsModalOpen(false);
            setSelectedRole(''); // Reset selected role
        } catch (error: any) {
            console.error('Error creating user:', error);
            toast({
                title: 'Error',
                description: error.response?.data?.message || error.response?.data?.msg || 'Failed to create user.',
                variant: 'destructive',
            });
        }
    };

    const handleModalClose = (open: boolean) => {
        setIsModalOpen(open);
        if (!open) {
            setSelectedRole(''); // Reset selected role when modal closes
        }
    };

    const handleEditModalClose = (open: boolean) => {
        setIsEditModalOpen(open);
        if (!open) {
            setEditingUser(null);
            setEditSelectedRole('');
        }
    };

    const handleEditUser = (user: UserData) => {
        setEditingUser(user);
        setEditSelectedRole(user.role);
        setIsEditModalOpen(true);
    };

    const handleUpdateUser = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!editingUser) return;

        const formData = new FormData(event.currentTarget);
        const userData = Object.fromEntries(formData.entries());

        // Validate supervisor role has site_id
        if (userData.role === 'supervisor' && !userData.site_id) {
            toast({
                title: 'Error',
                description: 'Please select a site for supervisor role.',
                variant: 'destructive',
            });
            return;
        }

        try {
            await updateUser(editingUser.id, userData);
            toast({
                title: 'Success',
                description: 'User updated successfully.',
            });
            fetchUsers();
            setIsEditModalOpen(false);
            setEditingUser(null);
            setEditSelectedRole('');
        } catch (error: any) {
            console.error('Error updating user:', error);
            toast({
                title: 'Error',
                description: error.response?.data?.message || 'Failed to update user.',
                variant: 'destructive',
            });
        }
    };

    const handleDeleteUser = async (userId: string, userName: string) => {
        if (!confirm(`Are you sure you want to delete user "${userName}"? This action cannot be undone.`)) {
            return;
        }

        try {
            await deleteUser(userId);
            toast({
                title: 'Success',
                description: 'User deleted successfully.',
            });
            fetchUsers();
        } catch (error: any) {
            console.error('Error deleting user:', error);
            toast({
                title: 'Error',
                description: error.response?.data?.message || 'Failed to delete user.',
                variant: 'destructive',
            });
        }
    };

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">User Management</h1>
            <Dialog open={isModalOpen} onOpenChange={handleModalClose}>
                <DialogTrigger asChild>
                    <Button>Add New User</Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add New User</DialogTitle>
                        <DialogDescription>
                            Create a new admin or supervisor.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleCreateUser}>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="name" className="text-right">Name</Label>
                                <Input id="name" name="name" className="col-span-3" required />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="email" className="text-right">Email</Label>
                                <Input id="email" name="email" type="email" className="col-span-3" required />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="password" className="text-right">Password</Label>
                                <Input id="password" name="password" type="password" className="col-span-3" required />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="role" className="text-right">Role</Label>
                                <Select name="role" value={selectedRole} onValueChange={setSelectedRole} required>
                                    <SelectTrigger className="col-span-3">
                                        <SelectValue placeholder="Select a role" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="admin">Admin</SelectItem>
                                        <SelectItem value="supervisor">Supervisor</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            
                            {/* Conditional Site Selection for Supervisor */}
                            {selectedRole === 'supervisor' && (
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="site_id" className="text-right">Site</Label>
                                    <Select name="site_id" required>
                                        <SelectTrigger className="col-span-3">
                                            <SelectValue placeholder="Select a site" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {sites.map((site) => (
                                                <SelectItem key={site.site_id} value={site.site_id}>
                                                    {site.site_name} - {site.state}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}
                        </div>
                        <DialogFooter>
                            <Button type="submit">Create User</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Edit User Modal */}
            <Dialog open={isEditModalOpen} onOpenChange={handleEditModalClose}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit User</DialogTitle>
                        <DialogDescription>
                            Update user information.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleUpdateUser}>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="edit-name" className="text-right">Name</Label>
                                <Input
                                    id="edit-name"
                                    name="name"
                                    className="col-span-3"
                                    defaultValue={editingUser?.name || ''}
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="edit-email" className="text-right">Email</Label>
                                <Input
                                    id="edit-email"
                                    name="email"
                                    type="email"
                                    className="col-span-3"
                                    defaultValue={editingUser?.email || ''}
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="edit-password" className="text-right">Password</Label>
                                <Input
                                    id="edit-password"
                                    name="password"
                                    type="password"
                                    className="col-span-3"
                                    placeholder="Leave blank to keep current password"
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="edit-role" className="text-right">Role</Label>
                                <Select name="role" value={editSelectedRole} onValueChange={setEditSelectedRole} required>
                                    <SelectTrigger className="col-span-3">
                                        <SelectValue placeholder="Select a role" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="admin">Admin</SelectItem>
                                        <SelectItem value="supervisor">Supervisor</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            
                            {/* Conditional Site Selection for Supervisor */}
                            {editSelectedRole === 'supervisor' && (
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="edit-site_id" className="text-right">Site</Label>
                                    <Select name="site_id" defaultValue={editingUser?.site_id || ''} required>
                                        <SelectTrigger className="col-span-3">
                                            <SelectValue placeholder="Select a site" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {sites.map((site) => (
                                                <SelectItem key={site.site_id} value={site.site_id}>
                                                    {site.site_name} - {site.state}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}
                        </div>
                        <DialogFooter>
                            <Button type="submit">Update User</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <div className="mt-6">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead>Site</TableHead>
                            <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {users.map((user: UserData) => (
                            <TableRow key={user.id}>
                                <TableCell>{user.name}</TableCell>
                                <TableCell>{user.email}</TableCell>
                                <TableCell>
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                        user.role === 'admin'
                                            ? 'bg-blue-100 text-blue-800'
                                            : 'bg-green-100 text-green-800'
                                    }`}>
                                        {user.role}
                                    </span>
                                </TableCell>
                                <TableCell>
                                    {user.role === 'supervisor' ? (
                                        user.site ? (
                                            <span className="text-sm">
                                                {user.site.site_name} - {user.site.state}
                                            </span>
                                        ) : (
                                            <span className="text-sm text-gray-500">
                                                {user.site_id || 'No site assigned'}
                                            </span>
                                        )
                                    ) : (
                                        <span className="text-sm text-gray-400">N/A</span>
                                    )}
                                </TableCell>
                                <TableCell>
                                    <div className="flex space-x-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleEditUser(user)}
                                            className="h-8 w-8 p-0"
                                        >
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleDeleteUser(user.id, user.name)}
                                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}