import { convexAuthNextjsToken } from "@convex-dev/auth/nextjs/server";
import { getUploadAuthParams } from "@imagekit/next/server";
import { fetchQuery } from "convex/nextjs";
import { NextResponse } from "next/server";
import { api } from "@/convex/_generated/api";

export const runtime = "nodejs";

export async function GET() {
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

  try {
    const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;
    const publicKey =
      process.env.IMAGEKIT_PUBLIC_KEY ??
      process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY;

    if (!privateKey || !publicKey) {
      return NextResponse.json(
        {
          error:
            "ImageKit ключи не настроены. Проверьте IMAGEKIT_PRIVATE_KEY и IMAGEKIT_PUBLIC_KEY.",
        },
        { status: 500 },
      );
    }

    const authParams = getUploadAuthParams({ privateKey, publicKey });

    return NextResponse.json(
      {
        ...authParams,
        publicKey,
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store, max-age=0",
        },
      },
    );
  } catch (error) {
    console.error("ImageKit upload auth error", error);
    return NextResponse.json(
      {
        error:
          "Не удалось подготовить параметры авторизации для загрузки. Попробуйте снова.",
      },
      { status: 500 },
    );
  }
}

