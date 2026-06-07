import { type NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

export const runtime = "nodejs";

const MAX_PHOTO_BYTES = 5 * 1024 * 1024; // 5MB

// Verify the ACTUAL file bytes (magic numbers) rather than trusting the
// client-claimed Content-Type, which is trivially spoofable.
function sniffImageType(
  buf: Buffer,
): "image/jpeg" | "image/png" | "image/webp" | null {
  if (buf.length >= 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) {
    return "image/jpeg";
  }
  if (
    buf.length >= 8 &&
    buf[0] === 0x89 &&
    buf[1] === 0x50 &&
    buf[2] === 0x4e &&
    buf[3] === 0x47 &&
    buf[4] === 0x0d &&
    buf[5] === 0x0a &&
    buf[6] === 0x1a &&
    buf[7] === 0x0a
  ) {
    return "image/png";
  }
  if (
    buf.length >= 12 &&
    buf.toString("ascii", 0, 4) === "RIFF" &&
    buf.toString("ascii", 8, 12) === "WEBP"
  ) {
    return "image/webp";
  }
  return null;
}

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const name = String(form.get("name") ?? "").trim();
    const location = String(form.get("location") ?? "").trim();
    const rating = Number(form.get("rating"));
    const body = String(form.get("body") ?? "").trim();
    const orderId = String(form.get("order_id") ?? "").trim();
    const honeypot = String(form.get("company") ?? "").trim(); // bots fill this

    // Bots fill the hidden honeypot — silently accept so they don't retry.
    if (honeypot) return NextResponse.json({ ok: true });

    if (!name || name.length > 80) {
      return NextResponse.json({ error: "Please add your name." }, { status: 400 });
    }
    if (location.length > 80) {
      return NextResponse.json(
        { error: "Location must be under 80 characters." },
        { status: 400 },
      );
    }
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: "Please pick a star rating." },
        { status: 400 },
      );
    }
    if (!body || body.length < 3 || body.length > 1000) {
      return NextResponse.json(
        { error: "Please write a short review." },
        { status: 400 },
      );
    }

    const supabase = getSupabase();
    if (!supabase) {
      return NextResponse.json(
        { error: "Reviews are temporarily unavailable." },
        { status: 503 },
      );
    }

    // Optional photo → verify it's a real image, then upload to the public bucket.
    let photoUrl: string | null = null;
    const photo = form.get("photo");
    if (photo instanceof File && photo.size > 0) {
      if (photo.size > MAX_PHOTO_BYTES) {
        return NextResponse.json(
          { error: "Photo must be under 5MB." },
          { status: 400 },
        );
      }
      const buf = Buffer.from(await photo.arrayBuffer());
      const realType = sniffImageType(buf); // ignore the client-claimed type
      if (!realType) {
        return NextResponse.json(
          { error: "Photo must be a JPG, PNG, or WEBP image." },
          { status: 400 },
        );
      }
      const ext =
        realType === "image/png" ? "png" : realType === "image/webp" ? "webp" : "jpg";
      const path = `reviews/${crypto.randomUUID()}.${ext}`;
      const up = await supabase.storage
        .from("review-photos")
        .upload(path, buf, { contentType: realType, upsert: false });
      if (up.error) {
        // Non-fatal: save the review without the photo rather than rejecting it.
        console.error("review photo upload failed", up.error);
      } else {
        photoUrl = supabase.storage.from("review-photos").getPublicUrl(path)
          .data.publicUrl;
      }
    }

    const { error } = await supabase.from("reviews").insert({
      name,
      location: location || null,
      rating,
      body,
      photo_url: photoUrl,
      order_id: orderId || null,
      status: "pending",
    });
    if (error) {
      console.error("review insert failed", error);
      return NextResponse.json(
        { error: "Couldn't save your review. Please try again." },
        { status: 500 },
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("POST /api/reviews failed", err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
