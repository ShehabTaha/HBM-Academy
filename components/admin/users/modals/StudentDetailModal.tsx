"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { User } from "@/types/users";
import { useUserDetails } from "@/hooks/useUsers";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  getProgressColor,
  getUserStatusColor,
  formatDate,
} from "@/utils/user-utils";
import { ShieldCheck, Mail } from "lucide-react";

interface StudentDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: User | null;
  onSuspend: () => void;
  onDelete: () => void;
}

export function StudentDetailModal({
  isOpen,
  onClose,
  student: initialUser,
  onSuspend,
  onDelete,
}: StudentDetailModalProps) {
  const {
    user: fullUser,
    enrollments,
    certificates,
    loginHistory,
  } = useUserDetails(isOpen && initialUser ? initialUser.id : null);

  const user = fullUser || initialUser;

  if (!user) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>User Profile</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={user.avatar || undefined} />
              <AvatarFallback className="text-xl">
                {user.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-2xl font-bold">{user.name}</h2>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Mail className="h-4 w-4" />
                {user.email}
                {user.is_email_verified && (
                  <Badge
                    variant="secondary"
                    className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100"
                  >
                    <ShieldCheck className="h-3 w-3 mr-1" /> Verified
                  </Badge>
                )}
              </div>
              <div className="mt-2 flex gap-2">
                <Badge className={getUserStatusColor(user.status)}>
                  {user.status}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  Joined {formatDate(user.created_at)}
                </span>
              </div>
            </div>
          </div>

          <Tabs defaultValue="overview">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="enrollments">
                Enrollments ({enrollments?.length || 0})
              </TabsTrigger>
              <TabsTrigger value="activity">Login History</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg">
                  <h3 className="font-semibold mb-2">Bio</h3>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {user.bio || "No bio provided."}
                  </p>
                </div>
                <div className="p-4 border rounded-lg">
                  <h3 className="font-semibold mb-2">
                    Certificates ({certificates?.length || 0})
                  </h3>
                  {certificates && certificates.length > 0 ? (
                    <ul className="space-y-2">
                      {certificates.map((c) => (
                        <li
                          key={c.id}
                          className="text-sm flex items-center gap-2"
                        >
                          <ShieldCheck className="h-4 w-4 text-amber-500" />
                          <span className="font-medium">{c.course_title}</span>
                          <span className="text-muted-foreground text-xs">
                            ({formatDate(c.issued_at)})
                          </span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No certificates earned yet.
                    </p>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="enrollments">
              <div className="space-y-4">
                {enrollments &&
                  enrollments.map((e) => (
                    <div
                      key={e.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div>
                        <h4 className="font-medium">{e.course_title}</h4>
                        <div className="text-xs text-muted-foreground">
                          Enrolled: {formatDate(e.enrolled_at)}
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="text-sm font-bold">
                            {e.progress_percentage}%
                          </div>
                          <div className="h-2 w-24 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full ${getProgressColor(e.progress_percentage)}`}
                              style={{ width: `${e.progress_percentage}%` }}
                            />
                          </div>
                        </div>
                        {e.completed_at ? (
                          <Badge>Completed</Badge>
                        ) : (
                          <Badge variant="outline">Active</Badge>
                        )}
                      </div>
                    </div>
                  ))}
                {(!enrollments || enrollments.length === 0) && (
                  <p className="text-muted-foreground text-center py-4">
                    No active enrollments.
                  </p>
                )}
              </div>
            </TabsContent>

            <TabsContent value="activity">
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="p-3 text-left">Seen</th>
                      <th className="p-3 text-left">IP Address</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loginHistory &&
                      loginHistory.map((log, i) => (
                        <tr key={i} className="border-t">
                          <td className="p-3">
                            {formatDate(log.timestamp)}{" "}
                            <span className="text-muted-foreground">
                              {new Date(log.timestamp).toLocaleTimeString()}
                            </span>
                          </td>
                          <td className="p-3 font-mono text-xs">
                            {log.ip_address || "Unknown"}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button
              variant="outline"
              className="text-amber-600 border-amber-200 hover:bg-amber-50"
              onClick={onSuspend}
            >
              Suspend Account
            </Button>
            <Button variant="destructive" onClick={onDelete}>
              Delete Account
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
