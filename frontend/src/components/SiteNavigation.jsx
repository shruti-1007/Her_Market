import { Link, NavLink } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../context/useAuth.js'
import { useCart } from '../context/useCart.js'

export function Icon({ children, className = '', filled = false }) {
  return (
    <span
      className={`material-symbols-outlined ${className}`}
      style={filled ? { fontVariationSettings: "'FILL' 1" } : undefined}
      aria-hidden="true"
    >
      {children}
    </span>
  )
}

export function Brand({ compact = false }) {
  return (
    <NavLink to="/" end className={`flex items-center ${compact ? 'gap-2' : 'gap-3'} shrink-0 rounded-lg`}>
      <span
        className={`flex items-center justify-center rounded-lg bg-primary text-on-primary ${
          compact ? 'h-10 w-10' : 'h-11 w-11 shadow-sm'
        }`}
      >
        <Icon className={compact ? '' : 'text-headline-sm'}>storefront</Icon>
      </span>
      <span className="font-headline text-title-lg text-primary">HerMarket</span>
    </NavLink>
  )
}

export function LanguageButton({ mobile = false }) {
  const { t, i18n } = useTranslation()
  const language = i18n.resolvedLanguage === 'ne' ? 'ne' : 'en'

  return (
    <button
      type="button"
      onClick={() => {
        const nextLanguage = language === 'ne' ? 'en' : 'ne'
        i18n.changeLanguage(nextLanguage)
        window.localStorage.setItem('hermarket_language', nextLanguage)
      }}
      aria-label={t('Switch language to {{language}}', {
        language: t(language === 'ne' ? 'English' : 'Nepali'),
      })}
      className={`flex shrink-0 cursor-pointer items-center gap-1 rounded-full border border-outline-variant bg-surface-container-lowest text-on-surface ${
        mobile
          ? 'min-h-[44px] px-3 font-label text-label-md'
          : 'min-h-[48px] px-3 font-label text-label-md transition-colors duration-state-change hover:bg-surface-container-low'
      }`}
    >
      <Icon className="text-title-md">translate</Icon>
      <span>{mobile ? (language === 'ne' ? 'नेपाली' : 'EN') : t(language === 'ne' ? 'Nepali' : 'English')}</span>
    </button>
  )
}

const activeDesktopLink =
  'flex min-h-[48px] shrink-0 items-center rounded-lg bg-primary-container px-3 font-label text-label-lg text-on-primary-container'

export function CartLink() {
  const { cartCount } = useCart()
  const { t } = useTranslation()

  return (
    <NavLink
      to="/cart"
      aria-label={
        cartCount
          ? t('Shopping cart, {{count}} items', { count: cartCount })
          : t('Shopping cart')
      }
      className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-outline-variant bg-surface-container-lowest text-on-surface transition-colors hover:bg-surface-container-low"
    >
      <Icon className="text-title-md">shopping_cart</Icon>
      {cartCount > 0 && (
        <span className="absolute -right-1 -top-1 flex min-h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 font-label text-[11px] leading-none text-on-primary">
          {cartCount > 99 ? '99+' : cartCount}
        </span>
      )}
    </NavLink>
  )
}

