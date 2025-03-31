import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

export const verifyAuth = async (token) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded;
  } catch (error) {
    return null;
  }
};

export const getServerSession = async () => {
  const cookieStore = await cookies();
  const token = cookieStore.get("token");

  if (!token) {
    return null;
  }

  const decoded = await verifyAuth(token.value);
  return decoded;
};

export const setAuthCookie = async (token) => {
  await cookies().set("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60, // 7 days
    path: "/",
  });
};

export const removeAuthCookie = async () => {
  await cookies().delete("token");
};
