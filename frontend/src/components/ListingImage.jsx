import { imageUrl } from '../api/client.js'

export default function ListingImage({ src, alt, className = '', fit = 'cover' }) {
  if (!src) {
    return (
      <div className={`flex items-center justify-center bg-surface-container-low text-on-surface-variant ${className}`}>
        <span className="material-symbols-outlined" aria-hidden="true">image</span>
      </div>
    )
  }
  const objectFit = fit === 'contain' ? 'object-contain' : 'object-cover'
  return <img src={imageUrl(src)} alt={alt} className={`${objectFit} ${className}`} />
}