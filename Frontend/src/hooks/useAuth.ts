import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import type { IAuthContext } from "../context/AuthContext";

export function useAuth(): IAuthContext {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  
  console.log("useAuth: Returning context", context);
  
  return context;
}
