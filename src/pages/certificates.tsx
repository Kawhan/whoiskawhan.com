import { Link } from 'react-router'
import { ArrowLeft } from 'lucide-react'
import { SEO } from '@/components/seo'
import { CertificationsByIssuer, FeaturedCertifications } from '@/components/certifications/certification-lists'
import { certifications } from '@/content/certifications'
import { useI18n } from '@/lib/i18n'
import { useLocalizedPath } from '@/lib/use-localized-path'

export default function Certificates() {
  const { messages, t } = useI18n()
  const localizedPath = useLocalizedPath()

  return (
    <div>
      <SEO title={t('certificates.seoTitle')} description={t('certificates.seoDescription')} path={localizedPath('/certificates')} />

      <section className="flex flex-wrap items-end justify-between gap-4 border-b border-[#1a1a1a] py-8">
        <div>
          <p className="font-mono text-xs font-bold uppercase tracking-[0.095em] text-[#1a1a1a]">{t('certificates.kicker')}</p>
          <h1 className="my-3 max-w-5xl text-4xl font-extrabold leading-none tracking-[-0.055em] sm:text-5xl md:text-8xl">
            {t('certificates.title')}
          </h1>
          <p className="max-w-[720px] font-serif text-xl leading-8 text-[#1a1a1a]">{t('certificates.description')}</p>
        </div>
        <p className="font-mono text-xs font-bold uppercase tracking-[0.095em] text-[#757575]">
          {certifications.length} {messages.about.certificationsCount}
        </p>
      </section>

      <section className="mt-8" aria-label={messages.about.certificationsFeatured}>
        <FeaturedCertifications />
      </section>

      <section className="mt-12" aria-labelledby="certificates-all-title">
        <h2 id="certificates-all-title" className="mb-4 text-4xl font-extrabold leading-none tracking-[-0.045em]">
          {t('certificates.allTitle')}
        </h2>
        <CertificationsByIssuer />
      </section>

      <Link
        to={localizedPath('/about')}
        className="mt-8 inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.095em] text-[#057dbc] underline underline-offset-4"
      >
        <ArrowLeft size={14} />
        {t('certificates.back')}
      </Link>
    </div>
  )
}
