import { revalidateTag } from "next/cache";
import { NextResponse, type NextRequest } from "next/server";

type RevalidatePayload = {
  tags?: string[];
};

const readSecret = (request: NextRequest): string | null => {
  const auth = request.headers.get("authorization");
  if (auth?.startsWith("Bearer ")) return auth.slice(7).trim();
  return request.headers.get("x-revalidate-secret");
};

export async function POST(request: NextRequest) {
  const expectedSecret = process.env.REVALIDATE_SECRET;

  if (!expectedSecret) {
    return NextResponse.json(
      { success: false, message: "Revalidation secret is not configured." },
      { status: 500 },
    );
  }

  if (readSecret(request) !== expectedSecret) {
    return NextResponse.json(
      { success: false, message: "Unauthorized revalidation request." },
      { status: 401 },
    );
  }

  const payload = (await request.json().catch(() => ({}))) as RevalidatePayload;
  const tags = Array.isArray(payload.tags)
    ? Array.from(new Set(payload.tags.map((tag) => tag.trim()).filter(Boolean)))
    : [];

  if (tags.length === 0) {
    return NextResponse.json(
      { success: false, message: "At least one tag is required." },
      { status: 400 },
    );
  }

  tags.forEach((tag) => revalidateTag(tag, "max"));

  return NextResponse.json({
    success: true,
    revalidated: tags,
    revalidatedAt: new Date().toISOString(),
  });
}
