import { api } from "../../../lib/axios";
import type { ApiResponse, User } from "../../../types/api";

export type LoginPayload = { email: string; password: string };
export type RegisterPayload = LoginPayload & { fullName: string; phone?: string };
export type RegisterPartnerPayload = RegisterPayload & { businessName: string; address: string; verificationDocumentUrl?: string };

export const authApi = {
  async login(payload: LoginPayload) {
    const { data } = await api.post<ApiResponse<{ user: User; token: string }>>("/auth/login", payload);
    return data.data;
  },
  async register(payload: RegisterPayload) {
    const { data } = await api.post<ApiResponse<{ user: User; token: string }>>("/auth/register", payload);
    return data.data;
  },
  async registerPartner(payload: RegisterPartnerPayload) {
    const { data } = await api.post<ApiResponse<{ user: User; token: string }>>("/auth/register-partner", payload);
    return data.data;
  },
  async me() {
    const { data } = await api.get<ApiResponse<User>>("/auth/me");
    return data.data;
  },
  async logout() {
    try {
      await api.post("/auth/logout");
    } catch {
      // Backend may be offline or token expired; ignore errors during logout
    }
  },
  async forgotPassword(email: string) {
    const { data } = await api.post<ApiResponse<string>>("/auth/forgot-password", { email });
    return data;
  },
  async resetPassword(token: string, newPassword: string) {
    const { data } = await api.post<ApiResponse<void>>(`/auth/reset-password?token=${encodeURIComponent(token)}&newPassword=${encodeURIComponent(newPassword)}`);
    return data;
  }
};
