import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import BottomNav from "@/components/BottomNav";
import AddItemDialog from "@/components/AddItemDialog";
import ItemCard from "@/components/ItemCard";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

interface Item {
  id: string;
  title: string;
  content: string;
  created_at: string;
}

const Passwords = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchItems = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("items")
        .select("*")
        .eq("type", "password")
        .order("created_at", { ascending: false });

      if (error) throw error;

      setItems(data || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch passwords",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Passwords</h1>
          <AddItemDialog type="password" onSuccess={fetchItems} />
        </div>

        {loading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-32" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-24" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : items.length === 0 ? (
          <p className="text-center text-muted-foreground">No passwords yet. Add your first password!</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => (
              <ItemCard
                key={item.id}
                id={item.id}
                title={item.title}
                content={item.content}
                createdAt={item.created_at}
                onDelete={fetchItems}
              />
            ))}
          </div>
        )}
      </div>
      <BottomNav />
    </div>
  );
};

export default Passwords;