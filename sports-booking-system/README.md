# Sports Booking Enterprise System - Hướng Dẫn Khởi Chạy & Báo Cáo Kỹ Thuật

> **Dự án Báo Cáo Thực Tập Tốt Nghiệp / Intern Final Project**  
> **Kiến trúc:** Enterprise Microservices & Monolith Hybrid (Spring Boot 3 + Camunda BPMN 7 + MyBatis + JPA/Hibernate + Keycloak + JasperReports + Kafka + Redis + React 19 / AntD / Tailwind / Bootstrap / SCSS).  
> **Source Control:** Quản lý mã nguồn chuẩn Git Flow với 2 nhánh cốt lõi `main` (Production) và `develop` (Integration).

---

## 1. Ma Trận Công Nghệ Áp Dụng (Technology Stack Matrix)

| Phân Vùng | Yêu Cầu Đề Bài | Công Nghệ Áp Dụng | File Mã Nguồn Đại Diện Trong Dự Án |
| :--- | :--- | :--- | :--- |
| **Giao Diện WebApp** | Admin Portal (Kiosk, Booking, Shopping, User, Purchasing, Learning) | React 19, Vite, TypeScript | `frontend/src/pages/admin/EnterpriseAdminPortalPage.tsx` |
| **Thư Viện CSS** | Bootstrap, TailwindCSS, AntD, Material Design Icons, SCSS | Bootstrap 5, Tailwind 3, AntD 6, `@mui/icons-material`, SASS | `frontend/src/styles/enterprise-admin.scss`, `package.json` |
| **Quản Lý User** | CRUD User Management | **Spring Data JPA & Hibernate** + Keycloak RBAC | `enterprise-backend/.../controller/UserController.java`, `User.java` |
| **Quản Lý Danh Mục** | CRUD Category Management | **MyBatis 3** Dynamic SQL (`<where>`, `<if>`, batch delete) | `enterprise-backend/.../mapper/CategoryMapper.xml`, `CategoryController.java` |
| **Bảo Mật & Auth** | Login, Logout, Register, Hash, Forgot Pass, Keycloak, JWT, Session | BCrypt, JWT (jjwt), HttpSession, LocalStorage, Keycloak OAuth2 | `enterprise-backend/.../controller/AuthController.java`, `SecurityConfig.java` |
| **Báo Cáo Thống Kê** | Import / Export với Jasper Report Template chuẩn | **JasperReports 6.21**, Apache POI (XLSX, PDF) | `enterprise-backend/.../resources/reports/booking_invoice.jrxml`, `ReportController.java` |
| **Quy Trình Nghiệp Vụ**| Camunda BPMN Workflow (Maker - Checker, Email Service) | **Camunda BPMN 7.21**, Service Task Delegate, JavaMailSender | `enterprise-backend/.../resources/processes/maker_checker_ticket.bpmn`, `MakerCheckerService.java` |
| **Message Queue** | Event Streaming | **Apache Kafka** (Event Producer & Consumer) | `enterprise-backend/.../kafka/KafkaEventProducer.java`, `KafkaEventConsumer.java` |
| **Bộ Nhớ Đệm** | Caching, Blacklist Token, Rate Limit | **Redis 7** (Cache-Aside Pattern) | `enterprise-backend/.../service/RedisCacheService.java` |
| **Design Patterns** | Các mẫu thiết kế hướng đối tượng | Singleton, Factory, Strategy, Observer, Cache-Aside, Maker-Checker | `enterprise-backend/.../pattern/factory`, `pattern/strategy` |
| **Source Control** | Quản lý nhánh phiên bản | **Git** (Nhánh `main` và nhánh `develop`) | Quản lý toàn bộ repository |

---

## 2. Cấu Trúc Dự Án (Project Structure)

