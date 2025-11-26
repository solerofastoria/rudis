import { createContext, useState, useEffect, type FC } from "react";
import type { IUser } from "../types/auth";
import { getMe } from "../api/auth";

export interface IAuthContext {
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
      try {
        const res = await getMe();
        console.log("AuthContext: User loaded", res.data.data.user);
        setUser(res.data.data.user);
      } catch (error) {
        // If getMe fails, it means user is not authenticated
        console.log("AuthContext: User not authenticated");
        setUser(null);
      } finally {
        console.log("AuthContext: Loading finished");
        setLoading(false);
      }
    }

    init();
  }, []);

  const setUserWrapper = (newUser: IUser | null) => {
    console.log("AuthContext: Setting user", newUser);
    setUser(newUser);
  };

  return (
    <AuthContext.Provider value={{ user, setUser: setUserWrapper, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
