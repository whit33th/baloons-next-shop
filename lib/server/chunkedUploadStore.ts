import { randomUUID } from "node:crypto";
import fsp from "node:fs/promises";
import os from "node:os";
import path from "node:path";

const TEMP_DIR = path.join(os.tmpdir(), "imagekit-chunks");
const SESSION_META_SUFFIX = ".json";
const MAX_SESSION_AGE_MS = 30 * 60 * 1000; // 30 minutes
const MIN_CHUNK_BYTES = 256 * 1024; // 256 KB
const DEFAULT_CHUNK_BYTES = 512 * 1024; // 512 KB
const LARGE_FILE_THRESHOLD = 50 * 1024 * 1024; // 50 MB
const LARGE_FILE_CHUNK_BYTES = 1024 * 1024; // 1 MB

type UploadSessionRecord = {
  id: string;
  fileName: string;
  mimeType?: string;
  fileSize: number;
  chunkSize: number;
  totalChunks: number;
  nextChunkIndex: number;
  tempFilePath: string;
  createdAt: number;
  updatedAt: number;
};

export type UploadSessionSnapshot = UploadSessionRecord;

export class UploadSessionError extends Error {
  status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.name = "UploadSessionError";
    this.status = status;
  }
}

async function ensureTempDir() {
  await fsp.mkdir(TEMP_DIR, { recursive: true });
}

function sessionMetaPath(sessionId: string): string {
  return path.join(TEMP_DIR, `${sessionId}${SESSION_META_SUFFIX}`);
}

async function readSessionFromDisk(
  sessionId: string,
): Promise<UploadSessionRecord | undefined> {
  try {
    const raw = await fsp.readFile(sessionMetaPath(sessionId), "utf8");
    return JSON.parse(raw) as UploadSessionRecord;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return undefined;
    }
    throw error;
  }
}

async function writeSessionToDisk(record: UploadSessionRecord) {
  await fsp.writeFile(sessionMetaPath(record.id), JSON.stringify(record));
}

function selectChunkSize(fileSize: number): number {
  if (!Number.isFinite(fileSize) || fileSize <= 0) {
    return DEFAULT_CHUNK_BYTES;
  }

  if (fileSize >= LARGE_FILE_THRESHOLD) {
    return LARGE_FILE_CHUNK_BYTES;
  }

  return Math.max(MIN_CHUNK_BYTES, DEFAULT_CHUNK_BYTES);
}

export async function createUploadSession(params: {
  fileName: string;
  mimeType?: string;
  fileSize: number;
}): Promise<UploadSessionSnapshot> {
  const { fileName, mimeType, fileSize } = params;
  if (!fileName || !fileName.trim()) {
    throw new UploadSessionError("File name is required", 400);
  }
  if (!Number.isFinite(fileSize) || fileSize <= 0) {
    throw new UploadSessionError("File size must be greater than zero", 400);
  }

  await ensureTempDir();
  const sessionId = randomUUID();
  const chunkSize = selectChunkSize(fileSize);
  const totalChunks = Math.max(1, Math.ceil(fileSize / chunkSize));
  const tempFilePath = path.join(TEMP_DIR, `${sessionId}.tmp`);

  // ensure file exists
  await fsp.writeFile(tempFilePath, Buffer.alloc(0));

  const timestamp = Date.now();
  const record: UploadSessionRecord = {
    id: sessionId,
    fileName,
    mimeType,
    fileSize,
    chunkSize,
    totalChunks,
    nextChunkIndex: 0,
    tempFilePath,
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  await writeSessionToDisk(record);

  return { ...record };
}

export async function getUploadSession(
  sessionId: string,
): Promise<UploadSessionSnapshot | undefined> {
  const record = await readSessionFromDisk(sessionId);
  if (!record) {
    return undefined;
  }
  return { ...record };
}

export async function appendChunkToSession(
  sessionId: string,
  chunkIndex: number,
  chunkData: ArrayBuffer | Buffer,
): Promise<UploadSessionSnapshot> {
  const record = await readSessionFromDisk(sessionId);
  if (!record) {
    throw new UploadSessionError("Upload session не найдена", 404);
  }

  if (!Number.isInteger(chunkIndex) || chunkIndex < 0) {
    throw new UploadSessionError("Некорректный индекс чанка", 400);
  }

  if (chunkIndex !== record.nextChunkIndex) {
    throw new UploadSessionError(
      `Ожидался чанк ${record.nextChunkIndex}, но получен ${chunkIndex}. Текущий прогресс необходимо запросить повторно.`,
      409,
    );
  }

  const buffer = Buffer.isBuffer(chunkData)
    ? chunkData
    : Buffer.from(chunkData);

  if (buffer.byteLength === 0) {
    throw new UploadSessionError("Пустой чанк не может быть загружен", 400);
  }

  if (
    chunkIndex < record.totalChunks - 1 &&
    buffer.byteLength !== record.chunkSize
  ) {
    throw new UploadSessionError("Размер чанка не совпадает с ожидаемым", 400);
  }

  await fsp.appendFile(record.tempFilePath, buffer);

  record.nextChunkIndex += 1;
  record.updatedAt = Date.now();
  await writeSessionToDisk(record);

  return { ...record };
}

export async function discardUploadSession(sessionId: string): Promise<void> {
  const record = await readSessionFromDisk(sessionId);
  const promises: Array<Promise<void>> = [];
  if (record) {
    promises.push(
      fsp.unlink(record.tempFilePath).catch((error) => {
        if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
          throw error;
        }
      }),
    );
  }
  promises.push(
    fsp.unlink(sessionMetaPath(sessionId)).catch((error) => {
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
        throw error;
      }
    }),
  );
  await Promise.all(promises);
}

export async function cleanupExpiredSessions(maxAgeMs = MAX_SESSION_AGE_MS) {
  await ensureTempDir();
  const now = Date.now();
  const entries = await fsp.readdir(TEMP_DIR, { withFileTypes: true });
  const deletions: Promise<void>[] = [];

  for (const entry of entries) {
    if (!entry.isFile() || !entry.name.endsWith(SESSION_META_SUFFIX)) {
      continue;
    }
    const sessionId = entry.name.slice(0, -SESSION_META_SUFFIX.length);
    try {
      const record = await readSessionFromDisk(sessionId);
      if (!record) {
        deletions.push(discardUploadSession(sessionId));
        continue;
      }
      if (now - record.updatedAt > maxAgeMs) {
        deletions.push(discardUploadSession(sessionId));
      }
    } catch (error) {
      console.error("Не удалось прочитать метаданные загрузки", error);
      deletions.push(discardUploadSession(sessionId));
    }
  }

  await Promise.allSettled(deletions);
}

export async function ensureAllChunksUploaded(
  sessionId: string,
): Promise<UploadSessionSnapshot> {
  const record = await readSessionFromDisk(sessionId);
  if (!record) {
    throw new UploadSessionError("Upload session не найдена", 404);
  }
  if (record.nextChunkIndex !== record.totalChunks) {
    throw new UploadSessionError("Не все чанки загружены", 409);
  }
  return { ...record };
}

export function getUploadedBytes(session: UploadSessionSnapshot): number {
  if (session.nextChunkIndex >= session.totalChunks) {
    return session.fileSize;
  }
  return Math.min(session.fileSize, session.nextChunkIndex * session.chunkSize);
}

// Helper to make sure temporary directory exists on first import.
void ensureTempDir().catch((error) => {
  console.error(
    "Не удалось создать временную директорию для загрузок ImageKit",
    error,
  );
});
