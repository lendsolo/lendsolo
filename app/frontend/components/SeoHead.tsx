import { Head } from '@inertiajs/react'

interface Props {
  title: string
  description: string
  canonicalUrl?: string
  canonicalPath?: string
  ogType?: string
  schema?: object
}

export default function SeoHead({
  title,
  description,
  canonicalUrl,
  canonicalPath,
  ogType = 'website',
  schema,
}: Props) {
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://lendsolo.com'
  const resolvedUrl = canonicalUrl ?? (canonicalPath ? `${baseUrl}${canonicalPath}` : baseUrl)
  const fullTitle = title.includes('LendSolo') ? title : `${title} | LendSolo`

  const jsonLd = schema ?? {
    '@context': 'https://schema.org',
    '@type': 'FinancialProduct',
    name: title,
    description,
    url: resolvedUrl,
    provider: {
      '@type': 'Organization',
      name: 'LendSolo',
      url: baseUrl,
    },
    category: 'Loan Calculator',
  }

  const jsonLdWithContext = schema
    ? { '@context': 'https://schema.org', ...schema }
    : jsonLd

  return (
    <Head>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={resolvedUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={resolvedUrl} />
      <meta property="og:site_name" content="LendSolo" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLdWithContext).replace(/</g, '\\u003c'),
        }}
      />
    </Head>
  )
}
