import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { Search, UserCheck, UserX } from "lucide-react";

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: "active" | "blocked";
  joinedDate: string;
  address: string;
  city: string;
  country: string;
}

const dummyUsers: User[] = [
  { id: "1", name: "John Doe", email: "john@example.com", phone: "+1234567890", status: "active", joinedDate: "2024-01-15", address: "123 Main St", city: "New York", country: "USA" },
  { id: "2", name: "Jane Smith", email: "jane@example.com", phone: "+1234567891", status: "active", joinedDate: "2024-02-20", address: "456 Oak Ave", city: "Los Angeles", country: "USA" },
  { id: "3", name: "Bob Johnson", email: "bob@example.com", phone: "+1234567892", status: "blocked", joinedDate: "2024-03-10", address: "789 Pine Rd", city: "Chicago", country: "USA" },
];

export default function UserManagement() {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const storedUsers = localStorage.getItem("users");
    if (storedUsers) {
      setUsers(JSON.parse(storedUsers));
    } else {
      localStorage.setItem("users", JSON.stringify(dummyUsers));
      setUsers(dummyUsers);
    }
  }, []);

  const saveUsers = (updatedUsers: User[]) => {
    localStorage.setItem("users", JSON.stringify(updatedUsers));
    setUsers(updatedUsers);
  };

  const toggleUserStatus = (userId: string) => {
    const updatedUsers = users.map(user =>
      user.id === userId
        ? { ...user, status: (user.status === "active" ? "blocked" : "active") as "active" | "blocked" }
        : user
    );
    saveUsers(updatedUsers);
    toast({
      title: "User status updated",
      description: `User has been ${updatedUsers.find(u => u.id === userId)?.status === "blocked" ? "blocked" : "unblocked"}`,
    });
  };

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">User Management</h1>
        <p className="text-muted-foreground">Manage users, view details, and control access</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Users</CardTitle>
          <CardDescription>Search and manage user accounts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.phone}</TableCell>
                  <TableCell>
                    <Badge variant={user.status === "active" ? "default" : "destructive"}>
                      {user.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{user.joinedDate}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => navigate(`/admin/users/${user.id}`)}
                      >
                        View Details
                      </Button>
                      <Button
                        size="sm"
                        variant={user.status === "active" ? "destructive" : "default"}
                        onClick={() => toggleUserStatus(user.id)}
                      >
                        {user.status === "active" ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                      </Button>
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
