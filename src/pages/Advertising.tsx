import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Check, Users, Eye, Globe, Calendar, FileText, Target, TrendingUp } from 'lucide-react';

const Advertising = () => {
  const sponsorshipPackages = [
    {
      name: 'Platinum',
      price: 25000,
      description: 'Maximum visibility and exclusive benefits',
      features: [
        'Logo on all event materials',
        'Premium booth location',
        '4 conference passes',
        'Speaking opportunity',
        'Exclusive networking reception',
        'Website banner placement',
        'Newsletter mentions (6 months)',
        'Research paper co-branding',
        'Custom webinar opportunity'
      ],
      color: 'from-gray-400 to-gray-600',
      popular: true
    },
    {
      name: 'Gold',
      price: 15000,
      description: 'Strong brand presence and great value',
      features: [
        'Logo on select materials',
        'Standard booth location',
        '2 conference passes',
        'Website listing',
        'Newsletter mentions (3 months)',
        'Social media promotion',
        'Event app advertisement',
        'Networking reception access'
      ],
      color: 'from-yellow-400 to-yellow-600',
      popular: false
    },
    {
      name: 'Silver',
      price: 8000,
      description: 'Cost-effective marketing solution',
      features: [
        'Logo on website',
        'Standard booth space',
        '1 conference pass',
        'Newsletter mention',
        'Social media acknowledgment',
        'Event materials insert',
        'Networking access'
      ],
      color: 'from-gray-300 to-gray-500',
      popular: false
    },
    {
      name: 'Bronze',
      price: 3000,
      description: 'Entry-level sponsorship option',
      features: [
        'Website listing',
        'Small booth space',
        'Newsletter mention',
        'Conference materials insert',
        'Basic networking access'
      ],
      color: 'from-amber-600 to-amber-800',
      popular: false
    }
  ];

  const advertisingOptions = [
    {
      type: 'Website Banner',
      reach: '50,000+ monthly visitors',
      formats: ['Leaderboard (728x90)', 'Rectangle (300x250)', 'Skyscraper (160x600)'],
      pricing: 'From $500/month',
      description: 'Prime placement on our high-traffic website'
    },
    {
      type: 'Newsletter Advertising',
      reach: '10,000+ subscribers',
      formats: ['Header Banner', 'Inline Content', 'Footer Placement'],
      pricing: 'From $800/insertion',
      description: 'Reach engaged professionals in their inbox'
    },
    {
      type: 'Conference App Ads',
      reach: '5,000+ active users per event',
      formats: ['Splash Screen', 'Banner Ads', 'Sponsored Content'],
      pricing: 'From $1,200/event',
      description: 'Target attendees during conferences and events'
    },
    {
      type: 'Research Paper Sponsorship',
      reach: '25,000+ annual downloads',
      formats: ['Cover Page Logo', 'Branded Header', 'Sponsored Section'],
      pricing: 'From $2,000/paper',
      description: 'Associate with cutting-edge research content'
    }
  ];

  const audienceStats = [
    { metric: '10,000+', label: 'Global Members', icon: Users },
    { metric: '50,000+', label: 'Monthly Website Visitors', icon: Eye },
    { metric: '25', label: 'Countries Represented', icon: Globe },
    { metric: '50+', label: 'Annual Events', icon: Calendar }
  ];

  const industryBreakdown = [
    { sector: 'Technology & Software', percentage: 35 },
    { sector: 'Financial Services', percentage: 25 },
    { sector: 'Healthcare & Life Sciences', percentage: 15 },
    { sector: 'Government & Public Sector', percentage: 12 },
    { sector: 'Education & Research', percentage: 8 },
    { sector: 'Other Industries', percentage: 5 }
  ];

  const benefits = [
    {
      icon: Target,
      title: 'Targeted Audience',
      description: 'Reach decision-makers and professionals specifically interested in information management and data governance.'
    },
    {
      icon: Globe,
      title: 'Global Reach',
      description: 'Connect with professionals across six continents through our worldwide network of offices and events.'
    },
    {
      icon: TrendingUp,
      title: 'Thought Leadership',
      description: 'Position your brand as an industry leader through association with cutting-edge research and expert content.'
    },
    {
      icon: Users,
      title: 'Community Access',
      description: 'Engage with an active community of 10,000+ information professionals and researchers.'
    }
  ];

  return (
    <div className="py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            Advertising & Sponsorship
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Connect with the global information management community through our 
            targeted advertising and sponsorship opportunities.
          </p>
        </div>

        {/* Audience Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          {audienceStats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.label} className="text-center border-card-border">
                <CardContent className="p-6">
                  <Icon className="h-8 w-8 text-primary mx-auto mb-3" />
                  <div className="text-2xl font-bold text-foreground mb-1">
                    {stat.metric}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {stat.label}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Benefits */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Why Partner With Us?
            </h2>
            <p className="text-muted-foreground">
              Discover the unique advantages of advertising with Information Assets World
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit) => {
              const Icon = benefit.icon;
              return (
                <Card key={benefit.title} className="text-center border-card-border">
                  <CardHeader>
                    <div className="w-12 h-12 mx-auto mb-4 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-lg">{benefit.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {benefit.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Advertising Options */}
        <div className="mb-16">
          <Tabs defaultValue="sponsorship" className="w-full">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-foreground mb-4">
                Advertising Solutions
              </h2>
              <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
                <TabsTrigger value="sponsorship">Event Sponsorship</TabsTrigger>
                <TabsTrigger value="digital">Digital Advertising</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="sponsorship">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {sponsorshipPackages.map((pkg) => (
                  <Card 
                    key={pkg.name} 
                    className={`relative h-full ${pkg.popular ? 'border-primary ring-1 ring-primary' : 'border-card-border'}`}
                  >
                    {pkg.popular && (
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                        <Badge className="bg-primary text-primary-foreground">
                          Most Popular
                        </Badge>
                      </div>
                    )}
                    
                    <CardHeader className="text-center">
                      <div className={`w-16 h-16 mx-auto mb-4 rounded-lg bg-gradient-to-r ${pkg.color} flex items-center justify-center`}>
                        <span className="text-white font-bold text-lg">{pkg.name[0]}</span>
                      </div>
                      <CardTitle className="text-xl">{pkg.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">{pkg.description}</p>
                      <div className="mt-4">
                        <div className="text-3xl font-bold text-foreground">
                          ${pkg.price.toLocaleString()}
                        </div>
                        <div className="text-sm text-muted-foreground">per event</div>
                      </div>
                    </CardHeader>
                    
                    <CardContent>
                      <ul className="space-y-2">
                        {pkg.features.map((feature, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                            <span className="text-sm text-foreground/80">{feature}</span>
                          </li>
                        ))}
                      </ul>
                      
                      <Button 
                        className={`w-full mt-6 ${pkg.popular ? 'shadow-lg' : ''}`}
                        variant={pkg.popular ? 'default' : 'outline'}
                      >
                        Get Started
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="digital">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {advertisingOptions.map((option) => (
                  <Card key={option.type} className="border-card-border">
                    <CardHeader>
                      <CardTitle className="text-xl">{option.type}</CardTitle>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Eye className="h-4 w-4" />
                          {option.reach}
                        </span>
                        <Badge variant="secondary">{option.pricing}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground mb-4">{option.description}</p>
                      
                      <div className="space-y-3">
                        <h4 className="font-medium text-foreground">Available Formats:</h4>
                        <div className="flex flex-wrap gap-2">
                          {option.formats.map((format) => (
                            <Badge key={format} variant="outline">
                              {format}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      <Button variant="outline" className="w-full mt-6">
                        Learn More
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Audience Breakdown */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Our Audience
            </h2>
            <p className="text-muted-foreground">
              Professional breakdown of our global community
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <Card className="border-card-border">
              <CardContent className="p-8">
                <div className="space-y-4">
                  {industryBreakdown.map((industry) => (
                    <div key={industry.sector} className="flex items-center justify-between">
                      <span className="text-foreground font-medium">{industry.sector}</span>
                      <div className="flex items-center gap-4 flex-1 max-w-md">
                        <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-primary rounded-full"
                            style={{ width: `${industry.percentage}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-muted-foreground w-8">
                          {industry.percentage}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <Card className="bg-gradient-to-r from-primary to-teal text-white border-0">
            <CardContent className="p-12">
              <h2 className="text-3xl font-bold mb-4">
                Ready to Reach Our Community?
              </h2>
              <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
                Let's discuss how we can help you connect with information 
                professionals worldwide through our advertising and sponsorship opportunities.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="bg-white text-primary hover:bg-white/90">
                  Request Media Kit
                </Button>
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                  Schedule Consultation
                </Button>
              </div>
              
              <div className="mt-8 pt-8 border-t border-white/20">
                <p className="text-white/80">
                  For custom packages and partnership opportunities, contact our advertising team at{' '}
                  <a href="mailto:advertising@informationassetsworld.com" className="text-white font-medium hover:underline">
                    advertising@informationassetsworld.com
                  </a>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Advertising;