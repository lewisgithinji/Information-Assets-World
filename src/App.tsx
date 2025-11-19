import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { useEffect, lazy, Suspense } from "react";
import { AuthProvider } from "@/hooks/useAuth";
import Navigation from "./components/Navigation";
import ErrorBoundary from "./components/ErrorBoundary";
import Footer from "./components/Footer";
import ChatBot from "./components/ChatBot";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminProtectedRoute from "./components/AdminProtectedRoute";

// Loading component
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[60vh]">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
  </div>
);

// Core pages - load immediately
import Index from "./pages/Index";
import Events from "./pages/Events";
import EventDetails from "./pages/EventDetails";
import Membership from "./pages/Membership";
import Auth from "./pages/Auth";
import RegisterInterest from "./pages/RegisterInterest";
import NotFound from "./pages/NotFound";

// Secondary pages - lazy load
const Papers = lazy(() => import("./pages/Papers"));
const PaperDetails = lazy(() => import("./pages/PaperDetails"));
const About = lazy(() => import("./pages/About"));
const Offices = lazy(() => import("./pages/Offices"));
const Contact = lazy(() => import("./pages/Contact"));
const Advertising = lazy(() => import("./pages/Advertising"));
const VerifyEmail = lazy(() => import("./pages/VerifyEmail"));
const Blog = lazy(() => import("./pages/Blog"));
const BlogPost = lazy(() => import("./pages/BlogPost"));
const UserProfile = lazy(() => import("./pages/UserProfile"));

// Admin pages - lazy load (biggest bundle size reduction)
const Admin = lazy(() => import("./pages/Admin"));
const AdminEvents = lazy(() => import("./pages/admin/AdminEvents"));
const AdminEventForm = lazy(() => import("./pages/admin/AdminEventForm"));
const AdminPapers = lazy(() => import("./pages/admin/AdminPapers"));
const AdminPaperForm = lazy(() => import("./pages/admin/AdminPaperForm"));
const AdminSpeakers = lazy(() => import("./pages/admin/AdminSpeakers"));
const AdminSpeakerForm = lazy(() => import("./pages/admin/AdminSpeakerForm"));
const AdminSponsors = lazy(() => import("./pages/admin/AdminSponsors"));
const AdminSponsorForm = lazy(() => import("./pages/admin/AdminSponsorForm"));
const AdminOffices = lazy(() => import("./pages/admin/AdminOffices"));
const AdminOfficeForm = lazy(() => import("./pages/admin/AdminOfficeForm"));
const AdminSecurity = lazy(() => import("./pages/admin/AdminSecurity"));
const AdminUsers = lazy(() => import("./pages/admin/AdminUsers"));
const AdminEventCategories = lazy(() => import("./pages/admin/AdminEventCategories"));
const AdminEventCategoryForm = lazy(() => import("./pages/admin/AdminEventCategoryForm"));
const AdminEventTypeForm = lazy(() => import("./pages/admin/AdminEventTypeForm"));
const AdminLeads = lazy(() => import("./pages/admin/AdminLeads"));
const AdminLeadDetail = lazy(() => import("./pages/admin/AdminLeadDetail"));
const AdminBlog = lazy(() => import("./pages/admin/AdminBlog"));
const AdminBlogForm = lazy(() => import("./pages/admin/AdminBlogForm"));

const queryClient = new QueryClient();

// Scroll to top component
function ScrollToTop() {
  const location = useLocation();
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return null;
}

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <ScrollToTop />
            <div className="min-h-screen flex flex-col">
              <Navigation />
              <main className="flex-1">
                <Suspense fallback={<PageLoader />}>
                  <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/events" element={<Events />} />
                    <Route path="/events/:slug" element={<EventDetails />} />
                    <Route path="/papers" element={<Papers />} />
                    <Route path="/papers/:slug" element={<PaperDetails />} />
                    <Route path="/blog" element={<Blog />} />
                    <Route path="/blog/:slug" element={<BlogPost />} />
                    <Route path="/membership" element={<Membership />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/offices" element={<Offices />} />
                    <Route path="/contact" element={<Contact />} />
                    <Route path="/advertising" element={<Advertising />} />
                    <Route path="/register-interest" element={<RegisterInterest />} />
                    <Route path="/verify-email" element={<VerifyEmail />} />
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
                    <Route path="/admin/event-categories" element={<AdminProtectedRoute><AdminEventCategories /></AdminProtectedRoute>} />
                    <Route path="/admin/event-categories/new" element={<AdminProtectedRoute><AdminEventCategoryForm /></AdminProtectedRoute>} />
                    <Route path="/admin/event-categories/:id/edit" element={<AdminProtectedRoute><AdminEventCategoryForm /></AdminProtectedRoute>} />
                    <Route path="/admin/event-types/new" element={<AdminProtectedRoute><AdminEventTypeForm /></AdminProtectedRoute>} />
                    <Route path="/admin/event-types/:id/edit" element={<AdminProtectedRoute><AdminEventTypeForm /></AdminProtectedRoute>} />
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

                    {/* Lead Management Routes */}
                    <Route path="/admin/leads" element={<AdminProtectedRoute><AdminLeads /></AdminProtectedRoute>} />
                    <Route path="/admin/leads/:id" element={<AdminProtectedRoute><AdminLeadDetail /></AdminProtectedRoute>} />

                    {/* Blog Management Routes */}
                    <Route path="/admin/blog" element={<AdminProtectedRoute><AdminBlog /></AdminProtectedRoute>} />
                    <Route path="/admin/blog/new" element={<AdminProtectedRoute><AdminBlogForm /></AdminProtectedRoute>} />
                    <Route path="/admin/blog/:id/edit" element={<AdminProtectedRoute><AdminBlogForm /></AdminProtectedRoute>} />

                    {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </Suspense>
              </main>
              <Footer />
              <ChatBot />
            </div>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
