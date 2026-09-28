# BÁO CÁO KỸ THUẬT HỆ THỐNG DOANH NGHIỆP: SPORTS BOOKING ENTERPRISE
## Kiến Trúc Spring Boot 3, Camunda BPMN, JasperReports, Dual ORM (JPA & MyBatis), Keycloak, Kafka & Redis

---

## 1. TỔNG QUAN HỆ THỐNG (EXECUTIVE SUMMARY)

Dự án **Sports Booking Enterprise** là một nền tảng quản trị và vận hành toàn diện cho hệ sinh thái sân bãi và dịch vụ thể thao. Hệ thống tích hợp đầy đủ các tiêu chuẩn kiến trúc cấp doanh nghiệp (Enterprise Architecture) thường được áp dụng trong lĩnh vực Ngân hàng, Fintech, Viễn thông và Thương mại dịch vụ quy mô lớn.

### Các Module Nghiệp Vụ Cốt Lõi:
1. **Kiosk & Booking POS**: Quầy check-in mã QR / Barcode, đặt sân tại điểm, thanh toán tiền mặt/chuyển khoản, in hóa đơn tức thì qua JasperReports.
2. **User Management**: Quản lý người dùng, phân quyền RBAC, tích hợp SSO Keycloak, thực thi bằng **Spring Data JPA & Hibernate**.
3. **Category Management**: Quản lý danh mục môn thi đấu và dịch vụ, thực thi bằng **MyBatis Dynamic SQL** và tăng tốc bằng **Redis Cache-Aside**.
4. **Maker - Checker Workflow**: Quy trình kiểm soát nội bộ (4-Eyes Principle) trên nền tảng **Camunda BPMN**, giải quyết bài toán duyệt sân mới và phê duyệt lệnh rút tiền ví của đối tác.
5. **Shopping & Purchasing**: Quản lý bán đồ phụ trợ (nước giải khát, bóng) và cho thuê trang thiết bị; xuất/nhập phiếu kho hàng bằng **JasperReports** và **Apache POI**.

---

## 2. KIẾN TRÚC HỆ THỐNG (SYSTEM ARCHITECTURE)

Hệ thống được thiết kế theo mô hình **Event-Driven Enterprise Architecture**:

```
[React Frontend Client]
  (Ant Design + Bootstrap + TailwindCSS + SCSS + Material Icons)
             │
             ▼ Bearer JWT / OIDC
[API Gateway & Security Layer] ◄───► [Keycloak Identity Provider]
             │
             ▼
[Spring Boot 3 Enterprise Backend Core (Java 21)]
  ├── Spring Data JPA & Hibernate (User & Role RBAC)
  ├── MyBatis Dynamic SQL (Category & Complex Search)
  ├── Camunda BPMN Engine (Maker-Checker Workflow)
  ├── JasperReports & Apache POI (PDF/Excel Invoices & Slips)
  ├── Design Patterns: Strategy (Payment), Factory (Notification)
  └── Kafka Producer / Consumer (Event-Driven Broker)
             │
   ┌─────────┴─────────┬──────────────────┐
   ▼                   ▼                  ▼
[PostgreSQL DB]   [Apache Kafka]   [Redis In-Memory Cache]
(Relational Data)  (Event Topics)   (Cache-Aside & Locks)
```

---

## 3. CHI TIẾT CÁC CÔNG NGHỆ ÁP DỤNG

### 3.1. Frontend UI & CSS Libraries
- **Ant Design (`antd`)**: Cung cấp các components doanh nghiệp cao cấp: `Table`, `Modal`, `Form`, `Tabs`, `Tag`, `Statistic`.
- **Bootstrap 5**: Cung cấp hệ thống lưới (Grid system), layout utilities (`d-flex`, `justify-content-between`, `align-items-center`).
- **TailwindCSS**: Tiện ích căn chỉnh vi mô (Micro-spacing, typography, responsive utilities).
- **Material Design Icons (`@mui/icons-material`)**: Hệ thống icon chuẩn Material Design (`PointOfSale`, `PictureAsPdf`, `Security`, `Dashboard`).
- **SCSS Styles (`enterprise-admin.scss`)**: Tùy biến biến màu thương hiệu (`$primary-color`, `$card-radius`), mixin Glassmorphism và custom responsive cards.

### 3.2. Dual ORM: Spring Data JPA/Hibernate & MyBatis
Dự án áp dụng mô hình **Dual ORM** chuẩn mực:
- **JPA & Hibernate**:
  - Dùng cho: `User`, `Role`, `UserDetail`.
  - Đặc điểm: Ánh xạ Object-Relational (`@Entity`, `@ManyToMany`), quản lý trạng thái thực thể qua Hibernate Persistence Context, đảm bảo tính toàn vẹn Transaction (`@Transactional`).
- **MyBatis**:
  - Dùng cho: `Category`, `Report queries`, `Batch operations`.
  - Đặc điểm: Kiểm soát 100% câu lệnh SQL thuần trong file `CategoryMapper.xml`. Sử dụng dynamic tags `<where>`, `<if>`, `<choose>`, `<foreach>` để tìm kiếm đa tiêu chí, phân trang hiệu năng cao và `batchInsert` hàng loạt.

