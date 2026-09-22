import { useState } from 'react'
import type { ChangeEvent } from 'react'
import { PENDING_TRANSACTION_STORAGE_KEY, paytrailService } from '../services/paytrailservice'
import type { Account } from '../services/paytrailservice'
import { cartService, type CartItem } from '../services/cartService'
import { useCurrency } from '../context/CurrencyContext'
import { MoneyDisplay } from './MoneyDisplay'
import "./CheckoutCart.css"

interface CheckoutCartProps {
  accounts: Account[]
}

function CheckoutCart({ accounts }: CheckoutCartProps) {
  const { currency } = useCurrency()
  const [selectedBuyerId, setSelectedBuyerId] = useState('')
  const [promoCode] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [cartItems, setCartItems] = useState<CartItem[]>(() => cartService.getCartItems())
  const totalInCents = cartService.getTotalInCents()

  const handleQuantityChange = (productId: number, quantity: number) => {
    cartService.updateQuantity(productId, quantity)
    setCartItems(cartService.getCartItems())
  }

  const handleRemoveItem = (productId: number) => {
    cartService.removeFromCart(productId)
    setCartItems(cartService.getCartItems())
  }

  const handleBuyerChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setSelectedBuyerId(event.target.value)
    setError('')
    console.info('[CheckoutCart] Buyer selected', { accountId: event.target.value })
  }

  const formatOptionLabel = (amountInCents: number) => {
    if (currency === 'USD') {
      return `$${((amountInCents / 100) * 1.08).toFixed(2)} USD (est.)`
    }
    return `${(amountInCents / 100).toFixed(2)} €`
  }

  const handleCheckout = async () => {
    if (!selectedBuyerId) {
      console.warn('[CheckoutCart] Checkout blocked: no buyer selected')
      setError('Select an active buyer profile before continuing.')
      return
    }

    if (promoCode && promoCode !== 'WHALE' && promoCode !== 'MINNOW') {
      console.warn('[CheckoutCart] Checkout blocked: invalid promo code')
      setError('Enter a valid promo code: WHALE or MINNOW.')
      return
    }

    setError('')
    setIsLoading(true)

    try {
      const merchantAccount = await paytrailService.ensureMerchantAccount()
      const idempotencyKey = crypto.randomUUID()
      const response = await paytrailService.executeTransfer({
        idempotencyKey,
        accountIdFrom: selectedBuyerId,
        accountIdTo: merchantAccount.id,
        amountInCents: totalInCents,
      })

      if (!response.paymentUrl) {
        throw new Error('Paytrail did not provide a checkout URL.')
      }

      localStorage.setItem(PENDING_TRANSACTION_STORAGE_KEY, response.transactionId)
      window.location.assign(response.paymentUrl)
    } catch (requestError) {
      console.error('[CheckoutCart] Checkout failed', requestError)
      setError(requestError instanceof Error ? requestError.message : 'Could not start Paytrail checkout.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <section className="checkout-cart" aria-labelledby="checkout-cart-title">
      <div className="checkout-cart-heading">
        <div>
          <p className="eyebrow">Paytrail checkout</p>
          <h2 id="checkout-cart-title">Shopping Cart</h2>
        </div>
        <span className="checkout-cart-count">{cartItems.length} items</span>
      </div>

      <div className="checkout-cart-items">
        {cartItems.length === 0 ? (
          <p className="empty-state">Your cart is empty.</p>
        ) : (
          cartItems.map((item) => (
            <div className="checkout-cart-item" key={item.productId}>
              {/* Top row: Name on left, price + delete button on right */}
              <div className="cart-item-top-row">
                <span className="cart-item-name">{item.productName}</span>

                <div className="cart-item-price-group">
      <span className="cart-item-price-display">
        <MoneyDisplay amountInCents={item.priceInCents * item.quantity} />
      </span>

                  {/* Stylish delete button */}
                  <button
                    type="button"
                    disabled={isLoading}
                    onClick={() => handleRemoveItem(item.productId)}
                    className="remove-icon-btn"
                    aria-label="Remove item"
                  >
                    <svg xmlns="http://w3.org" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6"></polyline>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                      <line x1="10" y1="11" x2="10" y2="17"></line>
                      <line x1="14" y1="11" x2="14" y2="17"></line>
                    </svg>
                  </button>
                </div>
              </div>

              {/* Bottom row: Quantity controls on the right */}
              <div className="cart-item-bottom-row">
                <div className="quantity-controls">
                  <button type="button" className="micro-btn" disabled={item.quantity <= 1 || isLoading} onClick={() => handleQuantityChange(item.productId, item.quantity - 1)}>-</button>
                  <span className="quantity-display">{item.quantity}</span>
                  <button type="button" className="micro-btn" disabled={isLoading} onClick={() => handleQuantityChange(item.productId, item.quantity + 1)}>+</button>
                </div>
              </div>
            </div>

          ))
        )}
      </div>

      <div className="checkout-cart-total">
        <span>Total</span>
        <strong>
          <MoneyDisplay amountInCents={totalInCents} />
        </strong>
      </div>

      <label className="checkout-cart-label" htmlFor="checkout-buyer">
        Select Active Buyer Profile:
      </label>
      {/* Using the new modern-select class */}
      <select
        id="checkout-buyer"
        className="modern-select"
        value={selectedBuyerId}
        onChange={handleBuyerChange}
        disabled={isLoading}
      >
        <option value="">Choose an account</option>
        {accounts.map((account) => (
          <option key={account.id} value={account.id}>
            {account.ownerName} - {formatOptionLabel(account.balanceInCents)}
          </option>
        ))}
      </select>

      {error && <p className="message error" role="alert">{error}</p>}

      <button className="checkout-cart-button" type="button" onClick={handleCheckout} disabled={isLoading}>
        {isLoading ? 'Connecting to Paytrail...' : 'Proceed to Paytrail Checkout'}
      </button>
    </section>
  )
}

export default CheckoutCart
