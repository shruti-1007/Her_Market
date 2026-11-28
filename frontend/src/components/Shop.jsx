import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { getListings } from '../api/listings.js'
import { errorMessage } from '../api/errors.js'
import { inputClass } from '../constants.js'
import { ProductCard } from './ProductCatalog.jsx'
import { Icon } from './SiteNavigation.jsx'

export default function Shop() {
  const { t } = useTranslation()
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const key = JSON.stringify([search.trim(), page])
  const [result, setResult] = useState({
    key: '',
    listings: [],
    pages: 1,
    total: 0,
    error: '',
  })
  const loading = result.key !== key

  useEffect(() => {
    let active = true
    const timer = setTimeout(() => {
      getListings({ search: search.trim() || undefined, page, limit: 12 })
        .then((data) => {
          if (active) {
            setResult({
              key,
              listings: data.listings,
              pages: data.pages,
              total: data.total,
              error: '',
            })
          }
        })
        .catch((error) => {
          if (active) {
            setResult({ key, listings: [], pages: 1, total: 0, error: errorMessage(error) })
          }
        })
    }, 300)

    return () => {
      active = false
      clearTimeout(timer)
    }
  }, [key, page, search])

  return (
    <main className="min-h-screen bg-surface-container-low px-4 pb-28 pt-12 sm:px-6 lg:pb-16 lg:pt-16">
      <div className="mx-auto flex max-w-[1200px] flex-col gap-8">
        <div className="flex flex-col gap-2">
          <h1 className="font-headline text-headline-lg-mobile text-on-surface lg:text-headline-lg">
            {t('Trending handmade products')}
          </h1>
          <p className="font-body text-body-lg text-on-surface-variant">
            {t('Freshly made by women in your community.')}
          </p>
        </div>
        <label className="relative flex w-full max-w-xl items-center">
          <span className="sr-only">{t('Search products by name, category, description, or location')}</span>
          <Icon className="absolute left-3 text-on-surface-variant">search</Icon>
          <input
            type="search"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value)
              setPage(1)
            }}
            placeholder={t('Search products...')}
            className={`${inputClass} pl-10`}
          />
        </label>
        {loading ? (
          <p className="font-body text-body-md text-on-surface-variant">{t('Loading products...')}</p>
        ) : result.error ? (
          <p role="alert" className="font-body text-body-md text-error">
            {result.error}
          </p>
        ) : result.total === 0 ? (
          <p className="font-body text-body-md text-on-surface-variant">
            {t(search.trim() ? 'No products match your search.' : 'No products yet. Check back soon!')}
          </p>
        ) : (
          <>
            <p className="font-body text-body-md text-on-surface-variant">
              {t(result.total === 1 ? '{{count}} product' : '{{count}} products', { count: result.total })}
            </p>
            <div className="grid grid-cols-1 items-stretch gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {result.listings.map((listing) => (
                <ProductCard key={listing._id} listing={listing} />
              ))}
            </div>
            {result.pages > 1 && (
              <div className="flex items-center justify-center gap-4">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => setPage((current) => current - 1)}
                  className="min-h-[44px] rounded-lg border border-outline-variant px-5 font-label text-label-md text-primary disabled:opacity-40"
                >
                  {t('Previous')}
                </button>
                <span className="font-body text-body-md text-on-surface-variant">
                  {t('Page {{page}} of {{pages}}', { page, pages: result.pages })}
                </span>
                <button
                  type="button"
                  disabled={page >= result.pages}
                  onClick={() => setPage((current) => current + 1)}
                  className="min-h-[44px] rounded-lg border border-outline-variant px-5 font-label text-label-md text-primary disabled:opacity-40"
                >
                  {t('Next')}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  )
}
