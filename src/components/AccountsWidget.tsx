import type { Account } from "../services/paytrailservice";
import { MoneyDisplay } from "./MoneyDisplay";

interface AccountsWidgetProps {
  accounts: Account[];
  isLoading: boolean;
  deletingAccountId: string | null;
  onDeleteAccount: (accountId: string) => void;
}

export function AccountsWidget({
  accounts,
  isLoading,
  deletingAccountId,
  onDeleteAccount,
}: AccountsWidgetProps) {
  return (
    <section className="accounts-section account-widget" aria-labelledby="accounts-title">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Overview</p>
          <h2 id="accounts-title">Your accounts</h2>
        </div>
        <span className="account-count">
          {accounts.length} {accounts.length === 1 ? "account" : "accounts"}
        </span>
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
              <p className="account-balance">
                <MoneyDisplay amountInCents={account.balanceInCents} />
              </p>

              <code>{account.id}</code>
              <button
                className="delete-account-button"
                type="button"
                onClick={() => void onDeleteAccount(account.id)}
                disabled={deletingAccountId !== null}
              >
                {deletingAccountId === account.id ? "Deleting..." : "Delete account"}
              </button>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