```text
sports-booking-system/
├── enterprise-backend/                     # Backend Enterprise (Java 21 + Spring Boot 3)
│   ├── src/main/java/com/sportsbooking/enterprise/
│   │   ├── config/                        # SecurityConfig, DataInitializer, Redis/Kafka Config
│   │   ├── controller/                    # Auth, User, Category, Workflow, Report Controllers
│   │   ├── entity/                        # User, Role, Ticket Entities (JPA / Hibernate)
│   │   ├── model/                         # Category Model (MyBatis)
│   │   ├── mapper/                        # MyBatis Java Mapper Interfaces
│   │   ├── repository/                    # Spring Data JPA Repositories
│   │   ├── service/                       # Business Services (Jasper, Excel, Redis, User)
│   │   ├── workflow/                      # Camunda BPMN Maker-Checker & Java Delegates
│   │   ├── pattern/                       # Factory Pattern, Strategy Pattern Contexts
│   │   └── kafka/                         # Kafka Event Producer & Consumer
│   ├── src/main/resources/
│   │   ├── application.yml                # Cấu hình H2/Postgres, Camunda, Kafka, Redis, Mail
│   │   ├── mapper/CategoryMapper.xml       # MyBatis Dynamic SQL
│   │   ├── processes/                     # Camunda BPMN XML (maker_checker_ticket.bpmn)
│   │   └── reports/                       # JasperReports XML Templates (.jrxml)
│   ├── mvnw.cmd                           # Maven Wrapper tự động
│   └── pom.xml                            # Quản lý thư viện Maven
│
├── frontend/                              # Frontend Portal (React 19 + Vite + TypeScript)
│   ├── src/
│   │   ├── pages/admin/EnterpriseAdminPortalPage.tsx  # Cổng Admin Portal Enterprise đầy đủ
│   │   ├── styles/enterprise-admin.scss   # SCSS Styles kết hợp Glassmorphism
│   │   ├── routes/AppRoutes.tsx           # Định tuyến (direct route: /admin-portal)
│   │   └── components/                    # AntD & Bootstrap Components
│   └── package.json                       # AntD, MUI Icons, Bootstrap, Tailwind, Sass
│
├── backend/                               # Backend Node.js / Express (Dịch vụ mở rộng)
├── database/                              # PostgreSQL / Supabase SQL Schema
├── docker-compose.enterprise.yml          # Container Postgres, Redis, Kafka, Zookeeper, Keycloak
├── run_enterprise_backend.bat             # Script 1-click chạy Backend
├── run_frontend.bat                       # Script 1-click chạy Frontend
└── run_docker_middleware.bat              # Script 1-click chạy Docker Middleware
```

---

## 3. Hướng Dẫn Khởi Động Dự Án (Quick Start)

Hệ thống được thiết kế **Zero-Configuration Fallback**: Tích hợp sẵn cơ sở dữ liệu In-Memory H2, tài khoản Admin khởi tạo tự động, và Kafka Listener Mock giúp bạn có thể chạy và demo ngay lập tức mà không bắt buộc phải cài đặt Docker hay dịch vụ đám mây phức tạp.

### Cách 1: Khởi Chạy 1-Click Bằng File Batch (Khuyên Dùng)

1. **Khởi động Backend Enterprise:**
   Nhấp đúp chuột vào file:
   👉 **`run_enterprise_backend.bat`**  
   *(Tự động phát hiện Maven, biên dịch và chạy Spring Boot trên cổng **8088**)*.

2. **Khởi động Frontend Portal:**
   Nhấp đúp chuột vào file:
   👉 **`run_frontend.bat`**  
   *(Tự động chạy Vite Dev Server trên cổng **5173**)*.

