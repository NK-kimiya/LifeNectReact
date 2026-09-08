// app/page.tsx

"use client";

import { useState } from "react";
import Link from "next/link";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000/api";

export default function Home() {
  const [nickname, setNickname] = useState("");
  const [email, setEmail] = useState("");
  const [condition, setCondition] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleApplicationSubmit = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();
    setMessage("");

    try {
      setIsSubmitting(true);

      const response = await fetch(`${API_BASE_URL}/auth/applications/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nickname,
          email,
          condition,
        }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.detail ?? "申請に失敗しました。");
      }

      setNickname("");
      setEmail("");
      setCondition("");
      setMessage("申請を送信しました。管理者の承認をお待ちください。");
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "申請に失敗しました。",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main>
      <h1>アカウント作成申請</h1>

      <form onSubmit={handleApplicationSubmit}>
        <input
          type="text"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          placeholder="ニックネーム"
          required
        />

        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="メールアドレス"
          required
        />

        <textarea
          value={condition}
          onChange={(e) => setCondition(e.target.value)}
          placeholder="疾患や障がいなど"
          required
        />

        {message && <p>{message}</p>}

        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "送信中..." : "申請する"}
        </button>
      </form>

      <Link href="/auth">承認済みの方はこちら</Link>
    </main>
  );
}