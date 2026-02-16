import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Brain, Plus, Trash2, Eye, EyeOff, Loader2, CheckCircle } from "lucide-react";

interface ApiKey {
  id: string;
  provider: string;
  api_key: string;
  is_active: boolean;
}

const providers = [
  { value: "openai", label: "OpenAI (GPT-4o)", description: "Best all-around AI" },
  { value: "gemini", label: "Google Gemini", description: "Fast & capable" },
  { value: "anthropic", label: "Anthropic (Claude)", description: "Great reasoning" },
];

const AISettingsSection = ({ userId }: { userId: string }) => {
  const { toast } = useToast();
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newProvider, setNewProvider] = useState("openai");
  const [newKey, setNewKey] = useState("");
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});

  useEffect(() => { fetchKeys(); }, [userId]);

  const fetchKeys = async () => {
    const { data } = await supabase
      .from("user_api_keys")
      .select("*")
      .eq("user_id", userId)
      .order("created_at");
    setKeys((data as ApiKey[]) || []);
    setLoading(false);
  };

  const addKey = async () => {
    if (!newKey.trim()) {
      toast({ title: "Error", description: "API key is required", variant: "destructive" });
      return;
    }
    setSaving(true);
    const { error } = await supabase.from("user_api_keys").upsert(
      { user_id: userId, provider: newProvider, api_key: newKey.trim(), is_active: true },
      { onConflict: "user_id,provider" }
    );
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Success", description: "API key saved" });
      setNewKey("");
      fetchKeys();
    }
    setSaving(false);
  };

  const deleteKey = async (id: string) => {
    const { error } = await supabase.from("user_api_keys").delete().eq("id", id);
    if (!error) {
      toast({ title: "Deleted", description: "API key removed" });
      fetchKeys();
    }
  };

  const maskKey = (key: string) => key.substring(0, 8) + "•".repeat(20) + key.slice(-4);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-primary" />
          AI Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <p className="text-sm text-muted-foreground">
          Add your own AI provider API keys to enable AI features like smart search, auto-categorization, content summarization, and the AI assistant.
        </p>

        {/* Existing Keys */}
        {loading ? (
          <div className="flex justify-center py-4">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : keys.length > 0 ? (
          <div className="space-y-3">
            {keys.map((key) => {
              const providerInfo = providers.find(p => p.value === key.provider);
              return (
                <div key={key.id} className="flex items-center gap-3 p-3 rounded-lg border bg-card">
                  <CheckCircle className="h-4 w-4 text-green-500 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{providerInfo?.label || key.provider}</p>
                    <p className="text-xs text-muted-foreground font-mono truncate">
                      {showKeys[key.id] ? key.api_key : maskKey(key.api_key)}
                    </p>
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setShowKeys(p => ({ ...p, [key.id]: !p[key.id] }))}>
                    {showKeys[key.id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => deleteKey(key.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              );
            })}
          </div>
        ) : null}

        {/* Add New Key */}
        <div className="space-y-3 p-4 rounded-lg border border-dashed">
          <h4 className="font-medium text-sm">Add API Key</h4>
          <div className="grid gap-3 sm:grid-cols-[1fr_2fr_auto]">
            <div>
              <Label className="text-xs">Provider</Label>
              <Select value={newProvider} onValueChange={setNewProvider}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {providers.filter(p => !keys.some(k => k.provider === p.value)).map(p => (
                    <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">API Key</Label>
              <Input
                type="password"
                value={newKey}
                onChange={(e) => setNewKey(e.target.value)}
                placeholder="sk-... or AIza..."
              />
            </div>
            <div className="flex items-end">
              <Button onClick={addKey} disabled={saving} size="sm">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4 mr-1" />}
                Add
              </Button>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Keys are stored securely and only used for your AI requests. Get keys from{" "}
            <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener" className="text-primary underline">OpenAI</a>,{" "}
            <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener" className="text-primary underline">Google AI</a>, or{" "}
            <a href="https://console.anthropic.com/" target="_blank" rel="noopener" className="text-primary underline">Anthropic</a>.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default AISettingsSection;
