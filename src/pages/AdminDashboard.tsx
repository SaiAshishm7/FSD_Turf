
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  UserPlus,
  Calendar,
  DollarSign,
  TrendingUp,
  PlusCircle,
  Users,
  Edit,
  Trash2,
  Search,
  BarChart,
  AlertTriangle
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";
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

interface User {
  id: string;
  email?: string | null;
  created_at: string;
  avatar_url?: string | null;
  full_name?: string | null;
  updated_at?: string | null;
  username?: string | null;
}

interface Booking {
  id: string;
  booking_date: string;
  start_time: string;
  end_time: string;
  total_price: number;
  status: string;
  created_at: string;
  user_id: string;
  turf_id: string;
  turf?: {
    name: string;
  };
  user?: {
    email?: string | null;
  } | null;
}

interface Turf {
  id: string;
  name: string;
  location: string;
  price: number;
  capacity: number;
  rating: number;
  reviews: number;
  created_at: string;
}

interface Stats {
  totalUsers: number;
  totalBookings: number;
  totalRevenue: number;
  activeBookings: number;
  recentBookings: Booking[];
}

const AdminDashboard = () => {
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalBookings: 0,
    totalRevenue: 0,
    activeBookings: 0,
    recentBookings: []
  });
  const [turfs, setTurfs] = useState<Turf[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [turfToDelete, setTurfToDelete] = useState<string | null>(null);
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const { toast } = useToast();

  // Format currency in Indian Rupees
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  useEffect(() => {
    // Redirect if not logged in or not admin
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
        description: "This page is restricted to administrators only",
        variant: "destructive"
      });
      return;
    }

    const fetchStats = async () => {
      try {
        setLoading(true);
        
        // Get profiles for user count
        const { count: profilesCount, error: profilesError } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true });
        
        if (profilesError) throw profilesError;
        
        // Get bookings with turf data
        const { data: allBookings, error: bookingsError } = await supabase
          .from('bookings')
          .select(`
            *,
            turf:turf_id (name)
          `)
          .order('created_at', { ascending: false });
          
        if (bookingsError) throw bookingsError;

        // Fetch user emails for each booking
        let enrichedBookings: Booking[] = [];
        
        if (allBookings && allBookings.length > 0) {
          // Process bookings to ensure they match our Booking interface
          enrichedBookings = allBookings.map(booking => {
            return {
              ...booking,
              user: {
                email: null // Default to null, we'll fetch emails separately
              }
            };
          });
          
          // For each booking, try to get the corresponding user email from profiles
          for (let i = 0; i < enrichedBookings.length; i++) {
            try {
              const { data: userData, error: userError } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', enrichedBookings[i].user_id)
                .single();
                
              if (!userError && userData) {
                // Update the user email in our enriched bookings
                enrichedBookings[i].user = {
                  email: userData.username || `User ID: ${enrichedBookings[i].user_id}`
                };
              }
            } catch (e) {
              console.error(`Error fetching user data for booking ${enrichedBookings[i].id}:`, e);
            }
          }
        }
        
        console.log("Enriched bookings:", enrichedBookings);
        
        // Calculate total revenue
        const totalRevenue = enrichedBookings.reduce((sum, booking) => 
          booking.status !== 'cancelled' ? sum + (booking.total_price || 0) : sum, 0
        ) || 0;
        
        // Count active bookings
        const activeBookings = enrichedBookings.filter(booking => 
          booking.status !== 'cancelled' && new Date(booking.booking_date) >= new Date()
        ).length || 0;
        
        // Get recent bookings
        const recentBookings = enrichedBookings.slice(0, 5) || [];
        
        setStats({
          totalUsers: profilesCount || 0,
          totalBookings: enrichedBookings.length || 0,
          totalRevenue,
          activeBookings,
          recentBookings
        });
        
        // Set all bookings for bookings tab
        setBookings(enrichedBookings);
        
        // Get all turfs
        const { data: allTurfs, error: turfsError } = await supabase
          .from('turfs')
          .select('*')
          .order('created_at', { ascending: false });
          
        if (turfsError) throw turfsError;
        
        setTurfs(allTurfs || []);
        
        // Fetch user profiles instead of trying to access auth.users
        const { data: profilesData, error: profilesFetchError } = await supabase
          .from('profiles')
          .select('*')
          .order('created_at', { ascending: false });
          
        if (profilesFetchError) throw profilesFetchError;
        
        // Transform profiles data to match our User interface
        const transformedUsers = profilesData?.map(profile => ({
          id: profile.id,
          email: profile.username, // Use username as email since that's what we have
          created_at: profile.created_at || '',
          avatar_url: profile.avatar_url,
          full_name: profile.full_name,
          updated_at: profile.updated_at,
          username: profile.username
        })) || [];
        
        setUsers(transformedUsers);
        
      } catch (error: any) {
        console.error('Error fetching admin data:', error.message);
        toast({
          title: "Error",
          description: "Failed to load admin data. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [user, isAdmin, navigate, toast]);

  const handleDeleteTurf = async () => {
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
        description: "The turf has been successfully removed.",
      });
    } catch (error: any) {
      console.error('Error deleting turf:', error.message);
      toast({
        title: "Error",
        description: "Failed to delete turf. Please try again.",
        variant: "destructive",
      });
    } finally {
      setTurfToDelete(null);
    }
  };

  const filteredTurfs = turfs.filter(turf => 
    turf.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    turf.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredUsers = users.filter(user => 
    (user.email || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredBookings = bookings.filter(booking => 
    (booking.turf?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    booking.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
    booking.booking_date.includes(searchTerm)
  );

  return (
    <div className="container mx-auto px-4 py-12 max-w-7xl">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage turfs, bookings, and view statistics</p>
        </div>
        <Button 
          className="mt-4 sm:mt-0 flex items-center"
          onClick={() => navigate('/add-turf')}
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          Add New Turf
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Total Users</p>
                <h3 className="text-2xl font-bold mt-1">{stats.totalUsers}</h3>
              </div>
              <div className="p-3 rounded-full bg-primary/10">
                <UserPlus className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Total Bookings</p>
                <h3 className="text-2xl font-bold mt-1">{stats.totalBookings}</h3>
              </div>
              <div className="p-3 rounded-full bg-primary/10">
                <Calendar className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Active Bookings</p>
                <h3 className="text-2xl font-bold mt-1">{stats.activeBookings}</h3>
              </div>
              <div className="p-3 rounded-full bg-primary/10">
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Total Revenue</p>
                <h3 className="text-2xl font-bold mt-1">{formatPrice(stats.totalRevenue)}</h3>
              </div>
              <div className="p-3 rounded-full bg-primary/10">
                <DollarSign className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for different sections */}
      <Tabs defaultValue="turfs" className="space-y-6">
        <TabsList className="w-full grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-0">
          <TabsTrigger value="turfs">Manage Turfs</TabsTrigger>
          <TabsTrigger value="bookings">All Bookings</TabsTrigger>
          <TabsTrigger value="users">Registered Users</TabsTrigger>
        </TabsList>

        {/* Turfs Tab */}
        <TabsContent value="turfs" className="space-y-6">
          <div className="flex items-center">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search turfs by name or location..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-2">
                        <div className="h-5 bg-muted rounded-full w-48"></div>
                        <div className="h-4 bg-muted rounded-full w-32"></div>
                      </div>
                      <div className="flex space-x-2">
                        <div className="h-9 bg-muted rounded-md w-16"></div>
                        <div className="h-9 bg-muted rounded-md w-16"></div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredTurfs.length > 0 ? (
            <div className="space-y-4">
              {filteredTurfs.map((turf) => (
                <Card key={turf.id}>
                  <CardContent className="p-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div>
                        <h3 className="font-semibold">{turf.name}</h3>
                        <p className="text-sm text-muted-foreground">{turf.location}</p>
                        <div className="flex items-center mt-1 space-x-4">
                          <span className="text-sm">{formatPrice(turf.price)}/hr</span>
                          <span className="text-sm">Capacity: {turf.capacity}</span>
                          <span className="text-sm">Rating: {turf.rating.toFixed(1)}</span>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/edit-turf/${turf.id}`)}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => setTurfToDelete(turf.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-muted/20 rounded-xl border">
              <p className="text-muted-foreground">No turfs found matching your search.</p>
            </div>
          )}
        </TabsContent>

        {/* Bookings Tab */}
        <TabsContent value="bookings" className="space-y-6">
          <div className="flex items-center">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search bookings by turf, status or date..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
                      <div className="h-5 bg-muted rounded-full w-32"></div>
                      <div className="h-5 bg-muted rounded-full w-24"></div>
                      <div className="h-5 bg-muted rounded-full w-24"></div>
                      <div className="h-5 bg-muted rounded-full w-16"></div>
                      <div className="h-5 bg-muted rounded-full w-20"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredBookings.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left font-medium p-3">Turf</th>
                    <th className="text-left font-medium p-3">Date & Time</th>
                    <th className="text-left font-medium p-3">User</th>
                    <th className="text-left font-medium p-3">Price</th>
                    <th className="text-left font-medium p-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBookings.map((booking) => (
                    <tr key={booking.id} className="border-b hover:bg-muted/50">
                      <td className="p-3">{booking.turf?.name || 'Unknown'}</td>
                      <td className="p-3">
                        {formatDate(booking.booking_date)}, {booking.start_time}
                      </td>
                      <td className="p-3 max-w-[150px] truncate">{booking.user?.email || booking.user_id}</td>
                      <td className="p-3">{formatPrice(booking.total_price)}</td>
                      <td className="p-3">
                        <Badge variant={
                          booking.status === 'confirmed' ? 'default' : 
                          booking.status === 'pending' ? 'secondary' : 
                          'destructive'
                        }>
                          {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12 bg-muted/20 rounded-xl border">
              <p className="text-muted-foreground">No bookings found matching your search.</p>
            </div>
          )}
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-6">
          <div className="flex items-center">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users by email..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="h-5 bg-muted rounded-full w-40"></div>
                      <div className="h-5 bg-muted rounded-full w-32"></div>
                      <div className="h-5 bg-muted rounded-full w-24"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredUsers.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left font-medium p-3">Email</th>
                    <th className="text-left font-medium p-3">User ID</th>
                    <th className="text-left font-medium p-3">Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="border-b hover:bg-muted/50">
                      <td className="p-3 max-w-[250px] truncate">{user.email || 'No Email'}</td>
                      <td className="p-3 max-w-[150px] truncate">{user.id}</td>
                      <td className="p-3">{formatDate(user.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12 bg-muted/20 rounded-xl border">
              <p className="text-muted-foreground">No users found matching your search.</p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!turfToDelete} onOpenChange={(open) => !open && setTurfToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Turf</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this turf? This action cannot be undone and will
              remove all associated bookings.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteTurf}
              className="bg-destructive text-destructive-foreground"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminDashboard;
