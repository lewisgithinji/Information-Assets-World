import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Calendar, FileText, Globe, Users, Star, TrendingUp, BarChart3, Award, Clock, Newspaper } from 'lucide-react';
import { Link } from 'react-router-dom';
import Hero from '@/components/Hero';
import EventCard from '@/components/EnhancedEventCard';
import PaperCard from '@/components/PaperCard';
import BlogCard from '@/components/blog/BlogCard';
import { AnimatedCounter } from '@/components/AnimatedCounter';
import { useEvents } from '@/hooks/useEvents';
import { usePapers } from '@/hooks/usePapers';
import { useOffices } from '@/hooks/useOffices';
import { useFeaturedBlogPosts } from '@/hooks/useBlogPosts';
import { useSponsors } from '@/hooks/useSponsors';
import { adaptDatabaseEvent } from '@/utils/eventAdapters';
import conferenceImage from '@/assets/conference-image.jpg';

const Index = () => {
  const { data: databaseEvents } = useEvents();
  const { data: databasePapers } = usePapers();
  const { data: offices } = useOffices();
  const { data: featuredBlogPosts } = useFeaturedBlogPosts(3);
  const { data: sponsors } = useSponsors();

  // Use only database events
  const events = databaseEvents ? databaseEvents.map(adaptDatabaseEvent) : [];
  const papers = databasePapers || [];

  const featuredEvents = events.filter(event => event.featured).slice(0, 3);
  const latestPapers = papers.slice(0, 3);

  return (
    <div>
      <Hero />
      
      {/* Enhanced Statistics Section */}
      <section className="relative py-20 bg-gradient-to-br from-secondary via-background to-secondary overflow-hidden">
        {/* Animated gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5 gradient-animate" />
        
        {/* Floating shapes */}
        <div className="absolute top-10 left-10 w-32 h-32 bg-primary/10 rounded-full blur-3xl floating-shape" />
        <div className="absolute bottom-20 right-20 w-40 h-40 bg-accent/10 rounded-full blur-3xl floating-shape" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 w-48 h-48 bg-primary-light/10 rounded-full blur-3xl floating-shape" style={{ animationDelay: '4s' }} />
        
        {/* Dot pattern overlay */}
        <div 
          className="absolute inset-0 opacity-5" 
          style={{
            backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)',
            backgroundSize: '30px 30px'
          }} 
        />
        
        <div className="relative z-10 container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">
              Our Global Impact
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Leading the future of information management across industries and continents
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="relative overflow-hidden text-center border-0 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 glass-card group">
              {/* Trend Indicator Badge */}
              <Badge className="absolute top-3 right-3 bg-emerald-500/20 text-emerald-400 border-0 animate-pulse-subtle">
                ↑ +15%
              </Badge>
              
              {/* Gradient Background Blob */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <CardHeader className="relative z-10">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-lg shadow-primary/50">
                  <Calendar className="h-10 w-10 text-white" />
                </div>
                <div className="text-5xl font-extrabold mb-2 gradient-text-primary">
                  <AnimatedCounter end={78} />+
                </div>
                <CardTitle className="text-lg relative inline-block after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-primary after:transition-all after:duration-300 group-hover:after:w-full">
                  Annual Events
                </CardTitle>
              </CardHeader>
              <CardContent className="relative z-10">
                <p className="text-muted-foreground">Conferences, workshops, and networking events worldwide</p>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden text-center border-0 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 glass-card group">
              {/* Trend Indicator Badge */}
              <Badge className="absolute top-3 right-3 bg-emerald-500/20 text-emerald-400 border-0 animate-pulse-subtle">
                ↑ +23%
              </Badge>
              
              {/* Gradient Background Blob */}
              <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 to-cyan-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <CardHeader className="relative z-10">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-lg shadow-teal/50">
                  <FileText className="h-10 w-10 text-white" />
                </div>
                <div className="text-5xl font-extrabold mb-2 gradient-text-teal">
                  <AnimatedCounter end={90} />+
                </div>
                <CardTitle className="text-lg relative inline-block after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-teal after:transition-all after:duration-300 group-hover:after:w-full">
                  Research Papers
                </CardTitle>
              </CardHeader>
              <CardContent className="relative z-10">
                <p className="text-muted-foreground">Peer-reviewed research in information management</p>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden text-center border-0 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 glass-card group">
              {/* Trend Indicator Badge */}
              <Badge className="absolute top-3 right-3 bg-emerald-500/20 text-emerald-400 border-0 animate-pulse-subtle">
                ↑ +42%
              </Badge>
              
              {/* Gradient Background Blob */}
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-red-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <CardHeader className="relative z-10">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-accent to-orange-600 flex items-center justify-center transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-lg shadow-accent/50">
                  <Users className="h-10 w-10 text-white" />
                </div>
                <div className="text-5xl font-extrabold mb-2 gradient-text-accent">
                  <AnimatedCounter end={5} decimals={0} suffix="k" />+
                </div>
                <CardTitle className="text-lg relative inline-block after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-accent after:transition-all after:duration-300 group-hover:after:w-full">
                  Global Members
                </CardTitle>
              </CardHeader>
              <CardContent className="relative z-10">
                <p className="text-muted-foreground">Professionals from leading organizations</p>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden text-center border-0 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 glass-card group">
              {/* Trend Indicator Badge */}
              <Badge className="absolute top-3 right-3 bg-emerald-500/20 text-emerald-400 border-0 animate-pulse-subtle">
                ↑ +8%
              </Badge>
              
              {/* Gradient Background Blob */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-blue-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <CardHeader className="relative z-10">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-lg shadow-primary/50">
                  <Globe className="h-10 w-10 text-white" />
                </div>
                <div className="text-5xl font-extrabold mb-2 gradient-text-primary">
                  <AnimatedCounter end={18} />+
                </div>
                <CardTitle className="text-lg relative inline-block after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-primary after:transition-all after:duration-300 group-hover:after:w-full">
                  Countries
                </CardTitle>
              </CardHeader>
              <CardContent className="relative z-10">
                <p className="text-muted-foreground">Spanning six continents with local expertise</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
      {/* Enhanced Featured Events Section - DARK */}
      <section className="relative py-20 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white overflow-hidden">
        {/* Animated grid pattern */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
            backgroundSize: '50px 50px'
          }}
        />

        {/* Gradient orbs */}
        <div className="absolute top-20 right-20 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 left-20 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />

        <div className="relative z-10 container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge className="mb-4 px-4 py-2 bg-blue-500/20 text-blue-200 border-blue-400/30">
              <Clock className="h-4 w-4 mr-2" />
              Upcoming Events
            </Badge>
            <h2 className="text-4xl font-bold mb-6">
              Featured Professional Events
            </h2>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto">
              Join industry leaders at our premier conferences and networking events worldwide
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {featuredEvents.length > 0 ? (
              featuredEvents.map((event) => (
                <div key={event.id} className="animate-fade-in">
                  <EventCard event={event as any} />
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <Calendar className="h-16 w-16 mx-auto mb-4 text-blue-300/50" />
                <h3 className="text-xl font-semibold mb-2">No Events Available</h3>
                <p className="text-blue-200/70">Featured events will be displayed here when available.</p>
              </div>
            )}
          </div>

          <div className="text-center">
            <Button asChild size="lg" className="bg-white text-slate-900 hover:bg-blue-50 shadow-xl">
              <Link to="/events">
                View All Events
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Latest Research Section - Light with Warm Gradient Mesh */}
      <section className="relative py-20 bg-gradient-to-br from-orange-50 via-yellow-50 to-pink-50 overflow-hidden">
        {/* Gradient mesh blobs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-radial from-orange-200/40 to-transparent blur-3xl animate-float" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gradient-radial from-pink-200/40 to-transparent blur-3xl animate-float" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-gradient-radial from-yellow-200/30 to-transparent blur-3xl animate-float" style={{ animationDelay: '4s' }} />

        <div className="relative z-10 container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4 px-4 py-2 border-orange-300 text-orange-700">
              <FileText className="h-4 w-4 mr-2" />
              Research Library
            </Badge>
            <h2 className="text-4xl font-bold text-foreground mb-4">
              Latest Research Papers
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Cutting-edge research in information management and data governance
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {latestPapers.length > 0 ? (
              latestPapers.map((paper) => (
                <PaperCard key={paper.id} paper={paper} />
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <FileText className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-semibold text-foreground mb-2">No Papers Available</h3>
                <p className="text-muted-foreground">Research papers will be displayed here when available.</p>
              </div>
            )}
          </div>

          <div className="text-center">
            <Button asChild variant="outline" size="lg" className="border-orange-300 hover:bg-orange-50">
              <Link to="/papers">
                Explore Research Library
                <FileText className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Featured Blog Posts Section - DARK Purple/Indigo */}
      <section className="relative py-20 bg-gradient-to-br from-indigo-950 via-purple-900 to-indigo-950 text-white overflow-hidden">
        {/* Animated background pattern */}
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.15) 1px, transparent 1px)',
            backgroundSize: '40px 40px'
          }}
        />

        {/* Floating gradient orbs */}
        <div className="absolute top-10 left-10 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-drift" />
        <div className="absolute bottom-10 right-10 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl animate-drift" style={{ animationDelay: '3s' }} />

        <div className="relative z-10 container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge className="mb-4 px-4 py-2 bg-purple-500/20 text-purple-200 border-purple-400/30">
              <Newspaper className="h-4 w-4 mr-2" />
              Latest Insights
            </Badge>
            <h2 className="text-4xl font-bold mb-6">
              Featured Blog Posts
            </h2>
            <p className="text-xl text-purple-100 max-w-2xl mx-auto">
              Expert insights, industry trends, and best practices in information security
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {featuredBlogPosts && featuredBlogPosts.length > 0 ? (
              featuredBlogPosts.map((post) => (
                <div key={post.id} className="animate-fade-in">
                  <BlogCard
                    post={post}
                    showExcerpt={true}
                    showCategory={true}
                    showAuthor={false}
                  />
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <Newspaper className="h-16 w-16 mx-auto mb-4 text-purple-300/50" />
                <h3 className="text-xl font-semibold mb-2">No Blog Posts Available</h3>
                <p className="text-purple-200/70">Featured blog posts will be displayed here when available.</p>
              </div>
            )}
          </div>

          <div className="text-center">
            <Button asChild size="lg" className="bg-white text-indigo-900 hover:bg-purple-50 shadow-xl">
              <Link to="/blog">
                View All Blog Posts
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Global Network Section - Light with Cool Gradient Accents */}
      <section className="relative py-20 bg-gradient-to-br from-cyan-50 via-blue-50 to-teal-50 overflow-hidden">
        {/* Cool gradient mesh blobs */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-gradient-radial from-cyan-200/30 to-transparent blur-3xl animate-float" />
        <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-gradient-radial from-teal-200/30 to-transparent blur-3xl animate-float" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 right-1/3 w-72 h-72 bg-gradient-radial from-blue-200/25 to-transparent blur-3xl animate-float" style={{ animationDelay: '4s' }} />

        <div className="relative z-10 container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4 px-4 py-2 border-cyan-300 text-cyan-700">
              <Globe className="h-4 w-4 mr-2" />
              Worldwide Presence
            </Badge>
            <h2 className="text-4xl font-bold text-foreground mb-4">
              Our Global Network
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              With offices across six continents, we connect professionals worldwide
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {offices && offices.length > 0 ? (
              offices.slice(0, 4).map((office) => (
                <Card key={office.id} className="text-center border-cyan-200/50 hover:shadow-lg transition-shadow backdrop-blur-sm bg-white/80">
                  <CardHeader>
                    <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-gradient-to-br from-cyan-500 to-teal-500 flex items-center justify-center shadow-lg">
                      <Globe className="h-6 w-6 text-white" />
                    </div>
                    <CardTitle className="text-lg">{office.region}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      {office.city}, {office.country}
                    </p>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <Globe className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-semibold text-foreground mb-2">No Offices Available</h3>
                <p className="text-muted-foreground">Office locations will be displayed here when available.</p>
              </div>
            )}
          </div>

          <div className="text-center">
            <Button asChild variant="outline" size="lg" className="border-cyan-300 hover:bg-cyan-50">
              <Link to="/offices">
                View All Offices
                <Globe className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Why Join Section */}
      <section 
        className="py-20 bg-cover bg-center relative"
        style={{
          backgroundImage: `linear-gradient(rgba(33, 150, 243, 0.9), rgba(33, 150, 243, 0.8)), url(${conferenceImage})`,
        }}
      >
        <div className="container mx-auto px-4 text-white">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">
              Why Join Information Assets World?
            </h2>
            <p className="text-xl opacity-90 max-w-2xl mx-auto">
              Become part of the global community shaping the future of information management
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <Card className="bg-white/10 border-white/20 backdrop-blur-sm text-white">
              <CardHeader className="text-center">
                <Star className="h-8 w-8 mx-auto mb-3 text-accent" />
                <CardTitle>Premium Access</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-white/90">
                  Exclusive access to conferences, research papers, and industry insights
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-white/10 border-white/20 backdrop-blur-sm text-white">
              <CardHeader className="text-center">
                <Users className="h-8 w-8 mx-auto mb-3 text-accent" />
                <CardTitle>Global Network</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-white/90">
                  Connect with 10,000+ professionals across six continents
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-white/10 border-white/20 backdrop-blur-sm text-white">
              <CardHeader className="text-center">
                <TrendingUp className="h-8 w-8 mx-auto mb-3 text-accent" />
                <CardTitle>Career Growth</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-white/90">
                  Advance your career with certifications and professional development
                </p>
              </CardContent>
            </Card>
          </div>
          
          <div className="text-center">
            <Button size="lg" className="shadow-glow" asChild>
              <Link to="/membership">
                Become a Member
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <div className="mt-4">
              <Button variant="outline" size="lg" className="border-accent text-accent hover:bg-accent hover:text-white shadow-lg" asChild>
                <Link to="/auth">
                  Sign In / Create Account
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Partnership Section */}
      <section className="py-16 bg-secondary">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-4">
              Trusted By Leading Organizations
            </h2>
            <p className="text-muted-foreground mb-8">
              Partnering with industry leaders, sponsors, and clients to advance information management excellence
            </p>
          </div>

          {sponsors && sponsors.length > 0 ? (
            <div className="relative overflow-hidden py-4">
              <div className="flex gap-8 animate-scroll-logos">
                {[...sponsors, ...sponsors].map((sponsor, index) => (
                  <div
                    key={`${sponsor.id}-${index}`}
                    className="flex-shrink-0 w-48 h-24 flex items-center justify-center p-4 bg-background rounded-lg hover:shadow-lg transition-shadow duration-300"
                  >
                    {sponsor.logo_url ? (
                      <a
                        href={sponsor.website_url || '#'}
                        target={sponsor.website_url ? '_blank' : undefined}
                        rel={sponsor.website_url ? 'noopener noreferrer' : undefined}
                        className="flex items-center justify-center w-full h-full"
                      >
                        <img
                          src={sponsor.logo_url}
                          alt={sponsor.name}
                          className="max-w-full max-h-full object-contain grayscale hover:grayscale-0 transition-all duration-300"
                        />
                      </a>
                    ) : (
                      <div className="text-center w-full">
                        <p className="text-sm font-medium text-muted-foreground truncate">{sponsor.name}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                Partner organizations will be displayed here
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Index;
