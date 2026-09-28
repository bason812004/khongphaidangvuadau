import { prisma } from "../config/db.js";

async function main() {
  const cols = await prisma.$queryRawUnsafe(`
    SELECT table_name, column_name, data_type, udt_name
    FROM information_schema.columns
    WHERE table_name IN ('services', 'service_inventories', 'inventory_transactions', 'court_services', 'booking_services')
      AND column_name IN ('id', 'service_id', 'court_service_id')
    ORDER BY table_name, column_name;
  `);
  console.log("Column types:", cols);
}

main().catch(console.error).finally(() => prisma.$disconnect());
