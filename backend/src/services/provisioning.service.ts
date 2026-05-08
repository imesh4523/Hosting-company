import prisma from '../config/prisma.js';

export class ProvisioningService {
  
  public static async provisionOrder(orderId: string) {
    console.log(`[Provisioning] Starting provisioning for order: ${orderId}`);
    
    try {
      const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: { plan: true, user: true }
      });

      if (!order) {
        throw new Error('Order not found');
      }

      // Simulate API call to DigitalOcean or other provider
      await new Promise(resolve => setTimeout(resolve, 2000));

      console.log(`[Provisioning] Resource created for ${order.plan.name} (User: ${order.user.email})`);

      // Update order to active
      await prisma.order.update({
        where: { id: orderId },
        data: { status: 'active' }
      });

      // Optionally create a VM record in the database
      const defaultAccount = await prisma.cloudAccount.findFirst({ where: { status: "active" } });
      if (defaultAccount) {
        await prisma.vM.create({
          data: {
            name: `${order.plan.name}-${Math.floor(Math.random() * 1000)}`,
            status: "provisioning",
            userId: order.userId,
            planId: order.planId,
            cloudAccountId: defaultAccount.id,
            provider: defaultAccount.provider,
          },
        });
      }

      console.log(`[Provisioning] Order ${orderId} is now active.`);
    } catch (error: any) {
      console.error(`[Provisioning] Error: ${error.message}`);
    }
  }
}
