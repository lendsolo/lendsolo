import SeoHead from '../../components/SeoHead'
import StickyNav from './sections/StickyNav'
import Hero from './sections/Hero'
import Problem from './sections/Problem'
import WhyNotSpreadsheets from './sections/WhyNotSpreadsheets'
import ProductShowcase from './sections/ProductShowcase'
import TriggerSection from './sections/TriggerSection'
import FeaturesGrid from './sections/FeaturesGrid'
import NowLive from './sections/NowLive'
import Pricing from './sections/Pricing'
import SocialProof from './sections/SocialProof'
import Faq from './sections/Faq'
import FinalCta from './sections/FinalCta'

const LANDING_DESCRIPTION =
  'Stop managing your private loans in spreadsheets. LendSolo gives micro-lenders real loan tracking, amortization, guardrails, and tax reporting — built by a lender, for lenders.'

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
        <TriggerSection />
        <FeaturesGrid />
        <NowLive />
        <Pricing />
        <SocialProof />
        <Faq />
        <FinalCta />
      </div>
    </>
  )
}
