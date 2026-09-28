import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";
import { z } from "zod";
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
  const mutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: ({ user, token }) => {
      auth.setSession(user, token);
      toast.success(t("Đăng nhập thành công"));
      navigate(user.role === "ADMIN" ? "/admin/portal" : user.role === "PARTNER" ? "/partner/dashboard" : "/courts");
    },
    onError: (error) => toast.error(error.message)
  });

  const handleQuickLogin = (email: string, pass: string) => {
    form.setValue("email", email);
    form.setValue("password", pass);
    mutation.mutate({ email, password: pass });
  };

  return (
    <div className="mx-auto max-w-md rounded-md border border-line bg-white p-6 shadow-sm">
      <h1 className="text-2xl font-semibold">{t("Đăng nhập")}</h1>
      <form className="mt-5 space-y-4" onSubmit={form.handleSubmit((values) => mutation.mutate(values))}>
        <Input label="Email" {...form.register("email")} error={form.formState.errors.email?.message ? t(form.formState.errors.email.message) : undefined} />
        <Input label={t("Mật khẩu")} type="password" {...form.register("password")} error={form.formState.errors.password?.message ? t(form.formState.errors.password.message) : undefined} />
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

      <p className="mt-4 text-sm text-slate-600">
        {t("Chưa có tài khoản?")} <Link className="font-medium text-action" to="/register">{t("Đăng ký")}</Link>
      </p>
    </div>
  );
}
