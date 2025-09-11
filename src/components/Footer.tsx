import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Linkedin, Twitter } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { name: 'About Us', href: '/about' },
    { name: 'Events', href: '/events' },
    { name: 'Research Papers', href: '/papers' },
    { name: 'Membership', href: '/membership' },
    { name: 'Global Offices', href: '/offices' },
    { name: 'Contact', href: '/contact' },
  ];

  const eventTypes = [
    { name: 'Conferences', href: '/events?type=conference' },
    { name: 'Exhibitions', href: '/events?type=exhibition' },
    { name: 'Gala Events', href: '/events?type=gala' },
    { name: 'Vendor Events', href: '/events?type=vendor' },
  ];

  return (
    <footer className="relative gradient-footer border-t border-glass-border overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-32 h-32 rounded-full bg-primary/10 animate-rotate-slow animate-glow-pulse"></div>
        <div className="absolute top-3/4 right-1/3 w-24 h-24 rounded-full bg-primary-light/15 animate-rotate-fast animate-float"></div>
        <div className="absolute bottom-1/3 left-1/2 w-20 h-20 rounded-full bg-accent/10 animate-rotate-slow" style={{animationDelay: '-5s'}}></div>
        <div className="absolute top-1/2 right-1/4 w-16 h-16 rounded-full bg-primary-glow/20 animate-float" style={{animationDelay: '-2s'}}></div>
      </div>
      
      <div className="container mx-auto px-4 py-12 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4 glass-effect rounded-lg p-6">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded gradient-primary animate-glow-pulse"></div>
              <span className="text-lg font-bold text-white">
                Information Assets World
              </span>
            </div>
            <p className="text-sm text-gray-300 max-w-xs">
              Connecting global professionals in information and data management through 
              conferences, research, and collaborative networks.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-primary-light transition-all duration-300 hover:scale-110 hover:drop-shadow-[0_0_8px_hsl(var(--primary-light))]">
                <Linkedin className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-primary-light transition-all duration-300 hover:scale-110 hover:drop-shadow-[0_0_8px_hsl(var(--primary-light))]">
                <Twitter className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="glass-effect rounded-lg p-6">
            <h3 className="font-semibold text-white mb-4">Quick Links</h3>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-sm text-gray-300 hover:text-primary-light transition-all duration-300 hover:drop-shadow-[0_0_4px_hsl(var(--primary-light))] relative inline-block after:content-[''] after:absolute after:w-full after:scale-x-0 after:h-0.5 after:bottom-0 after:left-0 after:bg-primary-light after:origin-bottom-right after:transition-transform after:duration-300 hover:after:scale-x-100 hover:after:origin-bottom-left"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Events */}
          <div className="glass-effect rounded-lg p-6">
            <h3 className="font-semibold text-white mb-4">Events</h3>
            <ul className="space-y-2">
              {eventTypes.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-sm text-gray-300 hover:text-primary-light transition-all duration-300 hover:drop-shadow-[0_0_4px_hsl(var(--primary-light))] relative inline-block after:content-[''] after:absolute after:w-full after:scale-x-0 after:h-0.5 after:bottom-0 after:left-0 after:bg-primary-light after:origin-bottom-right after:transition-transform after:duration-300 hover:after:scale-x-100 hover:after:origin-bottom-left"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="glass-effect rounded-lg p-6">
            <h3 className="font-semibold text-white mb-4">Contact</h3>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                <div className="text-sm text-gray-300">
                  <p>Head Office</p>
                  <p>Nairobi, Kenya</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-300">
                  info@informationassetsworld.com
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-300">
                  +254 700 000 000
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-glass-border mt-8 pt-8 flex flex-col md:flex-row justify-between items-center glass-effect rounded-lg p-6">
          <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-4">
            <p className="text-sm text-gray-300">
              © {currentYear} Information Assets World. All rights reserved.
            </p>
            <span className="hidden md:inline text-gray-500">•</span>
            <p className="text-sm text-gray-400">
              Designed by <a href="https://datacare.co.ke" target="_blank" rel="noopener noreferrer" className="text-primary-light hover:text-primary transition-colors hover:drop-shadow-[0_0_4px_hsl(var(--primary-light))]">Datacare.co.ke</a>
            </p>
          </div>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link to="/privacy" className="text-sm text-gray-300 hover:text-primary-light transition-all duration-300 hover:drop-shadow-[0_0_4px_hsl(var(--primary-light))]">
              Privacy Policy
            </Link>
            <Link to="/terms" className="text-sm text-gray-300 hover:text-primary-light transition-all duration-300 hover:drop-shadow-[0_0_4px_hsl(var(--primary-light))]">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;