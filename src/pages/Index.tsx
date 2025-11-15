import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import BottomNav from "@/components/BottomNav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link2, Mail, MessageSquare, Lock, User, Globe } from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
  const [stats, setStats] = useState({
    links: 0,
    emails: 0,
    messages: 0,
    passwords: 0,
    contacts: 0,
    weburls: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

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
    };

    fetchStats();
  }, []);

  const categories = [
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
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Secure Vault</h1>
          <p className="text-muted-foreground">Store and manage your important information securely</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => {
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
      </div>
      <BottomNav />
    </div>
  );
};

export default Index;
