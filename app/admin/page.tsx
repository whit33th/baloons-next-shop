"use client";

import { useState, useRef } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";
import { Header } from "../../components/Containers/Header";

export default function AdminPage() {
  const productsResult = useQuery(api.products.list, {
    paginationOpts: { numItems: 50, cursor: null },
  });
  const createProduct = useMutation(api.products.create);
  const generateUploadUrl = useMutation(api.products.generateUploadUrl);

  const [isCreating, setIsCreating] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    color: "",
    size: "medium" as const,
    shape: "round" as const,
    inStock: "",
  });

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        // 5MB limit
        toast.error("Image must be smaller than 5MB");
        return;
      }
      if (!file.type.startsWith("image/")) {
        toast.error("Please select an image file");
        return;
      }
      setSelectedImage(file);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.name ||
      !formData.description ||
      !formData.price ||
      !formData.color ||
      !formData.inStock
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsCreating(true);
    try {
      let imageId = undefined;

      if (selectedImage) {
        // Step 1: Get upload URL
        const postUrl = await generateUploadUrl();

        // Step 2: Upload the file
        const result = await fetch(postUrl, {
          method: "POST",
          headers: { "Content-Type": selectedImage.type },
          body: selectedImage,
        });

        const json = await result.json();
        if (!result.ok) {
          throw new Error(`Upload failed: ${JSON.stringify(json)}`);
        }

        imageId = json.storageId;
      }

      // Step 3: Create the product
      await createProduct({
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        color: formData.color,
        size: formData.size,
        shape: formData.shape,
        inStock: parseInt(formData.inStock),
        imageId,
        imageIds: imageId ? [imageId] : [],
      });

      toast.success("Product created successfully!");

      // Reset form
      setFormData({
        name: "",
        description: "",
        price: "",
        color: "",
        size: "medium",
        shape: "round",
        inStock: "",
      });
      setSelectedImage(null);

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to create product",
      );
    } finally {
      setIsCreating(false);
    }
  };

  const products = productsResult?.page || [];

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-purple-50">
      <main className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-6xl space-y-8">
          {/* Create Product Form */}
          <div className="rounded-xl bg-white p-6 shadow-sm">
            <h2 className="mb-6 text-2xl font-bold text-gray-800">
              Add New Product
            </h2>

            <form onSubmit={handleSubmit} className="grid gap-6 md:grid-cols-2">
              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-transparent focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Classic Red Balloon"
                    required
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Description *
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    rows={3}
                    className="w-full resize-none rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-transparent focus:ring-2 focus:ring-blue-500"
                    placeholder="Describe the balloon..."
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Price ($) *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.price}
                      onChange={(e) =>
                        setFormData({ ...formData, price: e.target.value })
                      }
                      className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-transparent focus:ring-2 focus:ring-blue-500"
                      placeholder="2.99"
                      required
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Stock Quantity *
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.inStock}
                      onChange={(e) =>
                        setFormData({ ...formData, inStock: e.target.value })
                      }
                      className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-transparent focus:ring-2 focus:ring-blue-500"
                      placeholder="50"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Color *
                  </label>
                  <input
                    type="text"
                    value={formData.color}
                    onChange={(e) =>
                      setFormData({ ...formData, color: e.target.value })
                    }
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-transparent focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., red, blue, gold"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Size *
                    </label>
                    <select
                      value={formData.size}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          size: e.target.value as any,
                        })
                      }
                      className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-transparent focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="small">Small</option>
                      <option value="medium">Medium</option>
                      <option value="large">Large</option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Shape *
                    </label>
                    <select
                      value={formData.shape}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          shape: e.target.value as any,
                        })
                      }
                      className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-transparent focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="round">Round</option>
                      <option value="heart">Heart</option>
                      <option value="star">Star</option>
                      <option value="animal">Animal</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Product Image
                  </label>
                  <div
                    onClick={handleUploadClick}
                    className="relative cursor-pointer rounded-lg border-2 border-dashed border-gray-300 p-6 text-center transition-colors hover:border-blue-400"
                  >
                    {selectedImage ? (
                      <div className="space-y-4">
                        <img
                          src={URL.createObjectURL(selectedImage)}
                          alt="Preview"
                          className="mx-auto h-32 w-32 rounded-lg object-cover"
                        />
                        <p className="text-sm text-gray-600">
                          {selectedImage.name}
                        </p>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedImage(null);
                            if (fileInputRef.current) {
                              fileInputRef.current.value = "";
                            }
                          }}
                          className="text-sm text-red-500 hover:text-red-700"
                        >
                          Remove Image
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="text-4xl">📸</div>
                        <p className="text-gray-600">
                          Click to upload an image
                        </p>
                        <p className="text-xs text-gray-500">
                          PNG, JPG up to 5MB
                        </p>
                      </div>
                    )}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageSelect}
                      className="hidden"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isCreating}
                  className="w-full rounded-lg bg-blue-600 py-3 font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-400"
                >
                  {isCreating ? "Creating Product..." : "Create Product"}
                </button>
              </div>
            </form>
          </div>

          {/* Products List */}
          <div className="rounded-xl bg-white p-6 shadow-sm">
            <h2 className="mb-6 text-2xl font-bold text-gray-800">
              All Products
            </h2>

            {productsResult === undefined ? (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="animate-pulse rounded-lg bg-gray-100 p-4"
                  >
                    <div className="mb-4 h-32 rounded bg-gray-200"></div>
                    <div className="mb-2 h-4 rounded bg-gray-200"></div>
                    <div className="h-3 rounded bg-gray-200"></div>
                  </div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="py-8 text-center">
                <div className="mb-4 text-4xl">🎈</div>
                <p className="text-gray-600">
                  No products yet. Create your first product above!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {products.map((product: any) => (
                  <div
                    key={product._id}
                    className="rounded-lg border border-gray-200 p-4 transition-shadow hover:shadow-md"
                  >
                    <div className="mb-4 flex aspect-square items-center justify-center overflow-hidden rounded-lg bg-gray-100">
                      {product.primaryImageUrl ? (
                        <img
                          src={product.primaryImageUrl}
                          alt={product.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="text-4xl">
                          {product.shape === "heart"
                            ? "💖"
                            : product.shape === "star"
                              ? "⭐"
                              : product.shape === "animal"
                                ? "🐶"
                                : "🎈"}
                        </div>
                      )}
                    </div>

                    <h3 className="mb-1 font-semibold text-gray-800">
                      {product.name}
                    </h3>
                    <p className="mb-2 line-clamp-2 text-sm text-gray-600">
                      {product.description}
                    </p>

                    <div className="mb-2 flex items-center justify-between text-sm text-gray-500">
                      <span className="flex items-center space-x-1">
                        <span
                          className="h-3 w-3 rounded-full"
                          style={{ backgroundColor: product.color }}
                        ></span>
                        <span>{product.size}</span>
                        <span>•</span>
                        <span>{product.shape}</span>
                      </span>
                      <span>{product.inStock} in stock</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold">
                        ${product.price}
                      </span>
                      <span className="text-xs text-gray-500">
                        ID: {product._id.slice(-6)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
