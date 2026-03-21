import { Head } from '@inertiajs/react'
import StickyNav from './sections/StickyNav'
import Hero from './sections/Hero'
import Problem from './sections/Problem'
import WhyNotSpreadsheets from './sections/WhyNotSpreadsheets'
import ProductShowcase from './sections/ProductShowcase'
import FeaturesGrid from './sections/FeaturesGrid'
import Pricing from './sections/Pricing'
import SocialProof from './sections/SocialProof'
import Faq from './sections/Faq'
import FinalCta from './sections/FinalCta'

export default function LandingPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'LendSolo',
    applicationCategory: 'FinanceApplication',
    operatingSystem: 'Web',
    description:
      'Loan management software for private lenders. Track loans, generate amortization schedules, manage payments, and run your lending business without spreadsheets.',
    offers: [
      { '@type': 'Offer', price: '0', priceCurrency: 'USD', name: 'Free Calculators' },
      { '@type': 'Offer', price: '19', priceCurrency: 'USD', name: 'Solo' },
      { '@type': 'Offer', price: '39', priceCurrency: 'USD', name: 'Pro' },
      { '@type': 'Offer', price: '99', priceCurrency: 'USD', name: 'Fund' },
    ],
  }

  return (
    <>
      <Head>
        <title>LendSolo — Loan Management for Private Lenders</title>
        <meta
          name="description"
          content="Stop managing private loans in spreadsheets. LendSolo gives micro-lenders a real system for tracking loans, payments, amortization schedules, and tax reporting."
        />
        <link rel="canonical" href="https://lendsolo.com" />
        <meta property="og:title" content="LendSolo — Loan Management for Private Lenders" />
        <meta
          property="og:description"
          content="Stop managing private loans in spreadsheets. Track loans, payments, and amortization schedules with software built for solo lenders."
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://lendsolo.com" />
        <meta property="og:site_name" content="LendSolo" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="LendSolo — Loan Management for Private Lenders" />
        <meta
          name="twitter:description"
          content="Stop managing private loans in spreadsheets. Track loans, payments, and amortization schedules with software built for solo lenders."
        />
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Head>

      <div className="min-h-screen">
        <StickyNav />
        <Hero />
        <Problem />
        <WhyNotSpreadsheets />
        <ProductShowcase />
        <FeaturesGrid />
        <Pricing />
        <SocialProof />
        <Faq />
        <FinalCta />
      </div>
    </>
  )
}
