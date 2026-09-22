import { HealthToggleButton } from "./HealthToggleButton";
import "./ShopHeader.css";

type View = 'accounts' | 'cart' | 'products';

interface ShopHeaderProps {
  healthWidget: boolean;
  onToggleWidget: () => void;
  widgetAlertLevel: "green" | "yellow" | "red";
  currency: "EUR" | "USD";
  onCurrencyChange: (nextCurrency: "EUR" | "USD") => void;
  currentView: View;
  onViewChange: (view: View) => void;
  onCreateAccount: () => void;
}

export function ShopHeader({
                             healthWidget,
                             onToggleWidget,
                             widgetAlertLevel,
                             currency,
                             onCurrencyChange,
                             currentView,
                             onViewChange,
                             onCreateAccount,
                           }: ShopHeaderProps) {

  // 1. Määritellään dynaamiset tekstit jokaiselle näkymälle
  const welcomeTexts: Record<View, string> = {
    accounts: "Register and manage global Webstable store customer accounts.",
    cart: "Review your selected items and proceed to secure checkout.",
    products: "Browse our international product catalog and current deals."
  };

  return (
    <>
      <div className="quick-actions-toolbar">
        <HealthToggleButton
          healthWidget={healthWidget}
          onToggleWidget={onToggleWidget}
          widgetAlertLevel={widgetAlertLevel}
        />

        <div className="toolbar-right-group">
          <button
            className={`view-button ${currentView === 'accounts' ? 'active' : ''}`}
            type="button"
            onClick={() => onViewChange('accounts')}
          >
            Accounts
          </button>
          <button
            className={`view-button ${currentView === 'cart' ? 'active' : ''}`}
            type="button"
            onClick={() => onViewChange('cart')}
          >
            Cart
          </button>
          <button
            className={`view-button ${currentView === 'products' ? 'active' : ''}`}
            type="button"
            onClick={() => onViewChange('products')}
          >
            Products
          </button>
          <button className="new-account-button" type="button" onClick={onCreateAccount}>
            + New Account
          </button>

          <div className="global-currency-selector">
            <label htmlFor="global-currency">Currency: </label>
            <select
              id="global-currency"
              value={currency}
              onChange={(event) => onCurrencyChange(event.target.value as "EUR" | "USD")}
            >
              <option value="EUR">EUR (€)</option>
              <option value="USD">USD (\$)</option>
            </select>
          </div>
        </div>
      </div>

      <header className="account-header">
        <div className="account-intro">
          <p className="eyebrow">Global Webstable commerce</p>
          <h1 className="dashboard-title">Webstable store</h1>
          <p className="intro-copy">{welcomeTexts[currentView]}</p>
        </div>
      </header>
    </>
  );
}
