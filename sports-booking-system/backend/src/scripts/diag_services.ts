import { prisma } from "../config/db.js";

async function main() {
  const users = await prisma.user.findMany({
    where: { role: "USER" },
    select: { id: true, email: true, fullName: true, phone: true },
    take: 10
  });
  console.log("--- USERS ---");
  console.log(JSON.stringify(users, null, 2));

  const pp01Services = await prisma.service.findMany({
    where: { partnerId: "pp0001" },
    include: {
      inventory: true,
      courtServices: { where: { courtId: "c0001" } }
    }
  });
  console.log("--- PP0001 SERVICES ---");
  console.log(JSON.stringify(pp01Services, null, 2));

  const courtPrices = await prisma.courtPrice.findMany({
    where: { courtId: "c0001" }
  });
  console.log("--- C0001 PRICES ---");
  console.log(JSON.stringify(courtPrices, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
