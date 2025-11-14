export type ChunkUploadPhase = "initializing" | "uploading" | "finalizing";

export type ChunkUploadProgress = {
  phase: ChunkUploadPhase;
  uploadedBytes: number;
  totalBytes: number;
  percentage: number;
  chunkIndex?: number;
  totalChunks?: number;
};

export type ChunkUploadResult = {
  url: string;
  fileId: string;
  name: string;
};

type UploadSessionResponse = {
  sessionId: string;
  chunkSize: number;
  totalChunks: number;
  nextChunkIndex: number;
};

type ChunkResponse = {
  nextChunkIndex: number;
  totalChunks: number;
  uploadedBytes: number;
};

type CompleteResponse = ChunkUploadResult;

function extractErrorMessage(payload: unknown, fallback: string) {
  if (payload && typeof payload === "object" && "error" in payload) {
    const errorMessage = payload.error;
    if (typeof errorMessage === "string" && errorMessage.trim().length > 0) {
      return errorMessage;
    }
  }
  return fallback;
}

async function parseJson(response: Response) {
  try {
    return await response.json();
  } catch (error) {
    console.error("Не удалось распарсить ответ", error);
    return null;
  }
}

export async function uploadFileInChunks(
  file: File,
  options?: {
    folder?: string;
    signal?: AbortSignal;
    onProgress?: (progress: ChunkUploadProgress) => void;
  },
): Promise<ChunkUploadResult> {
  const totalBytes = file.size;
  options?.onProgress?.({
    phase: "initializing",
    uploadedBytes: 0,
    totalBytes,
    percentage: 0,
  });

  const sessionResponse = await fetch("/api/imagekit-upload/session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      fileName: file.name,
      fileSize: file.size,
      mimeType: file.type,
    }),
    signal: options?.signal,
  });

  const sessionPayload = (await parseJson(sessionResponse)) as
    | UploadSessionResponse
    | { error?: string }
    | null;

  if (
    !sessionResponse.ok ||
    !sessionPayload ||
    !("sessionId" in sessionPayload)
  ) {
    throw new Error(
      extractErrorMessage(
        sessionPayload,
        "Не удалось инициализировать загрузку",
      ),
    );
  }

  const sessionId = sessionPayload.sessionId;
  const chunkSize = sessionPayload.chunkSize;
  const totalChunks = Math.max(1, sessionPayload.totalChunks);
  let nextChunkIndex = sessionPayload.nextChunkIndex ?? 0;

  if (!Number.isFinite(chunkSize) || chunkSize <= 0) {
    throw new Error("Сервер вернул некорректный размер чанка");
  }

  while (nextChunkIndex < totalChunks) {
    const start = nextChunkIndex * chunkSize;
    const end = Math.min(file.size, start + chunkSize);
    const chunk = file.slice(start, end);

    const chunkResponse = await fetch(
      `/api/imagekit-upload/chunk?sessionId=${encodeURIComponent(sessionId)}&chunkIndex=${nextChunkIndex}`,
      {
        method: "POST",
        body: chunk,
        signal: options?.signal,
      },
    );

    const chunkPayload = (await parseJson(chunkResponse)) as
      | ChunkResponse
      | { error?: string }
      | null;

    if (
      !chunkResponse.ok ||
      !chunkPayload ||
      !("nextChunkIndex" in chunkPayload)
    ) {
      throw new Error(
        extractErrorMessage(
          chunkPayload,
          `Не удалось загрузить чанк ${nextChunkIndex}`,
        ),
      );
    }

    nextChunkIndex = chunkPayload.nextChunkIndex;
    const uploadedBytes = Math.min(
      totalBytes,
      chunkPayload.uploadedBytes ?? nextChunkIndex * chunkSize,
    );

    options?.onProgress?.({
      phase: "uploading",
      uploadedBytes,
      totalBytes,
      percentage: Math.min(99, Math.round((uploadedBytes / totalBytes) * 100)),
      chunkIndex: chunkPayload.nextChunkIndex,
      totalChunks: chunkPayload.totalChunks ?? totalChunks,
    });
  }

  options?.onProgress?.({
    phase: "finalizing",
    uploadedBytes: totalBytes,
    totalBytes,
    percentage: 100,
  });

  const completeResponse = await fetch("/api/imagekit-upload/complete", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      sessionId,
      folder: options?.folder,
    }),
    signal: options?.signal,
  });

  const completePayload = (await parseJson(completeResponse)) as
    | CompleteResponse
    | { error?: string }
    | null;

  if (!completeResponse.ok || !completePayload || !("url" in completePayload)) {
    throw new Error(
      extractErrorMessage(completePayload, "Не удалось завершить загрузку"),
    );
  }

  return completePayload;
}
