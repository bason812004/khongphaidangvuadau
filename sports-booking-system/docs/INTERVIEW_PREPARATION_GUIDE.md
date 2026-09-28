# BỘ CÂU HỎI & ĐÁP ÁN PHỎNG VẤN CHUYÊN SÂU (INTERVIEW Q&A PREPARATION)
## Dự Án Sports Booking Enterprise (Frontend / Backend / Database / Trending Techs)

---

## PHẦN 1: FRONTEND (REACT, UI LIBRARIES & STATE MANAGEMENT)

### Câu 1: Tại sao dự án lại kết hợp Ant Design, Bootstrap, TailwindCSS, SCSS và Material Icons? Làm sao để tránh xung đột CSS giữa các thư viện này?
- **Trả lời**:
  - **Mục đích phân định**:
    - *Ant Design (`antd`)*: Đóng vai trò là Enterprise Component Kit cung cấp các thành phần phức tạp cho trang Admin như Data Grid (Table), Modal, Tabs, Form validation, Drawer.
    - *Bootstrap*: Cung cấp hệ thống lưới Responsive Grid (`row`, `col-md-*`) và tiện ích bố cục flexbox cơ bản quen thuộc.
    - *TailwindCSS*: Sử dụng cho các tinh chỉnh vi mô (Micro-utilities: margin, padding, border radius, gradient) mà không phải đặt tên class tùy tiện.
    - *SCSS*: Quản lý biến màu toàn cục (`$primary-color`, `$card-radius`), các mixin tái sử dụng (như glassmorphism effect) và custom scrollbars.
    - *Material Design Icons*: Đảm bảo tính nhất quán về biểu tượng thị giác theo chuẩn Google Material Design.
  - **Tránh xung đột CSS**:
    - Sử dụng tiền tố CSS (CSS Prefixing) hoặc scoped styles.
    - Đặt SCSS trong các class cha chuyên biệt (như `.enterprise-admin-container`).
    - Cấu hình PostCSS và CSS Reset có chọn lọc để các reset class của Tailwind không làm vỡ các button của Bootstrap hoặc Ant Design.

### Câu 2: Trong ứng dụng, Access Token (JWT) được lưu ở đâu? So sánh LocalStorage và HttpOnly Cookie về mặt bảo mật?
- **Trả lời**:
  - **Hiện tại**: Token được lưu trong `localStorage` để các HTTP Interceptor (Axios) dễ dàng gắn vào header `Authorization: Bearer <token>`.
  - **So sánh bảo mật**:
    - *LocalStorage*: Dễ triển khai, tiện lợi cho SPA, nhưng **dễ bị tổn thương trước tấn công XSS (Cross-Site Scripting)**. Nếu hacker chèn được script độc hại vào trang web, chúng có thể đọc trộm token qua `window.localStorage`.
    - *HttpOnly Cookie*: Trình duyệt ngăn chặn hoàn toàn JavaScript truy cập cookie này, giúp **chống XSS tuyệt đối**. Tuy nhiên, cần cấu hình thêm cờ `SameSite=Strict` hoặc token chống CSRF (Cross-Site Request Forgery).
  - **Giải pháp chuẩn Production**: Lưu Access Token có thời hạn ngắn (15 phút) trong bộ nhớ (In-Memory / React State) và lưu Refresh Token trong `HttpOnly`, `Secure`, `SameSite` Cookie.

---

## PHẦN 2: BACKEND & ENTERPRISE ARCHITECTURE

### Câu 3: Khi nào nên dùng JPA/Hibernate, khi nào nên dùng MyBatis trong cùng một dự án?
- **Trả lời**:
  - **Dùng JPA & Hibernate**:
    - Phù hợp cho các thao tác **CRUD chuẩn mực**, quản lý quan hệ đối tượng chặt chẽ (như User có nhiều Role, User có Hồ sơ).
    - Tận dụng cơ chế Dirty Checking, First-level cache, tự sinh câu lệnh SQL và quản lý vòng đời thực thể tự động.
    - Đảm bảo tính toàn vẹn dữ liệu trong các luồng Transaction nghiệp vụ cốt lõi.
  - **Dùng MyBatis**:
    - Phù hợp cho các bài toán **báo cáo, thống kê, tìm kiếm động (Dynamic SQL)** với nhiều điều kiện lọc lồng ghép (`<if>`, `<choose>`, `<where>`, `<foreach>`).
    - Kiểm soát 100% câu lệnh SQL thuần túy, dễ dàng tinh chỉnh (tuning) câu query phức tạp, join nhiều bảng mà không gặp lỗi kinh điển **N+1 Query Problem** của Hibernate.
    - Phù hợp cho các tác vụ ghi/xóa hàng loạt (`batchInsert`, `batchDelete`) với hiệu năng cao gấp nhiều lần ORM trừu tượng.

