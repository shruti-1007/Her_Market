import { imageUrl } from '../api/client.js'

export default function ListingImage({ src, alt, className = '' }) {
  if (!src) {
    return (
      <div className={`flex items-center justify-center bg-surface-container-low text-on-surface-variant ${className}`}>
        <span className="material-symbols-outlined" aria-hidden="true">image</span>
      </div>
    )
  }
  return <img src={imageUrl(src)} alt={alt} className={`object-cover ${className}`} />
}