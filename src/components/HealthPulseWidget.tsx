import {useEffect, useRef, useState} from "react";
import {useSystemStatus} from "../context/SystemStatusContext";
import {healthPulseService} from "../services/healthPulseService";
import type {TelemetryEvent} from "../services/healthPulseService";

import "./HealthPulseWidget.css";

interface ServiceStatus {
    status: "OK" | "WARNING";
    latency: string;
    lastCheck: string;
}

export function HealthPulseWidget() {
    const {setGlobalAlert} = useSystemStatus();

    const setGlobalAlertToContext = (alert: { message: string; severity: "warning" | "critical" }) => {
        setGlobalAlert(alert);
    };

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
    const isHealthServiceDownRef = useRef(false);

    useEffect(() => {
        // Pidetään muuttuja ajastimelle tässä lohkossa
        let timeoutId: ReturnType<typeof setTimeout>;
        let retryTimeoutId: ReturnType<typeof setTimeout>;
        let unsubscribe: (() => void) | null = null;

        const connect = () => {
            unsubscribe = healthPulseService.subscribeToPulse(
                (data: TelemetryEvent) => {
                    // Clear the health service down alert if it was set
                    if (isHealthServiceDownRef.current) {
                        isHealthServiceDownRef.current = false;
                        setGlobalAlert(null);
                    }
                    setPulseActive(true);

                    // Siivotaan edellinen ajastin alta pois, jos sellainen oli käynnissä
                    clearTimeout(timeoutId);
                    clearTimeout(retryTimeoutId);

                    timeoutId = setTimeout(() => {
                        setPulseActive(false);
                    }, 300);

                    setSystemStatuses((prev) => {
                        const updated = {
                            ...prev,
                            [data.service]: {
                                status: data.status,
                                latency: data.latency,
                                lastCheck: new Date(data.timestamp).toLocaleTimeString(),
                            },
                        };

                        // Count services with WARNING status
                        const warningCount = Object.values(updated).filter(
                            (s) => s.status === "WARNING"
                        ).length;

                        if (warningCount > 2) {
                            setGlobalAlertToContext({
                                message: `More than 2 services failed.`,
                                severity: "critical",
                            });
                        } else if (warningCount === 0) {
                            // All services are OK, clear the alert
                            setGlobalAlert(null);
                        } else if (data.status === "WARNING") {
                            setGlobalAlertToContext({
                                message: `${data.service} is reporting a warning state.`,
                                severity: "warning",
                            });
                        }

                        return updated;
                    });
                },
                () => {
                    // SSE connection error - health service is down
                    isHealthServiceDownRef.current = true;
                    setGlobalAlertToContext({
                        message: "Health Pulse service is unreachable. Cannot monitor system status.",
                        severity: "critical",
                    });
                    // Attempt to reconnect after 5 seconds
                    retryTimeoutId = setTimeout(() => {
                        console.info('[HealthPulseWidget] Attempting to reconnect to health service...');
                        connect();
                    }, 5000);
                },
            );
        };

        connect();

        // Tämä palautus suoritetaan VAIN SILLOIN, kun koko widget poistuu ruudulta
        return () => {
            clearTimeout(timeoutId);
            clearTimeout(retryTimeoutId);
            if (unsubscribe) unsubscribe();
        };
    }, []);

    return (
        <div className={`health-pulse-tray ${pulseActive ? "sweep" : ""}`}>
            <div className="tray-title-row">
                <span className="radar-ping"/>
                <h4>System Health Pulse Radar</h4>
            </div>
            <div className="status-grid">
                {Object.entries(systemStatuses).map(([name, metrics]) => (
                    <div key={name} className="status-node">
                        <span className={`node-dot ${metrics.status.toLowerCase()}`}/>
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

