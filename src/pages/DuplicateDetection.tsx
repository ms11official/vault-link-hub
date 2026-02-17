import { useState } from "react";
import MainLayout from "@/components/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Loader2, Sparkles, Trash2, Eye, Copy, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { callAI } from "@/lib/ai";
import { useToast } from "@/hooks/use-toast";

interface DuplicateGroup {
  ids: string[];
  items: { id: string; title: string; content: string; type: string }[];
  reason?: string;
}

const DuplicateDetection = () => {
  const [scanning, setScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [groups, setGroups] = useState<DuplicateGroup[]>([]);
  const [scanned, setScanned] = useState(false);
  const { toast } = useToast();

  const scanForDuplicates = async () => {
    setScanning(true);
    setProgress(10);
    setGroups([]);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      setProgress(20);

      const { data: items, error } = await supabase
        .from("items")
        .select("id, title, content, type")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(200);

      if (error) throw error;
      if (!items || items.length < 2) {
        toast({ title: "Not enough items", description: "You need at least 2 items to scan for duplicates." });
        setScanning(false);
        setScanned(true);
        return;
      }

      setProgress(40);

      const itemList = items.map(i => `ID:${i.id} | Type:${i.type} | Title:${i.title} | Content:${i.content?.substring(0, 100)}`).join("\n");

      const prompt = `Here are items from a user's vault. Find groups of potential duplicates or very similar entries based on title and content similarity. Only include groups where items are genuinely similar.\n\nItems:\n${itemList}\n\nRespond with JSON: {"groups": [{"ids": ["id1", "id2"], "reason": "brief reason"}], "summary": "brief description"}`;

      setProgress(60);

      const { content, error: aiError } = await callAI({
        action: "detect-duplicates",
        content: prompt,
      });

      if (aiError) throw new Error(aiError);

      setProgress(80);

      let parsed: { groups: { ids: string[]; reason?: string }[] };
      try {
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        parsed = JSON.parse(jsonMatch?.[0] || content);
      } catch {
        parsed = { groups: [] };
      }

      const enrichedGroups: DuplicateGroup[] = parsed.groups
        ?.map(g => ({
          ...g,
          items: g.ids
            .map(id => items.find(i => i.id === id))
            .filter(Boolean) as DuplicateGroup["items"],
        }))
        .filter(g => g.items.length >= 2) || [];

      setGroups(enrichedGroups);
      setProgress(100);
      setScanned(true);

      toast({
        title: "Scan complete",
        description: `Found ${enrichedGroups.length} group(s) of similar items.`,
      });
    } catch (err: any) {
      toast({ title: "Scan failed", description: err.message, variant: "destructive" });
    } finally {
      setScanning(false);
    }
  };

  const deleteItem = async (itemId: string) => {
    const { error } = await supabase.from("items").delete().eq("id", itemId);
    if (error) {
      toast({ title: "Delete failed", description: error.message, variant: "destructive" });
    } else {
      setGroups(prev =>
        prev
          .map(g => ({
            ...g,
            ids: g.ids.filter(id => id !== itemId),
            items: g.items.filter(i => i.id !== itemId),
          }))
          .filter(g => g.items.length >= 2)
      );
      toast({ title: "Item deleted" });
    }
  };

  const typeColors: Record<string, string> = {
    link: "bg-primary/10 text-primary",
    email: "bg-destructive/10 text-destructive",
    message: "bg-accent text-accent-foreground",
    password: "bg-secondary text-secondary-foreground",
    contact: "bg-muted text-muted-foreground",
    weburl: "bg-primary/20 text-primary",
  };

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-6 max-w-3xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Duplicate Detection</h1>
          <p className="text-muted-foreground">
            AI-powered scan to find similar or duplicate items across your vault.
          </p>
        </div>

        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="rounded-full bg-primary/10 p-4">
                <Copy className="h-8 w-8 text-primary" />
              </div>
              <p className="text-sm text-muted-foreground max-w-md">
                Scans up to 200 of your most recent items using AI to find duplicates and near-duplicates.
              </p>
              <Button onClick={scanForDuplicates} disabled={scanning} size="lg">
                {scanning ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Sparkles className="h-4 w-4 mr-2" />
                )}
                {scanning ? "Scanning..." : "Scan for Duplicates"}
              </Button>
              {scanning && (
                <Progress value={progress} className="w-full max-w-xs h-2" />
              )}
            </div>
          </CardContent>
        </Card>

        {scanned && groups.length === 0 && !scanning && (
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-muted-foreground">No duplicates found — your vault is clean! 🎉</p>
            </CardContent>
          </Card>
        )}

        <div className="space-y-4">
          {groups.map((group, idx) => (
            <Card key={idx}>
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-destructive" />
                  <CardTitle className="text-base">
                    Duplicate Group {idx + 1}
                  </CardTitle>
                  <Badge variant="secondary" className="ml-auto">
                    {group.items.length} items
                  </Badge>
                </div>
                {group.reason && (
                  <p className="text-xs text-muted-foreground mt-1">{group.reason}</p>
                )}
              </CardHeader>
              <CardContent className="space-y-2">
                {group.items.map(item => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between rounded-lg border bg-card p-3 gap-3"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge className={typeColors[item.type] || "bg-muted text-muted-foreground"} variant="outline">
                          {item.type}
                        </Badge>
                        <span className="font-medium text-sm truncate">{item.title}</span>
                      </div>
                      <p className="text-xs text-muted-foreground truncate">
                        {item.content?.substring(0, 80)}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive shrink-0"
                      onClick={() => deleteItem(item.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </MainLayout>
  );
};

export default DuplicateDetection;
