export default function VerifiedBadge({ className = '' }) {
  return (
    <span className={`inline-flex items-center gap-1 font-label text-label-md text-success ${className}`}>
      <span className="material-symbols-outlined text-title-md" style={{ fontVariationSettings: "'FILL' 1" }} aria-hidden="true">
        verified
      </span>
      Verified
    </span>
  )
}