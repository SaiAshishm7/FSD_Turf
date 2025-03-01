
import React, { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Calendar as CalendarIcon, Clock, Users } from "lucide-react";

const timeSlots = [
  "09:00 AM",
  "10:00 AM",
  "11:00 AM",
  "12:00 PM",
  "01:00 PM",
  "02:00 PM",
  "03:00 PM",
  "04:00 PM",
  "05:00 PM",
  "06:00 PM",
  "07:00 PM",
  "08:00 PM",
];

const BookingCalendar = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);
  const [selectedPeople, setSelectedPeople] = useState<number>(10);

  // Format currency in Indian Rupees
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <section
      id="booking"
      className="relative py-16 lg:py-24 overflow-hidden"
    >
      <div className="absolute inset-0 bg-primary/5 -z-10" />
      {/* Decorative elements */}
      <div className="absolute top-1/3 right-1/3 w-64 h-64 bg-primary/10 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl -z-10" />

      <div className="container mx-auto px-4 md:px-8">
        <div className="max-w-2xl mx-auto text-center mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 animate-fade-in opacity-0">
            Book Your <span className="text-primary">Perfect Slot</span>
          </h2>
          <p className="text-lg text-muted-foreground animate-fade-in opacity-0 [animation-delay:100ms]">
            Choose your preferred date, time, and number of players. We'll find
            the perfect turf for your game day.
          </p>
        </div>

        <div className="max-w-5xl mx-auto glass backdrop-blur-sm shadow-xl rounded-3xl overflow-hidden">
          <div className="grid md:grid-cols-2 gap-6 p-6 md:p-10">
            <div className="space-y-6">
              <div className="space-y-2">
                <h3 className="text-lg font-medium">Select Date & Time</h3>
                <p className="text-sm text-muted-foreground">
                  Choose your preferred date and time slot for booking
                </p>
              </div>

              <div className="bg-background rounded-xl p-4 animate-scale-up opacity-0">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  initialFocus
                  className="rounded-lg border-0"
                />
              </div>

              <div className="animate-scale-up opacity-0 [animation-delay:100ms]">
                <div className="flex items-center mb-3">
                  <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                  <h4 className="text-sm font-medium">Available Time Slots</h4>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {timeSlots.map((time) => (
                    <button
                      key={time}
                      onClick={() => setSelectedTimeSlot(time)}
                      className={cn(
                        "py-2 px-3 text-xs font-medium rounded-lg border transition-all",
                        selectedTimeSlot === time
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-background text-foreground border-border hover:border-primary/60"
                      )}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>

              <div className="animate-scale-up opacity-0 [animation-delay:200ms]">
                <div className="flex items-center mb-3">
                  <Users className="mr-2 h-4 w-4 text-muted-foreground" />
                  <h4 className="text-sm font-medium">Number of Players</h4>
                </div>
                <div className="flex space-x-2">
                  {[5, 10, 15, 20].map((num) => (
                    <button
                      key={num}
                      onClick={() => setSelectedPeople(num)}
                      className={cn(
                        "py-2 px-4 text-sm font-medium rounded-lg border transition-all",
                        selectedPeople === num
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-background text-foreground border-border hover:border-primary/60"
                      )}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex flex-col">
              <div className="space-y-2 mb-6">
                <h3 className="text-lg font-medium">Booking Summary</h3>
                <p className="text-sm text-muted-foreground">
                  Review your booking details before confirming
                </p>
              </div>

              <div className="flex-1 bg-background rounded-xl p-6 space-y-6 animate-scale-up opacity-0 [animation-delay:300ms]">
                <div className="space-y-4">
                  <div className="flex justify-between items-center pb-4 border-b">
                    <span className="text-sm text-muted-foreground">Date</span>
                    <span className="text-sm font-medium flex items-center">
                      <CalendarIcon className="mr-2 h-4 w-4 text-primary" />
                      {date ? date.toLocaleDateString("en-US", {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                      }) : "Select a date"}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center pb-4 border-b">
                    <span className="text-sm text-muted-foreground">Time</span>
                    <span className="text-sm font-medium flex items-center">
                      <Clock className="mr-2 h-4 w-4 text-primary" />
                      {selectedTimeSlot || "Select a time"}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center pb-4 border-b">
                    <span className="text-sm text-muted-foreground">Players</span>
                    <span className="text-sm font-medium flex items-center">
                      <Users className="mr-2 h-4 w-4 text-primary" />
                      {selectedPeople} people
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center pt-2">
                    <span className="text-sm font-medium">Total Price</span>
                    <span className="text-lg font-bold text-primary">{formatPrice(1350)}</span>
                  </div>
                </div>

                <div className="pt-4">
                  <Button className="w-full rounded-xl py-6">
                    Confirm Booking
                  </Button>
                  <p className="text-xs text-muted-foreground text-center mt-3">
                    You won't be charged until you confirm
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BookingCalendar;
