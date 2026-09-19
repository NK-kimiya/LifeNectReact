"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000/api";

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [message, setMessage] = useState("");
  const [isCompleted, setIsCompleted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage("");

    if (!token) {
      setMessage("再設定リンクが無効です。");
      return;
    }

    if (password !== passwordConfirm) {
      setMessage("パスワードが一致しません。");
      return;
    }

    try {
      setIsSubmitting(true);

      const response = await fetch(`${API_BASE_URL}/auth/password-reset/confirm/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
          password,
          password_confirm: passwordConfirm,
        }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.detail ?? "パスワード再設定に失敗しました。");
      }

      setIsCompleted(true);
      setMessage(data?.detail ?? "パスワードを再設定しました。");
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "パスワード再設定に失敗しました。",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-white p-6">
      <div className="w-full max-w-md">
        <h1 className="text-2xl font-bold text-gray-900">新しいパスワード</h1>

        <form className="mt-6 flex flex-col gap-4" onSubmit={handleSubmit}>
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-[#ff4500]"
            placeholder="新しいパスワード"
            required
            disabled={isCompleted}
          />

          <input
            type="password"
            value={passwordConfirm}
            onChange={(event) => setPasswordConfirm(event.target.value)}
            className="rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-[#ff4500]"
            placeholder="新しいパスワード確認"
            required
            disabled={isCompleted}
          />

          {message && (
            <p className="rounded-lg bg-gray-100 px-4 py-3 text-sm text-gray-700">
              {message}
            </p>
          )}

          {!isCompleted && (
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-lg bg-[#ff4500] px-4 py-3 font-semibold text-white hover:bg-[#e63e00] disabled:bg-gray-400"
            >
              {isSubmitting ? "更新中..." : "パスワードを再設定"}
            </button>
          )}
        </form>

        {isCompleted && (
          <Link href="/auth" className="mt-4 inline-block text-sm text-gray-600">
            ログイン画面へ
          </Link>
        )}
      </div>
    </main>
  );
}