import { Link } from "react-router-dom";
import { ArrowRight, Clock } from "lucide-react";
import { getLatestPosts } from "@/blog";

const BlogPreview = () => {
  const posts = getLatestPosts(3);

  return (
    <section className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-6">
        {/* Header */}
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="font-display text-xs uppercase tracking-[0.3em] text-muted-foreground mb-3">
              From the Blog
            </p>
            <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
              Learn about FENUS
            </h2>
          </div>
          <Link
            to="/blog"
            className="hidden sm:inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition"
          >
            All posts
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* Posts grid */}
        <div className="grid gap-5 sm:grid-cols-3">
          {posts.map((post, i) => (
            <Link
              key={post.slug}
              to={`/blog/${post.slug}`}
              className="group flex flex-col rounded-3xl border border-border bg-card/60 backdrop-blur-xl overflow-hidden hover:border-foreground/20 transition-all duration-200"
            >
              {/* Cover */}
              <div className="h-44 overflow-hidden">
                <img
                  src={post.coverImage}
                  alt={post.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>

              {/* Content */}
              <div className="flex flex-col flex-1 p-5">
                {/* Tags */}
                <div className="flex flex-wrap gap-1 mb-2.5">
                  {post.tags.slice(0, 2).map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-foreground/8 px-2 py-0.5 text-[9px] font-medium text-muted-foreground"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Title */}
                <h3 className="font-display text-sm font-semibold leading-snug tracking-tight group-hover:text-foreground/80 transition mb-2 flex-1">
                  {post.title}
                </h3>

                {/* Excerpt */}
                <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-2 mb-4">
                  {post.excerpt}
                </p>

                {/* Meta */}
                <div className="flex items-center justify-between text-[10px] text-muted-foreground/50">
                  <span className="flex items-center gap-1">
                    <Clock className="h-2.5 w-2.5" />
                    {post.readTime}
                  </span>
                  <span className="text-foreground/40 group-hover:text-foreground transition font-medium text-[11px]">
                    Read →
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Mobile view all */}
        <div className="mt-8 text-center sm:hidden">
          <Link
            to="/blog"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition"
          >
            View all posts
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default BlogPreview;
