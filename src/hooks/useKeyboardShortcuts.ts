import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

interface ShortcutConfig {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  path: string;
  label: string;
}

const shortcuts: ShortcutConfig[] = [
  { key: "p", ctrl: true, shift: true, path: "/passwords", label: "Passwords" },
  { key: "e", ctrl: true, shift: true, path: "/emails", label: "Emails" },
  { key: "l", ctrl: true, shift: true, path: "/links", label: "Links" },
  { key: "m", ctrl: true, shift: true, path: "/messages", label: "Messages" },
  { key: "c", ctrl: true, shift: true, path: "/contacts", label: "Contacts" },
  { key: "w", ctrl: true, shift: true, path: "/weburls", label: "Web URLs" },
  { key: "h", ctrl: true, shift: true, path: "/", label: "Home" },
  { key: "t", ctrl: true, shift: true, path: "/tools", label: "Tools" },
];

export const useKeyboardShortcuts = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input or textarea
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        (e.target as HTMLElement).isContentEditable
      ) {
        return;
      }

      for (const shortcut of shortcuts) {
        const ctrlMatch = shortcut.ctrl ? e.ctrlKey || e.metaKey : !e.ctrlKey && !e.metaKey;
        const shiftMatch = shortcut.shift ? e.shiftKey : !e.shiftKey;
        const altMatch = shortcut.alt ? e.altKey : !e.altKey;
        const keyMatch = e.key.toLowerCase() === shortcut.key.toLowerCase();

        if (ctrlMatch && shiftMatch && altMatch && keyMatch) {
          e.preventDefault();
          navigate(shortcut.path);
          toast({
            title: `Navigating to ${shortcut.label}`,
            description: `Shortcut: Ctrl+Shift+${shortcut.key.toUpperCase()}`,
            duration: 1500,
          });
          return;
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [navigate, toast]);

  return shortcuts;
};

export default useKeyboardShortcuts;
