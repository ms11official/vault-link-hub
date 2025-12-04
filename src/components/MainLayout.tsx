import { ReactNode, useEffect, useState } from "react";
import BottomNav from "./BottomNav";
import AppSidebar from "./AppSidebar";
import { SidebarProvider, useSidebar } from "@/contexts/SidebarContext";

interface MainLayoutProps {
  children: ReactNode;
  showNav?: boolean;
}

const MainLayoutContent = ({ children, showNav = true }: MainLayoutProps) => {
  const { collapsed } = useSidebar();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Sidebar */}
      {showNav && <AppSidebar />}
      
      {/* Main Content */}
      <main 
        className="pb-20 md:pb-0 transition-all duration-300"
        style={{ 
          marginLeft: showNav && !isMobile ? (collapsed ? '4rem' : '15rem') : 0 
        }}
      >
        {children}
      </main>

      {/* Mobile Bottom Nav */}
      {showNav && <BottomNav />}
    </div>
  );
};

const MainLayout = ({ children, showNav = true }: MainLayoutProps) => {
  return (
    <SidebarProvider>
      <MainLayoutContent showNav={showNav}>{children}</MainLayoutContent>
    </SidebarProvider>
  );
};

export default MainLayout;