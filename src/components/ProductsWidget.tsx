import { useState } from "react";
import type { Product } from "../services/productService";
import { cartService } from "../services/cartService";
import { MoneyDisplay } from "./MoneyDisplay";
import "./ProductsWidget.css";
import { assertNonNull } from '../utils/asserts';

interface ProductsWidgetProps {
  cartId: number | null;
  products: Product[];
  isLoading: boolean;
}

export function ProductsWidget({
                                 cartId,
                                 products,
                                 isLoading,
                               }: ProductsWidgetProps) {
  const [quantities, setQuantities] = useState<Record<number, number>>({});
  const [addedProductId, setAddedProductId] = useState<number | null>(null);

  const handleAddToCart = (product: Product) => {

    assertNonNull(product.id, "Tuotteelta puuttuu ID!");
    const quantity: number = quantities[product.id] ?? 1;

    if (product.id && cartId) {
      cartService.addToCart(cartId, {
        productId: product.id,
        productName: product.name,
        itemCount: quantity,
        priceInCents: product.priceInCents,
      });
      console.info("[ProductsWidget] Added to cart", { productId: product.id, quantity });

      setAddedProductId(product.id);
      setQuantities((prev) => ({ ...prev, [product.id!]: 1 }));
      setTimeout(() => {
        setAddedProductId(null);
      }, 1200);
    }
  };

  const handleQuantityChange = (productId: number, quantity: number) => {
    setQuantities((prev) => ({ ...prev, [productId]: Math.max(1, quantity) }));
  };

  return (
    <section className="products-section products-widget" aria-labelledby="products-title">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Shop</p>
          <h2 id="products-title">Products</h2>
        </div>
        <span className="product-count">
          {products.length} {products.length === 1 ? "product" : "products"}
        </span>
      </div>

      {isLoading ? (
        <p className="empty-state">Loading products...</p>
      ) : products.length === 0 ? (
        <p className="empty-state">No products available.</p>
      ) : (
        <div className="product-grid">
          {products.map((product) => {
            const currentQty = quantities[product.id!] || 1;

            return (
              <article className="product-card" key={product.id ?? product.name}>
                <div className="product-card-content">
                  <h3>{product.name}</h3>
                  <p className="product-description">{product.description}</p>
                </div>

                <div className="product-right-side">
                  <p className="product-price">
                    <MoneyDisplay amountInCents={product.priceInCents} />
                  </p>

                  <div className="product-actions">
                    <div className="product-quantity-selector">
                      <button
                        type="button"
                        className="product-micro-btn"
                        disabled={currentQty <= 1}
                        onClick={() => handleQuantityChange(product.id!, currentQty - 1)}
                      >
                        -
                      </button>
                      <span className="product-quantity-display">{currentQty}</span>
                      <button
                        type="button"
                        className="product-micro-btn"
                        onClick={() => handleQuantityChange(product.id!, currentQty + 1)}
                      >
                        +
                      </button>
                    </div>

                    {product.id && (
                      <button
                        className={`add-to-cart-button ${product.id === addedProductId ? 'success-pulse' : ''}`}
                        type="button"
                        disabled={product.id === addedProductId} // Lukitaan sekunniksi, ettei tule tuplaklikkauksia
                        onClick={() => handleAddToCart(product)}
                      >
                        {product.id === addedProductId ? 'Added! ✓' : 'Add to cart'}
                      </button>
                    )}

                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
