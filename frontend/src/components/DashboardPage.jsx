import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/useAuth.js'
import SellerListings from './dashboard/SellerListings.jsx'
import SellerInquiries from './dashboard/SellerInquiries.jsx'
import CustomerInquiries from './dashboard/CustomerInquiries.jsx'
import OrgDashboard from './org/OrgDashboard.jsx'
import AdminDashboard from './admin/AdminDashboard.jsx'

function DashboardPage() {
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

  const tabClass = (name) =>
    `min-h-[44px] rounded-lg px-4 font-label text-label-md transition-colors ${
      tab === name
        ? 'bg-primary text-on-primary'
        : 'border border-outline-variant text-primary hover:bg-primary-container'
    }`

  return (
    <main className="min-h-screen bg-surface">
      <header className="border-b border-outline-variant bg-surface-container-lowest">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4">
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
            Sign out
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-6 py-10">
        <section className="rounded-xl bg-primary px-6 py-8 text-on-primary shadow-md sm:px-10">
          <p className="font-label text-label-md capitalize text-primary-container">
            {user.role} account
          </p>
          <h1 className="mt-2 font-display text-headline-lg-mobile sm:text-display-lg">
            Welcome, {user.name}
          </h1>
          <p className="mt-2 font-body text-body-md text-primary-container">{user.email}</p>
        </section>

        {isSeller ? (
          <>
            <div className="mt-8 flex gap-3">
              <button type="button" className={tabClass('listings')} onClick={() => setTab('listings')}>
                My listings
              </button>
              <button type="button" className={tabClass('inquiries')} onClick={() => setTab('inquiries')}>
                Inquiries
              </button>
            </div>
            <div className="mt-6">
              {tab === 'listings' ? <SellerListings /> : <SellerInquiries />}
            </div>
          </>
        ) : (
          <div className="mt-8">
            <h2 className="mb-4 font-headline text-headline-lg-mobile text-on-surface">
              My inquiries
            </h2>
            <CustomerInquiries />
          </div>
        )}
      </div>
    </main>
  )
}

export default DashboardPage