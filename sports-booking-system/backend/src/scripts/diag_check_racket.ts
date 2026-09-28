import { prisma } from "../config/db.js";

async function main() {
  const sv214 = await prisma.service.findUnique({
    where: { id: "sv0214" },
    include: { inventory: true }
  });
  console.log("sv0214:", sv214);

  const shuttlecocks = await prisma.service.findMany({
    where: {
      partnerId: "pp0001",
      name: { contains: "cầu lông", mode: "insensitive" }
    },
    include: { inventory: true }
  });
  console.log("shuttlecocks:", shuttlecocks);
}

main().catch(console.error).finally(() => prisma.$disconnect());
