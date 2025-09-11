import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import Navigation from "./components/Navigation";
import Footer from "./components/Footer";
import Index from "./pages/Index";
import Events from "./pages/Events";
import EventDetails from "./pages/EventDetails";
import Papers from "./pages/Papers";
import PaperDetails from "./pages/PaperDetails";
import Membership from "./pages/Membership";
import About from "./pages/About";
import Offices from "./pages/Offices";
import Contact from "./pages/Contact";
import Advertising from "./pages/Advertising";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import Admin from "./pages/Admin";
import AdminEvents from "./pages/admin/AdminEvents";
import AdminEventForm from "./pages/admin/AdminEventForm";
import AdminPapers from "./pages/admin/AdminPapers";
import AdminPaperForm from "./pages/admin/AdminPaperForm";
import AdminSpeakers from "./pages/admin/AdminSpeakers";
import AdminSpeakerForm from "./pages/admin/AdminSpeakerForm";
import AdminSponsors from "./pages/admin/AdminSponsors";
import AdminSponsorForm from "./pages/admin/AdminSponsorForm";
import AdminOffices from "./pages/admin/AdminOffices";
import AdminOfficeForm from "./pages/admin/AdminOfficeForm";
import AdminSecurity from "./pages/admin/AdminSecurity";
import AdminUsers from "./pages/admin/AdminUsers";
import UserProfile from "./pages/UserProfile";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminProtectedRoute from "./components/AdminProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
        <div className="min-h-screen flex flex-col">
          <Navigation />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/events" element={<Events />} />
              <Route path="/events/:slug" element={<EventDetails />} />
              <Route path="/papers" element={<Papers />} />
              <Route path="/papers/:slug" element={<PaperDetails />} />
              <Route path="/membership" element={<Membership />} />
              <Route path="/about" element={<About />} />
              <Route path="/offices" element={<Offices />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/advertising" element={<Advertising />} />
              <Route path="/auth" element={<Auth />} />
              
              {/* Protected Routes */}
              <Route path="/profile" element={<ProtectedRoute><UserProfile /></ProtectedRoute>} />
              
              {/* Admin Routes */}
              <Route path="/admin" element={<AdminProtectedRoute><Admin /></AdminProtectedRoute>} />
              <Route path="/admin/security" element={<AdminProtectedRoute requiredRole="admin"><AdminSecurity /></AdminProtectedRoute>} />
              <Route path="/admin/users" element={<AdminProtectedRoute requiredRole="admin"><AdminUsers /></AdminProtectedRoute>} />
              <Route path="/admin/events" element={<AdminProtectedRoute><AdminEvents /></AdminProtectedRoute>} />
              <Route path="/admin/events/new" element={<AdminProtectedRoute><AdminEventForm /></AdminProtectedRoute>} />
              <Route path="/admin/events/:id/edit" element={<AdminProtectedRoute><AdminEventForm /></AdminProtectedRoute>} />
              <Route path="/admin/papers" element={<AdminProtectedRoute><AdminPapers /></AdminProtectedRoute>} />
              <Route path="/admin/papers/new" element={<AdminProtectedRoute><AdminPaperForm /></AdminProtectedRoute>} />
              <Route path="/admin/papers/:id/edit" element={<AdminProtectedRoute><AdminPaperForm /></AdminProtectedRoute>} />
              <Route path="/admin/speakers" element={<AdminProtectedRoute><AdminSpeakers /></AdminProtectedRoute>} />
              <Route path="/admin/speakers/new" element={<AdminProtectedRoute><AdminSpeakerForm /></AdminProtectedRoute>} />
              <Route path="/admin/speakers/:id/edit" element={<AdminProtectedRoute><AdminSpeakerForm /></AdminProtectedRoute>} />
              <Route path="/admin/sponsors" element={<AdminProtectedRoute><AdminSponsors /></AdminProtectedRoute>} />
              <Route path="/admin/sponsors/new" element={<AdminProtectedRoute><AdminSponsorForm /></AdminProtectedRoute>} />
              <Route path="/admin/sponsors/:id/edit" element={<AdminProtectedRoute><AdminSponsorForm /></AdminProtectedRoute>} />
              <Route path="/admin/offices" element={<AdminProtectedRoute requiredRole="admin"><AdminOffices /></AdminProtectedRoute>} />
              <Route path="/admin/offices/new" element={<AdminProtectedRoute requiredRole="admin"><AdminOfficeForm /></AdminProtectedRoute>} />
              <Route path="/admin/offices/:id/edit" element={<AdminProtectedRoute requiredRole="admin"><AdminOfficeForm /></AdminProtectedRoute>} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </BrowserRouter>
    </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
