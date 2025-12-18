import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Trash2, Pencil, Eye } from "lucide-react";

interface User {
  _id: string;
  name: string;
  email: string;
  role: "viewer" | "editor" | "admin";
  isActive: boolean;
}

interface UsersTableProps {
  users: User[];
  currentUserId?: string;
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
  onViewPermissions: (user: User) => void;
}

export default function UsersTable({
  users,
  currentUserId,
  onEdit,
  onDelete,
  onViewPermissions,
}: UsersTableProps) {
  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-purple-500/20 text-purple-400 border-purple-500/30";
      case "editor":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  return (
    <Card>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                  Email
                </th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                  Display Name
                </th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                  Status
                </th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                  Roles
                </th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user._id} className="border-b hover:bg-muted/50">
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{user.email}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="text-sm font-medium">{user.name}</span>
                  </td>
                  <td className="p-4">
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        user.isActive
                          ? "bg-green-500/20 text-green-400 border border-green-500/30"
                          : "bg-gray-500/20 text-gray-400 border border-gray-500/30"
                      }`}
                    >
                      {user.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium border ${getRoleColor(
                          user.role
                        )}`}
                      >
                        {user.role}
                      </span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => onViewPermissions(user)}
                        title="View video permissions"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className={`h-8 w-8 ${
                          currentUserId === user._id
                            ? "opacity-40 cursor-not-allowed"
                            : ""
                        }`}
                        onClick={() => {
                          if (currentUserId !== user._id) {
                            onEdit(user);
                          }
                        }}
                        disabled={currentUserId === user._id}
                        title={
                          currentUserId === user._id
                            ? "Cannot edit your own account"
                            : "Edit user"
                        }
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className={`h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10 ${
                          currentUserId === user._id
                            ? "opacity-40 cursor-not-allowed"
                            : ""
                        }`}
                        onClick={() => {
                          if (currentUserId !== user._id) {
                            onDelete(user);
                          }
                        }}
                        disabled={currentUserId === user._id}
                        title={
                          currentUserId === user._id
                            ? "Cannot delete your own account"
                            : "Delete user"
                        }
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
