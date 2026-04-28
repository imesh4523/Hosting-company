import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { apiKey } = await req.json();

    if (!apiKey || typeof apiKey !== "string" || apiKey.trim().length < 20) {
      return NextResponse.json({ ok: false, message: "Invalid API key format." });
    }

    // Call DigitalOcean API to verify the key
    const res = await fetch("https://api.digitalocean.com/v2/droplets?per_page=1", {
      headers: {
        Authorization: `Bearer ${apiKey.trim()}`,
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      return NextResponse.json({
        ok: false,
        message: errData?.message ?? `API returned status ${res.status}. Check your API key.`,
      });
    }

    const data = await res.json();
    const dropletCount = data?.meta?.total ?? 0;

    return NextResponse.json({
      ok: true,
      message: `Connected successfully! Account has ${dropletCount} active droplet(s).`,
      dropletCount,
    });
  } catch (e) {
    console.error("DO verify error:", e);
    return NextResponse.json({
      ok: false,
      message: "Failed to reach DigitalOcean API. Check your network connection.",
    });
  }
}
