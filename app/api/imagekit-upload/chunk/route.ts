import { type NextRequest, NextResponse } from "next/server";

import {
  appendChunkToSession,
  cleanupExpiredSessions,
  getUploadedBytes,
  UploadSessionError,
} from "@/lib/server/chunkedUploadStore";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const sessionId = request.nextUrl.searchParams.get("sessionId");
  const chunkIndexParam = request.nextUrl.searchParams.get("chunkIndex");

  if (!sessionId || chunkIndexParam === null) {
    return NextResponse.json(
      { error: "Параметры sessionId и chunkIndex обязательны" },
      { status: 400 },
    );
  }

  const chunkIndex = Number(chunkIndexParam);
  if (!Number.isInteger(chunkIndex) || chunkIndex < 0) {
    return NextResponse.json(
      { error: "Некорректное значение chunkIndex" },
      { status: 400 },
    );
  }

  const buffer = await request.arrayBuffer();
  if (buffer.byteLength === 0) {
    return NextResponse.json(
      { error: "Пустой чанк не может быть загружен" },
      { status: 400 },
    );
  }

  try {
    await cleanupExpiredSessions();
    const session = await appendChunkToSession(sessionId, chunkIndex, buffer);

    return NextResponse.json({
      sessionId: session.id,
      nextChunkIndex: session.nextChunkIndex,
      totalChunks: session.totalChunks,
      uploadedBytes: getUploadedBytes(session),
      progress:
        session.totalChunks === 0
          ? 0
          : session.nextChunkIndex / session.totalChunks,
    });
  } catch (error) {
    const status = error instanceof UploadSessionError ? error.status : 500;
    const message =
      error instanceof Error ? error.message : "Не удалось сохранить чанк";
    console.error("ImageKit chunk upload error", error);
    return NextResponse.json({ error: message }, { status });
  }
}
