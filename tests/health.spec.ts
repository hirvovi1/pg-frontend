import { expect, test } from "@playwright/test";
import { TelemetryEvent } from "/src/services/healthPulseService.ts";

test.describe("healthPulseService", () => {
  test("opens the SSE stream and parses valid telemetry events", async ({ page }) => {
    
    await page.addInitScript(() => {
      
        const mockTelemetryPayload = JSON.stringify({
        service: "currency service",
        status: "OK",
        latency: "42ms",
        timestamp: 1700000000000,
      });

      class MockEventSource {
        url: string;
        closed = false;
        onmessage: ((event: { data: string }) => void) | null = null;
        onerror: ((event: unknown) => void) | null = null;

        constructor(url: string) {
          this.url = url;

          // Tallennetaan instanssi testin tarkistusta varten globaaliin tilaan
          const globalTestEnvironment = window as any;
          globalTestEnvironment.__healthEventSource = this;

          this.simulateIncomingStreamData(mockTelemetryPayload);
        }

        simulateIncomingStreamData(rawJsonData: string) {
          const immediateDelayMs = 0;
          setTimeout(() => {
            this.onmessage?.({ data: rawJsonData });
          }, immediateDelayMs);
        }

        close() {
          this.closed = true;
        }
      }

      const globalBrowserWindow = window as any;
      globalBrowserWindow.EventSource = MockEventSource;
    });

    await page.goto("/");
    const result = await page.evaluate(async () => {
      const { healthPulseService } = await import("/src/services/healthPulseService.ts");
      const waitForMs = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

      const receivedEvents: TelemetryEvent[] = [];

      const onEvent = (telemetryData: TelemetryEvent) => {
        receivedEvents.push(telemetryData);
      };

      const unsubscribe = healthPulseService.subscribeToPulse(onEvent);

      // 3. Odotetaan hetki, että valeserveri ehtii lähettää datan, ja suljetaan tilaus
      await waitForMs(10);
      unsubscribe();

      // 4. Palautetaan selkeä raportti testin tarkistusta (expect) varten
      const mockInstance = (window as any).__healthEventSource;

      return {
        received: receivedEvents,
        url: mockInstance?.url,
        closed: mockInstance?.closed,
      };
    });
    
    expect(result.url).toBe("http://localhost:8091/api/v1/frontend/health/stream");
    expect(result.received).toEqual([
      {
        service: "currency service",
        status: "OK",
        latency: "42ms",
        timestamp: 1700000000000,
      },
    ]);
    expect(result.closed).toBe(true);
  });

  test("ignores malformed SSE payloads without throwing", async ({ page }) => {
    await page.addInitScript(() => {
      class MockEventSource {
        onmessage: ((event: { data: string }) => void) | null = null;
        onerror: ((event: unknown) => void) | null = null;

        constructor() {
          setTimeout(() => {
            this.onmessage?.({ data: "{broken json" });
          }, 0);
        }

        close() {
          // no-op for test
        }
      }

      (window as any).EventSource = MockEventSource;
    });

    await page.goto("/");

    const result = await page.evaluate(async () => {
      const { healthPulseService } = await import("/src/services/healthPulseService.ts");
      const receivedEvents: TelemetryEvent[] = [];

      const onEvent = (telemetryData: TelemetryEvent) => {
        receivedEvents.push(telemetryData);
      };
      const unsubscribe = healthPulseService.subscribeToPulse(onEvent);

      await new Promise((resolve) => setTimeout(resolve, 10));
      unsubscribe();

      return receivedEvents;
    });

    expect(result).toEqual([]);
  });

  test("calls the unsubscribe callback to close the event stream", async ({ page }) => {
    await page.addInitScript(() => {
      class MockEventSource {
        closed = false;
        onmessage: ((event: { data: string }) => void) | null = null;
        onerror: ((event: unknown) => void) | null = null;

        close() {
          this.closed = true;
          (window as any).__eventSourceClosed = true;
        }
      }

      (window as any).EventSource = MockEventSource;
    });

    await page.goto("/");

    const result = await page.evaluate(async () => {
      const { healthPulseService } = await import("/src/services/healthPulseService.ts");
      const unsubscribe = healthPulseService.subscribeToPulse(() => undefined);
      unsubscribe();

      return (window as any).__eventSourceClosed === true;
    });

    expect(result).toBe(true);
  });
});
