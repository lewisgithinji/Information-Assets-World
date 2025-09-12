import { Button } from '@/components/ui/button';
import { ArrowRight, Calendar, FileText, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import heroImage from '@/assets/hero-image.jpg';

const Hero = () => {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `url(${heroImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
      
      {/* Lightened Overlay */}
      <div className="absolute inset-0 z-0 bg-black/10" />
      
      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 text-center text-white">
        <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
          {/* Main Title - No Background */}
          <h1 className="text-5xl md:text-7xl font-bold leading-tight hero-text-strong mb-8">
            Information Assets
            <span className="block text-white font-extrabold tracking-wide">
              World Network
            </span>
          </h1>
          
          {/* Description with Subtle Background */}
          <div className="hero-content-subtle p-6 md:p-8 max-w-4xl mx-auto">
            <p className="text-xl md:text-2xl text-white/95 leading-relaxed hero-text-shadow font-medium">
              Connecting global professionals in information and data management through 
              world-class conferences, cutting-edge research, and collaborative networks.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-8">
            <Button size="lg" className="shadow-glow hero-text-shadow font-semibold" asChild>
              <Link to="/membership">
                Join Our Network
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            
            <Button size="lg" variant="outline" className="bg-white/15 border-white/30 text-white hover:bg-white/25 font-semibold hero-text-shadow backdrop-blur-sm" asChild>
              <Link to="/events">
                View Conferences
              </Link>
            </Button>
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
            <div className="bg-white/15 backdrop-blur-md rounded-lg p-6 border border-white/30 hero-text-shadow">
              <Calendar className="h-8 w-8 mx-auto mb-3 text-accent drop-shadow-lg" />
              <div className="text-3xl font-bold text-white">50+</div>
              <div className="text-white/90 font-medium">Annual Events</div>
            </div>
            
            <div className="bg-white/15 backdrop-blur-md rounded-lg p-6 border border-white/30 hero-text-shadow">
              <FileText className="h-8 w-8 mx-auto mb-3 text-accent drop-shadow-lg" />
              <div className="text-3xl font-bold text-white">200+</div>
              <div className="text-white/90 font-medium">Research Papers</div>
            </div>
            
            <div className="bg-white/15 backdrop-blur-md rounded-lg p-6 border border-white/30 hero-text-shadow">
              <Users className="h-8 w-8 mx-auto mb-3 text-accent drop-shadow-lg" />
              <div className="text-3xl font-bold text-white">10,000+</div>
              <div className="text-white/90 font-medium">Global Members</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-white/50 rounded-full mt-2"></div>
        </div>
      </div>
    </section>
  );
};

export default Hero;