### Câu 4: Maker - Checker Pattern trong Camunda BPMN giải quyết vấn đề gì trong doanh nghiệp?
- **Trả lời**:
  - Giải quyết nguyên tắc kiểm soát nội bộ **"Nguyên tắc 4 mắt" (Four-Eyes Principle)**: Không một cá nhân nào có thể tự ý khởi tạo và hoàn tất một giao dịch nhạy cảm có rủi ro gian lận hoặc sai sót.
  - *Ví dụ trong dự án*:
    - **Maker (Đối tác/Nhân viên)**: Yêu cầu rút tiền ví đối tác 15,500,000 VND $\rightarrow$ Chỉ được tạo ticket, không có quyền tự kích hoạt chuyển tiền.
    - **Checker (Quản trị viên/Kế toán)**: Nhận User Task trên Camunda để thẩm định số dư, đối chiếu doanh thu $\rightarrow$ Nhấn Approve hoặc Reject kèm lý do.
  - *Lợi ích của Camunda*:
    - Tách biệt logic quy trình ra khỏi code cứng (decoupling business process from application code).
    - Toàn bộ trạng thái, thời gian xử lý và người duyệt được lưu vào **Audit Log không thể sửa đổi (Immutable History)**.

### Câu 5: JasperReports hoạt động như thế nào trong ứng dụng Java Spring Boot?
- **Trả lời**:
  - **Quy trình 3 bước**:
    1. *Design*: Thiết kế cấu trúc báo cáo bằng Jaspersoft Studio và lưu thành file template XML `.jrxml` (chứa các band: Title, PageHeader, ColumnHeader, Detail, Summary).
    2. *Compile*: Ứng dụng Spring Boot dùng `JasperCompileManager.compileReport(...)` để biên dịch file `.jrxml` thành đối tượng nhị phân `JasperReport` (hoặc tiền biên dịch thành `.jasper`).
    3. *Fill & Export*: Kết hợp đối tượng báo cáo với dữ liệu đầu vào (Map Parameters và `JRBeanCollectionDataSource`), sau đó dùng `JasperExportManager.exportReportToPdf(...)` để sinh file PDF hoặc `JRXlsxExporter` để sinh file Excel.

---

## PHẦN 3: DATABASE & GIAO DỊCH (TRANSACTION & CONCURRENCY)

### Câu 6: Làm sao để xử lý triệt để bài toán đặt trùng sân (Double Booking) khi hai người cùng đặt một sân ở cùng một khung giờ tại cùng một thời điểm?
- **Trả lời**: Hệ thống áp dụng chiến lược phòng vệ 3 lớp (3-Tier Protection):
  1. **Lớp 1 - Redis Distributed Lock (Redisson)**:
     - Khi người dùng bấm "Thanh toán giữ sân", hệ thống acquire lock với key: `lock:court:{courtId}:{date}:{startTime}` trong 15 giây. Người thứ hai bấm sau sẽ nhận thông báo: "Khung giờ này đang có người giao dịch, vui lòng thử lại sau".
  2. **Lớp 2 - Database Pessimistic / Optimistic Locking**:
     - Trong transaction đặt sân, sử dụng `SELECT ... FOR UPDATE` (Pessimistic Lock) trên dòng slot sân hoặc kiểm tra cột `version` (Optimistic Lock).
  3. **Lớp 3 - Database Constraint & Điều kiện Overlap**:
     - Câu điều kiện kiểm tra trùng lịch kinh điển: `newStart < existingEnd AND newEnd > existingStart`.
     - Sử dụng Postgres Exclusion Constraint trên trường kiểu khoảng thời gian `tsrange` để Database tự động từ chối nếu có 2 bản ghi giao nhau.

