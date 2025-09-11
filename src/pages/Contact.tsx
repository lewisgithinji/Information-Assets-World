import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Mail, Phone, MapPin, Clock, MessageSquare, Users, Calendar, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Contact = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    organization: '',
    subject: '',
    inquiry_type: '',
    message: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.name || !formData.email || !formData.message) {
      toast({
        title: "Please fill in required fields",
        description: "Name, email, and message are required.",
        variant: "destructive",
      });
      return;
    }

    // In a real app, this would submit to a form service
    toast({
      title: "Message sent successfully!",
      description: "We'll get back to you within 24 hours.",
    });

    // Reset form
    setFormData({
      name: '',
      email: '',
      organization: '',
      subject: '',
      inquiry_type: '',
      message: '',
    });
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const inquiryTypes = [
    { value: 'membership', label: 'Membership Inquiry' },
    { value: 'events', label: 'Event Information' },
    { value: 'partnership', label: 'Partnership Opportunity' },
    { value: 'research', label: 'Research Collaboration' },
    { value: 'advertising', label: 'Advertising & Sponsorship' },
    { value: 'support', label: 'Technical Support' },
    { value: 'other', label: 'Other' },
  ];

  const contactMethods = [
    {
      icon: Mail,
      title: 'Email Us',
      description: 'Get in touch via email',
      contact: 'info@informationassetsworld.com',
      action: 'mailto:info@informationassetsworld.com'
    },
    {
      icon: Phone,
      title: 'Call Us',
      description: 'Speak with our team directly',
      contact: '+254 700 000 000',
      action: 'tel:+254700000000'
    },
    {
      icon: MessageSquare,
      title: 'Live Chat',
      description: 'Chat with support online',
      contact: 'Available 24/7',
      action: '#'
    }
  ];

  const offices = [
    {
      region: 'Africa (Headquarters)',
      city: 'Nairobi, Kenya',
      address: 'Westlands Business District',
      phone: '+254 700 000 000',
      email: 'africa@informationassetsworld.com',
      hours: '8AM - 6PM EAT'
    },
    {
      region: 'Asia Pacific',
      city: 'Bangkok, Thailand',
      address: 'Sukhumvit Business District',
      phone: '+66 2 000 0000',
      email: 'asia@informationassetsworld.com',
      hours: '9AM - 6PM ICT'
    },
    {
      region: 'Europe',
      city: 'Brussels, Belgium',
      address: 'European Quarter',
      phone: '+32 2 000 0000',
      email: 'europe@informationassetsworld.com',
      hours: '9AM - 5PM CET'
    },
    {
      region: 'Americas',
      city: 'Columbus, USA',
      address: 'Downtown Columbus',
      phone: '+1 614 000 0000',
      email: 'americas@informationassetsworld.com',
      hours: '9AM - 5PM EST'
    }
  ];

  const supportTopics = [
    {
      icon: Users,
      title: 'Membership Support',
      description: 'Questions about membership benefits, billing, or account management',
      contact: 'membership@informationassetsworld.com'
    },
    {
      icon: Calendar,
      title: 'Event Support',
      description: 'Registration, scheduling, or technical issues with events',
      contact: 'events@informationassetsworld.com'
    },
    {
      icon: FileText,
      title: 'Research Support',
      description: 'Paper submissions, peer review process, or research collaboration',
      contact: 'research@informationassetsworld.com'
    }
  ];

  return (
    <div className="py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            Contact Us
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Get in touch with our global team. We're here to help with membership, 
            events, partnerships, and any questions you may have.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          {/* Contact Form */}
          <div className="lg:col-span-2">
            <Card className="border-card-border">
              <CardHeader>
                <CardTitle className="text-2xl">Send us a Message</CardTitle>
                <p className="text-muted-foreground">
                  Fill out the form below and we'll get back to you within 24 hours.
                </p>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        placeholder="Your full name"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        placeholder="your.email@example.com"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="organization">Organization</Label>
                      <Input
                        id="organization"
                        value={formData.organization}
                        onChange={(e) => handleInputChange('organization', e.target.value)}
                        placeholder="Your organization name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="inquiry_type">Inquiry Type</Label>
                      <Select value={formData.inquiry_type} onValueChange={(value) => handleInputChange('inquiry_type', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select inquiry type" />
                        </SelectTrigger>
                        <SelectContent>
                          {inquiryTypes.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject</Label>
                    <Input
                      id="subject"
                      value={formData.subject}
                      onChange={(e) => handleInputChange('subject', e.target.value)}
                      placeholder="Brief description of your inquiry"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Message *</Label>
                    <Textarea
                      id="message"
                      value={formData.message}
                      onChange={(e) => handleInputChange('message', e.target.value)}
                      placeholder="Please provide details about your inquiry..."
                      rows={6}
                      required
                    />
                  </div>

                  <Button type="submit" size="lg" className="w-full">
                    Send Message
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Contact Methods */}
          <div className="space-y-6">
            <Card className="border-card-border">
              <CardHeader>
                <CardTitle>Quick Contact</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {contactMethods.map((method) => {
                  const Icon = method.icon;
                  return (
                    <a
                      key={method.title}
                      href={method.action}
                      className="flex items-start gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                    >
                      <Icon className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <p className="font-medium text-foreground">{method.title}</p>
                        <p className="text-sm text-muted-foreground">{method.description}</p>
                        <p className="text-sm text-primary font-medium">{method.contact}</p>
                      </div>
                    </a>
                  );
                })}
              </CardContent>
            </Card>

            {/* Response Time */}
            <Card className="border-card-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Response Times
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">General Inquiries</span>
                  <Badge variant="secondary">24 hours</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Technical Support</span>
                  <Badge variant="secondary">4 hours</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Partnerships</span>
                  <Badge variant="secondary">48 hours</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Emergency</span>
                  <Badge variant="default">1 hour</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Support Topics */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Specialized Support
            </h2>
            <p className="text-muted-foreground">
              For specific inquiries, contact our specialized support teams directly
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {supportTopics.map((topic) => {
              const Icon = topic.icon;
              return (
                <Card key={topic.title} className="text-center border-card-border">
                  <CardHeader>
                    <div className="w-12 h-12 mx-auto mb-4 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-lg">{topic.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                      {topic.description}
                    </p>
                    <a
                      href={`mailto:${topic.contact}`}
                      className="text-sm text-primary hover:underline font-medium"
                    >
                      {topic.contact}
                    </a>
                  </CardContent>
                </Card>
              );
            })}
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
              <Card key={office.region} className="border-card-border">
                <CardHeader>
                  <CardTitle className="text-lg">{office.region}</CardTitle>
                  <p className="text-muted-foreground">{office.city}</p>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <span className="text-muted-foreground">{office.address}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <a href={`tel:${office.phone}`} className="text-primary hover:underline">
                      {office.phone}
                    </a>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <a href={`mailto:${office.email}`} className="text-primary hover:underline">
                      {office.email}
                    </a>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">{office.hours}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;