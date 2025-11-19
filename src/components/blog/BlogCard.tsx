import { Link } from "react-router-dom";
import { Calendar, User, Tag, Eye } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { BlogPostFull } from "@/types/blog";
import { format } from "date-fns";

interface BlogCardProps {
  post: BlogPostFull;
  showExcerpt?: boolean;
  showCategory?: boolean;
  showAuthor?: boolean;
  showViews?: boolean;
}

export default function BlogCard({
  post,
  showExcerpt = true,
  showCategory = true,
  showAuthor = true,
  showViews = false,
}: BlogCardProps) {
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "";
    try {
      return format(new Date(dateString), "MMM dd, yyyy");
    } catch {
      return "";
    }
  };

  return (
    <Card className="h-full flex flex-col overflow-hidden hover:shadow-lg transition-shadow">
      {/* Featured Image */}
      {post.featured_image_url && (
        <Link to={`/blog/${post.slug}`} className="block">
          <div className="aspect-video w-full overflow-hidden bg-muted">
            <img
              src={post.featured_image_url}
              alt={post.title}
              loading="lazy"
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
            />
          </div>
        </Link>
      )}

      <CardHeader className="flex-1">
        {/* Category Badge */}
        {showCategory && post.category && (
          <Link to={`/blog?category=${post.category.slug}`}>
            <Badge variant="secondary" className="mb-2 w-fit">
              {post.category.name}
            </Badge>
          </Link>
        )}

        {/* Title */}
        <Link to={`/blog/${post.slug}`}>
          <h3 className="text-xl font-bold hover:text-primary transition-colors line-clamp-2">
            {post.title}
          </h3>
        </Link>

        {/* Excerpt */}
        {showExcerpt && post.excerpt && (
          <p className="text-muted-foreground mt-2 line-clamp-3">{post.excerpt}</p>
        )}
      </CardHeader>

      <CardFooter className="flex flex-col gap-3 pt-0">
        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {post.tags.slice(0, 3).map((tag) => (
              <Link key={tag} to={`/blog?tag=${tag}`}>
                <Badge variant="outline" className="text-xs">
                  <Tag className="h-3 w-3 mr-1" />
                  {tag}
                </Badge>
              </Link>
            ))}
          </div>
        )}

        {/* Meta Info */}
        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          {/* Date */}
          {post.published_date && (
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>{formatDate(post.published_date)}</span>
            </div>
          )}

          {/* Author */}
          {showAuthor && post.author && (
            <div className="flex items-center gap-1">
              <User className="h-4 w-4" />
              <span>{post.author.full_name || post.author.email}</span>
            </div>
          )}

          {/* View Count */}
          {showViews && (
            <div className="flex items-center gap-1">
              <Eye className="h-4 w-4" />
              <span>{post.view_count} views</span>
            </div>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}
