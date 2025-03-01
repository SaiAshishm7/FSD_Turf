
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { AlertCircle, Lock } from "lucide-react";

const AddTurf = () => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    location: "",
    price: "",
    capacity: "",
    image: "",
    features: [] as string[],
  });
  const [feature, setFeature] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const { toast } = useToast();

  // Redirect if not logged in or not admin
  useEffect(() => {
    if (!user) {
      navigate('/auth');
      toast({
        title: "Authentication required",
        description: "Please sign in to access this page",
      });
      return;
    }

    if (!isAdmin) {
      navigate('/');
      toast({
        title: "Access denied",
        description: "Only administrators can add or edit turfs",
        variant: "destructive"
      });
    }
  }, [user, isAdmin, navigate, toast]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddFeature = () => {
    if (feature.trim() && !formData.features.includes(feature.trim())) {
      setFormData(prev => ({
        ...prev,
        features: [...prev.features, feature.trim()]
      }));
      setFeature("");
    }
  };

  const handleRemoveFeature = (featureToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter(f => f !== featureToRemove)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !isAdmin) return;
    
    setIsSubmitting(true);
    
    try {
      // Convert price and capacity to numbers
      const numericPrice = parseFloat(formData.price);
      const numericCapacity = parseInt(formData.capacity, 10);
      
      if (isNaN(numericPrice) || isNaN(numericCapacity)) {
        throw new Error("Price and capacity must be valid numbers");
      }
      
      const { error } = await supabase
        .from('turfs')
        .insert({
          name: formData.name,
          description: formData.description,
          location: formData.location,
          price: numericPrice,
          capacity: numericCapacity,
          image: formData.image || '/placeholder.svg',
          features: formData.features,
          owner_id: user.id,
          rating: 0,
          reviews: 0
        });
      
      if (error) throw error;
      
      toast({
        title: "Success!",
        description: "Your turf has been added successfully.",
      });
      navigate('/my-turfs');
    } catch (error: any) {
      console.error('Error adding turf:', error);
      toast({
        title: "Error adding turf",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // If not admin, show access denied
  if (!isAdmin) {
    return (
      <div className="container max-w-md mx-auto px-4 py-24 text-center">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-8">
          <Lock className="mx-auto h-12 w-12 text-yellow-500 mb-4" />
          <h2 className="text-2xl font-bold mb-2">Admin Access Required</h2>
          <p className="text-muted-foreground mb-6">
            Only administrators can add or edit turfs in the system.
          </p>
          <Button onClick={() => navigate('/')}>
            Return to Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto px-4 py-24">
      <div className="flex flex-col items-center mb-10">
        <h1 className="text-3xl font-bold mb-2">Add New Turf</h1>
        <p className="text-muted-foreground text-center">
          List your turf and start receiving bookings from players
        </p>
      </div>
      
      <Card className="p-6 md:p-10">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name">Turf Name</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter turf name"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="Area, Hyderabad"
                required
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe your turf, its facilities, rules, etc."
              rows={4}
              required
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="price">Price per Hour (₹)</Label>
              <Input
                id="price"
                name="price"
                type="number"
                value={formData.price}
                onChange={handleChange}
                placeholder="1200"
                min="0"
                step="50"
                required
              />
              <p className="text-xs text-muted-foreground">
                Recommended price range: ₹1200 - ₹1500
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="capacity">Capacity (players)</Label>
              <Input
                id="capacity"
                name="capacity"
                type="number"
                value={formData.capacity}
                onChange={handleChange}
                placeholder="20"
                min="1"
                required
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="image">Image URL</Label>
            <Input
              id="image"
              name="image"
              value={formData.image}
              onChange={handleChange}
              placeholder="https://example.com/image.jpg"
            />
            <p className="text-xs text-muted-foreground">
              Enter a URL for your turf image. Leave blank to use a placeholder.
            </p>
          </div>
          
          <div className="space-y-4">
            <Label>Features</Label>
            <div className="flex">
              <Input
                value={feature}
                onChange={(e) => setFeature(e.target.value)}
                placeholder="e.g. Floodlights, Showers"
                className="rounded-r-none"
              />
              <Button 
                type="button" 
                onClick={handleAddFeature}
                className="rounded-l-none"
              >
                Add
              </Button>
            </div>
            
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.features.map((f, i) => (
                <div 
                  key={i} 
                  className="bg-primary/10 text-primary px-3 py-1 rounded-full flex items-center"
                >
                  {f}
                  <button 
                    type="button" 
                    className="ml-2 text-primary hover:text-primary/80"
                    onClick={() => handleRemoveFeature(f)}
                  >
                    ×
                  </button>
                </div>
              ))}
              {formData.features.length === 0 && (
                <p className="text-sm text-muted-foreground">No features added yet</p>
              )}
            </div>
          </div>
          
          <div className="flex justify-end space-x-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(-1)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Adding..." : "Add Turf"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default AddTurf;
