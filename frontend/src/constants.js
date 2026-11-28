import i18n from './i18n.js'

export const CATEGORIES = [
  ['food', 'Food'], ['crafts', 'Crafts'], ['clothing', 'Clothing'],
  ['jewelry', 'Jewelry'], ['home', 'Home'], ['beauty', 'Beauty'],
  ['education', 'Education'], ['repair', 'Repair'], ['other', 'Other'],
]

export const formatNumber = (n, options) =>
  Number(n).toLocaleString(i18n.language === 'ne' ? 'ne-NP' : 'en-IN', options)

export const formatPrice = (n, options) =>
  `${i18n.language === 'ne' ? 'रु' : 'Rs'} ${formatNumber(n, options)}`

export const inputClass =
  'min-h-[48px] w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-4 py-3 font-body text-body-md text-on-surface outline-none focus:border-primary focus:ring-2 focus:ring-primary/20'

  export const EVENT_CATEGORIES = [
  ['workshop', 'Workshop'], ['training', 'Training'], ['fair', 'Fair / Market'],
  ['funding', 'Funding & Loans'], ['awareness', 'Awareness'], ['health', 'Health'], ['other', 'Other'],
]

export const ORG_TYPES = [
  ['ward_office', 'Ward office'], ['municipality', 'Municipality'],
  ['ngo', 'NGO'], ['cooperative', 'Cooperative'], ['other', 'Other'],
]

export const labelOf = (list, value) => list.find(([v]) => v === value)?.[1] || value

const dateFmt = { day: 'numeric', month: 'short', year: 'numeric' }
const timeFmt = { hour: 'numeric', minute: '2-digit' }

export function formatEventWhen(start, end) {
  const locale = i18n.language === 'ne' ? 'ne-NP' : 'en-GB'
  const s = new Date(start)
  const first = `${s.toLocaleDateString(locale, dateFmt)}, ${s.toLocaleTimeString(locale, timeFmt)}`
  if (!end) return first
  const e = new Date(end)
  return s.toDateString() === e.toDateString()
    ? `${first} – ${e.toLocaleTimeString(locale, timeFmt)}`
    : `${first} → ${e.toLocaleDateString(locale, dateFmt)}, ${e.toLocaleTimeString(locale, timeFmt)}`
}

// ISO string -> value for <input type="datetime-local">
export function toInputValue(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  const p = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`
}