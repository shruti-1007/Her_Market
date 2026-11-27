import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { getListings } from '../api/listings.js'
import { errorMessage } from '../api/errors.js'
import { formatPrice } from '../constants.js'
import { useAuth } from '../context/useAuth.js'
import ListingImage from './ListingImage.jsx'

const modules = [
  {
    title: 'Buy & Sell',
    description:
      'List your handmade items in minutes or shop unique local goods from women near you.',
    mobileDescription: 'Open your shop or buy handmade',
    icon: 'storefront',
    href: '#shop',
    color: 'primary',
    action: 'Explore shop',
  },
  {
    title: 'Manage Business',
    description:
      'Calculate fair prices, track daily sales and costs, and check your stock without spreadsheets.',
    mobileDescription: 'Price items & track earnings',
    icon: 'calculate',
    href: '#business',
    color: 'tertiary',
    action: 'Open HerBiz',
  },
  {
    title: 'Connect',
    description:
      'Team up on big group orders, find local tailors or packers, and ask mentors for advice.',
    mobileDescription: 'Find makers, mentors & fairs',
    icon: 'diversity_3',
    href: '#connect',
    color: 'secondary',
    action: 'Meet makers',
  },
 
]

const steps = [
  {
    title: '1. Take a photo & add a price',
    description:
      'Snap a clear picture with your phone and write a short sentence about what you made. Not sure on price? Our calculator helps.',
    icon: 'photo_camera',
    color: 'primary',
  },
  {
    title: '2. Chat with local buyers',
    description:
      'Neighbors message you directly with questions or custom requests. Turn any chat into a confirmed order with one tap.',
    icon: 'chat',
    color: 'secondary',
  },
  {
    title: '3. Deliver & grow your shop',
    description:
      'Arrange pickup or delivery, see your monthly earnings clearly.',
    icon: 'savings',
    color: 'tertiary',
  },
]

const makers = [
  {
    name: "Sita's Loom & Yarn",
    category: 'Crochet & Knitwear',
    location: 'Pokhara',
    rating: '4.9 (42 reviews)',
    quote:
      '“I started with two crochet hooks and now ship bags to families across three cities.”',
    image: '/images/seller_sita.jpg',
    alt: 'Portrait of Sita Gurung holding a knitted shawl',
    border: 'primary-container',
    href: '#seller-sita',
  },
  {
    name: 'Mina Clay Studio',
    category: 'Pottery & Decor',
    location: 'Bhaktapur',
    rating: '5.0 (31 reviews)',
    quote:
      '“Every mug is shaped by hand using local clay and fired in our family kiln.”',
    image: '/images/seller_mina.jpg',
    alt: 'Portrait of Mina Prajapati in her pottery workshop',
    border: 'secondary-container',
    href: '#seller-mina',
  },
  {
    name: "Anita's Kitchen",
    category: 'Homemade Food',
    location: 'Kavre',
    rating: '4.8 (56 reviews)',
    quote:
      '“Small-batch wildflower honey and homemade pickles prepared fresh every week.”',
    image: '/images/seller_anita.jpg',
    alt: 'Portrait of Anita Tamang holding jars of honey',
    border: 'tertiary-container',
    href: '#seller-anita',
  },
]

const stories = [
  {
    quote:
      '“Before HerMarket, I didn’t know how to price my stitched bags. The price calculator showed me my true value, and I sold 18 bags in my first month.”',
    name: 'Lakshmi Shrestha',
    detail: 'Tailor & Bag Maker · Lalitpur',
    image: '/images/story_lakshmi.jpg',
    alt: 'Lakshmi smiling beside her sewing machine',
  },
  {
    quote:
      '“When a hotel asked for 60 woven baskets, I teamed up with three women on the Connect board. Together we finished on time and shared the profit.”',
    name: 'Radha & Cooperative Group',
    detail: 'Bamboo & Basket Makers · Chitwan',
    image: '/images/story_radha.jpg',
    alt: 'Radha and her neighbor packing handmade crafts together',
  },
]

