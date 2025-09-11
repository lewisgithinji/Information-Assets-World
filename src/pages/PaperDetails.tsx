import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Download, Users, Calendar, Eye, ExternalLink, Share2, FileText, Quote } from 'lucide-react';
import { samplePapers, sampleEvents } from '@/data/content';
import { useToast } from '@/hooks/use-toast';

const PaperDetails = () => {
  const { slug } = useParams();
  const { toast } = useToast();
  const paper = samplePapers.find(p => p.slug === slug);
  const relatedEvent = paper?.conferenceRef ? 
    sampleEvents.find(e => e.slug === paper.conferenceRef) : null;

  if (!paper) {
    return (
      <div className="py-12">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Paper Not Found</h1>
          <p className="text-muted-foreground mb-8">
            The research paper you're looking for doesn't exist or has been removed.
          </p>
          <Button asChild>
            <Link to="/papers">Browse All Papers</Link>
          </Button>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
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

  const handleShare = async () => {
    try {
      await navigator.share({
        title: paper.title,
        text: paper.abstract,
        url: window.location.href,
      });
    } catch (error) {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link copied!",
        description: "Paper link has been copied to your clipboard.",
      });
    }
  };

  const handleDownload = () => {
    // In a real app, this would trigger the actual download
    toast({
      title: "Download started",
      description: "The PDF file is being downloaded.",
    });
  };

  const citationText = `${paper.authors.join(', ')}. (${new Date(paper.publishedDate).getFullYear()}). ${paper.title}. Information Assets World${relatedEvent ? `, ${relatedEvent.title}` : ''}.`;

  return (
    <div className="py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex flex-wrap gap-2 mb-4">
              <Badge className={getStatusColor(paper.peerReviewStatus)}>
                {paper.peerReviewStatus.replace('_', ' ').toUpperCase()}
              </Badge>
                  {relatedEvent && (
                    <Badge variant="outline" className="hover:bg-muted">
                      <Link to={`/events/${relatedEvent.slug}`} className="flex items-center gap-1">
                        <ExternalLink className="h-3 w-3" />
                        {relatedEvent.title}
                      </Link>
                    </Badge>
                  )}
            </div>
            
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4 leading-tight">
              {paper.title}
            </h1>
            
            <div className="flex flex-wrap items-center gap-4 text-muted-foreground mb-6">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span>{paper.authors.join(', ')}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>Published {formatDate(paper.publishedDate)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                <span>{paper.downloadCount || 0} downloads</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              {paper.peerReviewStatus === 'accepted' && (
                <Button onClick={handleDownload} className="flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  Download PDF
                </Button>
              )}
              <Button variant="outline" onClick={handleShare} className="flex items-center gap-2">
                <Share2 className="h-4 w-4" />
                Share Paper
              </Button>
              <Button variant="outline" className="flex items-center gap-2">
                <Quote className="h-4 w-4" />
                Cite Paper
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Abstract */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Abstract
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-foreground/80 leading-relaxed text-lg">
                    {paper.abstract}
                  </p>
                </CardContent>
              </Card>

              {/* Keywords */}
              <Card>
                <CardHeader>
                  <CardTitle>Keywords</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {paper.keywords.map((keyword) => (
                      <Badge key={keyword} variant="secondary" className="text-sm">
                        {keyword}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Citation */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Quote className="h-5 w-5" />
                    Citation
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-muted p-4 rounded-lg font-mono text-sm">
                    {citationText}
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-3"
                    onClick={() => {
                      navigator.clipboard.writeText(citationText);
                      toast({
                        title: "Citation copied!",
                        description: "Citation has been copied to your clipboard.",
                      });
                    }}
                  >
                    Copy Citation
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Paper Info */}
              <Card>
                <CardHeader>
                  <CardTitle>Paper Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status</span>
                    <Badge className={getStatusColor(paper.peerReviewStatus)}>
                      {paper.peerReviewStatus.replace('_', ' ')}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Authors</span>
                    <span>{paper.authors.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Keywords</span>
                    <span>{paper.keywords.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Downloads</span>
                    <span>{paper.downloadCount || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Published</span>
                    <span>{new Date(paper.publishedDate).getFullYear()}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Authors */}
              <Card>
                <CardHeader>
                  <CardTitle>Authors</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {paper.authors.map((author, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <Users className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{author}</p>
                          <p className="text-sm text-muted-foreground">
                            Research Author
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Related Event */}
              {relatedEvent && (
                <Card>
                  <CardHeader>
                    <CardTitle>Presented At</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Link 
                      to={`/events/${relatedEvent.slug}`}
                      className="block p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <Calendar className="h-5 w-5 text-primary mt-0.5" />
                        <div>
                          <h4 className="font-medium text-foreground hover:text-primary transition-colors">
                            {relatedEvent.title}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            {relatedEvent.city}, {relatedEvent.country}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {formatDate(relatedEvent.startDate)}
                          </p>
                        </div>
                      </div>
                    </Link>
                  </CardContent>
                </Card>
              )}

              {/* Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button variant="outline" className="w-full justify-start">
                    <FileText className="h-4 w-4 mr-2" />
                    View Similar Papers
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Users className="h-4 w-4 mr-2" />
                    Follow Author
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Report Issue
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaperDetails;