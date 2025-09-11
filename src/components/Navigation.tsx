import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, ChevronDown, LogIn, LogOut, User } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useRole } from '@/hooks/useRole';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { user, signOut, loading } = useAuth();
  const { role } = useRole();

  const navItems = [
    { name: 'Home', href: '/' },
    { 
      name: 'Events', 
      href: '/events',
      submenu: [
        { name: 'All Events', href: '/events' },
        { name: 'Conferences', href: '/events?type=conference' },
        { name: 'Exhibitions', href: '/events?type=exhibition' },
        { name: 'Gala Events', href: '/events?type=gala' },
      ]
    },
    { name: 'Research Papers', href: '/papers' },
    { name: 'About', href: '/about' },
    { name: 'Global Offices', href: '/offices' },
    { name: 'Contact', href: '/contact' },
  ];

  const isActive = (href: string) => {
    if (href === '/') return location.pathname === '/';
    return location.pathname.startsWith(href);
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3">
            <img 
              src="/lovable-uploads/7edae356-b2d1-4e7d-96ba-9dcadd8a7061.png" 
              alt="Information Assets World Logo" 
              className="h-10 w-10"
            />
            <span className="text-xl font-bold text-foreground">
              Information Assets World
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <div key={item.name} className="relative group">
                <Link
                  to={item.href}
                  className={`flex items-center space-x-1 px-3 py-2 text-sm font-medium transition-colors ${
                    isActive(item.href)
                      ? 'text-primary'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <span>{item.name}</span>
                  {item.submenu && <ChevronDown className="h-4 w-4" />}
                </Link>
                
                {/* Submenu */}
                {item.submenu && (
                  <div className="absolute left-0 top-full pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                    <div className="bg-background border border-border rounded-lg shadow-lg py-2 min-w-48">
                      {item.submenu.map((subItem) => (
                        <Link
                          key={subItem.name}
                          to={subItem.href}
                          className="block px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                        >
                          {subItem.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
            
            {/* Join Network - appears first */}
            <Button variant="default" asChild>
              <Link to="/membership">Join Network</Link>
            </Button>

            {/* Authentication */}
            {!loading && (
              <>
                {user ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm">
                        <User className="h-4 w-4 mr-2" />
                        Account
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link to="/profile">
                          <User className="h-4 w-4 mr-2" />
                          Profile Settings
                        </Link>
                      </DropdownMenuItem>
                      {(role === 'admin' || role === 'editor') && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem asChild>
                            <Link to="/admin">
                              <User className="h-4 w-4 mr-2" />
                              Admin Dashboard
                            </Link>
                          </DropdownMenuItem>
                          {role === 'admin' && (
                            <DropdownMenuItem asChild>
                              <Link to="/admin/security">
                                <User className="h-4 w-4 mr-2" />
                                Security Center
                              </Link>
                            </DropdownMenuItem>
                          )}
                        </>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={signOut}>
                        <LogOut className="h-4 w-4 mr-2" />
                        Sign Out
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <Button variant="outline" asChild>
                    <Link to="/auth">
                      <LogIn className="h-4 w-4 mr-2" />
                      Sign In
                    </Link>
                  </Button>
                )}
              </>
            )}
          </div>

          {/* Mobile Navigation */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="outline" size="sm">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px]">
              <div className="flex flex-col space-y-4 mt-8">
                {navItems.map((item) => (
                  <div key={item.name}>
                    <Link
                      to={item.href}
                      onClick={() => setIsOpen(false)}
                      className={`block px-3 py-2 text-sm font-medium transition-colors ${
                        isActive(item.href)
                          ? 'text-primary'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {item.name}
                    </Link>
                    {item.submenu && (
                      <div className="ml-4 mt-2 space-y-2">
                        {item.submenu.map((subItem) => (
                          <Link
                            key={subItem.name}
                            to={subItem.href}
                            onClick={() => setIsOpen(false)}
                            className="block px-3 py-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
                          >
                            {subItem.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
                
                {/* Mobile Join Network - appears first */}
                <div className="pt-4 border-t border-border">
                  <Button className="w-full" asChild>
                    <Link to="/membership" onClick={() => setIsOpen(false)}>
                      Join Network
                    </Link>
                  </Button>
                </div>

                {/* Mobile Authentication */}
                {!loading && (
                  <div className="pt-2">
                    {user ? (
                      <>
                        <Link
                          to="/profile"
                          onClick={() => setIsOpen(false)}
                          className="flex items-center px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                        >
                          <User className="h-4 w-4 mr-2" />
                          Profile Settings
                        </Link>
                        {(role === 'admin' || role === 'editor') && (
                          <Link
                            to="/admin"
                            onClick={() => setIsOpen(false)}
                            className="flex items-center px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                          >
                            <User className="h-4 w-4 mr-2" />
                            Admin Dashboard
                          </Link>
                        )}
                        {role === 'admin' && (
                          <Link
                            to="/admin/security"
                            onClick={() => setIsOpen(false)}
                            className="flex items-center px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                          >
                            <User className="h-4 w-4 mr-2" />
                            Security Center
                          </Link>
                        )}
                        <Button
                          variant="outline"
                          className="w-full mt-2"
                          onClick={() => {
                            signOut();
                            setIsOpen(false);
                          }}
                        >
                          <LogOut className="h-4 w-4 mr-2" />
                          Sign Out
                        </Button>
                      </>
                    ) : (
                      <Button variant="outline" className="w-full mt-2" asChild>
                        <Link to="/auth" onClick={() => setIsOpen(false)}>
                          <LogIn className="h-4 w-4 mr-2" />
                          Sign In
                        </Link>
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;