"use client";

import { useMutation, useQuery } from "convex/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { api } from "../../convex/_generated/api";
import {
  getWhatsAppLink,
  PAYMENT_CONFIG,
  STORE_INFO,
  WHATSAPP_MESSAGES,
} from "../../lib/config";
import { useGuestCart } from "../../lib/guestCart";

type PaymentMethod = "full_online" | "partial_online" | "cash";
type DeliveryType = "pickup" | "delivery";

export default function CheckoutPage() {
  const router = useRouter();
  const user = useQuery(api.auth.loggedInUser);
  const isAuthenticated = Boolean(user);

  // Server cart
  const cartItems = useQuery(api.cart.list);
  const cartTotal = useQuery(api.cart.getTotal);
  const createOrder = useMutation(api.orders.create);
  const createGuestOrder = useMutation(api.orders.createGuest);

  // Guest cart
  const {
    items: guestItems,
    totalPrice: guestTotal,
    totalCount: guestItemCount,
    initialized: guestInitialized,
  } = useGuestCart();

  // Use appropriate cart based on authentication
  const itemsToDisplay = isAuthenticated ? cartItems : guestItems;
  const total = isAuthenticated ? (cartTotal?.total ?? 0) : guestTotal;

  // Helper to get item details regardless of cart type
  const getItemDetails = (item: any) => {
    if ("product" in item && item.product) {
      // Server cart item (authenticated)
      return {
        key: item._id,
        name: item.product.name,
        price: item.product.price,
        quantity: item.quantity,
      };
    } else {
      // Guest cart item
      return {
        key: item.productId,
        name: item.product?.name || "Unknown",
        price: item.product?.price || 0,
        quantity: item.quantity,
      };
    }
  };

  const [formData, setFormData] = useState({
    customerName: "",
    customerEmail: user?.email || "",
    shippingAddress: "",
  });

  const [deliveryType, setDeliveryType] = useState<DeliveryType>("pickup");
  const [paymentMethod, setPaymentMethod] =
    useState<PaymentMethod>("full_online");
  const [whatsappConfirmed, setWhatsappConfirmed] = useState(false);
  const [pickupDateTime, setPickupDateTime] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleWhatsAppConfirm = () => {
    const message = WHATSAPP_MESSAGES.orderConfirmation(
      formData.customerName,
      pickupDateTime,
    );
    const whatsappLink = getWhatsAppLink(message);
    window.open(whatsappLink, "_blank");
    setWhatsappConfirmed(true);
  };

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

    if (paymentMethod === "cash" && !whatsappConfirmed) {
      toast.error("Cash payment requires WhatsApp confirmation");
      return;
    }

    setIsSubmitting(true);
    try {
      let orderId;

      if (isAuthenticated) {
        // Authenticated user - use regular create
        orderId = await createOrder({
          ...formData,
          deliveryType,
          paymentMethod,
          whatsappConfirmed:
            paymentMethod === "cash" ? whatsappConfirmed : undefined,
          pickupDateTime:
            deliveryType === "pickup" ? pickupDateTime : undefined,
        });
      } else {
        // Guest user - use createGuest with items
        orderId = await createGuestOrder({
          ...formData,
          deliveryType,
          paymentMethod,
          whatsappConfirmed:
            paymentMethod === "cash" ? whatsappConfirmed : undefined,
          pickupDateTime:
            deliveryType === "pickup" ? pickupDateTime : undefined,
          items: guestItems.map((item) => ({
            productId: item.productId as any,
            quantity: item.quantity,
          })),
        });
      }

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

  // Show loading only for authenticated users waiting for cart data
  if (isAuthenticated && (cartItems === undefined || cartTotal === undefined)) {
    return (
      <div className="bg-primary min-h-screen">
        <div className="container mx-auto px-4 py-8">
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
      </div>
    );
  }

  // Show loading for guest users waiting for cart initialization
  if (!isAuthenticated && !guestInitialized) {
    return (
      <div className="bg-primary min-h-screen">
        <div className="container mx-auto px-4 py-8">
          <div className="mx-auto max-w-4xl">
            <div className="animate-pulse rounded-xl bg-white p-8 shadow-sm">
              <div className="mb-6 h-8 rounded bg-gray-200"></div>
              <div className="grid gap-8 md:grid-cols-2">
                <div className="space-y-4">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div
                      key={`guest-skeleton-${i}`}
                      className="h-12 rounded bg-gray-200"
                    ></div>
                  ))}
                </div>
                <div className="h-64 rounded bg-gray-200"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Check if cart is empty
  if (!itemsToDisplay || itemsToDisplay.length === 0) {
    return (
      <div className="bg-primary min-h-screen">
        <div className="container mx-auto px-4 py-8">
          <div className="mx-auto max-w-4xl">
            <div className="rounded-xl bg-white p-8 text-center shadow-sm">
              <h2 className="text-deep mb-4 text-2xl font-bold">
                Your cart is empty
              </h2>
              <p className="text-deep/70 mb-6">
                Add some balloons to your cart before checking out
              </p>
              <button
                onClick={() => router.push("/catalog")}
                className="btn-accent rounded-lg px-6 py-3 font-semibold"
              >
                Browse Catalog
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-primary min-h-screen">
      <main className="container mx-auto px-4 py-4 sm:py-8">
        <div className="mx-auto max-w-4xl">
          <div className="overflow-hidden rounded-xl bg-white shadow-sm">
            <div className="border-b p-4 sm:p-6">
              <div className="flex items-center space-x-3 sm:space-x-4">
                <button
                  onClick={() => router.push("/cart")}
                  className="text-deep text-sm transition-opacity hover:opacity-70 sm:text-base"
                >
                  ← Back
                </button>
                <h2 className="text-deep text-xl font-bold sm:text-2xl">
                  Checkout
                </h2>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-4 sm:p-6">
              <div className="grid gap-6 sm:gap-8 lg:grid-cols-2">
                {/* Left Column - Customer Info */}
                <div className="space-y-4 sm:space-y-6">
                  <div>
                    <h3 className="text-deep mb-3 text-base font-semibold sm:mb-4 sm:text-lg">
                      Contact Information
                    </h3>
                    <div className="space-y-3 sm:space-y-4">
                      <div>
                        <label className="text-deep mb-1.5 block text-xs font-medium sm:mb-2 sm:text-sm">
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
                          className="focus:border-secondary focus:ring-secondary/20 w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 sm:px-4 sm:py-3 sm:text-base"
                          required
                        />
                      </div>

                      <div>
                        <label className="text-deep mb-1.5 block text-xs font-medium sm:mb-2 sm:text-sm">
                          Email
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
                          className="focus:border-secondary focus:ring-secondary/20 w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 sm:px-4 sm:py-3 sm:text-base"
                          required
                        />
                      </div>

                      <div>
                        <label className="text-deep mb-1.5 block text-xs font-medium sm:mb-2 sm:text-sm">
                          Address
                        </label>
                        <textarea
                          value={formData.shippingAddress}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              shippingAddress: e.target.value,
                            })
                          }
                          rows={3}
                          className="focus:border-secondary focus:ring-secondary/20 w-full resize-none rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 sm:px-4 sm:py-3 sm:text-base"
                          placeholder="Enter your full address"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Delivery Type */}
                  <div>
                    <h3 className="text-deep mb-2 text-base font-semibold sm:mb-3 sm:text-lg">
                      Delivery Method
                    </h3>
                    <div className="space-y-2 sm:space-y-3">
                      <label className="hover:bg-primary flex cursor-pointer items-start space-x-2 rounded-lg border p-3 transition-colors sm:space-x-3 sm:p-4">
                        <input
                          type="radio"
                          name="deliveryType"
                          value="pickup"
                          checked={deliveryType === "pickup"}
                          onChange={(e) =>
                            setDeliveryType(e.target.value as DeliveryType)
                          }
                          className="text-secondary mt-0.5 h-4 w-4 shrink-0 sm:mt-1"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="text-deep text-sm font-medium sm:text-base">
                            Self-pickup
                          </div>
                          <div className="text-deep/70 text-xs sm:text-sm">
                            {STORE_INFO.address.street},{" "}
                            {STORE_INFO.address.postalCode}{" "}
                            {STORE_INFO.address.city}
                            <br />
                            Open 24/7
                          </div>
                        </div>
                      </label>
                      <label className="hover:bg-primary flex cursor-pointer items-start space-x-2 rounded-lg border p-3 transition-colors sm:space-x-3 sm:p-4">
                        <input
                          type="radio"
                          name="deliveryType"
                          value="delivery"
                          checked={deliveryType === "delivery"}
                          onChange={(e) =>
                            setDeliveryType(e.target.value as DeliveryType)
                          }
                          className="text-secondary mt-0.5 h-4 w-4 shrink-0 sm:mt-1"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="text-deep text-sm font-medium sm:text-base">
                            Delivery
                          </div>
                          <div className="text-deep/70 text-xs sm:text-sm">
                            Delivery to nearby cities{" "}
                            {STORE_INFO.delivery.hours} (+€
                            {STORE_INFO.delivery.cost})
                          </div>
                        </div>
                      </label>
                    </div>

                    {deliveryType === "pickup" && (
                      <div className="mt-3 sm:mt-4">
                        <label className="text-deep mb-1.5 block text-xs font-medium sm:mb-2 sm:text-sm">
                          Pickup Date & Time
                        </label>
                        <input
                          type="datetime-local"
                          value={pickupDateTime}
                          onChange={(e) => setPickupDateTime(e.target.value)}
                          className="focus:border-secondary focus:ring-secondary/20 w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 sm:px-4 sm:py-3 sm:text-base"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Column - Payment & Summary */}
                <div className="space-y-4 sm:space-y-6">
                  <div>
                    <h3 className="text-deep mb-3 text-base font-semibold sm:mb-4 sm:text-lg">
                      Order Summary
                    </h3>
                    <div className="bg-secondary/5 space-y-3 rounded-lg p-3 sm:p-4">
                      {itemsToDisplay?.map((item) => {
                        const details = getItemDetails(item);
                        return (
                          <div
                            key={details.key}
                            className="flex items-start justify-between gap-2 sm:items-center"
                          >
                            <div className="min-w-0 flex-1">
                              <p className="text-deep truncate text-sm font-medium sm:text-base">
                                {details.name}
                              </p>
                              <p className="text-deep/70 text-xs sm:text-sm">
                                Qty: {details.quantity}
                              </p>
                              {"personalization" in item &&
                                item.personalization && (
                                  <div className="mt-1 space-y-0.5 text-xs text-gray-600">
                                    {item.personalization.color && (
                                      <p>Color: {item.personalization.color}</p>
                                    )}
                                    {item.personalization.text && (
                                      <p className="italic">
                                        "{item.personalization.text}"
                                      </p>
                                    )}
                                    {item.personalization.number && (
                                      <p>
                                        Number: {item.personalization.number}
                                      </p>
                                    )}
                                  </div>
                                )}
                            </div>
                            <p className="text-deep shrink-0 text-sm font-semibold sm:text-base">
                              €{(details.price * details.quantity).toFixed(2)}
                            </p>
                          </div>
                        );
                      })}

                      <div className="mt-3 border-t pt-3">
                        <div className="flex items-center justify-between">
                          <span className="text-deep text-base font-semibold sm:text-lg">
                            Total:
                          </span>
                          <span className="text-accent text-lg font-bold sm:text-xl">
                            €{total.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Payment Method */}
                  <div>
                    <h3 className="text-deep mb-2 text-base font-semibold sm:mb-3 sm:text-lg">
                      Payment Method
                    </h3>
                    <div className="space-y-2 sm:space-y-3">
                      <label className="hover:bg-primary flex cursor-pointer items-start space-x-2 rounded-lg border p-3 transition-colors sm:space-x-3 sm:p-4">
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="full_online"
                          checked={paymentMethod === "full_online"}
                          onChange={(e) =>
                            setPaymentMethod(e.target.value as PaymentMethod)
                          }
                          className="text-secondary mt-0.5 h-4 w-4 shrink-0 sm:mt-1"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="text-deep text-sm font-medium sm:text-base">
                            Full Online Payment
                          </div>
                          <div className="text-deep/70 text-xs sm:text-sm">
                            Pay the full amount online — your set will be
                            reserved immediately
                          </div>
                        </div>
                      </label>

                      <label className="hover:bg-primary flex cursor-pointer items-start space-x-2 rounded-lg border p-3 transition-colors sm:space-x-3 sm:p-4">
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="partial_online"
                          checked={paymentMethod === "partial_online"}
                          onChange={(e) =>
                            setPaymentMethod(e.target.value as PaymentMethod)
                          }
                          className="text-secondary mt-0.5 h-4 w-4 shrink-0 sm:mt-1"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="text-deep text-sm font-medium sm:text-base">
                            30% Deposit
                          </div>
                          <div className="text-deep/70 text-xs sm:text-sm">
                            Pay 30% online to reserve. Remaining amount paid in
                            cash upon pickup
                          </div>
                        </div>
                      </label>

                      {deliveryType === "pickup" && (
                        <label className="hover:bg-primary flex cursor-pointer items-start space-x-2 rounded-lg border p-3 transition-colors sm:space-x-3 sm:p-4">
                          <input
                            type="radio"
                            name="paymentMethod"
                            value="cash"
                            checked={paymentMethod === "cash"}
                            onChange={(e) =>
                              setPaymentMethod(e.target.value as PaymentMethod)
                            }
                            className="text-secondary mt-0.5 h-4 w-4 shrink-0 sm:mt-1"
                          />
                          <div className="min-w-0 flex-1">
                            <div className="text-deep text-sm font-medium sm:text-base">
                              Cash Payment
                            </div>
                            <div className="text-deep/70 text-xs sm:text-sm">
                              Only for pickup. Requires WhatsApp confirmation
                            </div>
                          </div>
                        </label>
                      )}
                    </div>

                    {paymentMethod === "cash" && (
                      <div className="bg-warm/20 mt-3 rounded-lg border p-3 sm:mt-4 sm:p-4">
                        <p className="text-deep mb-2 text-xs sm:mb-3 sm:text-sm">
                          To reserve your set, confirm the pickup date and time
                          via WhatsApp
                        </p>
                        <button
                          type="button"
                          onClick={handleWhatsAppConfirm}
                          className="w-full rounded-lg bg-green-600 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 sm:py-3 sm:text-base"
                        >
                          📱 Confirm via WhatsApp
                        </button>
                        {whatsappConfirmed && (
                          <p className="mt-2 text-xs font-medium text-green-700 sm:text-sm">
                            ✓ WhatsApp confirmation sent
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Additional Info */}
                  <div className="bg-secondary/10 text-deep rounded-lg p-3 text-xs sm:p-4 sm:text-sm">
                    <h4 className="mb-2 text-sm font-semibold sm:text-base">
                      Additional Information:
                    </h4>
                    <ul className="space-y-1 text-xs">
                      <li>
                        • Reservation confirmed after payment or WhatsApp
                        confirmation
                      </li>
                      <li>
                        • Cancellation possible up to 48 hours before pickup
                      </li>
                      <li>• Preparation time: 72 hours (3 days)</li>
                      <li>• Contact: WhatsApp only</li>
                    </ul>
                  </div>

                  <button
                    type="submit"
                    disabled={
                      isSubmitting ||
                      (paymentMethod === "cash" && !whatsappConfirmed)
                    }
                    className="btn-accent w-full rounded-lg py-2.5 text-sm font-semibold transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 sm:py-3 sm:text-base"
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