function AccountMenu({ mobile = false }) {
  const { user, status, logout } = useAuth()
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const menuRef = useRef(null)

  useEffect(() => {
    if (!open) return undefined

    const closeOnOutsideClick = (event) => {
      if (!menuRef.current?.contains(event.target)) setOpen(false)
    }
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') setOpen(false)
    }

    document.addEventListener('pointerdown', closeOnOutsideClick)
    document.addEventListener('keydown', closeOnEscape)
    return () => {
      document.removeEventListener('pointerdown', closeOnOutsideClick)
      document.removeEventListener('keydown', closeOnEscape)
    }
  }, [open])

  if (status !== 'authenticated' || !user) {
    if (mobile) {
      return status === 'checking' ? (
        <span aria-label={t('Checking account')} className="flex h-11 w-11 items-center justify-center rounded-full border border-outline-variant bg-surface-container-low text-on-surface-variant">
          <Icon>person</Icon>
        </span>
      ) : null
    }

    return status === 'checking' ? (
      <span aria-label={t('Checking account')} className="hidden h-11 w-11 items-center justify-center rounded-full border border-outline-variant bg-surface-container-low text-on-surface-variant xl:flex">
        <Icon>person</Icon>
      </span>
    ) : (
      <Link
        to="/login"
        className="hidden min-h-[48px] shrink-0 items-center whitespace-nowrap rounded-lg px-3 font-label text-label-lg text-primary transition-colors duration-state-change hover:bg-primary-container xl:flex"
      >
        {t('Login / Sign up')}
      </Link>
    )
  }

  const displayName = user.name || t('Account')
  const role = user.role ? t(user.role) : t('Account')

  return (
    <div ref={menuRef} className={`relative ${mobile ? '' : 'hidden xl:block'}`}>
      <button
        type="button"
        aria-label={t('Open account menu for {{name}}', { name: displayName })}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        className="flex h-11 items-center gap-1 rounded-full border border-outline-variant bg-surface-container-lowest p-1 pr-2 text-primary shadow-sm transition-colors hover:bg-primary-container focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      >
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary font-label text-label-md text-on-primary">
          {displayName.charAt(0).toUpperCase()}
        </span>
        {!mobile && <Icon className="text-title-md">expand_more</Icon>}
      </button>

      <div
        role="menu"
        aria-hidden={!open}
        className={`absolute right-0 top-full z-50 mt-2 w-64 origin-top-right rounded-xl border border-outline-variant bg-surface-container-lowest p-2 shadow-lg transition duration-150 ease-out ${
          open
            ? 'visible translate-y-0 scale-100 opacity-100'
            : 'invisible -translate-y-1 scale-95 opacity-0'
        }`}
      >
        <div className="rounded-lg bg-surface-container-low px-4 py-3">
          <p className="truncate font-label text-label-md text-on-surface">{displayName}</p>
          <p className="mt-1 font-body text-sm text-on-surface-variant">{t('{{role}} account', { role })}</p>
        </div>
        <div className="mt-2 flex flex-col gap-1">
          <Link
            to="/dashboard"
            role="menuitem"
            onClick={() => setOpen(false)}
            className="flex min-h-[44px] items-center gap-3 rounded-lg px-3 font-label text-label-md text-on-surface transition-colors hover:bg-primary-container"
          >
            <Icon className="text-title-md">dashboard</Icon>
            {t('Dashboard')}
          </Link>
          {user.role === 'seller' && user.id && (
            <Link
              to={`/sellers/${user.id}`}
              role="menuitem"
              onClick={() => setOpen(false)}
              className="flex min-h-[44px] items-center gap-3 rounded-lg px-3 font-label text-label-md text-on-surface transition-colors hover:bg-primary-container"
            >
              <Icon className="text-title-md">storefront</Icon>
              {t('Public seller profile')}
            </Link>
          )}
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setOpen(false)
              logout()
            }}
            className="flex min-h-[44px] items-center gap-3 rounded-lg px-3 text-left font-label text-label-md text-error transition-colors hover:bg-red-50"
          >
            <Icon className="text-title-md">logout</Icon>
            {t('Log out')}
          </button>
        </div>
      </div>
    </div>
  )
}

export function DesktopHeader({ showSearch = true }) {
  const { t } = useTranslation()
  return (
    <header className="sticky top-0 z-40 hidden border-b border-outline-variant bg-surface-container-lowest shadow-sm lg:block">
      <div className="mx-auto flex max-w-[1200px] items-center justify-between gap-4 px-6 py-3">
        <Brand />
        <nav aria-label={t('Main navigation')} className="hidden shrink-0 items-center gap-1 lg:flex">
          <NavLink
            to="/"
            end
            className={({ isActive }) => (isActive ? activeDesktopLink : 'desktop-nav-link')}
          >
            {t('Home', { context: 'navigation' })}
          </NavLink>
          <NavLink
            to="/shop"
            className={({ isActive }) => (isActive ? activeDesktopLink : 'desktop-nav-link')}
          >
            {t('Shop')}
          </NavLink>
          <NavLink to="/events" className="desktop-nav-link">
            {t('Events')}
          </NavLink>
        </nav>
        {showSearch && (
          <div className="hidden max-w-[210px] flex-1 xl:flex">
            <label className="relative flex w-full items-center">
              <span className="sr-only">{t('Search handmade products')}</span>
              <Icon className="absolute left-3 text-on-surface-variant">search</Icon>
              <input
                type="search"
                placeholder={t('Search goods...')}
                className="min-h-[48px] w-full rounded-lg border border-outline-variant bg-surface-container-low py-2 pl-10 pr-4 font-body text-body-md text-on-surface outline-none placeholder:text-outline focus:border-primary focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/20"
              />
            </label>
          </div>
        )}
        <div className="flex shrink-0 items-center gap-2">
          <LanguageButton />
          <AccountMenu />
          <CartLink />
          <NavLink
            to="/register"
            className="hidden min-h-[48px] shrink-0 cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-lg bg-cta px-4 py-3 font-label text-label-lg text-on-cta shadow-sm transition-colors duration-state-change hover:opacity-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary xl:inline-flex"
          >
            <Icon>add_business</Icon>
            {t('Sell Your Products')}
          </NavLink>
        </div>
      </div>
    </header>
  )
}

