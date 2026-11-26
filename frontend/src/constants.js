export const CATEGORIES = [
  ['food', 'Food'], ['crafts', 'Crafts'], ['clothing', 'Clothing'],
  ['jewelry', 'Jewelry'], ['home', 'Home'], ['beauty', 'Beauty'],
  ['education', 'Education'], ['repair', 'Repair'], ['other', 'Other'],
]

export const formatPrice = (n) => `Rs ${Number(n).toLocaleString('en-IN')}`

export const inputClass =
  'min-h-[48px] w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-4 py-3 font-body text-body-md text-on-surface outline-none focus:border-primary focus:ring-2 focus:ring-primary/20'