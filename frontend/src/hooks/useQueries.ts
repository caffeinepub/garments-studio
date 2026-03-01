import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { Category, type Product, type CartItem, type Order } from '../backend';

// ─── User ID ────────────────────────────────────────────────────────────────
const getUserId = (): string => {
  let id = localStorage.getItem('studio_user_id');
  if (!id) {
    id = `user_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    localStorage.setItem('studio_user_id', id);
  }
  return id;
};

export const USER_ID = getUserId();

// ─── Store Initialization ────────────────────────────────────────────────────
export function useInitializeStore() {
  const { actor, isFetching } = useActor();
  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor not ready');
      await actor.initializeStore();
    },
  });
}

// ─── Products ────────────────────────────────────────────────────────────────
export function useProducts() {
  const { actor, isFetching } = useActor();
  return useQuery<Product[]>({
    queryKey: ['products'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getProducts();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useProductsByCategory(category: Category) {
  const { actor, isFetching } = useActor();
  return useQuery<Product[]>({
    queryKey: ['products', 'category', category],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getProductsByCategory(category);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useProductById(id: bigint | null) {
  const { actor, isFetching } = useActor();
  return useQuery<Product | null>({
    queryKey: ['product', id?.toString()],
    queryFn: async () => {
      if (!actor || id === null) return null;
      return actor.getProductById(id);
    },
    enabled: !!actor && !isFetching && id !== null,
  });
}

// ─── Admin Product Mutations ─────────────────────────────────────────────────
export function useAddProduct() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      name,
      category,
      description,
      price,
      sizes,
      stock,
      image,
    }: {
      name: string;
      category: Category;
      description: string;
      price: number;
      sizes: string[];
      stock: bigint;
      image: string;
    }) => {
      if (!actor) throw new Error('Actor not ready');
      return actor.addProduct(name, category, description, price, sizes, stock, image);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

export function useUpdateProduct() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      name,
      category,
      description,
      price,
      sizes,
      stock,
      image,
    }: {
      id: bigint;
      name: string;
      category: Category;
      description: string;
      price: number;
      sizes: string[];
      stock: bigint;
      image: string;
    }) => {
      if (!actor) throw new Error('Actor not ready');
      return actor.updateProduct(id, name, category, description, price, sizes, stock, image);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

export function useDeleteProduct() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error('Actor not ready');
      return actor.deleteProduct(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

// ─── Cart ────────────────────────────────────────────────────────────────────
export function useCart() {
  const { actor, isFetching } = useActor();
  return useQuery<CartItem[]>({
    queryKey: ['cart', USER_ID],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getCart(USER_ID);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddToCart() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      productId,
      size,
      quantity,
    }: {
      productId: bigint;
      size: string;
      quantity: bigint;
    }) => {
      if (!actor) throw new Error('Actor not ready');
      await actor.addToCart(USER_ID, productId, size, quantity);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart', USER_ID] });
    },
  });
}

export function useRemoveFromCart() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ productId, size }: { productId: bigint; size: string }) => {
      if (!actor) throw new Error('Actor not ready');
      await actor.removeFromCart(USER_ID, productId, size);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart', USER_ID] });
    },
  });
}

export function useClearCart() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor not ready');
      await actor.clearCart(USER_ID);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart', USER_ID] });
    },
  });
}

// ─── Orders ──────────────────────────────────────────────────────────────────
export function usePlaceOrder() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      cartItems,
      totalAmount,
    }: {
      cartItems: CartItem[];
      totalAmount: number;
    }) => {
      if (!actor) throw new Error('Actor not ready');
      const orderId = await actor.placeOrder(USER_ID, cartItems, totalAmount);
      return orderId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart', USER_ID] });
      queryClient.invalidateQueries({ queryKey: ['orders', USER_ID] });
    },
  });
}

export function useOrders() {
  const { actor, isFetching } = useActor();
  return useQuery<Order[]>({
    queryKey: ['orders', USER_ID],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getOrders(USER_ID);
    },
    enabled: !!actor && !isFetching,
  });
}
