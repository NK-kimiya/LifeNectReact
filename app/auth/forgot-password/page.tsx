"use client";

import Link from "next/link";
import { useState } from "react";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000/api";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage("");

    try {
      setIsSubmitting(true);

      const response = await fetch(`${API_BASE_URL}/auth/password-reset/request/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.detail ?? "送信に失敗しました。");
      }

      setMessage(
        data?.detail ?? "登録されている場合は、パスワード再設定メールを送信しました。",
      );
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "送信に失敗しました。");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-white p-6">
      <div className="w-full max-w-md">
        <h1 className="text-2xl font-bold text-gray-900">パスワード再設定</h1>
        <p className="mt-2 text-sm text-gray-600">
          登録済みのメールアドレスを入力してください。
        </p>

        <form className="mt-6 flex flex-col gap-4" onSubmit={handleSubmit}>
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-[#ff4500]"
            placeholder="example@example.com"
            required
          />

          {message && (
            <p className="rounded-lg bg-gray-100 px-4 py-3 text-sm text-gray-700">
              {message}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-lg bg-[#ff4500] px-4 py-3 font-semibold text-white hover:bg-[#e63e00] disabled:bg-gray-400"
          >
            {isSubmitting ? "送信中..." : "再設定メールを送信"}
          </button>
        </form>

        <Link href="/auth" className="mt-4 inline-block text-sm text-gray-600">
          ログイン画面に戻る
        </Link>
      </div>
    </main>
  );
}