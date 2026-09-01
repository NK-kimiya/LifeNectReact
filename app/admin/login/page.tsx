"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAdminAuth } from "../../context/AdminAuthContext";
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000/api";

export default function AdminLoginPage() {
  const { adminLogin } = useAdminAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage("");

    try {
      setIsSubmitting(true);

      const response = await fetch(`${API_BASE_URL}/auth/admin/login/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.detail ?? "管理者ログインに失敗しました。");
      }

      if (!data?.access) {
        throw new Error("管理者トークンを取得できませんでした。");
      }

      adminLogin(data.access, data.refresh);

      router.push("/admin");
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "管理者ログインに失敗しました。",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-10">
      <div className="mx-auto flex min-h-[calc(100vh-80px)] max-w-md items-center">
        <section className="w-full rounded-lg border border-gray-200 bg-white p-8 shadow-sm">
          <p className="text-sm font-semibold text-[#ff4500]">LifeNect Admin</p>
          <h1 className="mt-2 text-2xl font-bold text-gray-900">
            管理者ログイン
          </h1>

          <form className="mt-8 flex flex-col gap-4" onSubmit={handleSubmit}>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-700">
                メールアドレス
              </label>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-[#ff4500]"
                placeholder="admin@example.com"
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-700">
                パスワード
              </label>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-[#ff4500]"
                placeholder="パスワード"
                required
              />
            </div>

            {message && (
              <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
                {message}
              </p>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-2 rounded-lg bg-[#ff4500] px-4 py-3 font-semibold text-white hover:bg-[#e63e00] disabled:cursor-not-allowed disabled:bg-gray-400"
            >
              {isSubmitting ? "ログイン中..." : "管理者ログイン"}
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}
