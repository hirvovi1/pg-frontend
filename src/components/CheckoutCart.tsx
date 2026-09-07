import { useState } from 'react'
import type { ChangeEvent } from 'react'
import { paytrailService } from '../services/paytrailservice'
import type { Account } from '../services/paytrailservice'

const CART_ITEMS = [
  { name: 'Mechanical Keyboard', quantity: 1, priceInCents: 8500 },
  { name: 'Ergonomic Mouse', quantity: 1, priceInCents: 3500 },
]

const MERCHANT_WALLET_ID = '7d8f2b5c-9a44-4f1e-b6d2-31c7e8a95024'

interface CheckoutCartProps {
  accounts: Account[]
}

const formatAmount = (amountInCents: number) => `${(amountInCents / 100).toFixed(2)} €`

function CheckoutCart({ accounts }: CheckoutCartProps) {
  const [selectedBuyerId, setSelectedBuyerId] = useState('')
  const [promoCode, setPromoCode] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const totalInCents = CART_ITEMS.reduce((total, item) => total + item.priceInCents * item.quantity, 0)

  const handleBuyerChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setSelectedBuyerId(event.target.value)
    setError('')
  }

  const handlePromoCodeChange = (event: ChangeEvent<HTMLInputElement>) => {
    setPromoCode(event.target.value)
    setError('')
  }

  const handleCheckout = async () => {
    if (!selectedBuyerId) {
      setError('Select an active buyer profile before continuing.')
      return
    }

    if (promoCode && promoCode !== 'WHALE' && promoCode !== 'MINNOW') {
      setError('Enter a valid promo code: WHALE or MINNOW.')
      return
    }

    setError('')
    setIsLoading(true)

    try {
      const response = await paytrailService.executeTransfer({
        idempotencyKey: crypto.randomUUID(),
        accountIdFrom: selectedBuyerId,
        accountIdTo: MERCHANT_WALLET_ID,
        amountInCents: totalInCents,
      })

      if (!response.paymentUrl) {
        throw new Error('Paytrail did not provide a checkout URL.')
      }

      window.location.assign(response.paymentUrl)
    } catch (requestError) {
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
        <span className="checkout-cart-count">{CART_ITEMS.length} items</span>
      </div>

      <div className="checkout-cart-items">
        {CART_ITEMS.map((item) => (
          <div className="checkout-cart-item" key={item.name}>
            <div>
              <strong>{item.name}</strong>
              <span>{item.quantity}x</span>
            </div>
            <span>{formatAmount(item.priceInCents * item.quantity)}</span>
          </div>
        ))}
      </div>

      <div className="checkout-cart-total">
        <span>Total</span>
        <strong>{formatAmount(totalInCents)}</strong>
      </div>

      <label className="checkout-cart-label" htmlFor="checkout-buyer">
        Select Active Buyer Profile:
      </label>
      <select id="checkout-buyer" value={selectedBuyerId} onChange={handleBuyerChange} disabled={isLoading}>
        <option value="">Choose an account</option>
        {accounts.map((account) => (
          <option key={account.id} value={account.id}>
            {account.ownerName} - {formatAmount(account.balanceInCents)}
          </option>
        ))}
      </select>

      <label className="checkout-cart-label" htmlFor="checkout-promo-code">
        Promo code:
      </label>
      <input
        className="checkout-cart-input"
        id="checkout-promo-code"
        type="text"
        value={promoCode}
        onChange={handlePromoCodeChange}
        placeholder="Optional"
        pattern="(WHALE|MINNOW)?"
        title="Promo code must be WHALE, MINNOW, or empty"
        maxLength={6}
        disabled={isLoading}
      />

      {error && <p className="message error" role="alert">{error}</p>}

      <button className="checkout-cart-button" type="button" onClick={handleCheckout} disabled={isLoading}>
        {isLoading ? 'Connecting to Paytrail...' : 'Proceed to Paytrail Checkout'}
      </button>
    </section>
  )
}

export default CheckoutCart