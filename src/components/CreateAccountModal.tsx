import { useState } from 'react'
import type { FormEvent } from 'react'
import { paytrailService } from '../services/paytrailservice'

interface CreateAccountModalProps {
  onClose: () => void;
  onAccountCreated: () => Promise<void>;
}

function CreateAccountModal({ onClose, onAccountCreated }: CreateAccountModalProps) {
  const [name, setName] = useState('');
  const [balance, setBalance] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const closeModal = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  const handleCreateAccount = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      await paytrailService.createAccount({
        ownerName: name.trim(),
        balanceInCents: Math.round(Number(balance) * 100),
      });
      await onAccountCreated();
      setName('');
      setBalance('');
      onClose();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Could not create account');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={closeModal}>
      <section className="account-panel modal" role="dialog" aria-modal="true" aria-labelledby="account-form-title" onMouseDown={(event) => event.stopPropagation()}>
        <div className="modal-heading">
          <div>
            <p className="eyebrow">New account</p>
            <h2 id="account-form-title">Account details</h2>
          </div>
          <button className="close-button" type="button" aria-label="Close modal" onClick={closeModal}>×</button>
        </div>
        <form onSubmit={handleCreateAccount}>
          <label htmlFor="account-name">Account name</label>
          <input
            id="account-name"
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Everyday spending"
            required
          />

          <label htmlFor="account-balance">Opening balance</label>
          <div className="amount-input">
            <span aria-hidden="true">EUR</span>
            <input
              id="account-balance"
              type="number"
              min="0"
              step="0.01"
              value={balance}
              onChange={(event) => setBalance(event.target.value)}
              placeholder="0.00"
              required
            />
          </div>

          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        {error && <p className="message error" role="alert">{error}</p>}
      </section>
    </div>
  )
}

export default CreateAccountModal
