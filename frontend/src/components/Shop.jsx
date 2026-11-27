import { useState } from 'react'
import { inputClass } from '../constants.js'
import { ProductCard } from './ProductCatalog.jsx'
import useListings from './useListings.js'
import { Icon } from './SiteNavigation.jsx'

export default function Shop() {
  const state = useListings()
  const [search, setSearch] = useState('')
  const query = search.trim().toLocaleLowerCase()
  const listings = state.listings.filter((listing) => {
    const name = listing.title?.toLocaleLowerCase() || ''
    const category =
      typeof listing.category === 'string' ? listing.category.toLocaleLowerCase() : ''
    return name.includes(query) || category.includes(query)
  })

  return (
    <main className="min-h-screen bg-surface-container-low px-4 pb-28 pt-12 sm:px-6 lg:pb-16 lg:pt-16">
        <div className="mx-auto flex max-w-[1200px] flex-col gap-8">
          <div className="flex flex-col gap-2">
            <h1 className="font-headline text-headline-lg-mobile text-on-surface lg:text-headline-lg">
              Trending handmade products
            </h1>
            <p className="font-body text-body-lg text-on-surface-variant">
              Freshly made by women in your community.
            </p>
          </div>
          <label className="relative flex w-full max-w-xl items-center">
            <span className="sr-only">Search products by name or category</span>
            <Icon className="absolute left-3 text-on-surface-variant">search</Icon>
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search products..."
              className={`${inputClass} pl-10`}
            />
          </label>
          {state.loading ? (
            <p className="font-body text-body-md text-on-surface-variant">Loading products...</p>
          ) : state.error ? (
            <p role="alert" className="font-body text-body-md text-error">
              {state.error}
            </p>
          ) : state.listings.length === 0 ? (
            <p className="font-body text-body-md text-on-surface-variant">
              No products yet. Check back soon!
            </p>
          ) : listings.length === 0 ? (
            <p className="font-body text-body-md text-on-surface-variant">
              No products match your search
            </p>
          ) : (
            <div className="grid grid-cols-1 items-stretch gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {listings.map((listing) => (
                <ProductCard key={listing._id} listing={listing} />
              ))}
            </div>
          )}
        </div>
    </main>
  )
}
