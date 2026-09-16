"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAdminAuth } from "../../../context/AdminAuthContext";
import UserAvatar from "../../../components/UserAvatar";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000/api";

type Post = {
  id: string;
  is_visible: boolean;
  title: string;
  comment: string;
  comment_count?: number;
  created_at: string;
};

type AdminUserDetail = {
  id: number;
  email: string;
  nickname: string;
  role: string;
  provider: string;
  account_status: "active" | "suspended" | "banned";
  is_active: boolean;
  is_staff: boolean;
  is_superuser: boolean;
  avatar_url?: string | null;
  avatar_content_type?: string | null;
  profile_text: string;
  date_joined: string;
  last_login: string | null;
  post_count: number;
  posts: Post[];
};

export default function AdminUserDetailPage() {
  const params = useParams<{ userId: string }>();
  const router = useRouter();
  const { adminAccessToken, adminLogout } = useAdminAuth();

  const [isCheckingAdmin, setIsCheckingAdmin] = useState(true);
  const [isAdminAllowed, setIsAdminAllowed] = useState(false);
  const [user, setUser] = useState<AdminUserDetail | null>(null);
  const [error, setError] = useState("");

  const handleAuthExpired = useCallback(() => {
    adminLogout();
    router.replace("/admin/login");
  }, [adminLogout, router]);

  useEffect(() => {
    const verifyAdmin = async () => {
      if (!adminAccessToken) {
        handleAuthExpired();
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/me/`, {
          headers: {
            Authorization: `Bearer ${adminAccessToken}`,
          },
        });

        const data = await response.json().catch(() => null);

        if (!response.ok) {
          handleAuthExpired();
          return;
        }

        const isAdmin = data?.role === "admin" || data?.is_staff === true;

        if (!isAdmin) {
          handleAuthExpired();
          return;
        }

        setIsAdminAllowed(true);
      } catch {
        handleAuthExpired();
      } finally {
        setIsCheckingAdmin(false);
      }
    };

    verifyAdmin();
  }, [adminAccessToken, handleAuthExpired]);

  useEffect(() => {
    if (!isAdminAllowed || !params.userId || !adminAccessToken) {
      return;
    }

    const fetchUser = async () => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/admin/users/${params.userId}/`,
          {
            headers: {
              Authorization: `Bearer ${adminAccessToken}`,
            },
          },
        );

        const data = await response.json().catch(() => null);

        if (response.status === 401) {
          handleAuthExpired();
          return;
        }

        if (!response.ok) {
          throw new Error(data?.detail ?? "ユーザー詳細の取得に失敗しました。");
        }

        setUser(data);
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "ユーザー詳細の取得に失敗しました。",
        );
      }
    };

    fetchUser();
  }, [isAdminAllowed, params.userId, adminAccessToken, handleAuthExpired]);

  // 管理者確認中・管理者でない場合はレイアウトも表示しない
  if (isCheckingAdmin || !isAdminAllowed) {
    return null;
  }

  if (error) {
    return (
      <main className="min-h-screen bg-gray-50 px-6 py-8">
        <p className="text-sm text-red-600">{error}</p>
      </main>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-8">
      <div className="mx-auto max-w-6xl">
        <button
          type="button"
          onClick={() => router.push("/admin")}
          className="mb-6 rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-white"
        >
          管理者ページへ戻る
        </button>

        <section className="rounded-lg border border-gray-200 bg-white p-5">
          <div className="flex items-start gap-4">
            <UserAvatar
              avatarUrl={user.avatar_url}
              name={user.nickname}
              size="lg"
            />

            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {user.nickname}
              </h1>
              <p className="mt-1 text-sm text-gray-500">{user.email}</p>
              <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-gray-700">
                {user.profile_text || "プロフィール未設定"}
              </p>
            </div>
          </div>

          <dl className="mt-6 grid gap-4 text-sm md:grid-cols-2">
            <div>
              <dt className="text-gray-500">アカウント状態</dt>
              <dd className="font-semibold text-gray-900">
                {user.account_status === "active" ? "通常利用" : "凍結中"}
              </dd>
            </div>
            <div>
              <dt className="text-gray-500">登録方法</dt>
              <dd className="font-semibold text-gray-900">{user.provider}</dd>
            </div>
            <div>
              <dt className="text-gray-500">権限</dt>
              <dd className="font-semibold text-gray-900">{user.role}</dd>
            </div>
            <div>
              <dt className="text-gray-500">投稿数</dt>
              <dd className="font-semibold text-gray-900">{user.post_count}件</dd>
            </div>
            <div>
              <dt className="text-gray-500">登録日時</dt>
              <dd className="font-semibold text-gray-900">
                {new Date(user.date_joined).toLocaleString("ja-JP")}
              </dd>
            </div>
            <div>
              <dt className="text-gray-500">最終ログイン</dt>
              <dd className="font-semibold text-gray-900">
                {user.last_login
                  ? new Date(user.last_login).toLocaleString("ja-JP")
                  : "なし"}
              </dd>
            </div>
          </dl>
        </section>

        <section className="mt-8 rounded-lg border border-gray-200 bg-white">
          <div className="border-b border-gray-200 p-5">
            <h2 className="text-xl font-bold text-gray-900">作成した投稿</h2>
          </div>

          <div className="grid gap-4 p-5">
            {user.posts.map((post) => (
              <article
                key={post.id}
                onClick={() => router.push(`/admin/posts/${post.id}`)}
                className="cursor-pointer rounded-lg border border-gray-200 p-4 hover:bg-gray-50"
              >
                <h3 className="font-bold text-gray-900">{post.title}</h3>
                <p className="mt-2 text-sm leading-6 text-gray-600">
                  {post.comment}
                </p>
                <p className="mt-3 text-xs text-gray-400">
                  {new Date(post.created_at).toLocaleString("ja-JP")}
                </p>
              </article>
            ))}

            {user.posts.length === 0 && (
              <p className="text-sm text-gray-500">投稿はまだありません。</p>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}