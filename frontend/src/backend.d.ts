import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface CartItem {
    size: string;
    productId: bigint;
    quantity: bigint;
}
export interface Order {
    id: bigint;
    status: string;
    userId: string;
    totalAmount: number;
    timestamp: bigint;
    items: Array<CartItem>;
}
export interface Product {
    id: bigint;
    name: string;
    description: string;
    sizes: Array<string>;
    stock: bigint;
    category: Category;
    image: string;
    price: number;
}
export enum Category {
    maleTshirts = "maleTshirts",
    femaleDresses = "femaleDresses",
    maleShirts = "maleShirts",
    kidsApparel = "kidsApparel"
}
export interface backendInterface {
    addProduct(name: string, category: Category, description: string, price: number, sizes: Array<string>, stock: bigint, image: string): Promise<bigint>;
    addToCart(userId: string, productId: bigint, size: string, quantity: bigint): Promise<void>;
    clearCart(userId: string): Promise<void>;
    deleteProduct(id: bigint): Promise<void>;
    getCart(userId: string): Promise<Array<CartItem>>;
    getOrders(userId: string): Promise<Array<Order>>;
    getProductById(id: bigint): Promise<Product | null>;
    getProducts(): Promise<Array<Product>>;
    getProductsByCategory(c: Category): Promise<Array<Product>>;
    initializeStore(): Promise<void>;
    placeOrder(userId: string, cartItems: Array<CartItem>, totalAmount: number): Promise<bigint>;
    removeFromCart(userId: string, productId: bigint, size: string): Promise<void>;
    updateProduct(id: bigint, name: string, category: Category, description: string, price: number, sizes: Array<string>, stock: bigint, image: string): Promise<void>;
}
