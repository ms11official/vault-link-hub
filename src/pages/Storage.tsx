import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import BottomNav from "@/components/BottomNav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { HardDrive, TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

const Storage = () => {
  const [storage, setStorage] = useState({ used: 0, limit: 52428800 }); // 50MB default
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchStorage();
  }, []);

  const fetchStorage = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return;
    }

    const { data } = await supabase
      .from("storage_usage")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (data) {
      setStorage({ used: data.used_bytes, limit: data.limit_bytes });
    } else {
      // Create initial storage record
      await supabase.from("storage_usage").insert({
        user_id: user.id,
        used_bytes: 0,
        limit_bytes: 52428800,
      });
    }
    setLoading(false);
  };

  const formatBytes = (bytes: number) => {
    return (bytes / (1024 * 1024)).toFixed(2);
  };

  const usagePercentage = (storage.used / storage.limit) * 100;

  const upgradePlans = [
    { size: "100 MB", bytes: 104857600, price: "$2.99/month" },
    { size: "150 MB", bytes: 157286400, price: "$4.99/month" },
    { size: "200 MB", bytes: 209715200, price: "$6.99/month" },
    { size: "250 MB", bytes: 262144000, price: "$8.99/month" },
    { size: "500 MB", bytes: 524288000, price: "$14.99/month" },
    { size: "1 GB", bytes: 1073741824, price: "$24.99/month" },
  ];

  const upgradeStorage = async (newLimit: number) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from("storage_usage")
      .update({ limit_bytes: newLimit })
      .eq("user_id", user.id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to upgrade storage",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Success",
      description: "Storage upgraded successfully!",
    });

    fetchStorage();
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="container mx-auto px-4 py-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Storage</h1>
          <p className="text-muted-foreground">Manage your storage space</p>
        </div>

        {loading ? (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-40" />
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          </div>
        ) : (
          <>
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HardDrive className="h-5 w-5" />
                  Current Storage Usage
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Used: {formatBytes(storage.used)} MB</span>
                    <span>Total: {formatBytes(storage.limit)} MB</span>
                  </div>
                  <Progress value={usagePercentage} className="h-3" />
                  <p className="text-xs text-muted-foreground">
                    {usagePercentage.toFixed(1)}% used
                  </p>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm font-medium">Available Space</p>
                  <p className="text-2xl font-bold">
                    {formatBytes(storage.limit - storage.used)} MB
                  </p>
                </div>
              </CardContent>
            </Card>

            <div>
              <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                <TrendingUp className="h-6 w-6" />
                Upgrade Plans
              </h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {upgradePlans.map((plan) => (
                  <Card
                    key={plan.size}
                    className={`hover:shadow-lg transition-shadow ${
                      storage.limit === plan.bytes ? "border-primary" : ""
                    }`}
                  >
                    <CardHeader>
                      <CardTitle className="text-xl">{plan.size}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <p className="text-3xl font-bold">{plan.price}</p>
                        <p className="text-xs text-muted-foreground mt-1">per month</p>
                      </div>
                      <Button
                        onClick={() => upgradeStorage(plan.bytes)}
                        disabled={storage.limit >= plan.bytes}
                        className="w-full"
                        variant={storage.limit === plan.bytes ? "secondary" : "default"}
                      >
                        {storage.limit === plan.bytes ? "Current Plan" : "Upgrade"}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
      <BottomNav />
    </div>
  );
};

export default Storage;