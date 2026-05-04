import { useParams, Link, Navigate } from "react-router-dom";
import { ArrowLeft, Clock } from "lucide-react";
import { getPostBySlug, allPosts } from "@/blog";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const post = getPostBySlug(slug || "");

  if (!post) return <Navigate to="/blog" replace />;

  // Other posts for "More from FENUS" section
  const morePosts = allPosts.filter((p) => p.slug !== post.slug).slice(0, 2);

  return (
    <main className="min-h-screen bg-background">
      <Navbar />

      <article className="mx-auto max-w-3xl px-6 pt-36 pb-24">
        {/* Back */}
        <Link
          to="/blog"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition mb-10"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          All posts
        </Link>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mb-4">
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
        <h1 className="font-display text-3xl font-semibold tracking-tight leading-tight sm:text-4xl mb-4">
          {post.title}
        </h1>

        {/* Meta */}
        <div className="flex items-center gap-4 text-[11px] text-muted-foreground/60 mb-8">
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
        </div>

        {/* Cover image */}
        <div className="rounded-2xl overflow-hidden mb-10 border border-border/60">
          <img
            src={post.coverImage}
            alt={post.title}
            className="w-full h-64 sm:h-80 object-cover"
          />
        </div>

        {/* Content */}
        <div className="prose prose-invert prose-sm sm:prose-base max-w-none
          prose-p:text-muted-foreground prose-p:leading-relaxed prose-p:mb-5
          prose-headings:font-display prose-headings:font-semibold prose-headings:tracking-tight prose-headings:text-foreground
          prose-strong:text-foreground prose-strong:font-semibold
          prose-a:text-foreground prose-a:underline prose-a:underline-offset-2
          prose-table:text-sm prose-th:text-foreground prose-td:text-muted-foreground
          prose-blockquote:border-l-foreground/20 prose-blockquote:text-muted-foreground
          prose-code:text-foreground prose-code:bg-foreground/8 prose-code:rounded prose-code:px-1
        ">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {post.content}
          </ReactMarkdown>
        </div>

        {/* CTA */}
        <div className="mt-14 rounded-3xl border border-border bg-card/60 backdrop-blur-xl p-8 text-center">
          <p className="font-display text-xl font-semibold mb-2">Ready to get started?</p>
          <p className="text-sm text-muted-foreground mb-6">
            Get zkLTC. Open a Trove. Mint FnUSD. Stay long. Stay liquid.
          </p>
          <a
            href="/app"
            className="inline-flex items-center justify-center rounded-full bg-foreground px-6 py-2.5 text-sm font-semibold text-background hover:opacity-90 transition"
          >
            Launch App →
          </a>
        </div>

        {/* More posts */}
        {morePosts.length > 0 && (
          <div className="mt-14">
            <p className="text-xs uppercase tracking-widest text-muted-foreground/60 mb-5">
              More from FENUS
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              {morePosts.map((p) => (
                <Link
                  key={p.slug}
                  to={`/blog/${p.slug}`}
                  className="group rounded-2xl border border-border bg-card/60 p-5 hover:border-foreground/20 transition"
                >
                  <div className="flex flex-wrap gap-1 mb-2">
                    {p.tags.slice(0, 2).map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-foreground/8 px-2 py-0.5 text-[9px] font-medium text-muted-foreground"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <p className="font-display text-sm font-semibold leading-snug group-hover:text-foreground/80 transition mb-1">
                    {p.title}
                  </p>
                  <p className="text-[11px] text-muted-foreground line-clamp-2">{p.excerpt}</p>
                  <p className="mt-3 text-[11px] text-foreground/50 group-hover:text-foreground transition font-medium">
                    Read → 
                  </p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </article>

      <Footer />
    </main>
  );
};

export default BlogPost;
