const CART_STORAGE_KEY = 'pg-frontend-cart'

export interface CartItem {
  productId: number
  productName: string
  quantity: number
  priceInCents: number
}

export const cartService = {
  /**
   * Get all cart items from localStorage
   */
  getCartItems(): CartItem[] {
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY)
      return stored ? JSON.parse(stored) : []
    } catch {
      return []
    }
  },

  /**
   * Save cart items to localStorage
   */
  saveCartItems(items: CartItem[]): void {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items))
  },

  /**
   * Add item to cart (or update quantity if already exists)
   */
  addToCart(item: CartItem): void {
    const items = this.getCartItems()
    const existingIndex = items.findIndex((i) => i.productId === item.productId)

    if (existingIndex >= 0) {
      items[existingIndex].quantity += item.quantity
    } else {
      items.push(item)
    }

    this.saveCartItems(items)
  },

  /**
   * Update quantity of a specific item
   */
  updateQuantity(productId: number, quantity: number): void {
    const items = this.getCartItems()
    const index = items.findIndex((i) => i.productId === productId)

    if (index >= 0) {
      if (quantity <= 0) {
        items.splice(index, 1)
      } else {
        items[index].quantity = quantity
      }
      this.saveCartItems(items)
    }
  },

  /**
   * Remove item from cart
   */
  removeFromCart(productId: number): void {
    const items = this.getCartItems().filter((i) => i.productId !== productId)
    this.saveCartItems(items)
  },

  /**
   * Clear entire cart
   */
  clearCart(): void {
    localStorage.removeItem(CART_STORAGE_KEY)
  },

  /**
   * Get total cart value in cents
   */
  getTotalInCents(): number {
    return this.getCartItems().reduce((total, item) => total + item.priceInCents * item.quantity, 0)
  },

  /**
   * Get total item count
   */
  getItemCount(): number {
    return this.getCartItems().reduce((count, item) => count + item.quantity, 0)
  }
}
