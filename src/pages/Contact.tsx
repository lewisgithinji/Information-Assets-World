import PageHero from '@/components/PageHero';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Mail, Phone, MapPin, Clock, Globe, Users, MessageSquare, Building2, Loader2, Calendar } from 'lucide-react';
import { useOffices } from '@/hooks/useOffices';
import OfficeContactInfo from '@/components/OfficeContactInfo';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    region: '',
  });
  
  const { data: offices = [], isLoading } = useOffices();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-subtle flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
          <p className="text-muted-foreground">Loading contact information...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Hero Section with PageHero component */}
      <PageHero
        title="Get in Touch"
        description="Connect with our global team of information asset experts"
        gradient="purple"
      />

      <div className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          {/* Contact Methods */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20">
            {/* Contact Form */}
            <div>
              <Card className="border-card-border">
                <CardHeader>
                  <CardTitle className="text-2xl flex items-center gap-3">
                    <MessageSquare className="h-6 w-6 text-primary" />
                    Send us a Message
                  </CardTitle>
                  <CardDescription>
                    Fill out the form below and we'll get back to you within 24 hours.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name">Full Name</Label>
                        <Input
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="email">Email Address</Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="region">Preferred Contact Region</Label>
                      <Select value={formData.region} onValueChange={(value) => handleSelectChange('region', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a region" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="global">Global Headquarters</SelectItem>
                          <SelectItem value="africa">Africa</SelectItem>
                          <SelectItem value="asia">Asia Pacific</SelectItem>
                          <SelectItem value="europe">Europe</SelectItem>
                          <SelectItem value="americas">Americas</SelectItem>
                          <SelectItem value="oceania">Oceania</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="subject">Subject</Label>
                      <Input
                        id="subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleInputChange}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="message">Message</Label>
                      <Textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleInputChange}
                        rows={6}
                        required
                      />
                    </div>

                    <Button type="submit" className="w-full" size="lg">
                      Send Message
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Contact Information */}
            <div className="space-y-8">
              <Card className="border-card-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <Building2 className="h-5 w-5 text-primary" />
                    Global Headquarters
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>Westlands Business District, Nairobi, Kenya</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <a href="tel:+254700000000" className="text-primary hover:underline">
                      +254 700 000 000
                    </a>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <a href="mailto:info@informationassetsworld.com" className="text-primary hover:underline">
                      info@informationassetsworld.com
                    </a>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>8:00 AM - 6:00 PM EAT</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-card-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <Globe className="h-5 w-5 text-primary" />
                    24/7 Support
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Need immediate assistance? Our global support team is available around the clock.
                  </p>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <a href="mailto:support@informationassetsworld.com" className="text-primary hover:underline">
                        support@informationassetsworld.com
                      </a>
                    </div>
                    <div className="flex items-center gap-3">
                      <MessageSquare className="h-4 w-4 text-muted-foreground" />
                      <span>Live Chat Available</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-card-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <Users className="h-5 w-5 text-primary" />
                    Partnership Inquiries
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Interested in partnering with us? Let's explore opportunities together.
                  </p>
                  <Button variant="outline" className="w-full">
                    <Mail className="h-4 w-4 mr-2" />
                    partnerships@informationassetsworld.com
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mb-20">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-foreground mb-4">
                Quick Actions
              </h2>
              <p className="text-muted-foreground">
                Looking for something specific? These shortcuts might help.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="text-center hover:shadow-lg transition-shadow border-card-border">
                <CardContent className="p-8">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Calendar className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Event Registration</h3>
                  <p className="text-muted-foreground mb-4">
                    Register for upcoming conferences and workshops
                  </p>
                  <Button>Browse Events</Button>
                </CardContent>
              </Card>

              <Card className="text-center hover:shadow-lg transition-shadow border-card-border">
                <CardContent className="p-8">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Membership</h3>
                  <p className="text-muted-foreground mb-4">
                    Join our global network of information professionals
                  </p>
                  <Button>Join Network</Button>
                </CardContent>
              </Card>

              <Card className="text-center hover:shadow-lg transition-shadow border-card-border">
                <CardContent className="p-8">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MessageSquare className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Media Inquiries</h3>
                  <p className="text-muted-foreground mb-4">
                    Press releases, interviews, and media resources
                  </p>
                  <Button>Media Center</Button>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Global Offices */}
          <div>
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-foreground mb-4">
                Our Global Offices
              </h2>
              <p className="text-muted-foreground">
                Reach out to your nearest regional office for local support
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {offices.map((office) => (
                <Card key={office.id} className="border-card-border">
                  <CardHeader>
                    <CardTitle className="text-lg">{office.region}</CardTitle>
                    <p className="text-muted-foreground">{office.city}, {office.country}</p>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    <OfficeContactInfo office={office} showAddress={true} />
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Business Hours: 9AM - 6PM Local</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};