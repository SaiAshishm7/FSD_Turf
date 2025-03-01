
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center pt-24 pb-12 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-background -z-10" />

      {/* Decorative elements */}
      <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-1/3 left-1/3 w-96 h-96 bg-primary/10 rounded-full blur-3xl -z-10" />

      <div className="container px-4 md:px-8 mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div className="flex flex-col space-y-8 max-w-2xl">
          <div className="space-y-2">
            <div className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary animate-fade-in opacity-0">
              <span>The Future of Field Bookings</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight animate-fade-in opacity-0 [animation-delay:150ms]">
              Book Your Perfect Turf{" "}
              <span className="text-primary">Instantly</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mt-4 animate-fade-in opacity-0 [animation-delay:300ms]">
              Simplify your game day preparations with our seamless booking
              experience. Find and secure the best turfs in your area with just a
              few clicks.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 animate-fade-in opacity-0 [animation-delay:450ms]">
            <Button className="rounded-full px-8 py-6 text-base">
              Book Now
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button variant="outline" className="rounded-full px-8 py-6 text-base">
              Explore Turfs
            </Button>
          </div>

          <div className="grid grid-cols-3 gap-8 pt-4 animate-fade-in opacity-0 [animation-delay:600ms]">
            <div className="flex flex-col">
              <div className="text-3xl font-bold text-primary">50+</div>
              <div className="text-sm text-muted-foreground">Premium Turfs</div>
            </div>
            <div className="flex flex-col">
              <div className="text-3xl font-bold text-primary">30k+</div>
              <div className="text-sm text-muted-foreground">Happy Users</div>
            </div>
            <div className="flex flex-col">
              <div className="text-3xl font-bold text-primary">99%</div>
              <div className="text-sm text-muted-foreground">Satisfaction</div>
            </div>
          </div>
        </div>

        <div className="relative aspect-square max-w-xl mx-auto lg:mx-0 animate-fade-in opacity-0 [animation-delay:750ms]">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-full h-full rounded-3xl overflow-hidden">
              <div className="w-full h-full bg-[url('https://images.unsplash.com/photo-1575361204480-aadea25e6e68?q=80&w=1000')] bg-cover bg-center animate-float"></div>
            </div>
          </div>
          
          {/* Decorative card elements */}
          <div className={cn(
            "absolute -bottom-6 -left-6 p-4 glass rounded-xl shadow-lg max-w-xs",
            "animate-fade-in opacity-0 [animation-delay:900ms]"
          )}>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">Instant Confirmation</p>
                <p className="text-xs text-muted-foreground">Book with confidence</p>
              </div>
            </div>
          </div>
          
          <div className={cn(
            "absolute -top-6 -right-6 p-4 glass rounded-xl shadow-lg",
            "animate-fade-in opacity-0 [animation-delay:1050ms]"
          )}>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <path d="M12 6v6l4 2"></path>
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">24/7 Booking</p>
                <p className="text-xs text-muted-foreground">Any time, any day</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
