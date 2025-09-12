import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface PageHeroProps {
  title: string;
  description: string;
  backgroundImage?: string;
  gradient?: 'blue' | 'teal' | 'primary' | 'accent' | 'purple' | 'custom';
  customGradient?: string;
  children?: ReactNode;
  className?: string;
}

const PageHero = ({ 
  title, 
  description, 
  backgroundImage,
  gradient = 'primary',
  customGradient,
  children,
  className 
}: PageHeroProps) => {
  const getGradientClass = () => {
    if (customGradient) return customGradient;
    
    switch (gradient) {
      case 'blue':
        return 'bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800';
      case 'teal':
        return 'bg-gradient-to-br from-teal-600 via-blue-600 to-blue-800';
      case 'primary':
        return 'bg-gradient-to-br from-primary via-primary-dark to-blue-800';
      case 'accent':
        return 'bg-gradient-to-br from-primary via-accent to-accent-light';
      case 'purple':
        return 'bg-gradient-to-br from-primary-dark via-purple-600 to-purple-800';
      default:
        return 'bg-gradient-to-br from-primary via-primary-dark to-blue-800';
    }
  };

  return (
    <section className={cn(
      "relative min-h-[60vh] flex items-center justify-center overflow-hidden",
      className
    )}>
      {/* Background Image (if provided) */}
      {backgroundImage && (
        <div 
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: `url(${backgroundImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
      )}
      
      {/* Gradient Background */}
      <div className={cn(
        "absolute inset-0 z-10",
        !backgroundImage && getGradientClass(),
        backgroundImage && "bg-black/40"
      )} />
      
      {/* Content */}
      <div className="relative z-20 container mx-auto px-4 text-center text-white">
        <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
          <h1 className="text-4xl md:text-6xl font-bold leading-tight">
            {title}
          </h1>
          
          <p className="text-xl md:text-2xl text-white/95 leading-relaxed font-medium max-w-3xl mx-auto">
            {description}
          </p>
          
          {children && (
            <div className="mt-8">
              {children}
            </div>
          )}
        </div>
      </div>
      
      {/* Decorative Elements */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background/20 to-transparent z-30" />
    </section>
  );
};

export default PageHero;