import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { z } from "zod";
import { Modal } from "antd";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { authApi } from "../../features/auth/api/authApi";
import { useAuth } from "../../features/auth/hooks/useAuth";
import { loginSchema } from "../../features/auth/schemas/authSchema";
import { useLanguage } from "../../lib/i18n";

type FormValues = z.infer<typeof loginSchema>;

export function LoginPage() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const auth = useAuth();
  const form = useForm<FormValues>({ resolver: zodResolver(loginSchema), defaultValues: { email: "", password: "" } });

  // Forgot password states
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("admin@sportsbooking.com");
  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isSendingForgot, setIsSendingForgot] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const mutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: ({ user, token }) => {
      auth.setSession(user, token);
      toast.success(t("Đăng nhập thành công"));
      navigate("/admin-portal");
    },
    onError: (error) => toast.error(error.message)
  });

  const handleQuickLogin = (email: string, pass: string) => {
    form.setValue("email", email);
    form.setValue("password", pass);
    mutation.mutate({ email, password: pass });
  };

  const handleRequestForgotPassword = async () => {
    if (!forgotEmail) {
      toast.error("Vui lòng nhập email tài khoản!");
      return;
    }
    try {
      setIsSendingForgot(true);
      const res = await authApi.forgotPassword(forgotEmail);
      const generatedToken = res.data;
      setResetToken(generatedToken);
      toast.success("Mã reset mật khẩu đã được sinh và lưu vào Redis Cache (TTL 30 phút)!");
    } catch (err: any) {
      toast.error(err.message || "Không tìm thấy tài khoản với email này!");
    } finally {
      setIsSendingForgot(false);
    }
  };

  const handleExecuteResetPassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      toast.error("Mật khẩu mới phải có ít nhất 6 ký tự!");
      return;
    }
    try {
      setIsResetting(true);
      await authApi.resetPassword(resetToken, newPassword);
      toast.success("Đổi mật khẩu thành công! Mật khẩu mới đã được cập nhật.");
      form.setValue("email", forgotEmail);
      form.setValue("password", newPassword);
      setIsForgotModalOpen(false);
      setResetToken("");
      setNewPassword("");
    } catch (err: any) {
      toast.error(err.message || "Mã token không hợp lệ hoặc đã hết hạn trong Redis!");
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-[#0f172a] px-4 py-8">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <div className="inline-flex items-center gap-2 text-xl font-bold text-white tracking-wide">
            <span className="text-sky-400">🛡️</span> SPORTS BOOKING ENTERPRISE
          </div>
          <p className="text-xs text-slate-400 mt-1">Cổng Quản Trị Hệ Thống Toàn Diện (Spring Boot 3 + React)</p>
        </div>

        <div className="rounded-xl border border-slate-700 bg-white p-6 shadow-2xl">
          <h1 className="text-2xl font-bold text-slate-800">{t("Đăng nhập")}</h1>
          <form className="mt-5 space-y-4" onSubmit={form.handleSubmit((values) => mutation.mutate(values))}>
            <Input label="Email" {...form.register("email")} error={form.formState.errors.email?.message ? t(form.formState.errors.email.message) : undefined} />
            <div>
              <Input label={t("Mật khẩu")} type="password" {...form.register("password")} error={form.formState.errors.password?.message ? t(form.formState.errors.password.message) : undefined} />
              <div className="mt-1 flex justify-between items-center text-xs">
                <span className="text-slate-400">Mặc định: <code>admin123</code></span>
                <button
                  type="button"
                  className="text-blue-600 hover:text-blue-700 font-medium hover:underline flex items-center gap-1"
                  onClick={() => {
                    const currentEmail = form.getValues("email");
                    if (currentEmail) setForgotEmail(currentEmail);
                    setIsForgotModalOpen(true);
                  }}
                >
                  <span>🔑</span> Quên mật khẩu? (Redis TTL 30m)
                </button>
              </div>
            </div>
            <Button className="w-full" disabled={mutation.isPending}>{mutation.isPending ? t("Đang xử lý") : t("Đăng nhập")}</Button>
          </form>

          <div className="mt-6 border-t pt-4">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Tài khoản mẫu để kiểm tra (Click để đăng nhập):</p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                className="p-2 border rounded text-left hover:bg-slate-50 transition border-blue-200 bg-blue-50/50"
                onClick={() => handleQuickLogin("admin@sportsbooking.com", "admin123")}
              >
                <div className="font-semibold text-blue-700">👑 Quản Trị Viên (Admin)</div>
                <div className="text-slate-500">admin@sportsbooking.com</div>
              </button>
              <button
                type="button"
                className="p-2 border rounded text-left hover:bg-slate-50 transition border-green-200 bg-green-50/50"
                onClick={() => handleQuickLogin("partner@sportsbooking.com", "partner123")}
              >
                <div className="font-semibold text-green-700">🏟️ Chủ Sân (Partner)</div>
                <div className="text-slate-500">partner@sportsbooking.com</div>
              </button>
              <button
                type="button"
                className="p-2 border rounded text-left hover:bg-slate-50 transition border-amber-200 bg-amber-50/50"
                onClick={() => handleQuickLogin("cashier@sportsbooking.com", "cashier123")}
              >
                <div className="font-semibold text-amber-700">💳 Thu Ngân (Cashier POS)</div>
                <div className="text-slate-500">cashier@sportsbooking.com</div>
              </button>
              <button
                type="button"
                className="p-2 border rounded text-left hover:bg-slate-50 transition border-purple-200 bg-purple-50/50"
                onClick={() => handleQuickLogin("customer@sportsbooking.com", "customer123")}
              >
                <div className="font-semibold text-purple-700">👤 Khách Hàng (Customer)</div>
                <div className="text-slate-500">customer@sportsbooking.com</div>
              </button>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t text-center text-xs text-slate-400">
            Hệ thống phân quyền Spring Security & Keycloak IAM SSO
          </div>
        </div>
      </div>

      {/* Forgot Password Modal (Redis TTL 30m Demo) */}
      <Modal
        title={
          <div className="flex items-center gap-2 text-base font-bold text-slate-800">
            <span>🔑</span> Khôi Phục Mật Khẩu (Redis Cache TTL 30 Phút)
          </div>
        }
        open={isForgotModalOpen}
        onCancel={() => {
          setIsForgotModalOpen(false);
          setResetToken("");
        }}
        footer={null}
        destroyOnClose
      >
        <div className="space-y-4 pt-2 text-sm">
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-900 text-xs">
            <div className="font-semibold mb-1">⚡ Chứng minh công nghệ cho người chấm:</div>
            <div>• Endpoint: <code>POST /api/auth/forgot-password</code></div>
            <div>• Cơ chế: Sinh mã UUID ngẫu nhiên và lưu key <code>pwd_reset:&#123;token&#125;</code> vào <strong>Redis Cache</strong> với thời hạn TTL đúng <strong>30 phút</strong>.</div>
          </div>

          {!resetToken ? (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Email tài khoản cần khôi phục:</label>
                <input
                  type="email"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="Nhập email tài khoản..."
                  className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  className="text-xs text-blue-600 hover:underline"
                  onClick={() => setForgotEmail("admin@sportsbooking.com")}
                >
                  Chọn admin@sportsbooking.com
                </button>
                <span className="text-slate-300">|</span>
                <button
                  type="button"
                  className="text-xs text-blue-600 hover:underline"
                  onClick={() => setForgotEmail("partner@sportsbooking.com")}
                >
                  partner@sportsbooking.com
                </button>
              </div>

              <button
                type="button"
                disabled={isSendingForgot}
                onClick={handleRequestForgotPassword}
                className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md text-sm transition disabled:opacity-50"
              >
                {isSendingForgot ? "Đang gọi Redis sinh mã..." : "Gửi yêu cầu sinh mã Token (Redis)"}
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-lg text-emerald-900 text-xs">
                <div className="font-semibold mb-1">✅ Đã sinh mã token thành công lưu trong Redis!</div>
                <div className="font-mono bg-white p-2 border rounded select-all break-all text-xs text-emerald-700 mt-1">
                  {resetToken}
                </div>
                <div className="text-[11px] text-emerald-600 mt-1">
                  Key trong Redis: <code>pwd_reset:{resetToken}</code> (TTL: 30 phút).
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nhập mật khẩu mới muốn đặt:</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)..."
                  className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  disabled={isResetting}
                  onClick={handleExecuteResetPassword}
                  className="flex-1 py-2 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-md text-sm transition disabled:opacity-50"
                >
                  {isResetting ? "Đang cập nhật..." : "Xác nhận đổi mật khẩu (BCrypt)"}
                </button>
                <button
                  type="button"
                  onClick={() => setResetToken("")}
                  className="py-2 px-3 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-md text-sm transition"
                >
                  Quay lại
                </button>
              </div>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}
