import { Link } from "react-router-dom";
import { ArrowLeft, Clock, Tag } from "lucide-react";
import { allPosts } from "@/blog";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import logo from "@/assets/fenus-logo.png";

const Blog = () => {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />

      <div className="mx-auto max-w-4xl px-6 pt-36 pb-24">
        {/* Header */}
        <div className="mb-14">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition mb-8"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to home
          </Link>
          <h1 className="font-display text-4xl font-semibold tracking-tight sm:text-5xl">
            FENUS Blog
          </h1>
          <p className="mt-3 text-muted-foreground text-base max-w-xl">
            Insights, updates, and deep dives into the Litecoin DeFi ecosystem, LitVM, and the FENUS protocol.
          </p>
        </div>

        {/* Posts grid */}
        <div className="space-y-6">
          {allPosts.map((post) => (
            <Link
              key={post.slug}
              to={`/blog/${post.slug}`}
              className="group block rounded-3xl border border-border bg-card/60 backdrop-blur-xl overflow-hidden hover:border-foreground/20 transition-all duration-200"
            >
              <div className="flex flex-col sm:flex-row">
                {/* Cover image */}
                <div className="sm:w-64 sm:shrink-0 h-48 sm:h-auto overflow-hidden">
                  <img
                    src={post.coverImage}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>

                {/* Content */}
                <div className="flex flex-col justify-between p-6 flex-1">
                  <div>
                    {/* Tags */}
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {post.tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full bg-foreground/8 px-2.5 py-0.5 text-[10px] font-medium text-muted-foreground"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    {/* Title */}
                    <h2 className="font-display text-lg font-semibold tracking-tight leading-snug group-hover:text-foreground/80 transition mb-2">
                      {post.title}
                    </h2>

                    {/* Excerpt */}
                    <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
                      {post.excerpt}
                    </p>
                  </div>

                  {/* Meta */}
                  <div className="flex items-center gap-4 mt-4 text-[11px] text-muted-foreground/60">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {post.readTime}
                    </span>
                    <span>
                      {new Date(post.date).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                    <span className="ml-auto text-foreground/60 group-hover:text-foreground transition text-xs font-medium">
                      Read →
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <Footer />
    </main>
  );
};

export default Blog;
