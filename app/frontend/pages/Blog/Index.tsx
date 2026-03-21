import { Link, router } from '@inertiajs/react'
import PublicLayout from '../../layouts/PublicLayout'
import SeoHead from '../../components/SeoHead'

interface BlogPost {
  title: string
  slug: string
  date: string
  category: string
  excerpt: string
  read_time: number
}

interface Props {
  posts: BlogPost[]
  categories: string[]
  activeCategory: string | null
}

const CATEGORY_COLORS: Record<string, string> = {
  'Getting Started': 'bg-emerald-100 text-emerald-800',
  'Tax & Compliance': 'bg-amber-100 text-amber-800',
  'Deal Analysis': 'bg-blue-100 text-blue-800',
  'Loan Structures': 'bg-purple-100 text-purple-800',
  'Portfolio Strategy': 'bg-rose-100 text-rose-800',
}

function formatDate(iso: string): string {
  return new Date(iso + 'T00:00:00').toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export default function BlogIndex({ posts, categories, activeCategory }: Props) {
  function handleFilter(category: string | null) {
    router.get('/blog', category ? { category } : {}, { preserveState: true, preserveScroll: false })
  }

  return (
    <PublicLayout
      title="Blog"
      description="Guides, strategies, and insights for private lenders managing their loan portfolios."
    >
      <SeoHead
        title="Private Lending Blog"
        description="Practical guides on loan structuring, tax compliance, risk management, and portfolio strategy for private and hard money lenders."
        canonicalPath="/blog"
      />

      {/* Category filters */}
      <div className="flex flex-wrap gap-2 mb-8">
        <button
          onClick={() => handleFilter(null)}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            !activeCategory
              ? 'bg-gray-900 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          All Posts
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => handleFilter(cat)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              activeCategory === cat
                ? 'bg-gray-900 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Post grid */}
      {posts.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-500 text-lg">No posts in this category yet.</p>
          <button
            onClick={() => handleFilter(null)}
            className="mt-4 text-emerald-600 hover:text-emerald-700 font-medium"
          >
            View all posts
          </button>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="group block bg-white rounded-xl border border-gray-200 p-6 hover:border-gray-300 hover:shadow-md transition-all"
            >
              {/* Category tag */}
              <span
                className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${
                  CATEGORY_COLORS[post.category] || 'bg-gray-100 text-gray-700'
                }`}
              >
                {post.category}
              </span>

              {/* Title */}
              <h2 className="mt-3 text-lg font-bold text-gray-900 group-hover:text-emerald-700 transition-colors leading-snug">
                {post.title}
              </h2>

              {/* Excerpt */}
              <p className="mt-2 text-sm text-gray-600 leading-relaxed line-clamp-3">
                {post.excerpt}
              </p>

              {/* Meta */}
              <div className="mt-4 flex items-center gap-3 text-xs text-gray-400">
                <time dateTime={post.date}>{formatDate(post.date)}</time>
                <span>·</span>
                <span>{post.read_time} min read</span>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* RSS link */}
      <div className="mt-12 text-center">
        <a
          href="/blog/feed.xml"
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M6.18 15.64a2.18 2.18 0 0 1 2.18 2.18C8.36 19 7.38 20 6.18 20C5 20 4 19 4 17.82a2.18 2.18 0 0 1 2.18-2.18M4 4.44A15.56 15.56 0 0 1 19.56 20h-2.83A12.73 12.73 0 0 0 4 7.27V4.44m0 5.66a9.9 9.9 0 0 1 9.9 9.9h-2.83A7.07 7.07 0 0 0 4 12.93V10.1Z" />
          </svg>
          Subscribe via RSS
        </a>
      </div>
    </PublicLayout>
  )
}
