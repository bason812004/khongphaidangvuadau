# SPORTS BOOKING ENTERPRISE ADMIN PORTAL

> Hệ thống Quản trị Doanh nghiệp Toàn diện (Enterprise Admin Portal) tích hợp kiến trúc **Spring Boot 3 (Java 21)**, **Camunda BPMN**, **JasperReports**, **Dual ORM (MyBatis & Hibernate)**, **Keycloak IAM**, **Apache Kafka**, **Redis Cache** và **React Admin WebApp (Ant Design, Bootstrap 5, TailwindCSS, SCSS, Material Icons)**.

---

## 1. TỔNG QUAN HỆ THỐNG & CÔNG NGHỆ ÁP DỤNG

### Frontend Admin Portal (React + Vite + TypeScript)
- **CSS Libraries Đa Nền Tảng:**
  - **Ant Design (`antd`)**: Cung cấp Table phân trang, Modal thẩm định, Form validation, Tabs phân hệ, Tags, Statistics.
  - **Bootstrap 5**: Hệ thống lưới (Grid system), layout utilities (`row`, `col`, `d-flex`).
  - **TailwindCSS**: Tiện ích căn chỉnh vi mô (Micro-spacing, typography, responsive utilities).
  - **Material Design Icons (`@mui/icons-material`)**: Bộ icon chuẩn Material Design (`PointOfSale`, `ShoppingCart`, `PictureAsPdf`, `Security`, `School`).
  - **SCSS Styles (`enterprise-admin.scss`)**: Tùy biến biến màu thương hiệu, mixin Glassmorphism và custom cards.
- **Các Phân Hệ Nghiệp Vụ Chính:**
  - **Kiosk & Booking POS**: Thu ngân tạo lượt đặt tại quầy, in phiếu hóa đơn, áp dụng Strategy Pattern thanh toán.
  - **Shopping & Purchasing**: Bán lẻ phụ trợ (vợt, bóng, nước uống), quản lý tồn kho và phiếu thu mua hàng.
  - **User Management**: Quản trị người dùng & phân quyền RBAC dựa trên **Spring Data JPA & Hibernate**.
  - **Category Management**: Quản lý danh mục đa môn thi đấu và dịch vụ dựa trên **MyBatis Dynamic SQL** và **Redis Cache-Aside**.
  - **Maker - Checker Workflow**: Quy trình kiểm soát 4 mắt (4-Eyes Principle) trên nền tảng **Camunda BPMN**.
  - **Jasper Reports & Excel**: Xuất hóa đơn POS PDF chuẩn JRXML, báo cáo kho Excel qua **Apache POI**, nhập liệu hàng loạt (Batch Import).
  - **Message Queue & Kafka Stream**: Quản lý và theo dõi thông điệp sự kiện bất đồng bộ qua **Apache Kafka**.
  - **Training, Learning & Architecture**: Sơ đồ kiến trúc, tài liệu đào tạo nội bộ, minh họa các Design Pattern.

### Enterprise Backend Core (Spring Boot 3 - Java 21)
- **Dual ORM:**
  - **Spring Data JPA / Hibernate**: Quản lý thực thể `User`, `Role`, quan hệ `@ManyToMany`, đảm bảo tính toàn vẹn Transaction.
  - **MyBatis Dynamic SQL**: Quản lý `Category`, thực hiện truy vấn động với các thẻ `<where>`, `<if>`, `<foreach>` và `batchInsert` hiệu năng cao.
- **Workflow Engine (Camunda BPMN):**
  - Quy trình `maker_checker_ticket.bpmn` tự động hóa luồng duyệt phiếu: Maker tạo ticket $\rightarrow$ Checker thẩm định $\rightarrow$ Gateway phân nhánh $\rightarrow$ Service Delegates cập nhật trạng thái $\rightarrow$ Tự động gửi email thông báo kết quả.
  - Tích hợp sẵn Camunda Cockpit & Tasklist tại `/camunda`.
- **Báo Cáo Doanh Nghiệp (JasperReports & Apache POI):**
  - Biên dịch template chuẩn JRXML (`booking_invoice.jrxml`, `purchasing_inventory_report.jrxml`) xuất file PDF và Excel.
  - Nhập liệu hàng loạt (Batch Import) từ Excel qua Apache POI (`ExcelDataImportService`).
- **Bảo Mật & Xác Thực Toàn Diện:**
  - **Keycloak IAM**: OpenID Connect Resource Server.
  - **JWT Token Provider**: Ký điện tử HS256, lưu tại LocalStorage.
  - **Session Management**: Quản lý phiên song song với Spring `HttpSession`.
  - **Password Hashing**: Mã hóa mật khẩu chuẩn BCrypt (`PasswordEncoder`).
  - **API Hoàn Chỉnh**: Login, Logout (kèm cơ chế Redis Blacklist Token), Register, Forgot Password.
- **Message Queue, Cache & 6 Design Patterns:**
  - **Apache Kafka**: Xử lý bất đồng bộ các luồng sự kiện đặt sân và đối soát ticket (`sports.booking.events`, `sports.ticket.events`).
  - **Redis Cache**: Triển khai mẫu **Cache-Aside Pattern** và Distributed Lock chống trùng lịch.
  - **6 Design Patterns**: Strategy Pattern (đa cổng thanh toán: VNPay, Quầy, Ví điện tử), Factory Pattern (Notification Factory Email/SMS), Observer Pattern (Kafka `@KafkaListener`), Singleton Pattern, Repository Pattern, Maker-Checker Pattern.

---

