
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Star, MapPin, Users, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";

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

const FeatureTurfs = () => {
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [turfs, setTurfs] = useState<Turf[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const fetchTurfs = async () => {
      try {
        const { data, error } = await supabase
          .from('turfs')
          .select('*')
          .limit(3);
          
        if (error) throw error;
        
        setTurfs(data || []);
      } catch (error: any) {
        console.error('Error fetching turfs:', error.message);
        toast({
          title: "Error",
          description: "Failed to load turf data. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchTurfs();
  }, [toast]);

  // Format currency in Indian Rupees
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <section id="turfs" className="py-16 md:py-24">
      <div className="container mx-auto px-4 md:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 animate-fade-in opacity-0">
            Featured <span className="text-primary">Turfs</span>
          </h2>
          <p className="text-lg text-muted-foreground animate-fade-in opacity-0 [animation-delay:100ms]">
            Discover premium playing fields designed for the perfect game
            experience
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="overflow-hidden border-0 shadow-lg h-[460px] animate-pulse">
                <div className="h-56 bg-muted"></div>
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
            {turfs.map((turf, index) => (
              <Card
                key={turf.id}
                className={cn(
                  "overflow-hidden border-0 shadow-lg transition-all duration-500 hover:shadow-xl group",
                  "opacity-0",
                  index === 0 ? "animate-fade-in [animation-delay:150ms]" : 
                  index === 1 ? "animate-fade-in [animation-delay:300ms]" : 
                  "animate-fade-in [animation-delay:450ms]"
                )}
                onMouseEnter={() => setHoveredCard(turf.id)}
                onMouseLeave={() => setHoveredCard(null)}
              >
                <div className="relative h-56 overflow-hidden">
                  <div
                    className={cn(
                      "absolute inset-0 bg-cover bg-center transition-transform duration-700 ease-in-out",
                      hoveredCard === turf.id ? "scale-110" : "scale-100"
                    )}
                    style={{ backgroundImage: `url(${turf.image || '/placeholder.svg'})` }}
                  />
                  <div className="absolute inset-0 bg-black/25 transition-opacity duration-300" />
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

                  <div className="flex flex-wrap gap-2 mb-6">
                    {(turf.features || []).map((feature) => (
                      <span
                        key={feature}
                        className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>

                  <Button
                    className="w-full rounded-xl group-hover:bg-primary/90 transition-all duration-300"
                    onClick={() => navigate(`/turf/${turf.id}`)}
                  >
                    Book Now
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-muted/20 rounded-xl border border-border animate-fade-in opacity-0">
            <p className="text-lg text-muted-foreground">
              No turf listings available yet. Add your first turf to get started.
            </p>
            <Button 
              className="mt-6 rounded-xl"
              onClick={() => navigate('/add-turf')}
            >
              Add Your First Turf
            </Button>
          </div>
        )}

        <div className="text-center mt-12">
          <Button
            variant="outline"
            className="rounded-full px-8 animate-fade-in opacity-0 [animation-delay:600ms]"
            onClick={() => navigate('/turfs')}
          >
            View All Turfs
          </Button>
        </div>
      </div>
    </section>
  );
};

export default FeatureTurfs;
