import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
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
export interface StaticStoreContent {
    aboutPageCopy: string;
    heroText: string;
    heroBanner: string;
}
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
export interface UserProfile {
    name: string;
    email: string;
}
export enum Category {
    maleTshirts = "maleTshirts",
    femaleDresses = "femaleDresses",
    maleShirts = "maleShirts",
    kidsApparel = "kidsApparel"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addProduct(name: string, category: Category, description: string, price: number, sizes: Array<string>, stock: bigint, image: string): Promise<bigint>;
    addToCart(productId: bigint, size: string, quantity: bigint): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    clearCart(): Promise<void>;
    deleteProduct(id: bigint): Promise<void>;
    getAllOrders(): Promise<Array<Order>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCart(): Promise<Array<CartItem>>;
    getOrders(): Promise<Array<Order>>;
    getProductById(id: bigint): Promise<Product | null>;
    getProducts(): Promise<Array<Product>>;
    getProductsByCategory(c: Category): Promise<Array<Product>>;
    getStoreContent(): Promise<StaticStoreContent>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    initializeStore(): Promise<void>;
    isCallerAdmin(): Promise<boolean>;
    placeOrder(cartItems: Array<CartItem>, totalAmount: number): Promise<bigint>;
    removeFromCart(productId: bigint, size: string): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    updateProduct(id: bigint, name: string, category: Category, description: string, price: number, sizes: Array<string>, stock: bigint, image: string): Promise<void>;
    updateStoreContent(heroText: string, heroBanner: string, aboutPageCopy: string): Promise<void>;
}
