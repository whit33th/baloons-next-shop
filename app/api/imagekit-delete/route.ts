import { convexAuthNextjsToken } from "@convex-dev/auth/nextjs/server";
import { fetchQuery } from "convex/nextjs";
import { type NextRequest, NextResponse } from "next/server";
import { api } from "@/convex/_generated/api";
import { getImageKitServerClient } from "@/lib/server/imagekitClient";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  // Проверка авторизации и прав администратора
  const token = await convexAuthNextjsToken();
  if (!token) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 },
    );
  }

  const user = await fetchQuery(api.auth.loggedInUser, {}, { token });
  if (!user || !user.isAdmin) {
    return NextResponse.json(
      { error: "Forbidden: Admin access required" },
      { status: 403 },
    );
  }

  const body = (await request.json().catch(() => null)) as {
    fileId?: string;
  } | null;
  const fileId = body?.fileId?.trim();

  if (!fileId) {
    return NextResponse.json({ error: "fileId is required" }, { status: 400 });
  }

  try {
    const client = getImageKitServerClient();
    await client.files.delete(fileId);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("ImageKit delete error", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to delete previous avatar",
      },
      { status: 500 },
    );
  }
}
