import { useState, useEffect } from "react";
import { Helmet } from "react-helmet";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { FaSearch, FaPlus, FaEdit, FaTrash, FaUserCheck } from "react-icons/fa";
import { useToast } from "@/hooks/use-toast";

interface UserData {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  children: number;
  registrationDate: string;
}

const UserManager = () => {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentTab, setCurrentTab] = useState("all");
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        // In a real app, this would fetch from Firebase
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulating API delay
        
        // Mock data
        const mockUsers: UserData[] = [
          {
            id: "1",
            name: "John Smith",
            email: "john.smith@example.com",
            role: "parent",
            status: "active",
            children: 2,
            registrationDate: "2023-01-15"
          },
          {
            id: "2",
            name: "Anna Johnson",
            email: "anna.j@example.com",
            role: "parent",
            status: "active",
            children: 1,
            registrationDate: "2023-02-20"
          },
          {
            id: "3",
            name: "Robert Davis",
            email: "robert.d@example.com",
            role: "parent",
            status: "pending",
            children: 3,
            registrationDate: "2023-03-05"
          },
          {
            id: "4",
            name: "Emily Wilson",
            email: "emily.w@example.com",
            role: "admin",
            status: "active",
            children: 0,
            registrationDate: "2022-11-10"
          },
          {
            id: "5",
            name: "Michael Brown",
            email: "m.brown@example.com",
            role: "parent",
            status: "inactive",
            children: 1,
            registrationDate: "2023-01-30"
          }
        ];
        
        setUsers(mockUsers);
      } catch (error) {
        console.error("Error fetching users:", error);
        toast({
          title: "Error",
          description: "Failed to load users. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [toast]);

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        user.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (currentTab === "all") return matchesSearch;
    if (currentTab === "parents") return user.role === "parent" && matchesSearch;
    if (currentTab === "admins") return user.role === "admin" && matchesSearch;
    if (currentTab === "active") return user.status === "active" && matchesSearch;
    if (currentTab === "pending") return user.status === "pending" && matchesSearch;
    return matchesSearch;
  });

  const handleEditUser = (user: UserData) => {
    setSelectedUser(user);
    setIsEditDialogOpen(true);
  };

  const handleDeleteUser = (userId: string) => {
    // In a real app, this would delete from Firebase
    toast({
      title: "User Deleted",
      description: "The user has been successfully deleted.",
    });
    setUsers(users.filter(user => user.id !== userId));
  };

  const handleVerifyUser = (userId: string) => {
    // In a real app, this would update user status in Firebase
    toast({
      title: "User Verified",
      description: "The user has been successfully verified.",
    });
    setUsers(users.map(user => 
      user.id === userId ? { ...user, status: "active" } : user
    ));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">User Management</h2>
          <p className="text-neutral-500">Manage parents and admin accounts</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400" />
            <Input 
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full sm:w-60"
            />
          </div>
          
          <Button className="flex items-center gap-2">
            <FaPlus size={14} />
            <span>Add User</span>
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue="all" value={currentTab} onValueChange={setCurrentTab}>
        <TabsList className="grid grid-cols-5 w-full max-w-2xl">
          <TabsTrigger value="all">All Users</TabsTrigger>
          <TabsTrigger value="parents">Parents</TabsTrigger>
          <TabsTrigger value="admins">Admins</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
        </TabsList>
        
        <TabsContent value={currentTab} className="mt-6">
          <Card>
            <CardContent className="pt-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Children</TableHead>
                    <TableHead>Registration Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.length > 0 ? (
                    filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Badge variant={user.role === "admin" ? "secondary" : "outline"}>
                            {user.role}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={
                            user.status === "active" ? "success" : 
                            user.status === "pending" ? "warning" : "default"
                          }>
                            {user.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{user.children}</TableCell>
                        <TableCell>{new Date(user.registrationDate).toLocaleDateString()}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            {user.status === "pending" && (
                              <Button 
                                variant="outline" 
                                size="icon" 
                                onClick={() => handleVerifyUser(user.id)}
                                title="Verify User"
                              >
                                <FaUserCheck className="h-4 w-4" />
                              </Button>
                            )}
                            <Button 
                              variant="outline" 
                              size="icon" 
                              onClick={() => handleEditUser(user)}
                              title="Edit User"
                            >
                              <FaEdit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="destructive" 
                              size="icon" 
                              onClick={() => handleDeleteUser(user.id)}
                              title="Delete User"
                            >
                              <FaTrash className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-neutral-500">
                        No users found matching your criteria
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Edit User Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Update user information and permissions
            </DialogDescription>
          </DialogHeader>
          
          {selectedUser && (
            <div className="space-y-4 py-4">
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" defaultValue={selectedUser.name} />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" defaultValue={selectedUser.email} />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="role">Role</Label>
                  <select 
                    id="role" 
                    defaultValue={selectedUser.role}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    <option value="parent">Parent</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="status">Status</Label>
                  <select 
                    id="status" 
                    defaultValue={selectedUser.status}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    <option value="active">Active</option>
                    <option value="pending">Pending</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter className="flex space-x-2 justify-end">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" onClick={() => {
              toast({
                title: "User Updated",
                description: "The user has been successfully updated.",
              });
              setIsEditDialogOpen(false);
            }}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserManager;