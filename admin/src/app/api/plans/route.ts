import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const plans = await prisma.plan.findMany({
      include: { category: true, _count: { select: { vps: true } } },
      orderBy: { priceMonthly: "asc" },
    });
    return NextResponse.json(plans);
  } catch (e) {
    console.error(e);
    return NextResponse.json([], { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    // Ensure a default category exists
    let cat = await prisma.planCategory.findFirst({ where: { name: "VPS" } });
    if (!cat) {
      cat = await prisma.planCategory.create({ data: { name: "VPS", description: "Virtual Private Servers" } });
    }
    const plan = await prisma.plan.create({
      data: {
        name: body.name,
        categoryId: cat.id,
        priceMonthly: body.priceMonthly,
        priceYearly: body.priceMonthly * 10,
        ram: body.ram,
        cpu: body.cpu,
        storage: body.storage,
        bandwidth: body.bandwidth,
      },
    });
    return NextResponse.json(plan, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to create plan" }, { status: 500 });
  }
}
