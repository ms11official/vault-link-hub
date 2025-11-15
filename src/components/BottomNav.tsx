import { Link, useLocation } from "react-router-dom";
import { Home, Link2, Mail, MessageSquare, Lock, User, Globe } from "lucide-react";
import { cn } from "@/lib/utils";

const BottomNav = () => {
  const location = useLocation();

  const navItems = [
    { path: "/", icon: Home, label: "Home" },
    { path: "/links", icon: Link2, label: "Links" },
    { path: "/emails", icon: Mail, label: "Emails" },
    { path: "/messages", icon: MessageSquare, label: "Messages" },
    { path: "/passwords", icon: Lock, label: "Passwords" },
    { path: "/contacts", icon: User, label: "Contacts" },
    { path: "/weburls", icon: Globe, label: "Web URLs" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50">
      <div className="flex justify-around items-center h-16 max-w-screen-xl mx-auto px-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg transition-colors min-w-[60px]",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;