import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trash2, Pencil } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAuditLog } from "@/hooks/use-audit-log";

const editUserSchema = z.object({
  full_name: z.string().trim().min(1, "Name is required").max(100, "Name must be less than 100 characters"),
  email: z.string().trim().email("Invalid email address").max(255, "Email must be less than 255 characters"),
});

type UserType = "freelancer" | "client" | "admin";

interface UserWithRole {
  id: string;
  email: string;
  full_name: string;
  user_type: UserType | null;
  created_at: string;
}

type EditUserForm = z.infer<typeof editUserSchema>;

export default function UserManagement() {
  const { userRole, user } = useAuth();
  const navigate = useNavigate();
  const { logAction } = useAuditLog();
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState<UserWithRole | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const { register, handleSubmit, formState: { errors }, reset } = useForm<EditUserForm>({
    resolver: zodResolver(editUserSchema),
  });

  useEffect(() => {
    if (userRole !== "admin") {
      navigate("/");
      toast.error("Access denied. Admin privileges required.");
      return;
    }
    fetchUsers();
  }, [userRole, navigate]);

  const fetchUsers = async () => {
    try {
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (profilesError) throw profilesError;

      const usersWithRoles = profiles?.map(profile => {
        return {
          id: profile.id,
          email: profile.email || "",
          full_name: profile.full_name,
          user_type: (profile.user_type as UserType) || "client",
          created_at: profile.created_at,
        };
      }) || [];

      setUsers(usersWithRoles);
    } catch (error: any) {
      toast.error("Failed to load users: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const updateUserType = async (userId: string, newUserType: UserType) => {
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ user_type: newUserType })
        .eq("id", userId);

      if (error) throw error;

      await logAction({
        action: "role_change",
        table_name: "profiles",
        record_id: userId,
        old_data: { user_type: users.find(u => u.id === userId)?.user_type },
        new_data: { user_type: newUserType },
      });

      toast.success("User type updated successfully");
      fetchUsers();
    } catch (error: any) {
      toast.error("Failed to update user type: " + error.message);
    }
  };

  const openEditDialog = (userData: UserWithRole) => {
    setEditingUser(userData);
    reset({
      full_name: userData.full_name,
      email: userData.email,
    });
    setIsEditDialogOpen(true);
  };

  const onEditSubmit = async (data: EditUserForm) => {
    if (!editingUser) return;

    try {
      const oldData = {
        full_name: editingUser.full_name,
        email: editingUser.email,
      };

      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: data.full_name,
          email: data.email,
        })
        .eq("id", editingUser.id);

      if (error) throw error;

      await logAction({
        action: "enrollee_update",
        table_name: "profiles",
        record_id: editingUser.id,
        old_data: oldData,
        new_data: data,
      });

      toast.success("User details updated successfully");
      setIsEditDialogOpen(false);
      fetchUsers();
    } catch (error: any) {
      toast.error("Failed to update user: " + error.message);
    }
  };

  const deleteUser = async (userId: string) => {
    if (userId === user?.id) {
      toast.error("You cannot delete your own account");
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('delete-user', {
        body: { userId }
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      toast.success("User deleted successfully");
      fetchUsers();
    } catch (error: any) {
      toast.error("Failed to delete user: " + error.message);
    }
  };

  const getUserTypeBadgeVariant = (userType: UserType) => {
    switch (userType) {
      case "admin":
        return "destructive";
      case "freelancer":
        return "default";
      case "client":
        return "secondary";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>User Management</CardTitle>
          <CardDescription>
            Manage user types and permissions. Admin has full access to all features.
            Freelancers can create gigs and manage their services. Clients can browse and place orders.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>User Type</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((userData) => (
                <TableRow key={userData.id}>
                  <TableCell className="font-medium">
                    {userData.full_name || <span className="text-muted-foreground italic">No name set</span>}
                  </TableCell>
                  <TableCell>{userData.email}</TableCell>
                  <TableCell>
                    <Select
                      value={userData.user_type || "client"}
                      onValueChange={(value) => updateUserType(userData.id, value as UserType)}
                      disabled={userData.id === user?.id}
                    >
                      <SelectTrigger className="w-36">
                        <SelectValue>
                          <Badge variant={getUserTypeBadgeVariant(userData.user_type || "client")}>
                            {userData.user_type || "client"}
                          </Badge>
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="freelancer">Freelancer</SelectItem>
                        <SelectItem value="client">Client</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    {new Date(userData.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEditDialog(userData)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Edit User Details</DialogTitle>
                            <DialogDescription>
                              Update user information. Changes will be saved immediately.
                            </DialogDescription>
                          </DialogHeader>
                          <form onSubmit={handleSubmit(onEditSubmit)}>
                            <div className="grid gap-4 py-4">
                              <div className="grid gap-2">
                                <Label htmlFor="full_name">Full Name</Label>
                                <Input
                                  id="full_name"
                                  {...register("full_name")}
                                  placeholder="Enter full name"
                                />
                                {errors.full_name && (
                                  <p className="text-sm text-destructive">{errors.full_name.message}</p>
                                )}
                              </div>
                              <div className="grid gap-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                  id="email"
                                  type="email"
                                  {...register("email")}
                                  placeholder="Enter email address"
                                />
                                {errors.email && (
                                  <p className="text-sm text-destructive">{errors.email.message}</p>
                                )}
                              </div>
                            </div>
                            <DialogFooter>
                              <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                                Cancel
                              </Button>
                              <Button type="submit">Save Changes</Button>
                            </DialogFooter>
                          </form>
                        </DialogContent>
                      </Dialog>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            disabled={userData.id === user?.id}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete User</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete {userData.full_name}? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => deleteUser(userData.id)}>
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
