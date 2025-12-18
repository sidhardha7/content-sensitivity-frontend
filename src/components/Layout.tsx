import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import ThemeToggle from '@/components/ThemeToggle';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <Link to="/dashboard" className="text-xl font-bold">
              PulseGen
            </Link>
            <div className="flex space-x-4">
              <Link to="/dashboard" className="text-sm hover:text-primary">
                Dashboard
              </Link>
              {(user?.role === 'editor' || user?.role === 'admin') && (
                <Link to="/videos" className="text-sm hover:text-primary">
                  Videos
                </Link>
              )}
              {user?.role === 'admin' && (
                <Link to="/admin/users" className="text-sm hover:text-primary">
                  Users
                </Link>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            <span className="text-sm text-muted-foreground">
              {user?.name} ({user?.role})
            </span>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </div>
      </nav>
      <main>{children}</main>
    </div>
  );
}

