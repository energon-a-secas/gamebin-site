import { httpAction } from "./_generated/server";

export const getPrice = httpAction(async (_ctx, request) => {
  const url = new URL(request.url);
  const appId = url.searchParams.get("appId");
  const cc = url.searchParams.get("cc") || "cl";

  if (!appId || !/^\d{1,10}$/.test(appId)) {
    return new Response(JSON.stringify({ error: "Invalid appId" }), {
      status: 400,
      headers: corsHeaders(),
    });
  }

  try {
    const steamUrl = `https://store.steampowered.com/api/appdetails?appids=${appId}&cc=${cc}&filters=price_overview`;
    const res = await fetch(steamUrl);
    const data = await res.json();

    const appData = data[appId];
    if (!appData || !appData.success) {
      return new Response(JSON.stringify({ price: null, free: false }), {
        status: 200,
        headers: corsHeaders(),
      });
    }

    const info = appData.data;
    if (info.is_free) {
      return new Response(JSON.stringify({ price: null, free: true, formatted: "Free" }), {
        status: 200,
        headers: corsHeaders(),
      });
    }

    const priceData = info.price_overview;
    if (!priceData) {
      return new Response(JSON.stringify({ price: null, free: false }), {
        status: 200,
        headers: corsHeaders(),
      });
    }

    return new Response(JSON.stringify({
      price: priceData.final,
      formatted: priceData.final_formatted,
      discount: priceData.discount_percent,
      original: priceData.initial_formatted || null,
      currency: priceData.currency,
      free: false,
    }), {
      status: 200,
      headers: corsHeaders(),
    });
  } catch {
    return new Response(JSON.stringify({ error: "Steam API unavailable" }), {
      status: 502,
      headers: corsHeaders(),
    });
  }
});

function corsHeaders() {
  return {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

export const getTags = httpAction(async (_ctx, request) => {
  const url = new URL(request.url);
  const appId = url.searchParams.get("appId");

  if (!appId || !/^\d{1,10}$/.test(appId)) {
    return new Response(JSON.stringify({ error: "Invalid appId" }), {
      status: 400,
      headers: corsHeaders(),
    });
  }

  try {
    const steamUrl = `https://store.steampowered.com/api/appdetails?appids=${appId}&filters=genres,categories`;
    const res = await fetch(steamUrl);
    const data = await res.json();

    const appData = data[appId];
    if (!appData || !appData.success) {
      return new Response(JSON.stringify({ tags: [] }), {
        status: 200,
        headers: corsHeaders(),
      });
    }

    const info = appData.data;
    const tags: string[] = [];

    if (info.genres && Array.isArray(info.genres)) {
      for (const g of info.genres) {
        if (g.description) tags.push(g.description);
      }
    }
    if (info.categories && Array.isArray(info.categories)) {
      for (const c of info.categories) {
        if (c.description) tags.push(c.description);
      }
    }

    return new Response(JSON.stringify({ tags: [...new Set(tags)] }), {
      status: 200,
      headers: corsHeaders(),
    });
  } catch {
    return new Response(JSON.stringify({ error: "Steam API unavailable" }), {
      status: 502,
      headers: corsHeaders(),
    });
  }
});

export const options = httpAction(async () => {
  return new Response(null, { status: 204, headers: corsHeaders() });
});
