import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

import { Brand, Icon, LanguageButton } from './SiteNavigation.jsx'
import ListingImage from './ListingImage.jsx'

import { getListings } from '../api/listings.js'
import { getEvents } from '../api/events.js'
import { imageUrl } from '../api/client.js'
import { errorMessage } from '../api/errors.js'
import { EVENT_CATEGORIES, formatEventWhen, formatPrice, labelOf } from '../constants.js'
import i18n from '../i18n.js'

const t = (key, options) => i18n.t(key, options)

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
    description: 'Arrange pickup or delivery, see your monthly earnings clearly.',
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

const POPUP_KEY = 'hermarket_popup_dismissed'

function AppLink({ href, ...props }) {
  return href.startsWith('/') ? <Link to={href} {...props} /> : <a href={href} {...props} />
}

/* ---------- Data from the backend ---------- */

function useListings(limit) {
  const [state, setState] = useState({ loading: true, error: '', listings: [] })

  useEffect(() => {
    let active = true
    getListings({ limit })
      .then((d) => active && setState({ loading: false, error: '', listings: d.listings }))
      .catch((e) =>
        active && setState({ loading: false, error: errorMessage(e), listings: [] }),
      )
    return () => {
      active = false
    }
  }, [limit])

  return state
}

function useUpcomingEvent() {
  const [state, setState] = useState({ event: null, error: '' })

  useEffect(() => {
    let active = true
    getEvents({ limit: 1 })
      .then((result) => {
        if (active) setState({ event: result.events?.[0] || null, error: '' })
      })
      .catch((err) => {
        if (active) setState({ event: null, error: errorMessage(err) })
      })
    return () => {
      active = false
    }
  }, [])

  return state
}

/* ---------- Products ---------- */

function ProductCard({ listing }) {
  return (
    <article className="flex h-full flex-col justify-between gap-4 rounded-lg border border-outline-variant bg-surface-container-lowest p-4 shadow-sm">
      <div className="flex flex-col gap-3">
        <ListingImage src={listing.image} alt={listing.title} className="h-48 w-full rounded-md" />
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-headline text-title-md text-on-surface">{listing.title}</h3>
          <span className="shrink-0 font-headline text-title-md tabular-nums text-primary">
            {formatPrice(listing.price)}
            {listing.packSize && (
              <span className="block text-right font-body text-sm text-on-surface-variant">
                {t('per {{packSize}}', { packSize: listing.packSize })}
              </span>
            )}
          </span>
        </div>
        <p className="font-body text-body-md text-on-surface-variant">
          {t('By {{name}}', { name: listing.seller?.name })} · {listing.location || listing.seller?.location}
        </p>
      </div>
      <Link
        to={`/listings/${listing._id}`}
        className="inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 font-label text-label-lg text-on-primary transition-colors duration-state-change hover:opacity-95"
      >
        <Icon>visibility</Icon>
        {t('View Product')}
      </Link>
    </article>
  )
}

function ProductGrid({ state, className }) {
  if (state.loading)
    return <p className="font-body text-body-md text-on-surface-variant">{t('Loading products...')}</p>
  if (state.error)
    return (
      <p role="alert" className="font-body text-body-md text-error">
        {state.error}
      </p>
    )
  if (state.listings.length === 0)
    return (
      <p className="font-body text-body-md text-on-surface-variant">
        {t('No products yet. Check back soon!')}
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
            {t('Trending handmade products')}
          </h2>
          <p className="font-body text-body-lg text-on-surface-variant">
            {t('Freshly made by women in your community.')}
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
        {t('Trending handmade')}
      </h2>
      <ProductGrid state={state} className="grid grid-cols-1 gap-4" />
    </section>
  )
}

/* ---------- Hero ---------- */

