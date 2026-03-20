import { Head } from '@inertiajs/react'

interface Props {
  title: string
  description: string
  canonicalPath: string
  type?: string
}

export default function SeoHead({ title, description, canonicalPath, type = 'website' }: Props) {
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://lendsolo.com'
  const canonicalUrl = `${baseUrl}${canonicalPath}`
  const fullTitle = `${title} | LendSolo`

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FinancialProduct',
    name: title,
    description,
    url: canonicalUrl,
    provider: {
      '@type': 'Organization',
      name: 'LendSolo',
      url: baseUrl,
    },
    category: 'Loan Calculator',
  }

  return (
    <Head>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonicalUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={type} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:site_name" content="LendSolo" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
    </Head>
  )
}
