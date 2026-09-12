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
  //画面ステップ用
  const [step, setStep] = useState<"input" | "verify" | "done">("input");
  //認証コード用 state を追加
  const [verificationCode, setVerificationCode] = useState("");

  const handleSendCode = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage("");
  
    try {
      setIsSubmitting(true);
  
      const response = await fetch(`${API_BASE_URL}/auth/applications/send-code/`, {
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
        throw new Error(data?.detail ?? "認証コードの送信に失敗しました。");
      }
  
      setStep("verify");
      setMessage("認証コードをメールで送信しました。");
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "認証コードの送信に失敗しました。",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyCode = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage("");
  
    try {
      setIsSubmitting(true);
  
      const response = await fetch(`${API_BASE_URL}/auth/applications/verify-code/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          code: verificationCode,
        }),
      });
  
      const data = await response.json().catch(() => null);
  
      if (!response.ok) {
        throw new Error(data?.detail ?? "認証コードの確認に失敗しました。");
      }
  
      setStep("done");
      setMessage("メール認証が完了し、申請を受け付けました。");
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "認証コードの確認に失敗しました。",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main>
      <h1>アカウント作成申請</h1>

      {step === "input" && (
      <form onSubmit={handleSendCode}>
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

        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "送信中..." : "認証コードを送信"}
        </button>
      </form>
    )}

    {step === "verify" && (
      <form onSubmit={handleVerifyCode}>
        <p>{email} に送信した認証コードを入力してください。</p>

        <input
          type="text"
          value={verificationCode}
          onChange={(e) => setVerificationCode(e.target.value)}
          placeholder="6桁の認証コード"
          maxLength={6}
          required
        />

        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "確認中..." : "申請を完了する"}
        </button>

        <button
          type="button"
          onClick={() => setStep("input")}
          disabled={isSubmitting}
        >
          入力内容を修正する
        </button>
      </form>
    )}

    {step === "done" && (
      <div>
        <h2>申請を受け付けました</h2>
        <p>管理者の承認後にアカウント作成できるようになります。</p>
      </div>
    )}

      <Link href="/auth">承認済みの方はこちら</Link>
    </main>
  );
}