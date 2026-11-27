import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
} from 'react-router-dom'
import { useEffect } from 'react'
import { AuthProvider } from './context/AuthContext.jsx'
import { useAuth } from './context/useAuth.js'
import AuthPage from './components/AuthPage.jsx'
import DashboardPage from './components/DashboardPage.jsx'
import LandingPage from './components/LandingPage.jsx'
import Shop from './components/Shop.jsx'
import CartPage from './components/CartPage.jsx'
import SiteNavigation from './components/SiteNavigation.jsx'
import ListingDetailPage from './components/ListingDetailPage.jsx'
import SellerProfilePage from './components/SellerProfilePage.jsx'
import EventsPage from './components/events/EventPages.jsx'
import EventDetailPage from './components/events/EventDetailPage.jsx'
import { CartProvider } from './context/CartContext.jsx'

function PageStatus({ title, message, action }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-surface px-6 py-12">
      <section className="w-full max-w-lg rounded-xl border border-outline-variant bg-surface-container-lowest p-8 text-center shadow-lg">
        <h1 className="font-headline text-headline-lg-mobile text-on-surface lg:text-headline-lg">
          {title}
        </h1>
        <p className="mt-3 font-body text-body-md text-on-surface-variant">
          {message}
        </p>
        {action}
      </section>
    </main>
  )
}

function PublicOnlyRoute({ children }) {
  const { status } = useAuth()

  if (status === 'checking') {
    return (
      <PageStatus
        title="Checking your account"
        message="Please wait while we verify your HerMarket session."
      />
    )
  }
  if (status === 'authenticated') {
    return <Navigate to="/dashboard" replace />
  }

  return children
}

function ProtectedRoute({ children }) {
  const { status, authError, retrySessionValidation } = useAuth()
  const location = useLocation()

  if (status === 'checking') {
    return (
      <PageStatus
        title="Checking your account"
        message="Please wait while we verify your HerMarket session."
      />
    )
  }
  if (status === 'error') {
    return (
      <PageStatus
        title="We couldn't verify your session"
        message={authError}
        action={
          <button
            type="button"
            onClick={retrySessionValidation}
            className="mt-6 min-h-[48px] rounded-lg bg-primary px-6 py-3 font-label text-label-lg text-on-primary"
          >
            Try again
          </button>
        }
      />
    )
  }
  if (status !== 'authenticated') {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  return children
}

function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  }, [pathname])

  return null
}

function AppRoutes() {
  const { pathname } = useLocation()
  const dashboardLayout = pathname === '/dashboard'
  const routeBottomPadding =
    dashboardLayout || ['/', '/shop', '/cart'].includes(pathname)
      ? ''
      : 'pb-20 lg:pb-0'

  return (
    <>
      <ScrollToTop />
      {!dashboardLayout && <SiteNavigation showSearch={pathname === '/'} />}
      <div className={routeBottomPadding}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/events" element={<EventsPage />} />
          <Route path="/events/:id" element={<EventDetailPage />} />
          <Route path="/listings/:id" element={<ListingDetailPage />} />
          <Route path="/sellers/:sellerId" element={<SellerProfilePage />} />
          <Route
            path="/login"
            element={
              <PublicOnlyRoute>
                <AuthPage mode="login" />
              </PublicOnlyRoute>
            }
          />
          <Route
            path="/register"
            element={
              <PublicOnlyRoute>
                <AuthPage mode="register" />
              </PublicOnlyRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </>
  )
}

function App() {
  return (
    <BrowserRouter>
      <CartProvider>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </CartProvider>
    </BrowserRouter>
  )
}

export default App