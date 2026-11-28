import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../context/useAuth.js'

export default function PageHeader() {
  const { status } = useAuth()
  const { t } = useTranslation()
  return (
    <header className="border-b border-outline-variant bg-surface-container-lowest">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link to="/" className="flex items-center gap-3 rounded-lg">
          <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary text-on-primary shadow-sm">
            <span className="material-symbols-outlined text-headline-sm" aria-hidden="true">storefront</span>
          </span>
          <span className="font-headline text-title-lg text-primary">HerMarket</span>
        </Link>
        <nav className="flex items-center gap-2">
          <Link to="/" className="hidden min-h-[44px] items-center rounded-lg px-3 font-label text-label-md text-primary hover:bg-primary-container sm:inline-flex">
            {t('Marketplace')}
          </Link>
          <Link
            to={status === 'authenticated' ? '/dashboard' : '/login'}
            className="inline-flex min-h-[44px] items-center rounded-lg bg-primary px-4 font-label text-label-md text-on-primary"
          >
            {t(status === 'authenticated' ? 'Dashboard' : 'Login')}
          </Link>
        </nav>
      </div>
    </header>
  )
}