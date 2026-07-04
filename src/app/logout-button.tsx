"use client";

import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();
  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/");
  }
  return (
    <button className="pill" onClick={logout}>
      log out
    </button>
  );
}