function Icon({ children, className = '', filled = false }) {
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

function AppLink({ href, ...props }) {
  return href.startsWith('/') ? <Link to={href} {...props} /> : <a href={href} {...props} />
}

function AccountMenu({ mobile = false }) {
  const { user, status, logout } = useAuth()
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
        <span aria-label="Checking account" className="flex h-11 w-11 items-center justify-center rounded-full border border-outline-variant bg-surface-container-low text-on-surface-variant">
          <Icon>person</Icon>
        </span>
      ) : null
    }

    return status === 'checking' ? (
      <span aria-label="Checking account" className="hidden h-11 w-11 items-center justify-center rounded-full border border-outline-variant bg-surface-container-low text-on-surface-variant xl:flex">
        <Icon>person</Icon>
      </span>
    ) : (
      <AppLink
        href="/login"
        className="hidden min-h-[48px] shrink-0 items-center whitespace-nowrap rounded-lg px-3 font-label text-label-lg text-primary transition-colors duration-state-change hover:bg-primary-container xl:flex"
      >
        Login / Sign up
      </AppLink>
    )
  }

  const displayName = user.name || 'Account'
  const role = user.role ? `${user.role[0].toUpperCase()}${user.role.slice(1)}` : 'Account'

  return (
    <div ref={menuRef} className={`relative ${mobile ? '' : 'hidden xl:block'}`}>
      <button
        type="button"
        aria-label={`Open account menu for ${displayName}`}
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
          <p className="mt-1 font-body text-sm text-on-surface-variant">{role} account</p>
        </div>
        <div className="mt-2 flex flex-col gap-1">
          <Link
            to="/dashboard"
            role="menuitem"
            onClick={() => setOpen(false)}
            className="flex min-h-[44px] items-center gap-3 rounded-lg px-3 font-label text-label-md text-on-surface transition-colors hover:bg-primary-container"
          >
            <Icon className="text-title-md">dashboard</Icon>
            Dashboard
          </Link>
          {user.role === 'seller' && user.id && (
            <Link
              to={`/sellers/${user.id}`}
              role="menuitem"
              onClick={() => setOpen(false)}
              className="flex min-h-[44px] items-center gap-3 rounded-lg px-3 font-label text-label-md text-on-surface transition-colors hover:bg-primary-container"
            >
              <Icon className="text-title-md">storefront</Icon>
              Public seller profile
            </Link>
          )}
          <button
            type="button"
            role="menuitem"
            onClick={() => { setOpen(false); logout() }}
            className="flex min-h-[44px] items-center gap-3 rounded-lg px-3 text-left font-label text-label-md text-error transition-colors hover:bg-red-50"
          >
            <Icon className="text-title-md">logout</Icon>
            Log out
          </button>
        </div>
      </div>
    </div>
  )
}

/* ---------- Real listings from the backend ---------- */

function useListings(limit) {
  const [state, setState] = useState({ loading: true, error: '', listings: [] })

  useEffect(() => {
    let active = true
    getListings({ limit })
      .then((d) => active && setState({ loading: false, error: '', listings: d.listings }))
      .catch((e) => active && setState({ loading: false, error: errorMessage(e), listings: [] }))
    return () => {
      active = false
    }
  }, [limit])

  return state
}

function ProductCard({ listing }) {
  return (
    <article className="flex h-full flex-col justify-between gap-4 rounded-lg border border-outline-variant bg-surface-container-lowest p-4 shadow-sm">
      <div className="flex flex-col gap-3">
        <ListingImage src={listing.image} alt={listing.title} className="h-48 w-full rounded-md" />
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-headline text-title-md text-on-surface">{listing.title}</h3>
          <span className="shrink-0 font-headline text-title-md tabular-nums text-primary">
            {formatPrice(listing.price)}
          </span>
        </div>
        <p className="font-body text-body-md text-on-surface-variant">
          By {listing.seller?.name} · {listing.location || listing.seller?.location}
        </p>
      </div>
      <Link
        to={`/listings/${listing._id}`}
        className="inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 font-label text-label-lg text-on-primary transition-colors duration-state-change hover:opacity-95"
      >
        <Icon>visibility</Icon>
        View Product
      </Link>
    </article>
  )
}

