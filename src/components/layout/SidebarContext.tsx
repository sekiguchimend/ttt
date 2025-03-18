
import React, { createContext, useState, useContext, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

interface SidebarContextProps {
  collapsed: boolean;
  toggleCollapse: () => void;
  mobileOpen: boolean;
  toggleMobileMenu: () => void;
  closeMobileMenu: () => void;
}

const SidebarContext = createContext<SidebarContextProps>({
  collapsed: false,
  toggleCollapse: () => {},
  mobileOpen: false,
  toggleMobileMenu: () => {},
  closeMobileMenu: () => {},
});

export const useSidebar = () => useContext(SidebarContext);

export const SidebarProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const toggleCollapse = () => setCollapsed(!collapsed);
  const toggleMobileMenu = () => setMobileOpen(!mobileOpen);
  const closeMobileMenu = () => setMobileOpen(false);

  return (
    <SidebarContext.Provider
      value={{
        collapsed,
        toggleCollapse,
        mobileOpen,
        toggleMobileMenu,
        closeMobileMenu,
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
};
