import { useCallback, useEffect, useMemo, useState } from 'react'
import { CartContext } from './cartContext.js'
const CART_STORAGE_KEY = 'hermarket-cart'

function readStoredCart() {
  if (typeof window === 'undefined') return []

  try {
    const stored = window.localStorage.getItem(CART_STORAGE_KEY)
    if (!stored) return []

    const parsed = JSON.parse(stored)
    if (!Array.isArray(parsed)) {
      throw new TypeError('Stored cart must be an array')
    }

    return parsed
      .filter(
        (item) =>
          item &&
          (typeof item.id === 'string' || typeof item.id === 'number') &&
          typeof item.name === 'string' &&
          Number.isFinite(Number(item.price)) &&
          Number.isInteger(Number(item.quantity)) &&
          Number(item.quantity) > 0,
      )
      .map((item) => ({
        ...item,
        id: String(item.id),
        price: Number(item.price),
        image: typeof item.image === 'string' ? item.image : '',
        seller: typeof item.seller === 'string' ? item.seller : '',
        quantity: Number(item.quantity),
      }))
  } catch (error) {
    console.error('Could not restore cart from local storage', error)
    return []
  }
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(readStoredCart)

  useEffect(() => {
    try {
      window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items))
    } catch (error) {
      console.error('Could not save cart to local storage', error)
    }
  }, [items])

  const addToCart = useCallback((product, quantity = 1) => {
    const rawId = product?._id ?? product?.id
    const name = product?.title ?? product?.name
    const price = Number(product?.price)
    const amount = Number(quantity)

    if (
      rawId === undefined ||
      rawId === null ||
      String(rawId).length === 0 ||
      typeof name !== 'string' ||
      !name ||
      !Number.isFinite(price) ||
      !Number.isSafeInteger(amount) ||
      amount < 1
    ) {
      console.error('Cannot add invalid product or quantity to cart', { product, quantity })
      return
    }

    const id = String(rawId)
    const item = {
      id,
      name,
      price,
      image: typeof product.image === 'string' ? product.image : '',
      seller:
        typeof product.seller === 'string'
          ? product.seller
          : product.seller?.name || '',
      quantity: amount,
    }

    setItems((current) => {
      const existing = current.find((cartItem) => cartItem.id === id)
      if (!existing) return [...current, item]

      return current.map((cartItem) =>
        cartItem.id === id
          ? { ...cartItem, quantity: cartItem.quantity + amount }
          : cartItem,
      )
    })
  }, [])

  const removeFromCart = useCallback((id) => {
    setItems((current) => current.filter((item) => item.id !== String(id)))
  }, [])

  const updateQuantity = useCallback((id, quantity) => {
    const amount = Number(quantity)
    if (!Number.isSafeInteger(amount) || amount < 1) {
      console.error('Cart quantity must be a positive integer', { id, quantity })
      return
    }

    setItems((current) =>
      current.map((item) =>
        item.id === String(id) ? { ...item, quantity: amount } : item,
      ),
    )
  }, [])

  const clearCart = useCallback(() => setItems([]), [])

  const cartCount = items.reduce((total, item) => total + item.quantity, 0)
  const cartTotal = items.reduce((total, item) => total + item.price * item.quantity, 0)

  const value = useMemo(
    () => ({
      items,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      cartCount,
      cartTotal,
    }),
    [items, addToCart, removeFromCart, updateQuantity, clearCart, cartCount, cartTotal],
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}
