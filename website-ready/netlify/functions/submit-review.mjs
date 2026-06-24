import { getStore } from "@netlify/blobs";

// Receives a guest review. 4-5 star reviews are saved for public display.
// (Every review is also emailed to the host via Netlify Forms, handled on the page.)
export default async (req) => {
  if (req.method !== "POST") {
    return json({ ok: false, error: "method" }, 405);
  }

  let data;
  try {
    data = await req.json();
  } catch {
    return json({ ok: false, error: "bad-json" }, 400);
  }

  const name = clean(data.name, 80);
  const location = clean(data.location, 80);
  const review = clean(data.review, 1000);
  const rating = parseInt(String(data.rating || ""), 10);

  // basic validation
  if (!name || !review || !(rating >= 1 && rating <= 5)) {
    return json({ ok: false, error: "invalid" }, 400);
  }

  // Only 4 & 5 star reviews are published on the site.
  if (rating < 4) {
    return json({ ok: true, posted: false });
  }

  const store = getStore("reviews");
  let list = [];
  try {
    const existing = await store.get("public", { type: "json" });
    if (Array.isArray(existing)) list = existing;
  } catch {
    // first review, nothing stored yet
  }

  list.unshift({
    name,
    location,
    rating,
    review,
    date: new Date().toISOString(),
  });
  list = list.slice(0, 300); // keep it bounded

  await store.setJSON("public", list);

  return json({ ok: true, posted: true });
};

function clean(v, max) {
  return String(v == null ? "" : v).replace(/\s+/g, " ").trim().slice(0, max);
}

function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { "content-type": "application/json" },
  });
}
