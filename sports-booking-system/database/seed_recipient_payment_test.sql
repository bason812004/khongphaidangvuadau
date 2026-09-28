-- ==============================================================================
-- SEED DATA BOOKING CHO RECIPIENT TEST FLOW "THANH TOÁN SAU KHI SỬ DỤNG DỊCH VỤ"
-- Ngày test: 28/09/2026
-- Sân: Sân bóng Sala 1 (c0001) - Recipient: partner1+recipient@sportsbooking.com
-- ==============================================================================

DO $$
DECLARE
    v_court_id VARCHAR(20) := 'c0001';
    v_partner_id VARCHAR(20) := 'pp0001';
    v_surface1 VARCHAR(20);
    v_surface2 VARCHAR(20);
    v_surface3 VARCHAR(20);
    v_user1 VARCHAR(20);
    v_user2 VARCHAR(20);
    v_user3 VARCHAR(20);
    v_b1_id VARCHAR(20);
    v_b2_id VARCHAR(20);
    v_b3_id VARCHAR(20);
    v_date DATE := '2026-09-28'::DATE;
BEGIN
    -- 1. Lấy thông tin 3 sân con của c0001
    SELECT id INTO v_surface1 FROM court_surfaces WHERE court_id = v_court_id AND status = 'ACTIVE' ORDER BY sort_order ASC, code ASC LIMIT 1 OFFSET 0;
    SELECT id INTO v_surface2 FROM court_surfaces WHERE court_id = v_court_id AND status = 'ACTIVE' ORDER BY sort_order ASC, code ASC LIMIT 1 OFFSET 1;
    SELECT id INTO v_surface3 FROM court_surfaces WHERE court_id = v_court_id AND status = 'ACTIVE' ORDER BY sort_order ASC, code ASC LIMIT 1 OFFSET 2;

    IF v_surface1 IS NULL THEN
        RAISE EXCEPTION 'Không tìm thấy sân con cho sân %', v_court_id;
    END IF;
    IF v_surface2 IS NULL THEN v_surface2 := v_surface1; END IF;
    IF v_surface3 IS NULL THEN v_surface3 := v_surface1; END IF;

    -- 2. Lấy hoặc tạo 3 khách hàng test thật
    SELECT id INTO v_user1 FROM users WHERE phone = '0900000021' LIMIT 1;
    IF v_user1 IS NULL THEN
        v_user1 := 'u' || lpad(nextval('seq_users')::text, 4, '0');
        INSERT INTO users (id, full_name, email, phone, role, status)
        VALUES (v_user1, 'Le Minh Anh', 'user1@sportsbooking.com', '0900000021', 'USER', 'ACTIVE');
    END IF;

    SELECT id INTO v_user2 FROM users WHERE phone = '0900000022' LIMIT 1;
    IF v_user2 IS NULL THEN
        v_user2 := 'u' || lpad(nextval('seq_users')::text, 4, '0');
        INSERT INTO users (id, full_name, email, phone, role, status)
        VALUES (v_user2, 'Pham Gia Bao', 'user2@sportsbooking.com', '0900000022', 'USER', 'ACTIVE');
    END IF;

    SELECT id INTO v_user3 FROM users WHERE phone = '0900000023' LIMIT 1;
    IF v_user3 IS NULL THEN
        v_user3 := 'u' || lpad(nextval('seq_users')::text, 4, '0');
        INSERT INTO users (id, full_name, email, phone, role, status)
        VALUES (v_user3, 'Hoang Thu Ha', 'user3@sportsbooking.com', '0900000023', 'USER', 'ACTIVE');
    END IF;

    -- 3. Đảm bảo 6 dịch vụ test có sẵn trong kho và liên kết vào c0001
    -- 3.1 Nước ngọt: 7Up Vị Chanh 330ml (12.000đ)
    INSERT INTO services (id, partner_id, name, type, price, cost_price, unit, status, track_inventory)
    VALUES (gen_random_uuid(), v_partner_id, '7Up Vị Chanh 330ml', 'PRODUCT', 12000, 7000, 'lon', 'ACTIVE', true)
    ON CONFLICT DO NOTHING;

    -- 3.2 Nước suối Aquafina 500ml (10.000đ)
    INSERT INTO services (id, partner_id, name, type, price, cost_price, unit, status, track_inventory)
    VALUES (gen_random_uuid(), v_partner_id, 'Nước suối Aquafina 500ml', 'PRODUCT', 10000, 4000, 'chai', 'ACTIVE', true)
    ON CONFLICT DO NOTHING;

    -- 3.3 Bánh Mì Chả Pate (20.000đ)
    INSERT INTO services (id, partner_id, name, type, price, cost_price, unit, status, track_inventory)
    VALUES (gen_random_uuid(), v_partner_id, 'Bánh Mì Chả Pate', 'PRODUCT', 20000, 12000, 'ổ', 'ACTIVE', true)
    ON CONFLICT DO NOTHING;

    -- 3.4 Hộp Dưa Hấu Ướp Lạnh (25.000đ)
    INSERT INTO services (id, partner_id, name, type, price, cost_price, unit, status, track_inventory)
    VALUES (gen_random_uuid(), v_partner_id, 'Hộp Dưa Hấu Ướp Lạnh', 'PRODUCT', 25000, 15000, 'hộp', 'ACTIVE', true)
    ON CONFLICT DO NOTHING;

    -- 3.5 Cho Thuê Vợt Cầu Lông Cao Cấp (50.000đ)
    INSERT INTO services (id, partner_id, name, type, price, cost_price, unit, status, track_inventory)
    VALUES (gen_random_uuid(), v_partner_id, 'Cho Thuê Vợt Cầu Lông Cao Cấp', 'RENTAL_SERVICE', 50000, 10000, 'lượt', 'ACTIVE', true)
    ON CONFLICT DO NOTHING;

    -- 3.6 Quả Cầu Lông Ba Sao Đỏ (15.000đ)
    INSERT INTO services (id, partner_id, name, type, price, cost_price, unit, status, track_inventory)
    VALUES (gen_random_uuid(), v_partner_id, 'Quả Cầu Lông Ba Sao Đỏ', 'PRODUCT', 15000, 10000, 'quả', 'ACTIVE', true)
    ON CONFLICT DO NOTHING;

    -- Cập nhật tồn kho >= 50 cho các dịch vụ trên
    INSERT INTO service_inventories (id, service_id, quantity, minimum_stock, unit)
    SELECT gen_random_uuid(), s.id, 50, 5, s.unit
    FROM services s
    WHERE s.partner_id = v_partner_id
      AND s.name IN ('7Up Vị Chanh 330ml', 'Nước suối Aquafina 500ml', 'Bánh Mì Chả Pate', 'Hộp Dưa Hấu Ướp Lạnh', 'Cho Thuê Vợt Cầu Lông Cao Cấp', 'Quả Cầu Lông Ba Sao Đỏ')
    ON CONFLICT (service_id) DO UPDATE SET quantity = GREATEST(service_inventories.quantity, 50);

    -- Gắn các dịch vụ vào court_services cho sân c0001 nếu chưa có
    INSERT INTO court_services (id, court_id, service_id, name, price, is_available, status)
    SELECT 'cs_' || v_court_id || '_' || substring(s.id::text, 1, 8), v_court_id, s.id, s.name, s.price, true, 'ACTIVE'
    FROM services s
    WHERE s.partner_id = v_partner_id
      AND s.name IN ('7Up Vị Chanh 330ml', 'Nước suối Aquafina 500ml', 'Bánh Mì Chả Pate', 'Hộp Dưa Hấu Ướp Lạnh', 'Cho Thuê Vợt Cầu Lông Cao Cấp', 'Quả Cầu Lông Ba Sao Đỏ')
      AND NOT EXISTS (SELECT 1 FROM court_services cs WHERE cs.court_id = v_court_id AND cs.service_id = s.id);

    -- 4. DỌN DẸP DỮ LIỆU CŨ CỦA 3 TEST BOOKING (IDEMPOTENT)
    SELECT id INTO v_b1_id FROM bookings WHERE booking_code = 'TEST-RECIPIENT-20260928-001';
    SELECT id INTO v_b2_id FROM bookings WHERE booking_code = 'TEST-RECIPIENT-20260928-002';
    SELECT id INTO v_b3_id FROM bookings WHERE booking_code = 'TEST-RECIPIENT-20260928-003';

    DELETE FROM inventory_transactions WHERE reference_type = 'BOOKING_SERVICE' AND reference_id IN (v_b1_id, v_b2_id, v_b3_id);
    DELETE FROM checkout_payments WHERE checkout_id IN (SELECT id FROM checkouts WHERE booking_id IN (v_b1_id, v_b2_id, v_b3_id));
    DELETE FROM checkouts WHERE booking_id IN (v_b1_id, v_b2_id, v_b3_id);
    DELETE FROM rental_items WHERE booking_service_id IN (SELECT id FROM booking_services WHERE booking_id IN (v_b1_id, v_b2_id, v_b3_id));
    DELETE FROM booking_services WHERE booking_id IN (v_b1_id, v_b2_id, v_b3_id);
    DELETE FROM booking_slots WHERE booking_id IN (v_b1_id, v_b2_id, v_b3_id);
    DELETE FROM payments WHERE booking_id IN (v_b1_id, v_b2_id, v_b3_id);
    DELETE FROM bookings WHERE id IN (v_b1_id, v_b2_id, v_b3_id);

    -- 5. TẠO 3 BOOKING TEST
    -- 5.1 BOOKING 1: 15:00 - 17:00, IN_PROGRESS, UNPAID (240.000đ)
    v_b1_id := 'b' || lpad(nextval('seq_bookings')::text, 4, '0');
    INSERT INTO bookings (
        id, booking_code, user_id, court_id, court_surface_id, booking_date,
        start_time, end_time, total_price, base_price, subtotal, deposit_amount,
        booking_status, payment_status, payment_method, checked_in_at, note
    ) VALUES (
        v_b1_id, 'TEST-RECIPIENT-20260928-001', v_user1, v_court_id, v_surface1, v_date,
        '15:00:00'::TIME, '17:00:00'::TIME, 240000, 240000, 240000, 0,
        'IN_PROGRESS', 'UNPAID', 'CASH', '2026-09-28 15:05:00+07'::TIMESTAMPTZ,
        'Test khách đang sử dụng sân và phát sinh dịch vụ tại quầy'
    );

    INSERT INTO booking_slots (booking_id, court_id, court_surface_id, booking_date, start_time, end_time, slot_price)
    VALUES (v_b1_id, v_court_id, v_surface1, v_date, '15:00:00'::TIME, '17:00:00'::TIME, 240000);

    INSERT INTO checkouts (booking_id, subtotal_court, subtotal_service, discount, deposit_paid, amount_paid, remaining_amount, total_amount, status, notes)
    VALUES (v_b1_id, 240000, 0, 0, 0, 0, 240000, 240000, 'PENDING', 'Chờ thanh toán sau khi sử dụng dịch vụ');

    -- 5.2 BOOKING 2: 16:00 - 18:00, IN_PROGRESS, UNPAID (300.000đ)
    v_b2_id := 'b' || lpad(nextval('seq_bookings')::text, 4, '0');
    INSERT INTO bookings (
        id, booking_code, user_id, court_id, court_surface_id, booking_date,
        start_time, end_time, total_price, base_price, subtotal, deposit_amount,
        booking_status, payment_status, payment_method, checked_in_at, note
    ) VALUES (
        v_b2_id, 'TEST-RECIPIENT-20260928-002', v_user2, v_court_id, v_surface2, v_date,
        '16:00:00'::TIME, '18:00:00'::TIME, 300000, 300000, 300000, 0,
        'IN_PROGRESS', 'UNPAID', 'CASH', '2026-09-28 16:05:00+07'::TIMESTAMPTZ,
        'Test thêm nhiều dịch vụ và đồ ăn thức uống'
    );

    INSERT INTO booking_slots (booking_id, court_id, court_surface_id, booking_date, start_time, end_time, slot_price)
    VALUES (v_b2_id, v_court_id, v_surface2, v_date, '16:00:00'::TIME, '18:00:00'::TIME, 300000);

    INSERT INTO checkouts (booking_id, subtotal_court, subtotal_service, discount, deposit_paid, amount_paid, remaining_amount, total_amount, status, notes)
    VALUES (v_b2_id, 300000, 0, 0, 0, 0, 300000, 300000, 'PENDING', 'Chờ thanh toán sau khi sử dụng dịch vụ');

    -- 5.3 BOOKING 3: 17:00 - 19:00, CONFIRMED, UNPAID (360.000đ)
    v_b3_id := 'b' || lpad(nextval('seq_bookings')::text, 4, '0');
    INSERT INTO bookings (
        id, booking_code, user_id, court_id, court_surface_id, booking_date,
        start_time, end_time, total_price, base_price, subtotal, deposit_amount,
        booking_status, payment_status, payment_method, checked_in_at, note
    ) VALUES (
        v_b3_id, 'TEST-RECIPIENT-20260928-003', v_user3, v_court_id, v_surface3, v_date,
        '17:00:00'::TIME, '19:00:00'::TIME, 360000, 360000, 360000, 0,
        'CONFIRMED', 'UNPAID', 'CASH', NULL,
        'Test booking xác nhận chưa thanh toán'
    );

    INSERT INTO booking_slots (booking_id, court_id, court_surface_id, booking_date, start_time, end_time, slot_price)
    VALUES (v_b3_id, v_court_id, v_surface3, v_date, '17:00:00'::TIME, '19:00:00'::TIME, 360000);

    INSERT INTO checkouts (booking_id, subtotal_court, subtotal_service, discount, deposit_paid, amount_paid, remaining_amount, total_amount, status, notes)
    VALUES (v_b3_id, 360000, 0, 0, 0, 0, 360000, 360000, 'PENDING', 'Chờ thanh toán sau khi sử dụng dịch vụ');

    RAISE NOTICE 'Đã seed thành công 3 booking test ngày %:', v_date;
    RAISE NOTICE '1. % (15:00 - 17:00) - IN_PROGRESS - UNPAID - 240.000đ', v_b1_id;
    RAISE NOTICE '2. % (16:00 - 18:00) - IN_PROGRESS - UNPAID - 300.000đ', v_b2_id;
    RAISE NOTICE '3. % (17:00 - 19:00) - CONFIRMED - UNPAID - 360.000đ', v_b3_id;
END $$;
