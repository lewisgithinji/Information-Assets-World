import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import BlogCard from "@/components/blog/BlogCard";
import { useBlogPosts } from "@/hooks/useBlogPosts";
import { useBlogCategories } from "@/hooks/useBlogCategories";
import type { BlogFilters } from "@/types/blog";

export default function Blog() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState("");

  // Get filters from URL params
  const categoryParam = searchParams.get("category") || undefined;
  const tagParam = searchParams.get("tag") || undefined;

  const filters: BlogFilters = {
    search: searchTerm || undefined,
    category: categoryParam,
    tag: tagParam,
    status: "published",
  };

  const { data: posts, isLoading, error } = useBlogPosts(filters);
  const { data: categories } = useBlogCategories();

  // Get unique tags from all posts
  const allTags = posts
    ? Array.from(new Set(posts.flatMap((post) => post.tags)))
    : [];

  const handleCategoryChange = (value: string) => {
    if (value === "all") {
      searchParams.delete("category");
    } else {
      searchParams.set("category", value);
    }
    searchParams.delete("tag");
    setSearchParams(searchParams);
  };

  const handleTagClick = (tag: string) => {
    searchParams.set("tag", tag);
    searchParams.delete("category");
    setSearchParams(searchParams);
  };

  const clearFilters = () => {
    setSearchParams({});
    setSearchTerm("");
  };

  const activeFiltersCount =
    (categoryParam ? 1 : 0) + (tagParam ? 1 : 0) + (searchTerm ? 1 : 0);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary to-primary/80 text-white py-16">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            News & Insights
          </h1>
          <p className="text-xl text-white/90 max-w-2xl">
            Stay updated with the latest industry insights, company news, and
            best practices in information security and compliance.
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
        {/* Filters Section */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search articles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Category Filter */}
            <Select
              value={categoryParam || "all"}
              onValueChange={handleCategoryChange}
            >
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories?.map((category) => (
                  <SelectItem key={category.id} value={category.slug}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Clear Filters */}
            {activeFiltersCount > 0 && (
              <Button variant="outline" onClick={clearFilters}>
                <Filter className="h-4 w-4 mr-2" />
                Clear Filters ({activeFiltersCount})
              </Button>
            )}
          </div>

          {/* Active Tag Filter */}
          {tagParam && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                Filtering by tag:
              </span>
              <Badge
                variant="secondary"
                className="cursor-pointer"
                onClick={() => {
                  searchParams.delete("tag");
                  setSearchParams(searchParams);
                }}
              >
                {tagParam}
                <span className="ml-2">×</span>
              </Badge>
            </div>
          )}
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-12">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent motion-reduce:animate-[spin_1.5s_linear_infinite]" />
            <p className="mt-4 text-muted-foreground">Loading articles...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-12">
            <p className="text-destructive">Failed to load articles</p>
            <p className="text-sm text-muted-foreground mt-2">
              {error.message}
            </p>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && posts?.length === 0 && (
          <div className="text-center py-12">
            <p className="text-lg text-muted-foreground">
              No articles found matching your criteria
            </p>
            {activeFiltersCount > 0 && (
              <Button variant="link" onClick={clearFilters} className="mt-4">
                Clear all filters
              </Button>
            )}
          </div>
        )}

        {/* Blog Posts Grid */}
        {!isLoading && !error && posts && posts.length > 0 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {posts.map((post) => (
                <BlogCard key={post.id} post={post} />
              ))}
            </div>

            {/* Results Count */}
            <div className="text-center text-sm text-muted-foreground">
              Showing {posts.length} {posts.length === 1 ? "article" : "articles"}
            </div>
          </>
        )}

        {/* Popular Tags Section */}
        {allTags.length > 0 && !tagParam && (
          <div className="mt-12 pt-8 border-t">
            <h3 className="text-lg font-semibold mb-4">Popular Tags</h3>
            <div className="flex flex-wrap gap-2">
              {allTags.slice(0, 20).map((tag) => (
                <Badge
                  key={tag}
                  variant="outline"
                  className="cursor-pointer hover:bg-accent"
                  onClick={() => handleTagClick(tag)}
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
