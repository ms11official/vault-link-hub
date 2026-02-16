import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";

const KeyboardShortcutsDialog = () => {
  const [open, setOpen] = useState(false);
  const shortcuts = useKeyboardShortcuts();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "/") {
        e.preventDefault();
        setOpen(prev => !prev);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const allShortcuts = [
    ...shortcuts.map(s => ({
      keys: `Ctrl+Shift+${s.key.toUpperCase()}`,
      label: s.label,
    })),
    { keys: "Ctrl+K", label: "Quick Search" },
    { keys: "Ctrl+/", label: "Keyboard Shortcuts" },
  ];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle>Keyboard Shortcuts</DialogTitle>
        </DialogHeader>
        <div className="space-y-2 mt-2">
          {allShortcuts.map((s) => (
            <div key={s.keys} className="flex items-center justify-between py-2 px-1 border-b last:border-0">
              <span className="text-sm text-foreground">{s.label}</span>
              <kbd className="inline-flex items-center gap-1 rounded border bg-muted px-2 py-0.5 font-mono text-xs text-muted-foreground">
                {s.keys}
              </kbd>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default KeyboardShortcutsDialog;
