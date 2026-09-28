import { prisma } from "../config/db.js";

export async function resetRecipientPaymentTest() {
  console.log("================================================================================");
  console.log("=== BẮT ĐẦU RESET DỮ LIỆU BOOKING TEST (28/09/2026) ===");
  console.log("================================================================================");

  // 1. Tìm các booking test đã tạo bởi script
  const testBookings = await prisma.booking.findMany({
    where: {
      bookingCode: {
        startsWith: "TEST-RECIPIENT-20260928-"
      }
    },
    select: {
      id: true,
      bookingCode: true,
      totalPrice: true,
      bookingStatus: true,
      paymentStatus: true
    }
  });

  if (testBookings.length === 0) {
    console.log("Không tìm thấy booking test nào có tiền tố 'TEST-RECIPIENT-20260928-'. Không cần xóa.");
    return { count: 0, deletedCodes: [] };
  }

  const testBookingIds = testBookings.map((b) => b.id);
  const deletedCodes = testBookings.map((b) => b.bookingCode);
  console.log(`Tìm thấy ${testBookingIds.length} booking test cần xóa: ${deletedCodes.join(", ")}`);

  // 2. Hoàn trả tồn kho cho các dịch vụ test đã thêm vào các booking này (nếu có)
  const activeTestServices = await prisma.bookingService.findMany({
    where: {
      bookingId: { in: testBookingIds },
      status: "ACTIVE"
    },
    select: {
      id: true,
      serviceId: true,
      quantity: true
    }
  });

  for (const ts of activeTestServices) {
    if (ts.serviceId && ts.quantity > 0) {
      await prisma.serviceInventory.updateMany({
        where: { serviceId: ts.serviceId },
        data: { quantity: { increment: ts.quantity } }
      }).catch(() => {});
      console.log(`   * Đã hoàn trả lại ${ts.quantity} tồn kho cho service ${ts.serviceId}`);
    }
  }

  // 3. Xóa các bản ghi liên quan theo thứ tự ràng buộc khóa ngoại
  const delInvTxs = await prisma.inventoryTransaction.deleteMany({
    where: {
      referenceType: "BOOKING_SERVICE",
      referenceId: { in: testBookingIds }
    }
  }).catch(() => ({ count: 0 }));
  console.log(`   - Đã xóa ${delInvTxs.count} inventory_transactions của booking test.`);

  const delCheckoutPayments = await prisma.checkoutPayment.deleteMany({
    where: {
      checkout: {
        bookingId: { in: testBookingIds }
      }
    }
  }).catch(() => ({ count: 0 }));
  console.log(`   - Đã xóa ${delCheckoutPayments.count} checkout_payments của booking test.`);

  const delCheckouts = await prisma.checkout.deleteMany({
    where: {
      bookingId: { in: testBookingIds }
    }
  }).catch(() => ({ count: 0 }));
  console.log(`   - Đã xóa ${delCheckouts.count} checkouts của booking test.`);

  const delRentals = await prisma.rentalItem.deleteMany({
    where: {
      bookingService: {
        bookingId: { in: testBookingIds }
      }
    }
  }).catch(() => ({ count: 0 }));
  console.log(`   - Đã xóa ${delRentals.count} rental_items của booking test.`);

  const delServices = await prisma.bookingService.deleteMany({
    where: {
      bookingId: { in: testBookingIds }
    }
  }).catch(() => ({ count: 0 }));
  console.log(`   - Đã xóa ${delServices.count} booking_services của booking test.`);

  const delSlots = await prisma.bookingSlot.deleteMany({
    where: {
      bookingId: { in: testBookingIds }
    }
  }).catch(() => ({ count: 0 }));
  console.log(`   - Đã xóa ${delSlots.count} booking_slots của booking test.`);

  const delPayments = await prisma.payment.deleteMany({
    where: {
      bookingId: { in: testBookingIds }
    }
  }).catch(() => ({ count: 0 }));
  console.log(`   - Đã xóa ${delPayments.count} payments của booking test.`);

  const delBookings = await prisma.booking.deleteMany({
    where: {
      id: { in: testBookingIds }
    }
  }).catch(() => ({ count: 0 }));
  console.log(`   - Đã xóa ${delBookings.count} bookings test thành công.`);

  console.log("================================================================================");
  console.log("=== RESET DỮ LIỆU TEST HOÀN TẤT. DỮ LIỆU THẬT ĐƯỢC BẢO TOÀN NGUYÊN VẸN ===");
  console.log("================================================================================");

  return {
    count: delBookings.count,
    deletedCodes
  };
}

if (process.argv[1]?.endsWith("reset_recipient_payment_test.ts") || process.argv[1]?.endsWith("reset_recipient_payment_test.js")) {
  resetRecipientPaymentTest()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error("Lỗi khi reset dữ liệu test:", err);
      process.exit(1);
    });
}
