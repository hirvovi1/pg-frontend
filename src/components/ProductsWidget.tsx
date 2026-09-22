import { useState } from "react";
import type { Product } from "../services/productService";
import { cartService } from "../services/cartService";
import { MoneyDisplay } from "./MoneyDisplay";

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
          {products.map((product) => (
            <article className="product-card" key={product.id ?? product.name}>
              {product.imageUrl && (
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="product-image"
                />
              )}
              <div className="product-card-content">
                <h3>{product.name}</h3>
                <p className="product-description">{product.description}</p>
                <p className="product-price">
                  <MoneyDisplay amountInCents={product.price} />
                </p>
                <div className="product-actions">
                  <div className="quantity-selector">
                    <label htmlFor={`quantity-${product.id}`}>Qty:</label>
                    <input
                      id={`quantity-${product.id}`}
                      type="number"
                      min="1"
                      value={quantities[product.id!] || 1}
                      onChange={(e) => handleQuantityChange(product.id!, Number(e.target.value))}
                      className="quantity-input"
                    />
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
          ))}
        </div>
      )}
    </section>
  );
}
