import { HealthToggleButton } from "./HealthToggleButton";

interface ShopHeaderProps {
  isWidgetOpen: boolean;
  onToggleWidget: () => void;
  widgetAlertLevel: "green" | "yellow" | "red";
  currency: "EUR" | "USD";
  onCurrencyChange: (nextCurrency: "EUR" | "USD") => void;
  isCartOpen: boolean;
  onToggleCart: () => void;
  onCreateAccount: () => void;
}

export function ShopHeader({
  isWidgetOpen,
  onToggleWidget,
  widgetAlertLevel,
  currency,
  onCurrencyChange,
  isCartOpen,
  onToggleCart,
  onCreateAccount,
}: ShopHeaderProps) {
  return (
    <>
      <div
        className="quick-actions-toolbar"
        style={{
          display: "flex",
          gap: "10px",
          padding: "8px 24px",
          background: "#f4f4f5",
          borderBottom: "1px solid #e4e4e7",
          justifyContent: "flex-start",
          alignItems: "center",
        }}
      >
        <HealthToggleButton
          isWidgetOpen={isWidgetOpen}
          onToggleWidget={onToggleWidget}
          widgetAlertLevel={widgetAlertLevel}
        />
      </div>

      <header className="account-header">
        <div className="account-intro">
          <p className="eyebrow">Webstable store accounts</p>
          <h1>Account dashboard</h1>
          <p className="intro-copy">Register as global webstable store customer</p>
        </div>

        <div className="account-header-actions">
          <button className="cart-button" type="button" onClick={onToggleCart}>
            {isCartOpen ? "Hide cart" : "View cart"}
          </button>
          <button className="new-account-button" type="button" onClick={onCreateAccount}>
            + New Account
          </button>
        </div>
        <div className="global-currency-selector">
          <label htmlFor="global-currency">Currency: </label>
          <select
            id="global-currency"
            value={currency}
            onChange={(event) => onCurrencyChange(event.target.value as "EUR" | "USD")}
          >
            <option value="EUR">EUR (€)</option>
            <option value="USD">USD ($)</option>
          </select>
        </div>
      </header>
    </>
  );
}
