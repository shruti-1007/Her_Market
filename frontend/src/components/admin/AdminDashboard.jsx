import { useEffect, useState } from 'react'
import { getOrganizations, reviewOrganization } from '../../api/admin.js'
import { errorMessage } from '../../api/errors.js'
import { ORG_TYPES, labelOf } from '../../constants.js'
import DashboardShell from '../dashboard/DashboardShell.jsx'
import StatusBadge from '../dashboard/StatusBadge.jsx'

const TABS = [['pending', 'Pending'], ['verified', 'Verified'], ['rejected', 'Rejected'], ['', 'All']]

function OrgReviewCard({ org, onChanged }) {
  const [rejecting, setRejecting] = useState(false)
  const [reason, setReason] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function review(status) {
    setError('')
    setBusy(true)
    try {
      const data = await reviewOrganization(org._id, { status, reason })
      onChanged(data.organization)
      setRejecting(false)
      setReason('')
    } catch (e) {
      setError(errorMessage(e))
    } finally {
      setBusy(false)
    }
  }

  const u = org.user
  return (
    <article className="flex flex-col gap-4 rounded-lg border border-outline-variant bg-surface-container-lowest p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-headline text-title-md text-on-surface">{u.name}</h3>
        <StatusBadge value={org.verificationStatus} />
      </div>
      <dl className="grid gap-3 font-body text-body-md sm:grid-cols-2">
        <div><dt className="text-on-surface-variant">Type</dt><dd className="text-on-surface">{labelOf(ORG_TYPES, org.type)}</dd></div>
        <div><dt className="text-on-surface-variant">Email</dt><dd className="break-all text-on-surface">{u.email}</dd></div>
        <div><dt className="text-on-surface-variant">Location</dt><dd className="text-on-surface">{u.location}</dd></div>
        <div><dt className="text-on-surface-variant">Contact</dt><dd className="text-on-surface">{u.contact}</dd></div>
        {org.website && (
          <div><dt className="text-on-surface-variant">Website</dt>
            <dd><a href={org.website} target="_blank" rel="noopener noreferrer" className="break-all text-primary underline">{org.website}</a></dd></div>
        )}
        <div><dt className="text-on-surface-variant">Requested on</dt><dd className="text-on-surface">{new Date(u.createdAt).toLocaleDateString('en-GB')}</dd></div>
        <div className="sm:col-span-2"><dt className="text-on-surface-variant">About</dt><dd className="text-on-surface">{u.description}</dd></div>
        {org.rejectionReason && (
          <div className="sm:col-span-2"><dt className="text-on-surface-variant">Rejection reason</dt><dd className="text-error">{org.rejectionReason}</dd></div>
        )}
      </dl>

      {error && <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 font-body text-body-md text-error">{error}</p>}

      {rejecting ? (
        <div className="flex flex-col gap-3">
          <textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={3} placeholder="Reason for rejection (shown to the organization)"
                    className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-4 py-3 font-body text-body-md outline-none focus:border-primary" />
          <div className="flex gap-3">
            <button type="button" disabled={busy || !reason.trim()} onClick={() => review('rejected')}
                    className="min-h-[44px] rounded-lg bg-error px-5 font-label text-label-md text-white disabled:opacity-60">Confirm rejection</button>
            <button type="button" onClick={() => setRejecting(false)}
                    className="min-h-[44px] rounded-lg border border-outline-variant px-5 font-label text-label-md text-primary">Cancel</button>
          </div>
        </div>
      ) : (
        <div className="flex gap-3">
          {org.verificationStatus !== 'verified' && (
            <button type="button" disabled={busy} onClick={() => review('verified')}
                    className="min-h-[44px] rounded-lg bg-primary px-5 font-label text-label-md text-on-primary disabled:opacity-70">Verify</button>
          )}
          {org.verificationStatus !== 'rejected' && (
            <button type="button" disabled={busy} onClick={() => setRejecting(true)}
                    className="min-h-[44px] rounded-lg border border-outline-variant px-5 font-label text-label-md text-error">Reject</button>
          )}
        </div>
      )}
    </article>
  )
}

export default function AdminDashboard() {
  const [tab, setTab] = useState('pending')
  const [result, setResult] = useState({ tab: null, organizations: [], error: '' })

  useEffect(() => {
    let active = true
    getOrganizations(tab)
      .then((d) => active && setResult({ tab, organizations: d.organizations, error: '' }))
      .catch((e) => active && setResult({ tab, organizations: [], error: errorMessage(e) }))
    return () => { active = false }
  }, [tab])

  const loading = result.tab !== tab

  // After a review, drop the card from a filtered tab, or update it in "All"
  const handleChanged = (updated) =>
    setResult((r) => ({
      ...r,
      organizations: tab && updated.verificationStatus !== tab
        ? r.organizations.filter((o) => o._id !== updated._id)
        : r.organizations.map((o) => (o._id === updated._id ? updated : o)),
    }))

  return (
    <DashboardShell label="Admin">
      <h2 className="font-headline text-headline-lg-mobile text-on-surface">Organization requests</h2>
      <div className="mt-4 flex flex-wrap gap-3">
        {TABS.map(([value, label]) => (
          <button key={label} type="button" onClick={() => setTab(value)}
                  className={`min-h-[44px] rounded-lg px-4 font-label text-label-md ${tab === value ? 'bg-primary text-on-primary' : 'border border-outline-variant text-primary hover:bg-primary-container'}`}>
            {label}
          </button>
        ))}
      </div>

      <div className="mt-6 flex flex-col gap-4">
        {loading && <p className="font-body text-body-md text-on-surface-variant">Loading...</p>}
        {!loading && result.error && <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 font-body text-body-md text-error">{result.error}</p>}
        {!loading && !result.error && result.organizations.length === 0 && (
          <p className="font-body text-body-md text-on-surface-variant">No organizations in this list.</p>
        )}
        {!loading && result.organizations.map((o) => <OrgReviewCard key={o._id} org={o} onChanged={handleChanged} />)}
      </div>
    </DashboardShell>
  )
}