import React, { createContext, useContext, useState } from "react";

export type SidebarMode = "expanded" | "collapsed" | "hover";

interface SidebarContextType {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  mode: SidebarMode;
  setMode: (mode: SidebarMode) => void;
  isHovering: boolean;
  setIsHovering: (hovering: boolean) => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export const SidebarProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setModeState] = useState<SidebarMode>(() => {
    const saved = localStorage.getItem("sidebar-mode");
    return (saved as SidebarMode) || "expanded";
  });
  const [isHovering, setIsHovering] = useState(false);

  const collapsed = mode === "collapsed" || (mode === "hover" && !isHovering);

  const setCollapsed = (value: boolean) => {
    setModeState(value ? "collapsed" : "expanded");
  };

  const setMode = (newMode: SidebarMode) => {
    setModeState(newMode);
    localStorage.setItem("sidebar-mode", newMode);
  };

  return (
    <SidebarContext.Provider value={{ collapsed, setCollapsed, mode, setMode, isHovering, setIsHovering }}>
      {children}
    </SidebarContext.Provider>
  );
};

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (context === undefined) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
};
