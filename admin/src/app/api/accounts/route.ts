import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const accounts = await prisma.cloudAccount.findMany({
      where: { provider: "digitalocean" },
      orderBy: { createdAt: "desc" },
    });

    // Map CloudAccount to what the frontend DOAccount type expects
    const mapped = accounts.map((acc: any) => ({
      id: acc.id,
      name: acc.name,
      apiKey: (acc.credentials as any)?.apiKey || "",
      status: acc.status,
      limit: acc.vmLimit,
      usage: acc.vmCount,
      createdAt: acc.createdAt,
    }));

    return NextResponse.json(mapped);
  } catch (e) {
    console.error(e);
    return NextResponse.json([], { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const account = await prisma.cloudAccount.create({
      data: {
        name: body.name,
        provider: "digitalocean",
        credentials: { apiKey: body.apiKey },
        status: "active",
        vmLimit: 10,
        vmCount: 0,
      },
    });
    
    // Return in the format frontend expects
    return NextResponse.json({
      id: account.id,
      name: account.name,
      apiKey: body.apiKey,
      status: account.status,
      limit: account.vmLimit,
      usage: account.vmCount,
      createdAt: account.createdAt,
    }, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to create account" }, { status: 500 });
  }
}
