import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Calendar, FileText, Globe, Users, Star, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import Hero from '@/components/Hero';
import EventCard from '@/components/EventCard';
import PaperCard from '@/components/PaperCard';
import { sampleEvents, samplePapers, globalOffices } from '@/data/content';
import conferenceImage from '@/assets/conference-image.jpg';

const Index = () => {
  const featuredEvents = sampleEvents.filter(event => event.featured).slice(0, 3);
  const latestPapers = samplePapers.slice(0, 3);
  const sponsorLogos = [
    'Microsoft', 'IBM', 'Oracle', 'SAP', 'Salesforce', 'Amazon'
  ];

  return (
    <div>
      <Hero />
      
      {/* Featured Events Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">
              Upcoming Featured Events
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Join industry leaders at our premier conferences and networking events worldwide
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {featuredEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
          
          <div className="text-center">
            <Button asChild size="lg">
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
            {latestPapers.map((paper) => (
              <PaperCard key={paper.id} paper={paper} />
            ))}
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
            {globalOffices.slice(0, 4).map((office) => (
              <Card key={`${office.city}-${office.country}`} className="text-center border-card-border">
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
                  {office.isHeadquarters && (
                    <Badge className="mt-2" variant="secondary">
                      Headquarters
                    </Badge>
                  )}
                </CardContent>
              </Card>
            ))}
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
              <Button variant="outline" size="lg" asChild>
                <Link to="/auth">
                  Sign In / Create Account
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Sponsors Section */}
      <section className="py-16 bg-secondary">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-4">
              Trusted by Industry Leaders
            </h2>
          </div>
          
          <div className="flex flex-wrap justify-center items-center gap-8 opacity-60">
            {sponsorLogos.map((sponsor) => (
              <div key={sponsor} className="text-2xl font-bold text-muted-foreground">
                {sponsor}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
