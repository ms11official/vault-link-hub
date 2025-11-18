import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import BottomNav from "@/components/BottomNav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Mail, Calendar, Shield, LogOut, FileText, Lock } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

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

  const getInitials = (email: string) => {
    return email.substring(0, 2).toUpperCase();
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="container mx-auto px-4 py-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Profile</h1>
          <p className="text-muted-foreground">Your account information</p>
        </div>

        {loading ? (
          <div className="space-y-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center space-y-4">
                  <Skeleton className="h-24 w-24 rounded-full" />
                  <Skeleton className="h-6 w-48" />
                  <Skeleton className="h-4 w-32" />
                </div>
              </CardContent>
            </Card>
            <div className="grid gap-4 md:grid-cols-2">
              {[...Array(3)].map((_, i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-6 w-32" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-4 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ) : user ? (
          <>
            <Card className="mb-8">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center space-y-4">
                  <Avatar className="h-24 w-24">
                    <AvatarFallback className="text-2xl">
                      {getInitials(user.email || "")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="text-center">
                    <h2 className="text-2xl font-bold">{user.email}</h2>
                    <p className="text-sm text-muted-foreground">User ID: {user.id}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Mail className="h-5 w-5" />
                    Email
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">{user.email}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {user.email_confirmed_at ? "Verified" : "Not verified"}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Calendar className="h-5 w-5" />
                    Member Since
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">
                    {new Date(user.created_at).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Shield className="h-5 w-5" />
                    Security
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">Last sign in</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {user.last_sign_in_at
                      ? new Date(user.last_sign_in_at).toLocaleString()
                      : "Never"}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Shield className="h-5 w-5" />
                    Account Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm font-medium text-green-500">Active</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Account is in good standing
                  </p>
                </CardContent>
              </Card>
            </div>

            <Button
              onClick={handleLogout}
              variant="destructive"
              className="w-full mt-6"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>

            <div className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Legal</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button
                    onClick={() => navigate("/privacy")}
                    variant="outline"
                    className="w-full justify-start"
                  >
                    <Lock className="h-4 w-4 mr-2" />
                    Privacy Policy
                  </Button>
                  <Button
                    onClick={() => navigate("/terms")}
                    variant="outline"
                    className="w-full justify-start"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Terms & Conditions
                  </Button>
                </CardContent>
              </Card>
            </div>
          </>
        ) : (
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-muted-foreground">Please log in to view your profile</p>
            </CardContent>
          </Card>
        )}
      </div>
      <BottomNav />
    </div>
  );
};

export default Profile;