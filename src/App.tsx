import { useEffect, useState } from 'react'
import './App.css'
import CreateAccountModal from './components/CreateAccountModal'
import type { Account } from './services/paytrailservice'
import { paytrailService } from './services/paytrailservice'

function App() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deletingAccountId, setDeletingAccountId] = useState<string | null>(null);
  const fetchAccounts = async () => {
    try {
      setAccounts(await paytrailService.getAllAccounts());
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Could not load accounts');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void Promise.resolve().then(fetchAccounts);
  }, []);

  const refreshAccounts = () => fetchAccounts();

  const handleDeleteAccount = async (accountId: string) => {
    setError('');
    setDeletingAccountId(accountId);

    try {
      await paytrailService.deleteAccount(accountId);
      setAccounts((currentAccounts) => currentAccounts.filter((account) => account.id !== accountId));
    } catch (requestError) {
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
        <button className="new-account-button" type="button" onClick={() => setIsModalOpen(true)}>
          + New Account
        </button>
      </header>

      {error && !isModalOpen && <p className="message error" role="alert">{error}</p>}

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

      {isModalOpen && (
        <CreateAccountModal
          onClose={() => setIsModalOpen(false)}
          onAccountCreated={refreshAccounts}
        />
      )}
    </main>
  )
}

export default App
