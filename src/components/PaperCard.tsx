import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Download, Users, Calendar, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import { DatabasePaper } from '@/hooks/usePapers';

interface PaperCardProps {
  paper: DatabasePaper;
}

const PaperCard = ({ paper }: PaperCardProps) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted':
        return 'bg-green-500/10 text-green-700 border-green-200';
      case 'under_review':
        return 'bg-accent/10 text-accent-foreground border-accent/20';
      case 'submitted':
        return 'bg-primary/10 text-primary border-primary/20';
      case 'rejected':
        return 'bg-destructive/10 text-destructive border-destructive/20';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <Card className="h-full hover:shadow-lg transition-all duration-300 group border-card-border">
      <CardHeader>
        <div className="flex justify-between items-start mb-2">
          <Badge className={getStatusColor(paper.status)}>
            {paper.status.replace('_', ' ').toUpperCase()}
          </Badge>
          <div className="flex items-center text-xs text-muted-foreground">
            <Calendar className="h-3 w-3 mr-1" />
            {paper.published_date ? formatDate(paper.published_date) : 'No date'}
          </div>
        </div>
        
        <CardTitle className="text-lg leading-tight group-hover:text-primary transition-colors">
          <Link to={`/papers/${paper.id}`} className="hover:underline">
            {paper.title}
          </Link>
        </CardTitle>
        
        <div className="flex items-center text-sm text-muted-foreground">
          <Users className="h-4 w-4 mr-2" />
          <span className="line-clamp-1">
            {paper.authors.join(', ')}
          </span>
        </div>
      </CardHeader>
      
      <CardContent className="px-6 pb-4">
        <p className="text-sm text-foreground/80 line-clamp-4 mb-4">
          {paper.abstract}
        </p>
        
        <div className="flex flex-wrap gap-2">
          {paper.tags?.slice(0, 3).map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
          {paper.tags && paper.tags.length > 3 && (
            <Badge variant="secondary" className="text-xs">
              +{paper.tags.length - 3} more
            </Badge>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="px-6 pb-6 flex justify-between items-center">
        <div className="flex items-center text-xs text-muted-foreground">
          <Eye className="h-3 w-3 mr-1" />
          <span>0 downloads</span>
        </div>
        
        <div className="flex gap-2">
          <Button size="sm" variant="outline" asChild>
            <Link to={`/papers/${paper.id}`}>
              View Details
            </Link>
          </Button>
          
          {paper.pdf_url && (
            <Button size="sm" asChild>
              <a href={paper.pdf_url} download>
                <Download className="h-4 w-4 mr-1" />
                PDF
              </a>
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
};

export default PaperCard;