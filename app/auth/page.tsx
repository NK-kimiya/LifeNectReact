"use client";
import { CredentialResponse, GoogleLogin } from "@react-oauth/google";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000/api";

export default function AuthPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [nickname, setNickname] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isLogin = authMode === "login";

  const switchAuthMode = (mode: "login" | "signup") => {
    setAuthMode(mode);
    setMessage("");
    setPasswordConfirm("");
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage("");

    if (!isLogin && password !== passwordConfirm) {
      setMessage("パスワードが一致しません。");
      return;
    }

    try {
      setIsSubmitting(true);

      const endpoint = isLogin
        ? `${API_BASE_URL}/auth/login/`
        : `${API_BASE_URL}/auth/register/`;

      const requestBody = isLogin
        ? {
            email,
            password,
          }
        : {
            email,
            nickname,
            password,
          };

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        if (!isLogin && response.status === 403) {
          throw new Error(
            data?.detail ?? "このメールアドレスはまだ承認されていません。",
          );
        }

        if (response.status === 400) {
          throw new Error(
            isLogin
              ? "メールアドレスまたはパスワードを確認してください。"
              : "入力内容に誤りがあります。確認してください。",
          );
        }

        throw new Error(
          data?.detail ?? "認証に失敗しました。入力内容を確認してください。",
        );
      }
      if (!data?.access || !data?.refresh) {
        throw new Error("認証トークンを取得できませんでした。");
      }

      login(data.access, data.refresh);

      if (isLogin) {
        router.push("/posts");
      } else {
        setMessage("アカウントを作成しました。");
      }

      setMessage("アカウントを作成しました。");
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : isLogin
            ? "ログインに失敗しました。"
            : "アカウント作成に失敗しました。",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSuccess = async (
    credentialResponse: CredentialResponse,
  ) => {
    setMessage("");

    if (!credentialResponse.credential) {
      setMessage("Google認証情報を取得できませんでした。");
      return;
    }

    try {
      setIsSubmitting(true);

      const response = await fetch(`${API_BASE_URL}/auth/google/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          credential: credentialResponse.credential,
        }),
      });

      if (!response.ok) {
        throw new Error("Google認証に失敗しました");
      }

      const data = await response.json();

      login(data.access, data.refresh);

      setMessage("Googleアカウントでログインしました。");
      router.push("/posts");
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Google認証に失敗しました",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="relative min-h-screen bg-white py-6">
      <Link
        href="/admin/login"
        className="absolute right-6 top-6 text-sm font-medium text-gray-500 hover:text-gray-900"
      >
        管理者はこちら
      </Link>
      <h1 className="text-center text-5xl">LifeNect</h1>
      <div className="mx-auto w-80 mx-auto">
        <section className="flex items-center justify-center md:col-span-6">
          <div className="w-80 mx-auto max-w-md">
            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900">
                {isLogin ? "ログイン" : "サインアップ"}
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                {isLogin
                  ? "メールアドレスとパスワードを入力してください。"
                  : "アカウント情報を入力してください。"}
              </p>
            </div>

            <div className="mb-6 grid grid-cols-2 rounded-lg bg-gray-100 p-1">
              <button
                type="button"
                onClick={() => switchAuthMode("login")}
                aria-pressed={isLogin}
                className={`rounded-md px-4 py-2 text-sm font-medium ${
                  isLogin
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-500 hover:text-gray-900"
                }`}
              >
                ログイン
              </button>

              <button
                type="button"
                onClick={() => switchAuthMode("signup")}
                aria-pressed={!isLogin}
                className={`rounded-md px-4 py-2 text-sm font-medium ${
                  !isLogin
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-500 hover:text-gray-900"
                }`}
              >
                サインアップ
              </button>
            </div>

            <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
              {!isLogin && (
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-gray-700">
                    ニックネーム
                  </label>
                  <input
                    type="text"
                    value={nickname}
                    onChange={(event) => setNickname(event.target.value)}
                    className="rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-[#ff4500]"
                    placeholder="山田 太郎"
                    required={!isLogin}
                  />
                </div>
              )}

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-gray-700">
                  メールアドレス
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-[#ff4500] w-80"
                  placeholder="example@example.com"
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
                  className="rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-[#ff4500] w-80"
                  placeholder="パスワード"
                  required
                />
              </div>

              {isLogin && (
                <Link
                  href="/auth/forgot-password"
                  className="text-sm text-gray-600 hover:text-gray-900"
                >
                  パスワードを忘れた方
                </Link>
              )}

              {!isLogin && (
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-gray-700">
                    パスワード確認
                  </label>
                  <input
                    type="password"
                    value={passwordConfirm}
                    onChange={(event) => setPasswordConfirm(event.target.value)}
                    className="rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-[#ff4500]"
                    placeholder="もう一度入力してください"
                    required={!isLogin}
                  />
                </div>
              )}

              {message && (
                <p className="rounded-lg bg-gray-100 px-4 py-3 text-sm text-gray-700">
                  {message}
                </p>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="mt-2 rounded-lg bg-[#ff4500] px-4 py-3 font-semibold text-white hover:bg-[#e63e00] disabled:cursor-not-allowed disabled:bg-gray-400 w-80"
              >
                {isSubmitting
                  ? "送信中..."
                  : isLogin
                    ? "ログイン"
                    : "アカウント作成"}
              </button>

              <div className="flex items-center gap-4 py-2">
                <div className="h-px flex-1 bg-gray-200" />
                <span className="text-sm text-gray-500">または</span>
                <div className="h-px flex-1 bg-gray-200" />
              </div>

              <div className="flex justify-center">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={() => {
                    setMessage("Google認証に失敗しました");
                  }}
                  text={isLogin ? "signin_with" : "signup_with"}
                  shape="rectangular"
                  size="large"
                  width="320"
                />
              </div>
            </form>
          </div>
        </section>
      </div>
    </main>
  );
}
