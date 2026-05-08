import { Router, Request, Response } from "express";
import prisma from "../config/prisma.js";
import { NotificationService } from "../services/notification.service.js";

const router = Router();
const notify = new NotificationService();

// GET /api/admin/support/tickets
router.get("/tickets", async (req: Request, res: Response) => {
  try {
    const { status, priority, page = "1", limit = "50" } = req.query as Record<string, string>;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    if (priority) where.priority = priority;

    const [tickets, total] = await Promise.all([
      prisma.supportTicket.findMany({
        where,
        include: {
          user: { select: { name: true, email: true } },
          messages: { orderBy: { createdAt: "desc" }, take: 1 },
          _count: { select: { messages: true } },
        },
        orderBy: { updatedAt: "desc" },
        skip,
        take: parseInt(limit),
      }),
      prisma.supportTicket.count({ where }),
    ]);

    res.json({ success: true, tickets, total });
  } catch (err) {
    res.status(500).json({ success: false, error: (err as Error).message });
  }
});

// GET /api/admin/support/tickets/:id
router.get("/tickets/:id", async (req: Request, res: Response) => {
  try {
    const ticket = await prisma.supportTicket.findUnique({
      where: { id: req.params.id as string },
      include: {
        user: { select: { id: true, name: true, email: true } },
        messages: { orderBy: { createdAt: "asc" } },
      },
    });
    if (!ticket) { res.status(404).json({ success: false, error: "Ticket not found" }); return; }
    res.json({ success: true, ticket });
  } catch (err) {
    res.status(500).json({ success: false, error: (err as Error).message });
  }
});

// POST /api/admin/support/tickets/:id/reply
router.post("/tickets/:id/reply", async (req: Request, res: Response) => {
  try {
    const { message } = req.body as { message: string };
    if (!message) { res.status(400).json({ success: false, error: "Message required" }); return; }

    const ticket = await prisma.supportTicket.findUnique({ where: { id: req.params.id as string } });
    if (!ticket) { res.status(404).json({ success: false, error: "Ticket not found" }); return; }

    const [msg] = await prisma.$transaction([
      prisma.ticketMessage.create({
        data: { ticketId: ticket.id, sender: "admin", message },
      }),
      prisma.supportTicket.update({
        where: { id: ticket.id },
        data: { status: "pending", updatedAt: new Date() },
      }),
    ]);

    res.json({ success: true, message: msg });
  } catch (err) {
    res.status(500).json({ success: false, error: (err as Error).message });
  }
});

// PUT /api/admin/support/tickets/:id/status
router.put("/tickets/:id/status", async (req: Request, res: Response) => {
  try {
    const { status } = req.body as { status: "open" | "pending" | "resolved" | "closed" };
    const ticket = await prisma.supportTicket.update({
      where: { id: req.params.id as string },
      data: { status },
    });
    res.json({ success: true, ticket });
  } catch (err) {
    res.status(500).json({ success: false, error: (err as Error).message });
  }
});

export default router;
