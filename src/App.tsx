import { useState } from "react";
import "./App.css";
import MockPaymentPage from "./components/MockPaymentPage";
import { CurrencyProvider } from "./context/CurrencyContext";
import { SystemStatusProvider, useSystemStatus } from "./context/SystemStatusContext";
import { HealthPulseWidget } from './components/HealthPulseWidget';
import { ShopApp } from "./components/ShopApp";

function amountInCents() {
  const searchParams = new URLSearchParams(window.location.search);
  const rawAmount = searchParams.get('amountCents');
  return Number(rawAmount);
}

function getTransactionId() {
  const pathSegments = window.location.pathname.split('/').filter(Boolean);
  return pathSegments.at(-1) ?? '';
}

function AppContent() {
  const { globalAlert } = useSystemStatus();
  const isMockPayment = window.location.pathname.startsWith('/mock-payment')
  const [healthWidget, setHealthWidget] = useState(false);

  let pageContent;

  if (isMockPayment) {
    pageContent = <MockPaymentPage transactionId={getTransactionId()} amountInCents={amountInCents()} />
  } else {
    pageContent = (
      <ShopApp healthWidget={healthWidget} onToggleWidget={() => setHealthWidget(prev => !prev)} />
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

      <div style={{ display: healthWidget ? 'block' : 'none' }}>
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