function ProductGrid({ state, className }) {
  if (state.loading)
    return <p className="font-body text-body-md text-on-surface-variant">Loading products...</p>
  if (state.error)
    return (
      <p role="alert" className="font-body text-body-md text-error">
        {state.error}
      </p>
    )
  if (state.listings.length === 0)
    return (
      <p className="font-body text-body-md text-on-surface-variant">
        No products yet. Check back soon!
      </p>
    )
  return (
    <div className={className}>
      {state.listings.map((listing) => (
        <ProductCard key={listing._id} listing={listing} />
      ))}
    </div>
  )
}

function DesktopProducts() {
  const state = useListings(4)
  return (
    <section id="shop" className="bg-surface-container-low py-16">
      <div className="mx-auto flex max-w-[1200px] flex-col gap-10 px-6">
        <div className="flex flex-col gap-2">
          <h2 className="font-headline text-headline-lg text-on-surface">
            Trending handmade products
          </h2>
          <p className="font-body text-body-lg text-on-surface-variant">
            Freshly made by women in your community.
          </p>
        </div>
        <ProductGrid
          state={state}
          className="grid grid-cols-1 items-stretch gap-6 sm:grid-cols-2 lg:grid-cols-4"
        />
      </div>
    </section>
  )
}

function MobileProducts() {
  const state = useListings(2)
  return (
    <section id="shop-mobile" className="flex flex-col gap-4 px-4">
      <h2 className="font-headline text-headline-lg-mobile text-on-surface">
        Trending handmade
      </h2>
      <ProductGrid state={state} className="grid grid-cols-1 gap-4" />
    </section>
  )
}

/* ---------- Layout pieces ---------- */

function Brand({ compact = false }) {
  return (
    <a
      href="#home"
      className={`flex items-center ${compact ? 'gap-2' : 'gap-3'} shrink-0 rounded-lg`}
    >
      <span
        className={`flex items-center justify-center rounded-lg bg-primary text-on-primary ${
          compact ? 'h-10 w-10' : 'h-11 w-11 shadow-sm'
        }`}
      >
        <Icon className={compact ? '' : 'text-headline-sm'}>storefront</Icon>
      </span>
      <span className="font-headline text-title-lg text-primary">HerMarket</span>
    </a>
  )
}

function LanguageButton({ mobile = false }) {
  const [language, setLanguage] = useState('EN / नेपाली')

  return (
    <button
      type="button"
      onClick={() =>
        setLanguage((current) =>
          current.includes('EN') ? 'नेपाली / EN' : 'EN / नेपाली',
        )
      }
      aria-label="Switch language between English and Nepali"
      className={`flex shrink-0 cursor-pointer items-center gap-1 rounded-full border border-outline-variant bg-surface-container-lowest text-on-surface ${
        mobile
          ? 'min-h-[44px] px-3 font-label text-label-md'
          : 'min-h-[48px] px-3 font-label text-label-md transition-colors duration-state-change hover:bg-surface-container-low'
      }`}
    >
      <Icon className="text-title-md">translate</Icon>
      <span>{mobile ? 'EN' : language}</span>
    </button>
  )
}

function DesktopHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-outline-variant bg-surface-container-lowest shadow-sm">
      <div className="mx-auto flex max-w-[1200px] items-center justify-between gap-4 px-6 py-3">
        <Brand />
        <nav aria-label="Main navigation" className="hidden shrink-0 items-center gap-1 lg:flex">
          <a
            href="#home"
            className="flex min-h-[48px] shrink-0 items-center rounded-lg bg-primary-container px-3 font-label text-label-lg text-on-primary-container"
          >
            Home
          </a>
          <a href="#shop" className="desktop-nav-link">
            Shop
          </a>
         
        
          <AppLink href="/events" className="desktop-nav-link">
            Events
          </AppLink>
         
        </nav>
        <div className="hidden max-w-[210px] flex-1 xl:flex">
          <label className="relative flex w-full items-center">
            <span className="sr-only">Search handmade products</span>
            <Icon className="absolute left-3 text-on-surface-variant">search</Icon>
            <input
              type="search"
              placeholder="Search goods..."
              className="min-h-[48px] w-full rounded-lg border border-outline-variant bg-surface-container-low py-2 pl-10 pr-4 font-body text-body-md text-on-surface outline-none placeholder:text-outline focus:border-primary focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/20"
            />
          </label>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <LanguageButton />
          <AccountMenu />
          <AppLink
            href="/register"
            className="hidden min-h-[48px] shrink-0 cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-lg bg-cta px-4 py-3 font-label text-label-lg text-on-cta shadow-sm transition-colors duration-state-change hover:opacity-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary xl:inline-flex"
          >
            <Icon>add_business</Icon>
            Sell Your Products
          </AppLink>
        </div>
      </div>
    </header>
  )
}

