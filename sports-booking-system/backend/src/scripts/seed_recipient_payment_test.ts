import { prisma } from "../config/db.js";
import { ensureServiceTables } from "../modules/services/service.repository.js";

function timeToDate(timeStr: string): Date {
  return new Date(`1970-01-01T${timeStr}:00.000Z`);
}

function timeToMinutes(timeStr: string): number {
  const [h, m] = timeStr.split(":").map(Number);
  return h * 60 + (m || 0);
}

function minutesToTime(mins: number): string {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

async function findAvailableSlot(
  courtId: string,
  surfaceId: string,
  bookingDate: Date,
  desiredStart: string,
  desiredEnd: string,
  durationHours = 2
): Promise<{ startTime: string; endTime: string }> {
  // Query all non-test active bookings on this surface and date
  const existingBookings = await prisma.booking.findMany({
    where: {
      courtId,
      courtSurfaceId: surfaceId,
      bookingDate,
      bookingStatus: { notIn: ["CANCELLED", "REJECTED"] },
      NOT: {
        bookingCode: { startsWith: "TEST-RECIPIENT-20260928-" }
      }
    },
    select: { startTime: true, endTime: true, bookingCode: true }
  });

  const isConflict = (startStr: string, endStr: string) => {
    const sM = timeToMinutes(startStr);
    const eM = timeToMinutes(endStr);
    return existingBookings.some((b) => {
      const bStartStr = b.startTime instanceof Date ? b.startTime.toISOString().slice(11, 16) : String(b.startTime).slice(0, 5);
      const bEndStr = b.endTime instanceof Date ? b.endTime.toISOString().slice(11, 16) : String(b.endTime).slice(0, 5);
      const bSM = timeToMinutes(bStartStr);
      const bEM = timeToMinutes(bEndStr);
      return sM < bEM && eM > bSM;
    });
  };

  // If desired slot has no conflict, use it
  if (!isConflict(desiredStart, desiredEnd)) {
    return { startTime: desiredStart, endTime: desiredEnd };
  }

  // Otherwise, search available 2-hour slots from 06:00 to 22:00
  const candidateSlots: string[] = [
    "15:00", "16:00", "17:00", "14:00", "18:00", "13:00", "19:00", "08:00", "10:00", "20:00"
  ];

  for (const candidateStart of candidateSlots) {
    const candidateEnd = minutesToTime(timeToMinutes(candidateStart) + durationHours * 60);
    if (timeToMinutes(candidateEnd) <= 22 * 60 && !isConflict(candidateStart, candidateEnd)) {
      console.log(`[Khung giờ] ${desiredStart}-${desiredEnd} bị trùng lịch, tự động chuyển sang slot trống: ${candidateStart}-${candidateEnd}`);
      return { startTime: candidateStart, endTime: candidateEnd };
    }
  }

  return { startTime: desiredStart, endTime: desiredEnd };
}

export async function seedRecipientPaymentTest() {
  console.log("================================================================================");
  console.log("=== BẮT ĐẦU SEED DỮ LIỆU BOOKING NGÀY 28/09/2026 CHO RECIPIENT ===");
  console.log("================================================================================");

  // Fast check: only run DDL migrations if services table is missing
  const hasServiceTable = await prisma.$queryRawUnsafe("SELECT 1 FROM services LIMIT 1;").catch(() => null);
  if (!hasServiceTable) {
    await ensureServiceTables();
  }

  // 1. Tìm thông tin Recipient và Sân quản lý
  const recipient = await prisma.user.findFirst({
    where: { role: "RECIPIENT" },
    select: {
      id: true,
      email: true,
      fullName: true,
      phone: true,
      managedCourtId: true,
      partnerId: true,
      managedCourt: {
        select: {
          id: true,
          name: true,
          partnerId: true,
          surfaces: {
            where: { status: "ACTIVE" },
            orderBy: { sortOrder: "asc" }
          }
        }
      }
    }
  });

  if (!recipient || !recipient.managedCourtId || !recipient.managedCourt) {
    throw new Error("Không tìm thấy tài khoản RECIPIENT hoặc sân được phân công quản lý!");
  }

  const court = recipient.managedCourt;
  const partnerId = court.partnerId || recipient.partnerId || "pp0001";
  const surfaces = court.surfaces;

  if (surfaces.length === 0) {
    throw new Error(`Sân ${court.name} (ID: ${court.id}) chưa có mặt sân (surfaces) nào!`);
  }

  console.log(`1. Recipient Quản lý: ${recipient.fullName} (${recipient.email})`);
  console.log(`   Sân: ${court.name} (ID: ${court.id}) - Partner: ${partnerId}`);
  console.log(`   Số sân con (surfaces): ${surfaces.length}`);

  // 2. Đảm bảo đầy đủ 6 sản phẩm/dịch vụ test với tồn kho > 0 cho Partner và Court
  console.log("\n2. Kiểm tra danh mục sản phẩm / dịch vụ & tồn kho:");

  // Helper đảm bảo sản phẩm và kho
  async function ensureProductService(data: {
    name: string;
    type: "PRODUCT" | "RENTAL_SERVICE";
    price: number;
    costPrice: number;
    unit: string;
    targetStock: number;
  }) {
    let svc = await prisma.service.findFirst({
      where: { partnerId, name: data.name }
    });

    if (!svc) {
      svc = await prisma.service.create({
        data: {
          partnerId,
          name: data.name,
          type: data.type,
          price: data.price,
          costPrice: data.costPrice,
          unit: data.unit,
          status: "ACTIVE",
          trackInventory: true
        }
      });
      console.log(`   + Đã tạo dịch vụ mới: "${data.name}" (${data.price.toLocaleString("vi-VN")} đ/${data.unit})`);
    }

    // Đảm bảo tồn kho
    let inv = await prisma.serviceInventory.findUnique({
      where: { serviceId: svc.id }
    });

    if (!inv) {
      inv = await prisma.serviceInventory.create({
        data: {
          serviceId: svc.id,
          quantity: data.targetStock,
          reservedQuantity: 0,
          minimumStock: 5,
          unit: data.unit,
          lastPurchasePrice: data.costPrice
        }
      });
      console.log(`   + Đã khởi tạo tồn kho cho "${data.name}": ${data.targetStock} ${data.unit}`);
    } else if (inv.quantity < 10) {
      inv = await prisma.serviceInventory.update({
        where: { id: inv.id },
        data: { quantity: data.targetStock, reservedQuantity: 0 }
      });
      console.log(`   + Đã cập nhật lại tồn kho "${data.name}": ${data.targetStock} ${data.unit}`);
    }

    // Đảm bảo liên kết trong court_services cho sân c0001
    let cs = await prisma.courtService.findFirst({
      where: { courtId: court.id, serviceId: svc.id }
    });

    if (!cs) {
      const csId = `cs_${court.id}_${Math.random().toString(36).slice(2, 10)}`;
      cs = await prisma.courtService.create({
        data: {
          id: csId,
          courtId: court.id,
          serviceId: svc.id,
          name: data.name,
          price: data.price,
          isAvailable: true,
          status: "ACTIVE"
        }
      });
      console.log(`   + Đã gắn vào menu POS sân: "${data.name}" (${cs.id})`);
    }

    return { service: svc, inventory: inv, courtService: cs };
  }

  const p1 = await ensureProductService({
    name: "7Up Vị Chanh 330ml",
    type: "PRODUCT",
    price: 12000,
    costPrice: 7000,
    unit: "lon",
    targetStock: 50
  });

  const p2 = await ensureProductService({
    name: "Nước suối Aquafina 500ml",
    type: "PRODUCT",
    price: 10000,
    costPrice: 4000,
    unit: "chai",
    targetStock: 50
  });

  const p3 = await ensureProductService({
    name: "Bánh Mì Chả Pate",
    type: "PRODUCT",
    price: 20000,
    costPrice: 12000,
    unit: "ổ",
    targetStock: 50
  });

  const p4 = await ensureProductService({
    name: "Hộp Dưa Hấu Ướp Lạnh",
    type: "PRODUCT",
    price: 25000,
    costPrice: 15000,
    unit: "hộp",
    targetStock: 50
  });

  const p5 = await ensureProductService({
    name: "Cho Thuê Vợt Cầu Lông Cao Cấp",
    type: "RENTAL_SERVICE",
    price: 50000,
    costPrice: 10000,
    unit: "lượt",
    targetStock: 50
  });

  const p6 = await ensureProductService({
    name: "Quả Cầu Lông Ba Sao Đỏ",
    type: "PRODUCT",
    price: 15000,
    costPrice: 10000,
    unit: "quả",
    targetStock: 50
  });

  console.log(`   -> 6 mặt hàng test đều đã sẵn sàng trong kho và POS với số lượng >= 50.`);

  // 3. Khách hàng test
  console.log("\n3. Xác định khách hàng test:");
  async function ensureCustomer(phone: string, fullName: string, email: string) {
    let user = await prisma.user.findFirst({
      where: { OR: [{ phone }, { email }] }
    });
    if (!user) {
      user = await prisma.user.create({
        data: {
          fullName,
          phone,
          email,
          role: "USER",
          status: "ACTIVE"
        }
      });
      console.log(`   + Tạo khách hàng mới: ${fullName} (${phone})`);
    } else {
      console.log(`   * Sử dụng khách hàng có sẵn: ${user.fullName} (${user.phone}) - ID: ${user.id}`);
    }
    return user;
  }

  const customer1 = await ensureCustomer("0900000021", "Le Minh Anh", "user1@sportsbooking.com");
  const customer2 = await ensureCustomer("0900000022", "Pham Gia Bao", "user2@sportsbooking.com");
  const customer3 = await ensureCustomer("0900000023", "Hoang Thu Ha", "user3@sportsbooking.com");

  // 4. Chuẩn bị 3 kịch bản booking cho ngày 28/09/2026
  const targetDateStr = "2026-09-28";
  const targetBookingDate = new Date(`${targetDateStr}T00:00:00.000Z`);

  const s1 = surfaces[0] || surfaces[0];
  const s2 = surfaces[1] || surfaces[0];
  const s3 = surfaces[2] || surfaces[0];

  const slot1 = await findAvailableSlot(court.id, s1.id, targetBookingDate, "15:00", "17:00", 2);
  const slot2 = await findAvailableSlot(court.id, s2.id, targetBookingDate, "16:00", "18:00", 2);
  const slot3 = await findAvailableSlot(court.id, s3.id, targetBookingDate, "17:00", "19:00", 2);

  const bookingScenarios = [
    {
      code: "TEST-RECIPIENT-20260928-001",
      customer: customer1,
      surface: s1,
      startTime: slot1.startTime,
      endTime: slot1.endTime,
      price: 240000,
      deposit: 0,
      bookingStatus: "IN_PROGRESS" as const,
      paymentStatus: "UNPAID" as const,
      checkedInAt: new Date("2026-09-28T15:05:00.000Z"),
      purpose: "Test khách đang sử dụng sân và phát sinh dịch vụ tại quầy"
    },
    {
      code: "TEST-RECIPIENT-20260928-002",
      customer: customer2,
      surface: s2,
      startTime: slot2.startTime,
      endTime: slot2.endTime,
      price: 300000,
      deposit: 0,
      bookingStatus: "IN_PROGRESS" as const,
      paymentStatus: "UNPAID" as const,
      checkedInAt: new Date("2026-09-28T16:05:00.000Z"),
      purpose: "Test thêm nhiều dịch vụ và đồ ăn thức uống"
    },
    {
      code: "TEST-RECIPIENT-20260928-003",
      customer: customer3,
      surface: s3,
      startTime: slot3.startTime,
      endTime: slot3.endTime,
      price: 360000,
      deposit: 0,
      bookingStatus: "CONFIRMED" as const,
      paymentStatus: "UNPAID" as const,
      checkedInAt: null,
      purpose: "Test booking xác nhận chưa thanh toán"
    }
  ];

  console.log("\n4. Tạo và đồng bộ 3 booking test (Idempotent):");
  const seededResults = [];

  for (const sc of bookingScenarios) {
    // Kiểm tra booking đã tồn tại chưa
    let booking = await prisma.booking.findUnique({
      where: { bookingCode: sc.code }
    });

    if (booking) {
      // Đã tồn tại -> Hoàn trả tồn kho từ các dịch vụ test cũ nếu có, sau đó đưa về trạng thái sạch ban đầu
      const oldServices = await prisma.bookingService.findMany({
        where: { bookingId: booking.id, status: "ACTIVE" }
      });
      for (const obs of oldServices) {
        if (obs.serviceId) {
          await prisma.serviceInventory.updateMany({
            where: { serviceId: obs.serviceId },
            data: { quantity: { increment: obs.quantity } }
          }).catch(() => {});
        }
      }

      await prisma.inventoryTransaction.deleteMany({
        where: { referenceType: "BOOKING_SERVICE", referenceId: booking.id }
      }).catch(() => {});

      await prisma.checkoutPayment.deleteMany({
        where: { checkout: { bookingId: booking.id } }
      }).catch(() => {});

      await prisma.checkout.deleteMany({
        where: { bookingId: booking.id }
      }).catch(() => {});

      await prisma.rentalItem.deleteMany({
        where: { bookingService: { bookingId: booking.id } }
      }).catch(() => {});

      await prisma.bookingService.deleteMany({
        where: { bookingId: booking.id }
      }).catch(() => {});

      await prisma.bookingSlot.deleteMany({
        where: { bookingId: booking.id }
      }).catch(() => {});

      await prisma.payment.deleteMany({
        where: { bookingId: booking.id }
      }).catch(() => {});

      booking = await prisma.booking.update({
        where: { id: booking.id },
        data: {
          userId: sc.customer.id,
          courtId: court.id,
          courtSurfaceId: sc.surface.id,
          bookingDate: targetBookingDate,
          startTime: timeToDate(sc.startTime),
          endTime: timeToDate(sc.endTime),
          totalPrice: sc.price,
          basePrice: sc.price,
          subtotal: sc.price,
          depositAmount: sc.deposit,
          bookingStatus: sc.bookingStatus,
          paymentStatus: sc.paymentStatus,
          paymentMethod: "CASH",
          checkedInAt: sc.checkedInAt,
          note: sc.purpose
        }
      });
      console.log(`   * Cập nhật lại booking test có sẵn: ${sc.code} -> UNPAID, 0 dịch vụ`);
    } else {
      booking = await prisma.booking.create({
        data: {
          bookingCode: sc.code,
          userId: sc.customer.id,
          courtId: court.id,
          courtSurfaceId: sc.surface.id,
          bookingDate: targetBookingDate,
          startTime: timeToDate(sc.startTime),
          endTime: timeToDate(sc.endTime),
          totalPrice: sc.price,
          basePrice: sc.price,
          subtotal: sc.price,
          depositAmount: sc.deposit,
          bookingStatus: sc.bookingStatus,
          paymentStatus: sc.paymentStatus,
          paymentMethod: "CASH",
          checkedInAt: sc.checkedInAt,
          note: sc.purpose
        }
      });
      console.log(`   + Tạo mới booking test: ${sc.code}`);
    }

    // Tạo booking_slot
    await prisma.bookingSlot.create({
      data: {
        bookingId: booking.id,
        courtId: court.id,
        court_surface_id: sc.surface.id,
        bookingDate: targetBookingDate,
        startTime: timeToDate(sc.startTime),
        endTime: timeToDate(sc.endTime),
        slotPrice: sc.price
      }
    });

    // Tạo bản ghi Checkout sạch ban đầu (chưa có dịch vụ nào)
    const checkout = await prisma.checkout.create({
      data: {
        bookingId: booking.id,
        subtotalCourt: sc.price,
        subtotalService: 0,
        discount: 0,
        depositPaid: sc.deposit,
        amountPaid: sc.deposit,
        remainingAmount: sc.price - sc.deposit,
        totalAmount: sc.price,
        status: "PENDING",
        notes: sc.purpose
      }
    });

    seededResults.push({
      bookingId: booking.id,
      bookingCode: booking.bookingCode,
      customerName: sc.customer.fullName,
      customerPhone: sc.customer.phone,
      courtName: court.name,
      surfaceName: `${sc.surface.name} (${sc.surface.code})`,
      bookingDate: targetDateStr,
      time: `${sc.startTime} - ${sc.endTime}`,
      courtFee: sc.price,
      serviceFee: 0,
      totalAmount: sc.price,
      depositPaid: sc.deposit,
      remainingAmount: sc.price - sc.deposit,
      bookingStatus: sc.bookingStatus,
      paymentStatus: sc.paymentStatus,
      checkoutId: checkout.id,
      purpose: sc.purpose
    });
  }

  console.log("================================================================================");
  console.log(`ĐÃ SEED THÀNH CÔNG ${seededResults.length} BOOKING TEST NGÀY ${targetDateStr}:`);
  for (const item of seededResults) {
    console.log(`- Mã: ${item.bookingCode} | Khách: ${item.customerName} (${item.customerPhone}) | Sân con: ${item.surfaceName}`);
    console.log(`  Giờ: ${item.time} | Trạng thái: ${item.bookingStatus} | Thanh toán: ${item.paymentStatus} | Tiền sân: ${item.courtFee.toLocaleString("vi-VN")} đ`);
  }
  console.log("================================================================================");

  return {
    recipient: {
      id: recipient.id,
      name: recipient.fullName,
      email: recipient.email,
      courtId: court.id,
      courtName: court.name
    },
    date: targetDateStr,
    count: seededResults.length,
    bookings: seededResults
  };
}

if (process.argv[1]?.endsWith("seed_recipient_payment_test.ts") || process.argv[1]?.endsWith("seed_recipient_payment_test.js")) {
  seedRecipientPaymentTest()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error("Lỗi khi seed dữ liệu test:", err);
      process.exit(1);
    });
}
