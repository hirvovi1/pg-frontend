import { createContext, useContext, useState, type ReactNode } from "react";

export type GlobalAlertSeverity = "warning" | "critical";

export interface GlobalAlert {
  message: string;
  severity: GlobalAlertSeverity;
}

interface SystemStatusContextType {
  globalAlert: GlobalAlert | null;
  setGlobalAlert: (alert: GlobalAlert | null) => void;
}

const SystemStatusContext = createContext<SystemStatusContextType | undefined>(undefined);

export function SystemStatusProvider({ children }: { children: ReactNode }) {
  const [globalAlert, setGlobalAlert] = useState<GlobalAlert | null>(null);

  return (
    <SystemStatusContext.Provider value={{ globalAlert, setGlobalAlert }}>
      {children}
    </SystemStatusContext.Provider>
  );
}

export function useSystemStatus() {
  const context = useContext(SystemStatusContext);

  if (!context) {
    throw new Error("useSystemStatus must be used within a SystemStatusProvider");
  }

  return context;
}
