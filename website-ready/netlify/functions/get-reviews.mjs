import { getStore } from "@netlify/blobs";

// Returns the list of published (4-5 star) guest reviews as JSON.
export default async () => {
  const store = getStore("reviews");
  let list = [];
  try {
    const existing = await store.get("public", { type: "json" });
    if (Array.isArray(existing)) list = existing;
  } catch {
    // nothing stored yet
  }
  return new Response(JSON.stringify(list), {
    headers: {
      "content-type": "application/json",
      "cache-control": "no-store",
    },
  });
};
