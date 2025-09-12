import PageHero from '@/components/PageHero';
import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import PaperCard from '@/components/PaperCard';
import SearchBox from '@/components/SearchBox';
import { samplePapers } from '@/data/content';
import { FileText, Filter, SortAsc, Download } from 'lucide-react';

const Papers = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('date');

  const filteredAndSortedPapers = useMemo(() => {
    let filtered = samplePapers.filter(paper => {
      const matchesSearch = searchQuery === '' || 
        paper.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        paper.authors.some(author => author.toLowerCase().includes(searchQuery.toLowerCase())) ||
        paper.keywords.some(keyword => keyword.toLowerCase().includes(searchQuery.toLowerCase())) ||
        paper.abstract.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || paper.peerReviewStatus === statusFilter;
      
      return matchesSearch && matchesStatus && paper.published;
    });

    // Sort papers
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(b.publishedDate).getTime() - new Date(a.publishedDate).getTime();
        case 'title':
          return a.title.localeCompare(b.title);
        case 'downloads':
          return (b.downloadCount || 0) - (a.downloadCount || 0);
        default:
          return 0;
      }
    });

    return filtered;
  }, [searchQuery, statusFilter, sortBy]);

  const statusOptions = [
    { value: 'all', label: 'All Papers' },
    { value: 'accepted', label: 'Accepted' },
    { value: 'under_review', label: 'Under Review' },
    { value: 'submitted', label: 'Submitted' },
  ];

  const sortOptions = [
    { value: 'date', label: 'Latest' },
    { value: 'title', label: 'Title' },
    { value: 'downloads', label: 'Downloads' },
  ];

  const totalDownloads = samplePapers.reduce((sum, paper) => sum + (paper.downloadCount || 0), 0);

  return (
    <div>
      {/* Hero Section with PageHero component */}
      <PageHero
        title="Research Papers Library"
        description="Access cutting-edge research in information management, data governance, and digital transformation from leading academics and practitioners."
        gradient="accent"
      />

      <div className="py-12">
        <div className="container mx-auto px-4">
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 max-w-2xl mx-auto">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{samplePapers.length}</div>
              <div className="text-sm text-muted-foreground">Total Papers</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{totalDownloads}</div>
              <div className="text-sm text-muted-foreground">Downloads</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {samplePapers.filter(p => p.peerReviewStatus === 'accepted').length}
              </div>
              <div className="text-sm text-muted-foreground">Peer Reviewed</div>
            </div>
          </div>

          {/* Filters */}
          <div className="mb-8 space-y-4">
            <div className="flex flex-col md:flex-row gap-4 items-center">
              <SearchBox
                placeholder="Search papers, authors, keywords..."
                onSearch={setSearchQuery}
                className="flex-1 max-w-md"
              />
              
              <div className="flex gap-4">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((status) => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-32">
                    <SortAsc className="h-4 w-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {sortOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Active Filters */}
            <div className="flex flex-wrap gap-2">
              {searchQuery && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Search: "{searchQuery}"
                  <button
                    onClick={() => setSearchQuery('')}
                    className="ml-1 hover:text-foreground"
                  >
                    ×
                  </button>
                </Badge>
              )}
              {statusFilter !== 'all' && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Status: {statusOptions.find(s => s.value === statusFilter)?.label}
                  <button
                    onClick={() => setStatusFilter('all')}
                    className="ml-1 hover:text-foreground"
                  >
                    ×
                  </button>
                </Badge>
              )}
            </div>
          </div>

          {/* Results */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <p className="text-muted-foreground">
                {filteredAndSortedPapers.length} paper{filteredAndSortedPapers.length !== 1 ? 's' : ''} found
              </p>
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                Bulk Download
              </Button>
            </div>
          </div>

          {/* Papers Grid */}
          {filteredAndSortedPapers.length === 0 ? (
            <div className="text-center py-16">
              <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                No papers found
              </h3>
              <p className="text-muted-foreground mb-6">
                Try adjusting your search criteria or filters.
              </p>
              <Button
                onClick={() => {
                  setSearchQuery('');
                  setStatusFilter('all');
                }}
              >
                Clear Filters
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredAndSortedPapers.map((paper) => (
                <PaperCard key={paper.id} paper={paper} />
              ))}
            </div>
          )}

          {/* Submit Paper Section */}
          <div className="mt-16 text-center bg-secondary rounded-lg p-8">
            <h2 className="text-2xl font-bold text-foreground mb-4">
              Submit Your Research
            </h2>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Share your research with the global information management community. 
              All submissions go through our peer-review process to ensure quality and relevance.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg">
                Submit Paper
              </Button>
              <Button size="lg" variant="outline">
                Review Guidelines
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Papers;