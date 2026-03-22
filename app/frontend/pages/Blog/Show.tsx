import { Link } from '@inertiajs/react'
import { useMemo } from 'react'
import PublicLayout from '../../layouts/PublicLayout'
import SeoHead from '../../components/SeoHead'

interface Heading {
  level: number
  text: string
  id: string
}

interface BlogPost {
  title: string
  slug: string
  date: string
  category: string
  excerpt: string
  meta_title: string
  meta_description: string
  read_time: number
  word_count: number
  body_html: string
  headings: Heading[]
}

interface RelatedPost {
  title: string
  slug: string
  date: string
  category: string
  excerpt: string
  read_time: number
}

interface Props {
  post: BlogPost
  relatedPosts: RelatedPost[]
}

const CATEGORY_COLORS: Record<string, string> = {
  'Getting Started': 'bg-emerald-100 text-emerald-800',
  'Tax & Compliance': 'bg-amber-100 text-amber-800',
  'Deal Analysis': 'bg-blue-100 text-blue-800',
  'Loan Structures': 'bg-purple-100 text-purple-800',
  'Portfolio Strategy': 'bg-rose-100 text-rose-800',
}

const CATEGORY_CTA: Record<string, { text: string; href: string }> = {
  'Getting Started': { text: 'Model your first loan →', href: '/tools/loan-amortization-calculator' },
  'Tax & Compliance': { text: 'Export tax-ready reports →', href: '/users/sign_up' },
  'Deal Analysis': { text: 'Calculate ROI on a deal →', href: '/tools/roi-calculator' },
  'Loan Structures': { text: 'Compare loan structures →', href: '/tools/loan-comparison' },
  'Portfolio Strategy': { text: 'Model interest-only returns →', href: '/tools/interest-only-calculator' },
}

function formatDate(iso: string): string {
  return new Date(iso + 'T00:00:00').toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export default function BlogShow({ post, relatedPosts }: Props) {
  const cta = CATEGORY_CTA[post.category] || CATEGORY_CTA['Getting Started']

  const tocHeadings = useMemo(
    () => post.headings.filter((h) => h.level === 2 || h.level === 3),
    [post.headings]
  )

  // Strip the leading H1 from body_html to avoid duplicating the title shown in the hero
  const bodyHtml = useMemo(
    () => post.body_html.replace(/^\s*<h1[^>]*>.*?<\/h1>\s*/i, ''),
    [post.body_html]
  )

  return (
    <PublicLayout title={post.title} description={post.excerpt}>
      <SeoHead
        title={post.meta_title}
        description={post.meta_description}
        canonicalPath={`/blog/${post.slug}`}
        type="article"
      />

      <div className="max-w-4xl mx-auto">
        {/* Post header */}
        <div className="mb-8">
          <Link
            href="/blog"
            className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors mb-4"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            All posts
          </Link>

          <div className="flex items-center gap-3 mb-3">
            <span
              className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${
                CATEGORY_COLORS[post.category] || 'bg-gray-100 text-gray-700'
              }`}
            >
              {post.category}
            </span>
            <span className="text-sm text-gray-400">
              {formatDate(post.date)} · {post.read_time} min read
            </span>
          </div>
        </div>

        {/* Two-column layout: TOC sidebar + content */}
        <div className="flex gap-10">
          {/* Table of contents — desktop sidebar */}
          {tocHeadings.length > 2 && (
            <aside className="hidden lg:block w-56 flex-shrink-0">
              <nav className="sticky top-8">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                  On this page
                </p>
                <ul className="space-y-2 border-l border-gray-200">
                  {tocHeadings.map((h) => (
                    <li key={h.id}>
                      <a
                        href={`#${h.id}`}
                        className={`block text-sm text-gray-500 hover:text-gray-900 transition-colors border-l-2 border-transparent hover:border-emerald-500 ${
                          h.level === 3 ? 'pl-6' : 'pl-4'
                        }`}
                      >
                        {h.text}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
            </aside>
          )}

          {/* Article body */}
          <article className="flex-1 min-w-0">
            <div
              className="prose prose-gray prose-lg max-w-none
                prose-headings:font-bold prose-headings:text-gray-900
                prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4
                prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3
                prose-p:leading-relaxed prose-p:text-gray-700
                prose-li:text-gray-700
                prose-a:text-emerald-600 prose-a:font-medium hover:prose-a:text-emerald-700
                prose-strong:text-gray-900
                prose-code:bg-gray-100 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:font-mono
                prose-pre:bg-gray-900 prose-pre:text-gray-100
                prose-blockquote:border-emerald-500 prose-blockquote:text-gray-600"
              dangerouslySetInnerHTML={{ __html: bodyHtml }}
            />

            {/* CTA card */}
            <div className="mt-12 rounded-xl border-2 border-emerald-200 bg-emerald-50 p-8">
              <h3 className="text-lg font-bold text-gray-900">
                Ready to move beyond spreadsheets?
              </h3>
              <p className="mt-2 text-gray-600">
                LendSolo helps private lenders track loans, record payments, and generate tax-ready reports — free for up to 5 loans.
              </p>
              <div className="mt-5 flex flex-col sm:flex-row gap-3">
                <Link
                  href="/users/sign_up"
                  className="inline-flex items-center justify-center px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg transition-colors"
                >
                  Try LendSolo free
                </Link>
                <Link
                  href={cta.href}
                  className="inline-flex items-center justify-center px-6 py-3 bg-white border border-gray-300 hover:border-gray-400 text-gray-700 font-medium rounded-lg transition-colors"
                >
                  {cta.text}
                </Link>
              </div>
            </div>

            {/* Related posts */}
            {relatedPosts.length > 0 && (
              <div className="mt-16">
                <h3 className="text-lg font-bold text-gray-900 mb-6">Related Articles</h3>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {relatedPosts.map((rp) => (
                    <Link
                      key={rp.slug}
                      href={`/blog/${rp.slug}`}
                      className="group block bg-white rounded-lg border border-gray-200 p-5 hover:border-gray-300 hover:shadow-sm transition-all"
                    >
                      <h4 className="text-sm font-bold text-gray-900 group-hover:text-emerald-700 transition-colors leading-snug">
                        {rp.title}
                      </h4>
                      <p className="mt-2 text-xs text-gray-500 line-clamp-2">{rp.excerpt}</p>
                      <p className="mt-3 text-xs text-gray-400">
                        {rp.read_time} min read
                      </p>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </article>
        </div>
      </div>
    </PublicLayout>
  )
}
