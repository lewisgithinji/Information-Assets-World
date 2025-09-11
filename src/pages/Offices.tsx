import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Phone, Mail, Clock, Users, Building } from 'lucide-react';
import { globalOffices } from '@/data/content';

const Offices = () => {
  const [selectedRegion, setSelectedRegion] = useState<string>('all');

  const regions = ['all', ...Array.from(new Set(globalOffices.map(office => office.region)))];

  const filteredOffices = selectedRegion === 'all' 
    ? globalOffices 
    : globalOffices.filter(office => office.region === selectedRegion);

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
    <div className="py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            Our Global Offices
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            With offices across six continents, we provide local expertise and support 
            to information professionals worldwide.
          </p>
        </div>

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
            <div className="text-3xl font-bold text-primary mb-2">{globalOffices.length}</div>
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
                  {office.isHeadquarters && (
                    <Badge variant="default" className="text-xs">
                      Headquarters
                    </Badge>
                  )}
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
                <div className="flex items-start gap-3">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div className="text-sm text-foreground/80">
                    {office.address}
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <a 
                    href={`tel:${office.phone}`}
                    className="text-sm text-primary hover:underline"
                  >
                    {office.phone}
                  </a>
                </div>
                
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <a 
                    href={`mailto:${office.email}`}
                    className="text-sm text-primary hover:underline"
                  >
                    {office.email}
                  </a>
                </div>
                
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
            {Array.from(new Set(globalOffices.map(office => office.region))).map((region) => {
              const regionOffices = globalOffices.filter(office => office.region === region);
              const headquarters = regionOffices.find(office => office.isHeadquarters);
              
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
                          {office.isHeadquarters && (
                            <Badge variant="outline" className="text-xs">HQ</Badge>
                          )}
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
  );
};

export default Offices;