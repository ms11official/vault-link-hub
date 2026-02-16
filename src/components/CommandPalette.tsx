import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { Search, Link2, Mail, MessageSquare, Lock, User, Globe, Loader2, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

const typeIcons: Record<string, any> = {
  link: Link2, email: Mail, message: MessageSquare,
  password: Lock, contact: User, weburl: Globe,
};

const typeColors: Record<string, string> = {
  link: "text-blue-500", email: "text-green-500", message: "text-purple-500",
  password: "text-red-500", contact: "text-orange-500", weburl: "text-cyan-500",
};

const CommandPalette = () => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const navigate = useNavigate();

  // Ctrl+K to open
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setOpen(prev => !prev);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  // Search
  useEffect(() => {
    if (!query.trim()) { setResults([]); return; }
    const timeout = setTimeout(async () => {
      setLoading(true);
      const { data } = await supabase
        .from("items")
        .select("id, title, type, content")
        .or(`title.ilike.%${query}%,content.ilike.%${query}%`)
        .order("updated_at", { ascending: false })
        .limit(10);
      setResults(data || []);
      setSelectedIndex(0);
      setLoading(false);
    }, 200);
    return () => clearTimeout(timeout);
  }, [query]);

  const navigateTo = useCallback((item: any) => {
    const typeRoutes: Record<string, string> = {
      link: "/links", email: "/emails", message: "/messages",
      password: "/passwords", contact: "/contacts", weburl: "/weburls",
    };
    navigate(typeRoutes[item.type] || "/");
    setOpen(false);
    setQuery("");
  }, [navigate]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex(i => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex(i => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && results[selectedIndex]) {
      navigateTo(results[selectedIndex]);
    }
  };

  const quickLinks = [
    { label: "Home", path: "/" },
    { label: "Links", path: "/links" },
    { label: "Emails", path: "/emails" },
    { label: "Messages", path: "/messages" },
    { label: "Passwords", path: "/passwords" },
    { label: "Contacts", path: "/contacts" },
    { label: "Web URLs", path: "/weburls" },
    { label: "Categories", path: "/categories" },
    { label: "Tools", path: "/tools" },
    { label: "Profile", path: "/profile" },
  ];

  const filteredQuickLinks = query.trim()
    ? quickLinks.filter(l => l.label.toLowerCase().includes(query.toLowerCase()))
    : quickLinks;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[500px] p-0 gap-0 overflow-hidden">
        <div className="flex items-center gap-2 px-4 border-b">
          <Search className="h-4 w-4 text-muted-foreground shrink-0" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search items, navigate pages..."
            className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 h-12"
            autoFocus
          />
          <kbd className="hidden sm:inline-flex h-5 items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
            ESC
          </kbd>
        </div>

        <div className="max-h-[300px] overflow-y-auto p-2">
          {loading ? (
            <div className="flex justify-center py-6">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : results.length > 0 ? (
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground px-2 py-1">Items</p>
              {results.map((item, i) => {
                const Icon = typeIcons[item.type] || Link2;
                return (
                  <button
                    key={item.id}
                    onClick={() => navigateTo(item)}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm text-left transition-colors",
                      i === selectedIndex ? "bg-accent" : "hover:bg-accent/50"
                    )}
                  >
                    <Icon className={cn("h-4 w-4 shrink-0", typeColors[item.type])} />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{item.title}</p>
                      <p className="text-xs text-muted-foreground truncate">{item.type}</p>
                    </div>
                    <ArrowRight className="h-3 w-3 text-muted-foreground shrink-0" />
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground px-2 py-1">Quick Navigation</p>
              {filteredQuickLinks.map((link) => (
                <button
                  key={link.path}
                  onClick={() => { navigate(link.path); setOpen(false); setQuery(""); }}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm hover:bg-accent/50 transition-colors"
                >
                  <ArrowRight className="h-3 w-3 text-muted-foreground" />
                  <span>{link.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="border-t px-4 py-2 flex items-center gap-4 text-xs text-muted-foreground">
          <span>↑↓ Navigate</span>
          <span>↵ Select</span>
          <span>ESC Close</span>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CommandPalette;
