import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import BottomNav from "@/components/BottomNav";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link2, Mail, MessageSquare, Lock, User, Globe } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") || "";
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResults = async () => {
      if (!query.trim()) {
        setLoading(false);
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const { data } = await supabase
        .from("items")
        .select("*")
        .ilike("title", `%${query}%`)
        .order("updated_at", { ascending: false });

      setResults(data || []);
      setLoading(false);
    };

    fetchResults();
  }, [query]);

  const getCategoryInfo = (type: string) => {
    const categoryMap: any = {
      link: { title: "Links", icon: Link2, path: "/links", color: "text-blue-500" },
      email: { title: "Emails", icon: Mail, path: "/emails", color: "text-green-500" },
      message: { title: "Messages", icon: MessageSquare, path: "/messages", color: "text-purple-500" },
      password: { title: "Passwords", icon: Lock, path: "/passwords", color: "text-red-500" },
      contact: { title: "Contacts", icon: User, path: "/contacts", color: "text-orange-500" },
      weburl: { title: "Web URLs", icon: Globe, path: "/weburls", color: "text-cyan-500" },
    };
    return categoryMap[type] || { title: type, icon: Link2, path: "/", color: "text-gray-500" };
  };

  const categoryCounts = results.reduce((acc: any, item) => {
    acc[item.type] = (acc[item.type] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-background pb-20">
      <Navbar />
      
      <div className="container mx-auto px-4 py-6 space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-2 text-foreground">
            Search Results for "{query}"
          </h1>
          <p className="text-muted-foreground">
            Found {results.length} {results.length === 1 ? "item" : "items"}
          </p>
        </div>

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
        ) : results.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-muted-foreground">No results found</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-4 text-foreground">Categories</h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {Object.entries(categoryCounts).map(([type, count]: [string, any]) => {
                  const categoryInfo = getCategoryInfo(type);
                  const Icon = categoryInfo.icon;
                  return (
                    <Link key={type} to={categoryInfo.path}>
                      <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                          <CardTitle className="text-lg font-medium">{categoryInfo.title}</CardTitle>
                          <Icon className={`h-5 w-5 ${categoryInfo.color}`} />
                        </CardHeader>
                        <CardContent>
                          <div className="text-3xl font-bold">{count}</div>
                          <p className="text-xs text-muted-foreground mt-1">
                            {count === 1 ? "result" : "results"}
                          </p>
                        </CardContent>
                      </Card>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
      <BottomNav />
    </div>
  );
};

export default SearchResults;
