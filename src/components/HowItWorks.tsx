
import React from "react";
import { Calendar, Search, CreditCard, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const steps = [
  {
    icon: Search,
    title: "Find Your Turf",
    description:
      "Browse our selection of high-quality turfs. Filter by location, amenities, and availability.",
    color: "bg-blue-500",
    delay: 150,
  },
  {
    icon: Calendar,
    title: "Select Date & Time",
    description:
      "Choose your preferred date and time slot that works best for you and your team.",
    color: "bg-primary",
    delay: 300,
  },
  {
    icon: CreditCard,
    title: "Easy Payment",
    description:
      "Secure your booking with our simple payment system. Multiple payment options available.",
    color: "bg-purple-500",
    delay: 450,
  },
  {
    icon: CheckCircle,
    title: "Instant Confirmation",
    description:
      "Receive immediate confirmation of your booking with all details via email.",
    color: "bg-amber-500",
    delay: 600,
  },
];

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-16 md:py-24 bg-muted/50">
      <div className="container mx-auto px-4 md:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 animate-fade-in opacity-0">
            How It <span className="text-primary">Works</span>
          </h2>
          <p className="text-lg text-muted-foreground animate-fade-in opacity-0 [animation-delay:100ms]">
            Book your perfect turf in four simple steps
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
          {steps.map((step, index) => (
            <div
              key={index}
              className={cn(
                "bg-background rounded-2xl shadow-md p-6 relative z-10 transform transition-all duration-500",
                "opacity-0",
                `animate-fade-in [animation-delay:${step.delay}ms]`
              )}
            >
              <div
                className={cn(
                  "w-14 h-14 rounded-full flex items-center justify-center mb-6 mx-auto text-white",
                  step.color
                )}
              >
                <step.icon className="h-7 w-7" />
              </div>
              
              <div className="absolute -top-4 -left-4 flex items-center justify-center w-8 h-8 bg-primary text-primary-foreground rounded-full text-sm font-bold">
                {index + 1}
              </div>
              
              <h3 className="text-xl font-semibold text-center mb-3">
                {step.title}
              </h3>
              <p className="text-sm text-center text-muted-foreground">
                {step.description}
              </p>
            </div>
          ))}
          
          {/* Connection lines between steps (visible on larger screens) */}
          <div className="hidden lg:block absolute top-1/3 left-[calc(25%-30px)] w-[calc(50%+60px)] h-0.5 bg-primary/20" />
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
