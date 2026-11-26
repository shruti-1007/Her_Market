import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/useAuth.js'

function DashboardPage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <main className="min-h-screen bg-surface">
      <header className="border-b border-outline-variant bg-surface-container-lowest">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4">
          <Link to="/" className="flex items-center gap-3 rounded-lg">
            <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary text-on-primary shadow-sm">
              <span className="material-symbols-outlined text-headline-sm" aria-hidden="true">
                storefront
              </span>
            </span>
            <span className="font-headline text-title-lg text-primary">
              HerMarket
            </span>
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

      <div className="mx-auto max-w-6xl px-6 py-10 sm:py-14">
        <section className="rounded-xl bg-primary px-6 py-10 text-on-primary shadow-md sm:px-10">
          <p className="font-label text-label-md text-primary-container">
            YOUR HERMARKET ACCOUNT
          </p>
          <h1 className="mt-2 font-display text-headline-lg-mobile sm:text-display-lg">
            Welcome, {user.name}
          </h1>
          <p className="mt-3 max-w-2xl font-body text-body-lg text-primary-container">
            Your account is ready. Keep building connections with makers and
            shoppers in your community.
          </p>
        </section>

        <section className="mt-8 grid gap-6 md:grid-cols-2">
          <article className="rounded-lg border border-outline-variant bg-surface-container-lowest p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary-container text-primary">
                <span className="material-symbols-outlined" aria-hidden="true">
                  person
                </span>
              </span>
              <div>
                <h2 className="font-headline text-title-lg text-on-surface">
                  Account details
                </h2>
                <p className="font-body text-body-md text-on-surface-variant">
                  Your HerMarket profile
                </p>
              </div>
            </div>
            <dl className="mt-6 space-y-4 font-body text-body-md">
              <div>
                <dt className="text-on-surface-variant">Name</dt>
                <dd className="font-label text-on-surface">{user.name}</dd>
              </div>
              <div>
                <dt className="text-on-surface-variant">Email</dt>
                <dd className="font-label text-on-surface">{user.email}</dd>
              </div>
              <div>
                <dt className="text-on-surface-variant">Account type</dt>
                <dd className="font-label capitalize text-on-surface">
                  {user.role}
                </dd>
              </div>
            </dl>
          </article>

          <article className="flex flex-col items-start justify-between gap-6 rounded-lg border border-outline-variant bg-surface-container-low p-6 shadow-sm">
            <div>
              <h2 className="font-headline text-title-lg text-on-surface">
                Explore the marketplace
              </h2>
              <p className="mt-2 font-body text-body-md text-on-surface-variant">
                Browse local products and meet the women who make them.
              </p>
            </div>
            <Link
              to="/"
              className="inline-flex min-h-[48px] items-center gap-2 rounded-lg bg-primary px-5 py-3 font-label text-label-lg text-on-primary transition-opacity hover:opacity-95"
            >
              Visit marketplace
              <span className="material-symbols-outlined" aria-hidden="true">
                arrow_forward
              </span>
            </Link>
          </article>
        </section>
      </div>
    </main>
  )
}

export default DashboardPage
