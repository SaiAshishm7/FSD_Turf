
import React, { useState, useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ChevronDown, Menu, LogOut, User, ListChecks, CalendarDays, ShieldCheck } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

const Navbar = () => {
  const location = useLocation();
  const isMobile = useIsMobile();
  const [isScrolled, setIsScrolled] = useState(false);
  const { user, isAdmin, signOut } = useAuth();
  const [open, setOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navigationLinks = [
    { name: "Home", href: "/" },
    { name: "Book", href: "/#booking" },
    ...(user ? [{ name: "My Bookings", href: "/my-bookings" }] : []),
    ...(isAdmin ? [{ name: "My Turfs", href: "/my-turfs" }] : []),
  ];

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        isScrolled
          ? "bg-background/80 backdrop-blur-md border-b py-3 shadow-sm"
          : "bg-transparent py-5"
      )}
    >
      <div className="container mx-auto px-4 md:px-8">
        <div className="flex items-center justify-between">
          <Link
            to="/"
            className="text-xl font-bold text-primary tracking-tight flex items-center"
          >
            <span className="relative">
              kickNclick
              <span className="absolute top-0 right-0 -mr-3 -mt-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary/60 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
              </span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          {!isMobile && (
            <nav className="hidden md:flex items-center space-x-6">
              {navigationLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.href}
                  className={cn(
                    "text-sm font-medium transition-colors hover:text-primary",
                    isActive(link.href) ? "text-primary" : "text-foreground/60"
                  )}
                >
                  {link.name}
                </Link>
              ))}
            </nav>
          )}

          <div className="flex items-center gap-3">
            {user ? (
              <>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="flex items-center gap-1 hover:bg-primary/10 rounded-full px-3 py-1.5"
                    >
                      <User className="h-4 w-4 mr-1" />
                      <span className="hidden sm:inline">Account</span>
                      <ChevronDown className="h-4 w-4 ml-1" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem asChild className="cursor-pointer">
                      <Link to="/my-bookings" className="flex items-center">
                        <CalendarDays className="h-4 w-4 mr-2" />
                        My Bookings
                      </Link>
                    </DropdownMenuItem>
                    
                    {isAdmin && (
                      <>
                        <DropdownMenuItem asChild className="cursor-pointer">
                          <Link to="/my-turfs" className="flex items-center">
                            <ListChecks className="h-4 w-4 mr-2" />
                            My Turfs
                          </Link>
                        </DropdownMenuItem>
                        
                        <DropdownMenuItem asChild className="cursor-pointer">
                          <Link to="/admin" className="flex items-center">
                            <ShieldCheck className="h-4 w-4 mr-2" />
                            Admin Dashboard
                          </Link>
                        </DropdownMenuItem>
                      </>
                    )}
                    
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => signOut()}
                      className="cursor-pointer text-destructive focus:text-destructive"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <Button asChild>
                <Link to="/auth">Sign In</Link>
              </Button>
            )}

            {/* Mobile Menu */}
            {isMobile && (
              <Sheet open={open} onOpenChange={setOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent>
                  <nav className="flex flex-col space-y-4 mt-8">
                    {navigationLinks.map((link) => (
                      <Link
                        key={link.name}
                        to={link.href}
                        className={cn(
                          "text-lg font-medium transition-colors hover:text-primary py-2",
                          isActive(link.href)
                            ? "text-primary"
                            : "text-foreground/60"
                        )}
                        onClick={() => setOpen(false)}
                      >
                        {link.name}
                      </Link>
                    ))}
                    
                    {isAdmin && (
                      <Link
                        to="/admin"
                        className="text-lg font-medium transition-colors hover:text-primary py-2 text-foreground/60"
                        onClick={() => setOpen(false)}
                      >
                        Admin Dashboard
                      </Link>
                    )}
                    
                    {user && (
                      <Button
                        variant="ghost"
                        className="justify-start px-2 text-lg font-medium text-destructive"
                        onClick={() => {
                          signOut();
                          setOpen(false);
                        }}
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        Sign Out
                      </Button>
                    )}
                  </nav>
                </SheetContent>
              </Sheet>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
