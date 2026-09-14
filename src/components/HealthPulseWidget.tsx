import { useEffect, useState } from "react";
import { healthPulseService } from "../services/healthPulseService";
import type { TelemetryEvent } from "../services/healthPulseService";

import "./HealthPulseWidget.css";

interface ServiceStatus {
  status: "OK" | "WARNING";
  latency: string;
  lastCheck: string;
}

export function HealthPulseWidget() {
  // Alustetaan kaikki kolme aitoa kohdetta oletuksena keltaiselle,
  // kunnes ensimmäinen aito verkkosignaali saapuu
  const [systemStatuses, setSystemStatuses] = useState<
    Record<string, ServiceStatus>
  >({
    "Java account api": {
      status: "WARNING",
      latency: "0ms",
      lastCheck: "Connecting...",
    },
    "currency service": {
      status: "WARNING",
      latency: "0ms",
      lastCheck: "Connecting...",
    },
    "H2 db (via api)": {
      status: "WARNING",
      latency: "0ms",
      lastCheck: "Connecting...",
    },
  });

  const [pulseActive, setPulseActive] = useState(false);

  useEffect(() => {
    // Pidetään muuttuja ajastimelle tässä lohkossa
    let timeoutId: ReturnType<typeof setTimeout>;

    const unsubscribe = healthPulseService.subscribeToPulse(
      (data: TelemetryEvent) => {
        setPulseActive(true);

        // Siivotaan edellinen ajastin alta pois, jos sellainen oli käynnissä
        clearTimeout(timeoutId);

        timeoutId = setTimeout(() => {
          setPulseActive(false);
        }, 300);

        setSystemStatuses((prev) => ({
          ...prev,
          [data.service]: {
            status: data.status,
            latency: data.latency,
            lastCheck: new Date(data.timestamp).toLocaleTimeString(),
          },
        }));
      },
    );

    // Tämä palautus suoritetaan VAIN SILLOIN, kun koko widget poistuu ruudulta
    return () => {
      clearTimeout(timeoutId);
      unsubscribe();
    };
  }, []);

  return (
    <div className={`health-pulse-tray ${pulseActive ? "sweep" : ""}`}>
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
              <span>
                {metrics.latency} • {metrics.lastCheck}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default HealthPulseWidget;
