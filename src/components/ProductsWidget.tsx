import type { Product } from "../services/productService";
import { MoneyDisplay } from "./MoneyDisplay";

interface ProductsWidgetProps {
  products: Product[];
  isLoading: boolean;
  onAddToCart?: (productId: number) => void;
}

export function ProductsWidget({
  products,
  isLoading,
  onAddToCart,
}: ProductsWidgetProps) {
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
                {onAddToCart && product.id && (
                  <button
                    className="add-to-cart-button"
                    type="button"
                    onClick={() => void onAddToCart(product.id!)}
                  >
                    Add to cart
                  </button>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
