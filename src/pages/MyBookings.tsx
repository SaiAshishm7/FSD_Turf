
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { 
  CalendarIcon, 
  Clock, 
  MapPin, 
  AlertCircle,
  Loader2
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/ui/use-toast";

interface Booking {
  id: string;
  booking_date: string;
  start_time: string;
  end_time: string;
  total_price: number;
  status: string;
  created_at: string;
  turf_id: string;
  turf?: {
    name: string;
    location: string;
    image: string;
  };
}

const MyBookings = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmCancelId, setConfirmCancelId] = useState<string | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  // Format currency in Indian Rupees
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  // Format date to display in a friendly way
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  // Check if booking can be cancelled (7 hours before start time)
  const canCancelBooking = (booking: Booking) => {
    const now = new Date();
    const bookingDate = new Date(booking.booking_date);
    
    try {
      // Parse the start time
      const timeRegex = /(\d+):(\d+)(?::(\d+))?\s*([AP]M)?/i;
      const match = booking.start_time.match(timeRegex);
      
      if (!match) return false;
      
      const [_, hourStr, minuteStr, __, periodStr] = match;
      let hour = parseInt(hourStr);
      const period = periodStr?.toUpperCase() || '';
      
      if (period === "PM" && hour !== 12) hour += 12;
      if (period === "AM" && hour === 12) hour = 0;
      
      // Set the hours and minutes
      bookingDate.setHours(hour, parseInt(minuteStr), 0, 0);
      
      // Calculate time difference in hours
      const timeDiff = (bookingDate.getTime() - now.getTime()) / (1000 * 60 * 60);
      
      return timeDiff >= 7;
    } catch (error) {
      console.error("Error calculating cancellation eligibility:", error);
      return false;
    }
  };

  useEffect(() => {
    // Redirect if not logged in
    if (!user) {
      navigate('/auth');
      toast({
        title: "Authentication required",
        description: "Please sign in to view your bookings",
      });
      return;
    }

    const fetchBookings = async () => {
      try {
        console.log("Fetching bookings for user ID:", user.id);
        const { data, error } = await supabase
          .from('bookings')
          .select(`
            *,
            turf:turf_id (
              name,
              location,
              image
            )
          `)
          .eq('user_id', user.id)
          .order('booking_date', { ascending: false });
          
        if (error) throw error;
        
        console.log("Fetched bookings:", data);
        setBookings(data || []);
      } catch (error: any) {
        console.error('Error fetching bookings:', error.message);
        toast({
          title: "Error",
          description: "Failed to load your bookings. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [user, toast, navigate]);

  const handleCancelRequest = (bookingId: string) => {
    // Check if the booking can be cancelled
    const booking = bookings.find(b => b.id === bookingId);
    
    if (booking && !canCancelBooking(booking)) {
      toast({
        title: "Cannot cancel booking",
        description: "Bookings can only be cancelled at least 7 hours before the start time.",
        variant: "destructive",
      });
      return;
    }
    
    setConfirmCancelId(bookingId);
  };

  const handleCancelConfirm = async () => {
    if (!confirmCancelId) return;
    
    setIsCancelling(true);
    
    try {
      // First, get the booking to send in the cancellation email
      const { data: bookingData, error: fetchError } = await supabase
        .from('bookings')
        .select(`
          *,
          turf:turf_id (
            name,
            location
          )
        `)
        .eq('id', confirmCancelId)
        .single();
      
      if (fetchError) throw fetchError;
      
      // Update the booking status
      const { error: updateError } = await supabase
        .from('bookings')
        .update({ status: 'cancelled' })
        .eq('id', confirmCancelId);
        
      if (updateError) throw updateError;
      
      // Send cancellation email through edge function
      if (user && user.email && bookingData) {
        await supabase.functions.invoke('booking-notification', {
          body: {
            type: 'cancellation',
            email: user.email,
            booking: {
              id: bookingData.id,
              date: bookingData.booking_date,
              startTime: bookingData.start_time,
              turfName: bookingData.turf?.name || 'Unknown Turf',
              price: bookingData.total_price
            }
          }
        });
      }
      
      // Update local state
      setBookings(bookings.map(booking => 
        booking.id === confirmCancelId 
          ? { ...booking, status: 'cancelled' } 
          : booking
      ));
      
      toast({
        title: "Booking cancelled",
        description: "Your booking has been successfully cancelled.",
      });
    } catch (error: any) {
      console.error('Error cancelling booking:', error.message);
      toast({
        title: "Error",
        description: "Failed to cancel booking. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCancelling(false);
      setConfirmCancelId(null);
    }
  };

  return (
    <div className="container max-w-4xl mx-auto px-4 py-24">
      <div className="flex flex-col items-center mb-10">
        <h1 className="text-3xl font-bold mb-2">My Bookings</h1>
        <p className="text-muted-foreground text-center">
          View and manage your turf bookings
        </p>
      </div>
      
      {loading ? (
        <div className="space-y-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="w-full md:w-1/3 h-36 bg-muted rounded-lg"></div>
                  <div className="flex-1 space-y-4">
                    <div className="h-6 bg-muted rounded-full w-3/4"></div>
                    <div className="h-4 bg-muted rounded-full w-1/2"></div>
                    <div className="h-4 bg-muted rounded-full w-1/3"></div>
                    <div className="flex space-x-3">
                      <div className="h-8 bg-muted rounded-full w-24"></div>
                      <div className="h-8 bg-muted rounded-full w-24"></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : bookings.length > 0 ? (
        <div className="space-y-6">
          {bookings.map((booking) => (
            <Card key={booking.id} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="flex flex-col md:flex-row">
                  <div 
                    className="w-full md:w-1/3 h-full md:h-auto aspect-video md:aspect-square bg-cover bg-center"
                    style={{ 
                      backgroundImage: `url(${booking.turf?.image || '/placeholder.svg'})` 
                    }}
                  ></div>
                  <div className="flex-1 p-6">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-xl font-semibold">{booking.turf?.name || 'Unknown Turf'}</h3>
                      <Badge variant={
                        booking.status === 'confirmed' ? 'default' : 
                        booking.status === 'pending' ? 'secondary' : 
                        'destructive'
                      }>
                        {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center text-sm text-muted-foreground mb-3">
                      <MapPin className="h-4 w-4 mr-1" />
                      {booking.turf?.location || 'Unknown location'}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                      <div className="flex items-center">
                        <CalendarIcon className="h-4 w-4 mr-2 text-primary" />
                        <span>{formatDate(booking.booking_date)}</span>
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-2 text-primary" />
                        <span>{booking.start_time} - {booking.end_time}</span>
                      </div>
                    </div>
                    
                    <Separator className="my-4" />
                    
                    <div className="flex justify-between items-center mt-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Total Price</p>
                        <p className="text-lg font-bold">{formatPrice(booking.total_price)}</p>
                      </div>
                      
                      {booking.status !== 'cancelled' && (
                        <div className="flex space-x-3">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => navigate(`/turf/${booking.turf_id}`)}
                          >
                            View Turf
                          </Button>
                          
                          {booking.status !== 'cancelled' && canCancelBooking(booking) && (
                            <Button 
                              variant="destructive" 
                              size="sm"
                              onClick={() => handleCancelRequest(booking.id)}
                            >
                              Cancel Booking
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                    
                    {booking.status !== 'cancelled' && !canCancelBooking(booking) && (
                      <div className="flex items-center mt-3 text-xs text-amber-600">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        <span>Cancellation is only available 7 hours before the booking time</span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-muted/20 rounded-xl border border-border">
          <h3 className="text-xl font-medium mb-2">No Bookings Yet</h3>
          <p className="text-muted-foreground mb-6">
            You haven't made any bookings yet. Browse turfs to make your first booking.
          </p>
          <Button onClick={() => navigate('/')}>
            Browse Turfs
          </Button>
        </div>
      )}
      
      <AlertDialog open={!!confirmCancelId} onOpenChange={(open) => !open && setConfirmCancelId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Booking</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel this booking? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isCancelling}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancelConfirm}
              disabled={isCancelling}
              className="bg-destructive text-destructive-foreground"
            >
              {isCancelling ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Cancelling...
                </>
              ) : (
                "Confirm Cancellation"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default MyBookings;
