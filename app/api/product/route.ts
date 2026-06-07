import { NextResponse } from "next/server";
import { getProduct } from "@/lib/printify";

export async function GET() {
  try {
    const product = await getProduct();
    return NextResponse.json(product);
  } catch (err) {
    // Log the real error server-side; return a generic message so we don't leak
    // Printify API response bodies / internals to the client.
    console.error("GET /api/product failed", err);
    return NextResponse.json(
      { error: "Failed to load product" },
      { status: 500 },
    );
  }
}
