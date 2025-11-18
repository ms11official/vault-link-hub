import { Link, useLocation } from "react-router-dom";
import { Home, FolderOpen, HardDrive, User } from "lucide-react";
import { cn } from "@/lib/utils";

const BottomNav = () => {
  const location = useLocation();

  const navItems = [
    { path: "/", icon: Home, label: "Home" },
    { path: "/categories", icon: FolderOpen, label: "Categories" },
    { path: "/storage", icon: HardDrive, label: "Storage" },
    { path: "/profile", icon: User, label: "Profile" },
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
                "flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg transition-colors min-w-[60px] relative",
                isActive
                  ? "text-primary before:absolute before:top-0 before:left-1/2 before:-translate-x-1/2 before:w-12 before:h-1 before:bg-primary before:rounded-b-full"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className={cn("h-5 w-5", isActive && "font-bold")} />
              <span className={cn("text-xs font-medium", isActive && "font-bold")}>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;