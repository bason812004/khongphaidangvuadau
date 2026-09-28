# KỊCH BẢN QUAY VIDEO DEMO HỆ THỐNG ENTERPRISE (DEMO VIDEO SCRIPT)
## Hướng Dẫn Thuyết Minh & Thao Tác Từng Bước (Thời Lượng: 5 - 8 Phút)

---

### PHÂN CẢNH 1: MỞ ĐẦU & TỔNG QUAN KIẾN TRÚC (0:00 - 1:00)
- **Hình ảnh hiển thị**: Màn hình trang chủ Enterprise Admin Portal (`http://localhost:5173/admin-portal`).
- **Lời thuyết minh**:
  > *"Xin chào thầy cô và ban giám khảo/anh chị phỏng vấn. Hôm nay em xin phép trình bày dự án Sports Booking Enterprise. Hệ thống được xây dựng theo mô hình Enterprise Architecture kết hợp giữa Frontend React, CSS đa thư viện (Ant Design, Bootstrap, Tailwind, SCSS, Material Icons) và Backend Java 21 - Spring Boot 3, tích hợp Camunda BPMN, JasperReports, Dual ORM JPA/Hibernate & MyBatis, xác thực Keycloak, Apache Kafka và Redis Cache."*
- **Thao tác**: Chỉ chuột vào thanh **Technology Pill Bar** ở đầu trang để làm nổi bật các công nghệ đã tích hợp.

---

### PHÂN CẢNH 2: KIOSK & BOOKING POS + IN HÓA ĐƠN JASPERREPORTS (1:00 - 2:30)
- **Hình ảnh hiển thị**: Tab **Kiosk & Booking POS**.
- **Lời thuyết minh**:
  > *"Tại quầy Kiosk POS, nhân viên thu ngân có thể check-in nhanh cho khách hàng bằng mã QR hoặc số điện thoại, quản lý lịch đặt sân và các dịch vụ thuê vợt, nước giải khát đi kèm. Sau khi thanh toán, hệ thống sử dụng JasperReports để biên dịch trực tiếp template booking_invoice.jrxml và xuất ra file PDF chuẩn hóa đơn bán lẻ."*
- **Thao tác**:
  1. Nhập mã đặt sân `BK-8899` vào ô tìm kiếm và bấm "Tra cứu".
  2. Bấm nút **"In Hóa Đơn PDF (JasperReports)"**.
  3. Mở tab hiển thị hóa đơn PDF cho người xem thấy cấu trúc rõ ràng: logo, thông tin khách, chi tiết tiền sân, phụ thu và tổng thanh toán.

---

### PHÂN CẢNH 3: USER MANAGEMENT (JPA & KEYCLOAK) (2:30 - 3:30)
- **Hình ảnh hiển thị**: Tab **User Management (JPA)**.
- **Lời thuyết minh**:
  > *"Module người dùng được quản lý bởi Spring Data JPA và Hibernate với các thực thể User và Role. Mật khẩu được mã hóa an toàn qua thuật toán BCrypt/Keycloak PBKDF2. Hệ thống hỗ trợ phân quyền chặt chẽ theo vai trò (ROLE_ADMIN, ROLE_CHECKER, ROLE_PARTNER, ROLE_CASHIER, ROLE_CUSTOMER)."*
- **Thao tác**:
  1. Bấm nút **"+ Thêm Người Dùng Mới"**.
  2. Điền thông tin: Họ tên, Email, chọn Role `ROLE_PARTNER` $\rightarrow$ bấm Lưu.
  3. Chỉ vào dòng người dùng mới vừa xuất hiện trong Ant Design Table với Tag vai trò tương ứng.

---

### PHÂN CẢNH 4: CATEGORY MANAGEMENT (MYBATIS DYNAMIC SQL & REDIS) (3:30 - 4:30)
- **Hình ảnh hiển thị**: Tab **Category Management (MyBatis)**.
- **Lời thuyết minh**:
  > *"Để tối ưu hóa hiệu năng truy vấn và báo cáo động, module Category được viết bằng MyBatis Mapper với dynamic SQL. Hệ thống áp dụng Cache-Aside Pattern với Redis: khi có yêu cầu tra cứu, Redis sẽ được kiểm tra trước; nếu Cache Miss mới gọi xuống PostgreSQL qua MyBatis, giúp phản hồi dưới 5ms."*
- **Thao tác**:
  1. Gõ từ khóa tìm kiếm `"Bóng"` vào ô tìm kiếm để thấy tính năng lọc động của MyBatis.
  2. Bấm nút **"+ Thêm Danh Mục"** để thêm một môn thể thao mới (ví dụ: Bóng Bàn).

---

### PHÂN CẢNH 5: QUY TRÌNH CAMUNDA BPMN MAKER - CHECKER (4:30 - 6:00)
- **Hình ảnh hiển thị**: Tab **Maker - Checker (Camunda BPMN)** và màn hình **Camunda Cockpit** (`http://localhost:8088/camunda`).
- **Lời thuyết minh**:
  > *"Điểm nhấn kiến trúc của hệ thống là quy trình Maker - Checker trên nền tảng Camunda BPMN. Khi Partner gửi yêu cầu rút tiền hoặc đăng ký cụm sân mới, một Process Instance sẽ được khởi tạo. Checker (Admin) sẽ nhận User Task để thẩm định. Tùy thuộc vào quyết định Phê Duyệt hay Từ Chối, Exclusive Gateway sẽ rẽ nhánh và kích hoạt Service Task tự động gửi email thông báo kết quả cho Maker."*
- **Thao tác**:
  1. Bấm nút **"Xem & Phê Duyệt"** trên một ticket đang ở trạng thái `Chờ Checker Duyệt`.
  2. Nhập ghi chú thẩm định và bấm **"Phê Duyệt (Approve)"**.
  3. Cho người xem thấy thông báo thành công và trạng thái ticket chuyển sang màu xanh `Đã Phê Duyệt`.

---

### PHÂN CẢNH 6: SHOPPING, PURCHASING & NHẬP XUẤT EXCEL (6:00 - 7:00)
- **Hình ảnh hiển thị**: Tab **Shopping & Purchasing** và Tab **Jasper Reports & Excel**.
- **Lời thuyết minh**:
  > *"Hệ thống hỗ trợ quản lý kho dụng cụ thể thao và hàng hóa bán kèm. Người dùng có thể xuất báo cáo tồn kho dạng Excel (XLSX) qua JasperReports và Apache POI, cũng như upload file Excel để import hàng loạt sản phẩm vào Database bằng lệnh batchInsert của MyBatis."*
- **Thao tác**:
  1. Bấm nút **"Xuất Báo Cáo Kho (JasperReports Excel)"**.
  2. Bấm nút **"Chọn file Excel (.xlsx) để Import"** để minh họa khả năng đọc file qua Apache POI.

---

### PHÂN CẢNH 7: KẾT THÚC & TỔNG KẾT SOURCE CONTROL (7:00 - 7:30)
- **Hình ảnh hiển thị**: Màn hình Terminal VS Code với lệnh `git branch`.
- **Lời thuyết minh**:
  > *"Toàn bộ mã nguồn dự án được quản lý nghiêm ngặt theo Git Flow với các nhánh 'main' và 'develop'. Em xin cảm ơn ban giám khảo/anh chị đã theo dõi phần demo."*
- **Thao tác**: Chạy lệnh `git branch` và `git status` trong terminal để hiển thị nhánh `develop` và cấu trúc dự án hoàn chỉnh.
