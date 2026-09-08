import { useEffect, useState } from 'react'
import './App.css'
import CheckoutCart from './components/CheckoutCart'
import CreateAccountModal from './components/CreateAccountModal'
import MockPaymentPage from './components/MockPaymentPage'
import type { Account } from './services/paytrailservice'
import { paytrailService } from './services/paytrailservice'

function ShopApp() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [deletingAccountId, setDeletingAccountId] = useState<string | null>(null);
  const fetchAccounts = async () => {
    console.info('[ShopApp] Loading accounts');

    try {
      const loadedAccounts = await paytrailService.getAllAccounts();
      setAccounts(loadedAccounts);
      console.info('[ShopApp] Accounts loaded', { count: loadedAccounts.length });
    } catch (requestError) {
      console.error('[ShopApp] Failed to load accounts', requestError);
      setError(requestError instanceof Error ? requestError.message : 'Could not load accounts');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void Promise.resolve().then(fetchAccounts);
  }, []);

  const refreshAccounts = () => {
    console.info('[ShopApp] Refreshing accounts after account creation');
    return fetchAccounts();
  };

  const handleDeleteAccount = async (accountId: string) => {
    console.info('[ShopApp] Deleting account', { accountId });
    setError('');
    setDeletingAccountId(accountId);

    try {
      await paytrailService.deleteAccount(accountId);
      setAccounts((currentAccounts) => currentAccounts.filter((account) => account.id !== accountId));
      console.info('[ShopApp] Account deleted', { accountId });
    } catch (requestError) {
      console.error('[ShopApp] Failed to delete account', { accountId, requestError });
      setError(requestError instanceof Error ? requestError.message : 'Could not delete account');
    } finally {
      setDeletingAccountId(null);
    }
  };

  return (
    <main className="account-page">
      <header className="account-header">
        <div className="account-intro">
          <p className="eyebrow">Webstable store accounts</p>
          <h1>Account dashboard</h1>
          <p className="intro-copy">Register as global webstable store customer</p>
        </div>
        <div className="account-header-actions">
          <button className="cart-button" type="button" onClick={() => setIsCartOpen((isOpen) => {
            const nextIsCartOpen = !isOpen;
            console.info('[ShopApp] Cart visibility changed', { isCartOpen: nextIsCartOpen });
            return nextIsCartOpen;
          })}>
            {isCartOpen ? 'Hide cart' : 'View cart'}
          </button>
          <button className="new-account-button" type="button" onClick={() => setIsModalOpen(true)}>
            + New Account
          </button>
        </div>
      </header>

      {error && !isModalOpen && !isCartOpen && <p className="message error" role="alert">{error}</p>}

      {!isCartOpen && (
        <section className="accounts-section" aria-labelledby="accounts-title">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Overview</p>
              <h2 id="accounts-title">Your accounts</h2>
            </div>
            <span className="account-count">{accounts.length} {accounts.length === 1 ? 'account' : 'accounts'}</span>
          </div>

          {isLoading ? (
            <p className="empty-state">Loading accounts...</p>
          ) : accounts.length === 0 ? (
            <p className="empty-state">No accounts yet. Create your first account to get started.</p>
          ) : (
            <div className="account-grid">
              {accounts.map((account) => (
                <article className="account-card" key={account.id}>
                  <div className="account-card-topline">
                    <span className="account-dot" aria-hidden="true" />
                    <span>Account owner</span>
                  </div>
                  <h3>{account.ownerName}</h3>
                  <p className="account-balance">{(account.balanceInCents / 100).toFixed(2)} EUR</p>
                  <code>{account.id}</code>
                  <button
                    className="delete-account-button"
                    type="button"
                    onClick={() => void handleDeleteAccount(account.id)}
                    disabled={deletingAccountId !== null}
                  >
                    {deletingAccountId === account.id ? 'Deleting...' : 'Delete account'}
                  </button>
                </article>
              ))}
            </div>
          )}
        </section>
      )}

      {isCartOpen && <CheckoutCart accounts={accounts} />}

      {isModalOpen && (
        <CreateAccountModal
          onClose={() => setIsModalOpen(false)}
          onAccountCreated={refreshAccounts}
        />
      )}
    </main>
  )
}

function App() {
  if (window.location.pathname.startsWith('/mock-payment')) {
    const transactionId = window.location.pathname.split('/').filter(Boolean).at(-1) ?? ''
    const amountParam = new URLSearchParams(window.location.search).get('amountCents')
    const parsedAmount = amountParam === null ? null : Number(amountParam)
    const amountInCents = Number.isFinite(parsedAmount) ? parsedAmount : null

    return <MockPaymentPage transactionId={transactionId} amountInCents={amountInCents} />
  }

  return <ShopApp />
}

export default App
