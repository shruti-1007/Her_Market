import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/useAuth.js'
import SellerListings from './dashboard/SellerListings.jsx'
import SellerInquiries from './dashboard/SellerInquiries.jsx'
import SellerProfileSidebar from './dashboard/SellerProfileSidebar.jsx'
import SellerAnalytics from './dashboard/SellerAnalytics.jsx'
import CustomerInquiries from './dashboard/CustomerInquiries.jsx'
import OrgDashboard from './org/OrgDashboard.jsx'
import AdminDashboard from './admin/AdminDashboard.jsx'

function DashboardPage() {
  const { t } = useTranslation()
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const isSeller = user.role === 'seller'
  const [tab, setTab] = useState('listings')

  if (user.role === 'organization') return <OrgDashboard />
  if (user.role === 'admin') return <AdminDashboard />


  function handleLogout() {
    logout()
    navigate('/login', { replace: true })
  }

  const sectionDetails = {
    listings: {
      title: t('Your products'),
      description: t('Manage your listings, prices and availability.'),
    },
    inquiries: {
      title: t('Customer inquiries'),
      description: t('Review and respond to messages about your products.'),
    },
    analytics: {
      title: t('Business analytics'),
      description: t('Understand product interest and customer activity.'),
    },
  }[tab]

  return (
    <main className="min-h-screen bg-surface">
      <header className="border-b border-outline-variant bg-surface-container-lowest">
        <div className={`mx-auto flex items-center justify-between gap-4 px-4 py-4 sm:px-6 ${isSeller ? 'max-w-7xl' : 'max-w-6xl'}`}>
          <Link to="/" className="flex items-center gap-3 rounded-lg">
            <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary text-on-primary shadow-sm">
              <span className="material-symbols-outlined text-headline-sm" aria-hidden="true">storefront</span>
            </span>
            <span className="font-headline text-title-lg text-primary">HerMarket</span>
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="min-h-[44px] rounded-lg border border-outline-variant px-4 font-label text-label-md text-primary transition-colors hover:bg-primary-container"
          >
            {t('Sign out')}
          </button>
        </div>
      </header>

      <div className={`mx-auto px-4 py-7 sm:px-6 sm:py-9 ${isSeller ? 'max-w-7xl lg:px-8' : 'max-w-6xl'}`}>
        <section className="flex flex-col gap-5 rounded-2xl bg-primary px-6 py-7 text-on-primary shadow-md sm:flex-row sm:items-end sm:justify-between sm:px-9 sm:py-8">
          <div>
            <p className="font-label text-label-md uppercase tracking-wide text-primary-container">
              {isSeller ? t('Seller workspace') : t('{{role}} account', { role: user.role })}
            </p>
            <h1 className="mt-2 font-display text-headline-lg-mobile sm:text-display-lg">
              {t('Welcome, {{name}}', { name: user.name })}
            </h1>
            <p className="mt-2 font-body text-body-md text-primary-container">
              {isSeller ? t('Manage your shop, products and customer activity.') : user.email}
            </p>
          </div>
          {isSeller && (
            <span className="inline-flex min-h-9 items-center gap-2 self-start rounded-full border border-white/20 bg-white/10 px-4 font-label text-label-md text-on-primary sm:self-auto">
              <span className="material-symbols-outlined text-title-md" aria-hidden="true">storefront</span>
              {t('Seller account')}
            </span>
          )}
        </section>

        {isSeller ? (
          <div className="mt-7 grid items-start gap-6 lg:mt-8 lg:grid-cols-[17.5rem_minmax(0,1fr)] lg:gap-8">
            <SellerProfileSidebar activeTab={tab} onTabChange={setTab} />
            <section className="min-w-0">
              <div className="mb-5">
                <h2 className="font-headline text-headline-lg-mobile text-on-surface sm:text-headline-lg">
                  {sectionDetails.title}
                </h2>
                <p className="mt-1 font-body text-body-md text-on-surface-variant">
                  {sectionDetails.description}
                </p>
              </div>
              <div>
                {tab === 'listings'
                  ? <SellerListings />
                  : tab === 'inquiries'
                    ? <SellerInquiries />
                    : <SellerAnalytics />}
              </div>
            </section>
          </div>
        ) : (
          <div className="mt-8">
            <h2 className="mb-4 font-headline text-headline-lg-mobile text-on-surface">
              {t('My inquiries')}
            </h2>
            <CustomerInquiries />
          </div>
        )}
      </div>
    </main>
  )
}

export default DashboardPage