import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface FeedEvent {
  id: string;
  source: string;
  disaster_type: string;
  title: string;
  description: string;
  latitude: number | null;
  longitude: number | null;
  location: string;
  severity: "low" | "medium" | "high" | "critical";
  magnitude: number | null;
  timestamp: string;
  url: string | null;
}

function severityFromMagnitude(m: number): FeedEvent["severity"] {
  if (m >= 7) return "critical";
  if (m >= 6) return "high";
  if (m >= 5) return "medium";
  return "low";
}

function severityFromGdacs(alertlevel: string): FeedEvent["severity"] {
  if (alertlevel === "Red") return "critical";
  if (alertlevel === "Orange") return "high";
  if (alertlevel === "Green") return "medium";
  return "low";
}

async function fetchUsgsEarthquakes(): Promise<FeedEvent[]> {
  try {
    const res = await fetch(
      "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/significant_week.geojson",
      { signal: AbortSignal.timeout(8000) }
    );
    if (!res.ok) return [];
    const data = await res.json();
    return (data.features ?? []).slice(0, 20).map((f: any) => {
      const p = f.properties ?? {};
      const coords = f.geometry?.coordinates ?? [0, 0, 0];
      return {
        id: `usgs-${f.id ?? Math.random()}`,
        source: "USGS",
        disaster_type: "earthquake",
        title: p.place ?? "Earthquake",
        description: `Magnitude ${p.mag ?? "?"} earthquake detected`,
        latitude: coords[1],
        longitude: coords[0],
        location: p.place ?? "Unknown",
        severity: severityFromMagnitude(p.mag ?? 0),
        magnitude: p.mag ?? null,
        timestamp: new Date(p.time ?? Date.now()).toISOString(),
        url: p.url ?? null,
      } as FeedEvent;
    });
  } catch {
    return [];
  }
}

async function fetchGdacs(): Promise<FeedEvent[]> {
  try {
    const res = await fetch(
      "https://www.gdacs.org/gdacs/rss.aspx?from=GDACS&profile=ALL",
      { signal: AbortSignal.timeout(8000) }
    );
    if (!res.ok) return [];
    const text = await res.text();
    const events: FeedEvent[] = [];
    const items = text.match(/<item>([\s\S]*?)<\/item>/g) ?? [];
    for (const item of items.slice(0, 30)) {
      const title = item.match(/<title><!\[CDATA\[(.*?)\]\]>/)?.[1] ?? "";
      const link = item.match(/<link>(.*?)<\/link>/)?.[1] ?? "";
      const pubDate = item.match(/<pubDate>(.*?)<\/pubDate>/)?.[1] ?? "";
      const desc = item.match(/<description><!\[CDATA\[([\s\S]*?)\]\]>/)?.[1] ?? "";
      const lat = parseFloat(item.match(/<geo:lat>([\d.\-]+)<\/geo:lat>/)?.[1] ?? "0");
      const lon = parseFloat(item.match(/<geo:long>([\d.\-]+)<\/geo:long>/)?.[1] ?? "0");

      let disaster_type = "other";
      let alertlevel = "Green";
      if (/flood/i.test(title)) disaster_type = "flood";
      else if (/cyclone|tropical storm|hurricane|typhoon/i.test(title)) disaster_type = "cyclone";
      else if (/earthquake/i.test(title)) disaster_type = "earthquake";
      else if (/landslide/i.test(title)) disaster_type = "landslide";
      else if (/wildfire|fire/i.test(title)) disaster_type = "wildfire";
      else if (/heat/i.test(title)) disaster_type = "heatwave";

      const alertMatch = desc.match(/Alert level:?\s*(Red|Orange|Green)/i);
      if (alertMatch) alertlevel = alertMatch[1];

      events.push({
        id: `gdacs-${Buffer.from(title).toString("hex").slice(0, 16)}`,
        source: "GDACS",
        disaster_type,
        title,
        description: desc.replace(/<[^>]*>/g, "").slice(0, 300),
        latitude: lat || null,
        longitude: lon || null,
        location: title.split(" - ")[0] ?? title,
        severity: severityFromGdacs(alertlevel),
        magnitude: null,
        timestamp: pubDate ? new Date(pubDate).toISOString() : new Date().toISOString(),
        url: link || null,
      });
    }
    return events;
  } catch {
    return [];
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const [earthquakes, gdacs] = await Promise.all([
      fetchUsgsEarthquakes(),
      fetchGdacs(),
    ]);

    const events = [...earthquakes, ...gdacs].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    return new Response(
      JSON.stringify({ events, count: events.length, fetched_at: new Date().toISOString() }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message, events: [] }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
