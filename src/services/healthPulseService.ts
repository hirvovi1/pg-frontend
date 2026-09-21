export interface TelemetryEvent {
  service: string
  status: 'OK' | 'WARNING'
  latency: string
  timestamp: number
}

const PULSE_API_BASE = 'http://localhost:8095/api/pulse'
export const healthPulseService = {
  /**
   * Avaa reaaliaikaisen Server-Sent Events (SSE) -yhteyden Health Pulse -mikropalveluun.
   * @param onMessage Callback-funktio, jota kutsutaan aina kun uusi tila saapuu.
   * @returns Funktio, jota kutsumalla striimi saadaan suljettua siististi.
   */
  subscribeToPulse(onMessage: (data: TelemetryEvent) => void): () => void {
    const eventSource = new EventSource(`${PULSE_API_BASE}/stream`)

    eventSource.onmessage = (event) => {
      try {
        const parsedData: TelemetryEvent = JSON.parse(event.data)
        onMessage(parsedData)
      } catch (err) {
        console.error('[HealthPulseService] Failed to parse SSE message json', err)
      }
    }

    eventSource.onerror = (err) => {
      console.error('[HealthPulseService] SSE stream connection lost or errored', err)
    }

    // Palautetaan sulkemismetodi unmount-tilanteita varten
    return () => {
      console.info('[HealthPulseService] Closing SSE stream connection for NO REASON! Buhahahahahaaa!')
      eventSource.close()
    }
  }
}
