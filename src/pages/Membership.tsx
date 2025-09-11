import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Check, Star, Users, Globe, Calendar, FileText, Award, Network, Crown } from 'lucide-react';

const Membership = () => {
  const membershipTiers = [
    {
      name: 'Individual',
      price: 99,
      period: 'year',
      description: 'Perfect for individual professionals',
      icon: Users,
      features: [
        'Access to all conferences',
        'Research paper library',
        'Monthly newsletters',
        'Basic networking directory',
        'Event recordings (90 days)',
        'Email support'
      ],
      popular: false
    },
    {
      name: 'Professional',
      price: 299,
      period: 'year',
      description: 'Enhanced access for industry professionals',
      icon: Star,
      features: [
        'Everything in Individual',
        'Priority event registration',
        'Exclusive member webinars',
        'Advanced networking tools',
        'Event recordings (1 year)',
        'Research collaboration tools',
        'Certificate programs',
        'Phone & email support'
      ],
      popular: true
    },
    {
      name: 'Corporate',
      price: 999,
      period: 'year',
      description: 'Complete solution for organizations',
      icon: Crown,
      features: [
        'Everything in Professional',
        'Up to 10 team members',
        'Custom training programs',
        'Dedicated account manager',
        'Branded research portal',
        'Speaking opportunities',
        'Sponsorship discounts',
        'Priority support',
        'Custom integrations'
      ],
      popular: false
    }
  ];

  const benefits = [
    {
      icon: Calendar,
      title: 'Exclusive Events',
      description: 'Access to 50+ annual events including conferences, exhibitions, and galas worldwide.'
    },
    {
      icon: FileText,
      title: 'Research Library',
      description: 'Complete access to our growing library of peer-reviewed research papers and publications.'
    },
    {
      icon: Network,
      title: 'Global Network',
      description: 'Connect with 10,000+ professionals across six continents in information management.'
    },
    {
      icon: Award,
      title: 'Professional Development',
      description: 'Earn certificates and credentials recognized throughout the information management industry.'
    },
    {
      icon: Globe,
      title: 'Local Chapters',
      description: 'Join local chapters in major cities worldwide for networking and professional growth.'
    },
    {
      icon: Users,
      title: 'Expert Community',
      description: 'Learn from and collaborate with industry leaders, researchers, and practitioners.'
    }
  ];

  const faqs = [
    {
      question: 'What is included in the membership fee?',
      answer: 'Membership includes access to all events, research papers, networking tools, and member-exclusive content. Higher tiers include additional benefits like priority registration and dedicated support.'
    },
    {
      question: 'Can I cancel my membership anytime?',
      answer: 'Yes, you can cancel your membership at any time. Your access will continue until the end of your current billing period.'
    },
    {
      question: 'Do you offer student discounts?',
      answer: 'Yes, we offer a 50% discount for verified students and recent graduates. Please contact our membership team for more information.'
    },
    {
      question: 'Are there regional pricing options?',
      answer: 'We offer special pricing for members in developing countries. Please reach out to our team to learn about regional discounts.'
    },
    {
      question: 'What payment methods do you accept?',
      answer: 'We accept all major credit cards, PayPal, and bank transfers. Corporate memberships can also be invoiced.'
    },
    {
      question: 'Can I upgrade my membership later?',
      answer: 'Yes, you can upgrade your membership at any time. You\'ll only pay the prorated difference for the remaining period.'
    }
  ];

  return (
    <div className="py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            Join the Global Information Network
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Connect with industry leaders, access cutting-edge research, and advance your career 
            in information management and data governance.
          </p>
        </div>

        {/* Membership Tiers */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Choose Your Membership
            </h2>
            <p className="text-muted-foreground">
              Select the plan that best fits your professional needs
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {membershipTiers.map((tier) => {
              const Icon = tier.icon;
              return (
                <Card 
                  key={tier.name} 
                  className={`relative h-full ${tier.popular ? 'border-primary shadow-primary ring-1 ring-primary' : 'border-card-border'}`}
                >
                  {tier.popular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-primary text-primary-foreground">
                        Most Popular
                      </Badge>
                    </div>
                  )}
                  
                  <CardHeader className="text-center pb-8">
                    <div className="w-12 h-12 mx-auto mb-4 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-2xl">{tier.name}</CardTitle>
                    <p className="text-muted-foreground">{tier.description}</p>
                    <div className="mt-6">
                      <div className="text-4xl font-bold text-foreground">
                        ${tier.price}
                      </div>
                      <div className="text-muted-foreground">
                        per {tier.period}
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="px-6">
                    <ul className="space-y-3">
                      {tier.features.map((feature, index) => (
                        <li key={index} className="flex items-start gap-3">
                          <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-foreground/80">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                  
                  <CardFooter className="px-6 pb-6 mt-auto">
                    <Button 
                      className={`w-full ${tier.popular ? 'shadow-lg' : ''}`}
                      variant={tier.popular ? 'default' : 'outline'}
                      size="lg"
                    >
                      Get Started
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Benefits Section */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Member Benefits & Opportunities
            </h2>
            <p className="text-muted-foreground">
              Discover what you'll gain as part of our global community
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {benefits.map((benefit) => {
              const Icon = benefit.icon;
              return (
                <Card key={benefit.title} className="text-center border-card-border">
                  <CardHeader>
                    <div className="w-12 h-12 mx-auto mb-4 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-xl">{benefit.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground leading-relaxed">
                      {benefit.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Stats Section */}
        <div className="mb-20 text-center">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            <div className="space-y-2">
              <div className="text-3xl font-bold text-primary">10,000+</div>
              <div className="text-muted-foreground">Global Members</div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold text-primary">50+</div>
              <div className="text-muted-foreground">Annual Events</div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold text-primary">200+</div>
              <div className="text-muted-foreground">Research Papers</div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold text-primary">25</div>
              <div className="text-muted-foreground">Countries</div>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-muted-foreground">
              Find answers to common questions about membership
            </p>
          </div>

          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`} className="border border-border rounded-lg px-6">
                <AccordionTrigger className="text-left hover:no-underline py-6">
                  <span className="font-medium">{faq.question}</span>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-6">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        {/* CTA Section */}
        <div className="mt-20 text-center">
          <div className="bg-gradient-to-r from-primary to-teal rounded-lg p-12 text-white">
            <h2 className="text-3xl font-bold mb-4">
              Ready to Join Our Community?
            </h2>
            <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
              Start your journey with Information Assets World today and connect 
              with professionals shaping the future of information management.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-white text-primary hover:bg-white/90">
                Start Membership
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                Schedule Demo
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Membership;