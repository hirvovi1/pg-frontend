import type {Order} from "./orderService.ts";


export interface CartItem {
    productId: number,
    productName: string,
    itemCount: number,
    priceInCents: number
}

export interface Cart {
    id: number,
    cartCreated: string,
    status: string,
    items: CartItem[]
}

const CART_API_BASE = "http://localhost:8091/api/v1/frontend/carts";

export const cartService = {

    async getCart(id: number): Promise<Cart> {
        console.info("getting cart id: ", id)
        const response = await fetch(`${CART_API_BASE}/${id}`);


        if (!response.ok) {
            throw new Error(`Cart service failed with status ${response.status}`);
        }
        console.info("got valid response,")
        return response.json();
    },

    async getCartItems(id: number): Promise<CartItem[]> {
        const cart: Cart = await this.getCart(id);
        return cart.items;
    },

    async saveCart(cart: Cart): Promise<Cart> {

        console.info("saveCart: ", JSON.stringify(cart));
        const response = await fetch(CART_API_BASE, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(cart),
        });

        if (!response.ok) {
            throw new Error(`Cart service failed with status ${response.status}`);
        }

        return response.json();
    },

    async addToCart(id: number, item: CartItem): Promise<void> {
        const cart: Cart = await this.getCart(id);
        console.info("addToCart: ", cart);
        console.info("items: : ", cart.items);

        const updatedCart: Cart = {
            ...cart,
            items: [...cart.items, item],
        };
        await this.saveCart(updatedCart);
        window.dispatchEvent(new Event("cart-updated"));
    },

    async updateQuantity(id: number, productId: number, quantity: number): Promise<void> {
        const cart: Cart = await this.getCart(id);
        const updatedItems: CartItem[] = this.getUpdatedItems(quantity, productId, cart.items);
        const updatedCart: Cart = {
            ...cart,
            items: updatedItems,
        };

        await this.saveCart(updatedCart);
        window.dispatchEvent(new Event('cart-updated'));
    },

    getUpdatedItems(quantity: number, productId: number, items: CartItem[]): CartItem[] {
        return quantity <= 0
            ? items.filter((item: CartItem) => item.productId !== productId)
            : items.map((item: CartItem) =>
                item.productId === productId
                    ? {...item, itemCount: quantity} // 00_KORJAUS_00: muutettu quantity -> itemCount
                    : item
            );
    },


    async removeFromCart(id: number, productId: number): Promise<void> {
        const cart: Cart = await this.getCart(id);
        const filteredItems = cart.items.filter((i) => i.productId !== productId)
        const updatedCart: Cart = {
            ...cart,
            items: filteredItems,
        };
        await this.saveCart(updatedCart);
        window.dispatchEvent(new Event('cart-updated'))
    },

    async getTotalInCents(id: number): Promise<number> {
        const response = await fetch(`${CART_API_BASE}/${id}/carttotal`);
        if (!response.ok) {
            throw new Error(`Cart service failed with status ${response.status}`);
        }
        return response.json();
    },

    async getItemCount(id: number): Promise<number> {
        const response = await fetch(`${CART_API_BASE}/${id}/itemcount`);
        if (!response.ok) {
            throw new Error(`Cart service failed with status ${response.status}`);
        }
        return response.json();
    },

    async createCart(): Promise<number> {

        const response = await fetch(`${CART_API_BASE}/create`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: "",
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Cart service failed with status ${response.status} -> ${errorText}`);
        }
        const cart: Cart = await response.json();
        return cart.id;
    },
};
