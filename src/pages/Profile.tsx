import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import MainLayout from "@/components/MainLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Mail, Calendar, Shield, LogOut, FileText, Lock, CheckCircle, Clock } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";
import EditProfileDialog from "@/components/EditProfileDialog";
import UserToolsSection from "@/components/UserToolsSection";

const Profile = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
    setLoading(false);
  };

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      toast({
        title: "Success",
        description: "Logged out successfully",
      });

      navigate("/auth");
    } catch (error: any) {
      console.error('Logout error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to logout",
        variant: "destructive",
      });
    }
  };

  const getInitials = (email: string, name?: string) => {
    if (name) {
      return name.substring(0, 2).toUpperCase();
    }
    return email.substring(0, 2).toUpperCase();
  };

  const userName = user?.user_metadata?.name;
  const userAvatar = user?.user_metadata?.avatar;
  const userAvatarUrl = user?.user_metadata?.avatar_url;

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {loading ? (
          <div className="space-y-6">
            <div className="flex items-center gap-6">
              <Skeleton className="h-28 w-28 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-8 w-64" />
                <Skeleton className="h-4 w-32" />
              </div>
            </div>
            <Skeleton className="h-48 w-full rounded-xl" />
          </div>
        ) : user ? (
          <div className="space-y-8">
            {/* Profile Header */}
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
              <div className="relative">
                <Avatar className="h-28 w-28 ring-4 ring-primary/10">
                  {userAvatarUrl && (
                    <AvatarImage src={userAvatarUrl} alt="Profile" className="object-cover" />
                  )}
                  <AvatarFallback className="text-3xl font-bold bg-gradient-to-br from-primary to-primary/60 text-primary-foreground">
                    {userAvatar || getInitials(user.email || "", userName)}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-1 -right-1 bg-green-500 h-6 w-6 rounded-full border-4 border-background flex items-center justify-center">
                  <CheckCircle className="h-3 w-3 text-white" />
                </div>
              </div>
              <div className="text-center md:text-left flex-1">
                <h1 className="text-2xl md:text-3xl font-bold">{userName || user.email}</h1>
                {userName && <p className="text-muted-foreground">{user.email}</p>}
                <p className="text-muted-foreground mt-1 flex items-center justify-center md:justify-start gap-2">
                  <Shield className="h-4 w-4" />
                  Active Account
                </p>
                <div className="flex flex-wrap gap-2 mt-4 justify-center md:justify-start">
                  <span className="px-3 py-1 bg-primary/10 text-primary text-sm rounded-full font-medium">
                    Free Plan
                  </span>
                  <span className="px-3 py-1 bg-green-500/10 text-green-600 text-sm rounded-full font-medium flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" />
                    Verified
                  </span>
                </div>
              </div>
              <EditProfileDialog user={user} onProfileUpdated={fetchUser} />
            </div>

            {/* Info Cards */}
            <div className="grid gap-4 md:grid-cols-2">
              <Card className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="p-5 bg-gradient-to-r from-blue-500/10 to-transparent">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                        <Mail className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Email Address</p>
                        <p className="font-semibold">{user.email}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="p-5 bg-gradient-to-r from-purple-500/10 to-transparent">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                        <Calendar className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Member Since</p>
                        <p className="font-semibold">
                          {new Date(user.created_at).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="p-5 bg-gradient-to-r from-green-500/10 to-transparent">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                        <Shield className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Account Status</p>
                        <p className="font-semibold text-green-600">Active & Secure</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="p-5 bg-gradient-to-r from-orange-500/10 to-transparent">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-orange-500/20 flex items-center justify-center">
                        <Clock className="h-5 w-5 text-orange-600" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Last Sign In</p>
                        <p className="font-semibold">
                          {user.last_sign_in_at
                            ? new Date(user.last_sign_in_at).toLocaleString("en-US", {
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                            : "Never"}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* User Tools Section */}
            <UserToolsSection userId={user.id} />

            {/* Legal Section */}
            <Card>
              <CardContent className="p-5">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Legal & Policies
                </h3>
                <div className="space-y-2">
                  <Button
                    onClick={() => navigate("/privacy")}
                    variant="ghost"
                    className="w-full justify-start h-12 hover:bg-muted"
                  >
                    <Lock className="h-4 w-4 mr-3 text-muted-foreground" />
                    <span>Privacy Policy</span>
                  </Button>
                  <Separator />
                  <Button
                    onClick={() => navigate("/terms")}
                    variant="ghost"
                    className="w-full justify-start h-12 hover:bg-muted"
                  >
                    <FileText className="h-4 w-4 mr-3 text-muted-foreground" />
                    <span>Terms & Conditions</span>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Logout Button */}
            <Button
              onClick={handleLogout}
              variant="destructive"
              className="w-full h-12 text-base font-semibold"
            >
              <LogOut className="mr-2 h-5 w-5" />
              Sign Out
            </Button>
          </div>
        ) : (
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-muted-foreground">Please log in to view your profile</p>
            </CardContent>
          </Card>
        )}
      </div>
    </MainLayout>
  );
};

export default Profile;