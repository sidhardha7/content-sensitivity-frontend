import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Video,
  Users,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import { useNavigate } from "react-router-dom";

export default function Sidebar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileOpen(false);
  }, [location.pathname]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMobileOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const menuItems = [
    {
      title: "Dashboard",
      icon: LayoutDashboard,
      path: "/dashboard",
      roles: ["viewer", "editor", "admin"],
    },
    {
      title: "Videos",
      icon: Video,
      path: "/videos",
      roles: ["viewer", "editor", "admin"],
    },
    {
      title: "Users",
      icon: Users,
      path: "/admin/users",
      roles: ["admin"],
    },
  ].filter((item) => user?.role && item.roles.includes(user.role));

  const isActive = (path: string) => {
    if (path === "/dashboard") {
      return location.pathname === "/dashboard";
    }
    return location.pathname.startsWith(path);
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden fixed top-4 left-4 z-50 h-10 w-10"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
      >
        {isMobileOpen ? (
          <X className="h-5 w-5" />
        ) : (
          <Menu className="h-5 w-5" />
        )}
      </Button>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`relative h-screen border-r bg-background transition-all duration-300 ${
          isCollapsed ? "w-16" : "w-64"
        } ${isMobileOpen ? "fixed left-0 top-0 z-50" : "hidden md:block"}`}
      >
        {/* Collapse Toggle Button - Desktop only */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute -right-3 top-4 z-10 h-6 w-6 rounded-full border bg-background shadow-sm hidden md:flex"
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>

        {/* Sidebar Content */}
        <div className="flex h-full flex-col">
          {/* Logo/Brand */}
          <div className="flex h-16 items-center border-b px-4">
            {!isCollapsed && (
              <Link to="/dashboard" className="text-xl font-bold">
                Content Sensitivity
              </Link>
            )}
            {isCollapsed && <div className="mx-auto text-xl font-bold">CS</div>}
          </div>

          {/* Navigation Menu */}
          <nav className="flex-1 space-y-1 p-4">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    active
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  } ${isCollapsed ? "justify-center" : ""}`}
                  title={isCollapsed ? item.title : undefined}
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  {!isCollapsed && <span>{item.title}</span>}
                </Link>
              );
            })}
          </nav>

          {/* Bottom Section */}
          <div className="border-t p-4 space-y-2">
            {/* Theme Toggle */}
            <div
              className={`flex items-center ${
                isCollapsed ? "justify-center" : "justify-between"
              }`}
            >
              {!isCollapsed && (
                <span className="text-sm text-muted-foreground">Theme</span>
              )}
              <ThemeToggle />
            </div>

            {/* User Info */}
            {!isCollapsed && user && (
              <div className="px-3 py-2 text-sm flex flex-col gap-1">
                <div className="font-medium">
                  User Name: <span className="font-normal">{user.name}</span>
                </div>
                {/* <div className="text-xs text-muted-foreground capitalize">User Role: {user.role}</div> */}
              </div>
            )}

            {/* Logout Button */}
            <Button
              variant="ghost"
              className={`w-full justify-start ${
                isCollapsed ? "px-0 justify-center" : ""
              }`}
              onClick={handleLogout}
              title={isCollapsed ? "Logout" : undefined}
            >
              <LogOut className="h-4 w-4" />
              {!isCollapsed && <span>Logout</span>}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
