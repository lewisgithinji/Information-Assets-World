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

      {/* Subtle dark overlay to enhance text readability without washing out image colors */}
      <div className="absolute inset-0 z-0 bg-gradient-to-br from-slate-900/20 via-transparent to-slate-900/30" />

      {/* Subtle gradient mesh background elements that complement the teal/cyan image */}
      <div className="absolute top-10 left-10 w-96 h-96 bg-cyan-400/10 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-20 right-20 w-80 h-80 bg-teal-400/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 text-center text-white">
        <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
          {/* Main Title with Enhanced Visibility */}
          <h1 className="text-5xl md:text-7xl font-bold leading-tight mb-8" style={{ textShadow: '2px 4px 8px rgba(0,0,0,0.3), 0 0 20px rgba(255,255,255,0.1)' }}>
            <span className="bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text text-transparent drop-shadow-2xl">
              Information Assets
            </span>
            <span className="block text-white font-extrabold tracking-wide mt-2">
              World Network
            </span>
          </h1>

          {/* Description with Glass Effect */}
          <div className="backdrop-blur-md bg-black/30 p-6 md:p-8 max-w-4xl mx-auto rounded-2xl border border-white/30 shadow-2xl">
            <p className="text-xl md:text-2xl text-white leading-relaxed font-medium" style={{ textShadow: '1px 2px 4px rgba(0,0,0,0.5)' }}>
              Connecting global professionals in information and data management through
              world-class conferences, cutting-edge research, and collaborative networks.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-8">
            <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-2xl font-semibold px-8 py-6 text-lg" asChild>
              <Link to="/membership">
                Join Our Network
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>

            <Button size="lg" variant="outline" className="bg-white/90 border-2 border-white text-blue-900 hover:bg-white hover:scale-105 font-semibold backdrop-blur-sm shadow-xl px-8 py-6 text-lg transition-all" asChild>
              <Link to="/events">
                View Conferences
              </Link>
            </Button>
          </div>

          {/* Stats with Enhanced Glass Effect */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
            <div className="bg-white/20 backdrop-blur-lg rounded-2xl p-6 border-2 border-white/40 shadow-2xl hover:bg-white/25 hover:scale-105 transition-all duration-300">
              <Calendar className="h-10 w-10 mx-auto mb-3 text-yellow-300 drop-shadow-2xl" />
              <div className="text-4xl font-bold text-white" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}>50+</div>
              <div className="text-white font-semibold text-lg" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}>Annual Events</div>
            </div>

            <div className="bg-white/20 backdrop-blur-lg rounded-2xl p-6 border-2 border-white/40 shadow-2xl hover:bg-white/25 hover:scale-105 transition-all duration-300">
              <FileText className="h-10 w-10 mx-auto mb-3 text-yellow-300 drop-shadow-2xl" />
              <div className="text-4xl font-bold text-white" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}>200+</div>
              <div className="text-white font-semibold text-lg" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}>Research Papers</div>
            </div>

            <div className="bg-white/20 backdrop-blur-lg rounded-2xl p-6 border-2 border-white/40 shadow-2xl hover:bg-white/25 hover:scale-105 transition-all duration-300">
              <Users className="h-10 w-10 mx-auto mb-3 text-yellow-300 drop-shadow-2xl" />
              <div className="text-4xl font-bold text-white" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}>10,000+</div>
              <div className="text-white font-semibold text-lg" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}>Global Members</div>
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