### 3.3. Xác Thực Keycloak, JWT, Session & LocalStorage
- **Keycloak IAM**: Đóng vai trò là OpenID Connect (OIDC) Identity Provider. Quản lý Realm `sports-booking`, mã hóa mật khẩu theo chuẩn `PBKDF2`.
- **JWT (JSON Web Token)**: Ký điện tử bằng thuật toán `HS256`, chứa thông tin định danh và danh sách quyền (`roles`).
- **Session & LocalStorage**: 
  - Token được lưu trữ tại `localStorage` của Frontend để gắn vào `Authorization: Bearer <token>` trong mỗi request.
  - Backend đồng thời tạo `HttpSession` cho phép kiểm soát phiên đăng nhập song song.
  - Đăng xuất (Logout) sẽ kích hoạt cơ chế Blacklist Token lưu trên Redis với thời gian sống (TTL) tương ứng.

### 3.4. Camunda BPMN: Maker - Checker Workflow
- **BPMN Model (`maker_checker_ticket.bpmn`)**:
  - **Maker Task (Đối tác/Nhân viên)**: Khởi tạo ticket rút tiền hoặc yêu cầu đăng ký sân mới qua API `/workflow/tickets`.
  - **User Task (`Task_CheckerReview`)**: Checker (Admin) nhận task trong danh sách phê duyệt trên Admin Portal.
  - **Exclusive Gateway (`Gateway_Decision`)**: Kiểm tra biến `${approved}`:
    - Nếu `true`: Chuyển sang Service Task `processApprovedTicketDelegate`.
    - Nếu `false`: Chuyển sang Service Task `processRejectedTicketDelegate`.
  - **Service Task (`Task_SendMail`)**: Thực thi `SendEmailNotificationDelegate`, tự động gửi email thông báo kết quả cho Maker thông qua `JavaMailSender`.

### 3.5. Báo Cáo JasperReports & Nhập Liệu Excel
- **JasperReports Engine**:
  - File template: `booking_invoice.jrxml` (Hóa đơn đặt sân Kiosk POS) và `purchasing_inventory_report.jrxml` (Phiếu nhập xuất kho hàng).
  - Biên dịch và fill dữ liệu từ `JRBeanCollectionDataSource` sang định dạng **PDF** chuẩn mực (có mã hóa đơn, bảng chi tiết dịch vụ, tổng tiền).
  - Xuất báo cáo sang định dạng **Excel (XLSX)** qua `JRXlsxExporter`.
- **Nhập Liệu Apache POI (`ExcelDataImportService`)**:
  - Đọc file Excel `.xlsx`, bóc tách dữ liệu danh mục/sản phẩm và thực thi lệnh `batchInsert` qua MyBatis, tiết kiệm 95% thời gian nhập liệu thủ công.

### 3.6. Message Queue (Kafka), Redis Cache & Design Patterns
- **Apache Kafka**:
  - Topic `sports-booking-events`: Xử lý bất đồng bộ các sự kiện đặt sân, thanh toán.
  - Topic `sports-maker-checker-events`: Điều phối thông báo trạng thái ticket.
- **Redis Cache**:
  - Áp dụng **Cache-Aside Pattern**: Tra cứu key trong Redis trước khi truy vấn MyBatis. Nếu Cache Miss $\rightarrow$ truy vấn DB và ghi đè lại Cache với TTL 1 giờ.
  - Hỗ trợ **Distributed Lock** chống đặt trùng sân (Double Booking).
- **Design Patterns Thực Thi**:
  - **Strategy Pattern**: Xử lý thanh toán đa cổng (`PaymentContext`, `VNPayPaymentStrategy`, `MoMoPaymentStrategy`, `CashierPaymentStrategy`, `WalletPaymentStrategy`).
  - **Factory Pattern**: Khởi tạo thông báo (`NotificationFactory` $\rightarrow$ `EmailNotification`, `SmsNotification`).
  - **Observer Pattern**: Lắng nghe và tiêu thụ message thông qua Kafka `@KafkaListener`.
  - **Repository Pattern**: Tách biệt tầng truy xuất dữ liệu với nghiệp vụ.

---

## 4. HƯỚNG DẪN KHỞI CHẠY (DEPLOYMENT & RUN GUIDE)

### Bước 1: Khởi động Middleware qua Docker Compose
```bash
cd sports-booking-system
docker compose -f docker-compose.enterprise.yml up -d
```
*(Khởi động đồng thời PostgreSQL, Redis, Kafka, Zookeeper, và Keycloak).*

### Bước 2: Chạy Enterprise Backend (Spring Boot 3)
Mở thư mục `sports-booking-system/enterprise-backend` bằng IntelliJ IDEA hoặc VS Code và chạy:
```bash
# Hoặc chạy lệnh với Maven Wrapper
cd sports-booking-system/enterprise-backend
mvn spring-boot:run
```
- API Base URL: `http://localhost:8088/api`
- Camunda Cockpit & Tasklist: `http://localhost:8088/camunda`

### Bước 3: Chạy Frontend Admin Portal (React)
```bash
cd sports-booking-system/frontend
npm run dev
```
- Mở trình duyệt tại: `http://localhost:5173/admin-portal` để trải nghiệm trực tiếp toàn bộ các tính năng của Enterprise Admin Portal.

---

## 5. MÔ HÌNH PHÂN NHÁNH SOURCE CONTROL (GIT FLOW)
- `main`: Nhánh chứa mã nguồn ổn định sẵn sàng phát hành.
- `develop`: Nhánh tích hợp chính của toàn bộ các tính năng doanh nghiệp.
- `feature/*`: Các nhánh phát triển tính năng độc lập.
