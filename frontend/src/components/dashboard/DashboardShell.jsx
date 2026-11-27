import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/useAuth.js'

export default function DashboardShell({ label, children }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

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
          <button type="button" onClick={() => { logout(); navigate('/login', { replace: true }) }}
                  className="min-h-[44px] rounded-lg border border-outline-variant px-4 font-label text-label-md text-primary hover:bg-primary-container">
            Sign out
          </button>
        </div>
      </header>
      <div className="mx-auto max-w-6xl px-6 py-10">
        <section className="rounded-xl bg-primary px-6 py-8 text-on-primary shadow-md sm:px-10">
          <p className="font-label text-label-md uppercase text-primary-container">{label}</p>
          <h1 className="mt-2 font-display text-headline-lg-mobile sm:text-display-lg">{user.name}</h1>
          <p className="mt-2 font-body text-body-md text-primary-container">{user.email}</p>
        </section>
        <div className="mt-8">{children}</div>
      </div>
    </main>
  )
}