import { API_URL } from "../../../shared/api/api";
import { jwtDecode } from "jwt-decode";

export const login = async (email: string, password: string) => {
  const res = await fetch(`${API_URL}/api/login/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  })
  if (!res.ok) throw new Error("Login failed")

  const data = await res.json();
  localStorage.setItem("access_token", data.access)
  localStorage.setItem("refresh_token", data.refresh)

  try {
    const decoded: any = jwtDecode(data.access);
    const roles = decoded.roles || [];

    if (roles.length > 0) {
      const initialRole = roles.includes('student') ? 'student' : roles[0];
      localStorage.setItem("active_role", initialRole);
    }
  } catch (e) {
    console.error("Failed to decode token on login", e);
  }
};
