export type ProductStatus = 'ACTIVE' | 'ARCHIVED'

export interface Product {
  id?: number
  name: string
  description: string
  price: number
  imageUrl: string
  status: ProductStatus
}

const PRODUCT_API_BASE = 'http://localhost:8091/api/v1/frontend/products'

export const productService = {
  /**
   * Get all active products
   */
  async getProducts(): Promise<Product[]> {
    const response = await fetch(PRODUCT_API_BASE)
    
    if (!response.ok) {
      throw new Error(`Product service failed with status ${response.status}`)
    }
    
    return response.json()
  },

  /**
   * Get product by ID
   */
  async getProductById(id: number): Promise<Product> {
    const response = await fetch(`${PRODUCT_API_BASE}/${id}`)
    
    if (!response.ok) {
      throw new Error(`Product service failed with status ${response.status}`)
    }
    
    return response.json()
  },

  /**
   * Add a new product
   */
  async addProduct(product: Product): Promise<Product> {
    const response = await fetch(PRODUCT_API_BASE, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(product)
    })
    
    if (!response.ok) {
      throw new Error(`Product service failed with status ${response.status}`)
    }
    
    return response.json()
  },

  /**
   * Delete a product
   */
  async deleteProduct(id: number): Promise<void> {
    const response = await fetch(`${PRODUCT_API_BASE}/${id}`, {
      method: 'DELETE'
    })
    
    if (!response.ok) {
      throw new Error(`Product service failed with status ${response.status}`)
    }
  }
}
