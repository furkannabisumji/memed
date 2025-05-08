// auth.ts
import { useState, useEffect } from "react";

// Custom hook to get the access token
export const useAuthToken = (): string | null => {
  const [accessToken, setAccessToken] = useState<string | null>(null);

  useEffect(() => {
    // You may want to fetch this token from localStorage or a global state/context
    const token = localStorage.getItem("accessToken"); // Assuming the token is stored in localStorage
    setAccessToken(token);
  }, []);

  return accessToken;
};
