import { prisma } from "../config/db.js";

async function main() {
  const cs = await prisma.courtService.findMany({
    where: { courtId: "c0001" },
    include: {
      service: {
        include: { inventory: true }
      }
    }
  });
  console.log(`Court c0001 has ${cs.length} court_services:`);
  for (const item of cs) {
    console.log(`- [${item.id}] ${item.name} | price=${item.price} | type=${item.service?.type} | stock=${item.service?.inventory?.quantity ?? 'none'}`);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
