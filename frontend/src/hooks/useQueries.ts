import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { useInternetIdentity } from './useInternetIdentity';
import type { Product, CartItem, Order, StaticStoreContent, UserProfile, Category } from '../backend';
import { UserRole } from '../backend';

/* ─────────────────────────── Store Initialization ─────────────────────────── */

export function useInitializeStore() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.initializeStore();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

/* ─────────────────────────── Products ─────────────────────────── */

export function useGetProducts() {
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

// Alias for backwards compatibility
export const useProducts = useGetProducts;

export function useGetProductsByCategory(category: Category) {
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

// Alias for backwards compatibility
export const useProductsByCategory = useGetProductsByCategory;

export function useGetProductById(id: bigint | null) {
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

// Alias for backwards compatibility
export const useProductById = useGetProductById;

export function useAddProduct() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      name: string;
      category: Category;
      description: string;
      price: number;
      sizes: string[];
      stock: bigint;
      image: string;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addProduct(
        params.name,
        params.category,
        params.description,
        params.price,
        params.sizes,
        params.stock,
        params.image,
      );
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
    mutationFn: async (params: {
      id: bigint;
      name: string;
      category: Category;
      description: string;
      price: number;
      sizes: string[];
      stock: bigint;
      image: string;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateProduct(
        params.id,
        params.name,
        params.category,
        params.description,
        params.price,
        params.sizes,
        params.stock,
        params.image,
      );
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
      if (!actor) throw new Error('Actor not available');
      return actor.deleteProduct(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

/* ─────────────────────────── Cart ─────────────────────────── */

export function useGetCart() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();
  return useQuery<CartItem[]>({
    queryKey: ['cart'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getCart();
    },
    enabled: !!actor && !isFetching && !!identity,
  });
}

// Alias for backwards compatibility
export const useCart = useGetCart;

export function useAddToCart() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: { productId: bigint; size: string; quantity: bigint }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addToCart(params.productId, params.size, params.quantity);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });
}

export function useRemoveFromCart() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: { productId: bigint; size: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.removeFromCart(params.productId, params.size);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });
}

export function useClearCart() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.clearCart();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });
}

/* ─────────────────────────── Orders ─────────────────────────── */

export function useGetOrders() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();
  return useQuery<Order[]>({
    queryKey: ['orders'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getOrders();
    },
    enabled: !!actor && !isFetching && !!identity,
  });
}

// Alias for backwards compatibility
export const useOrders = useGetOrders;

export function useGetAllOrders() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();
  return useQuery<Order[]>({
    queryKey: ['allOrders'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllOrders();
    },
    enabled: !!actor && !isFetching && !!identity,
  });
}

export function usePlaceOrder() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: { cartItems: CartItem[]; totalAmount: number }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.placeOrder(params.cartItems, params.totalAmount);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });
}

/* ─────────────────────────── Store Content ─────────────────────────── */

export function useGetStoreContent() {
  const { actor, isFetching } = useActor();
  return useQuery<StaticStoreContent>({
    queryKey: ['storeContent'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getStoreContent();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useUpdateStoreContent() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: { heroText: string; heroBanner: string; aboutPageCopy: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateStoreContent(params.heroText, params.heroBanner, params.aboutPageCopy);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['storeContent'] });
    },
  });
}

/* ─────────────────────────── User Profile ─────────────────────────── */

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching && !!identity,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
      // Invalidate admin check — saving profile with admin email grants admin role
      queryClient.invalidateQueries({ queryKey: ['isCallerAdmin'] });
    },
  });
}

/* ─────────────────────────── Admin ─────────────────────────── */

export function useIsCallerAdmin() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();
  const isAuthenticated = !!identity && !identity.getPrincipal().isAnonymous();

  const query = useQuery<boolean>({
    queryKey: ['isCallerAdmin'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      const result = await actor.isCallerAdmin();
      return result;
    },
    // Only run when actor is fully ready (not fetching) and user is authenticated
    enabled: !!actor && !actorFetching && isAuthenticated,
    staleTime: 30_000,
    retry: false,
  });

  // isLoading is true only when the query is actively fetching for the first time
  // OR when the actor itself is still initializing
  const isLoading = actorFetching || (isAuthenticated && query.isLoading);

  // isFetched is true only when the actor is ready AND the query has completed at least once
  const isFetched = !actorFetching && !!actor && query.isFetched;

  return {
    ...query,
    isAdmin: query.data === true,
    isLoading,
    isFetched,
  };
}

/**
 * Allows the currently authenticated user to claim admin rights by assigning
 * themselves the admin role. This succeeds when no admin exists yet (first-time setup).
 */
export function useClaimInitialAdmin() {
  const { actor } = useActor();
  const { identity } = useInternetIdentity();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor not available');
      if (!identity) throw new Error('Not authenticated');
      const principal = identity.getPrincipal();
      return actor.assignCallerUserRole(principal, UserRole.admin);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['isCallerAdmin'] });
    },
  });
}
