import { Link } from 'react-router-dom';
import { Calendar, Award, UserPlus, Crown } from 'lucide-react';

interface MegaMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const MegaMenu = ({ isOpen, onClose }: MegaMenuProps) => {
  const essentialLinks = [
    {
      name: 'Browse All Events',
      href: '/events',
      icon: Calendar,
      description: 'Explore our full conference calendar'
    },
    {
      name: 'Upcoming Events',
      href: '/events?filter=upcoming',
      icon: Calendar,
      description: 'See what\'s coming next'
    },
    {
      name: 'Register for Event',
      href: '/register-interest',
      icon: UserPlus,
      description: 'Sign up for a conference'
    },
  ];

  if (!isOpen) return null;

  return (
    <div className="absolute left-0 top-full mt-2 w-80 bg-background border border-border rounded-lg shadow-lg z-50">
      <div className="p-4">
        <div className="space-y-1">
          {essentialLinks.map((link) => (
            <Link
              key={link.name}
              to={link.href}
              onClick={onClose}
              className="flex items-start gap-3 p-3 rounded-md text-sm hover:bg-muted transition-colors group"
            >
              <link.icon className="h-5 w-5 mt-0.5 text-muted-foreground group-hover:text-foreground transition-colors flex-shrink-0" />
              <div>
                <div className="font-medium text-foreground group-hover:text-primary transition-colors">
                  {link.name}
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  {link.description}
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Member Benefits Upsell */}
        <div className="mt-3 pt-3 border-t border-border">
          <Link
            to="/membership"
            onClick={onClose}
            className="flex items-start gap-3 p-3 rounded-md text-sm bg-gradient-to-r from-primary/10 to-purple-500/10 hover:from-primary/20 hover:to-purple-500/20 transition-all group"
          >
            <Crown className="h-5 w-5 mt-0.5 text-primary group-hover:text-primary transition-colors flex-shrink-0" />
            <div>
              <div className="font-medium text-primary group-hover:text-primary transition-colors flex items-center gap-1">
                Member Benefits & Priority Access
              </div>
              <div className="text-xs text-muted-foreground mt-0.5">
                Get priority registration and exclusive perks
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default MegaMenu;