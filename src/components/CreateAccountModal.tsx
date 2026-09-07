import { useState } from 'react'
import type { FormEvent } from 'react'
import { paytrailService } from '../services/paytrailservice'

interface CreateAccountModalProps {
  onClose: () => void;
  onAccountCreated: () => Promise<void>;
}

function CreateAccountModal(props: CreateAccountModalProps) {
  const { onClose, onAccountCreated } = props;
  const [name, setName] = useState('');
  const [balance, setBalance] = useState('');
  const [promoCode, setPromoCode] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePromoCodeChange = (value: string) => {
    setPromoCode(value);
    setBalance(value === 'WHALE' ? '150.00' : value === 'MINNOW' ? '100.00' : '');
    setError('');
  };

  const closeModal = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  const handleCreateAccount = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');

    if (promoCode && promoCode !== 'WHALE' && promoCode !== 'MINNOW') {
      setError('Enter a valid promo code: WHALE or MINNOW.');
      return;
    }

    setIsSubmitting(true);

    try {
      await paytrailService.createAccount({
        ownerName: name.trim(),
        balanceInCents: Math.round(Number(balance) * 100),
      });
      await onAccountCreated();
      setName('');
      setBalance('');
      setPromoCode('');
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
          <label htmlFor="account-name">Account owner</label>
          <input
            id="account-name"
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="John Doe"
            required
          />

          <label htmlFor="account-promo-code">Promo code</label>
          <input
            id="account-promo-code"
            type="text"
            value={promoCode}
            onChange={(event) => handlePromoCodeChange(event.target.value)}
            placeholder=""
            pattern="(WHALE|MINNOW)?"
            title="Promo code must be WHALE, MINNOW, or empty"
            maxLength={6}
            disabled={isSubmitting}
          />

          <label htmlFor="account-balance">Amount</label>
          <div className="amount-input">
            <span aria-hidden="true">EUR</span>
            <input
              id="account-balance"
              type="number"
              min="0"
              step="0.01"
              value={balance}
              placeholder="0.00"
              readOnly
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
