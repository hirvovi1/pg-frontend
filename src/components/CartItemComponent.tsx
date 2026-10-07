import React from 'react';
import './CartItemComponent.css';
import {MoneyDisplay} from './MoneyDisplay';

interface CartItemComponentProps {
    item: {
        productId: string | number;
        productName: string;
        priceInCents: number;
        itemCount: number;
    };
    isLoading: boolean;
    handleQuantityChange: (productId: any, newCount: number) => void;
    handleRemoveItem: (productId: any) => void;
}

export default function CartItemComponent({
                                              item,
                                              isLoading,
                                              handleQuantityChange,
                                              handleRemoveItem,
                                          }: CartItemComponentProps) { // 💡 Kytketään tyypit käyttöön tässä
    return (
        <div className="checkout-cart-item">
            {/* Vasen puoli: Tuotteen nimi */}
            <span className="cart-item-name">{item.productName}</span>

            {/* Oikea puoli: Toiminnot ja hinta yhdessä divissä */}
            <div className="cart-item-actions">

                {/* 1. Kokonaishinta */}
                <MoneyDisplay amountInCents={item.priceInCents * item.itemCount}/>

                {/* 2. Määrävalitsin vaakarivissä */}
                <div className="quantity-controls">
                    <button
                        type="button"
                        className="micro-btn"
                        disabled={item.itemCount <= 1 || isLoading}
                        onClick={() => handleQuantityChange(item.productId, item.itemCount - 1)}
                    >
                        -
                    </button>
                    {item.itemCount}
                    <button
                        type="button"
                        className="micro-btn"
                        disabled={isLoading}
                        onClick={() => handleQuantityChange(item.productId, item.itemCount + 1)}
                    >
                        +
                    </button>
                </div>

                {/* 3. Poistonappi */}
                <button
                    type="button"
                    disabled={isLoading}
                    onClick={() => handleRemoveItem(item.productId)}
                    className="remove-icon-btn"
                    aria-label="Remove item"
                >
                    <svg xmlns="http://w3.org" width="16" height="16" viewBox="0 0 24 24" fill="none"
                         stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        <line x1="10" y1="11" x2="10" y2="17"></line>
                        <line x1="14" y1="11" x2="14" y2="17"></line>
                    </svg>
                </button>

            </div>
        </div>
    );
}
