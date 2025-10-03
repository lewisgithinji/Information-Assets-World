import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Calendar, FileText, Globe, Users, Star, TrendingUp, BarChart3, Award, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import Hero from '@/components/Hero';
import EventCard from '@/components/EventCard';
import PaperCard from '@/components/PaperCard';
import { useEvents } from '@/hooks/useEvents';
import { usePapers } from '@/hooks/usePapers';
import { useOffices } from '@/hooks/useOffices';
import { adaptDatabaseEvent } from '@/utils/eventAdapters';
import conferenceImage from '@/assets/conference-image.jpg';

const Index = () => {
  const { data: databaseEvents } = useEvents();
  const { data: databasePapers } = usePapers();
  const { data: offices } = useOffices();
  
  // Use only database events
  const events = databaseEvents ? databaseEvents.map(adaptDatabaseEvent) : [];
  const papers = databasePapers || [];
  
  const featuredEvents = events.filter(event => event.featured).slice(0, 3);
  const latestPapers = papers.slice(0, 3);

  return (
    <div>
      <Hero />
      
      {/* Enhanced Statistics Section */}
      <section className="py-20 bg-secondary/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">
              Our Global Impact
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Leading the future of information management across industries and continents
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="text-center border-card-border shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <CardHeader>
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                  <Calendar className="h-8 w-8 text-primary" />
                </div>
                <div className="text-3xl font-bold text-foreground mb-2">78+</div>
                <CardTitle className="text-lg">Annual Events</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Conferences, workshops, and networking events worldwide</p>
              </CardContent>
            </Card>

            <Card className="text-center border-card-border shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <CardHeader>
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-teal/10 flex items-center justify-center">
                  <FileText className="h-8 w-8 text-teal" />
                </div>
                <div className="text-3xl font-bold text-foreground mb-2">90+</div>
                <CardTitle className="text-lg">Research Papers</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Peer-reviewed research in information management</p>
              </CardContent>
            </Card>

            <Card className="text-center border-card-border shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <CardHeader>
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-accent/10 flex items-center justify-center">
                  <Users className="h-8 w-8 text-accent" />
                </div>
                <div className="text-3xl font-bold text-foreground mb-2">5,000+</div>
                <CardTitle className="text-lg">Global Members</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Professionals from leading organizations</p>
              </CardContent>
            </Card>

            <Card className="text-center border-card-border shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <CardHeader>
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary-light/20 flex items-center justify-center">
                  <Globe className="h-8 w-8 text-primary" />
                </div>
                <div className="text-3xl font-bold text-foreground mb-2">18+</div>
                <CardTitle className="text-lg">Countries</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Spanning six continents with local expertise</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
      {/* Enhanced Featured Events Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4 px-4 py-2">
              <Clock className="h-4 w-4 mr-2" />
              Upcoming Events
            </Badge>
            <h2 className="text-4xl font-bold text-foreground mb-6">
              Featured Professional Events
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
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
                <Calendar className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-semibold text-foreground mb-2">No Events Available</h3>
                <p className="text-muted-foreground">Featured events will be displayed here when available.</p>
              </div>
            )}
          </div>
          
          <div className="text-center">
            <Button asChild size="lg" className="shadow-primary">
              <Link to="/events">
                View All Events
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Latest Research Section */}
      <section className="py-20 bg-secondary">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
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
            <Button asChild variant="outline" size="lg">
              <Link to="/papers">
                Explore Research Library
                <FileText className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Global Network Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
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
                <Card key={office.id} className="text-center border-card-border">
                  <CardHeader>
                    <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-primary/10 flex items-center justify-center">
                      <Globe className="h-6 w-6 text-primary" />
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
            <Button asChild variant="outline" size="lg">
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
          <div className="text-center">
            <h2 className="text-2xl font-bold text-foreground mb-4">
              Building Strategic Partnerships
            </h2>
            <p className="text-muted-foreground">
              Connecting with leading organizations to advance information management excellence
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
