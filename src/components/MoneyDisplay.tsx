import { useEffect, useState } from 'react'
import { currencyService } from '../services/currencyService'
import { useCurrency } from '../context/CurrencyContext'

interface MoneyDisplayProps {
  amountInCents: number | null
}

export function MoneyDisplay({ amountInCents }: MoneyDisplayProps) {
  const { currency } = useCurrency()
  const [displayValue, setDisplayValue] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(false)

  useEffect(() => {
    if (amountInCents === null) {
      setDisplayValue('Amount not provided')
      return
    }

    // 1. Local calculation for EUR (No microservice hit needed!)
    if (currency === 'EUR') {
      setDisplayValue(`${(amountInCents / 100).toFixed(2)} EUR`)
      return
    }

    // 2. Fetch from Micronaut Microservice for USD conversion
    let isMounted = true
    setLoading(true)

    currencyService.convertToUsd(amountInCents)
      .then((data) => {
        if (isMounted) {
          setDisplayValue(`${data.convertedAmount} USD`)
        }
      })
      .catch((err) => {
        console.error('[MoneyDisplay] Conversion failed', err)
        if (isMounted) {
          setDisplayValue('Conversion Error')
        }
      })
      .finally(() => {
        if (isMounted) setLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [amountInCents, currency])

  if (loading) {
    return <span className="money-loading">Converting...</span>
  }

  return <span className="money-amount">{displayValue}</span>
}