3. **Truy cập Giao diện Web:**
   Mở trình duyệt vào địa chỉ: **[http://localhost:5173/admin-portal](http://localhost:5173/admin-portal)**.

---

### Cách 2: Khởi Chạy Bằng Dòng Lệnh (Terminal / PowerShell)

#### Bước 1: Chạy Backend (Port 8088)
```powershell
cd sports-booking-system/enterprise-backend
.\mvnw.cmd spring-boot:run
```
*(Hoặc dùng lệnh `mvn spring-boot:run` nếu máy bạn đã cấu hình biến môi trường Maven).*

Khi xuất hiện thông báo sau trên terminal là backend đã sẵn sàng:
```text
===============================================================
Enterprise Sports Booking Backend Service successfully started!
Port: 8088 | Context Path: /api
Camunda Cockpit & Tasklist: http://localhost:8088/camunda
Keycloak / JWT Auth: Active
MyBatis + JPA/Hibernate Dual ORM: Active
JasperReports Engine: Active
Kafka & Redis Cache: Active
===============================================================
```

#### Bước 2: Chạy Frontend (Port 5173)
```powershell
cd sports-booking-system/frontend
npm run dev
```
Trình duyệt hiển thị: `http://localhost:5173/`

#### Bước 3 (Tùy chọn - Khi muốn test Middleware thực tế trên Docker):
```powershell
cd sports-booking-system
docker compose -f docker-compose.enterprise.yml up -d
```
*(Khởi động PostgreSQL 5432, Redis 6379, Zookeeper 2181, Kafka 9092, Keycloak 8080).*

---

## 4. Tài Khoản Mẫu Đăng Nhập (Sample Credentials)

| Vai trò (Role) | Email Đăng Nhập | Mật khẩu | Phạm vi Phân Quyền |
| :--- | :--- | :--- | :--- |
| **Super Admin / Checker** | `admin@sportsbooking.com` | `admin123` *(hoặc `123456`)* | Toàn quyền kiểm trị, Checker duyệt Ticket Camunda, Quản lý User/Category |
| **Đối tác Sân (Partner)** | `partner.danang@sportsbooking.com` | `123456` | Quản lý sân, tạo ticket rút tiền (Maker) |
| **Thu Ngân (Cashier POS)**| `cashier01@sportsbooking.com` | `123456` | Quầy Kiosk, check-in mã QR, in hóa đơn JasperReports |
| **Khách Hàng (Customer)** | `customer.long@gmail.com` | `123456` | Đặt chỗ, gửi yêu cầu hoàn tiền |
| **Camunda Cockpit UI** | `admin` | `adminpassword` | Đăng nhập Camunda Web Admin tại `/camunda` |

---

## 5. Kịch Bản Test Chi Tiết Từng Công Nghệ (Testing & Demo Script)

Dưới đây là 8 bước thao tác thực tế giúp bạn chứng minh trọn vẹn tất cả công nghệ trong buổi báo cáo:

### Kịch Bản 1: Kiểm Tra Giao Diện UI & Kết Hợp Đa Thư Viện CSS
1. Mở trình duyệt vào **`http://localhost:5173/admin-portal`**.
2. **Chứng minh kỹ thuật:**
   - **Ant Design (AntD):** Thanh điều hướng Tabs (`<Tabs>`), Bảng dữ liệu phân trang (`<Table>`), Hộp thoại Popup (`<Modal>`), Biểu mẫu Form kiểm duyệt dữ liệu (`<Form>`, `<Input>`, `<Select>`), Thẻ tag trạng thái (`<Tag>`), Thống kê (`<Statistic>`).
   - **Material Design Icons:** Hệ thống biểu tượng nghiệp vụ từ `@mui/icons-material` (`PointOfSaleIcon`, `CategoryIcon`, `PictureAsPdfIcon`, `SchoolIcon`, `SecurityIcon`).
   - **Bootstrap 5:** Bố cục flexbox & grid chuẩn công nghiệp (`d-flex`, `justify-content-between`, `table-bordered`, `alert alert-info`, `alert-success`).
   - **TailwindCSS:** Đổ bóng thẻ `shadow-sm`, bo góc `rounded-xl`, viền `border`.
   - **SCSS Styles (`enterprise-admin.scss`):** Kỹ thuật tiền xử lý CSS SASS, sử dụng `@mixin glass-card` đổ bóng kính mờ (Glassmorphism), viền gradient và định dạng thẻ Tech Pill.

---

### Kịch Bản 2: Test User Management (Spring Data JPA & Hibernate)
1. Trên giao diện Portal, nhấp vào tab **"User Management (JPA)"**.
2. Bấm nút **"+ Thêm Người Dùng Mới"**:
   - Nhập: Họ tên: `Nguyen Van Thuan`, Email: `thuan.nguyen@sportsbooking.com`, SĐT: `0908889999`.
   - Chọn vai trò Keycloak: `ROLE_PARTNER` hoặc `ROLE_CASHIER`.
   - Bấm **OK** $\rightarrow$ Người dùng mới lập tức được tạo qua Spring Data JPA và hiển thị trên bảng dữ liệu.
3. **Kiểm tra API Backend qua PowerShell:**
   ```powershell
   Invoke-RestMethod -Uri "http://localhost:8088/api/users" -Method Get | ConvertTo-Json -Depth 4
   ```
   *Kết quả:* Trả về JSON phân trang, mật khẩu được mã hóa an toàn bằng BCrypt hash (`$2a$10$...`).

---

### Kịch Bản 3: Test Category Management (MyBatis Dynamic SQL + Redis Cache)
1. Chuyển sang tab **"Category Management (MyBatis)"**.
2. Nhập từ khóa vào ô tìm kiếm: `Pickleball` hoặc `Bóng Đá` $\rightarrow$ Chứng minh tính năng Dynamic SQL với thẻ `<where>` và `<if test="name != null">` trong `CategoryMapper.xml`.
3. Bấm **"+ Thêm Danh Mục"** để thêm môn thể thao mới.
4. **Chứng minh cơ chế Cache-Aside (Redis):**
   - Khi đọc dữ liệu: Hệ thống kiểm tra Redis trước, nếu có cache thì trả về dưới 5ms.
   - Khi thêm/sửa/xóa: Hệ thống tự động xóa cache key tương ứng trong Redis để đảm bảo tính nhất quán (Cache Eviction).
5. **Kiểm tra API Backend:**
   ```powershell
   Invoke-RestMethod -Uri "http://localhost:8088/api/categories" -Method Get | ConvertTo-Json
   ```

---

### Kịch Bản 4: Test Đăng Nhập, Mật Khẩu, JWT, Session, LocalStorage & Keycloak
1. Xem mã nguồn tại `AuthController.java` và `SecurityConfig.java`.
2. **Luồng Đăng Nhập (Login):**
   - Gọi `POST /api/auth/login` với email `admin@sportsbooking.com` và pass `admin123`.
   - Backend dùng `PasswordEncoder` (BCrypt) đối chiếu mật khẩu.
   - Khi thành công, tạo **HttpSession** trên máy chủ (`httpRequest.getSession(true)`), đồng thời sinh chuỗi **JWT Access Token** trả về cho Frontend lưu vào **LocalStorage**.
3. **Luồng Đăng Xuất (Logout & Token Blacklist):**
   - Khi gọi `POST /api/auth/logout`, Session bị hủy, JWT Token được đưa vào Redis Blacklist với TTL 24 giờ để vô hiệu hóa token ngay lập tức.
4. **Luồng Quên Mật Khẩu (Forgot Password):**
   - Gọi `POST /api/auth/forgot-password`: Sinh token khôi phục ngẫu nhiên lưu vào Redis với thời hạn 30 phút (`pwd_reset:{token}`).

---

### Kịch Bản 5: Test JasperReports & Apache POI (Template Chuẩn, In PDF, Xuất/Nhập Excel)
1. **In Hóa Đơn Đặt Sân Kiosk POS (PDF JasperReports):**
   - Tại Tab **"Kiosk & Booking POS"** hoặc Tab **"Jasper Reports & Excel"**, bấm nút:
     👉 **"In Hóa Đơn PDF (JasperReports)"**.
   - Trình duyệt sẽ mở API xuất file PDF: `http://localhost:8088/api/reports/booking-invoice/INV-20260928/pdf`.
   - **Cấu trúc Template chuẩn trong file `booking_invoice.jrxml`:**
     - `Title Band`: Tên thương hiệu hệ thống, Watermark, số hóa đơn `INVOICE_NUMBER`.
     - `PageHeader Band`: Thông tin khách hàng, số điện thoại, tên sân và khung giờ.
     - `ColumnHeader & Detail Band`: Danh sách chi tiết tiền sân, thuê dụng cụ, nước giải khát.
     - `Summary Band`: Tính tổng tiền, trừ voucher giảm giá, số tiền thanh toán thực tế và phương thức POS.
2. **Xuất Báo Cáo Nhập Kho & Thu Mua (Excel qua Apache POI):**
   - Tại Tab **"Shopping & Purchasing"**, bấm: 👉 **"Xuất Báo Cáo Kho (JasperReports Excel)"**.
   - API tải file Excel tự động: `http://localhost:8088/api/reports/inventory/excel`.
3. **Nhập Hàng Loạt từ Excel (Batch Import):**
   - Tại Tab **"Jasper Reports & Excel"**, chọn file `.xlsx` bất kỳ để upload $\rightarrow$ Service `ExcelDataImportService` sử dụng Apache POI `XSSFWorkbook` bóc tách từng Cell và insert hàng loạt vào DB.

---

### Kịch Bản 6: Test Quy Trình Camunda BPMN (Maker - Checker Ticket & Auto Email)
1. **Quy trình Nghiệp vụ (BPMN Workflow):**
   - Quá trình quản trị doanh nghiệp áp dụng nguyên tắc **4 Mắt (Maker - Checker)**:
     - **Maker (Partner / User):** Khởi tạo yêu cầu (Ticket) rút tiền ví hoặc đăng ký sân.
     - **Camunda Engine:** Khởi tạo Process Instance, sinh ra một `User Task` chờ thẩm định.
     - **Checker (Admin):** Thẩm định hồ sơ và đưa ra quyết định Duyệt (Approve) hoặc Từ chối (Reject).
     - **Service Task:** Khi được duyệt, Camunda kích hoạt `ProcessApprovedTicketDelegate`, sau đó gọi `SendEmailNotificationDelegate` gửi email thông báo kết quả tự động cho Maker qua Spring Mail.
2. **Thao tác Thẩm định trên Portal:**
   - Tại Tab **"Maker - Checker (Camunda BPMN)"**, chọn một Task đang ở trạng thái `Chờ Checker Duyệt`.
   - Bấm **"Xem & Phê Duyệt"** $\rightarrow$ Nhập ghi chú đối soát $\rightarrow$ Bấm **Phê Duyệt (Approve)**.
   - Trạng thái Task lập tức cập nhật thành `Đã Phê Duyệt`.
3. **Kiểm tra trực tiếp trên Camunda Cockpit:**
   - Mở trình duyệt vào: **[http://localhost:8088/camunda](http://localhost:8088/camunda)**.
   - Đăng nhập: Tài khoản: `admin` / Mật khẩu: `adminpassword`.
   - Vào mục **Cockpit > Processes > makerCheckerTicketProcess**: Xem sơ đồ BPMN trực quan, số lượng process instance đang chạy, heatmap và lịch sử audit.

---

### Kịch Bản 7: Test Message Queue (Kafka), Redis Cache & 6 Design Patterns
1. **Kiểm tra Message Queue (Kafka Event Streaming):**
   - `KafkaEventProducer.java`: Bắn sự kiện đặt sân lên topic `sports.booking.events` và sự kiện thẩm định lên topic `sports.ticket.events`.
   - `KafkaEventConsumer.java`: Nhận sự kiện đặt sân theo thời gian thực và kích hoạt xóa cache trạng thái phòng/sân trống trong Redis để tránh xung đột lịch đặt.
2. **Chứng minh 6 Design Patterns trong mã nguồn:**
   - **Singleton Pattern:** Quản trị vòng đời Spring Managed Beans (`@Service`, `@Component`, `@Configuration`).
   - **Factory Pattern (`pattern/factory`):** `NotificationFactory.java` tạo đối tượng dịch vụ thông báo (`EMAIL`, `SMS`, `PUSH`) theo tham số truyền vào mà không để lộ logic khởi tạo.
   - **Strategy Pattern (`pattern/strategy`):** Đóng gói linh hoạt các phương thức thanh toán (`VNPayPaymentStrategy`, `CashierPaymentStrategy`, `WalletPaymentStrategy`) thông qua interface `PaymentStrategy` và `PaymentContext`.
   - **Observer Pattern:** Mô hình Publisher / Subscriber bất đồng bộ qua Kafka Topics.
   - **Maker - Checker Pattern:** Mẫu kiểm soát 4 mắt bảo mật cao điều phối qua Camunda BPMN.
   - **Cache-Aside Pattern:** Cơ chế đọc cache trước từ Redis, nếu miss mới query database và set lại cache.

---

### Kịch Bản 8: Kiểm Tra Quản Lý Nhánh Git (Git Branches)
Mở cửa sổ dòng lệnh tại thư mục gốc dự án và chạy:
```bash
git branch -a
```
*Kết quả hiển thị:*
```text
* develop
  main
  feature/admin
  feature/customer
  remotes/origin/main
  remotes/origin/develop
```
Dự án đáp ứng đầy đủ tiêu chí phân nhánh:
- `main`: Nhánh production ổn định cao.
- `develop`: Nhánh tích hợp và phát triển liên tục các tính năng Enterprise.

---

## 6. Danh Mục URL & Cổng Dịch Vụ Quan Trọng

| Tên Dịch Vụ | Địa Chỉ Truy Cập | Mục Đích Sử Dụng |
| :--- | :--- | :--- |
| **Enterprise Admin Portal** | [http://localhost:5173/admin-portal](http://localhost:5173/admin-portal) | Giao diện quản trị toàn diện đầy đủ các module |
| **Sports Booking Public Web**| [http://localhost:5173](http://localhost:5173) | Trang chủ tìm kiếm và đặt sân công cộng |
| **Camunda Cockpit & Tasklist**| [http://localhost:8088/camunda](http://localhost:8088/camunda) | Quản lý quy trình BPMN trực quan *(admin / adminpassword)* |
| **H2 Database Console** | [http://localhost:8088/api/h2-console](http://localhost:8088/api/h2-console) | Quản trị CSDL nhúng *(JDBC URL: `jdbc:h2:mem:sports_booking_db`, User: `sa`, Pass: trống)* |
| **API In Hóa Đơn PDF** | [http://localhost:8088/api/reports/booking-invoice/INV-20260928/pdf](http://localhost:8088/api/reports/booking-invoice/INV-20260928/pdf) | Tải hóa đơn PDF JasperReports trực tiếp |
| **API Báo Cáo Kho Excel** | [http://localhost:8088/api/reports/inventory/excel](http://localhost:8088/api/reports/inventory/excel) | Tải báo cáo kiểm kê Excel JasperReports |
| **API Swagger / OpenAPI (nếu bật)**| [http://localhost:8088/api/swagger-ui.html](http://localhost:8088/api/swagger-ui.html) | Danh mục tra cứu RESTful API |

---

## 7. Xử Lý Các Vấn Đề Thường Gặp (Troubleshooting)

1. **Lệnh `mvn` không nhận diện được:**
   - Sử dụng file script [run_enterprise_backend.bat](run_enterprise_backend.bat) hoặc dùng lệnh `.\mvnw.cmd spring-boot:run`.
   - Đường dẫn Maven tích hợp của IntelliJ IDEA trên máy bạn: `C:\Program Files\JetBrains\IntelliJ IDEA 2025.3.2\plugins\maven\lib\maven3\bin`.
2. **Cổng 8088 hoặc 5173 bị báo trùng (Port already in use):**
   - Kiểm tra và tắt tiến trình cũ bằng lệnh:
     ```powershell
     netstat -ano | findstr :8088
     taskkill /PID <MÃ_PID> /F
     ```
3. **Lỗi kết nối cơ sở dữ liệu:**
   - Mặc định ứng dụng chạy H2 In-Memory Database không cần cài đặt. Nếu muốn kết nối PostgreSQL Docker, chỉ cần chạy file `run_docker_middleware.bat` và cấu hình biến môi trường `SPRING_DATASOURCE_URL`.
