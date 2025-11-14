import Image from "next/image";
import ImageKitPicture from "@/components/ui/ImageKitPicture";
import { ADMIN_PRODUCT_IMAGE_TRANSFORMATION } from "@/lib/imagekit";
import type { PendingImage } from "./types";

interface ImageUploadProps {
  existingImageUrls: string[];
  pendingImages: PendingImage[];
  onSelectImages: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveImage: (preview: string) => void;
  onRemoveExistingImage: (url: string) => void;
  onClearAll: () => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
}

export function ImageUpload({
  existingImageUrls,
  pendingImages,
  onSelectImages,
  onRemoveImage,
  onRemoveExistingImage,
  onClearAll,
  fileInputRef,
}: ImageUploadProps) {
  const totalImages = existingImageUrls.length + pendingImages.length;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white/70 p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-900">
          Фотографии товара
        </h3>
        {totalImages > 0 ? (
          <button
            type="button"
            className="text-xs text-slate-500 hover:text-slate-900"
            onClick={onClearAll}
          >
            Очистить
          </button>
        ) : null}
      </div>

      <div className="mt-4 space-y-3">
        {totalImages === 0 ? (
          <label className="flex cursor-pointer flex-col items-center gap-3 rounded-xl border border-dashed border-slate-300 bg-slate-50/70 px-4 py-6 text-center text-sm text-slate-600 transition hover:border-slate-400">
            <div className="text-3xl font-semibold text-slate-950">📷</div>
            <div className="text-sm font-medium text-slate-700">
              Выберите файлы
            </div>
            <p className="text-xs text-slate-400">
              До 8 изображений, максимум 3 MB каждое
            </p>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              onChange={onSelectImages}
              className="hidden"
            />
          </label>
        ) : (
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
            {existingImageUrls.map((url) => (
              <div
                key={url}
                className="group relative aspect-3/4 overflow-hidden rounded-xl border border-slate-200"
              >
                <div className="relative aspect-3/4 w-full overflow-hidden">
                  <ImageKitPicture
                    src={url}
                    alt="Фотография товара"
                    fill
                    sizes="(min-width: 1280px) 15vw, (min-width: 768px) 25vw, 90vw"
                    className="object-cover"
                    transformation={ADMIN_PRODUCT_IMAGE_TRANSFORMATION}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => onRemoveExistingImage(url)}
                  className="absolute inset-x-2 bottom-2 rounded-full bg-black/60 px-2 py-1 text-xs text-white opacity-0 transition group-hover:opacity-100"
                >
                  Удалить
                </button>
              </div>
            ))}

            {pendingImages.map((image) => (
              <div
                key={image.preview}
                className="group relative aspect-3/4 overflow-hidden rounded-xl border border-slate-200"
              >
                <Image
                  src={image.preview}
                  alt="Загруженное изображение"
                  width={320}
                  height={240}
                  className="aspect-3/4 w-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => onRemoveImage(image.preview)}
                  className="absolute inset-x-2 bottom-2 rounded-full bg-black/60 px-2 py-1 text-xs text-white opacity-0 transition group-hover:opacity-100"
                >
                  Удалить
                </button>
              </div>
            ))}

            {totalImages < 8 ? (
              <label className="flex aspect-3/4 cursor-pointer items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50/70 text-slate-500 transition hover:border-slate-400">
                <span className="text-sm font-medium">+ Добавить</span>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={onSelectImages}
                  className="hidden"
                />
              </label>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}
