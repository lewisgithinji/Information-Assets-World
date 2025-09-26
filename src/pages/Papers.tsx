import PageHero from '@/components/PageHero';
import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import PaperCard from '@/components/PaperCard';
import SearchBox from '@/components/SearchBox';
import { usePapers } from '@/hooks/usePapers';
import { FileText, Filter, SortAsc, Download } from 'lucide-react';

const Papers = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('date');
  
  const { data: papers, isLoading } = usePapers();

  const filteredAndSortedPapers = useMemo(() => {
    if (!papers) return [];
    
    let filtered = papers.filter(paper => {
      const matchesSearch = searchQuery === '' || 
        paper.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        paper.authors.some(author => author.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (paper.tags && paper.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))) ||
        (paper.abstract && paper.abstract.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesStatus = statusFilter === 'all' || paper.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });

    // Sort papers
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'title':
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });

    return filtered;
  }, [papers, searchQuery, statusFilter, sortBy]);

  const statusOptions = [
    { value: 'all', label: 'All Papers' },
    { value: 'published', label: 'Published' },
    { value: 'draft', label: 'Draft' },
  ];

  const sortOptions = [
    { value: 'date', label: 'Latest' },
    { value: 'title', label: 'Title' },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Loading papers...</p>
          </div>
        </div>
      </div>
    );
  }

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
              <div className="text-2xl font-bold text-primary">{papers?.length || 0}</div>
              <div className="text-sm text-muted-foreground">Total Papers</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {papers?.filter(p => p.status === 'published').length || 0}
              </div>
              <div className="text-sm text-muted-foreground">Published</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {papers?.filter(p => p.status === 'draft').length || 0}
              </div>
              <div className="text-sm text-muted-foreground">In Progress</div>
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