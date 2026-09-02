"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAdminAuth } from "../context/AdminAuthContext";
import UserAvatar from "../components/UserAvatar";
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000/api";

type Tag = {
  id: number;
  name: string;
};

type User = {
  id: number;
  email: string;
  nickname: string;
  avatar_url?: string | null;
};

type Post = {
  id: string;
  is_visible: boolean;
  user: User | null;
  title: string;
  comment: string;
  parent_post: string | null;
  comment_count?: number;
  created_at: string;
  tags: Tag[];
};

export default function AdminPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoadingPosts, setIsLoadingPosts] = useState(false);
  const [postError, setPostError] = useState("");
  const { adminAccessToken, isAdminLoggedIn, adminLogout } = useAdminAuth();
  const router = useRouter();
  const [tags, setTags] = useState<Tag[]>([]);
  const [tagName, setTagName] = useState("");
  const [message, setMessage] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoadingTags, setIsLoadingTags] = useState(false);
  const [isCreatingTag, setIsCreatingTag] = useState(false);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setIsLoadingPosts(true);
        setPostError("");
  
        const response = await fetch(`${API_BASE_URL}/posts/`);
        const data = await response.json().catch(() => []);
  
        if (!response.ok) {
          throw new Error("投稿一覧の取得に失敗しました。");
        }
  
        setPosts(data);
      } catch (error) {
        setPostError(
          error instanceof Error ? error.message : "投稿一覧の取得に失敗しました。",
        );
      } finally {
        setIsLoadingPosts(false);
      }
    };
  
    fetchPosts();
  }, []);


  const handleAuthExpired = useCallback(() => {
    adminLogout();
    router.replace("/admin/login");
  }, [adminLogout, router]);

  useEffect(() => {
    if (!isAdminLoggedIn) {
      router.replace("/admin/login");
    }
  }, [isAdminLoggedIn, router]);

  useEffect(() => {
    const fetchTags = async () => {
      try {
        setIsLoadingTags(true);
        setMessage("");

        const response = await fetch(`${API_BASE_URL}/tags/`);
        const data = await response.json().catch(() => []);

        if (!response.ok) {
          throw new Error("タグ一覧の取得に失敗しました。");
        }

        setTags(data);
      } catch (error) {
        setMessage(
          error instanceof Error
            ? error.message
            : "タグ一覧の取得に失敗しました。",
        );
      } finally {
        setIsLoadingTags(false);
      }
    };

    fetchTags();
  }, []);

  const handleLogout = () => {
    adminLogout();
    router.push("/admin/login");
  };

  const handleOpenModal = () => {
    setTagName("");
    setMessage("");
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    if (isCreatingTag) {
      return;
    }

    setIsModalOpen(false);
    setTagName("");
  };

  const handleCreateTag = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage("");

    const trimmedTagName = tagName.trim();

    if (!trimmedTagName) {
      setMessage("タグ名を入力してください。");
      return;
    }

    if (!adminAccessToken) {
      handleAuthExpired();
      return;
    }

    try {
      setIsCreatingTag(true);

      const response = await fetch(`${API_BASE_URL}/tags/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${adminAccessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: trimmedTagName,
        }),
      });

      const data = await response.json().catch(() => null);

      if (response.status === 401) {
        handleAuthExpired();
        return;
      }

      if (!response.ok) {
        const errorMessage =
          data?.name?.[0] ?? data?.detail ?? "タグの追加に失敗しました。";
        throw new Error(errorMessage);
      }

      setTags((currentTags) => [...currentTags, data]);
      setTagName("");
      setIsModalOpen(false);
      setMessage("タグを追加しました。");
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "タグの追加に失敗しました。",
      );
    } finally {
      setIsCreatingTag(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-8">
      <div className="mx-auto max-w-6xl">
        <header className="flex flex-col gap-4 border-b border-gray-200 pb-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold text-[#ff4500]">
              LifeNect Admin
            </p>
            <h1 className="mt-1 text-3xl font-bold text-gray-900">
              管理者ページ
            </h1>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex min-h-10 items-center justify-center rounded-lg border border-gray-300 px-4 text-sm font-medium text-gray-700 hover:bg-white md:self-auto"
          >
            ログアウト
          </button>
        </header>

        <section className="mt-8 grid gap-4 md:grid-cols-3">
          <div className="rounded-lg border border-gray-200 bg-white p-5">
            <p className="text-sm text-gray-500">投稿管理</p>
            <p className="mt-2 text-2xl font-bold text-gray-900">0件</p>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-5">
            <p className="text-sm text-gray-500">ユーザー管理</p>
            <p className="mt-2 text-2xl font-bold text-gray-900">0人</p>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-5">
            <p className="text-sm text-gray-500">タグ管理</p>
            <p className="mt-2 text-2xl font-bold text-gray-900">
              {tags.length}件
            </p>
          </div>
        </section>



        <section className="mt-8 rounded-lg border border-gray-200 bg-white">
          <div className="flex flex-col gap-4 border-b border-gray-200 p-5 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">タグ管理</h2>
              <p className="mt-1 text-sm text-gray-500">
                投稿に利用するタグを作成できます。
              </p>
            </div>

            <button
              type="button"
              onClick={handleOpenModal}
              className="inline-flex min-h-11 items-center justify-center rounded-lg bg-[#ff4500] px-5 text-sm font-semibold text-white hover:bg-[#e63e00]"
            >
              新規作成
            </button>
          </div>

          {message && (
            <p className="mx-5 mt-5 rounded-lg bg-gray-100 px-4 py-3 text-sm text-gray-700">
              {message}
            </p>
          )}

          <div className="p-5">
            {isLoadingTags ? (
              <p className="text-sm text-gray-500">読み込み中...</p>
            ) : tags.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <span
                    key={tag.id}
                    className="rounded-full bg-orange-50 px-3 py-1 text-sm font-medium text-[#c2410c]"
                  >
                    {tag.name}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">タグはまだありません。</p>
            )}
          </div>
        </section>

        <section className="mt-8 rounded-lg border border-gray-200 bg-white">
  <div className="border-b border-gray-200 p-5">
    <h2 className="text-xl font-bold text-gray-900">投稿管理</h2>
    <p className="mt-1 text-sm text-gray-500">
      投稿と返信内容を確認できます。
    </p>
  </div>

  <div className="grid gap-4 p-5">
    {isLoadingPosts && (
      <p className="text-sm text-gray-500">投稿を読み込み中...</p>
    )}

    {postError && (
      <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
        {postError}
      </p>
    )}

    {posts.map((post) => {
      if (!post.is_visible) {
        return (
          <article
            key={post.id}
            className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-gray-500"
          >
            この投稿は非表示です
          </article>
        );
      }

      return (
        <article
        key={post.id}
        onClick={() => router.push(`/admin/posts/${post.id}`)}
        className="cursor-pointer rounded-lg border border-gray-200 p-4 hover:bg-gray-50"
      >
          <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
            <div>
              <h3 className="font-bold text-gray-900">{post.title}</h3>
              <p className="mt-2 leading-7 text-gray-600">{post.comment}</p>
            </div>
  
            <span className="text-xs text-gray-500">
              {new Date(post.created_at).toLocaleString("ja-JP")}
            </span>
          </div>
  
          <div className="mt-3 flex items-center justify-between gap-3 text-sm text-gray-500">
            <div className="flex min-w-0 items-center gap-2">
              <UserAvatar
                avatarUrl={post.user?.avatar_url}
                name={post.user?.nickname}
                size="sm"
              />
              <span className="truncate">
                {post.user?.nickname ?? "匿名ユーザー"}
              </span>
            </div>
  
            {(post.comment_count ?? 0) > 0 && (
              <span className="shrink-0 text-sm font-bold text-gray-500">
              コメント {post.comment_count ?? 0}件
            </span>
            )}
          </div>
                </article>
      );
    }
    
    )}


            {!isLoadingPosts && posts.length === 0 && (
              <p className="text-sm text-gray-500">投稿はまだありません。</p>
            )}
          </div>
        </section>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <section className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900">タグを追加</h2>
                <p className="mt-1 text-sm text-gray-500">
                  新しいタグ名を入力してください。
                </p>
              </div>

              <button
                type="button"
                onClick={handleCloseModal}
                className="inline-flex size-9 items-center justify-center rounded-lg text-xl leading-none text-gray-500 hover:bg-gray-100"
                aria-label="閉じる"
              >
                ×
              </button>
            </div>

            <form className="mt-6 flex flex-col gap-4" onSubmit={handleCreateTag}>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-gray-700">
                  タグ名
                </label>
                <input
                  type="text"
                  value={tagName}
                  onChange={(event) => setTagName(event.target.value)}
                  className="rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-[#ff4500]"
                  placeholder="例: メンタル"
                  required
                />
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  disabled={isCreatingTag}
                  className="inline-flex min-h-11 items-center justify-center rounded-lg border border-gray-300 px-5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  キャンセル
                </button>
                <button
                  type="submit"
                  disabled={isCreatingTag}
                  className="inline-flex min-h-11 items-center justify-center rounded-lg bg-[#ff4500] px-5 text-sm font-semibold text-white hover:bg-[#e63e00] disabled:cursor-not-allowed disabled:bg-gray-400"
                >
                  {isCreatingTag ? "追加中..." : "追加"}
                </button>
              </div>
            </form>
          </section>

          
        </div>
      )}
    </main>
  );
}
