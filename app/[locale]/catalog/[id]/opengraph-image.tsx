import { fetchQuery } from "convex/nextjs";
import { ImageResponse } from "next/og";
import { STORE_INFO } from "@/constants/config";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

export const alt = "Product";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image({
  params,
}: {
  params: Promise<{ id: Id<"products"> }>;
}) {
  const { id } = await params;

  try {
    const product = await fetchQuery(api.products.get, { id });

    if (!product) {
      return getDefaultImage();
    }

    const productImage =
      product.imageUrls && product.imageUrls.length > 0
        ? product.imageUrls[0]
        : null;

    const price = `€${product.price.toFixed(2)}`;
    const description = product.description
      ? product.description.slice(0, 150) +
        (product.description.length > 150 ? "..." : "")
      : "";

    // Fetch product image if it's a URL
    let imageSrc: string | null = null;
    if (productImage) {
      if (productImage.startsWith("http")) {
        // External URL - use directly
        imageSrc = productImage;
      } else {
        // Local file - try to read it
        try {
          const { readFile } = await import("node:fs/promises");
          const { join } = await import("node:path");
          const imagePath = productImage.startsWith("/")
            ? join(process.cwd(), "public", productImage.slice(1))
            : join(process.cwd(), "public", productImage);
          const imageData = await readFile(imagePath);
          imageSrc = `data:image/png;base64,${imageData.toString("base64")}`;
        } catch {
          // If local file can't be read, try as URL
          imageSrc = productImage.startsWith("/")
            ? `${STORE_INFO.website}${productImage}`
            : productImage;
        }
      }
    }

    return new ImageResponse(
      (
        <div
          style={{
            background: "linear-gradient(135deg, #ffffff 0%, #f8f8f8 100%)",
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "row",
            position: "relative",
          }}
        >
          {/* Left side - Product Image */}
          <div
            style={{
              width: "50%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "#ffffff",
              padding: "40px",
            }}
          >
            {imageSrc ? (
              /* biome-ignore lint/performance/noImgElement: required for next/og ImageResponse */
              <img
                src={imageSrc}
                alt={product.name}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "contain",
                }}
              />
            ) : (
              <div
                style={{
                  fontSize: "48px",
                  color: "#cccccc",
                  textAlign: "center",
                }}
              >
                No Image
              </div>
            )}
          </div>

          {/* Right side - Product Info */}
          <div
            style={{
              width: "50%",
              height: "100%",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              padding: "60px",
              background: "linear-gradient(135deg, #ffdfc6 0%, #ffe2ba 100%)",
            }}
          >
            {/* Product Name */}
            <div
              style={{
                fontSize: "48px",
                fontWeight: "bold",
                color: "#1a1a1a",
                marginBottom: "20px",
                lineHeight: "1.2",
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              {product.name}
            </div>

            {/* Description */}
            {description && (
              <div
                style={{
                  fontSize: "24px",
                  color: "#4a4a4a",
                  marginBottom: "30px",
                  lineHeight: "1.4",
                  display: "-webkit-box",
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                }}
              >
                {description}
              </div>
            )}

            {/* Price */}
            <div
              style={{
                fontSize: "56px",
                fontWeight: "bold",
                color: "#1a1a1a",
                marginTop: "auto",
              }}
            >
              {price}
            </div>

            {/* Store Name */}
            <div
              style={{
                fontSize: "20px",
                color: "#666666",
                marginTop: "10px",
              }}
            >
              {STORE_INFO.name}
            </div>
          </div>
        </div>
      ),
      {
        ...size,
      },
    );
  } catch {
    return getDefaultImage();
  }
}

function getDefaultImage() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(135deg, #ffdfc6 0%, #ffe2ba 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            fontSize: "64px",
            fontWeight: "bold",
            color: "#1a1a1a",
          }}
        >
          {STORE_INFO.name}
        </div>
      </div>
    ),
    {
      ...size,
    },
  );
}
