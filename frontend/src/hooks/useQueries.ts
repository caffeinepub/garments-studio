import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { useInternetIdentity } from './useInternetIdentity';
import { Category, type Product, type CartItem, type Order, type StaticStoreContent, type UserProfile } from '../backend';

// ─── Store Initialization ────────────────────────────────────────────────────
export function useInitializeStore() {
  const { actor } = useActor();
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
    queryKey: ['cart'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getCart();
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
      await actor.addToCart(productId, size, quantity);
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
    mutationFn: async ({ productId, size }: { productId: bigint; size: string }) => {
      if (!actor) throw new Error('Actor not ready');
      await actor.removeFromCart(productId, size);
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
      if (!actor) throw new Error('Actor not ready');
      await actor.clearCart();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
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
      const orderId = await actor.placeOrder(cartItems, totalAmount);
      return orderId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
}

export function useOrders() {
  const { actor, isFetching } = useActor();
  return useQuery<Order[]>({
    queryKey: ['orders'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getOrders();
    },
    enabled: !!actor && !isFetching,
  });
}

// ─── Store Content ───────────────────────────────────────────────────────────
export function useGetStoreContent() {
  const { actor, isFetching } = useActor();
  return useQuery<StaticStoreContent>({
    queryKey: ['storeContent'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not ready');
      return actor.getStoreContent();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useUpdateStoreContent() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      heroText,
      heroBanner,
      aboutPageCopy,
    }: {
      heroText: string;
      heroBanner: string;
      aboutPageCopy: string;
    }) => {
      if (!actor) throw new Error('Actor not ready');
      await actor.updateStoreContent(heroText, heroBanner, aboutPageCopy);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['storeContent'] });
    },
  });
}

// ─── User Profile ─────────────────────────────────────────────────────────────
export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

// ─── Admin Role Check ─────────────────────────────────────────────────────────
export function useIsCallerAdmin() {
  const { actor } = useActor();
  const { identity } = useInternetIdentity();

  // Only check admin status when the user is authenticated with a non-anonymous identity
  const isAuthenticated = !!identity && !identity.getPrincipal().isAnonymous();
  const principalStr = identity?.getPrincipal().toString() ?? 'anonymous';

  const query = useQuery<boolean>({
    // Include principal in query key so the query re-runs when identity changes
    queryKey: ['isCallerAdmin', principalStr],
    queryFn: async () => {
      if (!actor) return false;
      try {
        return await actor.isCallerAdmin();
      } catch {
        return false;
      }
    },
    // Only gate on actor availability and authentication — do NOT gate on actorFetching
    // because useActor's useEffect fires refetchQueries after the actor is ready,
    // and gating on isFetching causes the refetch to be ignored (disabled queries skip refetch).
    enabled: !!actor && isAuthenticated,
    retry: false,
    staleTime: 0, // Always re-fetch when invalidated so login triggers a fresh check
  });

  return {
    ...query,
    data: isAuthenticated ? query.data : false,
    isLoading: !isAuthenticated ? false : query.isLoading || query.isFetching,
  };
}
