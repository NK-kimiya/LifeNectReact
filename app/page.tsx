// app/page.tsx

"use client";

import Link from "next/link";
import { useState } from "react";

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

      const response = await fetch(
        `${API_BASE_URL}/auth/applications/send-code/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            nickname,
            email,
            condition,
          }),
        },
      );

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          data?.detail ??
            "認証コードの送信に失敗しました。 入力内容が正しくない可能性や、既に申請されているメールアドレスの可能性があります。",
        );
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

      const response = await fetch(
        `${API_BASE_URL}/auth/applications/verify-code/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            code: verificationCode,
          }),
        },
      );

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
          : "認証コードの確認に失敗しました、正しいコードを入力してください。",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="py-6">
      <h1 className="text-center text-5xl">LifeNect</h1>
      <div className="w-80 mx-auto">
        <p>
          サービスの利用にはアカウントが必要です。注意事項に同意の上、アカウント申請してください。申請の承諾後、入力したメールアドレスでアカウントの作成やGoogleアカウントでのログインが可能になります。申請の承諾はメールで通知されます。
        </p>
        <div className="h-64 overflow-y-auto border border-gray-300 rounded my-4">
          <h3>1.基本的な利用ルール</h3>
          <ul>
            <li>
              本サービスを利用する際は、利用規約および運営方針に同意するものとします。
            </li>
            <li>
              利用者は、他の利用者を尊重し、良識とマナーを守って利用してください。
            </li>
            <li>
              他の利用者に対する迷惑行為や不快感を与える行為は禁止します。
            </li>
            <li>
              サービスの利用にあたっては、関連する法令および公序良俗を遵守してください。
            </li>
            <li>運営者が定めるルールやガイドラインに従ってください。</li>
            <li>
              運営者は、必要に応じて利用規約やサービス内容を変更する場合があります。
            </li>
          </ul>
        </div>
      </div>

      {step === "input" && (
        <form
          onSubmit={handleSendCode}
          className="flex flex-col gap-4 w-80 mx-auto"
        >
          <input
            type="text"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="ニックネーム"
            required
            className="border border-gray-300 rounded px-3 py-2"
          />

          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="メールアドレス"
            className="border border-gray-300 rounded px-3 py-2"
            required
          />

          <textarea
            value={condition}
            onChange={(e) => setCondition(e.target.value)}
            placeholder="疾患や障がいなど"
            required
            className="border border-gray-300 rounded px-3 py-2"
          />

          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-custom-black text-white rounded px-3 py-2"
          >
            {isSubmitting ? "送信中..." : "認証コードを送信"}
          </button>
        </form>
      )}

      {step === "verify" && (
        <form
          onSubmit={handleVerifyCode}
          className="flex flex-col w-80 mx-auto "
        >
          <p>{email} に送信した認証コードを入力してください。</p>

          <input
            type="text"
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value)}
            placeholder="6桁の認証コード"
            maxLength={6}
            required
            className="border border-gray-300 rounded px-3 py-2"
          />

          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-custom-black text-white rounded px-3 py-2 mt-2"
          >
            {isSubmitting ? "確認中..." : "申請を完了する"}
          </button>

          <button
            type="button"
            onClick={() => setStep("input")}
            disabled={isSubmitting}
            className="bg-gray-300 text-gray-700 rounded px-3 py-2 mt-2"
          >
            入力内容を修正する
          </button>
        </form>
      )}

      {step === "done" && (
        <div className="w-80 mx-auto ">
          <h2 className="text-center ">申請完了</h2>
          <p>管理者の承認後にアカウント作成できるようになります。</p>
        </div>
      )}
      <p className="mt-4 text-center text-blue-600 hover:underline">
        <Link href="/auth">承認済みの方はこちら</Link>
      </p>

      {message && (
        <div className="mt-4 w-80 mx-auto">
          <p className="text-red-600 text-center">{message}</p>
        </div>
      )}
    </main>
  );
}
