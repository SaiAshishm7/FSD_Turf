
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-primary/5 via-background to-background px-4">
      <div className="text-center max-w-md">
        <div className="mb-8 inline-block">
          <div className="relative h-24 w-24 overflow-hidden rounded-full bg-primary mx-auto">
            <div className="absolute inset-0 flex items-center justify-center text-primary-foreground font-display font-bold text-5xl">
              T
            </div>
          </div>
        </div>
        
        <h1 className="text-7xl font-bold mb-4 animate-fade-in opacity-0">404</h1>
        <p className="text-xl text-muted-foreground mb-8 animate-fade-in opacity-0 [animation-delay:150ms]">
          Oops! This turf doesn't exist. The page you're looking for can't be found.
        </p>
        
        <Button className="rounded-full px-8 py-6 animate-fade-in opacity-0 [animation-delay:300ms]" asChild>
          <a href="/">
            <Home className="mr-2 h-5 w-5" />
            Return to Home
          </a>
        </Button>
      </div>
      
      {/* Background elements */}
      <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-1/3 left-1/3 w-96 h-96 bg-primary/10 rounded-full blur-3xl -z-10" />
    </div>
  );
};

export default NotFound;
