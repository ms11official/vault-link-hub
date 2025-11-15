import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import BottomNav from "@/components/BottomNav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link2, Mail, MessageSquare, Lock, User, Globe, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

const Categories = () => {
  const [stats, setStats] = useState({
    links: 0,
    emails: 0,
    messages: 0,
    passwords: 0,
    contacts: 0,
    weburls: 0,
  });
  const [customCategories, setCustomCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newCategory, setNewCategory] = useState({ name: "", icon: "" });
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return;
    }

    // Fetch default categories stats
    const types = ["link", "email", "message", "password", "contact", "weburl"];
    const counts: any = {};

    for (const type of types) {
      const { count } = await supabase
        .from("items")
        .select("*", { count: "exact", head: true })
        .eq("type", type);
      
      counts[type + "s"] = count || 0;
    }

    setStats(counts);

    // Fetch custom categories
    const { data: categories } = await supabase
      .from("categories")
      .select("*")
      .order("created_at", { ascending: false });

    setCustomCategories(categories || []);
    setLoading(false);
  };

  const createCategory = async () => {
    if (!newCategory.name.trim()) {
      toast({
        title: "Error",
        description: "Please enter a category name",
        variant: "destructive",
      });
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from("categories").insert({
      user_id: user.id,
      name: newCategory.name,
      icon: newCategory.icon || "FolderOpen",
    });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to create category",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Success",
      description: "Category created successfully",
    });

    setNewCategory({ name: "", icon: "" });
    setOpen(false);
    fetchData();
  };

  const defaultCategories = [
    { title: "Links", icon: Link2, count: stats.links, path: "/links", color: "text-blue-500" },
    { title: "Emails", icon: Mail, count: stats.emails, path: "/emails", color: "text-green-500" },
    { title: "Messages", icon: MessageSquare, count: stats.messages, path: "/messages", color: "text-purple-500" },
    { title: "Passwords", icon: Lock, count: stats.passwords, path: "/passwords", color: "text-red-500" },
    { title: "Contacts", icon: User, count: stats.contacts, path: "/contacts", color: "text-orange-500" },
    { title: "Web URLs", icon: Globe, count: stats.weburls, path: "/weburls", color: "text-cyan-500" },
  ];

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Categories</h1>
            <p className="text-muted-foreground">Manage your storage categories</p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Category
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Category</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Category Name</Label>
                  <Input
                    id="name"
                    value={newCategory.name}
                    onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                    placeholder="Enter category name"
                  />
                </div>
                <div>
                  <Label htmlFor="icon">Icon Name (optional)</Label>
                  <Input
                    id="icon"
                    value={newCategory.icon}
                    onChange={(e) => setNewCategory({ ...newCategory, icon: e.target.value })}
                    placeholder="e.g., FolderOpen"
                  />
                </div>
                <Button onClick={createCategory} className="w-full">
                  Create
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold mb-4">Default Categories</h2>
            {loading ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {[...Array(6)].map((_, i) => (
                  <Card key={i}>
                    <CardHeader>
                      <Skeleton className="h-6 w-32" />
                    </CardHeader>
                    <CardContent>
                      <Skeleton className="h-10 w-20 mb-2" />
                      <Skeleton className="h-4 w-24" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {defaultCategories.map((category) => {
                  const Icon = category.icon;
                  return (
                    <Link key={category.path} to={category.path}>
                      <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                          <CardTitle className="text-lg font-medium">{category.title}</CardTitle>
                          <Icon className={`h-5 w-5 ${category.color}`} />
                        </CardHeader>
                        <CardContent>
                          <div className="text-3xl font-bold">{category.count}</div>
                          <p className="text-xs text-muted-foreground mt-1">
                            {category.count === 1 ? "item" : "items"} stored
                          </p>
                        </CardContent>
                      </Card>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {customCategories.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Custom Categories</h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {customCategories.map((category) => (
                  <Card key={category.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-lg font-medium">{category.name}</CardTitle>
                      <Globe className="h-5 w-5 text-primary" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold">0</div>
                      <p className="text-xs text-muted-foreground mt-1">items stored</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      <BottomNav />
    </div>
  );
};

export default Categories;