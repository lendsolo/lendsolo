import SeoHead from '../../components/SeoHead'
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

const LANDING_DESCRIPTION =
  'Track private loans, automate amortization, and get tax-ready reports. Built for solo lenders managing 1–15 loans. Free to start.'

export default function LandingPage() {
  return (
    <>
      <SeoHead
        title="LendSolo — Loan Management for Private Lenders"
        description={LANDING_DESCRIPTION}
        canonicalUrl="https://lendsolo.com"
        ogType="website"
        schema={{
          '@type': 'SoftwareApplication',
          name: 'LendSolo',
          applicationCategory: 'FinanceApplication',
          operatingSystem: 'Web',
          description: LANDING_DESCRIPTION,
          url: 'https://lendsolo.com',
          offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
        }}
      />

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
