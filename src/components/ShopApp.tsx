import { useEffect, useState } from "react";
import type { Account } from "../services/paytrailservice";
import { paytrailService } from "../services/paytrailservice";
import type { Product } from "../services/productService";
import { productService } from "../services/productService";
import { useCurrency } from "../context/CurrencyContext";
import { useSystemStatus } from "../context/SystemStatusContext";
import CheckoutCartWidget from "./CheckoutCart.tsx";
import CreateAccountModal from "./CreateAccountModal";
import { AccountsWidget } from "./AccountsWidget";
import { ProductsWidget } from "./ProductsWidget";
import { ShopHeader } from "./ShopHeader";

type View = 'accounts' | 'cart' | 'products';

interface ShopAppProps {
  healthWidget: boolean;
  onToggleWidget: () => void;
}

export function ShopApp({ healthWidget, onToggleWidget }: ShopAppProps) {
  const { currency, setCurrency } = useCurrency();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isProductsLoading, setIsProductsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentView, setCurrentView] = useState<View>('accounts');
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

  const fetchProducts = async () => {
    console.info("[ShopApp] Loading products");
    try {
      const loadedProducts = await productService.getProducts();
      setProducts(loadedProducts);
      console.info("[ShopApp] Products loaded", { count: loadedProducts.length });
    } catch (requestError) {
      console.error("[ShopApp] Failed to load products", requestError);
      setError(requestError instanceof Error ? requestError.message : "Could not load products");
    } finally {
      setIsProductsLoading(false);
    }
  };

  useEffect(() => {
    void Promise.resolve().then(fetchAccounts);
    void Promise.resolve().then(fetchProducts);
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
        healthWidget={healthWidget}
        onToggleWidget={onToggleWidget}
        widgetAlertLevel={getButtonAlertLevel()}
        currency={currency}
        onCurrencyChange={(nextCurrency) => setCurrency(nextCurrency)}
        currentView={currentView}
        onViewChange={setCurrentView}
        onCreateAccount={() => setIsModalOpen(true)}
      />

      {error && !isModalOpen && (
        <p className="message error" role="alert">
          {error}
        </p>
      )}

      {currentView === 'accounts' && (
        <AccountsWidget
          accounts={accounts}
          isLoading={isLoading}
          deletingAccountId={deletingAccountId}
          onDeleteAccount={handleDeleteAccount}
        />
      )}

      {currentView === 'cart' && <CheckoutCartWidget accounts={accounts} />}

      {currentView === 'products' && (
        <ProductsWidget
          products={products}
          isLoading={isProductsLoading}
        />
      )}
      {isModalOpen && <CreateAccountModal onClose={() => setIsModalOpen(false)} onAccountCreated={refreshAccounts} />}
    </main>
  );
}
