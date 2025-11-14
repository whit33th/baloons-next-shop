import { createReadStream } from "node:fs";

import { type NextRequest, NextResponse } from "next/server";

import {
  cleanupExpiredSessions,
  discardUploadSession,
  ensureAllChunksUploaded,
  UploadSessionError,
} from "@/lib/server/chunkedUploadStore";
import { getImageKitServerClient } from "@/lib/server/imagekitClient";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const body = (await request.json()) as {
    sessionId?: string;
    folder?: string;
  };
  const sessionId = body?.sessionId;

  if (!sessionId) {
    return NextResponse.json(
      { error: "Параметр sessionId обязателен" },
      { status: 400 },
    );
  }

  try {
    await cleanupExpiredSessions();
    const session = await ensureAllChunksUploaded(sessionId);
    const folder =
      body?.folder?.trim() ||
      process.env.NEXT_PUBLIC_IMAGEKIT_PRODUCTS_FOLDER ||
      "/products";

    const imagekit = getImageKitServerClient();
    const uploadResponse = await imagekit.files.upload({
      file: createReadStream(session.tempFilePath),
      fileName: session.fileName,
      folder,
      useUniqueFileName: true,
    });

    await discardUploadSession(sessionId);

    return NextResponse.json({
      url: uploadResponse.url,
      fileId: uploadResponse.fileId,
      name: uploadResponse.name,
    });
  } catch (error) {
    const status = error instanceof UploadSessionError ? error.status : 500;
    const message =
      error instanceof Error ? error.message : "Не удалось завершить загрузку";
    console.error("ImageKit finalize upload error", error);
    return NextResponse.json({ error: message }, { status });
  }
}