function DesktopHero() {
  return (
    <section id="home" className="bg-surface py-16">
      <div className="mx-auto grid max-w-[1200px] grid-cols-1 items-center gap-12 px-6 lg:grid-cols-12">
        <div className="flex flex-col gap-6 lg:col-span-6">
          <h1 className="text-balance font-display text-display-lg text-on-surface">
            {t('Turn your skill into your business')}
          </h1>
          <p className="max-w-prose text-pretty font-body text-body-lg text-on-surface-variant">
            {t('A warm, simple marketplace where women makers sell handmade crafts and food, keep track of their earnings, connect with other makers.')}
          </p>
          <div className="flex flex-wrap items-center gap-4 pt-2">
            <AppLink href="/register" className="hero-action bg-cta text-on-cta">
              <Icon>storefront</Icon>
              {t('Sell')}
            </AppLink>
            <a href="#shop" className="hero-action bg-primary text-on-primary">
              <Icon>shopping_bag</Icon>
              {t(' Buy')}
            </a>
          </div>
          <p className="flex items-center gap-2 font-body text-body-md text-on-surface-variant">
            <Icon className="text-success" filled>
              verified
            </Icon>
            <span>{t('Free to join. No confusing forms—start with just one photo.')}</span>
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
      <span className="sr-only">{t('Search handmade products')}</span>
      <Icon className="absolute left-4 text-on-surface-variant">search</Icon>
      <input
        type="search"
        placeholder={t(placeholder)}
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
            {t('Turn your skill into your business')}
          </h1>
          <p className="text-pretty font-body text-body-md text-on-surface-variant">
            {t('Sell your handmade crafts and food, track your money easily, and grow with supportive women.')}
          </p>
          <div className="flex flex-col gap-3 pt-1">
            <AppLink href="/register" className="mobile-hero-action bg-cta text-on-cta">
              <Icon>storefront</Icon>
              {t('I want to Sell')}
            </AppLink>
            <a href="#shop-mobile" className="mobile-hero-action bg-primary text-on-primary">
              <Icon>shopping_bag</Icon>
              {t('I want to Buy')}
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

/* ---------- Content sections ---------- */

function SectionHeading({ title, description, mobile = false }) {
  return (
    <div className="flex max-w-2xl flex-col gap-2">
      <h2
        className={`font-headline text-on-surface ${
          mobile ? 'text-headline-lg-mobile' : 'text-headline-lg'
        }`}
      >
        {t(title)}
      </h2>
      {description && (
        <p className="text-pretty font-body text-body-lg text-on-surface-variant">
          {t(description)}
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
          title={t('How HerMarket works')}
          description={t('Three easy steps to share your craft and earn from home.')}
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
              <h3 className="font-headline text-title-lg text-on-surface">{t(step.title)}</h3>
              <p className="text-pretty font-body text-body-md text-on-surface-variant">
                {t(step.description)}
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
            title={t('Everything you need in one place')}
            description={t('Each part of HerMarket has its own color so you always know where you are.')}
          />
          <div className="grid grid-cols-1 items-stretch gap-6 md:grid-cols-2 lg:grid-cols-3">
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
                  <h3 className="font-headline text-title-lg">{t(item.title)}</h3>
                  <p className="text-pretty font-body text-body-md">{t(item.description)}</p>
                </div>
                <span className="inline-flex items-center gap-1 font-label text-label-lg">
                  {t(item.action)}
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
            {t('Explore HerMarket')}
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
                  <span className="font-headline text-title-lg">{t(item.title)}</span>
                  <span className="font-body text-body-md">{t(item.mobileDescription)}</span>
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
          alt={t(maker.alt)}
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
            {t(maker.category)} · {maker.location}
          </p>
          <p className="flex items-center gap-1 font-label text-label-md tabular-nums text-on-surface">
            <Icon className="text-title-md text-cta" filled>
              star
            </Icon>
            {maker.rating}
          </p>
        </div>
      </div>
      <p className="text-pretty font-body text-body-md text-on-surface-variant">{t(maker.quote)}</p>
      <a
        href={maker.href}
        className="flex min-h-[48px] items-center justify-center gap-2 rounded-lg bg-primary-container px-4 font-label text-label-lg text-on-primary-container transition-opacity duration-state-change hover:opacity-90"
      >
        {t('Visit Shop')}
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
          title={t('Meet our featured makers')}
          description={t('Verified women-led shops crafting with care across local neighborhoods.')}
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
        alt={t(story.alt)}
        className="h-28 w-28 shrink-0 rounded-lg object-cover"
      />
      <div className="flex flex-col gap-3">
        <p className="text-pretty font-body text-body-lg text-on-surface">{t(story.quote)}</p>
        <div>
          <p className="font-headline text-title-md text-primary">{story.name}</p>
          <p className="font-body text-body-md text-on-surface-variant">{t(story.detail)}</p>
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
          title={t('Stories from women like you')}
          description={t('Real makers turning everyday skills into steady income.')}
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

/* ---------- Events ---------- */

function EventBanner({ event, error, mobile = false }) {
  if (!event) {
    return (
      <section
        id={mobile ? undefined : 'connect'}
        className={mobile ? 'px-4' : 'bg-surface py-12'}
      >
        <div
          className={`rounded-lg border border-outline-variant bg-surface-container-lowest p-5 font-body text-body-md text-on-surface-variant ${
            mobile ? '' : 'mx-auto max-w-[1200px]'
          }`}
        >
          {error
            ? t('Upcoming events are unavailable right now.')
            : t('No upcoming events have been posted yet.')}{' '}
          <AppLink href="/events" className="font-label text-primary underline">
            {t('Browse all events')}
          </AppLink>
        </div>
      </section>
    )
  }

  const summary = event.description?.trim().slice(0, 240)

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
              <h2 className={`font-headline ${mobile ? 'text-title-lg' : 'text-headline-md'}`}>
                {event.title}
              </h2>
              <p className="font-label text-label-md">
                {formatEventWhen(event.startDate, event.endDate)}
                {' · '}
                {t(labelOf(EVENT_CATEGORIES, event.category))}
              </p>
              {!mobile && (
                <p className="text-pretty font-body text-body-lg">
                  {summary ||
                    (event.isOnline
                      ? t('Join this upcoming online event.')
                      : t('Join us at {{location}}.', { location: event.location }))}
                </p>
              )}
            </div>
          </div>
          {mobile ? (
            <>
              <p className="font-body text-body-md">
                {event.isOnline ? t('Online event') : event.location}
              </p>
              <AppLink
                href={`/events/${event._id}`}
                className="flex min-h-[48px] w-full items-center justify-center rounded-lg border border-outline-variant bg-surface-container-lowest font-label text-label-lg text-on-surface"
              >
                {t('View event')}
              </AppLink>
            </>
          ) : (
            <AppLink
              href={`/events/${event._id}`}
              className="inline-flex min-h-[52px] shrink-0 cursor-pointer items-center justify-center gap-2 rounded-lg border border-outline-variant bg-surface-container-lowest px-6 py-3 font-label text-label-lg text-on-surface shadow-sm transition-colors duration-state-change hover:bg-surface-container-low"
            >
              <Icon>calendar_month</Icon>
              {t('View event')}
            </AppLink>
          )}
        </div>
      </div>
    </section>
  )
}

function EventPopup({ event, onClose }) {
  useEffect(() => {
    const closeOnEscape = (keyboardEvent) => {
      if (keyboardEvent.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-black/50 p-4"
      onMouseDown={(mouseEvent) => {
        if (mouseEvent.target === mouseEvent.currentTarget) onClose()
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="home-event-title"
        aria-describedby="home-event-description"
        className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-outline-variant bg-surface-container-lowest p-5 shadow-2xl sm:p-7"
      >
        <button
          type="button"
          autoFocus
          onClick={onClose}
          aria-label={t('Close event announcement')}
          className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full border border-outline-variant text-on-surface hover:bg-surface-container-low"
        >
          <Icon>close</Icon>
        </button>
        <div className="flex items-center gap-3 pr-12">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-secondary text-on-secondary">
            <Icon className="text-headline-sm">event</Icon>
          </span>
          <span className="rounded-full bg-secondary-container px-3 py-1 font-label text-label-md text-on-secondary-container">
            {t('Upcoming event')}
          </span>
        </div>
        {event.images?.[0] && (
          <div className="mt-5 flex h-48 w-full items-center justify-center overflow-hidden rounded-lg bg-surface-container-low sm:h-56">
            <img
              src={imageUrl(event.images[0])}
              alt={t('Poster for {{title}}', { title: event.title })}
              className="max-h-full max-w-full object-contain"
            />
          </div>
        )}
        <h2 id="home-event-title" className="mt-5 font-headline text-headline-md text-on-surface">
          {event.title}
        </h2>
        <p className="mt-2 font-label text-label-md text-primary">
          {formatEventWhen(event.startDate, event.endDate)}
          {' · '}
          {t(labelOf(EVENT_CATEGORIES, event.category))}
        </p>
        <p className="mt-2 font-body text-body-md text-on-surface-variant">
          {event.isOnline ? t('Online event') : event.location}
          {event.organizer?.name ? ` · ${t('Hosted by')} ${event.organizer.name}` : ''}
        </p>
        <p id="home-event-description" className="mt-4 font-body text-body-md text-on-surface">
          {event.description || t('Open the event page for details and registration information.')}
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Link
            to={`/events/${event._id}`}
            onClick={onClose}
            className="flex min-h-12 flex-1 items-center justify-center rounded-lg bg-primary px-5 font-label text-label-md text-on-primary"
          >
            {t('View event details')}
          </Link>
          <button
            type="button"
            onClick={onClose}
            className="min-h-12 rounded-lg border border-outline-variant px-5 font-label text-label-md text-primary"
          >
            {t('Maybe later')}
          </button>
        </div>
      </section>
    </div>
  )
}

/* ---------- Footer & misc ---------- */

function OrganizationBanner() {
  return (
    <section className="bg-primary py-16 text-on-primary">
      <div className="mx-auto flex max-w-[1200px] flex-col items-start justify-between gap-8 px-6 md:flex-row md:items-center">
        <div className="flex max-w-2xl flex-col gap-3">
          <h2 className="text-balance font-headline text-headline-lg">
            {t('Are you an NGO, cooperative, or community group?')}
          </h2>
          <p className="text-pretty font-body text-body-lg text-primary-container">
            {t('Partner with HerMarket to onboard women makers in your district, host local training workshops, and sponsor zero-fee starter shops.')}
          </p>
        </div>
        <AppLink
          href="/register"
          className="inline-flex min-h-[56px] shrink-0 cursor-pointer items-center justify-center gap-2 rounded-lg bg-cta px-8 py-3 font-label text-label-lg text-on-cta shadow-md transition-colors duration-state-change hover:opacity-95"
        >
          <Icon>handshake</Icon>
          {t('Partner With Us')}
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
            {t('Helping women turn everyday handmade skills into confident local businesses.')}
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <h3 className="font-headline text-title-md text-on-surface">Marketplace</h3>
          <a href="#about" className="footer-link">
            {t('About HerMarket')}
          </a>
          <a href="#shop" className="footer-link">
            {t('Browse Products')}
          </a>
          <AppLink href="/events" className="footer-link">
            {t('Community Events')}
          </AppLink>
          <AppLink href="/register" className="footer-link">
            {t('For Organizations')}
          </AppLink>
        </div>
        <div className="flex flex-col gap-2">
          <h3 className="font-headline text-title-md text-on-surface">{t('Support')}</h3>
          <a href="#help" className="footer-link">
            {t('Help Center')}
          </a>
        </div>
        <div className="flex flex-col gap-3">
          <h3 className="font-headline text-title-md text-on-surface">{t('Language & Community')}</h3>
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
                aria-label={t(label)}
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
        {t('Need help?')}
      </button>
    </div>
  )
}

/* ---------- Pages ---------- */

function DesktopPage({ event, eventError }) {
  return (
    <div className="hidden min-h-screen flex-col pb-24 lg:flex">
      <main className="flex-1">
        <DesktopHero />
        <StepsSection />
        <ModulesSection />
        <DesktopProducts />
        <MakersSection />
        <StoriesSection />
        <EventBanner event={event} error={eventError} />
        <OrganizationBanner />
      </main>
      <DesktopFooter />
      <HelpButton />
    </div>
  )
}

function MobilePage({ event, eventError }) {
  return (
    <div className="flex min-h-screen flex-col pb-24 lg:hidden">
      <main className="flex flex-1 flex-col gap-10">
        <MobileHero />
        <ModulesSection mobile />
        <MobileProducts />
        <EventBanner event={event} error={eventError} mobile />
      </main>
      <HelpButton mobile />
    </div>
  )
}

function LandingPage() {
  useTranslation()
  const { event, error } = useUpcomingEvent()
  const [dismissedId, setDismissedId] = useState(() =>
    window.sessionStorage.getItem(POPUP_KEY),
  )
  const showPopup = Boolean(event && dismissedId !== event._id)

  function closePopup() {
    window.sessionStorage.setItem(POPUP_KEY, event._id)
    setDismissedId(event._id)
  }

  return (
    <>
      <DesktopPage event={event} eventError={error} />
      <MobilePage event={event} eventError={error} />
      {showPopup && <EventPopup event={event} onClose={closePopup} />}
    </>
  )
}

export default LandingPage