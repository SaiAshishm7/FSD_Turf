
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Star, MapPin, Users, Calendar as CalendarIcon, Clock, ArrowLeft, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/context/AuthContext";

interface Turf {
  id: string;
  name: string;
  description: string;
  location: string;
  price: number;
  image: string;
  capacity: number;
  rating: number;
  reviews: number;
  features: string[];
  owner_id: string;
}

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

const TurfDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [turf, setTurf] = useState<Turf | null>(null);
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);
  const [isBooking, setIsBooking] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const fetchTurf = async () => {
      if (!id) return;

      try {
        const { data, error } = await supabase
          .from('turfs')
          .select('*')
          .eq('id', id)
          .single();
          
        if (error) throw error;
        
        setTurf(data);
      } catch (error: any) {
        console.error('Error fetching turf:', error.message);
        toast({
          title: "Error",
          description: "Failed to load turf data. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchTurf();
  }, [id, toast]);

  // Format currency in Indian Rupees
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const createBookingEmailTemplate = (booking: any, turf: Turf, userEmail: string) => {
    const bookingDate = new Date(booking.booking_date).toLocaleDateString('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Booking Confirmation</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            margin: 0;
            padding: 0;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            background-color: #4F46E5;
            color: white;
            padding: 20px;
            text-align: center;
            border-radius: 5px 5px 0 0;
          }
          .content {
            padding: 20px;
            border: 1px solid #ddd;
            border-top: none;
            border-radius: 0 0 5px 5px;
          }
          .booking-details {
            background-color: #f9fafb;
            padding: 15px;
            border-radius: 5px;
            margin-bottom: 20px;
          }
          .detail-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 10px;
            border-bottom: 1px solid #eee;
            padding-bottom: 10px;
          }
          .detail-row:last-child {
            border-bottom: none;
            margin-bottom: 0;
          }
          .footer {
            text-align: center;
            margin-top: 20px;
            color: #666;
            font-size: 0.85em;
          }
          .button {
            display: inline-block;
            background-color: #4F46E5;
            color: white;
            text-decoration: none;
            padding: 10px 20px;
            border-radius: 5px;
            margin-top: 15px;
          }
          .total {
            font-size: 1.2em;
            font-weight: bold;
            color: #4F46E5;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Booking Confirmation</h1>
          </div>
          <div class="content">
            <p>Hello ${userEmail.split('@')[0]},</p>
            <p>Your turf booking has been confirmed. Here are the details:</p>
            
            <div class="booking-details">
              <div class="detail-row">
                <strong>Turf Name:</strong>
                <span>${turf.name}</span>
              </div>
              <div class="detail-row">
                <strong>Location:</strong>
                <span>${turf.location}</span>
              </div>
              <div class="detail-row">
                <strong>Date:</strong>
                <span>${bookingDate}</span>
              </div>
              <div class="detail-row">
                <strong>Time:</strong>
                <span>${booking.start_time} - ${booking.end_time}</span>
              </div>
              <div class="detail-row">
                <strong>Booking ID:</strong>
                <span>${booking.id}</span>
              </div>
              <div class="detail-row">
                <strong>Total Price:</strong>
                <span class="total">${formatPrice(booking.total_price)}</span>
              </div>
            </div>
            
            <p>Thank you for booking with us. You can view your booking details in the My Bookings section of your account.</p>
            
            <p>If you need to cancel or reschedule, please do so at least 7 hours before your booking time.</p>
            
            <a href="https://turfbooking.com/my-bookings" class="button">View Booking</a>
            
            <div class="footer">
              <p>If you have any questions, please contact us at support@turfbooking.com</p>
              <p>&copy; ${new Date().getFullYear()} Turf Booking. All rights reserved.</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
  };

  const handleBooking = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to book a turf",
      });
      navigate('/auth');
      return;
    }

    if (!date || !selectedTimeSlot || !turf) {
      toast({
        title: "Incomplete booking",
        description: "Please select a date and time slot",
        variant: "destructive",
      });
      return;
    }

    setIsBooking(true);

    try {
      // Calculate end time (assuming 1 hour slots)
      const startTime = selectedTimeSlot;
      const [hourStr, minuteStr, period] = startTime.match(/(\d+):(\d+)\s([AP]M)/).slice(1);
      let hour = parseInt(hourStr);
      if (period === "PM" && hour !== 12) hour += 12;
      if (period === "AM" && hour === 12) hour = 0;
      
      let endHour = hour + 1;
      const endPeriod = endHour >= 12 ? "PM" : "AM";
      if (endHour > 12) endHour -= 12;
      if (endHour === 0) endHour = 12;
      
      const endTime = `${endHour.toString().padStart(2, '0')}:${minuteStr} ${endPeriod}`;

      // Create the booking
      const { data: bookingData, error: bookingError } = await supabase
        .from('bookings')
        .insert({
          turf_id: turf.id,
          user_id: user.id,
          booking_date: date.toISOString().split('T')[0],
          start_time: startTime,
          end_time: endTime,
          total_price: turf.price,
          status: 'confirmed'
        })
        .select()
        .single();
      
      if (bookingError) throw bookingError;
      
      console.log("Booking created:", bookingData);
      
      // Send confirmation email
      if (user.email) {
        // Create a rich HTML email template
        const emailTemplate = createBookingEmailTemplate(bookingData, turf, user.email);
        
        try {
          const { data: emailData, error: emailError } = await supabase.functions.invoke('send-booking-email', {
            body: {
              to: user.email,
              subject: "Your Turf Booking Confirmation",
              body: emailTemplate
            }
          });
          
          if (emailError) console.error("Error sending email:", emailError);
          console.log("Email response:", emailData);
        } catch (emailErr) {
          console.error("Failed to send email:", emailErr);
          // Don't stop the booking process if email fails
        }
      }
      
      toast({
        title: "Booking successful!",
        description: "Your booking has been confirmed. We've sent you a confirmation email.",
      });
      
      // Redirect to bookings page
      navigate('/my-bookings');
    } catch (error: any) {
      console.error('Error booking turf:', error.message);
      toast({
        title: "Booking failed",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsBooking(false);
    }
  };

  if (loading) {
    return (
      <div className="container max-w-6xl mx-auto px-4 py-24 animate-pulse">
        <div className="h-8 bg-muted rounded-full w-1/3 mb-6"></div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="h-96 bg-muted rounded-xl mb-6"></div>
            <div className="h-6 bg-muted rounded-full w-1/2 mb-4"></div>
            <div className="h-4 bg-muted rounded-full w-full mb-3"></div>
            <div className="h-4 bg-muted rounded-full w-5/6 mb-3"></div>
            <div className="h-4 bg-muted rounded-full w-4/6 mb-6"></div>
          </div>
          <div>
            <div className="h-72 bg-muted rounded-xl mb-6"></div>
            <div className="h-10 bg-muted rounded-xl"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!turf) {
    return (
      <div className="container max-w-6xl mx-auto px-4 py-24 text-center">
        <h2 className="text-2xl font-bold mb-4">Turf Not Found</h2>
        <p className="text-muted-foreground mb-6">
          The turf you're looking for doesn't exist or has been removed.
        </p>
        <Button onClick={() => navigate('/')}>
          Back to Home
        </Button>
      </div>
    );
  }

  return (
    <div className="container max-w-6xl mx-auto px-4 py-12 md:py-24">
      <Button 
        variant="ghost" 
        className="mb-6 pl-0 flex items-center text-muted-foreground hover:text-foreground"
        onClick={() => navigate(-1)}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="space-y-6">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold mb-2">{turf.name}</h1>
                <div className="flex items-center text-muted-foreground">
                  <MapPin className="h-4 w-4 mr-1 text-primary" />
                  <span>{turf.location}</span>
                </div>
              </div>
              <div className="flex items-center bg-primary/10 text-primary px-3 py-1 rounded-full">
                <Star className="h-4 w-4 fill-primary text-primary mr-1" />
                <span className="font-medium">{turf.rating.toFixed(1)}</span>
                <span className="text-xs ml-1">({turf.reviews})</span>
              </div>
            </div>

            <div className="aspect-video overflow-hidden rounded-xl">
              <img 
                src={turf.image || '/placeholder.svg'} 
                alt={turf.name} 
                className="w-full h-full object-cover"
              />
            </div>

            <Tabs defaultValue="details">
              <TabsList className="w-full grid grid-cols-3 mb-6">
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="amenities">Amenities</TabsTrigger>
                <TabsTrigger value="reviews">Reviews</TabsTrigger>
              </TabsList>
              
              <TabsContent value="details" className="space-y-4">
                <div>
                  <h3 className="text-xl font-semibold mb-3">About this turf</h3>
                  <p className="text-muted-foreground">
                    {turf.description || 'No description available.'}
                  </p>
                </div>
                
                <div className="grid grid-cols-2 gap-4 pt-4">
                  <div className="flex items-center">
                    <Users className="h-5 w-5 mr-2 text-primary" />
                    <div>
                      <div className="text-sm font-medium">Capacity</div>
                      <div className="text-sm text-muted-foreground">{turf.capacity} players</div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-5 w-5 mr-2 text-primary" />
                    <div>
                      <div className="text-sm font-medium">Duration</div>
                      <div className="text-sm text-muted-foreground">60 minutes</div>
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="amenities">
                <h3 className="text-xl font-semibold mb-4">Features & Amenities</h3>
                <div className="grid grid-cols-2 gap-3">
                  {turf.features && turf.features.length > 0 ? (
                    turf.features.map((feature) => (
                      <div key={feature} className="flex items-center">
                        <Badge variant="secondary" className="mr-2">✓</Badge>
                        {feature}
                      </div>
                    ))
                  ) : (
                    <p className="text-muted-foreground col-span-2">No amenities listed.</p>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="reviews">
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold mb-2">Customer Reviews</h3>
                  {/* Placeholder for reviews - in a real app, you'd fetch these from a database */}
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">
                      Reviews will be available soon.
                    </p>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        <div>
          <Card className="sticky top-24">
            <CardContent className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold">{formatPrice(turf.price)}</h3>
                <span className="text-sm text-muted-foreground">per hour</span>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="flex items-center mb-2">
                    <CalendarIcon className="h-4 w-4 mr-2 text-primary" />
                    <span className="font-medium">Select Date</span>
                  </div>
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    className="rounded-md border"
                    disabled={(date) => {
                      const now = new Date();
                      now.setHours(0, 0, 0, 0);
                      return date < now;
                    }}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center mb-2">
                    <Clock className="h-4 w-4 mr-2 text-primary" />
                    <span className="font-medium">Select Time</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {timeSlots.map((time) => (
                      <button
                        key={time}
                        onClick={() => setSelectedTimeSlot(time)}
                        className={`py-2 px-3 text-xs font-medium rounded-lg border transition-all ${
                          selectedTimeSlot === time
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-background hover:border-primary/60"
                        }`}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                </div>

                <Button 
                  className="w-full"
                  onClick={handleBooking}
                  disabled={isBooking || !date || !selectedTimeSlot}
                >
                  {isBooking ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    "Book Now"
                  )}
                </Button>
                <p className="text-xs text-center text-muted-foreground">
                  You can cancel bookings up to 7 hours before the start time
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TurfDetail;
