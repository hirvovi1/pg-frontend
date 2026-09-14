import { useEffect, useState } from 'react'
import { healthPulseService } from '../services/healthPulseService'
import type { TelemetryEvent } from '../services/healthPulseService'

import './HealthPulseWidget.css' 

interface ServiceStatus {
  status: 'OK' | 'WARNING'
  latency: string
  lastCheck: string
}

export function HealthPulseWidget() {
  // Alustetaan kaikki kolme aitoa kohdetta oletuksena keltaiselle, 
  // kunnes ensimmäinen aito verkkosignaali saapuu
  const [systemStatuses, setSystemStatuses] = useState<Record<string, ServiceStatus>>({
    'Java account api': { status: 'WARNING', latency: '0ms', lastCheck: 'Connecting...' },
    'currency service': { status: 'WARNING', latency: '0ms', lastCheck: 'Connecting...' },
    'H2 db (via api)': { status: 'WARNING', latency: '0ms', lastCheck: 'Connecting...' },
  })
  
  const [pulseActive, setPulseActive] = useState(false)

  useEffect(() => {
    // Tilataan live-data puhtaasti palvelukerroksen kautta
    const unsubscribe = healthPulseService.subscribeToPulse((data: TelemetryEvent) => {
      // Väläytetään reunaa merkiksi siitä, että aito data liikahti verkon yli
      setPulseActive(true)
      const timeout = setTimeout(() => setPulseActive(false), 300)

      setSystemStatuses((prev) => ({
        ...prev,
        [data.service]: {
          status: data.status,
          latency: data.latency,
          lastCheck: new Date(data.timestamp).toLocaleTimeString(),
        },
      }))

      return () => clearTimeout(timeout)
    })

    // Cleanup: kun widget poistuu ruudulta, yhteys suljetaan automaattisesti
    return () => unsubscribe()
  }, [])

  return (
    <div className={`health-pulse-tray ${pulseActive ? 'sweep' : ''}`}>
      <div className="tray-title-row">
        <span className="radar-ping" />
        <h4>System Health Pulse Radar</h4>
      </div>
      <div className="status-grid">
        {Object.entries(systemStatuses).map(([name, metrics]) => (
          <div key={name} className="status-node">
            <span className={`node-dot ${metrics.status.toLowerCase()}`} />
            <div className="node-info">
              <strong>{name}</strong>
              <span>{metrics.latency} • {metrics.lastCheck}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default HealthPulseWidget
