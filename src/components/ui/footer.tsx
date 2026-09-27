import React from 'react';
import { Link } from 'react-router';
import { useI18n } from '@/lib/i18n';
import { useLocalizedPath } from '@/lib/use-localized-path';

/** Ano em que o site foi ao ar. Base do intervalo de copyright. */
const SITE_START_YEAR = 2026

const Footer: React.FC = () => {
  const { t } = useI18n()
  const localizedPath = useLocalizedPath()
  const currentYear = new Date().getFullYear()
  // Enquanto for o primeiro ano, mostra só ele — "© 2026 - 2026" fica bobo.
  const copyrightYears = currentYear > SITE_START_YEAR
    ? `${SITE_START_YEAR} - ${currentYear}`
    : `${SITE_START_YEAR}`

  // O padding horizontal fica DENTRO do container de 1280px, igual ao navbar
  // e ao main. Fora dele, o bloco desloca em telas largas.
  return (
    <footer className="border-t border-line bg-graphite py-12 text-on-graphite">
      <div className="mx-auto w-full max-w-[1280px] px-4 sm:px-5 md:px-6">
        <strong className="mb-3 block text-2xl font-extrabold tracking-[-0.04em] sm:text-3xl">Kawhan Laurindo</strong>
        <div className="mb-4 flex flex-wrap gap-3 font-mono text-xs uppercase tracking-[0.06em] text-soft">
          <Link className="transition-colors hover:text-accent hover:underline hover:underline-offset-4" to={localizedPath('/privacy-policy')} data-nav-item>{t('footer.privacy')}</Link>
          <span aria-hidden="true">/</span>
          <Link className="transition-colors hover:text-accent hover:underline hover:underline-offset-4" to={localizedPath('/terms-of-use')} data-nav-item>{t('footer.terms')}</Link>
        </div>
        <p className="font-mono text-xs uppercase tracking-[0.06em] text-soft">© {copyrightYears} Kawhan Laurindo. {t('footer.madeWith')}</p>
      </div>
    </footer>
  );
};

export default Footer;
