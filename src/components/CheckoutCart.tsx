import {useState, useEffect, useCallback, type ChangeEvent} from "react";
import {cartService, type CartItem} from "../services/cartService";
import {paytrailService, type Account} from "../services/paytrailservice";
import {useCurrency} from "../context/CurrencyContext";
import {MoneyDisplay} from "./MoneyDisplay";
import CartItemComponent from "./CartItemComponent";
import './CheckoutCart.css';

const PENDING_TRANSACTION_STORAGE_KEY = "pending_transaction_id";

interface CheckoutCartProps {
    accounts: Account[];
    cartId: number;
}

function CheckoutCart({accounts, cartId}: CheckoutCartProps) {
    const {currency} = useCurrency();
    const [selectedBuyerId, setSelectedBuyerId] = useState('');
    const [promoCode] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [totalInCents, setTotalInCents] = useState<number>(0);

    // Seuraa ostoskorin tuotteita ja yhteissummaa yhdessä objektissa ketjutettujen renderöintien estämiseksi
    const [cartData, setCartData] = useState<{ items: CartItem[], total: number }>({
        items: [],
        total: 0
    });

    const refreshCartData = useCallback(async () => {
        if (!cartId) return;

        try {
            console.info("refreshCartData - fetching data");
            const [items, total] = await Promise.all([
                cartService.getCartItems(cartId),
                cartService.getTotalInCents(cartId)
            ]);

            if (items) {
                setCartData({items, total});
                setTotalInCents(total);
            }
        } catch (err) {
            console.error("Virhe ostoskorin tietojen päivityksessä:", err);
        }
    }, [cartId, setTotalInCents]); // 💡 KORJAUS: Poistettu olemattomat riippuvuudet

    useEffect(() => {
        if (cartId) {
            const timer = setTimeout(() => {
                void refreshCartData();
            }, 0);
            return () => clearTimeout(timer);
        }
    }, [cartId, refreshCartData]);

    const handleQuantityChange = async (productId: number, quantity: number) => {
        setIsLoading(true);
        try {
            await cartService.updateQuantity(cartId, productId, quantity);
            await refreshCartData();
        } catch (err) {
            console.error("Määrän päivitys epäonnistui:", err);
            setError("Could not update item quantity.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleRemoveItem = async (productId: number) => {
        setIsLoading(true);
        try {
            await cartService.removeFromCart(cartId, productId);
            await refreshCartData();
        } catch (err) {
            console.error("Tuotteen poisto epäonnistui:", err);
            setError("Could not remove item from cart.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleBuyerChange = (event: ChangeEvent<HTMLSelectElement>) => {
        setSelectedBuyerId(event.target.value);
        setError('');
        console.info('[CheckoutCart] Buyer selected', {accountId: event.target.value});
    };

    const formatOptionLabel = (amountInCents: number) => {
        if (currency === 'USD') {
            return `$${((amountInCents / 100) * 1.08).toFixed(2)} USD (est.)`;
        }
        return `${(amountInCents / 100).toFixed(2)} €`;
    };

    const handleCheckout = async () => {
        if (!selectedBuyerId) {
            console.warn('[CheckoutCart] Checkout blocked: no buyer selected');
            setError('Select an active buyer profile before continuing.');
            return;
        }

        if (promoCode && promoCode !== 'WHALE' && promoCode !== 'MINNOW') {
            console.warn('[CheckoutCart] Checkout blocked: invalid promo code');
            setError('Enter a valid promo code: WHALE or MINNOW.');
            return;
        }

        setError('');
        setIsLoading(true);

        try {
            const merchantAccount = await paytrailService.ensureMerchantAccount();
            const idempotencyKey = crypto.randomUUID();
            const response = await paytrailService.executeTransfer({
                idempotencyKey,
                accountIdFrom: selectedBuyerId,
                accountIdTo: merchantAccount.id,
                amountInCents: totalInCents,
            });

            if (!response.paymentUrl) {
                throw new Error('Paytrail did not provide a checkout URL.');
            }

            localStorage.setItem(PENDING_TRANSACTION_STORAGE_KEY, response.transactionId);
            window.location.assign(response.paymentUrl);
        } catch (requestError) {
            console.error('[CheckoutCart] Checkout failed', requestError);
            setError(requestError instanceof Error ? requestError.message : 'Could not start Paytrail checkout.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <section className="checkout-cart" aria-labelledby="checkout-cart-title">
            <div className="checkout-cart-heading">
                <div>
                    <p className="eyebrow">Paytrail checkout</p>
                    <h2 id="checkout-cart-title">Shopping Cart</h2>
                </div>
                {/* 💡 KORJAUS: Luetaan pituus suoraan cartData-objektista */}
                <span className="checkout-cart-count">{cartData.items.length} items</span>
            </div>

            <div className="checkout-cart-items">
                {/* 💡 KORJAUS: Käytetään cartData.items -listaa renderöintiin */}
                {cartData.items.length === 0 ? (
                    <p className="empty-state">Your cart is empty.</p>
                ) : (

                    // ------------------------------------
                    <div className="checkout-cart-items">
                        {cartData.items.length === 0 ? (
                            <p className="empty-state">Your cart is empty.</p>
                        ) : (
                            cartData.items.map((item) => (
                                <CartItemComponent
                                    key={item.productId}
                                    item={item}
                                    isLoading={isLoading}
                                    handleQuantityChange={handleQuantityChange}
                                    handleRemoveItem={handleRemoveItem}
                                />
                            ))
                        )}
                    </div>
                    // -------------------------------------
                )}
            </div>

            {/* Loppusumma */}
            <div className="checkout-cart-total">
                <span>Total</span>
                <strong>
                    <MoneyDisplay amountInCents={totalInCents} />
                </strong>
            </div>

            {/* 💡 RYHMÄ 1: Profiilin valinta omassa laatikossaan */}
            <div className="checkout-profile-section">
                <label className="checkout-cart-label" htmlFor="checkout-buyer">
                    Select Active Buyer Profile:
                </label>
                <select
                    id="checkout-buyer"
                    className="modern-select"
                    value={selectedBuyerId}
                    onChange={handleBuyerChange}
                    disabled={isLoading}
                >
                    <option value="">Choose an account</option>
                    {accounts.map((account) => (
                        <option key={account.id} value={account.id}>
                            {account.ownerName} - {formatOptionLabel(account.balanceInCents)}
                        </option>
                    ))}
                </select>
            </div>

            {error && <p className="message error" role="alert">{error}</p>}

            {/* 💡 RYHMÄ 2: Maksupainike omassa laatikossaan */}
            <div className="checkout-action-section">
                <button className="checkout-cart-button" type="button" onClick={handleCheckout} disabled={isLoading}>
                    {isLoading ? 'Connecting to Paytrail...' : 'Proceed to Paytrail Checkout'}
                </button>
            </div>
        </section>
    );
}


export default CheckoutCart;
