import { type NextRequest, NextResponse } from "next/server";

import {
  cleanupExpiredSessions,
  createUploadSession,
  getUploadedBytes,
  getUploadSession,
  UploadSessionError,
} from "@/lib/server/chunkedUploadStore";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      fileName?: string;
      fileSize?: number;
      mimeType?: string;
    };

    await cleanupExpiredSessions();

    const session = await createUploadSession({
      fileName: body?.fileName ?? "",
      fileSize: body?.fileSize ?? 0,
      mimeType: body?.mimeType,
    });

    return NextResponse.json({
      sessionId: session.id,
      chunkSize: session.chunkSize,
      totalChunks: session.totalChunks,
      nextChunkIndex: session.nextChunkIndex,
      uploadedBytes: getUploadedBytes(session),
    });
  } catch (error) {
    const status = error instanceof UploadSessionError ? error.status : 500;
    const message =
      error instanceof Error
        ? error.message
        : "Не удалось инициализировать загрузку";
    console.error("ImageKit upload session error", error);
    return NextResponse.json({ error: message }, { status });
  }
}

export async function GET(request: NextRequest) {
  const sessionId = request.nextUrl.searchParams.get("sessionId");
  if (!sessionId) {
    return NextResponse.json(
      { error: "Параметр sessionId обязателен" },
      { status: 400 },
    );
  }

  await cleanupExpiredSessions();
  const session = await getUploadSession(sessionId);
  if (!session) {
    return NextResponse.json({ error: "Сессия не найдена" }, { status: 404 });
  }

  return NextResponse.json({
    sessionId: session.id,
    chunkSize: session.chunkSize,
    totalChunks: session.totalChunks,
    nextChunkIndex: session.nextChunkIndex,
    uploadedBytes: getUploadedBytes(session),
  });
}
