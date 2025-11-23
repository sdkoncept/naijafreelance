import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Bell, Shield, Lock, Trash2 } from "lucide-react";

export default function Settings() {
  const { user, signOut } = useAuth();
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    orders: true,
    messages: true,
  });

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Settings</h1>
        <p className="text-gray-600">Manage your account settings and preferences</p>
      </div>

      <div className="space-y-6">
        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notifications
            </CardTitle>
            <CardDescription>Manage how you receive notifications</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="email-notifications">Email Notifications</Label>
                <p className="text-sm text-gray-500">Receive notifications via email</p>
              </div>
              <Switch
                id="email-notifications"
                checked={notifications.email}
                onCheckedChange={(checked) =>
                  setNotifications({ ...notifications, email: checked })
                }
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="order-notifications">Order Updates</Label>
                <p className="text-sm text-gray-500">Get notified about order status changes</p>
              </div>
              <Switch
                id="order-notifications"
                checked={notifications.orders}
                onCheckedChange={(checked) =>
                  setNotifications({ ...notifications, orders: checked })
                }
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="message-notifications">Messages</Label>
                <p className="text-sm text-gray-500">Get notified when you receive messages</p>
              </div>
              <Switch
                id="message-notifications"
                checked={notifications.messages}
                onCheckedChange={(checked) =>
                  setNotifications({ ...notifications, messages: checked })
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Privacy & Security */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Privacy & Security
            </CardTitle>
            <CardDescription>Manage your privacy and security settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Password</Label>
              <p className="text-sm text-gray-500 mb-2">
                Change your password to keep your account secure
              </p>
              <Button variant="outline" asChild>
                <a href="/reset-password">Change Password</a>
              </Button>
            </div>
            <Separator />
            <div className="space-y-2">
              <Label>Profile Visibility</Label>
              <p className="text-sm text-gray-500">
                Your profile is public and visible to all users on the platform
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Account Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Account Actions
            </CardTitle>
            <CardDescription>Manage your account</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Sign Out</Label>
                <p className="text-sm text-gray-500">Sign out of your account</p>
              </div>
              <Button variant="outline" onClick={handleSignOut}>
                Sign Out
              </Button>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-red-600">Delete Account</Label>
                <p className="text-sm text-gray-500">Permanently delete your account and all data</p>
              </div>
              <Button variant="destructive" disabled>
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Account
              </Button>
            </div>
            <p className="text-xs text-gray-500">
              Account deletion feature coming soon
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

