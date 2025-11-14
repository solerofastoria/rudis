import { createContext, useState, useEffect, type FC } from "react";
import type { IUser } from "../types/auth";
import { getMe } from "../api/auth";

interface IAuthContext {
  user: IUser | null;
  setUser: (u: IUser | null) => void;
  loading: boolean;
}

export const AuthContext = createContext<IAuthContext>({
  user: null,
  setUser: () => {},
  loading: true,
});

export const AuthProvider: FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<IUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function init() {
      const token = localStorage.getItem("token");

      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await getMe();
        setUser(res.data.data.user);
      } catch {
        localStorage.removeItem("token");
      }

      setLoading(false);
    }

    init();
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
