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
    console.log("Инициализация AuthContext");
    async function init() {
      try {
        console.log("Получение данных пользователя");
        const res = await getMe();
        console.log("Данные пользователя получены:", res.data.data.user);
        setUser(res.data.data.user);
      } catch (error) {
        // If getMe fails, it means user is not authenticated
        // setUser is already null by default, so no need to set it
        console.log("User not authenticated");
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
