"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useGuestCart, type GuestCartItem } from "../../lib/guestCart";

export default function CartPage() {
  const router = useRouter();
  const user = useQuery(api.auth.loggedInUser);
  const cartItems = useQuery(api.cart.list);
  const cartTotal = useQuery(api.cart.getTotal);
  const updateQuantity = useMutation(api.cart.updateQuantity);
  const removeItem = useMutation(api.cart.remove);
  const {
    items: guestItems,
    totalCount: guestItemCount,
    totalPrice: guestTotal,
    setQuantity: setGuestQuantity,
    removeItem: removeGuestItem,
    initialized: guestInitialized,
  } = useGuestCart();

  type ServerCartItem = NonNullable<typeof cartItems>[number];
  type GuestCartDisplayItem = {
    _id: string;
    quantity: number;
    product: GuestCartItem["product"];
  };

  type DisplayCartItem = ServerCartItem | GuestCartDisplayItem;

  const isAuthenticated = Boolean(user);

  const isLoading = isAuthenticated
    ? cartItems === undefined || cartTotal === undefined
    : !guestInitialized;

  const itemsToDisplay: DisplayCartItem[] = isAuthenticated
    ? (cartItems ?? [])
    : guestItems.map((item) => ({
        _id: item.productId,
        quantity: item.quantity,
        product: item.product,
      }));

  const totals = isAuthenticated
    ? (cartTotal ?? { total: 0, itemCount: 0 })
    : { total: guestTotal, itemCount: guestItemCount };

  const handleQuantityChange = async (
    item: DisplayCartItem,
    quantity: number,
  ) => {
    if (isAuthenticated) {
      try {
        await updateQuantity({ itemId: item._id as any, quantity });
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Failed to update quantity",
        );
      }
      return;
    }

    if (quantity <= 0) {
      removeGuestItem(item._id);
      toast.success("Item removed from cart");
      return;
    }

    if (quantity > item.product.inStock) {
      toast.error("Not enough items in stock");
      return;
    }

    setGuestQuantity(item._id, quantity);
  };

  const handleRemoveItem = async (item: DisplayCartItem) => {
    if (isAuthenticated) {
      try {
        await removeItem({ itemId: item._id as any });
        toast.success("Item removed from cart");
      } catch (error) {
        toast.error("Failed to remove item");
      }
      return;
    }

    removeGuestItem(item._id);
    toast.success("Item removed from cart");
  };

  const handleCheckout = () => {
    if (!isAuthenticated) {
      toast.info("Please sign in to continue to checkout.");
      router.push("/auth");
      return;
    }
    router.push("/checkout");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-blue-50 to-purple-50">
        <div className="mx-auto max-w-4xl">
          <div className="animate-pulse rounded-xl bg-white p-8 shadow-sm">
            <div className="mb-6 h-8 rounded bg-gray-200"></div>
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-24 rounded bg-gray-200"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (itemsToDisplay.length === 0) {
    return (
      <div className="min-h-screen bg-linear-to-br from-blue-50 to-purple-50">
        <div className="mx-auto max-w-4xl py-16 text-center">
          <div className="mb-4 text-6xl">🛒</div>
          <h2 className="mb-2 text-2xl font-bold text-gray-800">
            Your cart is empty
          </h2>
          <p className="mb-8 text-gray-600">
            Add some beautiful balloons to get started!
          </p>
          <button
            onClick={() => router.push("/")}
            className="rounded-lg bg-blue-600 px-6 py-3 text-white transition-colors hover:bg-blue-700"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-purple-50">
      <main className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-4xl">
          <div className="overflow-hidden rounded-xl bg-white shadow-sm">
            <div className="border-b border-gray-200 p-6">
              <h2 className="text-2xl font-bold text-gray-800">
                Shopping Cart
              </h2>
              <p className="text-gray-600">{totals.itemCount} items</p>
            </div>

            <div className="divide-y divide-gray-200">
              {itemsToDisplay.map((item) => (
                <div key={item._id} className="flex items-center space-x-4 p-6">
                  <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-lg bg-linear-to-br from-gray-100 to-gray-200">
                    {item.product.primaryImageUrl ? (
                      <img
                        src={item.product.primaryImageUrl}
                        alt={item.product.name}
                        className="h-full w-full rounded-lg object-cover"
                      />
                    ) : (
                      <div className="text-2xl">
                        {item.product.shape === "heart"
                          ? "💖"
                          : item.product.shape === "star"
                            ? "⭐"
                            : item.product.shape === "animal"
                              ? "🐶"
                              : "🎈"}
                      </div>
                    )}
                  </div>

                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800">
                      {item.product.name}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {item.product.color} • {item.product.size} •{" "}
                      {item.product.shape}
                    </p>
                    <p className="text-lg font-bold text-gray-800">
                      ${item.product.price}
                    </p>
                  </div>

                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() =>
                        void handleQuantityChange(item, item.quantity - 1)
                      }
                      className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 transition-colors hover:bg-gray-300"
                    >
                      -
                    </button>
                    <span className="w-8 text-center font-semibold">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() =>
                        void handleQuantityChange(item, item.quantity + 1)
                      }
                      className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 transition-colors hover:bg-gray-300"
                    >
                      +
                    </button>
                  </div>

                  <div className="text-right">
                    <p className="text-lg font-bold">
                      ${(item.product.price * item.quantity).toFixed(2)}
                    </p>
                    <button
                      onClick={() => void handleRemoveItem(item)}
                      className="text-sm text-red-500 transition-colors hover:text-red-700"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-200 bg-gray-50 p-6">
              <div className="mb-4 flex items-center justify-between">
                <span className="text-xl font-semibold text-gray-800">
                  Total:
                </span>
                <span className="text-2xl font-bold text-gray-800">
                  ${totals.total.toFixed(2)}
                </span>
              </div>
              <button
                onClick={handleCheckout}
                className="w-full rounded-lg bg-blue-600 py-3 font-semibold text-white transition-colors hover:bg-blue-700"
              >
                Proceed to Checkout
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
