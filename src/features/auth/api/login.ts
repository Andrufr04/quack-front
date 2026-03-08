import { API_URL } from "../../../shared/api/api";

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
};
