import React, { useState } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Tag,
  Tabs,
  Card,
  Badge,
  Space,
  Row,
  Col,
  Statistic,
  message,
  Switch,
  Upload,
  Select,
  Tooltip,
} from "antd";
import type { ColumnsType } from "antd/es/table";

// Material Design Icons
import DashboardIcon from "@mui/icons-material/Dashboard";
import PeopleIcon from "@mui/icons-material/People";
import CategoryIcon from "@mui/icons-material/Category";
import PointOfSaleIcon from "@mui/icons-material/PointOfSale";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import TableViewIcon from "@mui/icons-material/TableView";
import SecurityIcon from "@mui/icons-material/Security";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import RefreshIcon from "@mui/icons-material/Refresh";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import EmailIcon from "@mui/icons-material/Email";
import StorageIcon from "@mui/icons-material/Storage";
import SchoolIcon from "@mui/icons-material/School";
import LogoutIcon from "@mui/icons-material/Logout";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../features/auth/hooks/useAuth";

import "../../styles/enterprise-admin.scss";

interface UserItem {
  id: number;
  email: string;
  fullName: string;
  phone: string;
  roles: string[];
  isActive: boolean;
  orm: string;
}

interface CategoryItem {
  id: number;
  name: string;
  slug: string;
  icon: string;
  description: string;
  isActive: boolean;
  displayOrder: number;
  orm: string;
}

interface MakerCheckerTask {
  taskId: string;
  ticketTitle: string;
  ticketType: string;
  maker: string;
  amount: number;
  createTime: string;
  status: "WAITING_CHECKER" | "APPROVED" | "REJECTED";
}

interface InventoryProduct {
  id: string;
  sku: string;
  name: string;
  category: string;
  stock: number;
  price: number;
}