function MobileHeader() {
  const [menuOpen, setMenuOpen] = useState(false)
  const { status } = useAuth()

  const closeMenu = () => setMenuOpen(false)

  return (
    <header className="sticky top-0 z-40 border-b border-outline-variant bg-surface-container-lowest shadow-sm">
      <div className="flex items-center justify-between gap-3 px-4 py-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
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
        aria-label="Mobile menu"
        className={`${
          menuOpen ? 'flex' : 'hidden'
        } flex-col gap-2 border-t border-outline-variant bg-surface-container-lowest px-4 py-4`}
      >
        {[
          ['home', 'Home', 'home'],
          ['shop', 'Shop Handmade', 'shopping_bag'],
          ['/events', 'Events', 'event'],
        ].map(([href, label, icon], index) => (
          <AppLink
            key={href}
            href={href.startsWith('/') ? href : `#${href}`}
            onClick={closeMenu}
            className={`flex min-h-[48px] items-center gap-3 rounded-lg px-4 font-label text-label-lg ${
              index === 0
                ? 'bg-primary-container text-on-primary-container'
                : 'text-on-surface hover:bg-surface-container-low'
            }`}
          >
            <Icon>{icon}</Icon>
            {label}
          </AppLink>
        ))}
        {status !== 'authenticated' && status !== 'checking' && (
          <AppLink
            href="/login"
            onClick={closeMenu}
            className="flex min-h-[48px] items-center gap-3 rounded-lg px-4 font-label text-label-lg text-on-surface hover:bg-surface-container-low"
          >
            <Icon>login</Icon>
            Login / Sign up
          </AppLink>
        )}
        <AppLink
          href="/register"
          onClick={closeMenu}
          className="mt-2 flex min-h-[48px] items-center justify-center gap-2 rounded-lg bg-cta px-4 font-label text-label-lg text-on-cta"
        >
          <Icon>add_business</Icon>
          Sell Your Products
        </AppLink>
      </nav>
    </header>
  )
}

