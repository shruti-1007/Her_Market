import { useEffect, useMemo, useState } from 'react'
import { errorMessage } from '../../api/errors.js'
import { getMySellerAnalytics } from '../../api/analytics.js'
import { formatPrice } from '../../constants.js'

function Metric({ label, value }) {
  return (
    <article className="rounded-2xl border border-outline-variant bg-surface-container-lowest p-5 shadow-sm sm:p-6">
      <p className="font-body text-body-md text-on-surface-variant">{label}</p>
      <p className="mt-2 font-headline text-headline-md text-primary">{value}</p>
    </article>
  )
}

function lastThirtyDays() {
  const today = new Date()
  today.setUTCHours(0, 0, 0, 0)
  return Array.from({ length: 30 }, (_, index) => {
    const date = new Date(today)
    date.setUTCDate(today.getUTCDate() - 29 + index)
    return date.toISOString().slice(0, 10)
  })
}

export default function SellerAnalytics() {
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    getMySellerAnalytics()
      .then((data) => active && setAnalytics(data.analytics))
      .catch((err) => active && setError(errorMessage(err)))
      .finally(() => active && setLoading(false))
    return () => { active = false }
  }, [])

  const trends = useMemo(() => {
    const byDate = new Map()
    for (const row of analytics?.trends || []) {
      const day = byDate.get(row.date) || { profile: 0, product: 0 }
      if (row.type === 'profile_view') day.profile = row.views
      if (row.type === 'product_view') day.product = row.views
      byDate.set(row.date, day)
    }
    return lastThirtyDays().map((date) => ({ date, ...(byDate.get(date) || { profile: 0, product: 0 }) }))
  }, [analytics])

  if (loading) return <p className="font-body text-body-md text-on-surface-variant">Loading analytics...</p>
  if (error) return <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 font-body text-body-md text-error">{error}</p>
  if (!analytics) return null

  const maxDailyViews = Math.max(
    1,
    ...trends.flatMap((day) => [day.profile, day.product]),
  )

  return (
    <section className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <Metric label="Profile visits" value={analytics.profileViews} />
        <Metric label="Unique profile visitors" value={analytics.uniqueProfileVisitors} />
        <Metric label="Product views" value={analytics.productViews} />
        <Metric label="Unique product visitors" value={analytics.uniqueProductVisitors} />
      </div>

      <section className="rounded-2xl border border-outline-variant bg-surface-container-lowest p-5 shadow-sm sm:p-6">
        <h2 className="font-headline text-title-lg text-on-surface">Inquiries</h2>
        <dl className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            ['Total', analytics.inquiries.total],
            ['Pending', analytics.inquiries.pending],
            ['Accepted', analytics.inquiries.accepted],
            ['Rejected', analytics.inquiries.rejected],
          ].map(([label, value]) => (
            <div key={label}>
              <dt className="font-body text-body-md text-on-surface-variant">{label}</dt>
              <dd className="mt-1 font-headline text-title-lg text-primary">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="rounded-2xl border border-outline-variant bg-surface-container-lowest p-5 shadow-sm sm:p-6">
        <h2 className="font-headline text-title-lg text-on-surface">View trends · last 30 days</h2>
        <div className="mt-4 flex gap-1 overflow-x-auto pb-2" role="img" aria-label="Daily profile and product views over the last 30 days">
          {trends.map((day) => (
            <div key={day.date} title={`${day.date}: ${day.profile} profile, ${day.product} product views`} className="flex min-w-8 flex-col items-center gap-1">
              <div className="flex h-24 w-full items-end gap-0.5">
                <span className="w-1/2 rounded-t bg-primary" style={{ height: `${Math.max(2, (day.profile / maxDailyViews) * 100)}%` }} />
                <span className="w-1/2 rounded-t bg-secondary" style={{ height: `${Math.max(2, (day.product / maxDailyViews) * 100)}%` }} />
              </div>
              <span className="font-body text-[10px] text-on-surface-variant">{day.date.slice(5)}</span>
            </div>
          ))}
        </div>
        <div className="mt-2 flex gap-5 font-body text-sm text-on-surface-variant">
          <span><span className="mr-2 inline-block h-3 w-3 rounded-sm bg-primary" />Profile views</span>
          <span><span className="mr-2 inline-block h-3 w-3 rounded-sm bg-secondary" />Product views</span>
        </div>
      </section>

      <section className="rounded-2xl border border-outline-variant bg-surface-container-lowest p-5 shadow-sm sm:p-6">
        <h2 className="font-headline text-title-lg text-on-surface">Most-viewed products</h2>
        {analytics.mostViewedProducts.length === 0 ? (
          <p className="mt-3 font-body text-body-md text-on-surface-variant">No product views recorded yet.</p>
        ) : (
          <ol className="mt-3 flex flex-col gap-3">
            {analytics.mostViewedProducts.map((item) => (
              <li key={item.listing._id} className="flex items-center justify-between gap-4 font-body text-body-md">
                <span className="truncate text-on-surface">{item.listing.title}</span>
                <span className="shrink-0 text-on-surface-variant">{item.views} views</span>
              </li>
            ))}
          </ol>
        )}
      </section>

      <section className="rounded-2xl border border-outline-variant bg-surface-container-lowest p-5 shadow-sm sm:p-6">
        <h2 className="font-headline text-title-lg text-on-surface">Product performance</h2>
        {analytics.productPerformance.length === 0 ? (
          <p className="mt-3 font-body text-body-md text-on-surface-variant">You have no listings yet.</p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[520px] text-left font-body text-body-md">
              <thead>
                <tr className="border-b border-outline-variant text-on-surface-variant">
                  <th className="pb-3 pr-4 font-label">Product</th>
                  <th className="pb-3 pr-4 font-label">Price</th>
                  <th className="pb-3 pr-4 font-label">Views</th>
                  <th className="pb-3 font-label">Unique visitors</th>
                </tr>
              </thead>
              <tbody>
                {analytics.productPerformance.map((item) => (
                  <tr key={item.listing._id} className="border-b border-outline-variant last:border-0">
                    <td className="py-3 pr-4 text-on-surface">{item.listing.title}</td>
                    <td className="py-3 pr-4 text-on-surface-variant">{formatPrice(item.listing.price)}</td>
                    <td className="py-3 pr-4 text-on-surface-variant">{item.views}</td>
                    <td className="py-3 text-on-surface-variant">{item.uniqueVisitors}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </section>
  )
}