export function MobileHeader() {
  const [menuOpen, setMenuOpen] = useState(false)
  const { status } = useAuth()
  const { t } = useTranslation()
  const navLinks = [
    ['/', 'Home', 'home'],
    ['/shop', 'Shop Handmade', 'shopping_bag'],
    ['/events', 'Events', 'event'],
  ]

  return (
    <header className="sticky top-0 z-40 border-b border-outline-variant bg-surface-container-lowest shadow-sm lg:hidden">
      <div className="flex items-center justify-between gap-3 px-4 py-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label={t(menuOpen ? 'Close menu' : 'Open menu')}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
            className="flex h-12 w-12 cursor-pointer items-center justify-center rounded-lg bg-surface-container-low text-on-surface"
          >
            <Icon className="text-headline-sm">{menuOpen ? 'close' : 'menu'}</Icon>
          </button>
          <Brand compact />
        </div>
        <div className="flex items-center gap-2">
          <LanguageButton mobile />
          <AccountMenu mobile />
        </div>
      </div>
      <nav
        aria-label={t('Mobile menu')}
        className={`${
          menuOpen ? 'flex' : 'hidden'
        } flex-col gap-2 border-t border-outline-variant bg-surface-container-lowest px-4 py-4`}
      >
        {navLinks.map(([to, label, icon]) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            onClick={() => setMenuOpen(false)}
            className={({ isActive }) =>
              `flex min-h-[48px] items-center gap-3 rounded-lg px-4 font-label text-label-lg ${
                isActive && (to === '/' || to === '/shop')
                  ? 'bg-primary-container text-on-primary-container'
                  : 'text-on-surface hover:bg-surface-container-low'
              }`
            }
          >
            <Icon>{icon}</Icon>
            {t(label, { context: 'navigation' })}
          </NavLink>
        ))}
        {status !== 'authenticated' && status !== 'checking' && (
          <NavLink
            to="/login"
            onClick={() => setMenuOpen(false)}
            className="flex min-h-[48px] items-center gap-3 rounded-lg px-4 font-label text-label-lg text-on-surface hover:bg-surface-container-low"
          >
            <Icon>login</Icon>
            {t('Login / Sign up')}
          </NavLink>
        )}
        <NavLink
          to="/register"
          onClick={() => setMenuOpen(false)}
          className="mt-2 flex min-h-[48px] items-center justify-center gap-2 rounded-lg bg-cta px-4 font-label text-label-lg text-on-cta"
        >
          <Icon>add_business</Icon>
          {t('Sell Your Products')}
        </NavLink>
      </nav>
    </header>
  )
}

export function MobileBottomNavigation() {
  const { cartCount } = useCart()
  const { t } = useTranslation()
  const links = [
    ['/', 'Home', 'home'],
    ['/shop', 'Shop', 'shopping_bag'],
    ['/register', 'Sell', 'add_circle', true],
    ['/events', 'Events', 'event'],
    ['/cart', 'Cart', 'shopping_cart'],
  ]

  return (
    <nav
      aria-label={t('Bottom navigation')}
      className="fixed inset-x-0 bottom-0 z-50 grid grid-cols-5 gap-0 border-t border-outline-variant bg-surface-container-lowest px-1 py-1.5 lg:hidden"
    >
      {links.map(([to, label, icon, highlighted]) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/'}
          className={({ isActive }) =>
            `flex min-h-[48px] min-w-0 flex-col items-center justify-center rounded-lg px-0.5 ${
              isActive && (to === '/' || to === '/shop' || to === '/cart')
                ? 'bg-primary-container text-on-primary-container'
                : highlighted
                  ? 'bg-cta text-on-cta'
                  : 'text-on-surface-variant'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <span className="relative flex h-6 items-center justify-center">
                <Icon filled={isActive && to === '/'}>{icon}</Icon>
                {to === '/cart' && cartCount > 0 && (
                  <span className="absolute -right-3 -top-1 flex min-h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 font-label text-[10px] leading-none text-on-primary">
                    {cartCount > 99 ? '99+' : cartCount}
                  </span>
                )}
              </span>
              <span className="max-w-full truncate font-label text-[11px] leading-tight">{t(label, { context: 'navigation' })}</span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  )
}

export default function SiteNavigation({ showSearch = false }) {
  return (
    <>
      <DesktopHeader showSearch={showSearch} />
      <MobileHeader />
      <MobileBottomNavigation />
    </>
  )
}
