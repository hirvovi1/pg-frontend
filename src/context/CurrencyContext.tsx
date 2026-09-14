import { createContext, useContext, useState, type ReactNode } from 'react'

export type CurrencyType = 'EUR' | 'USD'

interface CurrencyContextType {
  currency: CurrencyType
  setCurrency: (currency: CurrencyType) => void
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined)

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrency] = useState<CurrencyType>('EUR')

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency }}>
      {children}
    </CurrencyContext.Provider>
  )
}

// Clean custom hook to consume the context
export function useCurrency() {
  const context = useContext(CurrencyContext)
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider')
  }
  return context
}
