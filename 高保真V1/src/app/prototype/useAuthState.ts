import { useCallback, useState } from "react";
import type { AuthLoginInput, AuthRegisterInput, AuthStatus, AuthUser } from "../../types";

/**
 * Mock auth until `POST /api/v1/auth/login` and related session APIs exist.
 * Swap the handlers here for real network calls without changing the UI surface.
 */
export function useAuthState() {
  const [status, setStatus] = useState<AuthStatus>("unauthenticated");
  const [user, setUser] = useState<AuthUser | null>(null);

  const login = useCallback((input: AuthLoginInput) => {
    const account = input.account.trim();
    const password = input.password.trim();
    if (!account || !password) {
      throw new Error("请填写账号和密码");
    }
    const next: AuthUser = {
      id: `user-${account}`,
      displayName: input.displayName?.trim() || "测试账号",
      planLabel: "试用版",
      account,
    };
    setUser(next);
    setStatus("authenticated");
    return next;
  }, []);

  const register = useCallback((input: AuthRegisterInput) => {
    const displayName = input.displayName.trim();
    const account = input.account.trim();
    const password = input.password.trim();
    if (!displayName || !account || !password) {
      throw new Error("请完整填写注册信息");
    }
    // Future: POST /api/v1/auth/register. Prototype only acknowledges success.
    return { displayName, account };
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setStatus("unauthenticated");
  }, []);

  return {
    authStatus: status,
    authenticated: status === "authenticated",
    user,
    login,
    register,
    logout,
  } satisfies {
    authStatus: AuthStatus;
    authenticated: boolean;
    user: AuthUser | null;
    login: (input: AuthLoginInput) => AuthUser;
    register: (input: AuthRegisterInput) => { displayName: string; account: string };
    logout: () => void;
  };
}
