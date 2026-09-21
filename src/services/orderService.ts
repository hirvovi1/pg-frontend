export enum OrderStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED'
}

export interface OrderItem {
  id?: number
  itemCount: number
  productId: number
}

export interface Order {
  id?: number
  productId: number
  orderPlaced?: string
  quantity: number
  status: string
  items: OrderItem[]
}

const ORDER_API_BASE = 'http://localhost:8091/api/v1/frontend/orders'

export const orderService = {
  /**
   * Get all orders
   */
  async getOrders(): Promise<Order[]> {
    const response = await fetch(ORDER_API_BASE)
    
    if (!response.ok) {
      throw new Error(`Order service failed with status ${response.status}`)
    }
    
    return response.json()
  },

  /**
   * Get orders for a specific product
   */
  async getOrdersForProduct(productId: number): Promise<Order[]> {
    const response = await fetch(`${ORDER_API_BASE}/product/${productId}`)
    
    if (!response.ok) {
      throw new Error(`Order service failed with status ${response.status}`)
    }
    
    return response.json()
  },

  /**
   * Get order by ID
   */
  async getOrderById(id: number): Promise<Order> {
    const response = await fetch(`${ORDER_API_BASE}/${id}`)
    
    if (!response.ok) {
      throw new Error(`Order service failed with status ${response.status}`)
    }
    
    return response.json()
  },

  /**
   * Add a new order
   */
  async addOrder(order: Order): Promise<Order> {
    const response = await fetch(ORDER_API_BASE, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(order)
    })
    
    if (!response.ok) {
      throw new Error(`Order service failed with status ${response.status}`)
    }
    
    return response.json()
  },

  /**
   * Cancel an order
   */
  async cancel(id: number): Promise<Order> {
    const response = await fetch(`${ORDER_API_BASE}/${id}/cancel`, {
      method: 'PUT'
    })
    
    if (!response.ok) {
      throw new Error(`Order service failed with status ${response.status}`)
    }
    
    return response.json()
  },

  /**
   * Pay for an order
   */
  async pay(id: number): Promise<Order> {
    const response = await fetch(`${ORDER_API_BASE}/${id}/pay`, {
      method: 'PUT'
    })
    
    if (!response.ok) {
      throw new Error(`Order service failed with status ${response.status}`)
    }
    
    return response.json()
  },

  /**
   * Check if a product has open orders (PENDING or CONFIRMED)
   */
  async productHasOpenOrders(productId: number): Promise<boolean> {
    const response = await fetch(`${ORDER_API_BASE}/product/${productId}/has-open-orders`)
    
    if (!response.ok) {
      throw new Error(`Order service failed with status ${response.status}`)
    }
    
    return response.json()
  }
}
