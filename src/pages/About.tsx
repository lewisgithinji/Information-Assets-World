import PageHero from '@/components/PageHero';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Target, Eye, Award, Globe, TrendingUp } from 'lucide-react';

const About = () => {
  const values = [
    {
      icon: Globe,
      title: 'Global Collaboration',
      description: 'We believe in the power of worldwide collaboration to advance information management practices.'
    },
    {
      icon: Award,
      title: 'Excellence',
      description: 'We maintain the highest standards in research, events, and professional development programs.'
    },
    {
      icon: Users,
      title: 'Community',
      description: 'Our strength lies in our diverse community of practitioners, researchers, and thought leaders.'
    },
    {
      icon: TrendingUp,
      title: 'Innovation',
      description: 'We drive innovation in information management through cutting-edge research and technology adoption.'
    }
  ];

  const milestones = [
    {
      year: '2010',
      title: 'Foundation',
      description: 'Information Assets World was founded by Dr. Simon Gichuki in Nairobi, Kenya.'
    },
    {
      year: '2015',
      title: 'Global Expansion',
      description: 'Opened regional offices in Bangkok, Brussels, and Columbus, establishing a global presence.'
    },
    {
      year: '2018',
      title: '10,000 Members',
      description: 'Reached 10,000+ members worldwide, becoming the leading network in information management.'
    },
    {
      year: '2020',
      title: 'Digital Transformation',
      description: 'Launched virtual conferences and digital research platform during the global pandemic.'
    },
    {
      year: '2024',
      title: 'Innovation Hub',
      description: 'Established the Global Information Innovation Hub for emerging technologies research.'
    }
  ];

  const leadership = [
    {
      name: 'Dr. Simon Gichuki',
      title: 'Founder & CEO',
      bio: 'Renowned expert in information management with over 20 years of experience in data governance, digital transformation, and organizational change management.',
      expertise: ['Data Governance', 'Digital Strategy', 'Organizational Development']
    },
    {
      name: 'Dr. Maria Santos',
      title: 'Chief Research Officer',
      bio: 'Leading researcher in information science with expertise in AI applications for data management and privacy-preserving technologies.',
      expertise: ['AI & Data Science', 'Privacy Engineering', 'Research Methodology']
    },
    {
      name: 'James Chen',
      title: 'Global Events Director',
      bio: 'International conference organizer with experience managing large-scale professional events across six continents.',
      expertise: ['Event Management', 'Global Operations', 'Professional Networking']
    }
  ];

  return (
    <div>
      {/* Hero Section with PageHero component */}
      <PageHero
        title="About Information Assets World"
        description="We are the global network connecting information professionals, researchers, and organizations to advance the field of information management and data governance."
        gradient="primary"
      />

      <div className="py-12">
        <div className="container mx-auto px-4">
          {/* Mission & Vision */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-20">
            <Card className="border-card-border">
              <CardHeader>
                <div className="flex items-center gap-3 mb-4">
                  <Target className="h-8 w-8 text-primary" />
                  <CardTitle className="text-2xl">Our Mission</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-lg text-foreground/80 leading-relaxed">
                  To empower organizations and professionals worldwide with the knowledge, 
                  tools, and networks needed to effectively manage information assets and 
                  drive digital transformation in the modern economy.
                </p>
              </CardContent>
            </Card>

            <Card className="border-card-border">
              <CardHeader>
                <div className="flex items-center gap-3 mb-4">
                  <Eye className="h-8 w-8 text-primary" />
                  <CardTitle className="text-2xl">Our Vision</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-lg text-foreground/80 leading-relaxed">
                  To be the world's leading platform for information management excellence, 
                  fostering innovation and best practices that shape the future of how 
                  organizations create, manage, and leverage their information assets.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Founder Story */}
          <div className="mb-20">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-foreground mb-4">
                Founder's Story
              </h2>
              <p className="text-muted-foreground">
                The vision behind Information Assets World
              </p>
            </div>

            <Card className="max-w-4xl mx-auto border-card-border">
              <CardContent className="p-8">
                <div className="flex flex-col md:flex-row gap-8 items-start">
                  <div className="md:w-1/3">
                    <div className="w-32 h-32 mx-auto md:mx-0 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                      <Users className="h-16 w-16 text-primary" />
                    </div>
                    <div className="text-center md:text-left">
                      <h3 className="text-xl font-bold text-foreground">Dr. Simon Gichuki</h3>
                      <p className="text-muted-foreground">Founder & CEO</p>
                      <div className="flex flex-wrap gap-2 mt-3 justify-center md:justify-start">
                        <Badge variant="secondary">Data Governance</Badge>
                        <Badge variant="secondary">Digital Strategy</Badge>
                      </div>
                    </div>
                  </div>
                  <div className="md:w-2/3">
                    <p className="text-foreground/80 leading-relaxed mb-4">
                      "In 2010, I recognized that information management professionals lacked 
                      a global platform to share knowledge, collaborate on research, and advance 
                      the field together. Having worked with organizations across Africa, Europe, 
                      and Asia, I witnessed firsthand the challenges they faced in managing their 
                      information assets effectively."
                    </p>
                    <p className="text-foreground/80 leading-relaxed">
                      "Information Assets World was born from the belief that by connecting 
                      professionals worldwide, we could accelerate innovation and establish 
                      best practices that benefit organizations of all sizes. Today, our network 
                      spans six continents and continues to grow, united by our shared mission 
                      to advance the field of information management."
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Values */}
          <div className="mb-20">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-foreground mb-4">
                Our Core Values
              </h2>
              <p className="text-muted-foreground">
                The principles that guide everything we do
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {values.map((value) => {
                const Icon = value.icon;
                return (
                  <Card key={value.title} className="text-center border-card-border">
                    <CardHeader>
                      <div className="w-12 h-12 mx-auto mb-4 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Icon className="h-6 w-6 text-primary" />
                      </div>
                      <CardTitle className="text-lg">{value.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {value.description}
                      </p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Timeline */}
          <div className="mb-20">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-foreground mb-4">
                Our Journey
              </h2>
              <p className="text-muted-foreground">
                Key milestones in our growth and evolution
              </p>
            </div>

            <div className="max-w-4xl mx-auto">
              <div className="relative">
                {/* Timeline Line */}
                <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-border hidden md:block"></div>
                
                <div className="space-y-8">
                  {milestones.map((milestone, index) => (
                    <div key={milestone.year} className="relative flex items-start gap-6">
                      {/* Timeline Dot */}
                      <div className="hidden md:flex w-16 h-16 rounded-full bg-primary text-white items-center justify-center font-bold text-sm z-10">
                        {milestone.year}
                      </div>
                      
                      {/* Content */}
                      <div className="flex-1">
                        <Card className="border-card-border">
                          <CardContent className="p-6">
                            <div className="md:hidden mb-2">
                              <Badge variant="default">{milestone.year}</Badge>
                            </div>
                            <h3 className="text-xl font-semibold text-foreground mb-2">
                              {milestone.title}
                            </h3>
                            <p className="text-muted-foreground">
                              {milestone.description}
                            </p>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Leadership */}
          <div className="mb-20">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-foreground mb-4">
                Leadership Team
              </h2>
              <p className="text-muted-foreground">
                Meet the experts leading our global organization
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {leadership.map((leader) => (
                <Card key={leader.name} className="text-center border-card-border">
                  <CardHeader>
                    <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                      <Users className="h-12 w-12 text-primary" />
                    </div>
                    <CardTitle className="text-xl">{leader.name}</CardTitle>
                    <p className="text-primary font-medium">{leader.title}</p>
                  </CardHeader>
                  <CardContent className="text-left">
                    <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                      {leader.bio}
                    </p>
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-foreground">Areas of Expertise:</p>
                      <div className="flex flex-wrap gap-1">
                        {leader.expertise.map((skill) => (
                          <Badge key={skill} variant="secondary" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className="mb-20">
            <div className="bg-secondary rounded-lg p-12">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-foreground mb-4">
                  Our Global Impact
                </h2>
                <p className="text-muted-foreground">
                  Numbers that reflect our worldwide reach and influence
                </p>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                <div>
                  <div className="text-3xl font-bold text-primary mb-2">10,000+</div>
                  <div className="text-muted-foreground">Active Members</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-primary mb-2">50+</div>
                  <div className="text-muted-foreground">Annual Events</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-primary mb-2">200+</div>
                  <div className="text-muted-foreground">Research Papers</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-primary mb-2">25</div>
                  <div className="text-muted-foreground">Countries</div>
                </div>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center">
            <Card className="bg-gradient-to-r from-primary to-teal text-white border-0">
              <CardContent className="p-12">
                <h2 className="text-3xl font-bold mb-4">
                  Join Our Mission
                </h2>
                <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
                  Be part of the global community shaping the future of information management. 
                  Together, we can drive innovation and excellence in our field.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button size="lg" className="bg-white text-primary hover:bg-white/90">
                    Become a Member
                  </Button>
                  <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                    Contact Us
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;