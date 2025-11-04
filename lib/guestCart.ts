import { useCallback, useEffect, useState } from "react";
import type { Id } from "@/convex/_generated/dataModel";

export type GuestCartProductSnapshot = {
  productId: string;
  name: string;
  price: number;
  primaryImageUrl: string | null;
  inStock: number;
};

export type GuestCartItem = {
  productId: string;
  quantity: number;
  product: GuestCartProductSnapshot;
};

const STORAGE_KEY = "guest_cart_v1";
const EVENT_NAME = "guest-cart-changed";

const isBrowser = () => typeof window !== "undefined";

const readGuestCart = (): GuestCartItem[] => {
  if (!isBrowser()) {
    return [];
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter((item): item is GuestCartItem => {
      return (
        typeof item === "object" &&
        item !== null &&
        typeof item.productId === "string" &&
        typeof item.quantity === "number" &&
        typeof item.product === "object" &&
        item.product !== null &&
        typeof item.product.name === "string" &&
        typeof item.product.price === "number"
      );
    });
  } catch {
    return [];
  }
};

const writeGuestCart = (items: GuestCartItem[]) => {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  window.dispatchEvent(new Event(EVENT_NAME));
};

type ProductLike = {
  _id: string;
  name: string;
  price: number;
  primaryImageUrl?: string | null;
  inStock: number;
};

export const snapshotFromProduct = (
  product: ProductLike,
): GuestCartProductSnapshot => ({
  productId: product._id,
  name: product.name,
  price: product.price,
  primaryImageUrl: product.primaryImageUrl ?? null,
  inStock: product.inStock,
});

export const addGuestCartItem = (
  snapshot: GuestCartProductSnapshot,
  quantity: number,
) => {
  if (quantity <= 0 || !Number.isFinite(quantity)) {
    return;
  }

  const cart = readGuestCart();
  const existing = cart.find((item) => item.productId === snapshot.productId);
  if (existing) {
    const desired = existing.quantity + quantity;
    existing.quantity = Math.min(
      snapshot.inStock,
      Math.max(1, Math.floor(desired)),
    );
    existing.product = snapshot;
  } else {
    cart.push({
      productId: snapshot.productId,
      quantity: Math.min(snapshot.inStock, Math.max(1, Math.floor(quantity))),
      product: snapshot,
    });
  }

  writeGuestCart(cart);
};

export const setGuestCartQuantity = (productId: string, quantity: number) => {
  const cart = readGuestCart();
  const updated = cart
    .map((item) => {
      if (item.productId !== productId) {
        return item;
      }

      if (quantity <= 0 || !Number.isFinite(quantity)) {
        return null;
      }

      const clamped = Math.min(
        item.product.inStock,
        Math.max(1, Math.floor(quantity)),
      );

      return { ...item, quantity: clamped };
    })
    .filter((item): item is GuestCartItem => item !== null);

  writeGuestCart(updated);
};

export const removeGuestCartItem = (productId: string) => {
  const cart = readGuestCart().filter((item) => item.productId !== productId);
  writeGuestCart(cart);
};

export const clearGuestCart = () => {
  writeGuestCart([]);
};

export const useGuestCart = () => {
  const [items, setItems] = useState<GuestCartItem[]>([]);
  const [initialized, setInitialized] = useState(false);

  const refresh = useCallback(() => {
    setItems(readGuestCart());
    setInitialized(true);
  }, []);

  useEffect(() => {
    if (!isBrowser()) {
      return;
    }

    refresh();

    const handler = () => refresh();
    window.addEventListener(EVENT_NAME, handler);
    window.addEventListener("storage", handler);

    return () => {
      window.removeEventListener(EVENT_NAME, handler);
      window.removeEventListener("storage", handler);
    };
  }, [refresh]);

  const addItem = useCallback(
    (snapshot: GuestCartProductSnapshot, quantity: number) => {
      addGuestCartItem(snapshot, quantity);
    },
    [],
  );

  const setQuantity = useCallback((productId: string, quantity: number) => {
    setGuestCartQuantity(productId, quantity);
  }, []);

  const removeItem = useCallback((productId: string) => {
    removeGuestCartItem(productId);
  }, []);

  const clear = useCallback(() => {
    clearGuestCart();
  }, []);

  const totalCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce(
    (sum, item) => sum + item.quantity * item.product.price,
    0,
  );

  return {
    items,
    initialized,
    totalCount,
    totalPrice,
    addItem,
    setQuantity,
    removeItem,
    clear,
  };
};

export const mapGuestCartForImport = (items: GuestCartItem[]) =>
  items.map((item) => ({
    productId: item.productId as Id<"products">,
    quantity: item.quantity,
  }));
