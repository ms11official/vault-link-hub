import { Link, useLocation } from "react-router-dom";
import { Home, FolderOpen, Wrench, User, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/contexts/SidebarContext";
import logo from "@/assets/logo.png";

const AppSidebar = () => {
  const location = useLocation();
  const { collapsed, setCollapsed } = useSidebar();

  const navItems = [
    { path: "/", icon: Home, label: "Home" },
    { path: "/categories", icon: FolderOpen, label: "Categories" },
    { path: "/tools", icon: Wrench, label: "Tools" },
    { path: "/profile", icon: User, label: "Profile" },
  ];

  return (
    <aside
      className={cn(
        "hidden md:flex flex-col h-screen bg-sidebar border-r border-sidebar-border fixed left-0 top-0 z-40 transition-all duration-300",
        collapsed ? "w-16" : "w-60"
      )}
    >
      {/* Logo/Brand Area */}
      <div className={cn(
        "h-16 flex items-center border-b border-sidebar-border px-4",
        collapsed ? "justify-center" : "gap-2"
      )}>
        {!collapsed && (
          <div className="flex items-center gap-2 flex-1">
            <img src={logo} alt="Databseplus" className="h-8 w-8 object-contain" />
            <span className="text-xl font-bold text-sidebar-foreground">Databseplus</span>
          </div>
        )}
        {collapsed && (
          <img src={logo} alt="Databseplus" className="h-8 w-8 object-contain" />
        )}
      </div>

      {/* Collapse/Expand Button */}
      <div className="px-2 py-2 border-b border-sidebar-border">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCollapsed(!collapsed)}
          className={cn(
            "w-full text-sidebar-foreground hover:bg-sidebar-accent",
            collapsed ? "justify-center" : "justify-start gap-2"
          )}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          {!collapsed && <span className="text-sm">Collapse</span>}
        </Button>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 py-4 px-2 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 group relative",
                collapsed ? "justify-center" : "",
                isActive
                  ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
            >
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-sidebar-primary-foreground rounded-r-full" />
              )}
              <Icon className={cn("h-5 w-5 shrink-0", collapsed && "mx-auto")} />
              {!collapsed && (
                <span className="font-medium">{item.label}</span>
              )}
              {collapsed && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-popover text-popover-foreground text-sm rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50">
                  {item.label}
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className={cn(
        "p-4 border-t border-sidebar-border",
        collapsed ? "text-center" : ""
      )}>
        {!collapsed && (
          <p className="text-xs text-sidebar-foreground/60">© 2024 Databseplus</p>
        )}
      </div>
    </aside>
  );
};

export default AppSidebar;