## 2. CẤU TRÚC THƯ MỤC DỰ ÁN

```text
DoAn/
├── README.md                                    # Tài liệu tổng quan dự án
└── sports-booking-system/
    ├── docker-compose.enterprise.yml            # Docker Middleware: Postgres, Redis, Kafka, Keycloak
    ├── run_enterprise_backend.bat               # Script 1 chạm khởi động Spring Boot 3
    ├── run_frontend.bat                         # Script 1 chạm khởi động React Admin Portal
    ├── run_docker_middleware.bat                # Script 1 chạm chạy Docker Middleware
    ├── database/                                # Schema SQL & Dữ liệu mẫu
    ├── docs/                                    # Tài liệu kiến trúc, sơ đồ Draw.io & Kịch bản demo
    │   ├── ENTERPRISE_SYSTEM_DOCUMENTATION.md
    │   ├── DEMO_VIDEO_GUIDE.md
    │   ├── INTERVIEW_PREPARATION_GUIDE.md
    │   └── diagrams/
    │       ├── system_architecture.drawio
    │       └── camunda_maker_checker.drawio
    ├── enterprise-backend/                      # Spring Boot 3 Enterprise Core
    │   ├── pom.xml                              # Khai báo dependency: MyBatis, JPA, Camunda, Jasper, Kafka, Redis, Security
    │   └── src/main/
    │       ├── java/com/sportsbooking/enterprise/
    │       │   ├── config/                      # SecurityConfig, GlobalExceptionHandler, DataInitializer
    │       │   ├── controller/                  # AuthController, UserController, CategoryController, WorkflowController, ReportController
    │       │   ├── entity/                      # User, Role (JPA / Hibernate)
    │       │   ├── mapper/                      # CategoryMapper (MyBatis)
    │       │   ├── repository/                  # UserRepository, RoleRepository (JPA)
    │       │   ├── service/                     # UserService, CategoryService, JasperReportService, ExcelDataImportService, RedisCacheService
    │       │   ├── workflow/                    # MakerCheckerService & Camunda Delegates
    │       │   ├── kafka/                       # KafkaEventProducer, KafkaEventConsumer
    │       │   └── pattern/                     # Strategy (Payment), Factory (Notification)
    │       └── resources/
    │           ├── application.yml              # Cấu hình H2 in-memory, Postgres, Redis, Kafka, Camunda
    │           ├── mapper/CategoryMapper.xml    # Dynamic SQL MyBatis
    │           ├── processes/                   # maker_checker_ticket.bpmn (Camunda)
    │           └── reports/                     # booking_invoice.jrxml, purchasing_inventory_report.jrxml (JasperReports)
    └── frontend/                                # React + Vite + TypeScript Admin Portal
        ├── package.json                         # antd, bootstrap, @mui/icons-material, tailwindcss, sass
        └── src/
            ├── pages/
            │   ├── admin/EnterpriseAdminPortalPage.tsx  # Cổng Quản trị Doanh nghiệp tập trung
            │   └── auth/LoginPage.tsx                  # Đăng nhập với 4 tài khoản mẫu nhanh
            ├── styles/enterprise-admin.scss            # SCSS Mixins & Brand Variables
            └── routes/AppRoutes.tsx                    # Định tuyến bảo mật vào Admin Portal
```

---

## 3. HƯỚNG DẪN KHỞI CHẠY (QUICK START)

### Cách 1: Chế độ Standalone Nhanh (Không Cần Cài Docker)
Hệ thống được tích hợp sẵn cơ chế **Zero-Docker Standalone Mode** sử dụng H2 In-Memory Database và Fallback Cache/Event:

1. **Khởi động Backend (Spring Boot 3):**
   ```bash
   cd sports-booking-system/enterprise-backend
   .\mvnw.cmd spring-boot:run
   # Hoặc click đúp file: sports-booking-system\run_enterprise_backend.bat
   ```
   - API Base URL: `http://localhost:8088/api`
   - Camunda Cockpit: `http://localhost:8088/camunda` (User: `admin` / Password: `adminpassword`)
   - H2 Database Console: `http://localhost:8088/api/h2-console` (JDBC URL: `jdbc:h2:mem:sports_booking_db`, User: `sa`, Pass: trống)

2. **Khởi động Frontend (React Admin Portal):**
   ```bash
   cd sports-booking-system/frontend
   npm install
   npm run dev
   # Hoặc click đúp file: sports-booking-system\run_frontend.bat
   ```
   - Mở trình duyệt: `http://localhost:5173` (Tự động chuyển vào `/admin-portal`).

---

## 4. TÀI KHOẢN MẪU ĐĂNG NHẬP NHANH (QUICK LOGIN)

Tại màn hình đăng nhập, hệ thống cung cấp sẵn các nút đăng nhập 1 chạm để kiểm tra phân quyền RBAC:
- 👑 **Quản Trị Viên (Admin):** `admin@sportsbooking.com` / `admin123`
- 🏟️ **Chủ Sân (Partner):** `partner@sportsbooking.com` / `partner123`
- 💳 **Thu Ngân (Cashier POS):** `cashier@sportsbooking.com` / `cashier123`
- 👤 **Khách Hàng (Customer):** `customer@sportsbooking.com` / `customer123`

---

## 5. MÔ HÌNH PHÂN NHÁNH SOURCE CONTROL (GIT FLOW)
- **`main`**: Nhánh phát hành ổn định, sẵn sàng review và bàn giao.
- **`develop`**: Nhánh tích hợp và phát triển liên tục các tính năng enterprise.
