import { useContext } from "react";
import { AuthProvider } from "@/components/authorizeUser";

const useAuth = () => {
  const { isLoading, isAuthenticated, ...rest } = useContext(AuthProvider);
  return { isLoading, isAuthenticated, ...rest };
};

export default useAuth;
