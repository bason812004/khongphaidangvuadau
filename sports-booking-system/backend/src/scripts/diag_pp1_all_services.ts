import { prisma } from "../config/db.js";

async function main() {
  const allPp1Services = await prisma.service.findMany({
    where: { partnerId: "pp0001" },
    select: {
      id: true,
      name: true,
      type: true,
      price: true,
      unit: true,
      status: true,
      trackInventory: true,
      inventory: { select: { quantity: true } },
      courtServices: { where: { courtId: "c0001" }, select: { id: true, isAvailable: true } }
    }
  });
  console.log(`Found ${allPp1Services.length} services for pp0001:`);
  for (const s of allPp1Services) {
    console.log(`- [${s.id}] ${s.name} (${s.type}, ${s.price}đ/${s.unit}): stock=${s.inventory?.quantity ?? 'none'}, courtService=${s.courtServices.length > 0 ? s.courtServices[0].id : 'no'}`);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
