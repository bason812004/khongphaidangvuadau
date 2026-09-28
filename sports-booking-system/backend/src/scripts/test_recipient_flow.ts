import { prisma } from "../config/db.js";
import { recipientService } from "../modules/recipient/recipient.service.js";
import { cashierService } from "../modules/cashier/cashier.service.js";
import { checkoutService } from "../modules/checkout/checkout.service.js";
import { bookingService } from "../modules/bookings/booking.service.js";
import { seedRecipientPaymentTest } from "./seed_recipient_payment_test.js";

export async function runTestFlow() {
  console.log("================================================================================");
  console.log("=== BẮT ĐẦU CHẠY TEST FLOW: THANH TOÁN SAU KHI SỬ DỤNG DỊCH VỤ ===");
  console.log("================================================================================");

  // 0. Seed hoặc đảm bảo trạng thái sạch ban đầu
  await seedRecipientPaymentTest();

  // 1. Kiểm tra 3 booking test trong database
  const bookings = await prisma.booking.findMany({
    where: {
      bookingCode: { in: ["TEST-RECIPIENT-20260928-001", "TEST-RECIPIENT-20260928-002", "TEST-RECIPIENT-20260928-003"] }
    },
    include: {
      user: true,
      court: true,
      courtSurface: true,
      bookingSlots: true,
      checkout: true
    },
    orderBy: { bookingCode: "asc" }
  });

  if (bookings.length !== 3) {
    throw new Error(`Kỳ vọng 3 booking test, nhưng tìm thấy ${bookings.length}`);
  }

  console.log("\n[BƯỚC 1] KIỂM TRA DỮ LIỆU SEED TRONG DATABASE:");
  for (const b of bookings) {
    console.log(`- Mã: ${b.bookingCode}`);
    console.log(`  + Khách: ${b.user.fullName} (${b.user.phone})`);
    console.log(`  + Sân: ${b.court.name} - Sân con: ${b.courtSurface?.name} (${b.courtSurface?.code})`);
    console.log(`  + Giờ: ${b.startTime.toISOString().slice(11, 16)} - ${b.endTime.toISOString().slice(11, 16)} (${b.bookingDate.toISOString().slice(0, 10)})`);
    console.log(`  + Trạng thái booking: ${b.bookingStatus} | Thanh toán: ${b.paymentStatus} | Tiền: ${Number(b.totalPrice).toLocaleString("vi-VN")} đ`);
    console.log(`  + Checkout ID: ${b.checkout?.id} | Remaining: ${Number(b.checkout?.remainingAmount).toLocaleString("vi-VN")} đ`);
    if (b.paymentStatus !== "UNPAID") {
      throw new Error(`Booking ${b.bookingCode} phải có paymentStatus là UNPAID`);
    }
  }

  // 2. Kiểm tra danh sách Recipient Bookings API
  const recipient = await prisma.user.findFirst({
    where: { role: "RECIPIENT", managedCourtId: "c0001" }
  });
  if (!recipient) throw new Error("Không tìm thấy Recipient cho sân c0001");

  console.log("\n[BƯỚC 2] TEST API RECIPIENT GET BOOKINGS (28/09/2026):");
  const recipientBookingsResult = await recipientService.bookings(recipient.id, {
    fromDate: "2026-09-28",
    toDate: "2026-09-28"
  });

  const returnedCodes = recipientBookingsResult.items.flatMap((g) => g.bookings.map((b) => b.bookingCode));
  console.log(`- Recipient nhìn thấy ${returnedCodes.length} booking ngày 28/09/2026: ${returnedCodes.join(", ")}`);
  for (const code of ["TEST-RECIPIENT-20260928-001", "TEST-RECIPIENT-20260928-002", "TEST-RECIPIENT-20260928-003"]) {
    if (!returnedCodes.includes(code)) {
      throw new Error(`Recipient không nhìn thấy booking ${code} trên danh sách đặt sân!`);
    }
  }

  // 3. Chọn Booking 1 để test flow POS & Checkout:
  const testB1 = bookings[0];
  console.log(`\n[BƯỚC 3] TEST FLOW TRÊN BOOKING: ${testB1.bookingCode} (Khách: ${testB1.user.fullName})`);

  // 3.1. Xem Bill ban đầu
  const initialDetail = await cashierService.getBookingDetailForCashier(testB1.id);
  console.log("- Hóa đơn ban đầu:");
  console.log(`  + Tiền sân: ${initialDetail.courtSubtotal.toLocaleString("vi-VN")} đ`);
  console.log(`  + Tiền dịch vụ: ${initialDetail.serviceSubtotal.toLocaleString("vi-VN")} đ`);
  console.log(`  + Tổng tiền: ${initialDetail.grandTotal.toLocaleString("vi-VN")} đ`);
  console.log(`  + Trạng thái: Chưa thanh toán (Remaining: ${initialDetail.remainingAmount.toLocaleString("vi-VN")} đ)`);

  if (initialDetail.serviceSubtotal !== 0 || initialDetail.activeServices.length !== 0) {
    throw new Error("Ban đầu đơn phải có 0 dịch vụ");
  }

  // 3.2. Tìm sản phẩm để thêm
  const nuocNgot = await prisma.service.findFirst({
    where: { partnerId: "pp0001", name: "7Up Vị Chanh 330ml" },
    include: { inventory: true }
  });
  const banhMi = await prisma.service.findFirst({
    where: { partnerId: "pp0001", name: "Bánh Mì Chả Pate" },
    include: { inventory: true }
  });
  const thueVot = await prisma.service.findFirst({
    where: { partnerId: "pp0001", name: "Cho Thuê Vợt Cầu Lông Cao Cấp" },
    include: { inventory: true }
  });

  if (!nuocNgot || !banhMi || !thueVot) {
    throw new Error("Thiếu sản phẩm dịch vụ trong database!");
  }

  const stockNuocBefore = nuocNgot.inventory?.quantity ?? 0;
  const stockBanhMiBefore = banhMi.inventory?.quantity ?? 0;
  console.log(`\n- Tồn kho ban đầu:`);
  console.log(`  + 7Up: ${stockNuocBefore} lon`);
  console.log(`  + Bánh Mì: ${stockBanhMiBefore} ổ`);
  console.log(`  + Thuê Vợt: ${thueVot.inventory?.quantity ?? 0} lượt`);

  // 3.3. Recipient bấm "+ Thêm dịch vụ": Nước ngọt x2 (7Up 12.000 x 2 = 24.000)
  console.log("\n[BƯỚC 4] RECIPIENT THÊM DỊCH VỤ:");
  console.log("-> Thêm 7Up Vị Chanh x2 (12.000đ x 2 = 24.000đ)");
  await cashierService.addServiceToBooking(testB1.id, { serviceId: nuocNgot.id, quantity: 2 }, "RECIPIENT");

  // Kiểm tra tồn kho giảm 2
  const nuocAfter = await prisma.serviceInventory.findUnique({ where: { serviceId: nuocNgot.id } });
  console.log(`   + Tồn kho 7Up sau khi thêm x2: ${nuocAfter?.quantity} lon (Giảm đúng 2 lon: ${stockNuocBefore} -> ${nuocAfter?.quantity})`);
  if ((nuocAfter?.quantity ?? 0) !== stockNuocBefore - 2) {
    throw new Error("Tồn kho nước ngọt không giảm đúng 2!");
  }

  // 3.4. Thêm Bánh Mì x1 (20.000)
  console.log("-> Thêm Bánh Mì Chả Pate x1 (20.000đ)");
  await cashierService.addServiceToBooking(testB1.id, { serviceId: banhMi.id, quantity: 1 }, "RECIPIENT");

  const banhMiAfter = await prisma.serviceInventory.findUnique({ where: { serviceId: banhMi.id } });
  console.log(`   + Tồn kho Bánh Mì sau khi thêm x1: ${banhMiAfter?.quantity} ổ (Giảm đúng 1 ổ: ${stockBanhMiBefore} -> ${banhMiAfter?.quantity})`);
  if ((banhMiAfter?.quantity ?? 0) !== stockBanhMiBefore - 1) {
    throw new Error("Tồn kho bánh mì không giảm đúng 1!");
  }

  // 3.5. Thêm Thuê Vợt x1 (50.000)
  console.log("-> Thêm Thuê Vợt Cầu Lông Cao Cấp x1 (50.000đ)");
  await cashierService.addServiceToBooking(testB1.id, { serviceId: thueVot.id, quantity: 1 }, "RECIPIENT");

  // 3.6. Kiểm tra Bill tự động cộng dồn
  const updatedDetail = await cashierService.getBookingDetailForCashier(testB1.id);
  const expectedServiceTotal = 24000 + 20000 + 50000; // 94.000
  const expectedGrandTotal = 240000 + expectedServiceTotal; // 334.000

  console.log("\n[BƯỚC 5] BILL TỰ ĐỘNG CẬP NHẬT:");
  console.log(`- Tiền sân: ${updatedDetail.courtSubtotal.toLocaleString("vi-VN")} đ`);
  console.log(`- Dịch vụ cộng dồn: +${updatedDetail.serviceSubtotal.toLocaleString("vi-VN")} đ (Kỳ vọng: 94.000 đ)`);
  console.log(`- TỔNG CẦN THANH TOÁN: ${updatedDetail.grandTotal.toLocaleString("vi-VN")} đ (Kỳ vọng: 334.000 đ)`);
  console.log(`- Trạng thái: Chưa yêu cầu thanh toán ngay (Khách tiếp tục sử dụng sân)`);

  if (updatedDetail.serviceSubtotal !== expectedServiceTotal || updatedDetail.grandTotal !== expectedGrandTotal) {
    throw new Error(`Tổng tiền hóa đơn không khớp! Nhận: ${updatedDetail.grandTotal}, kỳ vọng: ${expectedGrandTotal}`);
  }

  // 3.7. Kiểm tra Customer BookingDetail API (Realtime bill)
  console.log("\n[BƯỚC 6] KIỂM TRA PHÍA CUSTOMER (REALTIME BILL):");
  const customerBill = await bookingService.getBookingBill(testB1.userId, testB1.id);
  console.log(`- Customer Bill nhận được:`);
  console.log(`  + subtotalCourt: ${Number(customerBill.subtotalCourt).toLocaleString("vi-VN")} đ`);
  console.log(`  + serviceSubtotal: ${Number(customerBill.serviceSubtotal).toLocaleString("vi-VN")} đ`);
  console.log(`  + grandTotal: ${Number(customerBill.grandTotal).toLocaleString("vi-VN")} đ`);
  console.log(`  + paymentStatus: ${customerBill.paymentStatus}`);
  console.log(`  + Số dịch vụ: ${customerBill.services.length} món`);

  if (Number(customerBill.grandTotal) !== expectedGrandTotal) {
    throw new Error("Customer Bill không khớp với hóa đơn POS!");
  }

  // 3.8. Cuối buổi: Recipient / Customer Checkout & Thanh toán
  console.log("\n[BƯỚC 7] CUỐI BUỔI: CHECKOUT & THANH TOÁN:");
  const checkoutBefore = await checkoutService.getOrCreateCheckout(testB1.id);
  console.log(`- Bấm Checkout: Checkout ID = ${checkoutBefore.checkout.id}`);
  console.log(`- Chọn phương thức: TIỀN MẶT (CASH) - Số tiền: ${Number(checkoutBefore.breakdown.remainingAmount).toLocaleString("vi-VN")} đ`);

  const paymentResult = await checkoutService.processPayment({
    checkoutId: checkoutBefore.checkout.id,
    amount: Number(checkoutBefore.breakdown.remainingAmount),
    paymentMethod: "CASH",
    transactionId: `CASH-${Date.now()}`
  });

  console.log(`- Thanh toán thành công! Status = ${paymentResult.checkout.status}`);

  // 3.9. Kiểm tra trạng thái sau thanh toán
  const finishedBooking = await prisma.booking.findUnique({
    where: { id: testB1.id },
    include: { checkout: { include: { payments: true } }, payments: true }
  });

  console.log("\n[BƯỚC 8] KIỂM TRA TRẠNG THÁI CUỐI CÙNG:");
  console.log(`- Booking Status: ${finishedBooking?.bookingStatus} (Kỳ vọng: COMPLETED)`);
  console.log(`- Payment Status: ${finishedBooking?.paymentStatus} (Kỳ vọng: PAID)`);
  console.log(`- Checkout Status: ${finishedBooking?.checkout?.status} (Kỳ vọng: COMPLETED)`);
  console.log(`- Số tiền đã trả (Amount Paid): ${Number(finishedBooking?.checkout?.amountPaid).toLocaleString("vi-VN")} đ`);
  console.log(`- Còn lại (Remaining): ${Number(finishedBooking?.checkout?.remainingAmount).toLocaleString("vi-VN")} đ`);
  console.log(`- Giao dịch thanh toán: ${finishedBooking?.checkout?.payments.length} lượt`);

  if (finishedBooking?.paymentStatus !== "PAID" || finishedBooking?.bookingStatus !== "COMPLETED") {
    throw new Error("Trạng thái booking / payment sau checkout không đúng!");
  }

  // 4. Khôi phục lại trạng thái ban đầu sạch sẽ để người dùng có thể test tay
  console.log("\n[BƯỚC 9] HOÀN TẤT TEST FLOW -> RE-SEED LẠI TRẠNG THÁI SẠCH BAN ĐẦU CHO NGƯỜI DÙNG TEST TRỰC TIẾP TRÊN UI...");
  await seedRecipientPaymentTest();

  console.log("\n================================================================================");
  console.log("=== TOÀN BỘ FLOW TEST THÀNH CÔNG 100%! HỆ THỐNG SẴN SÀNG CHO USER TEST ===");
  console.log("================================================================================");
}

runTestFlow()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("LỖI TEST FLOW:", err);
    process.exit(1);
  });
