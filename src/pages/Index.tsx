import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import MainLayout from "@/components/MainLayout";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link2, Mail, MessageSquare, Lock, User, Globe, Clock, TrendingUp } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

const Index = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    links: 0,
    emails: 0,
    messages: 0,
    passwords: 0,
    contacts: 0,
    weburls: 0,
  });
  const [loading, setLoading] = useState(true);
  const [recentItems, setRecentItems] = useState<any[]>([]);
  const [recentCategories, setRecentCategories] = useState<any[]>([]);
  const [heroText, setHeroText] = useState(0);

  const heroTexts = [
    "Store and manage your important information securely",
    "End-to-end encryption for your peace of mind",
    "Access your data anywhere, anytime",
    "Organize everything in one secure place"
  ];

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const types = ["link", "email", "message", "password", "contact", "weburl"];
      const counts: any = {};

      for (const type of types) {
        const { count } = await supabase
          .from("items")
          .select("*", { count: "exact", head: true })
          .eq("type", type);
        
        counts[type + "s"] = count || 0;
      }

      // Fetch recent items
      const { data: recent } = await supabase
        .from("items")
        .select("*")
        .order("updated_at", { ascending: false })
        .limit(5);

      // Calculate recent categories
      const categoryMap = new Map();
      recent?.forEach(item => {
        const type = item.type + "s";
        if (!categoryMap.has(type)) {
          categoryMap.set(type, { type, count: 1, lastUsed: item.updated_at });
        } else {
          const existing = categoryMap.get(type);
          existing.count++;
        }
      });

      const recentCats = Array.from(categoryMap.entries())
        .map(([type, data]) => ({ type, ...data }))
        .sort((a, b) => new Date(b.lastUsed).getTime() - new Date(a.lastUsed).getTime())
        .slice(0, 3);

      setStats(counts);
      setRecentItems(recent || []);
      setRecentCategories(recentCats);
      setLoading(false);
    };

    fetchData();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setHeroText((prev) => (prev + 1) % heroTexts.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const categories = [
    { title: "Links", icon: Link2, count: stats.links, path: "/links", color: "text-blue-500" },
    { title: "Emails", icon: Mail, count: stats.emails, path: "/emails", color: "text-green-500" },
    { title: "Messages", icon: MessageSquare, count: stats.messages, path: "/messages", color: "text-purple-500" },
    { title: "Passwords", icon: Lock, count: stats.passwords, path: "/passwords", color: "text-red-500" },
    { title: "Contacts", icon: User, count: stats.contacts, path: "/contacts", color: "text-orange-500" },
    { title: "Web URLs", icon: Globe, count: stats.weburls, path: "/weburls", color: "text-cyan-500" },
  ];

  const totalItems = Object.values(stats).reduce((a: number, b: number) => a + b, 0);

  const handleSearch = (query: string) => {
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query)}`);
    }
  };

  return (
    <MainLayout>
      <Navbar onSearch={handleSearch} />
      
      <div className="container mx-auto px-4 py-6 space-y-8">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-background rounded-lg p-8 border border-border">
          <h1 className="text-4xl font-bold mb-2 text-foreground">Welcome to Databseplus</h1>
          <p className="text-muted-foreground text-lg transition-opacity duration-500">
            {heroTexts[heroText]}
          </p>
        </div>

        {/* Recent Categories */}
        {recentCategories.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold mb-4 text-foreground">Recently Used Categories</h2>
            <div className="grid gap-4 md:grid-cols-3">
              {recentCategories.map((cat) => {
                const categoryInfo = categories.find(c => c.path.includes(cat.type));
                if (!categoryInfo) return null;
                const Icon = categoryInfo.icon;
                return (
                  <Link key={cat.type} to={categoryInfo.path}>
                    <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-lg font-medium">{categoryInfo.title}</CardTitle>
                        <Icon className={`h-5 w-5 ${categoryInfo.color}`} />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{cat.count}</div>
                        <p className="text-xs text-muted-foreground mt-1">items recently used</p>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* Analytics Section */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Items</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalItems}</div>
              <p className="text-xs text-muted-foreground">Across all categories</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Most Used</CardTitle>
              <Lock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Math.max(...Object.values(stats).map(v => Number(v)))}
              </div>
              <p className="text-xs text-muted-foreground">In a single category</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Security Status</CardTitle>
              <Lock className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-500">Secure</div>
              <p className="text-xs text-muted-foreground">All data encrypted</p>
            </CardContent>
          </Card>
        </div>

        {/* Recently Used Section */}
        {recentItems.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Clock className="h-5 w-5 text-muted-foreground" />
              <h2 className="text-2xl font-bold text-foreground">Recently Used</h2>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {recentItems.map((item) => (
                <Card key={item.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="text-base flex items-center justify-between">
                      {item.title}
                      <Badge variant="secondary">{item.type}</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground truncate">{item.content}</p>
                    <p className="text-xs text-muted-foreground mt-2">
                      {new Date(item.updated_at).toLocaleDateString()}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* All Categories */}
        <div>
          <h2 className="text-2xl font-bold mb-4 text-foreground">All Categories</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {loading ? (
              [...Array(6)].map((_, i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-6 w-32" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-10 w-20 mb-2" />
                    <Skeleton className="h-4 w-24" />
                  </CardContent>
                </Card>
              ))
            ) : (
              categories.map((category) => {
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
              })
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Index;
