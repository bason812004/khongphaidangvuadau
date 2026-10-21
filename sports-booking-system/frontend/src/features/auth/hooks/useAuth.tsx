import { createContext, useContext, useMemo, useState, type PropsWithChildren } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { TOKEN_KEY, USER_KEY } from "../../../lib/constants";
import type { Role, User } from "../../../types/api";
import { authApi } from "../api/authApi";

type AuthContextValue = {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  hasRole: (roles: Role[]) => boolean;
  setSession: (user: User, token: string) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function readUser() {
  const raw = localStorage.getItem(USER_KEY);
  return raw ? (JSON.parse(raw) as User) : null;
}

export function AuthProvider({ children }: PropsWithChildren) {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(() => readUser());
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY));

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(user && token),
      hasRole: (roles) => Boolean(user && roles.includes(user.role)),
      setSession: (nextUser, nextToken) => {
        localStorage.setItem(USER_KEY, JSON.stringify(nextUser));
        localStorage.setItem(TOKEN_KEY, nextToken);
        setUser(nextUser);
        setToken(nextToken);
      },
      logout: () => {
        authApi.logout().catch(() => {});
        localStorage.removeItem(USER_KEY);
        localStorage.removeItem(TOKEN_KEY);
        setUser(null);
        setToken(null);
        toast.success("Đã đăng xuất thành công!");
        navigate("/login");
      }
    }),
    [navigate, token, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}
