import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";

const KeyboardShortcutsProvider = ({ children }: { children: React.ReactNode }) => {
  useKeyboardShortcuts();
  return <>{children}</>;
};

export default KeyboardShortcutsProvider;
