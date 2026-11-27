import { Link } from 'react-router-dom'
import { formatPrice } from '../constants.js'
import { useCart } from '../context/useCart.js'
import ListingImage from './ListingImage.jsx'

export default function CartPage() {
  const { items, removeFromCart, updateQuantity, clearCart, cartTotal } = useCart()

  return (
    <main className="min-h-screen bg-surface-container-low px-4 pb-28 pt-12 sm:px-6 lg:pb-16 lg:pt-16">
        <div className="mx-auto flex max-w-5xl flex-col gap-8">
          <h1 className="font-headline text-headline-lg-mobile text-on-surface lg:text-headline-lg">
            Your cart
          </h1>

          {items.length === 0 ? (
            <section className="flex flex-col items-start gap-5 rounded-xl border border-outline-variant bg-surface-container-lowest p-6 shadow-sm">
              <p className="font-body text-body-lg text-on-surface-variant">
                Your cart is empty
              </p>
              <Link
                to="/shop"
                className="inline-flex min-h-[48px] items-center justify-center rounded-lg bg-primary px-6 font-label text-label-lg text-on-primary"
              >
                Continue shopping
              </Link>
            </section>
          ) : (
            <>
              <div className="flex flex-col gap-4">
                {items.map((item) => (
                  <article
                    key={item.id}
                    className="grid gap-4 rounded-xl border border-outline-variant bg-surface-container-lowest p-4 shadow-sm sm:grid-cols-[7rem_1fr_auto] sm:items-center"
                  >
                    <ListingImage
                      src={item.image}
                      alt={item.name}
                      fit="contain"
                      className="aspect-square w-28 rounded-lg bg-surface-container-low p-2"
                    />
                    <div className="flex min-w-0 flex-col gap-1">
                      <h2 className="font-headline text-title-md text-on-surface">{item.name}</h2>
                      <p className="font-body text-body-md text-on-surface-variant">
                        By {item.seller || 'HerMarket seller'}
                      </p>
                      <p className="font-label text-label-md text-primary">{formatPrice(item.price)} each</p>
                      <div className="mt-2 flex items-center gap-3">
                        <button
                          type="button"
                          aria-label={`Decrease ${item.name} quantity`}
                          disabled={item.quantity <= 1}
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="flex h-10 w-10 items-center justify-center rounded-lg border border-outline-variant text-on-surface transition-colors hover:bg-surface-container-low disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <span className="material-symbols-outlined" aria-hidden="true">remove</span>
                        </button>
                        <span aria-live="polite" className="min-w-6 text-center font-label text-label-lg text-on-surface">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          aria-label={`Increase ${item.name} quantity`}
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="flex h-10 w-10 items-center justify-center rounded-lg border border-outline-variant text-on-surface transition-colors hover:bg-surface-container-low"
                        >
                          <span className="material-symbols-outlined" aria-hidden="true">add</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => removeFromCart(item.id)}
                          className="ml-2 min-h-10 rounded-lg px-3 font-label text-label-md text-error transition-colors hover:bg-red-50"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                    <p className="font-headline text-title-md tabular-nums text-primary sm:text-right">
                      {formatPrice(Number(item.price) * Number(item.quantity))}
                    </p>
                  </article>
                ))}
              </div>

              <section className="flex flex-col gap-4 rounded-xl border border-outline-variant bg-surface-container-lowest p-5 shadow-sm sm:ml-auto sm:w-full sm:max-w-sm">
                <div className="flex items-center justify-between gap-4">
                  <span className="font-label text-label-lg text-on-surface">Total</span>
                  <span className="font-headline text-title-lg tabular-nums text-primary">
                    {formatPrice(cartTotal)}
                  </span>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <button
                    type="button"
                    onClick={clearCart}
                    className="min-h-[48px] flex-1 rounded-lg border border-outline-variant px-4 font-label text-label-md text-on-surface transition-colors hover:bg-surface-container-low"
                  >
                    Clear cart
                  </button>
                  <button
                    type="button"
                    className="min-h-[48px] flex-1 rounded-lg bg-primary px-4 font-label text-label-md text-on-primary transition-colors hover:opacity-95"
                  >
                    Checkout
                  </button>
                </div>
              </section>
            </>
          )}
        </div>
    </main>
  )
}