### Câu 7: Phân biệt Transactional Isolation Levels (READ UNCOMMITTED, READ COMMITTED, REPEATABLE READ, SERIALIZABLE)?
- **Trả lời**:
  - *Read Uncommitted*: Cho phép đọc dữ liệu chưa commit $\rightarrow$ Dẫn đến hiện tượng **Dirty Read**.
  - *Read Committed (Mặc định của PostgreSQL)*: Chỉ đọc dữ liệu đã commit $\rightarrow$ Tránh Dirty Read, nhưng có thể gặp **Non-repeatable Read** (cùng 1 câu query trả về giá trị khác nhau giữa transaction).
  - *Repeatable Read*: Đảm bảo đọc cùng 1 dữ liệu trong suốt transaction $\rightarrow$ Tránh Non-repeatable Read, nhưng có thể gặp **Phantom Read** (xuất hiện thêm dòng mới do transaction khác insert).
  - *Serializable*: Mức cách ly cao nhất, các transaction được thực thi tuần tự như thể chạy một luồng $\rightarrow$ Loại bỏ hoàn toàn mọi hiện tượng bất thường, nhưng giảm thông lượng hệ thống (Throughput) nhiều nhất.

---

## PHẦN 4: TRENDING TECHNOLOGIES & SYSTEM DESIGN

### Câu 8: Vai trò của Apache Kafka trong hệ sinh thái này là gì? Tại sao không dùng REST Call đồng bộ?
- **Trả lời**:
  - **Tách rời dịch vụ (Decoupling)**: Khi khách hàng thanh toán xong, hệ thống không bắt khách hàng phải chờ gửi email, in hóa đơn, cập nhật ví đối tác và ghi log kiểm toán.
  - **Xử lý bất đồng bộ (Asynchronous Processing)**: Backend chỉ cần publish một event lên topic `sports-booking-events` trong 2ms và trả kết quả thành công ngay cho người dùng.
  - **Khả năng chịu tải và đệm dữ liệu (Buffering & Backpressure)**: Trong các dịp cao điểm (như mở đăng ký giải đấu thể thao lớn), lưu lượng request tăng đột biến. Kafka đóng vai trò như một bộ đệm an toàn, các Consumer sẽ tiêu thụ sự kiện theo tốc độ tối ưu mà không sợ sập database.
  - **Mô hình Pub/Sub đa Consumer**: Cùng một sự kiện đặt sân, Notification Service tiêu thụ để gửi mail, Reporting Service tiêu thụ để cập nhật doanh thu, Audit Service tiêu thụ để lưu log mà không ảnh hưởng lẫn nhau.

### Câu 9: Trình bày Cache-Aside Pattern với Redis và cách giải quyết các bài toán Cache Stampede / Cache Breakdown?
- **Trả lời**:
  - **Nguyên lý Cache-Aside**:
    - Khi đọc: Ứng dụng kiểm tra Redis Cache trước. Nếu có (Cache Hit) $\rightarrow$ trả về kết quả. Nếu không có (Cache Miss) $\rightarrow$ đọc từ Database, sau đó ghi ngược vào Redis kèm thời gian sống (TTL), rồi mới trả về.
    - Khi ghi/cập nhật: Cập nhật Database trước, sau đó xóa key tương ứng trong Redis (Evict Cache).
  - **Xử lý Cache Breakdown (Một key hot hết hạn đúng lúc có hàng nghìn request truy cập cùng lúc)**:
    - Sử dụng **Mutex Lock (Distributed Lock)**: Chỉ cho phép request đầu tiên lấy lock để truy vấn DB và ghi lại vào cache; các request khác đợi lock hoặc trả về giá trị cũ tạm thời (Stale While Revalidate).
  - **Xử lý Cache Avalanche (Hàng loạt key cùng hết hạn tại một thời điểm)**:
    - Thêm một khoảng thời gian ngẫu nhiên (Jitter / Random Jitter: ví dụ TTL = 60 phút + `random(0, 300)` giây) để thời điểm hết hạn phân tán đều.
