-- ==============================================================================
-- RESET DATA BOOKING TEST CHO RECIPIENT
-- Chỉ xóa các booking test có mã bắt đầu bằng 'TEST-RECIPIENT-20260928-'
-- Tuyệt đối không xóa hay thay đổi dữ liệu thật của khách hàng, sân, hay payment khác!
-- ==============================================================================

DO $$
DECLARE
    v_count INT;
BEGIN
    -- 1. Hoàn trả tồn kho cho các dịch vụ test đã gắn vào booking test (nếu có)
    UPDATE service_inventories si
    SET quantity = si.quantity + sub.total_qty,
        updated_at = NOW()
    FROM (
        SELECT bs.service_id, SUM(bs.quantity) as total_qty
        FROM booking_services bs
        JOIN bookings b ON bs.booking_id = b.id
        WHERE b.booking_code LIKE 'TEST-RECIPIENT-20260928-%'
          AND bs.service_id IS NOT NULL
          AND (bs.status = 'ACTIVE' OR bs.status IS NULL)
        GROUP BY bs.service_id
    ) sub
    WHERE si.service_id = sub.service_id;

    -- 2. Xóa các inventory transactions liên quan đến booking test
    DELETE FROM inventory_transactions
    WHERE reference_type = 'BOOKING_SERVICE'
      AND reference_id IN (
          SELECT id FROM bookings WHERE booking_code LIKE 'TEST-RECIPIENT-20260928-%'
      );

    -- 3. Xóa checkout_payments của booking test
    DELETE FROM checkout_payments
    WHERE checkout_id IN (
        SELECT c.id FROM checkouts c
        JOIN bookings b ON c.booking_id = b.id
        WHERE b.booking_code LIKE 'TEST-RECIPIENT-20260928-%'
    );

    -- 4. Xóa checkouts của booking test
    DELETE FROM checkouts
    WHERE booking_id IN (
        SELECT id FROM bookings WHERE booking_code LIKE 'TEST-RECIPIENT-20260928-%'
    );

    -- 5. Xóa rental_items của booking test
    DELETE FROM rental_items
    WHERE booking_service_id IN (
        SELECT bs.id FROM booking_services bs
        JOIN bookings b ON bs.booking_id = b.id
        WHERE b.booking_code LIKE 'TEST-RECIPIENT-20260928-%'
    );

    -- 6. Xóa booking_services của booking test
    DELETE FROM booking_services
    WHERE booking_id IN (
        SELECT id FROM bookings WHERE booking_code LIKE 'TEST-RECIPIENT-20260928-%'
    );

    -- 7. Xóa booking_slots của booking test
    DELETE FROM booking_slots
    WHERE booking_id IN (
        SELECT id FROM bookings WHERE booking_code LIKE 'TEST-RECIPIENT-20260928-%'
    );

    -- 8. Xóa payments của booking test
    DELETE FROM payments
    WHERE booking_id IN (
        SELECT id FROM bookings WHERE booking_code LIKE 'TEST-RECIPIENT-20260928-%'
    );

    -- 9. Xóa bookings test
    DELETE FROM bookings
    WHERE booking_code LIKE 'TEST-RECIPIENT-20260928-%';
    GET DIAGNOSTICS v_count = ROW_COUNT;

    RAISE NOTICE 'Đã reset thành công % booking test. Dữ liệu thật được giữ nguyên an toàn 100%%.', v_count;
END $$;
