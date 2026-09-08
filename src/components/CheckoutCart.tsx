import { useState } from 'react'
import type { ChangeEvent } from 'react'
import { PENDING_TRANSACTION_STORAGE_KEY, paytrailService } from '../services/paytrailservice'
import type { Account } from '../services/paytrailservice'

const CART_ITEMS = [
  { name: 'Parsley', quantity: 1, priceInCents: 230 },
  { name: 'Onions', quantity: 2, priceInCents: 249 },
  { name: 'Tomatoes', quantity: 4, priceInCents: 329 },
  { name: 'Turnips', quantity: 3, priceInCents: 179 },
  { name: 'Broccoli', quantity: 1, priceInCents: 299 },
  { name: 'Carrots', quantity: 6, priceInCents: 149 },
  { name: 'Bell Peppers', quantity: 3, priceInCents: 399 },
  { name: 'Spinach', quantity: 1, priceInCents: 279 },
]

interface CheckoutCartProps {
  accounts: Account[]
}

const formatAmount = (amountInCents: number) => `${(amountInCents / 100).toFixed(2)} €`

function CheckoutCart({ accounts }: CheckoutCartProps) {
  const [selectedBuyerId, setSelectedBuyerId] = useState('')
  const [promoCode] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const totalInCents = CART_ITEMS.reduce((total, item) => total + item.priceInCents * item.quantity, 0)

  const handleBuyerChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setSelectedBuyerId(event.target.value)
    setError('')
    console.info('[CheckoutCart] Buyer selected', { accountId: event.target.value })
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
    console.info('[CheckoutCart] Starting checkout', {
      buyerAccountId: selectedBuyerId,
      amountInCents: totalInCents,
    })

    try {
      const merchantAccount = await paytrailService.ensureMerchantAccount()
      console.info('[CheckoutCart] Merchant account ready', { accountId: merchantAccount.id })
      const idempotencyKey = crypto.randomUUID()
      const response = await paytrailService.executeTransfer({
        idempotencyKey,
        accountIdFrom: selectedBuyerId,
        accountIdTo: merchantAccount.id,
        amountInCents: totalInCents,
      })
      console.info('[CheckoutCart] Transfer accepted', {
        transactionId: response.transactionId,
        idempotencyKey,
      })

      if (!response.paymentUrl) {
        throw new Error('Paytrail did not provide a checkout URL.')
      }

      localStorage.setItem(PENDING_TRANSACTION_STORAGE_KEY, response.transactionId)
      console.info('[CheckoutCart] Stored pending transaction', { transactionId: response.transactionId })
      console.info('[CheckoutCart] Redirecting to payment URL', { paymentUrl: response.paymentUrl })
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

      {error && <p className="message error" role="alert">{error}</p>}

      <button className="checkout-cart-button" type="button" onClick={handleCheckout} disabled={isLoading}>
        {isLoading ? 'Connecting to Paytrail...' : 'Proceed to Paytrail Checkout'}
      </button>
    </section>
  )
}

export default CheckoutCart