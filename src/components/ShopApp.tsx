import { useEffect, useState } from "react";
import type { Account } from "../services/paytrailservice";
import { paytrailService } from "../services/paytrailservice";
import { useCurrency } from "../context/CurrencyContext";
import { useSystemStatus } from "../context/SystemStatusContext";
import CheckoutCartWidget from "./CheckoutCartWidget";
import CreateAccountModal from "./CreateAccountModal";
import { AccountsWidget } from "./AccountsWidget";
import { ShopHeader } from "./ShopHeader";

interface ShopAppProps {
  isWidgetOpen: boolean;
  onToggleWidget: () => void;
}

export function ShopApp({ isWidgetOpen, onToggleWidget }: ShopAppProps) {
  const { currency, setCurrency } = useCurrency();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [deletingAccountId, setDeletingAccountId] = useState<string | null>(null);
  const { globalAlert } = useSystemStatus();

  const getButtonAlertLevel = () => {
    if (!globalAlert) return "green";
    return globalAlert.severity === "critical" ? "red" : "yellow";
  };

  const fetchAccounts = async () => {
    console.info("[ShopApp] Loading accounts");
    try {
      const loadedAccounts = await paytrailService.getAllAccounts();
      setAccounts(loadedAccounts);
      console.info("[ShopApp] Accounts loaded", { count: loadedAccounts.length });
    } catch (requestError) {
      console.error("[ShopApp] Failed to load accounts", requestError);
      setError(requestError instanceof Error ? requestError.message : "Could not load accounts");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void Promise.resolve().then(fetchAccounts);
  }, []);

  const refreshAccounts = () => {
    console.info("[ShopApp] Refreshing accounts after account creation");
    return fetchAccounts();
  };

  const handleDeleteAccount = async (accountId: string) => {
    console.info("[ShopApp] Deleting account", { accountId });
    setError("");
    setDeletingAccountId(accountId);

    try {
      await paytrailService.deleteAccount(accountId);
      setAccounts((currentAccounts) => currentAccounts.filter((account) => account.id !== accountId));
      console.info("[ShopApp] Account deleted", { accountId });
    } catch (requestError) {
      console.error("[ShopApp] Failed to delete account", { accountId, requestError });
      setError(requestError instanceof Error ? requestError.message : "Could not delete account");
    } finally {
      setDeletingAccountId(null);
    }
  };

  return (
    <main className="account-page">
      <ShopHeader
        isWidgetOpen={isWidgetOpen}
        onToggleWidget={onToggleWidget}
        widgetAlertLevel={getButtonAlertLevel()}
        currency={currency}
        onCurrencyChange={(nextCurrency) => setCurrency(nextCurrency)}
        isCartOpen={isCartOpen}
        onToggleCart={() =>
          setIsCartOpen((isOpen) => {
            const nextIsCartOpen = !isOpen;
            console.info("[ShopApp] Cart visibility changed", { isCartOpen: nextIsCartOpen });
            return nextIsCartOpen;
          })
        }
        onCreateAccount={() => setIsModalOpen(true)}
      />

      {error && !isModalOpen && !isCartOpen && (
        <p className="message error" role="alert">
          {error}
        </p>
      )}

      {!isCartOpen && (
        <AccountsWidget
          accounts={accounts}
          isLoading={isLoading}
          deletingAccountId={deletingAccountId}
          onDeleteAccount={handleDeleteAccount}
        />
      )}

      {isCartOpen && <CheckoutCartWidget accounts={accounts} />}
      {isModalOpen && <CreateAccountModal onClose={() => setIsModalOpen(false)} onAccountCreated={refreshAccounts} />}
    </main>
  );
}
