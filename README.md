# SPORTS BOOKING ENTERPRISE SYSTEM - HƯỚNG DẪN KHỞI CHẠY & KỊCH BẢN DEMO TOÀN DIỆN

> **Dự án Quản Trị Doanh Nghiệp Toàn Diện (Enterprise Admin Portal WebApp)**  
> **Repository GitHub:** [https://github.com/bason812004/khongphaidangvuadau.git](https://github.com/bason812004/khongphaidangvuadau.git)  
> **Kiến trúc:** Spring Boot 3 (Java 21) + Camunda BPMN 7 + MyBatis 3 Dynamic SQL + Spring Data JPA / Hibernate + Keycloak OIDC + JasperReports + Apache Kafka + Redis Cache + React 19 (Ant Design, Bootstrap 5, TailwindCSS, SCSS, Material Design Icons).  
> **Source Control:** Chuẩn Git Flow với 2 nhánh chính `main` (Production/Release) và `develop` (Integration).

---

## 1. MA TRẬN ĐỐI CHIẾU CÔNG NGHỆ 100% THEO ĐỀ BÀI

| STT | Yêu Cầu Của Đề Bài | Công Nghệ Áp Dụng | File Mã Nguồn Đại Diện Trong Dự Án |
| :---: | :--- | :--- | :--- |
| **1** | **Build Admin Portal WebApp**<br>*(Kiosk, Booking, Shopping, User Management, Purchasing, Training, Learning...)* | React 19 + TypeScript + Vite | `frontend/src/pages/admin/EnterpriseAdminPortalPage.tsx`<br>Đầy đủ 8 Tab: Kiosk & POS Booking, Shopping & Purchasing Kho, User Management, Category Management, Camunda Workflow, Jasper Reports & Excel, Kafka Stream, Training & Architecture. |
| **2** | **CSS Library**<br>*(Bootstrap, TailwindCSS, AntD, Material Design Icons, SCSS Styles)* | Ant Design 6, Bootstrap 5, Tailwind 3, `@mui/icons-material`, SCSS SASS | • `antd`: Bảng phân trang, Modal, Tabs, Form, Tag, Statistic<br>• `bootstrap`: Hệ thống lưới `row`, `col`, layout flex utilities<br>• `tailwindcss`: Spacing vi mô, bo góc, bóng mờ<br>• `@mui/icons-material`: Icon chuẩn Material Design<br>• `frontend/src/styles/enterprise-admin.scss`: Mixin Glassmorphism, CSS Variables |
| **3** | **CRUD Category Management với MyBatis** | **MyBatis 3** Dynamic SQL | • `enterprise-backend/.../mapper/CategoryMapper.xml` (thẻ `<where>`, `<if>`, `<foreach>`, `batchInsert`)<br>• `CategoryMapper.java`, `CategoryServiceImpl.java`, `CategoryController.java` |
| **4** | **CRUD User Management với JPA, Hibernate** | **Spring Data JPA & Hibernate** | • `UserRepository.java` (kế thừa `JpaRepository`)<br>• `User.java`, `Role.java` (ánh xạ thực thể `@Entity`, `@ManyToMany`)<br>• `UserServiceImpl.java`, `UserController.java` |
| **5** | **Login/Logout/Register/Hash Password/Forgot Password với Keycloak, JWT, Session, LocalStorage** | Keycloak OIDC, JWT (HS256), HttpSession, LocalStorage, BCrypt | • `AuthController.java`: Login, Logout (Redis Blacklist Token), Register, Forgot Password<br>• `SecurityConfig.java`: Keycloak Resource Server & CORS<br>• `JwtTokenProvider.java`: Ký và xác thực JWT token |
| **6** | **Import, Export sử dụng Jasper Report (Template chuẩn)** | **JasperReports 6.21** + Apache POI (Excel) | • `resources/reports/booking_invoice.jrxml`: Template hóa đơn PDF chuẩn (Title, Header, Detail, Summary)<br>• `resources/reports/purchasing_inventory_report.jrxml`: Báo cáo kiểm kê kho Excel<br>• `JasperReportService.java` & `ExcelDataImportService.java` |
| **7** | **Workflow Camunda BPMN (Maker - Checker Ticket & Auto Email)** | **Camunda BPMN 7.21** + JavaMailSender | • `resources/processes/maker_checker_ticket.bpmn`<br>• Maker tạo ticket $\rightarrow$ Checker thẩm định $\rightarrow$ Gateway phân nhánh $\rightarrow$ Delegates cập nhật $\rightarrow$ `SendEmailNotificationDelegate` gửi mail tự động<br>• Camunda Cockpit Web UI trực quan |
| **8** | **Message Queue / Kafka / Cache & 6 Design Patterns** | **Apache Kafka**, **Redis 7** (Cache-Aside), 6 Design Patterns | • Kafka: `KafkaEventProducer.java`, `KafkaEventConsumer.java`<br>• Redis: `RedisCacheService.java`<br>• 6 Design Patterns: **Strategy** (thanh toán đa cổng), **Factory** (thông báo), **Observer** (Kafka), **Singleton**, **Repository**, **Maker-Checker** |
| **9** | **Source Control với nhánh `main` và `develop`** | **Git** | 2 nhánh `main` và `develop` trên repository GitHub |

---

## 2. CẤU TRÚC THƯ MỤC DỰ ÁN TINH GỌN

Toàn bộ các thư mục không liên quan (như mobile, ml, backend node cũ) đã được loại bỏ để tập trung 100% vào review Enterprise:

```text
DoAn/
├── README.md                                    # Hướng dẫn tổng quan & Demo (File này)
└── sports-booking-system/
    ├── README.md                                # Hướng dẫn chi tiết kỹ thuật
    ├── docker-compose.enterprise.yml            # Docker: Postgres, Redis, Kafka, Zookeeper, Keycloak
    ├── run_enterprise_backend.bat               # Script 1 chạm chạy Backend Spring Boot 3
    ├── run_frontend.bat                         # Script 1 chạm chạy Frontend React Admin Portal
    ├── run_docker_middleware.bat                # Script 1 chạm chạy Docker Middleware
    ├── database/                                # CSDL SQL & Dữ liệu hạt giống
    ├── docs/                                    # Sơ đồ kiến trúc & Tài liệu phỏng vấn
    │   ├── ENTERPRISE_SYSTEM_DOCUMENTATION.md   # Tài liệu kiến trúc chuyên sâu
    │   ├── DEMO_VIDEO_GUIDE.md                  # Kịch bản quay video demo
    │   ├── INTERVIEW_PREPARATION_GUIDE.md       # Cẩm nang trả lời câu hỏi phản biện
    │   └── diagrams/
    │       ├── system_architecture.drawio       # Sơ đồ kiến trúc hệ thống
    │       └── camunda_maker_checker.drawio     # Sơ đồ quy trình Camunda BPMN
    ├── enterprise-backend/                      # Backend Java 21 + Spring Boot 3
    │   ├── pom.xml                              # Khai báo: MyBatis, JPA, Camunda, Jasper, Kafka, Redis
    │   └── src/main/
    │       ├── java/com/sportsbooking/enterprise/
    │       │   ├── config/                      # SecurityConfig, DataInitializer (tạo sẵn 4 tài khoản mẫu)
    │       │   ├── controller/                  # Auth, User, Category, Workflow, Report Controllers
    │       │   ├── entity/                      # User, Role (JPA / Hibernate)
    │       │   ├── mapper/                      # CategoryMapper (MyBatis)
    │       │   ├── repository/                  # UserRepository (Spring Data JPA)
    │       │   ├── service/                     # CategoryService, UserService, JasperReportService...
    │       │   ├── workflow/                    # Camunda MakerCheckerService & Java Delegates
    │       │   ├── kafka/                       # Kafka Event Producer & Consumer
    │       │   └── pattern/                     # Strategy (Payment), Factory (Notification)
    │       └── resources/
    │           ├── application.yml              # Cấu hình H2/Postgres, Camunda, Kafka, Redis
    │           ├── mapper/CategoryMapper.xml    # Dynamic SQL MyBatis
    │           ├── processes/                   # maker_checker_ticket.bpmn (Camunda)
    │           └── reports/                     # booking_invoice.jrxml, purchasing_inventory_report.jrxml
    └── frontend/                                # Frontend React 19 + TypeScript Admin Portal
        ├── package.json                         # antd, bootstrap, @mui/icons-material, tailwindcss, sass
        ├── vite.config.ts                       # Cấu hình Vite Dev Server
        └── src/
            ├── pages/
            │   ├── admin/EnterpriseAdminPortalPage.tsx  # Admin Portal WebApp tập trung đầy đủ
            │   └── auth/LoginPage.tsx                  # Đăng nhập với 4 tài khoản mẫu nhanh
            ├── styles/enterprise-admin.scss            # SCSS Mixins Glassmorphism
            └── routes/AppRoutes.tsx                    # Định tuyến bảo mật vào Admin Portal
```

---

## 3. HƯỚNG DẪN KHỞI CHẠY DỰ ÁN (RUN GUIDE)

Hệ thống hỗ trợ chế độ **Zero-Docker Standalone Mode**: Tự động sử dụng CSDL In-Memory H2, khởi tạo sẵn 4 tài khoản mẫu, sẵn sàng chạy ngay trên máy tính mà không bắt buộc phải cài Docker.

### Bước 1: Khởi động Backend (Spring Boot 3 - Port 8088)

Mở cửa sổ Terminal thứ nhất trong IDE hoặc PowerShell và chạy:
```powershell
cd sports-booking-system\enterprise-backend
mvn.cmd spring-boot:run
```
*(Hoặc click file `sports-booking-system\run_enterprise_backend.bat`)*

Khi màn hình xuất hiện thông báo sau là Backend đã sẵn sàng:
```text
===============================================================
Enterprise Sports Booking Backend Service successfully started!
Port: 8088 | Context Path: /api
Camunda Cockpit & Tasklist: http://localhost:8088/api/camunda
Keycloak / JWT Auth: Active
MyBatis + JPA/Hibernate Dual ORM: Active
JasperReports Engine: Active
Kafka & Redis Cache: Active
===============================================================
```

---

### Bước 2: Khởi động Frontend (React Admin Portal - Port 5173)

Mở thêm một cửa sổ Terminal thứ hai (bấm dấu `+` trên thanh Terminal của IDE) và chạy:
```powershell
cd sports-booking-system\frontend
npm run dev
```
*(Hoặc click file `sports-booking-system\run_frontend.bat`)*

Terminal hiển thị:
```text
  VITE v6.4.3 ready in 270 ms

  ➜  Local:   http://localhost:5173/
```

---

### Bước 3: Mở Trình Duyệt Web

1. **Cổng Quản Trị Doanh Nghiệp (Giao diện chính để Review):**  
   👉 **[http://localhost:5173](http://localhost:5173)**
2. **Camunda BPMN Cockpit & Tasklist (Quản trị luồng quy trình):**  
   👉 **[http://localhost:8088/api/camunda](http://localhost:8088/api/camunda)**  
   *(Tài khoản: `admin` / Mật khẩu: `adminpassword`)*
3. **Cơ Sở Dữ Liệu H2 Console:**  
   👉 **[http://localhost:8088/api/h2-console](http://localhost:8088/api/h2-console)**  
   *(JDBC URL: `jdbc:h2:mem:sports_booking_db` | User: `sa` | Password: để trống)*

---

## 4. TÀI KHOẢN MẪU ĐĂNG NHẬP 1 CHẠM (QUICK LOGIN)

Tại màn hình đăng nhập [http://localhost:5173](http://localhost:5173), hệ thống cung cấp sẵn **4 nút bấm đăng nhập nhanh 1 chạm** theo đúng phân quyền RBAC:

| Nút Đăng Nhập Mẫu | Tài Khoản Email | Mật Khẩu | Vai Trò & Quyền Hạn |
| :--- | :--- | :--- | :--- |
| 👑 **Quản Trị Viên (Admin)** | `admin@sportsbooking.com` | `admin123` | Toàn quyền quản trị, Checker duyệt phiếu Camunda, Quản lý User/Category |
| 🏟️ **Chủ Sân (Partner)** | `partner@sportsbooking.com` | `partner123` | Đối tác quản lý sân thể thao, Maker gửi ticket yêu cầu rút tiền |
| 💳 **Thu Ngân (Cashier POS)** | `cashier@sportsbooking.com` | `cashier123` | Quầy Kiosk POS, đặt sân tại chỗ, in hóa đơn PDF JasperReports |
| 👤 **Khách Hàng (Customer)** | `customer@sportsbooking.com` | `customer123` | Đặt chỗ, gửi yêu cầu phản hồi |

---

## 5. KỊCH BẢN DEMO CHI TIẾT TỪNG CÔNG NGHỆ (8 DEMO SCENARIOS)

Sau đây là hướng dẫn từng bước để bạn demo thuyết trình trọn vẹn tất cả yêu cầu đề bài cho người chấm / hội đồng:

---

### 🔐 Kịch Bản 1: Đăng Nhập, Xác Thực, JWT, Session, LocalStorage & Keycloak IAM

1. **Thao tác Demo:**
   - Mở trình duyệt vào [http://localhost:5173](http://localhost:5173).
   - Click nút: **`👑 Quản Trị Viên (Admin)`** $\rightarrow$ Hệ thống lập tức đăng nhập thành công và chuyển vào `/admin-portal`.
2. **Chứng minh công nghệ cho người chấm:**
   - **LocalStorage:** Bấm `F12` trên trình duyệt $\rightarrow$ Chọn tab `Application` $\rightarrow$ `Local Storage` $\rightarrow$ Thấy key `auth_token` chứa chuỗi JWT Token và `auth_user` chứa thông tin người dùng.
   - **JWT Token:** Giải mã token trên `jwt.io` sẽ thấy payload chứa `roles: ["ROLE_ADMIN"]` và thời hạn hết hạn.
   - **HttpSession:** Tại Backend `AuthController.java`, dòng code `request.getSession(true)` tạo phiên session song song trên máy chủ.
   - **Mã hóa mật khẩu (BCrypt):** Mở H2 Console (`http://localhost:8088/api/h2-console`) truy vấn bảng `USERS`, trường `PASSWORD` hiển thị chuỗi băm chuẩn `$2a$10$...`.
   - **Đăng xuất & Redis Blacklist:** Khi bấm nút **Đăng Xuất** ở góc trên Portal, token được lưu vào Redis Blacklist với TTL tương ứng để vô hiệu hóa ngay lập tức.
   - **Quên mật khẩu (Forgot Password):** Endpoint `POST /api/auth/forgot-password` sinh mã reset tạm thời lưu vào Redis với TTL 30 phút.

---

### 🎨 Kịch Bản 2: Kiểm Tra 5 Thư Viện CSS Trên Admin Portal

1. **Thao tác Demo:**
   - Quan sát toàn bộ giao diện Cổng Quản Trị Doanh Nghiệp tại [http://localhost:5173](http://localhost:5173).
2. **Chứng minh công nghệ cho người chấm:**
   - **Ant Design (`antd`):** Toàn bộ hệ thống thanh Tab (`<Tabs>`), Bảng dữ liệu phân trang (`<Table>`), Hộp thoại Popup thẩm định (`<Modal>`), Biểu mẫu kiểm duyệt (`<Form>`, `<Input>`), Thẻ nhãn trạng thái (`<Tag>`), Khung thống kê chỉ số (`<Statistic>`).
   - **Bootstrap 5:** Bố cục hệ thống lưới (`container-fluid`, `row`, `col-*`, `d-flex`, `justify-content-between`, `align-items-center`).
   - **TailwindCSS:** Các lớp vi chỉnh độ thoáng `p-4`, `m-2`, bo góc `rounded-xl`, bóng mờ `shadow-lg`, chế độ hiển thị linh hoạt.
   - **Material Design Icons (`@mui/icons-material`):** Các biểu tượng chuẩn Google Material (`PointOfSaleIcon`, `CategoryIcon`, `PictureAsPdfIcon`, `SecurityIcon`, `SchoolIcon`, `CloudUploadIcon`).
   - **SCSS Styles (`enterprise-admin.scss`):** Sử dụng biến màu thương hiệu (`$primary-color`), mixin Glassmorphism mờ kính (`@mixin glass-card`), bo góc và hiệu ứng chuyển động mượt mà khi hover vào các thẻ card.

---

### 📦 Kịch Bản 3: CRUD Category Management với MyBatis Dynamic SQL & Redis Cache

1. **Thao tác Demo:**
   - Nhấp vào Tab **"Category Management (MyBatis)"**.
   - Bảng danh mục các môn thể thao (Bóng Đá, Cầu Lông, Pickleball, Tennis) hiển thị kèm nhãn màu tím `ORM: MyBatis XML Dynamic SQL`.
   - Gõ từ khóa tìm kiếm vào ô `Tìm theo tên danh mục...` (ví dụ: `Pickleball` hoặc `Bóng Đá`).
   - Bấm nút **"+ Thêm Danh Mục Mới"** $\rightarrow$ Nhập tên, slug, mô tả $\rightarrow$ Bấm Thêm để tạo mới.
2. **Chứng minh công nghệ cho người chấm:**
   - Mở file `CategoryMapper.xml` chỉ cho người chấm thấy các thẻ Dynamic SQL:
     - Thẻ `<select id="searchCategories">` với `<where>`, `<if test="name != null and name != ''">` và `<if test="isActive != null">`.
     - Thẻ `<insert id="batchInsert">` với vòng lặp `<foreach>` chèn hàng loạt dữ liệu.
   - **Redis Cache-Aside Pattern:** Mở `CategoryServiceImpl.java`, hệ thống kiểm tra Redis cache qua `redisCacheService.get(cacheKey)` trước; nếu cache miss mới gọi MyBatis và ghi ngược lại Redis với TTL 1 giờ. Khi thêm/sửa/xóa, cache bị xóa (eviction) để đảm bảo đồng nhất.

---

### 👥 Kịch Bản 4: CRUD User Management với Spring Data JPA & Hibernate

1. **Thao tác Demo:**
   - Nhấp vào Tab **"User Management (JPA)"**.
   - Bảng người dùng hiển thị danh sách tài khoản kèm nhãn màu xanh lá `ORM: Spring Data JPA & Hibernate`.
   - Bấm nút **"+ Thêm Người Dùng"**:
     - Nhập họ tên: `Nguyen Van An`
     - Email: `an.nguyen@sportsbooking.com`
     - SĐT: `0901234567`
     - Chọn quyền: `ROLE_PARTNER` hoặc `ROLE_CASHIER`
     - Bấm **Xác Nhận Thêm** $\rightarrow$ Người dùng mới lập tức được tạo và xuất hiện trên bảng.
2. **Chứng minh công nghệ cho người chấm:**
   - Mở file thực thể `User.java` và `Role.java`: Chỉ rõ các annotation JPA `@Entity`, `@Table`, `@Id`, `@GeneratedValue`, và mối quan hệ đa-đa `@ManyToMany` có bảng trung gian `user_roles`.
   - Mở interface `UserRepository.java`: Kế thừa `JpaRepository<User, Long>` tận dụng toàn bộ các hàm CRUD chuẩn của Spring Data và Hibernate EntityManager.

---

### 🔄 Kịch Bản 5: Camunda BPMN Workflow (Maker - Checker Ticket & Auto Email)

1. **Thao tác Demo:**
   - Nhấp vào Tab **"Maker - Checker (Camunda BPMN)"**.
   - Trên bảng hiển thị danh sách các Task đang ở trạng thái `Chờ Checker Duyệt` (ví dụ: Lệnh rút tiền ví đối tác, Yêu cầu đăng ký cụm sân mới).
   - Tại cột thao tác, bấm nút 👉 **"Xem & Phê Duyệt"**:
     - Hộp thoại thẩm định (Review Modal) hiện lên chi tiết số tiền, người gửi (Maker).
     - Nhập ghi chú đối soát: `Đã đối soát chứng từ hợp lệ, phê duyệt giải ngân.`
     - Bấm nút xanh **"Phê Duyệt (Approve)"** (hoặc nút đỏ **"Từ Chối (Reject)"**).
     - Trạng thái Task trên giao diện lập tức chuyển sang nhãn xanh `Đã Phê Duyệt (Approved)`.
2. **Chứng minh công nghệ trên Camunda Cockpit:**
   - Mở tab trình duyệt mới vào: **[http://localhost:8088/api/camunda](http://localhost:8088/api/camunda)**.
   - Đăng nhập: Tài khoản: `admin` / Mật khẩu: `adminpassword`.
   - Vào mục **Cockpit > Processes > makerCheckerTicketProcess**:
     - Sơ đồ BPMN chuẩn hiển thị trực quan:
       - **Start Event:** Maker tạo ticket qua API `/api/workflow/tickets`.
       - **User Task (`Task_CheckerReview`):** Checker nhận nhiệm vụ thẩm định trên Portal.
       - **Exclusive Gateway (`Gateway_Decision`):** Rẽ nhánh dựa trên biến `${approved}`.
       - **Service Tasks (`ProcessApprovedTicketDelegate` / `ProcessRejectedTicketDelegate`):** Xử lý nghiệp vụ tương ứng.
       - **Service Task (`Task_SendMail`):** Kích hoạt `SendEmailNotificationDelegate` tự động gửi email thông báo kết quả cho Maker qua Spring Mail.

---

### 📄 Kịch Bản 6: Báo Cáo JasperReports (PDF Chuẩn JRXML) & Apache POI Excel

1. **In Hóa Đơn Đặt Sân Kiosk POS (PDF JasperReports):**
   - Tại Tab **"Kiosk & Booking POS"** (hoặc Tab **"Jasper Reports & Excel"**), bấm nút:
     👉 **"In Hóa Đơn PDF (JasperReports)"**.
   - Trình duyệt sẽ mở trực tiếp file PDF hóa đơn được xuất từ API:
     `http://localhost:8088/api/reports/booking-invoice/INV-20260928/pdf`
   - **Cấu trúc template chuẩn trong file `booking_invoice.jrxml`:**
     - `Title Band`: Logo thương hiệu, số hóa đơn `INVOICE_NUMBER`.
     - `PageHeader Band`: Thông tin khách hàng, số điện thoại, ngày giờ đặt sân.
     - `ColumnHeader & Detail Band`: Danh sách chi tiết tiền sân, thuê vợt, nước giải khát.
     - `Summary Band`: Tổng tiền, giảm giá voucher, tổng thanh toán và chữ ký POS.
2. **Xuất Báo Cáo Kiểm Kê Kho (Excel):**
   - Tại Tab **"Shopping & Purchasing Kho"**, bấm nút:
     👉 **"Xuất Báo Cáo Kho (Excel)"**.
   - Trình duyệt tự động tải về file Excel báo cáo tồn kho xuất qua JasperReports `JRXlsxExporter`.
3. **Nhập Hàng Loạt từ Excel (Batch Import):**
   - Tại Tab **"Jasper Reports & Excel"**, chọn file `.xlsx` bất kỳ để upload $\rightarrow$ Service `ExcelDataImportService` sử dụng Apache POI `XSSFWorkbook` bóc tách từng ô (Cell) và gọi MyBatis `batchInsert` nạp vào database.

---

### ⚡ Kịch Bản 7: Message Queue (Kafka), Cache (Redis) & 6 Design Patterns

1. **Message Queue (Apache Kafka Event Streaming):**
   - Nhấp vào Tab **"Message Queue & Kafka Stream"**: Xem bảng lịch sử các thông điệp sự kiện được sản xuất (Produce) và tiêu thụ (Consume) theo thời gian thực trên 2 topic `sports.booking.events` và `sports.ticket.events`.
   - Mở file `KafkaEventProducer.java` (gửi event) và `KafkaEventConsumer.java` (`@KafkaListener` lắng nghe event và kích hoạt xóa cache).
2. **Chứng minh 6 Design Patterns trong mã nguồn:**
   - Nhấp vào Tab **"Training, Learning & Architecture"** để xem sơ đồ giải thích:
     1. **Strategy Pattern (`pattern/strategy`):** Đóng gói thuật toán thanh toán đa cổng linh hoạt (`PaymentStrategy`, `VNPayPaymentStrategy`, `CashierPaymentStrategy`, `WalletPaymentStrategy`) thông qua `PaymentContext`.
     2. **Factory Pattern (`pattern/factory`):** `NotificationFactory.java` khởi tạo dịch vụ thông báo (`EMAIL`, `SMS`, `PUSH`) theo tham số mà không để lộ logic khởi tạo.
     3. **Observer Pattern:** Mô hình xuất bản / đăng ký (Pub/Sub) bất đồng bộ qua Kafka Topics và Consumer Listener.
     4. **Singleton Pattern:** Quản lý vòng đời các Bean dịch vụ Spring Framework (`@Service`, `@Component`).
     5. **Repository Pattern:** Tách biệt rõ ràng tầng truy xuất dữ liệu (JPA Repositories & MyBatis Mappers) khỏi tầng nghiệp vụ logic.
     6. **Maker - Checker Pattern:** Mẫu kiểm soát 4 mắt bảo mật cao điều phối qua Camunda BPMN.

---

### 🌿 Kịch Bản 8: Kiểm Tra Quản Lý Nhánh Git Flow (main & develop)

Mở cửa sổ dòng lệnh tại thư mục dự án và kiểm tra:
```powershell
git branch -a
```
*Kết quả hiển thị:*
```text
* main
  develop
  remotes/khongphaidangvuadau/main
  remotes/khongphaidangvuadau/develop
```
Dự án đáp ứng đầy đủ tiêu chí phân nhánh:
- **`main`**: Nhánh phát hành ổn định cao, chứa mã nguồn hoàn chỉnh sẵn sàng review.
- **`develop`**: Nhánh tích hợp và phát triển liên tục các tính năng Enterprise.
- Trực quan hóa trên GitHub: [https://github.com/bason812004/khongphaidangvuadau/branches](https://github.com/bason812004/khongphaidangvuadau/branches).

---

## 6. DANH MỤC URL & CỔNG DỊCH VỤ TRUY CẬP

| Tên Dịch Vụ | Địa Chỉ Truy Cập | Mục Đích Sử Dụng | Tài Khoản Đăng Nhập |
| :--- | :--- | :--- | :--- |
| **Enterprise Admin Portal WebApp** | [http://localhost:5173](http://localhost:5173) | Cổng quản trị tập trung đầy đủ 8 tab chức năng | Click nút **`👑 Quản Trị Viên (Admin)`** |
| **Camunda Cockpit & Tasklist** | [http://localhost:8088/api/camunda](http://localhost:8088/api/camunda) | Quản lý & trực quan hóa luồng BPMN 4 mắt | `admin` / `adminpassword` |
| **H2 Database Console** | [http://localhost:8088/api/h2-console](http://localhost:8088/api/h2-console) | Quản trị CSDL nhúng xem bảng SQL trực tiếp | JDBC URL: `jdbc:h2:mem:sports_booking_db` (User: `sa`, Pass: trống) |
| **API In Hóa Đơn PDF** | [http://localhost:8088/api/reports/booking-invoice/INV-20260928/pdf](http://localhost:8088/api/reports/booking-invoice/INV-20260928/pdf) | Tải hóa đơn PDF JasperReports trực tiếp | Không yêu cầu |
| **API Báo Cáo Kho Excel** | [http://localhost:8088/api/reports/inventory/excel](http://localhost:8088/api/reports/inventory/excel) | Tải báo cáo kiểm kê kho Excel trực tiếp | Không yêu cầu |
| **API Danh Mục MyBatis** | [http://localhost:8088/api/categories](http://localhost:8088/api/categories) | Xem JSON danh mục truy vấn qua MyBatis | Không yêu cầu |

---

## 7. XỬ LÝ CÁC VẤN ĐỀ THƯỜNG GẶP (TROUBLESHOOTING)

1. **Trình duyệt báo `HTTP Status 404` khi vào Camunda:**
   - **Nguyên nhân:** Gõ thiếu tiền tố `/api`.
   - **Khắc phục:** Hãy gõ đúng link: **`http://localhost:8088/api/camunda`**.
2. **Cổng 8088 hoặc 5173 bị báo đã được sử dụng (Address already in use):**
   - Chạy lệnh tìm và tắt tiến trình chiếm cổng:
     ```powershell
     netstat -ano | findstr :8088
     taskkill /PID <MÃ_PID> /F
     ```
3. **Lệnh `mvn` không nhận trong PowerShell:**
   - Trong PowerShell, hãy dùng lệnh có đuôi `.cmd`:
     ```powershell
     cd sports-booking-system\enterprise-backend
     mvn.cmd spring-boot:run
     ```
   - Hoặc chạy trực tiếp file `sports-booking-system\run_enterprise_backend.bat`.
