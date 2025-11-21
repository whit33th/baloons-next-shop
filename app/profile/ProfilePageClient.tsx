"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { type Preloaded, useMutation, usePreloadedQuery } from "convex/react";
import { motion } from "motion/react";
import type { Route } from "next";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { type Resolver, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import Input from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { STORE_INFO } from "@/constants/config";
import { COURIER_DELIVERY_CITIES } from "@/constants/delivery";
import { api } from "@/convex/_generated/api";
import { useConvexAvatarStorage } from "@/hooks/useConvexAvatarStorage";
import {
  type AddressFields,
  createEmptyAddressFields,
  optionalAddressSchema,
  parseAddress,
} from "@/lib/address";
import { AvatarPanel } from "./_components/AvatarPanel";
import { InfoTile } from "./_components/InfoTile";
import { OrdersPanel } from "./_components/OrdersPanel";
import { PreferencesPanel } from "./_components/PreferencesPanel";
import {
  fieldInputClass,
  fieldLabelClass,
  fieldTextareaClass,
  palette,
} from "./_components/palette";

type TabId = "profile" | "orders" | "settings";

const tabs: Array<{ id: TabId; label: string; hint: string }> = [
  { id: "profile", label: "Profile", hint: "Contact details" },
  { id: "orders", label: "Orders", hint: "Purchase history" },
  { id: "settings", label: "Settings", hint: "Preferences" },
];

const MAX_AVATAR_BYTES = 2 * 1024 * 1024; // 2 MB

const tabButtonId = (tabId: TabId) => `profile-tab-${tabId}`;
const tabPanelId = (tabId: TabId) => `profile-panel-${tabId}`;

const phoneRegex = /^[+]?[\d\s()-]{6,}$/;

const profileDetailsSchema = z.object({
  name: z
    .string()
    .min(2, "Full name must be at least 2 characters.")
    .max(120, "Full name must be under 120 characters."),
  email: z
    .string()
    .min(1, "Email address is required.")
    .email("Enter a valid email address."),
  phone: z
    .string()
    .optional()
    .refine(
      (value) => !value || phoneRegex.test(value.trim()),
      "Enter a valid phone number or leave the field empty.",
    ),
  address: optionalAddressSchema.optional(),
});

type ProfileDetailsFormValues = z.infer<typeof profileDetailsSchema>;

interface IProfilePage {
  preloadedUser: Preloaded<typeof api.auth.loggedInUser>;
  preloadedOrders: Preloaded<typeof api.orders.list>;
}

export default function ProfilePageClient({
  preloadedUser,
  preloadedOrders,
}: IProfilePage) {
  const user = usePreloadedQuery(preloadedUser);
  const orders = usePreloadedQuery(preloadedOrders);
  const updateProfile = useMutation(api.users.updateProfile);
  const updateAvatar = useMutation(api.users.updateAvatar);
  const deleteAccount = useMutation(api.users.deleteAccount as any);

  const [activeTab, setActiveTab] = useState<TabId>("profile");
  const [isEditing, setIsEditing] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const form = useForm<ProfileDetailsFormValues>({
    resolver: zodResolver(
      profileDetailsSchema,
    ) as Resolver<ProfileDetailsFormValues>,
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      ...createEmptyAddressFields(),
    },
  });

  const avatarInputRef = useRef<HTMLInputElement | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const _hasRedirected = useRef(false);
  const { avatarUrl: avatarUrlFromStorage, uploadAvatar } =
    useConvexAvatarStorage(user?.imageFileId ?? null);

  // Use user's saved address when not editing, form values when editing
  const displayAddress = useMemo(() => {
    if (!isEditing && user) {
      // Handle both old string format and new object format
      if (typeof user.address === "string") {
        return parseAddress(user.address);
      } else if (user.address) {
        return user.address;
      }
      return createEmptyAddressFields();
    }
    const formValues = form.getValues();
    return formValues.address || createEmptyAddressFields();
  }, [isEditing, user, form]);

  const resetFormFromUser = useCallback(() => {
    if (!user) {
      form.reset({
        name: "",
        email: "",
        phone: "",
        address: {
          streetAddress: "",
          city: "",
          postalCode: "",
          deliveryNotes: "",
        },
      });
      return;
    }

    // Handle both old string format and new object format
    let parsedAddress: AddressFields;
    if (typeof user.address === "string") {
      parsedAddress = parseAddress(user.address);
    } else if (user.address) {
      parsedAddress = user.address;
    } else {
      parsedAddress = createEmptyAddressFields();
    }

    form.reset({
      name: user.name ?? "",
      email: user.email ?? "",
      phone: user.phone ?? "",
      address: parsedAddress,
    });
  }, [form, user]);

  useEffect(() => {
    if (!isEditing) {
      resetFormFromUser();
    }
  }, [isEditing, resetFormFromUser]);

  const handleAvatarFileChange = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) {
        return;
      }

      if (file.size > MAX_AVATAR_BYTES) {
        toast.error("Please choose an image smaller than 2 MB.");
        event.target.value = "";
        return;
      }

      setIsUploadingAvatar(true);
      try {
        const storageId = await uploadAvatar(file);
        await updateAvatar({
          imageFileId: storageId,
        });
        toast.success("Avatar updated!");
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : "Failed to upload a new avatar",
        );
      } finally {
        setIsUploadingAvatar(false);
        event.target.value = "";
      }
    },
    [updateAvatar, uploadAvatar],
  );

  const handleUpdateProfile = useCallback(
    async (values: ProfileDetailsFormValues) => {
      try {
        const addressToSend = values.address
          ? {
              streetAddress: values.address.streetAddress || "",
              city: values.address.city || "",
              postalCode: values.address.postalCode || "",
              deliveryNotes: values.address.deliveryNotes || "",
            }
          : undefined;

        const updated = await updateProfile({
          name: values.name || undefined,
          email: values.email || undefined,
          phone: values.phone || undefined,
          address: addressToSend,
        });

        // Handle both old string format and new object format
        let parsedAddress: AddressFields;
        if (typeof updated?.address === "string") {
          parsedAddress = parseAddress(updated.address);
        } else if (updated?.address) {
          parsedAddress = updated.address;
        } else {
          parsedAddress = createEmptyAddressFields();
        }

        form.reset({
          name: updated?.name ?? "",
          email: updated?.email ?? "",
          phone: updated?.phone ?? "",
          address: parsedAddress,
        });
        toast.success("Profile updated successfully!");
        setIsEditing(false);
      } catch (_error) {
        toast.error("Failed to update profile");
      }
    },
    [form, updateProfile],
  );

  // useEffect(() => {
  //   if (user === null && !hasRedirected.current) {
  //     hasRedirected.current = true;
  //     router.replace("/auth?redirect=/profile");
  //   }
  // }, [router, user]);

  // Initialise active tab from the `tab` query parameter when the
  // component mounts or when search params change. If `tab` is invalid
  // or absent, keep the default.
  useEffect(() => {
    const tabParam = searchParams.get("tab");

    if (tabParam === "orders" || tabParam === "settings") {
      setActiveTab(tabParam as TabId);
    } else {
      setActiveTab("profile");
    }
  }, [searchParams]);

  const formattedOrders = useMemo(() => orders ?? [], [orders]);

  if (user === undefined) {
    return (
      <div className="bg-primary text-deep min-h-screen">
        <div className="mx-auto grid max-w-5xl gap-6 px-4 py-16 md:grid-cols-2">
          <div className="h-60 animate-pulse rounded-3xl bg-[rgba(var(--primary-rgb),0.65)]" />
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, index) => (
              <div
                key={`skeleton-${index}`}
                className="h-12 animate-pulse rounded-full bg-[rgba(var(--secondary-rgb),0.12)]"
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (user === null) {
    return (
      <div className="bg-primary text-deep flex min-h-screen items-center justify-center">
        <p className="text-deep text-sm font-medium tracking-wide uppercase">
          Redirecting to sign in...
        </p>
      </div>
    );
  }

  return (
    <div className="bg-primary text-deep min-h-screen pb-16">
      <main className="mx-auto w-full max-w-6xl px-4 pt-12">
        <motion.section
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className={`relative overflow-hidden rounded-3xl border px-8 py-10 drop-shadow-xl ${palette.softBorder} ${palette.elevatedSurface}`}
          style={{
            background:
              "linear-gradient(135deg, rgba(var(--primary-rgb),0.97) 0%, rgba(var(--support-warm-rgb),0.35) 45%, rgba(var(--secondary-rgb),0.12) 100%)",
          }}
        >
          <AvatarPanel
            user={user}
            formattedOrdersCount={formattedOrders.length}
            isUploadingAvatar={isUploadingAvatar}
            avatarInputRef={avatarInputRef}
            onAvatarFileChange={handleAvatarFileChange}
            // Prefer the `image` field stored on the user document (full URL).
            // If it's not set, fall back to the storage-derived URL.
            avatarUrl={user.image ?? avatarUrlFromStorage}
          />
        </motion.section>

        <motion.nav
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mt-10 grid grid-cols-1 gap-3 text-sm sm:grid-cols-3"
          role="tablist"
          aria-label="Profile sections"
        >
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                type="button"
                role="tab"
                id={tabButtonId(tab.id)}
                key={tab.id}
                aria-selected={isActive}
                aria-controls={tabPanelId(tab.id)}
                tabIndex={isActive ? 0 : -1}
                onClick={() => {
                  setActiveTab(tab.id);
                  // Update the URL so the active tab is preserved in history
                  // and shareable. If the 'profile' tab is selected, remove
                  // the query param entirely.
                  try {
                    if (tab.id === "profile") {
                      router.replace("/profile");
                    } else {
                      router.replace(`?tab=${tab.id}`);
                    }
                  } catch (_e) {
                    // ignore router errors
                  }
                }}
                onKeyDown={(event) => {
                  if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") {
                    return;
                  }
                  event.preventDefault();
                  const offset = event.key === "ArrowRight" ? 1 : -1;
                  const currentIndex = tabs.findIndex(
                    (candidate) => candidate.id === tab.id,
                  );
                  if (currentIndex === -1) {
                    return;
                  }
                  const nextIndex =
                    (currentIndex + offset + tabs.length) % tabs.length;
                  setActiveTab(tabs[nextIndex].id);
                }}
                className={`focus-visible:outline-accent flex flex-col rounded-3xl border bg-white px-6 py-5 text-left focus-visible:outline focus-visible:outline-offset-2 ${
                  isActive
                    ? "border-secondary/90"
                    : `${palette.softBorder} hover:border-secondary/40`
                }`}
              >
                <span
                  className={`text-xs tracking-[0.3rem] uppercase ${palette.subtleText}`}
                >
                  {tab.hint}
                </span>
                <span className="text-deep text-lg font-semibold">
                  {tab.label}
                </span>
              </button>
            );
          })}
        </motion.nav>

        <section className="mt-10 space-y-8">
          {activeTab === "profile" ? (
            <motion.div
              key="profile"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45 }}
              className={`grid gap-6 rounded-3xl border p-8 shadow-[0_28px_70px_-40px_rgba(52,137,152,0.45)] ${palette.softBorder} ${palette.elevatedSurface}`}
              role="tabpanel"
              id={tabPanelId("profile")}
              aria-labelledby={tabButtonId("profile")}
              tabIndex={0}
            >
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="text-deep text-2xl font-semibold">
                    Personal details
                  </h2>
                  <p className={`text-sm ${palette.mutedText}`}>
                    Keep your contact and delivery information up to date.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (isEditing) {
                      resetFormFromUser();
                      setIsEditing(false);
                    } else {
                      resetFormFromUser();
                      setIsEditing(true);
                    }
                  }}
                  className={`rounded-full px-5 py-2 text-xs font-semibold tracking-widest uppercase transition ${
                    isEditing
                      ? `border ${palette.softBorder} text-deep hover:bg-[rgba(var(--primary-rgb),0.7)]`
                      : "btn-secondary border-none shadow-md hover:brightness-95"
                  }`}
                >
                  {isEditing ? "Cancel" : "Edit"}
                </button>
              </div>

              {isEditing ? (
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(handleUpdateProfile)}
                    className="grid gap-5 md:grid-cols-2"
                  >
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem className={fieldLabelClass}>
                          <FormLabel>Full name</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="Jane Balloon"
                              className={fieldInputClass}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem className={fieldLabelClass}>
                          <FormLabel>Email address</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="email"
                              placeholder="you@example.com"
                              className={fieldInputClass}
                              disabled
                              readOnly
                            />
                          </FormControl>
                          <FormMessage />
                          <p className="mt-1 text-xs text-[rgba(var(--deep-rgb),0.5)]">
                            Email cannot be changed. Contact support if you need
                            to update it.
                          </p>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem className={fieldLabelClass}>
                          <FormLabel>Phone number</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="Include country code"
                              className={fieldInputClass}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="address.streetAddress"
                      render={({ field }) => (
                        <FormItem
                          className={`${fieldLabelClass} md:col-span-2`}
                        >
                          <FormLabel>Street &amp; house number</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="Mariahilfer Str. 10"
                              className={fieldInputClass}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="address.city"
                      render={({ field }) => (
                        <FormItem className={fieldLabelClass}>
                          <FormLabel>City</FormLabel>
                          <FormControl>
                            <div className="mt-2 flex flex-wrap gap-2.5">
                              {COURIER_DELIVERY_CITIES.map((city) => {
                                const selected = field.value === city.name;
                                return (
                                  <button
                                    key={city.id}
                                    type="button"
                                    onClick={() => field.onChange(city.name)}
                                    className={`focus:outline-accent flex items-center justify-center rounded-lg border px-3 py-2 text-sm font-medium transition ${
                                      selected
                                        ? "border-accent bg-[rgba(var(--accent-rgb),0.08)]"
                                        : `${palette.softBorder} hover:border-accent/40`
                                    }`}
                                  >
                                    {city.name}
                                  </button>
                                );
                              })}
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="address.postalCode"
                      render={({ field }) => (
                        <FormItem className={fieldLabelClass}>
                          <FormLabel>Postal code</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder={STORE_INFO.address.postalCode}
                              className={fieldInputClass}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="address.deliveryNotes"
                      render={({ field }) => (
                        <FormItem
                          className={`${fieldLabelClass} md:col-span-2`}
                        >
                          <FormLabel>
                            Delivery notes (door code, floor…)
                          </FormLabel>
                          <FormControl>
                            <Textarea
                              {...field}
                              rows={3}
                              placeholder="Ring the bell twice, leave at reception, etc."
                              className={fieldTextareaClass}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="flex flex-wrap items-center gap-3 md:col-span-2">
                      <motion.button
                        whileTap={{ scale: 0.97 }}
                        type="submit"
                        disabled={form.formState.isSubmitting}
                        className="bg-accent text-on-accent inline-flex h-12 items-center justify-center rounded-full px-6 text-xs font-semibold tracking-widest uppercase transition hover:brightness-95 disabled:opacity-60"
                      >
                        {form.formState.isSubmitting
                          ? "Saving…"
                          : "Save changes"}
                      </motion.button>
                      <button
                        type="button"
                        onClick={() => {
                          resetFormFromUser();
                          setIsEditing(false);
                        }}
                        className={`text-deep inline-flex h-12 items-center justify-center rounded-full border px-6 text-xs font-semibold tracking-widest uppercase transition hover:bg-[rgba(var(--primary-rgb),0.8)] ${palette.softBorder}`}
                      >
                        Discard
                      </button>
                    </div>
                  </form>
                </Form>
              ) : (
                <div className="grid gap-6 md:grid-cols-2">
                  <InfoTile label="Full name" value={user.name ?? "Not set"} />
                  <InfoTile label="Email" value={user.email ?? "Not set"} />
                  <InfoTile label="Phone" value={user.phone || "Not set"} />
                  <InfoTile
                    label="Street & house number"
                    value={displayAddress.streetAddress || "Not set"}
                  />
                  <InfoTile
                    label="City"
                    value={displayAddress.city || "Not set"}
                  />
                  <InfoTile
                    label="Postal code"
                    value={displayAddress.postalCode || "Not set"}
                  />
                  <InfoTile
                    label="Delivery notes"
                    value={displayAddress.deliveryNotes || "Not set"}
                    fullWidth
                  />
                </div>
              )}
            </motion.div>
          ) : null}

          {activeTab === "orders" ? (
            <motion.div
              key="orders"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45 }}
              className={`grid gap-5 rounded-3xl border p-8 shadow-[0_28px_70px_-40px_rgba(52,137,152,0.45)] ${palette.softBorder} ${palette.elevatedSurface}`}
              role="tabpanel"
              id={tabPanelId("orders")}
              aria-labelledby={tabButtonId("orders")}
              tabIndex={0}
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-deep text-2xl font-semibold">
                  Order history
                </h2>
                <p className={`text-sm ${palette.mutedText}`}>
                  {formattedOrders.length} placed orders
                </p>
              </div>
              <OrdersPanel orders={orders} />
            </motion.div>
          ) : null}

          {activeTab === "settings" ? (
            <motion.div
              key="settings"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45 }}
              className={`grid gap-6 rounded-3xl border p-8 shadow-[0_28px_70px_-40px_rgba(52,137,152,0.45)] ${palette.softBorder} ${palette.elevatedSurface}`}
              role="tabpanel"
              id={tabPanelId("settings")}
              aria-labelledby={tabButtonId("settings")}
              tabIndex={0}
            >
              <div>
                <h2 className="text-deep text-2xl font-semibold">
                  Preferences
                </h2>
                <p className={`text-sm ${palette.mutedText}`}>
                  Decide what updates land in your inbox.
                </p>
              </div>

              <PreferencesPanel />

              <div className="mt-6 border-t pt-6">
                <h3 className="text-deep text-lg font-semibold">Danger zone</h3>
                <p className={`text-sm ${palette.mutedText} mt-1`}>
                  Permanently delete your account and all personal data. This
                  action cannot be undone.
                </p>

                <div className="mt-4">
                  <Button
                    variant="destructive"
                    onClick={() => setIsDeleteOpen(true)}
                  >
                    Delete account
                  </Button>
                </div>

                <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
                  <DialogContent>
                    <DialogHeader className="space-y-2">
                      <DialogTitle>Delete account?</DialogTitle>
                      <DialogDescription>
                        This will permanently delete your account and cannot be
                        undone. Are you sure you want to continue?
                      </DialogDescription>
                    </DialogHeader>

                    <DialogFooter>
                      <Button
                        variant="ghost"
                        onClick={() => setIsDeleteOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={async () => {
                          setIsDeletingAccount(true);
                          try {
                            await deleteAccount({});
                            // Очищаем все хранилища
                            localStorage.clear();
                            sessionStorage.clear();
                            document.cookie.split(";").forEach((c) => {
                              document.cookie = c
                                .replace(/^ +/, "")
                                .replace(
                                  /=.*/,
                                  "=;expires=" +
                                    new Date().toUTCString() +
                                    ";path=/",
                                );
                              window.location.replace("/auth" as Route);
                              window.location.reload();
                            });
                            toast.success("Account deleted");
                            router.replace("/"); // или другой редирект
                          } catch (e) {
                            toast.error(
                              e instanceof Error
                                ? e.message
                                : "Failed to delete account",
                            );
                          } finally {
                            setIsDeletingAccount(false);
                            setIsDeleteOpen(false);
                          }
                        }}
                        disabled={isDeletingAccount}
                      >
                        {isDeletingAccount ? "Deleting..." : "Delete account"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </motion.div>
          ) : null}
        </section>
      </main>
    </div>
  );
}
