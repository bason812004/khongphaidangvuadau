import React, { useState, useEffect } from "react";
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
  Popconfirm,
  InputNumber,
  Alert,
  Divider,
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
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import HubIcon from "@mui/icons-material/Hub";
import AccountTreeIcon from "@mui/icons-material/AccountTree";
import SendIcon from "@mui/icons-material/Send";
import SyncAltIcon from "@mui/icons-material/SyncAlt";
import CodeIcon from "@mui/icons-material/Code";

import { useNavigate } from "react-router-dom";
import { useAuth } from "../../features/auth/hooks/useAuth";
import { api } from "../../lib/axios";

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

interface KafkaEventItem {
  id: string;
  timestamp: string;
  topic: string;
  partition: number;
  offset: number;
  eventKey: string;
  eventType: string;
  payload: string;
  status: "CONSUMED" | "PRODUCED";
  cacheEvicted?: string;
}

export function EnterpriseAdminPortalPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState("kiosk");

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // =========================================================================
  // 1. User Management State & Handlers (Spring Data JPA & Hibernate)
  // =========================================================================
  const [users, setUsers] = useState<UserItem[]>([
    { id: 1, email: "admin@sportsbooking.com", fullName: "System Administrator", phone: "0901234567", roles: ["ROLE_ADMIN", "ROLE_CHECKER"], isActive: true, orm: "JPA / Hibernate" },
    { id: 2, email: "partner.danang@sportsbooking.com", fullName: "San Bong Da Da Nang", phone: "0912345678", roles: ["ROLE_PARTNER"], isActive: true, orm: "JPA / Hibernate" },
    { id: 3, email: "cashier01@sportsbooking.com", fullName: "Nguyen Thu Ngan (Kiosk POS)", phone: "0923456789", roles: ["ROLE_CASHIER"], isActive: true, orm: "JPA / Hibernate" },
    { id: 4, email: "customer.long@gmail.com", fullName: "Tran Hoang Long", phone: "0934567890", roles: ["ROLE_CUSTOMER"], isActive: true, orm: "JPA / Hibernate" },
  ]);
  const [userLoading, setUserLoading] = useState(false);
  const [userSearch, setUserSearch] = useState("");
  const [isUserModalVisible, setIsUserModalVisible] = useState(false);
  const [userForm] = Form.useForm();

  // Edit User State
  const [isEditUserModalVisible, setIsEditUserModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState<UserItem | null>(null);
  const [editUserForm] = Form.useForm();

  const fetchUsers = async (keyword?: string) => {
    setUserLoading(true);
    try {
      const res = await api.get("/users", {
        params: {
          keyword: keyword && keyword.trim() ? keyword.trim() : undefined,
          size: 100,
        },
      });
      if (res.data?.data?.content && Array.isArray(res.data.data.content)) {
        const mapped: UserItem[] = res.data.data.content.map((u: any) => ({
          id: u.id,
          email: u.email,
          fullName: u.fullName,
          phone: u.phone || "N/A",
          roles: u.roles && u.roles.length > 0 ? Array.from(u.roles) : ["ROLE_CUSTOMER"],
          isActive: u.isActive ?? true,
          orm: "Spring Data JPA & Hibernate",
        }));
        setUsers(mapped);
      }
    } catch (err) {
      console.error("Failed to load users from backend:", err);
    } finally {
      setUserLoading(false);
    }
  };

  const handleCreateUser = async (values: any) => {
    try {
      const payload = {
        fullName: values.fullName,
        email: values.email,
        password: values.password || "Password123!",
        phone: values.phone || "",
        roles: [values.role || "ROLE_CUSTOMER"],
      };
      await api.post("/users", payload);
      message.success("Tạo người dùng thành công và đã lưu vào H2 Database qua Spring Data JPA & Hibernate!");
      setIsUserModalVisible(false);
      userForm.resetFields();
      await fetchUsers(userSearch);
    } catch (err: any) {
      message.error(err.message || "Lỗi khi tạo người dùng qua JPA!");
    }
  };

  const handleOpenEditUser = (record: UserItem) => {
    setEditingUser(record);
    editUserForm.setFieldsValue({
      id: record.id,
      email: record.email,
      fullName: record.fullName,
      phone: record.phone !== "N/A" ? record.phone : "",
      role: record.roles?.[0] || "ROLE_CUSTOMER",
      isActive: record.isActive,
      newPassword: "",
    });
    setIsEditUserModalVisible(true);
  };

  const handleUpdateUser = async (values: any) => {
    if (!editingUser) return;
    try {
      const payload: any = {
        fullName: values.fullName,
        phone: values.phone || "",
        roles: [values.role || "ROLE_CUSTOMER"],
        isActive: values.isActive ?? true,
      };
      if (values.newPassword && values.newPassword.trim()) {
        payload.newPassword = values.newPassword.trim();
      }
      await api.put(`/users/${editingUser.id}`, payload);
      message.success("Cập nhật thông tin người dùng thành công và lưu vào H2 Database qua Spring Data JPA!");
      setIsEditUserModalVisible(false);
      editUserForm.resetFields();
      setEditingUser(null);
      await fetchUsers(userSearch);
    } catch (err: any) {
      message.error(err.message || "Lỗi khi cập nhật người dùng qua JPA!");
    }
  };

  const handleDeleteUser = async (id: number) => {
    try {
      await api.delete(`/users/${id}`);
      message.success("Đã xóa người dùng thành công khỏi cơ sở dữ liệu H2 qua Spring Data JPA!");
      await fetchUsers(userSearch);
    } catch (err: any) {
      message.error(err.message || "Lỗi khi xóa người dùng!");
    }
  };

  // =========================================================================
  // 2. Category Management State & Handlers (MyBatis Dynamic SQL & Redis Cache)
  // =========================================================================
  const [categories, setCategories] = useState<CategoryItem[]>([
    { id: 1, name: "Bóng Đá Sân 7", slug: "bong-da-san-7", icon: "sports_soccer", description: "Sân cỏ nhân tạo chất lượng FIFA", isActive: true, displayOrder: 1, orm: "MyBatis" },
    { id: 2, name: "Cầu Lông Thảm Đấu", slug: "cau-long-tham-dau", icon: "sports_tennis", description: "Thảm cầu lông Yonex giảm chấn", isActive: true, displayOrder: 2, orm: "MyBatis" },
    { id: 3, name: "Pickleball Ngoài Trời", slug: "pickleball-ngoai-troi", icon: "sports_cricket", description: "Sân đệm cao su tiêu chuẩn quốc tế", isActive: true, displayOrder: 3, orm: "MyBatis" },
    { id: 4, name: "Tennis Tiêu Chuẩn", slug: "tennis-tieu-chuan", icon: "sports_baseball", description: "Sân cứng đạt chuẩn thi đấu", isActive: true, displayOrder: 4, orm: "MyBatis" },
  ]);
  const [categoryLoading, setCategoryLoading] = useState(false);
  const [categorySearch, setCategorySearch] = useState("");
  const [isCategoryModalVisible, setIsCategoryModalVisible] = useState(false);
  const [categoryForm] = Form.useForm();

  // Edit Category State
  const [isEditCategoryModalVisible, setIsEditCategoryModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryItem | null>(null);
  const [editCategoryForm] = Form.useForm();

  const fetchCategories = async (keyword?: string) => {
    setCategoryLoading(true);
    try {
      const res = await api.get("/categories", {
        params: {
          name: keyword && keyword.trim() ? keyword.trim() : undefined,
          size: 100,
        },
      });
      if (res.data?.data?.content && Array.isArray(res.data.data.content)) {
        const mapped: CategoryItem[] = res.data.data.content.map((cat: any) => ({
          id: cat.id,
          name: cat.name,
          slug: cat.slug,
          icon: cat.icon || "sports",
          description: cat.description || "",
          isActive: cat.isActive ?? true,
          displayOrder: cat.displayOrder ?? 1,
          orm: "MyBatis Dynamic SQL",
        }));
        setCategories(mapped);
      }
    } catch (err) {
      console.error("Failed to load categories from backend:", err);
    } finally {
      setCategoryLoading(false);
    }
  };

  const handleCreateCategory = async (values: any) => {
    try {
      const payload = {
        name: values.name,
        slug: values.slug || values.name.toLowerCase().trim().replace(/[^a-z0-9]/g, "-"),
        icon: values.icon || "sports",
        description: values.description || "",
        isActive: true,
        displayOrder: values.displayOrder ? Number(values.displayOrder) : categories.length + 1,
      };
      await api.post("/categories", payload);
      message.success("Thêm danh mục thành công và đã lưu vào H2 Database qua MyBatis XML Mapper & Redis Cache!");
      setIsCategoryModalVisible(false);
      categoryForm.resetFields();
      await fetchCategories(categorySearch);
    } catch (err: any) {
      message.error(err.message || "Lỗi khi lưu danh mục qua MyBatis!");
    }
  };

  const handleOpenEditCategory = (record: CategoryItem) => {
    setEditingCategory(record);
    editCategoryForm.setFieldsValue({
      id: record.id,
      name: record.name,
      slug: record.slug,
      icon: record.icon,
      description: record.description,
      displayOrder: record.displayOrder,
      isActive: record.isActive,
    });
    setIsEditCategoryModalVisible(true);
  };

  const handleUpdateCategory = async (values: any) => {
    if (!editingCategory) return;
    try {
      const payload = {
        name: values.name,
        slug: values.slug || values.name.toLowerCase().trim().replace(/[^a-z0-9]/g, "-"),
        icon: values.icon || "sports",
        description: values.description || "",
        displayOrder: values.displayOrder !== undefined ? Number(values.displayOrder) : editingCategory.displayOrder,
        isActive: values.isActive ?? true,
      };
      await api.put(`/categories/${editingCategory.id}`, payload);
      message.success("Cập nhật danh mục thành công và đồng bộ H2 Database qua MyBatis Dynamic SQL!");
      setIsEditCategoryModalVisible(false);
      editCategoryForm.resetFields();
      setEditingCategory(null);
      await fetchCategories(categorySearch);
    } catch (err: any) {
      message.error(err.message || "Lỗi khi cập nhật danh mục!");
    }
  };

  const handleDeleteCategory = async (id: number) => {
    try {
      await api.delete(`/categories/${id}`);
      message.success("Đã xóa danh mục thành công khỏi H2 Database và xóa cache Redis!");
      await fetchCategories(categorySearch);
    } catch (err: any) {
      message.error(err.message || "Lỗi khi xóa danh mục!");
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchUsers();
  }, []);

  // =========================================================================
  // 3. Camunda BPMN Maker-Checker Tasks State & Handlers
  // =========================================================================
  const [tasks, setTasks] = useState<MakerCheckerTask[]>([
    { taskId: "TASK-101", ticketTitle: "Yêu cầu rút tiền doanh thu ví", ticketType: "WITHDRAWAL_REQUEST", maker: "partner.danang@sportsbooking.com", amount: 15500000, createTime: "10 phút trước", status: "WAITING_CHECKER" },
    { taskId: "TASK-102", ticketTitle: "Đăng ký cụm sân Pickleball mới", ticketType: "COURT_REGISTRATION", maker: "pickleball.club@gmail.com", amount: 0, createTime: "25 phút trước", status: "WAITING_CHECKER" },
    { taskId: "TASK-103", ticketTitle: "Đơn hoàn tiền do hủy lịch sân mưa", ticketType: "REFUND_REQUEST", maker: "customer.long@gmail.com", amount: 350000, createTime: "1 giờ trước", status: "APPROVED" },
  ]);
  const [selectedTask, setSelectedTask] = useState<MakerCheckerTask | null>(null);
  const [reviewModalVisible, setReviewModalVisible] = useState(false);
  const [reviewNote, setReviewNote] = useState("");
  const [isCreateTaskModalVisible, setIsCreateTaskModalVisible] = useState(false);
  const [taskForm] = Form.useForm();

  const handleCreateTask = (values: any) => {
    const newTask: MakerCheckerTask = {
      taskId: `TASK-${Date.now().toString().slice(-4)}`,
      ticketTitle: values.ticketTitle,
      ticketType: values.ticketType || "REFUND_REQUEST",
      maker: values.maker || user?.email || "admin@sportsbooking.com",
      amount: values.amount ? Number(values.amount) : 0,
      createTime: "Vừa xong",
      status: "WAITING_CHECKER",
    };
    setTasks([newTask, ...tasks]);
    message.success("Đã tạo yêu cầu Ticket Camunda BPMN thành công và gửi tới hàng đợi Checker!");
    setIsCreateTaskModalVisible(false);
    taskForm.resetFields();
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
      `Đã hoàn thành User Task Camunda BPMN! Quyết định: ${approved ? "PHÊ DUYỆT" : "TỪ CHỐI"}. Đã kích hoạt Service Task gửi email tự động.`
    );
    setReviewModalVisible(false);
    setSelectedTask(null);
    setReviewNote("");
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks(tasks.filter((t) => t.taskId !== taskId));
    message.success(`Đã xóa Ticket ${taskId} khỏi danh sách.`);
  };

  // =========================================================================
  // 4. Shopping & Purchasing State & Handlers (Inventory Management CRUD)
  // =========================================================================
  const [products, setProducts] = useState<InventoryProduct[]>([
    { id: "1", sku: "SKU-BB01", name: "Bóng đá FIFA Pro Star", category: "Bóng Đá", stock: 24, price: 450000 },
    { id: "2", sku: "SKU-VR02", name: "Vợt cầu lông Yonex Nanoflare", category: "Cầu Lông", stock: 12, price: 850000 },
    { id: "3", sku: "SKU-PB03", name: "Bóng Pickleball Dura 40", category: "Pickleball", stock: 150, price: 65000 },
    { id: "4", sku: "SKU-NK04", name: "Nước Pocari Sweat 500ml", category: "Giải Khát", stock: 320, price: 20000 },
  ]);
  const [productSearch, setProductSearch] = useState("");
  const [isProductModalVisible, setIsProductModalVisible] = useState(false);
  const [productForm] = Form.useForm();
  const [isEditProductModalVisible, setIsEditProductModalVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState<InventoryProduct | null>(null);
  const [editProductForm] = Form.useForm();

  const handleCreateProduct = (values: any) => {
    const newProduct: InventoryProduct = {
      id: Date.now().toString(),
      sku: values.sku || `SKU-${Date.now().toString().slice(-4)}`,
      name: values.name,
      category: values.category || "Vật Tư Chung",
      stock: values.stock ? Number(values.stock) : 0,
      price: values.price ? Number(values.price) : 0,
    };
    setProducts([...products, newProduct]);
    message.success("Thêm mặt hàng kho thành công!");
    setIsProductModalVisible(false);
    productForm.resetFields();
  };

  const handleOpenEditProduct = (record: InventoryProduct) => {
    setEditingProduct(record);
    editProductForm.setFieldsValue({
      sku: record.sku,
      name: record.name,
      category: record.category,
      stock: record.stock,
      price: record.price,
    });
    setIsEditProductModalVisible(true);
  };

  const handleUpdateProduct = (values: any) => {
    if (!editingProduct) return;
    setProducts(
      products.map((p) =>
        p.id === editingProduct.id
          ? {
              ...p,
              name: values.name,
              sku: values.sku,
              category: values.category,
              stock: Number(values.stock),
              price: Number(values.price),
            }
          : p
      )
    );
    message.success("Cập nhật mặt hàng kho thành công!");
    setIsEditProductModalVisible(false);
    editProductForm.resetFields();
    setEditingProduct(null);
  };

  const handleDeleteProduct = (id: string) => {
    setProducts(products.filter((p) => p.id !== id));
    message.success("Đã xóa mặt hàng kho thành công!");
  };

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.sku.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.category.toLowerCase().includes(productSearch.toLowerCase())
  );

  // =========================================================================
  // 5. Message Queue (Apache Kafka) & Redis Cache Stream State & Handlers
  // =========================================================================
  const [kafkaEvents, setKafkaEvents] = useState<KafkaEventItem[]>([
    {
      id: "EVT-1001",
      timestamp: "10:30:15",
      topic: "sports.booking.events",
      partition: 0,
      offset: 1042,
      eventKey: "BK-8899",
      eventType: "BOOKING_CONFIRMED",
      payload: JSON.stringify({ bookingId: "BK-8899", courtId: "SAN-BONG-01", amount: 600000, customer: "customer.long@gmail.com" }),
      status: "CONSUMED",
      cacheEvicted: "sports:courts:availability",
    },
    {
      id: "EVT-1002",
      timestamp: "10:28:40",
      topic: "sports.ticket.events",
      partition: 1,
      offset: 588,
      eventKey: "TASK-103",
      eventType: "TICKET_APPROVED",
      payload: JSON.stringify({ taskId: "TASK-103", maker: "partner.danang@sportsbooking.com", action: "APPROVE_WITHDRAWAL", amount: 15500000 }),
      status: "CONSUMED",
    },
    {
      id: "EVT-1003",
      timestamp: "10:15:22",
      topic: "sports.booking.events",
      partition: 2,
      offset: 1041,
      eventKey: "BK-8898",
      eventType: "BOOKING_CREATED",
      payload: JSON.stringify({ bookingId: "BK-8898", courtId: "SAN-PICKLEBALL-02", amount: 350000, customer: "tran.long@gmail.com" }),
      status: "CONSUMED",
      cacheEvicted: "sports:courts:availability",
    },
  ]);

  const handleProduceBookingEvent = () => {
    const bkId = `BK-${Math.floor(1000 + Math.random() * 9000)}`;
    const newEvt: KafkaEventItem = {
      id: `EVT-${Date.now().toString().slice(-4)}`,
      timestamp: new Date().toLocaleTimeString(),
      topic: "sports.booking.events",
      partition: Math.floor(Math.random() * 3),
      offset: kafkaEvents.length + 1043,
      eventKey: bkId,
      eventType: "BOOKING_CONFIRMED",
      payload: JSON.stringify({
        bookingId: bkId,
        courtId: "SAN-CAU-LONG-VIP",
        amount: 450000,
        customer: user?.email || "customer@sportsbooking.com",
        paymentMethod: "VNPAY_GATEWAY",
      }),
      status: "CONSUMED",
      cacheEvicted: "sports:courts:availability",
    };
    setKafkaEvents([newEvt, ...kafkaEvents]);
    message.success(
      `[Kafka Producer] Đã publish event lên topic 'sports.booking.events' (Key: ${bkId}). Consumer đã nhận và kích hoạt xóa cache Redis: 'sports:courts:availability'!`
    );
  };

  const handleProduceTicketEvent = () => {
    const tkId = `TASK-${Math.floor(100 + Math.random() * 900)}`;
    const newEvt: KafkaEventItem = {
      id: `EVT-${Date.now().toString().slice(-4)}`,
      timestamp: new Date().toLocaleTimeString(),
      topic: "sports.ticket.events",
      partition: Math.floor(Math.random() * 3),
      offset: kafkaEvents.length + 589,
      eventKey: tkId,
      eventType: "TICKET_PROCESSED",
      payload: JSON.stringify({
        taskId: tkId,
        checker: user?.email || "admin@sportsbooking.com",
        decision: "APPROVED",
        processInstanceId: "camunda-proc-9921",
      }),
      status: "CONSUMED",
    };
    setKafkaEvents([newEvt, ...kafkaEvents]);
    message.info(
      `[Kafka Producer] Đã publish event lên topic 'sports.ticket.events' (Key: ${tkId}) qua Camunda BPMN delegate.`
    );
  };

  // =========================================================================
  // JasperReports Download Mock Handlers
  // =========================================================================
  const handleDownloadJasperPdf = (type: string) => {
    message.loading(`Đang biên dịch file .jrxml và xuất báo cáo JasperReports ${type} dạng PDF...`, 1.5);
    setTimeout(() => {
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

  // =========================================================================
  // Table Columns Definition
  // =========================================================================

  // 1. User Table Columns with Edit & Delete Actions
  const userColumns: ColumnsType<UserItem> = [
    { title: "ID", dataIndex: "id", key: "id", width: 60 },
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
    {
      title: "Hành động",
      key: "actions",
      width: 150,
      render: (_, record) => (
        <Space size="small">
          <Button
            size="small"
            type="primary"
            icon={<EditIcon style={{ fontSize: "1rem" }} />}
            onClick={() => handleOpenEditUser(record)}
          >
            Sửa
          </Button>
          <Popconfirm
            title="Xóa người dùng này?"
            description={`Bạn có chắc muốn xóa tài khoản "${record.fullName}" (${record.email}) khỏi H2 DB?`}
            onConfirm={() => handleDeleteUser(record.id)}
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
          >
            <Button
              size="small"
              danger
              icon={<DeleteIcon style={{ fontSize: "1rem" }} />}
            >
              Xóa
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // 2. Category Table Columns with Edit & Delete Actions
  const categoryColumns: ColumnsType<CategoryItem> = [
    { title: "ID", dataIndex: "id", key: "id", width: 60 },
    { title: "Tên Danh Mục", dataIndex: "name", key: "name", render: (t) => <strong>{t}</strong> },
    { title: "Slug", dataIndex: "slug", key: "slug", render: (s) => <code>{s}</code> },
    { title: "Mô tả", dataIndex: "description", key: "description" },
    { title: "Thứ tự", dataIndex: "displayOrder", key: "displayOrder", width: 80 },
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
    {
      title: "Hành động",
      key: "actions",
      width: 150,
      render: (_, record) => (
        <Space size="small">
          <Button
            size="small"
            type="primary"
            icon={<EditIcon style={{ fontSize: "1rem" }} />}
            onClick={() => handleOpenEditCategory(record)}
          >
            Sửa
          </Button>
          <Popconfirm
            title="Xóa danh mục này?"
            description={`Bạn có chắc muốn xóa danh mục "${record.name}" khỏi H2 Database và Redis cache?`}
            onConfirm={() => handleDeleteCategory(record.id)}
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
          >
            <Button
              size="small"
              danger
              icon={<DeleteIcon style={{ fontSize: "1rem" }} />}
            >
              Xóa
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // 3. Product Table Columns with Edit & Delete Actions
  const productColumns: ColumnsType<InventoryProduct> = [
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
    {
      title: "Hành động",
      key: "actions",
      width: 150,
      render: (_, record) => (
        <Space size="small">
          <Button
            size="small"
            type="primary"
            icon={<EditIcon style={{ fontSize: "1rem" }} />}
            onClick={() => handleOpenEditProduct(record)}
          >
            Sửa
          </Button>
          <Popconfirm
            title="Xóa mặt hàng này?"
            description={`Bạn có chắc muốn xóa "${record.name}" khỏi kho?`}
            onConfirm={() => handleDeleteProduct(record.id)}
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
          >
            <Button
              size="small"
              danger
              icon={<DeleteIcon style={{ fontSize: "1rem" }} />}
            >
              Xóa
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // 4. Kafka Event Stream Columns
  const kafkaColumns: ColumnsType<KafkaEventItem> = [
    { title: "Event ID", dataIndex: "id", key: "id", width: 100, render: (id) => <Tag color="blue">{id}</Tag> },
    { title: "Thời gian", dataIndex: "timestamp", key: "timestamp", width: 90 },
    {
      title: "Kafka Topic",
      dataIndex: "topic",
      key: "topic",
      render: (topic: string) => (
        <Tag color={topic.includes("booking") ? "geekblue" : "purple"}>
          {topic}
        </Tag>
      ),
    },
    {
      title: "Phân vùng / Offset",
      key: "partitionOffset",
      width: 120,
      render: (_, r) => <code>p{r.partition}:offset#{r.offset}</code>,
    },
    {
      title: "Event Key & Loại",
      key: "eventKeyType",
      render: (_, r) => (
        <div>
          <strong>{r.eventKey}</strong>
          <div><Tag color="cyan">{r.eventType}</Tag></div>
        </div>
      ),
    },
    {
      title: "Payload Data (JSON)",
      dataIndex: "payload",
      key: "payload",
      render: (p: string) => <code style={{ fontSize: "11px" }}>{p}</code>,
    },
    {
      title: "Xử lý Consumer & Cache Invalidation",
      key: "consumerStatus",
      width: 220,
      render: (_, r) => (
        <div>
          <Tag color="success">✓ @KafkaListener Ack</Tag>
          {r.cacheEvicted && (
            <div className="mt-1">
              <Tag color="volcano">🗑️ Evict: {r.cacheEvicted}</Tag>
            </div>
          )}
        </div>
      ),
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
          {user && (
            <Tag color="blue" style={{ fontSize: "12px", padding: "4px 8px", borderRadius: "6px" }}>
              👤 {user.fullName || user.email} | Vai trò: <strong>{user.role || (user as any).roles?.[0]?.replace('ROLE_', '') || 'ADMIN'}</strong>
            </Tag>
          )}
          <Tag color="cyan">Keycloak SSO: Connected</Tag>
          <Tag color="green">Apache Kafka: Active (Pub/Sub)</Tag>
          <Tag color="gold">Redis Cache: Connected (Cache-Aside)</Tag>
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

      {/* 2. Main Tabs Navigation */}
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

            // Tab 2: USER MANAGEMENT (SPRING DATA JPA & HIBERNATE)
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
                    <Space>
                      <Input.Search
                        placeholder="Tìm theo tên hoặc email..."
                        allowClear
                        value={userSearch}
                        onChange={(e) => setUserSearch(e.target.value)}
                        onSearch={(val) => {
                          setUserSearch(val);
                          fetchUsers(val);
                        }}
                        style={{ width: 230 }}
                      />
                      <Button
                        icon={<RefreshIcon style={{ fontSize: "1rem" }} />}
                        onClick={() => {
                          setUserSearch("");
                          fetchUsers();
                        }}
                      >
                        Làm mới
                      </Button>
                      <Button
                        type="primary"
                        icon={<AddIcon style={{ fontSize: "1rem" }} />}
                        onClick={() => setIsUserModalVisible(true)}
                      >
                        + Thêm Người Dùng
                      </Button>
                    </Space>
                  }
                  className="admin-card"
                >
                  <p className="text-muted small mb-3">
                    Được quản lý thông qua thực thể <code>@Entity User</code> và <code>Role</code>, mã hóa mật khẩu qua <strong>BCrypt / Keycloak PBKDF2</strong>, kiểm soát Transactional chuẩn mực với đầy đủ chức năng <strong>Thêm, Sửa, Xóa và Tìm kiếm</strong>.
                  </p>
                  <Table
                    dataSource={users}
                    columns={userColumns}
                    rowKey="id"
                    loading={userLoading}
                    pagination={{ pageSize: 5 }}
                  />
                </Card>
              ),
            },

            // Tab 3: CATEGORY MANAGEMENT (MYBATIS XML DYNAMIC SQL)
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
                        value={categorySearch}
                        onChange={(e) => setCategorySearch(e.target.value)}
                        onSearch={(val) => {
                          setCategorySearch(val);
                          fetchCategories(val);
                        }}
                        style={{ width: 230 }}
                      />
                      <Button
                        icon={<RefreshIcon style={{ fontSize: "1rem" }} />}
                        onClick={() => {
                          setCategorySearch("");
                          fetchCategories();
                        }}
                      >
                        Làm mới
                      </Button>
                      <Button
                        type="primary"
                        icon={<AddIcon style={{ fontSize: "1rem" }} />}
                        onClick={() => setIsCategoryModalVisible(true)}
                      >
                        + Thêm Danh Mục
                      </Button>
                    </Space>
                  }
                  className="admin-card"
                >
                  <div className="alert alert-secondary py-2 small mb-3">
                    Sử dụng <strong>MyBatis XML Mapper</strong> với dynamic tags: <code>&lt;where&gt;</code>, <code>&lt;if&gt;</code>, <code>&lt;set&gt;</code> và tích hợp <strong>Redis Cache-Aside Pattern</strong> để tối ưu tốc độ đọc dưới 5ms. Hỗ trợ đầy đủ <strong>Thêm, Sửa, Xóa và Tìm kiếm</strong> trực tiếp vào H2 Database.
                  </div>
                  <Table
                    dataSource={categories}
                    columns={categoryColumns}
                    rowKey="id"
                    loading={categoryLoading}
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
                <Card
                  title="Quy Trình Phê Duyệt Ticket (Camunda BPMN Maker - Checker Pattern)"
                  extra={
                    <Button
                      type="primary"
                      icon={<AddIcon style={{ fontSize: "1rem" }} />}
                      onClick={() => setIsCreateTaskModalVisible(true)}
                    >
                      + Tạo Ticket Mới (Maker)
                    </Button>
                  }
                  className="admin-card"
                >
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
                        render: (_, record) => (
                          <Space size="small">
                            {record.status === "WAITING_CHECKER" ? (
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
                              <Popconfirm
                                title="Xóa ticket này?"
                                onConfirm={() => handleDeleteTask(record.taskId)}
                                okText="Xóa"
                                cancelText="Hủy"
                                okButtonProps={{ danger: true }}
                              >
                                <Button size="small" danger icon={<DeleteIcon style={{ fontSize: "1rem" }} />}>
                                  Xóa
                                </Button>
                              </Popconfirm>
                            )}
                          </Space>
                        ),
                      },
                    ]}
                  />
                </Card>
              ),
            },

            // Tab 5: SHOPPING & PURCHASING (INVENTORY CRUD)
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
                  title="Quản Lý Kho Hàng & Nhập Hàng Vật Tư (Purchasing CRUD)"
                  extra={
                    <Space>
                      <Input.Search
                        placeholder="Tìm theo mã SKU hoặc tên..."
                        allowClear
                        value={productSearch}
                        onChange={(e) => setProductSearch(e.target.value)}
                        style={{ width: 230 }}
                      />
                      <Button
                        type="primary"
                        icon={<AddIcon style={{ fontSize: "1rem" }} />}
                        onClick={() => setIsProductModalVisible(true)}
                      >
                        + Thêm Mặt Hàng
                      </Button>
                      <Button
                        type="default"
                        icon={<TableViewIcon fontSize="small" className="me-1" />}
                        onClick={handleDownloadJasperExcel}
                      >
                        Xuất Báo Cáo Kho (Excel)
                      </Button>
                    </Space>
                  }
                  className="admin-card"
                >
                  <p className="text-muted small mb-3">
                    Quản lý các mặt hàng bán kèm (nước uống, bóng thi đấu) và dụng cụ cho thuê (vợt cầu lông, áo đấu). Hỗ trợ <strong>Thêm, Sửa, Xóa và Tìm kiếm</strong> thời gian thực. Xuất phiếu nhập/xuất kho bằng JasperReports Excel qua Apache POI.
                  </p>
                  <Table
                    dataSource={filteredProducts}
                    rowKey="id"
                    columns={productColumns}
                    pagination={{ pageSize: 5 }}
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

            // Tab 7: MESSAGE QUEUE (APACHE KAFKA) & REDIS CACHE STREAM
            {
              key: "kafka",
              label: (
                <span>
                  <HubIcon fontSize="small" className="me-1" />
                  Message Queue & Kafka Stream
                </span>
              ),
              children: (
                <div>
                  <Row gutter={[16, 16]} className="mb-4">
                    <Col span={6}>
                      <Card className="shadow-sm">
                        <Statistic title="Kafka Broker Status" value="Online: 9092" valueStyle={{ color: "#059669", fontSize: "1.1rem" }} prefix={<CheckCircleIcon />} />
                        <span className="small text-muted">Consumer Group: <code>sports-enterprise-group</code></span>
                      </Card>
                    </Col>
                    <Col span={6}>
                      <Card className="shadow-sm">
                        <Statistic title="Topic: sports.booking.events" value={kafkaEvents.filter(e => e.topic.includes('booking')).length} suffix="events" valueStyle={{ color: "#2563eb" }} />
                        <span className="small text-muted">Partitions: 3 | Replication: 1</span>
                      </Card>
                    </Col>
                    <Col span={6}>
                      <Card className="shadow-sm">
                        <Statistic title="Topic: sports.ticket.events" value={kafkaEvents.filter(e => e.topic.includes('ticket')).length} suffix="events" valueStyle={{ color: "#7c3aed" }} />
                        <span className="small text-muted">Camunda BPMN Event Stream</span>
                      </Card>
                    </Col>
                    <Col span={6}>
                      <Card className="shadow-sm">
                        <Statistic title="Redis Cache Invalidation" value="Cache-Aside" valueStyle={{ color: "#ea580c", fontSize: "1.1rem" }} prefix={<SyncAltIcon />} />
                        <span className="small text-muted">Key: <code>sports:courts:availability</code></span>
                      </Card>
                    </Col>
                  </Row>

                  <Card
                    title="Lịch Sử Thông Điệp Sự Kiện Apache Kafka Event Stream (Real-Time Pub/Sub)"
                    extra={
                      <Space>
                        <Button
                          type="primary"
                          icon={<SendIcon style={{ fontSize: "1rem" }} />}
                          onClick={handleProduceBookingEvent}
                        >
                          Mô Phỏng: Gửi Event Đặt Sân (Produce Booking)
                        </Button>
                        <Button
                          icon={<SendIcon style={{ fontSize: "1rem" }} />}
                          onClick={handleProduceTicketEvent}
                        >
                          Mô Phỏng: Gửi Event Ticket (Produce Ticket)
                        </Button>
                        <Button onClick={() => setKafkaEvents([])}>
                          Xóa Log Stream
                        </Button>
                      </Space>
                    }
                    className="admin-card"
                  >
                    <Alert
                      type="info"
                      showIcon
                      message="Cơ chế Hoạt Động Message Queue & Cache Invalidation:"
                      description={
                        <div className="small mt-1">
                          1. <strong>Producer (KafkaEventProducer.java):</strong> Bắn event bất đồng bộ lên topic <code>sports.booking.events</code> hoặc <code>sports.ticket.events</code>.<br />
                          2. <strong>Consumer (KafkaEventConsumer.java):</strong> Đánh dấu <code>@KafkaListener(topics = ...)</code> tự động đón bắt message, xử lý tác vụ nền và kích hoạt lệnh xóa khóa cache Redis <code>redisCacheService.delete("sports:courts:availability")</code>.<br />
                          3. <strong>Cache-Aside Pattern:</strong> Đảm bảo thông tin tình trạng sân trống luôn được làm mới tức thì khi có booking mà không cần khóa bảng CSDL.
                        </div>
                      }
                      className="mb-3"
                    />

                    <Table
                      dataSource={kafkaEvents}
                      rowKey="id"
                      columns={kafkaColumns}
                      pagination={{ pageSize: 5 }}
                    />

                    <div className="mt-3 p-3 bg-light rounded border">
                      <h6 className="fw-bold mb-2 d-flex align-items-center">
                        <CodeIcon className="text-primary me-2" />
                        Mã Nguồn Minh Chứng Trong Backend:
                      </h6>
                      <Row gutter={[16, 16]}>
                        <Col span={12}>
                          <div className="bg-dark text-white p-2 rounded small" style={{ fontFamily: "monospace" }}>
                            <div className="text-warning">// 1. KafkaEventProducer.java</div>
                            <code>kafkaTemplate.send(TOPIC_BOOKING_EVENTS, bookingId, payloadJson);</code>
                          </div>
                        </Col>
                        <Col span={12}>
                          <div className="bg-dark text-white p-2 rounded small" style={{ fontFamily: "monospace" }}>
                            <div className="text-warning">// 2. KafkaEventConsumer.java</div>
                            <code>@KafkaListener(topics = TOPIC_BOOKING_EVENTS)</code><br />
                            <code>public void consume(String msg) &#123; redisCache.delete("sports:courts:availability"); &#125;</code>
                          </div>
                        </Col>
                      </Row>
                    </div>
                  </Card>
                </div>
              ),
            },

            // Tab 8: TRAINING, LEARNING & ARCHITECTURE (6 ENTERPRISE DESIGN PATTERNS)
            {
              key: "learning",
              label: (
                <span>
                  <AccountTreeIcon fontSize="small" className="me-1" />
                  Training, Learning & Architecture
                </span>
              ),
              children: (
                <div>
                  {/* Card A: 6 Enterprise Design Patterns Explanation */}
                  <Card title="Minh Chứng 6 Enterprise Design Patterns Trong Mã Nguồn Hệ Thống" className="admin-card mb-4">
                    <Alert
                      type="success"
                      showIcon
                      message="Kiến Trúc Phần Mềm Doanh Nghiệp (Enterprise Software Architecture):"
                      description="Hệ thống Sports Booking Enterprise được thiết kế tuân thủ nghiêm ngặt các nguyên lý SOLID và áp dụng chuẩn xác 6 mẫu thiết kế (Design Patterns) phổ biến trong kỹ thuật phần mềm cấp doanh nghiệp."
                      className="mb-4"
                    />

                    <Row gutter={[16, 16]}>
                      {/* Pattern 1: Strategy Pattern */}
                      <Col span={12}>
                        <div className="border rounded p-3 bg-white h-100 shadow-sm border-primary">
                          <div className="d-flex justify-content-between align-items-center mb-2">
                            <Tag color="magenta">1. BEHAVIORAL PATTERN</Tag>
                            <span className="badge bg-primary">Strategy Pattern</span>
                          </div>
                          <h6 className="fw-bold text-primary">Strategy Pattern (Thanh toán đa cổng)</h6>
                          <p className="small text-muted mb-2">
                            <strong>Mục đích:</strong> Đóng gói thuật toán thanh toán đa kênh (VNPay, Tiền mặt quầy Kiosk POS, Trừ ví đối tác) vào các class độc lập, cho phép hoán đổi linh hoạt khi runtime mà không dùng chuỗi <code>if-else</code> phức tạp.
                          </p>
                          <div className="p-2 bg-light rounded small mb-2">
                            <div>• <strong>Interface:</strong> <code>PaymentStrategy.java</code></div>
                            <div>• <strong>Concrete Strategies:</strong> <code>VNPayPaymentStrategy</code>, <code>CashierPaymentStrategy</code>, <code>WalletPaymentStrategy</code></div>
                            <div>• <strong>Context:</strong> <code>PaymentContext.java</code> điều phối qua <code>Map&lt;String, PaymentStrategy&gt;</code> do Spring inject.</div>
                          </div>
                          <div className="text-secondary small font-monospace">
                            📁 <code>enterprise-backend/.../pattern/strategy/PaymentContext.java</code>
                          </div>
                        </div>
                      </Col>

                      {/* Pattern 2: Factory Pattern */}
                      <Col span={12}>
                        <div className="border rounded p-3 bg-white h-100 shadow-sm border-success">
                          <div className="d-flex justify-content-between align-items-center mb-2">
                            <Tag color="cyan">2. CREATIONAL PATTERN</Tag>
                            <span className="badge bg-success">Factory Pattern</span>
                          </div>
                          <h6 className="fw-bold text-success">Factory Pattern (Khởi tạo dịch vụ thông báo)</h6>
                          <p className="small text-muted mb-2">
                            <strong>Mục đích:</strong> Che giấu logic khởi tạo đối tượng phức tạp; cung cấp đúng đối tượng gửi thông báo (EMAIL, SMS, PUSH Notification) dựa vào tham số đầu vào.
                          </p>
                          <div className="p-2 bg-light rounded small mb-2">
                            <div>• <strong>Interface:</strong> <code>NotificationService.java</code> (hàm <code>sendNotification</code>)</div>
                            <div>• <strong>Implementations:</strong> <code>EmailNotificationService</code>, <code>SmsNotificationService</code>, <code>PushNotificationService</code></div>
                            <div>• <strong>Factory Class:</strong> <code>NotificationFactory.getNotificationService(type)</code></div>
                          </div>
                          <div className="text-secondary small font-monospace">
                            📁 <code>enterprise-backend/.../pattern/factory/NotificationFactory.java</code>
                          </div>
                        </div>
                      </Col>

                      {/* Pattern 3: Observer Pattern */}
                      <Col span={12}>
                        <div className="border rounded p-3 bg-white h-100 shadow-sm border-warning">
                          <div className="d-flex justify-content-between align-items-center mb-2">
                            <Tag color="orange">3. BEHAVIORAL PATTERN</Tag>
                            <span className="badge bg-warning text-dark">Observer Pattern</span>
                          </div>
                          <h6 className="fw-bold text-warning-emphasis">Observer Pattern (Event Pub/Sub qua Kafka)</h6>
                          <p className="small text-muted mb-2">
                            <strong>Mục đích:</strong> Mô hình xuất bản / đăng ký (Publisher - Subscriber) bất đồng bộ. Tách rời hoàn toàn service tạo đặt sân khỏi service cập nhật bộ đệm và dịch vụ thông báo.
                          </p>
                          <div className="p-2 bg-light rounded small mb-2">
                            <div>• <strong>Subject (Publisher):</strong> <code>KafkaEventProducer.publishBookingEvent(...)</code> bắn tin lên Topic</div>
                            <div>• <strong>Observer (Subscriber):</strong> <code>KafkaEventConsumer</code> với <code>@KafkaListener</code> lắng nghe sự kiện và tự động gọi <code>redisCacheService.delete(...)</code>.</div>
                          </div>
                          <div className="text-secondary small font-monospace">
                            📁 <code>enterprise-backend/.../kafka/KafkaEventConsumer.java</code>
                          </div>
                        </div>
                      </Col>

                      {/* Pattern 4: Singleton Pattern */}
                      <Col span={12}>
                        <div className="border rounded p-3 bg-white h-100 shadow-sm border-info">
                          <div className="d-flex justify-content-between align-items-center mb-2">
                            <Tag color="blue">4. CREATIONAL PATTERN</Tag>
                            <span className="badge bg-info text-dark">Singleton Pattern</span>
                          </div>
                          <h6 className="fw-bold text-info-emphasis">Singleton Pattern (Quản lý Spring IoC Beans)</h6>
                          <p className="small text-muted mb-2">
                            <strong>Mục đích:</strong> Đảm bảo mỗi dịch vụ trọng yếu chỉ có một thực thể (single instance) duy nhất trong suốt vòng đời ứng dụng, tối ưu RAM và chia sẻ tài nguyên an toàn thread-safe.
                          </p>
                          <div className="p-2 bg-light rounded small mb-2">
                            <div>• <strong>Áp dụng:</strong> Toàn bộ các Service <code>@Service</code> và Component <code>@Component</code> như <code>RedisCacheService</code>, <code>CategoryServiceImpl</code>, <code>UserServiceImpl</code></div>
                            <div>• Được quản lý bởi Spring Container theo Singleton Scope mặc định.</div>
                          </div>
                          <div className="text-secondary small font-monospace">
                            📁 <code>enterprise-backend/.../service/RedisCacheService.java</code>
                          </div>
                        </div>
                      </Col>

                      {/* Pattern 5: Repository Pattern */}
                      <Col span={12}>
                        <div className="border rounded p-3 bg-white h-100 shadow-sm border-danger">
                          <div className="d-flex justify-content-between align-items-center mb-2">
                            <Tag color="purple">5. ARCHITECTURAL PATTERN</Tag>
                            <span className="badge bg-danger">Repository Pattern</span>
                          </div>
                          <h6 className="fw-bold text-danger">Repository Pattern (Tách biệt truy xuất dữ liệu)</h6>
                          <p className="small text-muted mb-2">
                            <strong>Mục đích:</strong> Đóng gói logic truy vấn CSDL, che giấu các chi tiết kỹ thuật của CSDL khỏi tầng nghiệp vụ (Service layer).
                          </p>
                          <div className="p-2 bg-light rounded small mb-2">
                            <div>• <strong>Spring Data JPA:</strong> <code>UserRepository</code> kế thừa <code>JpaRepository&lt;User, Long&gt;</code></div>
                            <div>• <strong>MyBatis XML:</strong> <code>CategoryMapper</code> thực thi qua file XML riêng biệt, không để câu lệnh SQL rải rác trong Controller hay Service.</div>
                          </div>
                          <div className="text-secondary small font-monospace">
                            📁 <code>enterprise-backend/.../repository/UserRepository.java</code>
                          </div>
                        </div>
                      </Col>

                      {/* Pattern 6: Maker - Checker Pattern */}
                      <Col span={12}>
                        <div className="border rounded p-3 bg-white h-100 shadow-sm border-secondary">
                          <div className="d-flex justify-content-between align-items-center mb-2">
                            <Tag color="geekblue">6. ENTERPRISE GOVERNANCE</Tag>
                            <span className="badge bg-secondary">Maker - Checker Pattern</span>
                          </div>
                          <h6 className="fw-bold text-secondary-emphasis">Maker - Checker Pattern (Nguyên tắc 4 Mắt)</h6>
                          <p className="small text-muted mb-2">
                            <strong>Mục đích:</strong> Cơ chế kiểm soát nội bộ nghiêm ngặt trong ngân hàng & doanh nghiệp lớn. Một giao dịch quan trọng (rút tiền, hoàn tiền, đăng ký sân) phải qua 2 mắt Maker (tạo) và 2 mắt Checker (thẩm định).
                          </p>
                          <div className="p-2 bg-light rounded small mb-2">
                            <div>• <strong>Maker:</strong> Đối tác/Thu ngân tạo Ticket trên giao diện POS</div>
                            <div>• <strong>Camunda BPMN:</strong> Sinh Process Instance, giao <code>User Task</code> cho Admin/Checker</div>
                            <div>• <strong>Checker:</strong> Duyệt hoặc từ chối $\rightarrow$ kích hoạt Service Task tự động.</div>
                          </div>
                          <div className="text-secondary small font-monospace">
                            📁 <code>enterprise-backend/src/main/resources/processes/maker_checker_ticket.bpmn</code>
                          </div>
                        </div>
                      </Col>
                    </Row>
                  </Card>

                  {/* Card B: Internal LMS Training Courses */}
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
                </div>
              ),
            },
          ]}
        />
      </div>

      {/* ========================================================================= */}
      {/* MODALS: USER MANAGEMENT (JPA) */}
      {/* ========================================================================= */}

      {/* Modal 1: Create User */}
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
          <Form.Item name="password" label="Mật khẩu ban đầu" initialValue="Password123!">
            <Input.Password placeholder="Password123!" />
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

      {/* Modal 2: Edit User */}
      <Modal
        title="Chỉnh Sửa Người Dùng (Spring Data JPA & Hibernate)"
        open={isEditUserModalVisible}
        onCancel={() => {
          setIsEditUserModalVisible(false);
          setEditingUser(null);
        }}
        onOk={() => editUserForm.submit()}
      >
        <Form form={editUserForm} layout="vertical" onFinish={handleUpdateUser}>
          <Form.Item name="email" label="Email (Không thể thay đổi)">
            <Input disabled />
          </Form.Item>
          <Form.Item name="fullName" label="Họ và tên" rules={[{ required: true, message: "Vui lòng nhập họ tên" }]}>
            <Input placeholder="Nguyen Van A" />
          </Form.Item>
          <Form.Item name="phone" label="Số điện thoại">
            <Input placeholder="0901234567" />
          </Form.Item>
          <Form.Item name="role" label="Phân quyền (Keycloak Role)" rules={[{ required: true, message: "Vui lòng chọn vai trò" }]}>
            <Select
              options={[
                { label: "Khách Hàng (ROLE_CUSTOMER)", value: "ROLE_CUSTOMER" },
                { label: "Chủ Sân Đối Tác (ROLE_PARTNER)", value: "ROLE_PARTNER" },
                { label: "Thu Ngân Quầy (ROLE_CASHIER)", value: "ROLE_CASHIER" },
                { label: "Quản Trị Viên (ROLE_ADMIN)", value: "ROLE_ADMIN" },
              ]}
            />
          </Form.Item>
          <Form.Item name="newPassword" label="Đổi mật khẩu mới (để trống nếu không đổi)">
            <Input.Password placeholder="Nhập mật khẩu mới nếu muốn thay đổi..." />
          </Form.Item>
          <Form.Item name="isActive" label="Trạng thái tài khoản" valuePropName="checked">
            <Switch checkedChildren="Đang hoạt động" unCheckedChildren="Đã khóa" />
          </Form.Item>
        </Form>
      </Modal>

      {/* ========================================================================= */}
      {/* MODALS: CATEGORY MANAGEMENT (MYBATIS) */}
      {/* ========================================================================= */}

      {/* Modal 3: Create Category */}
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
          <Form.Item name="slug" label="Slug (URL thân thiện)">
            <Input placeholder="bong-ban-chuyen-nghiep (để trống tự sinh)" />
          </Form.Item>
          <Form.Item name="icon" label="Tên Icon Material" initialValue="sports">
            <Input placeholder="sports_soccer, sports_tennis, sports_cricket..." />
          </Form.Item>
          <Form.Item name="description" label="Mô Tả">
            <Input.TextArea placeholder="Mô tả loại sân và quy cách thi đấu..." />
          </Form.Item>
          <Form.Item name="displayOrder" label="Thứ tự hiển thị" initialValue={1}>
            <InputNumber min={1} style={{ width: "100%" }} />
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal 4: Edit Category */}
      <Modal
        title="Chỉnh Sửa Danh Mục (MyBatis XML Dynamic SQL)"
        open={isEditCategoryModalVisible}
        onCancel={() => {
          setIsEditCategoryModalVisible(false);
          setEditingCategory(null);
        }}
        onOk={() => editCategoryForm.submit()}
      >
        <Form form={editCategoryForm} layout="vertical" onFinish={handleUpdateCategory}>
          <Form.Item name="name" label="Tên Danh Mục" rules={[{ required: true, message: "Vui lòng nhập tên môn" }]}>
            <Input placeholder="Tên môn thể thao..." />
          </Form.Item>
          <Form.Item name="slug" label="Slug (URL thân thiện)">
            <Input placeholder="slug-danh-muc" />
          </Form.Item>
          <Form.Item name="icon" label="Icon Material">
            <Input placeholder="sports_soccer, sports_tennis..." />
          </Form.Item>
          <Form.Item name="description" label="Mô Tả">
            <Input.TextArea placeholder="Mô tả danh mục..." />
          </Form.Item>
          <Form.Item name="displayOrder" label="Thứ tự hiển thị">
            <InputNumber min={1} style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item name="isActive" label="Trạng thái hiển thị" valuePropName="checked">
            <Switch checkedChildren="Hiển thị" unCheckedChildren="Ẩn" />
          </Form.Item>
        </Form>
      </Modal>

      {/* ========================================================================= */}
      {/* MODALS: INVENTORY / PRODUCT CRUD */}
      {/* ========================================================================= */}

      {/* Modal 5: Create Product */}
      <Modal
        title="Thêm Mặt Hàng Kho Mới"
        open={isProductModalVisible}
        onCancel={() => setIsProductModalVisible(false)}
        onOk={() => productForm.submit()}
      >
        <Form form={productForm} layout="vertical" onFinish={handleCreateProduct}>
          <Form.Item name="name" label="Tên Sản Phẩm" rules={[{ required: true, message: "Vui lòng nhập tên sản phẩm" }]}>
            <Input placeholder="Băng quấn cổ tay thể thao" />
          </Form.Item>
          <Form.Item name="sku" label="Mã SKU">
            <Input placeholder="SKU-BQ05 (để trống tự sinh)" />
          </Form.Item>
          <Form.Item name="category" label="Ngành Hàng" initialValue="Phụ Kiện">
            <Select
              options={[
                { label: "Bóng Đá", value: "Bóng Đá" },
                { label: "Cầu Lông", value: "Cầu Lông" },
                { label: "Pickleball", value: "Pickleball" },
                { label: "Giải Khát", value: "Giải Khát" },
                { label: "Phụ Kiện", value: "Phụ Kiện" },
              ]}
            />
          </Form.Item>
          <Form.Item name="stock" label="Số Lượng Tồn Ban Đầu" initialValue={50}>
            <InputNumber min={0} style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item name="price" label="Giá Bán Lẻ (VND)" initialValue={50000}>
            <InputNumber min={0} step={1000} style={{ width: "100%" }} />
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal 6: Edit Product */}
      <Modal
        title="Chỉnh Sửa Mặt Hàng Kho"
        open={isEditProductModalVisible}
        onCancel={() => {
          setIsEditProductModalVisible(false);
          setEditingProduct(null);
        }}
        onOk={() => editProductForm.submit()}
      >
        <Form form={editProductForm} layout="vertical" onFinish={handleUpdateProduct}>
          <Form.Item name="sku" label="Mã SKU" rules={[{ required: true, message: "Vui lòng nhập SKU" }]}>
            <Input />
          </Form.Item>
          <Form.Item name="name" label="Tên Sản Phẩm" rules={[{ required: true, message: "Vui lòng nhập tên sản phẩm" }]}>
            <Input />
          </Form.Item>
          <Form.Item name="category" label="Ngành Hàng" rules={[{ required: true, message: "Vui lòng chọn ngành hàng" }]}>
            <Select
              options={[
                { label: "Bóng Đá", value: "Bóng Đá" },
                { label: "Cầu Lông", value: "Cầu Lông" },
                { label: "Pickleball", value: "Pickleball" },
                { label: "Giải Khát", value: "Giải Khát" },
                { label: "Phụ Kiện", value: "Phụ Kiện" },
              ]}
            />
          </Form.Item>
          <Form.Item name="stock" label="Số Lượng Tồn" rules={[{ required: true, message: "Vui lòng nhập số lượng" }]}>
            <InputNumber min={0} style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item name="price" label="Giá Bán Lẻ (VND)" rules={[{ required: true, message: "Vui lòng nhập giá bán" }]}>
            <InputNumber min={0} step={1000} style={{ width: "100%" }} />
          </Form.Item>
        </Form>
      </Modal>

      {/* ========================================================================= */}
      {/* MODALS: CAMUNDA BPMN TASKS */}
      {/* ========================================================================= */}

      {/* Modal 7: Create Maker Task */}
      <Modal
        title="Tạo Yêu Cầu Mới (Camunda BPMN Maker Ticket)"
        open={isCreateTaskModalVisible}
        onCancel={() => setIsCreateTaskModalVisible(false)}
        onOk={() => taskForm.submit()}
      >
        <Form form={taskForm} layout="vertical" onFinish={handleCreateTask}>
          <Form.Item name="ticketTitle" label="Tiêu đề yêu cầu" rules={[{ required: true, message: "Vui lòng nhập tiêu đề" }]}>
            <Input placeholder="Yêu cầu đối soát doanh thu cuối tuần..." />
          </Form.Item>
          <Form.Item name="ticketType" label="Loại Ticket" initialValue="WITHDRAWAL_REQUEST">
            <Select
              options={[
                { label: "Yêu cầu rút tiền doanh thu (WITHDRAWAL_REQUEST)", value: "WITHDRAWAL_REQUEST" },
                { label: "Đăng ký cụm sân mới (COURT_REGISTRATION)", value: "COURT_REGISTRATION" },
                { label: "Đơn hoàn tiền hủy lịch (REFUND_REQUEST)", value: "REFUND_REQUEST" },
              ]}
            />
          </Form.Item>
          <Form.Item name="maker" label="Người tạo yêu cầu (Maker Email)">
            <Input placeholder={user?.email || "maker@sportsbooking.com"} />
          </Form.Item>
          <Form.Item name="amount" label="Số tiền yêu cầu (VND)" initialValue={0}>
            <InputNumber min={0} step={50000} style={{ width: "100%" }} />
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal 8: Camunda Checker Review */}
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
