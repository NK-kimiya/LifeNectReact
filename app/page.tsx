"use client";
import { useState } from "react";
import { CredentialResponse, GoogleLogin } from "@react-oauth/google";
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000/api";

export default function Home() {
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

    if (isLogin) {
      setMessage("ログイン処理は次のステップで実装します。");
      return;
    }

    if (password !== passwordConfirm) {
      setMessage("パスワードが一致しません。");
      return;
    }

    try {
      setIsSubmitting(true);

      const response = await fetch(`${API_BASE_URL}/auth/register/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          nickname,
          password,
        }),
      });

      if (!response.ok) {
        throw new Error("アカウント作成に失敗しました");
      }

      const data = await response.json();

      localStorage.setItem("accessToken", data.access);
      localStorage.setItem("refreshToken", data.refresh);

      setMessage("アカウントを作成しました。");
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "アカウント作成に失敗しました",
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
  
      localStorage.setItem("accessToken", data.access);
      localStorage.setItem("refreshToken", data.refresh);
  
      setMessage("Googleアカウントでログインしました。");
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Google認証に失敗しました",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-white">
      <div className="mx-auto grid min-h-screen w-full max-w-7xl grid-cols-1 md:grid-cols-10">
        <section className="flex min-h-[40vh] items-center justify-center bg-[#f5f5f5] p-8 md:col-span-4 md:min-h-screen">
          <div className="w-full max-w-md">
            <h1 className="text-3xl font-bold text-gray-900">LifeNect</h1>
            <p className="mt-4 text-gray-600">
              あなたに必要な情報へ、すぐにアクセスできます。
            </p>

            <button
              type="button"
              className="mt-6 inline-flex items-center justify-center rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 hover:border-gray-400 hover:bg-white hover:text-gray-900"
            >
              ログインせずに始める
            </button>
          </div>
        </section>

        <section className="flex min-h-[60vh] items-center justify-center p-8 md:col-span-6 md:min-h-screen">
          <div className="w-full max-w-md">
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
                  className="rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-[#ff4500]"
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
                  className="rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-[#ff4500]"
                  placeholder="パスワード"
                  required
                />
              </div>

              {!isLogin && (
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-gray-700">
                    パスワード確認
                  </label>
                  <input
                    type="password"
                    value={passwordConfirm}
                    onChange={(event) =>
                      setPasswordConfirm(event.target.value)
                    }
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
                className="mt-2 rounded-lg bg-[#ff4500] px-4 py-3 font-semibold text-white hover:bg-[#e63e00] disabled:cursor-not-allowed disabled:bg-gray-400"
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
