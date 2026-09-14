import { useState } from "react";
import "./App.css";
import MockPaymentPage from "./components/MockPaymentPage";
import { CurrencyProvider } from "./context/CurrencyContext";
import { SystemStatusProvider, useSystemStatus } from "./context/SystemStatusContext";
import { HealthPulseWidget } from './components/HealthPulseWidget';
import { ShopApp } from "./components/ShopApp";

function AppContent() {
  const { globalAlert } = useSystemStatus();
  const isMockPayment = window.location.pathname.startsWith('/mock-payment')
  const [isWidgetOpen, setIsWidgetOpen] = useState(false);

  let pageContent;

  if (isMockPayment) {
    const transactionId = window.location.pathname.split('/').filter(Boolean).at(-1) ?? ''
    const amountParam = new URLSearchParams(window.location.search).get('amountCents')
    const parsedAmount = amountParam === null ? null : Number(amountParam)
    const amountInCents = Number.isFinite(parsedAmount) ? parsedAmount : null

    pageContent = <MockPaymentPage transactionId={transactionId} amountInCents={amountInCents} />
  } else {
    pageContent = (
      <ShopApp 
        isWidgetOpen={isWidgetOpen} 
        onToggleWidget={() => setIsWidgetOpen(prev => !prev)} 
      />
    );
  }

  return (
    <>
      {globalAlert && (
        <div className="message error" role="alert" style={{ margin: "12px 24px 0" }}>
          {globalAlert.message}
        </div>
      )}
      
      {pageContent}

      <div style={{ display: isWidgetOpen ? 'block' : 'none' }}>
        <HealthPulseWidget />
      </div>
    </>
  )
}

function App() {
  return (
    <CurrencyProvider>
      <SystemStatusProvider>
        <AppContent />
      </SystemStatusProvider>
    </CurrencyProvider>
  );
}

export default App;
