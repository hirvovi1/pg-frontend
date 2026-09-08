import { useEffect, useState } from 'react'
import {
  PENDING_TRANSACTION_STORAGE_KEY,
  paytrailService,
} from '../services/paytrailservice'
import type { TransactionStatusResponse } from '../services/paytrailservice'

interface MockPaymentPageProps {
  transactionId: string
  amountInCents: number | null
}

const formatAmount = (amountInCents: number | null) => (
  amountInCents === null ? 'Amount provided by the shop' : `${(amountInCents / 100).toFixed(2)} EUR`
)

function MockPaymentPage({ transactionId, amountInCents }: MockPaymentPageProps) {
  const [status, setStatus] = useState<TransactionStatusResponse | null>(null)
  const [statusError, setStatusError] = useState('')
  const storedTransactionId = localStorage.getItem(PENDING_TRANSACTION_STORAGE_KEY) ?? ''
  const transactionToPoll = transactionId || storedTransactionId

  useEffect(() => {
    if (!transactionToPoll) {
      return
    }

    let isMounted = true
    let pollTimeout: ReturnType<typeof setTimeout> | undefined

    const pollStatus = async () => {
      try {
        const currentStatus = await paytrailService.getTransactionStatus(transactionToPoll)
        if (!isMounted) return

        setStatus(currentStatus)
        setStatusError('')
        console.info('[MockPaymentPage] Transaction status received', {
          transactionId: transactionToPoll,
          status: currentStatus.status,
        })

        if (currentStatus.status === 'PENDING') {
          pollTimeout = setTimeout(() => void pollStatus(), 1000)
        } else if (currentStatus.status === 'SUCCESS' || currentStatus.status === 'FAILED') {
          localStorage.removeItem(PENDING_TRANSACTION_STORAGE_KEY)
        }
      } catch (requestError) {
        if (!isMounted) return

        console.error('[MockPaymentPage] Failed to poll transaction status', requestError)
        setStatusError(requestError instanceof Error ? requestError.message : 'Could not check payment status.')
        pollTimeout = setTimeout(() => void pollStatus(), 2000)
      }
    }

    void pollStatus()

    return () => {
      isMounted = false
      if (pollTimeout) clearTimeout(pollTimeout)
    }
  }, [transactionToPoll])

  const returnToShop = () => {
    window.location.assign('/')
  }

  const failureReason = status?.message ?? 'The payment could not be completed.'
  const statusLabel = status?.status === 'SUCCESS'
    ? 'Payment successful'
    : status?.status === 'FAILED'
      ? 'Payment failed'
      : 'Waiting for payment result'

  return (
    <main className="mock-payment-page">
      <section className="mock-payment-panel" aria-labelledby="mock-payment-title">
        <p className="eyebrow">Paytrail mock checkout</p>
        <h1 id="mock-payment-title">Complete your payment</h1>
        <p className="mock-payment-copy">
          This page simulates the external payment provider during development.
        </p>

        <dl className="mock-payment-details">
          <div>
            <dt>Amount</dt>
            <dd>{formatAmount(amountInCents)}</dd>
          </div>
          <div>
            <dt>Transaction</dt>
            <dd><code>{transactionToPoll || 'Not provided'}</code></dd>
          </div>
        </dl>

        <p className={`mock-payment-status mock-payment-status-${status?.status?.toLowerCase() ?? 'pending'}`} role="status">
          {statusLabel}
        </p>
        {status?.status === 'FAILED' && <p className="message error">{failureReason}</p>}
        {(statusError || !transactionToPoll) && (
          <p className="message error">{statusError || 'No transaction was provided for this payment.'}</p>
        )}

        <button className="mock-payment-button" type="button" onClick={returnToShop}>
          Return to shop
        </button>
      </section>
    </main>
  )
}

export default MockPaymentPage