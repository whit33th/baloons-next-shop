"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";
import { Header } from "../../components/Containers/Header";
import { useRouter } from "next/navigation";

export default function CheckoutPage() {
  const router = useRouter();
  const cartItems = useQuery(api.cart.list);
  const cartTotal = useQuery(api.cart.getTotal);
  const createOrder = useMutation(api.orders.create);
  const user = useQuery(api.auth.loggedInUser);

  const [formData, setFormData] = useState({
    customerName: "",
    customerEmail: user?.email || "",
    shippingAddress: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.customerName ||
      !formData.customerEmail ||
      !formData.shippingAddress
    ) {
      toast.error("Please fill in all fields");
      return;
    }

    setIsSubmitting(true);
    try {
      const orderId = await createOrder(formData);
      toast.success("Order placed successfully!");
      router.push(`/order-confirmation/${orderId}`);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to place order",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (cartItems === undefined || cartTotal === undefined) {
    return (
      <div className="min-h-screen bg-linear-to-br from-blue-50 to-purple-50">
        <div className="mx-auto max-w-4xl">
          <div className="animate-pulse rounded-xl bg-white p-8 shadow-sm">
            <div className="mb-6 h-8 rounded bg-gray-200"></div>
            <div className="grid gap-8 md:grid-cols-2">
              <div className="space-y-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-12 rounded bg-gray-200"></div>
                ))}
              </div>
              <div className="h-64 rounded bg-gray-200"></div>
            </div>
          </div>
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
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => router.push("/cart")}
                  className="text-gray-600 transition-colors hover:text-gray-800"
                >
                  ← Back to Cart
                </button>
                <h2 className="text-2xl font-bold text-gray-800">Checkout</h2>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              <div className="grid gap-8 md:grid-cols-2">
                <div>
                  <h3 className="mb-4 text-lg font-semibold text-gray-800">
                    Shipping Information
                  </h3>

                  <div className="space-y-4">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={formData.customerName}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            customerName: e.target.value,
                          })
                        }
                        className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-transparent focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={formData.customerEmail}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            customerEmail: e.target.value,
                          })
                        }
                        className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-transparent focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        Shipping Address
                      </label>
                      <textarea
                        value={formData.shippingAddress}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            shippingAddress: e.target.value,
                          })
                        }
                        rows={4}
                        className="w-full resize-none rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-transparent focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter your full address including street, city, state, and zip code"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="mb-4 text-lg font-semibold text-gray-800">
                    Order Summary
                  </h3>

                  <div className="space-y-3 rounded-lg bg-gray-50 p-4">
                    {cartItems?.map((item) => (
                      <div
                        key={item._id}
                        className="flex items-center justify-between"
                      >
                        <div>
                          <p className="font-medium text-gray-800">
                            {item.product.name}
                          </p>
                          <p className="text-sm text-gray-600">
                            Qty: {item.quantity}
                          </p>
                        </div>
                        <p className="font-semibold">
                          ${(item.product.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    ))}

                    <div className="mt-3 border-t border-gray-200 pt-3">
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-semibold text-gray-800">
                          Total:
                        </span>
                        <span className="text-xl font-bold text-gray-800">
                          ${cartTotal.total.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 rounded-lg bg-blue-50 p-4">
                    <h4 className="mb-2 font-semibold text-blue-800">
                      Payment Information
                    </h4>
                    <p className="text-sm text-blue-700">
                      This is a demo store. No actual payment will be processed.
                      Your order will be confirmed immediately upon submission.
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="mt-6 w-full rounded-lg bg-blue-600 py-3 font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-400"
                  >
                    {isSubmitting ? "Placing Order..." : "Place Order"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
