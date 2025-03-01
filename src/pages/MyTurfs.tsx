
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Star, 
  MapPin, 
  Users, 
  Clock, 
  Plus, 
  Edit, 
  Trash2, 
  CalendarDays 
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/ui/use-toast";
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

interface Turf {
  id: string;
  name: string;
  location: string;
  price: number;
  image: string;
  capacity: number;
  rating: number;
  reviews: number;
  features: string[];
}

const MyTurfs = () => {
  const [turfs, setTurfs] = useState<Turf[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [turfToDelete, setTurfToDelete] = useState<string | null>(null);
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

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      navigate('/auth');
      toast({
        title: "Authentication required",
        description: "Please sign in to view your turfs",
      });
    }
  }, [user, navigate, toast]);

  useEffect(() => {
    if (!user) return;

    const fetchTurfs = async () => {
      try {
        const { data, error } = await supabase
          .from('turfs')
          .select('*')
          .eq('owner_id', user.id);
          
        if (error) throw error;
        
        setTurfs(data || []);
      } catch (error: any) {
        console.error('Error fetching turfs:', error.message);
        toast({
          title: "Error",
          description: "Failed to load your turfs. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchTurfs();
  }, [user, toast]);

  const handleDeleteClick = (turfId: string) => {
    setTurfToDelete(turfId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!turfToDelete) return;
    
    try {
      const { error } = await supabase
        .from('turfs')
        .delete()
        .eq('id', turfToDelete);
        
      if (error) throw error;
      
      setTurfs(turfs.filter(turf => turf.id !== turfToDelete));
      
      toast({
        title: "Turf deleted",
        description: "Your turf has been successfully deleted.",
      });
    } catch (error: any) {
      console.error('Error deleting turf:', error.message);
      toast({
        title: "Error",
        description: "Failed to delete turf. Please try again.",
        variant: "destructive",
      });
    } finally {
      setDeleteDialogOpen(false);
      setTurfToDelete(null);
    }
  };

  return (
    <div className="container max-w-6xl mx-auto px-4 py-24">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-bold mb-2">My Turfs</h1>
          <p className="text-muted-foreground">
            Manage your listed turfs and bookings
          </p>
        </div>
        <Button 
          onClick={() => navigate('/add-turf')}
          className="flex items-center"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add New Turf
        </Button>
      </div>
      
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="overflow-hidden border shadow-sm h-[460px] animate-pulse">
              <div className="h-48 bg-muted"></div>
              <CardContent className="p-6">
                <div className="h-6 bg-muted rounded-full w-3/4 mb-3"></div>
                <div className="h-4 bg-muted rounded-full w-1/2 mb-4"></div>
                <div className="h-4 bg-muted rounded-full w-3/4 mb-6"></div>
                <div className="flex space-x-4 mb-6">
                  <div className="h-6 bg-muted rounded-full w-20"></div>
                  <div className="h-6 bg-muted rounded-full w-20"></div>
                </div>
                <div className="h-10 bg-muted rounded-xl"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : turfs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {turfs.map((turf) => (
            <Card
              key={turf.id}
              className="overflow-hidden transition-all duration-300 hover:shadow-md"
            >
              <div className="relative h-48 overflow-hidden">
                <div
                  className="absolute inset-0 bg-cover bg-center"
                  style={{ backgroundImage: `url(${turf.image || '/placeholder.svg'})` }}
                />
                <div className="absolute inset-0 bg-black/25" />
                <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md rounded-full px-3 py-1 text-white text-sm font-medium">
                  {formatPrice(turf.price)}/hr
                </div>
              </div>

              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-xl font-semibold">{turf.name}</h3>
                  <div className="flex items-center">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
                    <span className="text-sm font-medium">{turf.rating.toFixed(1)}</span>
                    <span className="text-xs text-muted-foreground ml-1">
                      ({turf.reviews})
                    </span>
                  </div>
                </div>

                <div className="flex items-center text-sm text-muted-foreground mb-4">
                  <MapPin className="h-4 w-4 mr-1 text-primary" />
                  {turf.location}
                </div>

                <div className="flex space-x-4 mb-6">
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-1 text-muted-foreground" />
                    <span className="text-xs">{turf.capacity}</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-1 text-muted-foreground" />
                    <span className="text-xs">60 min</span>
                  </div>
                </div>

                <div className="flex space-x-2 mb-6">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => navigate(`/edit-turf/${turf.id}`)}
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="flex-1"
                    onClick={() => navigate(`/turf-bookings/${turf.id}`)}
                  >
                    <CalendarDays className="mr-2 h-4 w-4" />
                    Bookings
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="sm"
                    className="w-10 px-0"
                    onClick={() => handleDeleteClick(turf.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <Button
                  className="w-full"
                  onClick={() => navigate(`/turf/${turf.id}`)}
                >
                  View Turf
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-muted/20 rounded-xl border border-border">
          <h3 className="text-xl font-medium mb-2">No Turfs Yet</h3>
          <p className="text-muted-foreground mb-6">
            You haven't listed any turfs yet. Add your first turf to get started.
          </p>
          <Button 
            onClick={() => navigate('/add-turf')} 
            className="flex items-center"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Your First Turf
          </Button>
        </div>
      )}
      
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this turf and all its associated bookings.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default MyTurfs;
