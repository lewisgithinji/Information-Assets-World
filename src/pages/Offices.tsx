import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Clock, Users, Building, Loader2 } from 'lucide-react';
import { useOffices } from '@/hooks/useOffices';
import OfficeContactInfo from '@/components/OfficeContactInfo';
import PageHero from '@/components/PageHero';

const Offices = () => {
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const { data: offices = [], isLoading, error } = useOffices();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-subtle flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
          <p className="text-muted-foreground">Loading offices...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-subtle flex items-center justify-center">
        <div className="text-center">
          <p className="text-destructive mb-4">Failed to load offices</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
    );
  }

  const regions = ['all', ...Array.from(new Set(offices.map(office => office.region)))];

  const filteredOffices = selectedRegion === 'all' 
    ? offices 
    : offices.filter(office => office.region === selectedRegion);

  const getRegionColor = (region: string) => {
    const colors: Record<string, string> = {
      'Africa': 'bg-green-500',
      'Asia': 'bg-blue-500',
      'Europe': 'bg-purple-500',
      'North America': 'bg-red-500',
      'South America': 'bg-orange-500',
      'Oceania': 'bg-teal-500',
    };
    return colors[region] || 'bg-gray-500';
  };

  return (
    <div>
      <PageHero
        title="Our Global Offices"
        description="With offices across six continents, we provide local expertise and support to information professionals worldwide"
        gradient="purple"
      />
      
      <div className="py-12">
        <div className="container mx-auto px-4">

        {/* Region Filter */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {regions.map((region) => (
            <Button
              key={region}
              variant={selectedRegion === region ? 'default' : 'outline'}
              onClick={() => setSelectedRegion(region)}
              className="capitalize"
            >
              {region === 'all' ? 'All Regions' : region}
            </Button>
          ))}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16 max-w-4xl mx-auto">
          <div className="text-center">
            <div className="text-3xl font-bold text-primary mb-2">{offices.length}</div>
            <div className="text-muted-foreground">Global Offices</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-primary mb-2">6</div>
            <div className="text-muted-foreground">Continents</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-primary mb-2">24/7</div>
            <div className="text-muted-foreground">Global Support</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-primary mb-2">25+</div>
            <div className="text-muted-foreground">Countries</div>
          </div>
        </div>

        {/* Offices Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {filteredOffices.map((office) => (
            <Card key={`${office.city}-${office.country}`} className="hover:shadow-lg transition-shadow border-card-border">
              <CardHeader>
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-3 h-3 rounded-full ${getRegionColor(office.region)}`}></div>
                </div>
                <CardTitle className="text-xl flex items-center gap-2">
                  <Building className="h-5 w-5 text-primary" />
                  {office.region}
                </CardTitle>
                <p className="text-lg font-semibold text-foreground">
                  {office.city}, {office.country}
                </p>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <OfficeContactInfo office={office} />
                
                <div className="flex items-center gap-3">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    Business Hours: 9AM - 6PM Local Time
                  </span>
                </div>

                <div className="pt-4 border-t border-border">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                    <Users className="h-4 w-4" />
                    Services Available:
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary" className="text-xs">Conferences</Badge>
                    <Badge variant="secondary" className="text-xs">Training</Badge>
                    <Badge variant="secondary" className="text-xs">Consulting</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Contact Section */}
        <div className="text-center">
          <Card className="max-w-2xl mx-auto border-card-border">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-foreground mb-4">
                Need Help Finding the Right Office?
              </h2>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                Our team can help connect you with the most relevant regional office 
                for your needs, whether you're looking for local events, training, 
                or partnership opportunities.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg">
                  Contact Global Team
                </Button>
                <Button size="lg" variant="outline">
                  Schedule Consultation
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Regional Highlights */}
        <div className="mt-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Regional Highlights
            </h2>
            <p className="text-muted-foreground">
              Discover what makes each region unique in our global network
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from(new Set(offices.map(office => office.region))).map((region) => {
              const regionOffices = offices.filter(office => office.region === region);
              
              return (
                <Card key={region} className="text-center border-card-border">
                  <CardHeader>
                    <div className={`w-8 h-8 mx-auto mb-4 rounded-full ${getRegionColor(region)}`}></div>
                    <CardTitle className="text-xl">{region}</CardTitle>
                    <p className="text-muted-foreground">
                      {regionOffices.length} office{regionOffices.length !== 1 ? 's' : ''}
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm text-muted-foreground">
                      {regionOffices.map((office) => (
                        <div key={`${office.city}-${office.country}`} className="flex items-center justify-center gap-2">
                          <span>{office.city}, {office.country}</span>
                        </div>
                      ))}
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-4"
                      onClick={() => setSelectedRegion(region)}
                    >
                      View Details
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
        </div>
      </div>
    </div>
  );
};

export default Offices;