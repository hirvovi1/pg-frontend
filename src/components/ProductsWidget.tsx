import { useState } from "react";
import type { Product } from "../services/productService";
import { cartService } from "../services/cartService";
import { MoneyDisplay } from "./MoneyDisplay";
import "./ProductsWidget.css"; // <-- Tuodaan uudet tyylit sisään!

interface ProductsWidgetProps {
  products: Product[];
  isLoading: boolean;
}

export function ProductsWidget({
                                 products,
                                 isLoading,
                               }: ProductsWidgetProps) {
  const [quantities, setQuantities] = useState<Record<number, number>>({});

  const handleQuantityChange = (productId: number, quantity: number) => {
    setQuantities((prev) => ({ ...prev, [productId]: Math.max(1, quantity) }));
  };

  const handleAddToCart = (product: Product) => {
    const quantity = quantities[product.id!] || 1;
    if (product.id) {
      cartService.addToCart({
        productId: product.id,
        productName: product.name,
        quantity,
        priceInCents: product.price,
      });
      console.info("[ProductsWidget] Added to cart", { productId: product.id, quantity });

      // Nollataan määrä takaisin ykköseen onnistuneen lisäyksen jälkeen feng shuin vuoksi
      setQuantities((prev) => ({ ...prev, [product.id!]: 1 }));
    }
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
                    <MoneyDisplay amountInCents={product.price} />
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
                        className="add-to-cart-button"
                        type="button"
                        onClick={() => handleAddToCart(product)}
                      >
                        Add to cart
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