function DesktopHero() {
  return (
    <section id="home" className="bg-surface py-16">
      <div className="mx-auto grid max-w-[1200px] grid-cols-1 items-center gap-12 px-6 lg:grid-cols-12">
        <div className="flex flex-col gap-6 lg:col-span-6">
          <h1 className="text-balance font-display text-display-lg text-on-surface">
            Turn your skill into your business
          </h1>
          <p className="max-w-prose text-pretty font-body text-body-lg text-on-surface-variant">
            A warm, simple marketplace where women makers sell handmade crafts and
            food, keep track of their earnings, connect with other makers.
          </p>
          <div className="flex flex-wrap items-center gap-4 pt-2">
            <AppLink href="/register" className="hero-action bg-cta text-on-cta">
              <Icon>storefront</Icon>
              I want to Sell
            </AppLink>
            <a href="#shop" className="hero-action bg-primary text-on-primary">
              <Icon>shopping_bag</Icon>
              I want to Buy
            </a>
          </div>
          <p className="flex items-center gap-2 font-body text-body-md text-on-surface-variant">
            <Icon className="text-success" filled>
              verified
            </Icon>
            <span>Free to join. No confusing forms—start with just one photo.</span>
          </p>
        </div>
        <div className="lg:col-span-6">
          <div className="overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest p-3 shadow-lg">
            <img
              src="/images/hero_makers.jpg"
              alt="Woman artisan smiling in her sunlit workshop surrounded by handmade crochet bags, knitted scarves, and pottery"
              className="h-[420px] w-full rounded-lg object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  )
}

function SearchField({ placeholder, className }) {
  return (
    <label className="relative flex w-full items-center">
      <span className="sr-only">Search handmade products</span>
      <Icon className="absolute left-4 text-on-surface-variant">search</Icon>
      <input
        type="search"
        placeholder={placeholder}
        className={`w-full font-body text-on-surface outline-none placeholder:text-outline ${className}`}
      />
    </label>
  )
}

function MobileHero() {
  return (
    <>
      <section className="flex flex-col gap-6 px-4 pt-6">
        <div className="overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest p-2 shadow-md">
          <img
            src="/images/hero_makers.jpg"
            alt="Woman artisan smiling in her sunlit workshop with handmade crochet bags and pottery"
            className="h-56 w-full rounded-lg object-cover"
          />
        </div>
        <div className="flex flex-col gap-4">
          <h1 className="text-balance font-display text-display-lg-mobile text-on-surface">
            Turn your skill into your business
          </h1>
          <p className="text-pretty font-body text-body-md text-on-surface-variant">
            Sell your handmade crafts and food, track your money easily, and grow
            with supportive women.
          </p>
          <div className="flex flex-col gap-3 pt-1">
            <AppLink href="/register" className="mobile-hero-action bg-cta text-on-cta">
              <Icon>storefront</Icon>
              I want to Sell
            </AppLink>
            <a href="#shop-mobile" className="mobile-hero-action bg-primary text-on-primary">
              <Icon>shopping_bag</Icon>
              I want to Buy
            </a>
          </div>
        </div>
      </section>
      <section className="px-4">
        <SearchField
          placeholder="Search crochet, pottery, honey..."
          className="min-h-[48px] rounded-lg border border-outline-variant bg-surface-container-lowest py-3 pl-12 pr-4 text-body-md focus:border-primary focus-visible:ring-2 focus-visible:ring-primary"
        />
      </section>
    </>
  )
}

function SectionHeading({ title, description, mobile = false }) {
  return (
    <div className="flex max-w-2xl flex-col gap-2">
      <h2
        className={`font-headline text-on-surface ${
          mobile ? 'text-headline-lg-mobile' : 'text-headline-lg'
        }`}
      >
        {title}
      </h2>
      {description && (
        <p className="text-pretty font-body text-body-lg text-on-surface-variant">
          {description}
        </p>
      )}
    </div>
  )
}

function StepsSection() {
  return (
    <section className="bg-surface-container-low py-16">
      <div className="mx-auto flex max-w-[1200px] flex-col gap-10 px-6">
        <SectionHeading
          title="How HerMarket works"
          description="Three easy steps to share your craft and earn from home."
        />
        <div className="grid grid-cols-1 items-stretch gap-6 md:grid-cols-3">
          {steps.map((step) => (
            <article
              key={step.title}
              className="flex h-full flex-col gap-4 rounded-lg border border-outline-variant bg-surface-container-lowest p-6 shadow-sm"
            >
              <span
                className={`flex h-12 w-12 items-center justify-center rounded-full bg-${step.color}-container text-on-${step.color}-container`}
              >
                <Icon className="text-headline-sm">{step.icon}</Icon>
              </span>
              <h3 className="font-headline text-title-lg text-on-surface">
                {step.title}
              </h3>
              <p className="text-pretty font-body text-body-md text-on-surface-variant">
                {step.description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

function ModulesSection({ mobile = false }) {
  return (
    <section
      id={mobile ? undefined : 'modules'}
      className={mobile ? 'flex flex-col gap-4 px-4' : 'bg-surface py-16'}
    >
      {!mobile && (
        <div className="mx-auto flex max-w-[1200px] flex-col gap-10 px-6">
          <SectionHeading
            title="Everything you need in one place"
            description="Each part of HerMarket has its own color so you always know where you are."
          />
          <div className="grid grid-cols-1 items-stretch gap-6 md:grid-cols-2 lg:grid-cols-4">
            {modules.map((item) => (
              <a
                key={item.title}
                href={item.href}
                className={`flex h-full flex-col justify-between gap-4 rounded-lg bg-${item.color}-container p-6 text-on-${item.color}-container shadow-sm transition-shadow duration-state-change hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-${item.color}`}
              >
                <div className="flex flex-col gap-4">
                  <span
                    className={`flex h-12 w-12 items-center justify-center rounded-lg bg-${item.color} text-on-${item.color}`}
                  >
                    <Icon className="text-headline-sm">{item.icon}</Icon>
                  </span>
                  <h3 className="font-headline text-title-lg">{item.title}</h3>
                  <p className="text-pretty font-body text-body-md">{item.description}</p>
                </div>
                <span className="inline-flex items-center gap-1 font-label text-label-lg">
                  {item.action}
                  <Icon>arrow_forward</Icon>
                </span>
              </a>
            ))}
          </div>
        </div>
      )}
      {mobile && (
        <>
          <h2 className="font-headline text-headline-lg-mobile text-on-surface">
            Explore HerMarket
          </h2>
          <div className="grid grid-cols-1 gap-4">
            {modules.map((item) => (
              <a
                key={item.title}
                href={item.href}
                className={`flex items-center gap-4 rounded-lg bg-${item.color}-container p-5 text-on-${item.color}-container shadow-sm`}
              >
                <span
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-${item.color} text-on-${item.color}`}
                >
                  <Icon>{item.icon}</Icon>
                </span>
                <span className="flex flex-col">
                  <span className="font-headline text-title-lg">{item.title}</span>
                  <span className="font-body text-body-md">{item.mobileDescription}</span>
                </span>
              </a>
            ))}
          </div>
        </>
      )}
    </section>
  )
}

function MakerCard({ maker }) {
  return (
    <article className="flex h-full flex-col justify-between gap-4 rounded-lg border border-outline-variant bg-surface-container-lowest p-6 shadow-sm">
      <div className="flex items-center gap-4">
        <img
          src={maker.image}
          alt={maker.alt}
          className={`h-20 w-20 shrink-0 rounded-full border-2 border-${maker.border} object-cover`}
        />
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1">
            <h3 className="font-headline text-title-lg text-on-surface">{maker.name}</h3>
            <Icon className="text-title-md text-success" filled>
              verified
            </Icon>
          </div>
          <p className="font-body text-body-md text-on-surface-variant">
            {maker.category} · {maker.location}
          </p>
          <p className="flex items-center gap-1 font-label text-label-md tabular-nums text-on-surface">
            <Icon className="text-title-md text-cta" filled>
              star
            </Icon>
            {maker.rating}
          </p>
        </div>
      </div>
      <p className="text-pretty font-body text-body-md text-on-surface-variant">
        {maker.quote}
      </p>
      <a
        href={maker.href}
        className="flex min-h-[48px] items-center justify-center gap-2 rounded-lg bg-primary-container px-4 font-label text-label-lg text-on-primary-container transition-opacity duration-state-change hover:opacity-90"
      >
        Visit Shop
        <Icon>arrow_forward</Icon>
      </a>
    </article>
  )
}

function MakersSection() {
  return (
    <section className="bg-surface py-16">
      <div className="mx-auto flex max-w-[1200px] flex-col gap-10 px-6">
        <SectionHeading
          title="Meet our featured makers"
          description="Verified women-led shops crafting with care across local neighborhoods."
        />
        <div className="grid grid-cols-1 items-stretch gap-6 md:grid-cols-3">
          {makers.map((maker) => (
            <MakerCard key={maker.name} maker={maker} />
          ))}
        </div>
      </div>
    </section>
  )
}

function StoryCard({ story }) {
  return (
    <article className="flex h-full flex-col items-start gap-6 rounded-lg border border-outline-variant bg-surface-container-lowest p-6 shadow-sm sm:flex-row">
      <img
        src={story.image}
        alt={story.alt}
        className="h-28 w-28 shrink-0 rounded-lg object-cover"
      />
      <div className="flex flex-col gap-3">
        <p className="text-pretty font-body text-body-lg text-on-surface">{story.quote}</p>
        <div>
          <p className="font-headline text-title-md text-primary">{story.name}</p>
          <p className="font-body text-body-md text-on-surface-variant">{story.detail}</p>
        </div>
      </div>
    </article>
  )
}

function StoriesSection() {
  return (
    <section className="bg-surface-container-low py-16">
      <div className="mx-auto flex max-w-[1200px] flex-col gap-10 px-6">
        <SectionHeading
          title="Stories from women like you"
          description="Real makers turning everyday skills into steady income."
        />
        <div className="grid grid-cols-1 items-stretch gap-6 md:grid-cols-2">
          {stories.map((story) => (
            <StoryCard key={story.name} story={story} />
          ))}
        </div>
      </div>
    </section>
  )
}

function EventBanner({ mobile = false }) {
  return (
    <section
      id={mobile ? undefined : 'connect'}
      className={mobile ? 'px-4' : 'bg-surface py-12'}
    >
      <div className={mobile ? '' : 'mx-auto max-w-[1200px] px-6'}>
        <div
          className={`border border-outline-variant bg-secondary-container text-on-secondary-container ${
            mobile
              ? 'flex flex-col gap-3 rounded-lg p-5'
              : 'flex flex-col items-start justify-between gap-6 rounded-xl p-8 md:flex-row md:items-center md:p-10'
          }`}
        >
          <div className={`flex ${mobile ? 'items-center gap-3' : 'max-w-2xl items-start gap-4'}`}>
            <span
              className={`flex shrink-0 items-center justify-center rounded-lg bg-secondary text-on-secondary ${
                mobile ? 'h-10 w-10' : 'h-14 w-14'
              }`}
            >
              <Icon className={mobile ? '' : 'text-headline-md'}>event</Icon>
            </span>
            <div className="flex flex-col gap-2">
              <h2
                className={`font-headline ${mobile ? 'text-title-lg' : 'text-headline-md'}`}
              >
                {mobile
                  ? 'Local Craft Fair · Dec 6'
                  : "Weekend Women's Craft Fair — Dec 6"}
              </h2>
              {!mobile && (
                <p className="text-pretty font-body text-body-lg">
                  Meet 40+ local makers at Patan Community Courtyard (10:00 AM –
                  5:00 PM). Free stall tables for first-time sellers!
                </p>
              )}
            </div>
          </div>
          {mobile ? (
            <>
              <p className="font-body text-body-md">
                Patan Community Courtyard · Free tables for first-time sellers!
              </p>
              <AppLink
                href="/events"
                className="flex min-h-[48px] w-full items-center justify-center rounded-lg border border-outline-variant bg-surface-container-lowest font-label text-label-lg text-on-surface"
              >
                See Local Events
              </AppLink>
            </>
          ) : (
            <AppLink
              href="/events"
              className="inline-flex min-h-[52px] shrink-0 cursor-pointer items-center justify-center gap-2 rounded-lg border border-outline-variant bg-surface-container-lowest px-6 py-3 font-label text-label-lg text-on-surface shadow-sm transition-colors duration-state-change hover:bg-surface-container-low"
            >
              <Icon>calendar_month</Icon>
              See Local Events
            </AppLink>
          )}
        </div>
      </div>
    </section>
  )
}

function OrganizationBanner() {
  return (
    <section className="bg-primary py-16 text-on-primary">
      <div className="mx-auto flex max-w-[1200px] flex-col items-start justify-between gap-8 px-6 md:flex-row md:items-center">
        <div className="flex max-w-2xl flex-col gap-3">
          <h2 className="text-balance font-headline text-headline-lg">
            Are you an NGO, cooperative, or community group?
          </h2>
          <p className="text-pretty font-body text-body-lg text-primary-container">
            Partner with HerMarket to onboard women makers in your district,
            host local training workshops, and sponsor zero-fee starter shops.
          </p>
        </div>
        <AppLink
          href="/register"
          className="inline-flex min-h-[56px] shrink-0 cursor-pointer items-center justify-center gap-2 rounded-lg bg-cta px-8 py-3 font-label text-label-lg text-on-cta shadow-md transition-colors duration-state-change hover:opacity-95"
        >
          <Icon>handshake</Icon>
          Partner With Us
        </AppLink>
      </div>
    </section>
  )
}

function DesktopFooter() {
  return (
    <footer className="border-t border-outline-variant bg-surface-container-lowest py-12">
      <div className="mx-auto grid max-w-[1200px] grid-cols-1 gap-8 px-6 md:grid-cols-4">
        <div className="flex flex-col gap-3">
          <Brand compact />
          <p className="text-pretty font-body text-body-md text-on-surface-variant">
            Helping women turn everyday handmade skills into confident local
            businesses.
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <h3 className="font-headline text-title-md text-on-surface">Marketplace</h3>
          <a href="#about" className="footer-link">
            About HerMarket
          </a>
          <a href="#shop" className="footer-link">
            Browse Products
          </a>
          <AppLink href="/events" className="footer-link">
            Community Events
          </AppLink>
          <AppLink href="/register" className="footer-link">
            For Organizations
          </AppLink>
        </div>
        <div className="flex flex-col gap-2">
          <h3 className="font-headline text-title-md text-on-surface">Support</h3>
          <a href="#help" className="footer-link">
            Help Center
          </a>
         
        
        </div>
        <div className="flex flex-col gap-3">
          <h3 className="font-headline text-title-md text-on-surface">
            Language & Community
          </h3>
          <LanguageButton />
          <div className="flex items-center gap-3 pt-1">
            {[
              ['#facebook', 'HerMarket on Facebook', 'group'],
              ['#instagram', 'HerMarket on Instagram', 'photo_camera'],
              ['#youtube', 'HerMarket Video Guides', 'play_circle'],
            ].map(([href, label, icon]) => (
              <AppLink
                key={href}
                href={href}
                aria-label={label}
                className="flex h-11 w-11 items-center justify-center rounded-full bg-surface-container-low text-on-surface hover:bg-primary-container"
              >
                <Icon>{icon}</Icon>
              </AppLink>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}

function HelpButton({ mobile = false }) {
  return (
    <div
      className={`fixed right-4 z-40 ${
        mobile ? 'bottom-20 lg:hidden' : 'bottom-6 hidden lg:block lg:right-6 lg:z-50'
      }`}
    >
      <button
        type="button"
        className={`inline-flex cursor-pointer items-center gap-2 rounded-full bg-primary text-on-primary shadow-lg ${
          mobile
            ? 'min-h-[48px] px-4 py-2 font-label text-label-md'
            : 'min-h-[52px] px-5 py-3 font-label text-label-lg transition-transform duration-state-change hover:scale-105 hover:opacity-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta'
        }`}
      >
        <Icon>support_agent</Icon>
        Need help?
      </button>
    </div>
  )
}

function MobileBottomNavigation() {
  const links = [
    ['#home', 'Home', 'home', true],
    ['#shop-mobile', 'Shop', 'shopping_bag'],
    ['/register', 'Sell', 'add_circle', true],
    ['/events', 'Events', 'event'],
    
  ]

  return (
    <nav
      aria-label="Bottom navigation"
      className="fixed inset-x-0 bottom-0 z-50 grid grid-cols-5 gap-1 border-t border-outline-variant bg-surface-container-lowest px-2 py-2 lg:hidden"
    >
      {links.map(([href, label, icon, highlighted], index) => (
        <AppLink
          key={href}
          href={href}
          className={`flex min-h-[48px] flex-col items-center justify-center rounded-lg ${
            index === 0
              ? 'bg-primary-container text-on-primary-container'
              : highlighted
                ? 'bg-cta text-on-cta'
                : 'text-on-surface-variant'
          }`}
        >
          <Icon filled={index === 0}>{icon}</Icon>
          <span className="font-label text-label-md">{label}</span>
        </AppLink>
      ))}
    </nav>
  )
}

/* ---------- Pages ---------- */

function DesktopPage() {
  return (
    <div className="hidden min-h-screen flex-col pb-24 lg:flex">
      <DesktopHeader />
      <main className="flex-1">
        <DesktopHero />
        <StepsSection />
        <ModulesSection />
        <DesktopProducts />
        <MakersSection />
        <StoriesSection />
        <EventBanner />
        <OrganizationBanner />
      </main>
      <DesktopFooter />
      <HelpButton />
    </div>
  )
}

function MobilePage() {
  return (
    <div className="flex min-h-screen flex-col pb-24 lg:hidden">
      <MobileHeader />
      <main className="flex flex-1 flex-col gap-10">
        <MobileHero />
        <ModulesSection mobile />
        <MobileProducts />
        <EventBanner mobile />
      </main>
      <HelpButton mobile />
      <MobileBottomNavigation />
    </div>
  )
}

function LandingPage() {
  return (
    <>
      <DesktopPage />
      <MobilePage />
    </>
  )
}

export default LandingPage