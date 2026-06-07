import { getSupabase } from "./supabase";

export type Review = {
  id: string;
  name: string;
  location: string | null;
  rating: number;
  body: string;
  photo_url: string | null;
  created_at: string;
};

export type ReviewData = {
  reviews: Review[]; // display slice
  count: number; // total approved
  avgRating: number; // average across all approved
};

const EMPTY: ReviewData = { reviews: [], count: 0, avgRating: 0 };

// Fetches APPROVED reviews for the storefront. Returns empty (cold-start) on any
// error or when Supabase isn't configured, so the page never breaks.
export async function getApprovedReviews(displayLimit = 6): Promise<ReviewData> {
  const supabase = getSupabase();
  if (!supabase) return EMPTY;
  try {
    const { data, error } = await supabase
      .from("reviews")
      .select("id,name,location,rating,body,photo_url,created_at")
      .eq("status", "approved")
      .order("created_at", { ascending: false })
      .limit(200);
    if (error || !data || data.length === 0) return EMPTY;
    const count = data.length;
    const avgRating =
      data.reduce((sum, r) => sum + (r.rating ?? 0), 0) / count;
    return { reviews: data.slice(0, displayLimit) as Review[], count, avgRating };
  } catch {
    return EMPTY;
  }
}
