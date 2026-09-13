export interface UsdConversionResponse {
  originalAmountInCents: number
  currency: 'USD'
  exchangeRate: number
  convertedAmount: string
}

const MICRONAUT_API_BASE = 'http://localhost:8090/api/usd'

export const currencyService = {
  /**
   * Muuntaa eurosentit Yhdysvaltain dollareiksi Micronaut-mikropalvelun kautta.
   */
  async convertToUsd(amountInCents: number): Promise<UsdConversionResponse> {
    const response = await fetch(`${MICRONAUT_API_BASE}/convert?amountInCents=${amountInCents}`)
    
    if (!response.ok) {
      throw new Error(`Currency service failed with status ${response.status}`)
    }
    
    return response.json()
  }
}