export function EnterpriseAdminPortalPage() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [activeTab, setActiveTab] = useState("kiosk");

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // 1. User Management State (JPA / Hibernate)
  const [users, setUsers] = useState<UserItem[]>([
    { id: 1, email: "admin@sportsbooking.com", fullName: "System Administrator", phone: "0901234567", roles: ["ROLE_ADMIN", "ROLE_CHECKER"], isActive: true, orm: "JPA / Hibernate" },
    { id: 2, email: "partner.danang@sportsbooking.com", fullName: "San Bong Da Da Nang", phone: "0912345678", roles: ["ROLE_PARTNER"], isActive: true, orm: "JPA / Hibernate" },
    { id: 3, email: "cashier01@sportsbooking.com", fullName: "Nguyen Thu Ngan (Kiosk POS)", phone: "0923456789", roles: ["ROLE_CASHIER"], isActive: true, orm: "JPA / Hibernate" },
    { id: 4, email: "customer.long@gmail.com", fullName: "Tran Hoang Long", phone: "0934567890", roles: ["ROLE_CUSTOMER"], isActive: true, orm: "JPA / Hibernate" },
  ]);
  const [isUserModalVisible, setIsUserModalVisible] = useState(false);
  const [userForm] = Form.useForm();

  // 2. Category Management State (MyBatis Dynamic SQL)
  const [categories, setCategories] = useState<CategoryItem[]>([
    { id: 1, name: "Bóng Đá Sân 7", slug: "bong-da-san-7", icon: "sports_soccer", description: "Sân cỏ nhân tạo tiêu chuẩn FIFA", isActive: true, displayOrder: 1, orm: "MyBatis" },
    { id: 2, name: "Cầu Lông Thảm Đấu", slug: "cau-long-tham-dau", icon: "sports_tennis", description: "Thảm cầu lông Yonex giảm chấn", isActive: true, displayOrder: 2, orm: "MyBatis" },
    { id: 3, name: "Pickleball Ngoài Trời", slug: "pickleball-ngoai-troi", icon: "sports_cricket", description: "Sân sơn đệm cao su chuyên nghiệp", isActive: true, displayOrder: 3, orm: "MyBatis" },
    { id: 4, name: "Tennis Đất Nện & Cứng", slug: "tennis-dat-nen", icon: "sports_baseball", description: "Sân tennis tiêu chuẩn giải Grand Slam", isActive: false, displayOrder: 4, orm: "MyBatis" },
  ]);
  const [isCategoryModalVisible, setIsCategoryModalVisible] = useState(false);
  const [categoryForm] = Form.useForm();
  const [categorySearch, setCategorySearch] = useState("");

  // 3. Camunda BPMN Maker-Checker Tasks State
  const [tasks, setTasks] = useState<MakerCheckerTask[]>([
    { taskId: "TASK-101", ticketTitle: "Yêu cầu rút tiền doanh thu ví", ticketType: "WITHDRAWAL_REQUEST", maker: "partner.danang@sportsbooking.com", amount: 15500000, createTime: "10 phút trước", status: "WAITING_CHECKER" },
    { taskId: "TASK-102", ticketTitle: "Đăng ký cụm sân Pickleball mới", ticketType: "COURT_REGISTRATION", maker: "pickleball.club@gmail.com", amount: 0, createTime: "25 phút trước", status: "WAITING_CHECKER" },
    { taskId: "TASK-103", ticketTitle: "Đơn hoàn tiền do hủy lịch sân mưa", ticketType: "REFUND_REQUEST", maker: "customer.long@gmail.com", amount: 350000, createTime: "1 giờ trước", status: "APPROVED" },
  ]);
  const [selectedTask, setSelectedTask] = useState<MakerCheckerTask | null>(null);
  const [reviewModalVisible, setReviewModalVisible] = useState(false);
  const [reviewNote, setReviewNote] = useState("");

  // 4. Shopping & Purchasing State (Inventory)
  const [products] = useState<InventoryProduct[]>([
    { id: "1", sku: "SKU-BB01", name: "Bóng đá FIFA Pro Star", category: "Bóng Đá", stock: 24, price: 450000 },
    { id: "2", sku: "SKU-VR02", name: "Vợt cầu lông Yonex Nanoflare", category: "Cầu Lông", stock: 12, price: 850000 },
    { id: "3", sku: "SKU-PB03", name: "Bóng Pickleball Dura 40", category: "Pickleball", stock: 150, price: 65000 },
    { id: "4", sku: "SKU-NK04", name: "Nước Pocari Sweat 500ml", category: "Giải Khát", stock: 320, price: 20000 },
  ]);

  // 5. Handlers
  const handleCreateUser = (values: any) => {
    const newUser: UserItem = {
      id: Date.now(),
      email: values.email,
      fullName: values.fullName,
      phone: values.phone || "N/A",
      roles: [values.role || "ROLE_CUSTOMER"],
      isActive: true,
      orm: "JPA / Hibernate",
    };
    setUsers([newUser, ...users]);
    message.success("Tạo người dùng thành công bằng Spring Data JPA & Hibernate!");
    setIsUserModalVisible(false);
    userForm.resetFields();
  };

  const handleCreateCategory = (values: any) => {
    const newCat: CategoryItem = {
      id: Date.now(),
      name: values.name,
      slug: values.slug || values.name.toLowerCase().replace(/\s+/g, "-"),
      icon: values.icon || "sports",
      description: values.description || "",
      isActive: true,
      displayOrder: values.displayOrder || categories.length + 1,
      orm: "MyBatis Dynamic SQL",
    };
    setCategories([newCat, ...categories]);
    message.success("Thêm danh mục thể thao mới qua MyBatis Mapper!");
    setIsCategoryModalVisible(false);
    categoryForm.resetFields();
  };

  const handleReviewTask = (approved: boolean) => {
    if (!selectedTask) return;
    setTasks(
      tasks.map((t) =>
        t.taskId === selectedTask.taskId
          ? { ...t, status: approved ? "APPROVED" : "REJECTED" }
          : t
      )
    );
    message.success(
      `Đã hoàn thành User Task Camunda BPMN! Quyết định: ${approved ? "PHÊ DUYỆT" : "TỪ CHỐI"
      }. Đã kích hoạt Service Task gửi email tự động.`
    );
    setReviewModalVisible(false);
    setSelectedTask(null);
    setReviewNote("");
  };

  const handleDownloadJasperPdf = (type: string) => {
    message.loading(`Đang biên dịch file .jrxml và xuất báo cáo JasperReports ${type} dạng PDF...`, 1.5);
    setTimeout(() => {
      // Simulate real download by opening sample PDF API or blob
      window.open("http://localhost:8088/api/reports/booking-invoice/INV-20260928/pdf", "_blank");
      message.success(`Xuất báo cáo JasperReports ${type} PDF thành công!`);
    }, 1500);
  };

  const handleDownloadJasperExcel = () => {
    message.loading("Đang xuất báo cáo kho hàng JasperReports sang định dạng Excel (.xlsx)...", 1.5);
    setTimeout(() => {
      window.open("http://localhost:8088/api/reports/inventory/excel", "_blank");
      message.success("Đã xuất file Excel qua Apache POI thành công!");
    }, 1500);
  };

  // User Table Columns
  const userColumns: ColumnsType<UserItem> = [
    { title: "ID", dataIndex: "id", key: "id", width: 70 },
    { title: "Họ và tên", dataIndex: "fullName", key: "fullName", render: (text) => <strong>{text}</strong> },
    { title: "Email", dataIndex: "email", key: "email" },
    { title: "Số điện thoại", dataIndex: "phone", key: "phone" },
    {
      title: "Vai trò (Keycloak RBAC)",
      dataIndex: "roles",
      key: "roles",
      render: (roles: string[]) => (
        <>
          {roles.map((r) => (
            <Tag color={r.includes("ADMIN") ? "red" : r.includes("CHECKER") ? "purple" : r.includes("PARTNER") ? "blue" : "green"} key={r}>
              {r}
            </Tag>
          ))}
        </>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "isActive",
      key: "isActive",
      render: (active: boolean) => (
        <Tag color={active ? "success" : "default"}>{active ? "Đang hoạt động" : "Đã khóa"}</Tag>
      ),
    },
    {
      title: "ORM Engine",
      dataIndex: "orm",
      key: "orm",
      render: (orm: string) => <Tag color="geekblue">{orm}</Tag>,
    },
  ];

  // Category Table Columns
  const categoryColumns: ColumnsType<CategoryItem> = [
    { title: "ID", dataIndex: "id", key: "id", width: 70 },
    { title: "Tên Danh Mục", dataIndex: "name", key: "name", render: (t) => <strong>{t}</strong> },
    { title: "Slug", dataIndex: "slug", key: "slug", render: (s) => <code>{s}</code> },
    { title: "Mô tả", dataIndex: "description", key: "description" },
    { title: "Thứ tự", dataIndex: "displayOrder", key: "displayOrder", width: 90 },
    {
      title: "Kích hoạt",
      dataIndex: "isActive",
      key: "isActive",
      render: (active: boolean) => <Tag color={active ? "green" : "volcano"}>{active ? "Hiển thị" : "Ẩn"}</Tag>,
    },
    {
      title: "ORM Engine",
      dataIndex: "orm",
      key: "orm",
      render: (orm: string) => <Tag color="purple">{orm}</Tag>,
    },
  ];

  return (
    <div className="enterprise-admin-container">
      {/* 1. Header with System Badges */}
      <header className="portal-header d-flex justify-content-between align-items-center">
        <div className="brand-title">
          <SecurityIcon fontSize="large" style={{ color: "#38bdf8" }} />
          <span>SPORTS BOOKING ENTERPRISE ADMIN PORTAL</span>
          <span className="badge-enterprise">Spring Boot 3 + React</span>
        </div>
        <div className="d-flex align-items-center gap-3">
          <Tag color="cyan">Keycloak SSO: Connected</Tag>
          <Tag color="green">Apache Kafka: 3 Topics Active</Tag>
          <Tag color="gold">Redis Cache: Hit Rate 94%</Tag>
          <Button
            type="primary"
            danger
            size="small"
            icon={<LogoutIcon style={{ fontSize: "0.95rem" }} />}
            onClick={handleLogout}
          >
            Đăng xuất
          </Button>
        </div>
      </header>



      {/* 3. Main Tabs Navigation */}
      <div className="portal-content">
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          type="card"
          items={[
            // Tab 1: KIOSK & BOOKING POS
            {
              key: "kiosk",
              label: (
                <span>
                  <PointOfSaleIcon fontSize="small" className="me-1" />
                  Kiosk & Booking POS
                </span>
              ),
              children: (
                <div>
                  <Row gutter={[16, 16]} className="mb-4">
                    <Col span={6}>
                      <Card className="shadow-sm">
                        <Statistic title="Khách Đã Check-in Hôm Nay" value={142} valueStyle={{ color: "#059669" }} prefix={<CheckCircleIcon />} />
                      </Card>
                    </Col>
                    <Col span={6}>
                      <Card className="shadow-sm">
                        <Statistic title="Booking Chờ Thanh Toán Quầy" value={7} valueStyle={{ color: "#d97706" }} />
                      </Card>
                    </Col>
                    <Col span={6}>
                      <Card className="shadow-sm">
                        <Statistic title="Doanh Thu Kiosk Ca Trực" value="8,450,000" suffix="VND" valueStyle={{ color: "#2563eb" }} />
                      </Card>
                    </Col>
                    <Col span={6}>
                      <Card className="shadow-sm">
                        <Statistic title="Tỷ Lệ Lấp Đầy Sân Giờ Vàng" value="92.5%" valueStyle={{ color: "#7c3aed" }} />
                      </Card>
                    </Col>
                  </Row>

                  <Card title="Quầy Check-in Kiosk & Đặt Sân Nhanh Tại Điểm" className="admin-card">
                    <div className="row g-3">
                      <div className="col-md-4">
                        <div className="border rounded p-3 bg-white h-100">
                          <h6 className="fw-bold mb-3">Check-in Mã QR / SĐT Khách Hàng</h6>
                          <Input.Search
                            placeholder="Nhập mã đặt sân hoặc SĐT khách..."
                            enterButton="Tra cứu"
                            size="large"
                            onSearch={(val) => message.success(`Đã tìm thấy đặt chỗ: ${val || "BK-8899"} - Sân bóng mini #1!`)}
                          />
                          <div className="mt-3 p-2 bg-light rounded text-muted small">
                            Hỗ trợ quét mã Barcode/QR từ thẻ thành viên hoặc ứng dụng điện thoại.
                          </div>
                        </div>
                      </div>

                      <div className="col-md-8">
                        <div className="border rounded p-3 bg-white h-100">
                          <div className="d-flex justify-content-between align-items-center mb-3">
                            <h6 className="fw-bold m-0">In Hóa Đơn & Biên Lai Kiosk (JasperReports)</h6>
                            <Button
                              type="primary"
                              icon={<PictureAsPdfIcon fontSize="small" className="me-1" />}
                              onClick={() => handleDownloadJasperPdf("Hóa Đơn Kiosk")}
                            >
                              In Hóa Đơn PDF (JasperReports)
                            </Button>
                          </div>
                          <div className="alert alert-info py-2 small">
                            Mẫu hóa đơn được biên dịch trực tiếp từ template <code>booking_invoice.jrxml</code>, tính toán tự động tiền sân, dịch vụ thuê vợt, nước khoáng và khấu trừ voucher.
                          </div>
                          <table className="table table-sm table-bordered">
                            <thead className="table-light">
                              <tr>
                                <th>Khoản mục</th>
                                <th>SL</th>
                                <th>Đơn giá</th>
                                <th>Thành tiền</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr>
                                <td>Tiền thuê sân bóng đá (2 giờ)</td>
                                <td>1</td>
                                <td>600,000 VND</td>
                                <td>600,000 VND</td>
                              </tr>
                              <tr>
                                <td>Thuê áo bib tập luyện (bộ)</td>
                                <td>2</td>
                                <td>25,000 VND</td>
                                <td>50,000 VND</td>
                              </tr>
                              <tr>
                                <td>Nước khoáng Pocari Sweat</td>
                                <td>5</td>
                                <td>20,000 VND</td>
                                <td>100,000 VND</td>
                              </tr>
                              <tr className="fw-bold table-warning">
                                <td colSpan={3}>Tổng thanh toán POS</td>
                                <td>750,000 VND</td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  </Card>
                </div>
              ),
            },

            // Tab 2: USER MANAGEMENT (JPA / HIBERNATE)
            {
              key: "users",
              label: (
                <span>
                  <PeopleIcon fontSize="small" className="me-1" />
                  User Management (JPA)
                </span>
              ),
              children: (
                <Card
                  title="Quản Lý Người Dùng & Phân Quyền (Spring Data JPA & Hibernate)"
                  extra={
                    <Button type="primary" onClick={() => setIsUserModalVisible(true)}>
                      + Thêm Người Dùng Mới
                    </Button>
                  }
                  className="admin-card"
                >
                  <p className="text-muted small">
                    Được quản lý thông qua thực thể <code>@Entity User</code> và <code>Role</code>, mã hóa mật khẩu qua <strong>BCrypt / Keycloak PBKDF2</strong>, kiểm soát Transactional chuẩn mực.
                  </p>
                  <Table dataSource={users} columns={userColumns} rowKey="id" pagination={{ pageSize: 5 }} />
                </Card>
              ),
            },

            // Tab 3: CATEGORY MANAGEMENT (MYBATIS)
            {
              key: "categories",
              label: (
                <span>
                  <CategoryIcon fontSize="small" className="me-1" />
                  Category Management (MyBatis)
                </span>
              ),
              children: (
                <Card
                  title="Quản Lý Danh Mục Môn Thể Thao (MyBatis Dynamic SQL)"
                  extra={
                    <Space>
                      <Input.Search
                        placeholder="Tìm kiếm danh mục..."
                        allowClear
                        onSearch={(val) => setCategorySearch(val)}
                        style={{ width: 220 }}
                      />
                      <Button type="primary" onClick={() => setIsCategoryModalVisible(true)}>
                        + Thêm Danh Mục
                      </Button>
                    </Space>
                  }
                  className="admin-card"
                >
                  <div className="alert alert-secondary py-2 small mb-3">
                    Sử dụng <strong>MyBatis XML Mapper</strong> với dynamic tags: <code>&lt;where&gt;</code>, <code>&lt;if&gt;</code>, <code>&lt;choose&gt;</code> và tích hợp <strong>Redis Cache-Aside Pattern</strong> để tối ưu tốc độ đọc dưới 5ms.
                  </div>
                  <Table
                    dataSource={categories.filter((c) => c.name.toLowerCase().includes(categorySearch.toLowerCase()))}
                    columns={categoryColumns}
                    rowKey="id"
                    pagination={{ pageSize: 5 }}
                  />
                </Card>
              ),
            },

            // Tab 4: CAMUNDA BPMN MAKER - CHECKER
            {
              key: "camunda",
              label: (
                <span>
                  <AssignmentTurnedInIcon fontSize="small" className="me-1" />
                  Maker - Checker (Camunda BPMN)
                </span>
              ),
              children: (
                <Card title="Quy Trình Phê Duyệt Ticket (Camunda BPMN Maker - Checker Pattern)" className="admin-card">
                  <div className="alert alert-primary py-2 small mb-3">
                    <strong>Quy trình BPMN:</strong> Maker (Partner/User) gửi yêu cầu $\rightarrow$ Camunda khởi tạo Process Instance $\rightarrow$ Tạo <code>User Task</code> cho Checker (Admin) $\rightarrow$ Exclusive Gateway duyệt/từ chối $\rightarrow$ Service Task gửi Email tự động.
                  </div>

                  <Table
                    dataSource={tasks}
                    rowKey="taskId"
                    columns={[
                      { title: "Task ID", dataIndex: "taskId", key: "taskId", render: (id) => <Tag color="blue">{id}</Tag> },
                      { title: "Tiêu đề yêu cầu", dataIndex: "ticketTitle", key: "ticketTitle", render: (t) => <strong>{t}</strong> },
                      { title: "Loại Ticket", dataIndex: "ticketType", key: "ticketType", render: (type) => <Tag color="geekblue">{type}</Tag> },
                      { title: "Người tạo (Maker)", dataIndex: "maker", key: "maker" },
                      {
                        title: "Số tiền / Quy mô",
                        dataIndex: "amount",
                        key: "amount",
                        render: (amt: number) => (amt > 0 ? `${amt.toLocaleString()} VND` : "N/A"),
                      },
                      { title: "Thời gian gửi", dataIndex: "createTime", key: "createTime" },
                      {
                        title: "Trạng thái",
                        dataIndex: "status",
                        key: "status",
                        render: (st: string) => (
                          <Tag color={st === "WAITING_CHECKER" ? "warning" : st === "APPROVED" ? "success" : "error"}>
                            {st === "WAITING_CHECKER" ? "Chờ Checker Duyệt" : st === "APPROVED" ? "Đã Phê Duyệt" : "Đã Từ Chối"}
                          </Tag>
                        ),
                      },
                      {
                        title: "Thao tác Checker",
                        key: "action",
                        render: (_, record) =>
                          record.status === "WAITING_CHECKER" ? (
                            <Button
                              type="primary"
                              size="small"
                              onClick={() => {
                                setSelectedTask(record);
                                setReviewModalVisible(true);
                              }}
                            >
                              Xem & Phê Duyệt
                            </Button>
                          ) : (
                            <span className="text-muted small">Đã hoàn thành</span>
                          ),
                      },
                    ]}
                  />
                </Card>
              ),
            },

            // Tab 5: SHOPPING & PURCHASING (INVENTORY)
            {
              key: "shopping",
              label: (
                <span>
                  <ShoppingCartIcon fontSize="small" className="me-1" />
                  Shopping & Purchasing
                </span>
              ),
              children: (
                <Card
                  title="Quản Lý Kho Hàng & Nhập Hàng Vật Tư (Purchasing)"
                  extra={
                    <Button type="primary" icon={<TableViewIcon fontSize="small" className="me-1" />} onClick={handleDownloadJasperExcel}>
                      Xuất Báo Cáo Kho (JasperReports Excel)
                    </Button>
                  }
                  className="admin-card"
                >
                  <p className="text-muted small">
                    Quản lý các mặt hàng bán kèm (nước uống, bóng thi đấu) và dụng cụ cho thuê (vợt cầu lông, áo đấu). Xuất phiếu nhập/xuất kho bằng JasperReports Excel qua Apache POI.
                  </p>
                  <Table
                    dataSource={products}
                    rowKey="id"
                    columns={[
                      { title: "Mã SKU", dataIndex: "sku", key: "sku", render: (sku) => <code>{sku}</code> },
                      { title: "Tên Sản Phẩm", dataIndex: "name", key: "name", render: (n) => <strong>{n}</strong> },
                      { title: "Ngành Hàng", dataIndex: "category", key: "category" },
                      {
                        title: "Số Lượng Tồn",
                        dataIndex: "stock",
                        key: "stock",
                        render: (stk: number) => <Tag color={stk < 20 ? "volcano" : "green"}>{stk} đơn vị</Tag>,
                      },
                      {
                        title: "Giá Bán Lẻ",
                        dataIndex: "price",
                        key: "price",
                        render: (p: number) => `${p.toLocaleString()} VND`,
                      },
                    ]}
                  />
                </Card>
              ),
            },

            // Tab 6: REPORTS & JASPER IMPORT / EXPORT
            {
              key: "reports",
              label: (
                <span>
                  <PictureAsPdfIcon fontSize="small" className="me-1" />
                  Jasper Reports & Excel
                </span>
              ),
              children: (
                <Card title="Trung Tâm Xuất Báo Cáo JasperReports & Nhập Liệu Excel" className="admin-card">
                  <Row gutter={[24, 24]}>
                    <Col span={12}>
                      <div className="border rounded p-4 h-100 bg-white shadow-sm">
                        <h6 className="fw-bold mb-3 d-flex align-items-center">
                          <PictureAsPdfIcon className="text-danger me-2" />
                          Xuất Báo Cáo Hóa Đơn & Tài Chính (JasperReports Engine)
                        </h6>
                        <p className="text-muted small">
                          Biên dịch file template <code>.jrxml</code> cấu trúc chuẩn: Header, Detail, Summary, mã QR, Subtotals và Watermark.
                        </p>
                        <Space direction="vertical" style={{ width: "100%" }}>
                          <Button block onClick={() => handleDownloadJasperPdf("Hóa Đơn Booking")}>
                            Xuất Hóa Đơn Đặt Sân (PDF)
                          </Button>
                          <Button block onClick={handleDownloadJasperExcel}>
                            Xuất Báo Cáo Doanh Thu Tháng (Excel XLSX)
                          </Button>
                        </Space>
                      </div>
                    </Col>

                    <Col span={12}>
                      <div className="border rounded p-4 h-100 bg-white shadow-sm">
                        <h6 className="fw-bold mb-3 d-flex align-items-center">
                          <CloudUploadIcon className="text-primary me-2" />
                          Nhập Dữ Liệu Hàng Loạt từ Excel (Apache POI)
                        </h6>
                        <p className="text-muted small">
                          Upload file <code>.xlsx</code> chứa danh sách danh mục sân hoặc sản phẩm kho để hệ thống tự động bóc tách và insert batch vào Database bằng MyBatis.
                        </p>
                        <Upload
                          beforeUpload={(file) => {
                            message.success(`Đã đọc và import file ${file.name} thành công qua Apache POI!`);
                            return false;
                          }}
                        >
                          <Button icon={<CloudUploadIcon fontSize="small" className="me-1" />}>Chọn file Excel (.xlsx) để Import</Button>
                        </Upload>
                      </div>
                    </Col>
                  </Row>
                </Card>
              ),
            },

            // Tab 7: TRAINING & LEARNING
            {
              key: "learning",
              label: (
                <span>
                  <SchoolIcon fontSize="small" className="me-1" />
                  Training & Learning
                </span>
              ),
              children: (
                <Card title="Hệ Thống Đào Tạo & Khảo Sát Quy Trình Nhân Viên Sân (LMS)" className="admin-card">
                  <div className="alert alert-success py-2 small mb-4">
                    <strong>Cổng đào tạo nội bộ (Enterprise LMS):</strong> Giúp đào tạo nhân viên quầy Kiosk POS, đối tác sân thể thao, và quản trị viên thẩm định quy trình phê duyệt Maker - Checker Camunda BPMN.
                  </div>
                  <Row gutter={[16, 16]}>
                    {[
                      {
                        title: "1. Vận hành Quầy Thu Ngân & Kiosk Check-in POS",
                        role: "Dành cho Thu ngân (ROLE_CASHIER)",
                        duration: "45 phút",
                        lessons: "5 bài học",
                        progress: "100%",
                        status: "Đã hoàn thành",
                        desc: "Quy trình quét mã QR đặt sân từ mobile, in hóa đơn JasperReports, hoàn tiền hủy lịch và thanh toán dịch vụ bán lẻ.",
                      },
                      {
                        title: "2. Thẩm định Ticket & Nguyên tắc 4 Mắt (Camunda BPMN)",
                        role: "Dành cho Thẩm định viên (ROLE_CHECKER / ADMIN)",
                        duration: "60 phút",
                        lessons: "8 bài học",
                        progress: "75%",
                        status: "Đang học",
                        desc: "Hiểu quy trình BPMN, kiểm tra số dư ví đối tác, đối soát vé rút tiền, phân quyền nhiệm vụ và kích hoạt thông báo tự động.",
                      },
                      {
                        title: "3. Quản lý Danh mục Sân Thể thao (MyBatis Mapper)",
                        role: "Dành cho Quản trị viên (ROLE_ADMIN)",
                        duration: "30 phút",
                        lessons: "4 bài học",
                        progress: "100%",
                        status: "Đã hoàn thành",
                        desc: "Thao tác thêm, cập nhật danh mục loại sân (Bóng đá, Cầu lông, Pickleball, Tennis), cơ chế xóa hàng loạt và bộ nhớ đệm Redis.",
                      },
                      {
                        title: "4. An toàn Thông tin & Quản trị Danh tính Keycloak SSO",
                        role: "Dành cho Kỹ sư hệ thống (DevOps / SecOps)",
                        duration: "90 phút",
                        lessons: "10 bài học",
                        progress: "40%",
                        status: "Đang học",
                        desc: "Mã hóa mật khẩu BCrypt/PBKDF2, luồng cấp phát JWT Token, kiểm soát phiên đăng nhập (Session/LocalStorage) và thu hồi quyền.",
                      },
                    ].map((course, idx) => (
                      <Col span={12} key={idx}>
                        <div className="border rounded p-3 bg-white h-100 shadow-sm d-flex flex-column justify-content-between">
                          <div>
                            <div className="d-flex justify-content-between align-items-center mb-2">
                              <Tag color={course.status === "Đã hoàn thành" ? "green" : "blue"}>{course.status}</Tag>
                              <span className="text-muted small">{course.duration} • {course.lessons}</span>
                            </div>
                            <h6 className="fw-bold mb-1">{course.title}</h6>
                            <p className="text-primary small mb-2">{course.role}</p>
                            <p className="text-muted small">{course.desc}</p>
                          </div>
                          <div className="mt-3 pt-2 border-top d-flex justify-content-between align-items-center">
                            <span className="small text-muted">Tiến độ: <strong>{course.progress}</strong></span>
                            <Button size="small" type="primary" onClick={() => message.info(`Đang mở bài giảng: ${course.title}`)}>
                              {course.status === "Đã hoàn thành" ? "Xem lại bài giảng" : "Tiếp tục học"}
                            </Button>
                          </div>
                        </div>
                      </Col>
                    ))}
                  </Row>
                </Card>
              ),
            },
          ]}
        />
      </div>

      {/* Modal: Create User (JPA) */}
      <Modal
        title="Thêm Người Dùng Mới (Spring Data JPA)"
        open={isUserModalVisible}
        onCancel={() => setIsUserModalVisible(false)}
        onOk={() => userForm.submit()}
      >
        <Form form={userForm} layout="vertical" onFinish={handleCreateUser}>
          <Form.Item name="fullName" label="Họ và tên" rules={[{ required: true, message: "Vui lòng nhập họ tên" }]}>
            <Input placeholder="Nguyen Van A" />
          </Form.Item>
          <Form.Item name="email" label="Email" rules={[{ required: true, type: "email", message: "Email không hợp lệ" }]}>
            <Input placeholder="user@example.com" />
          </Form.Item>
          <Form.Item name="phone" label="Số điện thoại">
            <Input placeholder="0901234567" />
          </Form.Item>
          <Form.Item name="role" label="Phân quyền (Keycloak Role)" initialValue="ROLE_CUSTOMER">
            <Select
              options={[
                { label: "Khách Hàng (ROLE_CUSTOMER)", value: "ROLE_CUSTOMER" },
                { label: "Chủ Sân Đối Tác (ROLE_PARTNER)", value: "ROLE_PARTNER" },
                { label: "Thu Ngân Quầy (ROLE_CASHIER)", value: "ROLE_CASHIER" },
                { label: "Quản Trị Viên (ROLE_ADMIN)", value: "ROLE_ADMIN" },
              ]}
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal: Create Category (MyBatis) */}
      <Modal
        title="Thêm Danh Mục Môn Thể Thao (MyBatis Mapper)"
        open={isCategoryModalVisible}
        onCancel={() => setIsCategoryModalVisible(false)}
        onOk={() => categoryForm.submit()}
      >
        <Form form={categoryForm} layout="vertical" onFinish={handleCreateCategory}>
          <Form.Item name="name" label="Tên Danh Mục" rules={[{ required: true, message: "Vui lòng nhập tên môn" }]}>
            <Input placeholder="Bóng Bàn Chuyên Nghiệp" />
          </Form.Item>
          <Form.Item name="description" label="Mô Tả">
            <Input.TextArea placeholder="Mô tả loại sân và quy cách thi đấu..." />
          </Form.Item>
          <Form.Item name="displayOrder" label="Thứ tự hiển thị" initialValue={1}>
            <Input type="number" />
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal: Camunda Checker Review */}
      <Modal
        title="Checker Phê Duyệt Ticket (Camunda BPMN)"
        open={reviewModalVisible}
        onCancel={() => setReviewModalVisible(false)}
        footer={[
          <Button key="reject" danger onClick={() => handleReviewTask(false)}>
            Từ Chối (Reject)
          </Button>,
          <Button key="approve" type="primary" onClick={() => handleReviewTask(true)}>
            Phê Duyệt (Approve)
          </Button>,
        ]}
      >
        {selectedTask && (
          <div>
            <p><strong>Mã Task:</strong> {selectedTask.taskId}</p>
            <p><strong>Yêu cầu:</strong> {selectedTask.ticketTitle}</p>
            <p><strong>Người gửi (Maker):</strong> {selectedTask.maker}</p>
            {selectedTask.amount > 0 && (
              <p><strong>Số tiền:</strong> {selectedTask.amount.toLocaleString()} VND</p>
            )}
            <Form.Item label="Ghi chú thẩm định của Checker">
              <Input.TextArea
                value={reviewNote}
                onChange={(e) => setReviewNote(e.target.value)}
                placeholder="Nhập lý do phê duyệt hoặc lý do từ chối..."
              />
            </Form.Item>
            <p className="text-muted small">
              Khi hoàn thành task, Camunda sẽ kích hoạt <strong>SendEmailNotificationDelegate</strong> để gửi email thông báo kết quả cho Maker.
            </p>
          </div>
        )}
      </Modal>
    </div>
  );
}
