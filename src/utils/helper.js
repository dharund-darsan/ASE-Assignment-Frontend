import { jwtDecode } from "jwt-decode";


export const isTokenExpired = () => {
  const token = localStorage.getItem("jwtToken");
  if (!isValidJwtFormat(token)) return true;
  if (!token) return true;

  try {
    const { exp } = jwtDecode(token);
    const now = Date.now() / 1000;
    return exp < now;
  } catch (e) {
    console.error("Invalid token:", e);
    return true;
  }
}

function isValidJwtFormat(token) {
  if (typeof token !== "string") return false;

  // JWT should have exactly 3 parts
  const parts = token.split(".");
  if (parts.length !== 3) return false;

  try {
    // Try decoding header & payload
    const header = JSON.parse(atob(parts[0]));
    const payload = JSON.parse(atob(parts[1]));

    // Optional: check required fields exist
    if (!header.alg || !header.typ) return false;
    if (!payload.exp) return false;

    return true;
  } catch (e) {
    return false; // not valid JSON/base64
  }
}

