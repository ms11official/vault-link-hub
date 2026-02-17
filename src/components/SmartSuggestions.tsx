import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2, RefreshCw } from "lucide-react";
import { callAI } from "@/lib/ai";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

interface Suggestion {
  title: string;
  description: string;
  action: string;
  category?: string;
}

const SmartSuggestions = () => {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasKeys, setHasKeys] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const check = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from("user_api_keys")
        .select("id")
        .eq("user_id", user.id)
        .eq("is_active", true)
        .limit(1);
      setHasKeys((data?.length ?? 0) > 0);
    };
    check();
  }, []);

  const fetchSuggestions = async () => {
    setLoading(true);
    try {
      const { data: items } = await supabase
        .from("items")
        .select("title, type, updated_at")
        .order("updated_at", { ascending: false })
        .limit(30);

      if (!items || items.length === 0) {
        setSuggestions([{
          title: "Start Adding Items",
          description: "Add your first link, email, or password to get personalized suggestions.",
          action: "add",
        }]);
        setLoading(false);
        return;
      }

      const typeCounts: Record<string, number> = {};
      items.forEach(i => { typeCounts[i.type] = (typeCounts[i.type] || 0) + 1; });

      const summary = Object.entries(typeCounts)
        .map(([t, c]) => `${t}: ${c}`)
        .join(", ");

      const recentTitles = items.slice(0, 10).map(i => i.title).join(", ");

      const { content, error } = await callAI({
        action: "smart-search",
        content: `Based on user usage patterns, suggest 3-4 smart actions. User has these items: ${summary}. Recent titles: ${recentTitles}. Return a JSON array of objects with keys: title, description, action (one of: organize, secure, review, cleanup, add), category (optional item type). Only return the JSON array, nothing else.`,
      });

      if (error) throw new Error(error);

      const match = content.match(/\[[\s\S]*\]/);
      if (match) {
        setSuggestions(JSON.parse(match[0]));
      }
    } catch {
      toast({ title: "AI Error", description: "Could not generate suggestions", variant: "destructive" });
    }
    setLoading(false);
  };

  if (!hasKeys) return null;

  const actionColors: Record<string, string> = {
    organize: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
    secure: "bg-red-500/10 text-red-600 dark:text-red-400",
    review: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400",
    cleanup: "bg-orange-500/10 text-orange-600 dark:text-orange-400",
    add: "bg-green-500/10 text-green-600 dark:text-green-400",
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <h2 className="text-2xl font-bold text-foreground">Smart Suggestions</h2>
        </div>
        <Button variant="outline" size="sm" onClick={fetchSuggestions} disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <RefreshCw className="h-4 w-4 mr-1" />}
          {suggestions.length ? "Refresh" : "Get Suggestions"}
        </Button>
      </div>

      {suggestions.length > 0 && (
        <div className="grid gap-3 md:grid-cols-2">
          {suggestions.map((s, i) => (
            <Card key={i} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center justify-between">
                  {s.title}
                  <Badge variant="outline" className={actionColors[s.action] || ""}>
                    {s.action}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">{s.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default SmartSuggestions;
