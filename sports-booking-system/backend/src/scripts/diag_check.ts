import { prisma } from "../config/db.js";

async function main() {
  const recipients = await prisma.user.findMany({
    where: { role: "RECIPIENT" },
    select: { id: true, email: true, fullName: true, phone: true, managedCourtId: true, partnerId: true }
  });
  console.log("--- RECIPIENTS ---");
  console.log(JSON.stringify(recipients, null, 2));

  const courts = await prisma.court.findMany({
    select: {
      id: true,
      name: true,
      partnerId: true,
      surfaces: {
        select: { id: true, code: true, name: true, status: true }
      }
    }
  });
  console.log("--- COURTS & SURFACES ---");
  console.log(JSON.stringify(courts, null, 2));

  const services = await prisma.service.findMany({
    select: {
      id: true,
      partnerId: true,
      name: true,
      type: true,
      price: true,
      unit: true,
      status: true,
      trackInventory: true,
      inventory: {
        select: { quantity: true, reservedQuantity: true }
      }
    }
  });
  console.log("--- SERVICES ---");
  console.log(JSON.stringify(services, null, 2));

  const bookingsToday = await prisma.booking.findMany({
    where: {
      bookingDate: new Date("2026-09-28T00:00:00.000Z")
    },
    select: {
      id: true,
      bookingCode: true,
      courtId: true,
      courtSurfaceId: true,
      startTime: true,
      endTime: true,
      totalPrice: true,
      bookingStatus: true,
      paymentStatus: true,
      user: { select: { fullName: true, phone: true } }
    }
  });
  console.log("--- BOOKINGS ON 2026-09-28 ---");
  console.log(JSON.stringify(bookingsToday, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
