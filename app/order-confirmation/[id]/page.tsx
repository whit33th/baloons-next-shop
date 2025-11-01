"use client";

import { useQuery } from "convex/react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/convex/_generated/api";

export default function OrderConfirmationPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;

  const order = useQuery(api.orders.get, { id: orderId as any });

  const handleContinueShopping = () => {
    router.push("/");
  };

  if (order === undefined) {
    return (
      <div className="min-h-screen bg-linear-to-br from-blue-50 to-purple-50">
        <div className="mx-auto max-w-2xl">
          <div className="animate-pulse rounded-xl bg-white p-8 shadow-sm">
            <div className="mb-6 h-8 rounded bg-gray-200"></div>
            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-4 rounded bg-gray-200"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-linear-to-br from-blue-50 to-purple-50">
        <div className="mx-auto max-w-2xl py-16 text-center">
          <div className="mb-4 text-6xl">❌</div>
          <h2 className="mb-2 text-2xl font-bold text-gray-800">
            Order not found
          </h2>
          <p className="text-gray-600">
            The order you're looking for doesn't exist.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-purple-50">
      <main className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-2xl">
          <div className="overflow-hidden rounded-xl bg-white shadow-sm">
            <div className="bg-green-50 p-8 text-center">
              <div className="mb-4 text-6xl">✅</div>
              <h2 className="mb-2 text-3xl font-bold text-gray-800">
                Order Confirmed!
              </h2>
              <p className="text-gray-600">
                Thank you for your purchase. Your balloons are on their way!
              </p>
            </div>

            <div className="p-6">
              <div className="mb-6">
                <h3 className="mb-3 text-lg font-semibold text-gray-800">
                  Order Details
                </h3>
                <div className="space-y-2 rounded-lg bg-gray-50 p-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Order ID:</span>
                    <span className="font-mono text-sm">{order._id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <span className="font-semibold text-green-600 capitalize">
                      {order.status}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total:</span>
                    <span className="font-bold">
                      ${order.totalAmount.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="mb-3 text-lg font-semibold text-gray-800">
                  Items Ordered
                </h3>
                <div className="space-y-3">
                  {order.items.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between rounded-lg bg-gray-50 p-3"
                    >
                      <div>
                        <p className="font-medium text-gray-800">
                          {item.productName}
                        </p>
                        <p className="text-sm text-gray-600">
                          Quantity: {item.quantity}
                        </p>
                      </div>
                      <p className="font-semibold">
                        ${(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <h3 className="mb-3 text-lg font-semibold text-gray-800">
                  Shipping Information
                </h3>
                <div className="rounded-lg bg-gray-50 p-4">
                  <p className="font-medium text-gray-800">
                    {order.customerName}
                  </p>
                  <p className="text-gray-600">{order.customerEmail}</p>
                  <p className="mt-2 whitespace-pre-line text-gray-600">
                    {order.shippingAddress}
                  </p>
                </div>
              </div>

              <div className="text-center">
                <button
                  onClick={handleContinueShopping}
                  className="rounded-lg bg-blue-600 px-8 py-3 font-semibold text-white transition-colors hover:bg-blue-700"
                >
                  Continue Shopping
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
